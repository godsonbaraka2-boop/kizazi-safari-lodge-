import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Pi Network Testnet token minting (pi-platform-docs/tokens.md).
 * Fund distributor -> trustline (distributor -> issuer) -> initial mint (issuer -> distributor).
 * Wallet secret keys are stored server-side only and never returned to the browser.
 */

const HORIZON = "https://api.testnet.minepi.com";
const NETWORK_PASSPHRASE = "Pi Testnet";
const ASSET_CODE = "KST"; // Kizazi Safari Token
const TOTAL_SUPPLY = "1000000000"; // 1 Billion
const MIN_NATIVE_BALANCE = 2; // 2 XLM (test-Pi) needed before trustline + mint

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

/** Reads a wallet secret: database-stored value first, then backend env var. */
async function readWalletSecret(name: "PI_ISSUER_SECRET" | "PI_DISTRIBUTOR_SECRET") {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("app_secrets")
      .select("value")
      .eq("name", name)
      .maybeSingle();
    if (data?.value) return data.value;
  } catch (error) {
    console.error("readWalletSecret failed", error instanceof Error ? error.message : error);
  }
  return process.env[name] ?? null;
}

function checkPasscode(passcode: string) {
  const expected = process.env["ADMIN_PASSCODE"];
  return Boolean(expected) && passcode === expected;
}

const secretKeySchema = z
  .string()
  .trim()
  .regex(/^S[A-Z2-7]{55}$/, "Secret key must start with S and be 56 characters.");

/** Stores the two Testnet wallet secret keys on the backend. */
export const saveWalletSecrets = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        passcode: z.string().min(1).max(200),
        issuerSecret: secretKeySchema,
        distributorSecret: secretKeySchema,
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    if (!checkPasscode(data.passcode)) {
      return { ok: false as const, error: "Wrong admin passcode." };
    }

    const StellarBase = await import("@stellar/stellar-base");
    try {
      StellarBase.Keypair.fromSecret(data.issuerSecret);
      StellarBase.Keypair.fromSecret(data.distributorSecret);
    } catch {
      return { ok: false as const, error: "One of the secret keys is not a valid Pi wallet key." };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("app_secrets").upsert(
      [
        { name: "PI_ISSUER_SECRET", value: data.issuerSecret },
        { name: "PI_DISTRIBUTOR_SECRET", value: data.distributorSecret },
      ],
      { onConflict: "name" },
    );
    if (error) {
      console.error("saveWalletSecrets failed", error.message);
      return { ok: false as const, error: "Could not save the keys. Please try again." };
    }
    return { ok: true as const };
  });

/** Tells the admin UI whether both wallet keys are configured (never returns values). */
export const getWalletSecretStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ passcode: z.string().min(1).max(200) }).parse(input))
  .handler(async ({ data }) => {
    if (!checkPasscode(data.passcode)) {
      return { ok: false as const, issuer: false, distributor: false };
    }
    const [issuer, distributor] = await Promise.all([
      readWalletSecret("PI_ISSUER_SECRET"),
      readWalletSecret("PI_DISTRIBUTOR_SECRET"),
    ]);
    return { ok: true as const, issuer: Boolean(issuer), distributor: Boolean(distributor) };
  });

async function nativeBalance(publicKey: string) {
  const account = (await horizonGet(`/accounts/${publicKey}`)) as {
    balances?: Array<{ asset_type?: string; balance?: string }>;
  };
  const native = (account.balances ?? []).find((b) => b.asset_type === "native");
  return Number(native?.balance ?? 0);
}

/** Step 1: make sure the distributor wallet holds at least 2 XLM on Pi Testnet. */
async function fundDistributor(publicKey: string) {
  let balance = 0;
  try {
    balance = await nativeBalance(publicKey);
  } catch {
    balance = 0; // account may not exist yet
  }
  if (balance >= MIN_NATIVE_BALANCE) return { funded: true, balance, viaFaucet: false };

  const res = await fetch(`${HORIZON}/friendbot?addr=${publicKey}`);
  if (!res.ok) {
    throw new Error(
      `Distributor wallet has only ${balance} XLM. Fund it with at least ${MIN_NATIVE_BALANCE} test-Pi (XLM) in the Pi Testnet wallet, then mint again.`,
    );
  }
  const newBalance = await nativeBalance(publicKey);
  if (newBalance < MIN_NATIVE_BALANCE) {
    throw new Error(
      `Funding did not reach ${MIN_NATIVE_BALANCE} XLM (current: ${newBalance}). Top up the distributor wallet and try again.`,
    );
  }
  return { funded: true, balance: newBalance, viaFaucet: true };
}

export const mintKizaziToken = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ passcode: z.string().min(1).max(200) }).parse(input),
  )
  .handler(async ({ data }) => {
    if (!checkPasscode(data.passcode)) {
      return { ok: false as const, error: "Wrong admin passcode." };
    }

    const [issuerSecret, distributorSecret] = await Promise.all([
      readWalletSecret("PI_ISSUER_SECRET"),
      readWalletSecret("PI_DISTRIBUTOR_SECRET"),
    ]);
    if (!issuerSecret || !distributorSecret) {
      return {
        ok: false as const,
        error: "Save both wallet secret keys in the form above before minting.",
      };
    }

    const StellarBase = await import("@stellar/stellar-base");
    const { Keypair, Asset, Account, TransactionBuilder, Operation } = StellarBase;

    try {
      const issuerKeyPair = Keypair.fromSecret(issuerSecret);
      const distributorKeyPair = Keypair.fromSecret(distributorSecret);
      const kizaziAsset = new Asset(ASSET_CODE, issuerKeyPair.publicKey());
      const fee = await fetchBaseFee();

      // STEP 1: Fund the distributor wallet with at least 2 XLM
      const funding = await fundDistributor(distributorKeyPair.publicKey());

      // STEP 2: Trustline from distributor to issuer
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

      // STEP 3: Mint by paying from issuer to distributor
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
        distributorBalance: funding.balance,
        fundedViaFaucet: funding.viaFaucet,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Minting failed";
      console.error("mintKizaziToken failed:", message);
      return { ok: false as const, error: message };
    }
  });
