import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Pi Network Testnet token minting (pi-platform-docs/tokens.md).
 * Trustline (distributor -> issuer) + initial payment (issuer -> distributor).
 * Keys are read from server-only env vars inside the handler and never leave the server.
 */

const HORIZON = "https://api.testnet.minepi.com";
const NETWORK_PASSPHRASE = "Pi Testnet";
const ASSET_CODE = "KST"; // Kizazi Safari Token
const TOTAL_SUPPLY = "1000000000"; // 1 Billion

async function horizonGet(path: string) {
  const res = await fetch(`${HORIZON}${path}`);
  if (!res.ok) throw new Error(`Horizon ${path} failed (${res.status})`);
  return res.json() as Promise<Record<string, unknown>>;
}

async function fetchBaseFee(): Promise<string> {
  try {
    const ledgers = (await horizonGet("/ledgers?order=desc&limit=1")) as {
      _embedded?: { records?: Array<{ base_fee_in_stroops?: number }> };
    };
    const fee = ledgers._embedded?.records?.[0]?.base_fee_in_stroops;
    return String(fee && fee > 0 ? fee : 100);
  } catch {
    return "100";
  }
}

async function submit(xdr: string) {
  const res = await fetch(`${HORIZON}/transactions`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ tx: xdr }).toString(),
  });
  const body = (await res.json()) as { id?: string; extras?: unknown; detail?: string };
  if (!res.ok) {
    console.error("Pi Testnet submit failed", JSON.stringify(body).slice(0, 800));
    throw new Error(body.detail ?? "Transaction rejected by Pi Testnet");
  }
  return body;
}

export const mintKizaziToken = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ passcode: z.string().min(1).max(200) }).parse(input),
  )
  .handler(async ({ data }) => {
    const expected = process.env["ADMIN_PASSCODE"];
    if (!expected || data.passcode !== expected) {
      return { ok: false as const, error: "Wrong admin passcode." };
    }

    const issuerSecret = process.env["PI_ISSUER_SECRET"];
    const distributorSecret = process.env["PI_DISTRIBUTOR_SECRET"];
    if (!issuerSecret || !distributorSecret) {
      return {
        ok: false as const,
        error: "Testnet wallet keys are not configured on the backend yet.",
      };
    }

    const StellarBase = await import("@stellar/stellar-base");
    const { Keypair, Asset, Account, TransactionBuilder, Operation } = StellarBase;

    try {
      const issuerKeyPair = Keypair.fromSecret(issuerSecret);
      const distributorKeyPair = Keypair.fromSecret(distributorSecret);
      const kizaziAsset = new Asset(ASSET_CODE, issuerKeyPair.publicKey());
      const fee = await fetchBaseFee();

      // STEP 1: Trustline from distributor to issuer
      const distRaw = (await horizonGet(`/accounts/${distributorKeyPair.publicKey()}`)) as {
        sequence: string;
        balances?: Array<{ asset_code?: string; asset_issuer?: string }>;
      };
      const hasTrustline = (distRaw.balances ?? []).some(
        (b) => b.asset_code === ASSET_CODE && b.asset_issuer === issuerKeyPair.publicKey(),
      );

      if (!hasTrustline) {
        const distributorAccount = new Account(distributorKeyPair.publicKey(), distRaw.sequence);
        const trustTx = new TransactionBuilder(distributorAccount, {
          fee,
          networkPassphrase: NETWORK_PASSPHRASE,
        })
          .addOperation(Operation.changeTrust({ asset: kizaziAsset, limit: TOTAL_SUPPLY }))
          .setTimeout(30)
          .build();
        trustTx.sign(distributorKeyPair);
        await submit(trustTx.toXDR());
      }

      // STEP 2: Mint by paying from issuer to distributor
      const issuerRaw = (await horizonGet(`/accounts/${issuerKeyPair.publicKey()}`)) as {
        sequence: string;
      };
      const issuerAccount = new Account(issuerKeyPair.publicKey(), issuerRaw.sequence);
      const mintTx = new TransactionBuilder(issuerAccount, {
        fee,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(
          Operation.payment({
            destination: distributorKeyPair.publicKey(),
            asset: kizaziAsset,
            amount: TOTAL_SUPPLY,
          }),
        )
        .setTimeout(30)
        .build();
      mintTx.sign(issuerKeyPair);
      const response = await submit(mintTx.toXDR());

      return {
        ok: true as const,
        txId: response.id ?? "",
        assetCode: ASSET_CODE,
        amount: TOTAL_SUPPLY,
        trustlineCreated: !hasTrustline,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Minting failed";
      console.error("mintKizaziToken failed:", message);
      return { ok: false as const, error: message };
    }
  });
