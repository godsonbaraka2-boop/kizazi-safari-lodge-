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
  const body = (await res.json()) as {
    id?: string;
    detail?: string;
    extras?: { result_codes?: { transaction?: string; operations?: string[] } };
  };
  if (!res.ok) {
    console.error("Pi Testnet submit failed", JSON.stringify(body).slice(0, 800));
    const codes = body.extras?.result_codes;
    const opCodes = codes?.operations?.join(", ");
    if (opCodes?.includes("op_line_full")) {
      throw new Error(
        "The distributor wallet already holds the full 1,000,000,000 KST supply, so no more tokens can be sent to it. Minting is already complete.",
      );
    }
    if (opCodes?.includes("op_underfunded")) {
      throw new Error(
        "The issuer has already issued the full 1,000,000,000 KST supply. Minting is already complete.",
      );
    }
    const detail = [codes?.transaction, opCodes].filter(Boolean).join(" / ");
    throw new Error(detail ? `Pi Testnet rejected the transaction (${detail}).` : body.detail ?? "Transaction rejected by Pi Testnet");
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

/**
 * Pi Testnet wallets are created inside Pi Browser from a 24-word passphrase and
 * never show a raw "S…" secret key. This derives the wallet keypair from that
 * passphrase using the Pi/Stellar SEP-0005 path m/44'/314159'/0'.
 */
async function keypairFromSecretOrPassphrase(input: string) {
  const { Keypair } = await import("@stellar/stellar-base");
  const value = input.trim().replace(/\s+/g, " ");

  if (/^S[A-Z2-7]{55}$/.test(value)) return Keypair.fromSecret(value);

  const words = value.toLowerCase().split(" ");
  if (words.length !== 12 && words.length !== 24) {
    throw new Error(
      "Enter either an S… secret key or your 24-word Pi Testnet wallet passphrase.",
    );
  }
  const bip39 = await import("bip39");
  if (!bip39.validateMnemonic(words.join(" "))) {
    throw new Error("That passphrase is not valid. Check the spelling and word order.");
  }
  const seed = await bip39.mnemonicToSeed(words.join(" "));
  const { derivePath } = await import("ed25519-hd-key");
  const { key } = derivePath("m/44'/314159'/0'", seed.toString("hex"));
  return Keypair.fromRawEd25519Seed(Buffer.from(key));
}

const fundingCredentialSchema = z
  .string()
  .trim()
  .min(1, "Enter your secret key or 24-word passphrase.")
  .max(1000);


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

async function accountInfo(publicKey: string) {
  try {
    const account = (await horizonGet(`/accounts/${publicKey}`)) as {
      balances?: Array<{ asset_type?: string; balance?: string; asset_code?: string; asset_issuer?: string }>;
    };
    const balances = account.balances ?? [];
    const native = balances.find((b) => b.asset_type === "native");
    return { exists: true, balance: Number(native?.balance ?? 0), balances };
  } catch {
    return { exists: false, balance: 0, balances: [] as Array<Record<string, unknown>> };
  }
}

async function nativeBalance(publicKey: string) {
  return (await accountInfo(publicKey)).balance;
}

/**
 * Shows the admin the two wallet addresses plus their Test-Pi balances so the
 * wallets can be funded manually. Pi Testnet has no friendbot/faucet endpoint,
 * so test-Pi must come from the Pi Testnet wallet (wallet.testnet.minepi.com).
 */
export const getWalletFunding = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ passcode: z.string().min(1).max(200) }).parse(input))
  .handler(async ({ data }) => {
    if (!checkPasscode(data.passcode)) {
      return { ok: false as const, error: "Wrong admin passcode." };
    }
    const [issuerSecret, distributorSecret] = await Promise.all([
      readWalletSecret("PI_ISSUER_SECRET"),
      readWalletSecret("PI_DISTRIBUTOR_SECRET"),
    ]);
    if (!issuerSecret || !distributorSecret) {
      return { ok: false as const, error: "Save both wallet secret keys first." };
    }
    const { Keypair } = await import("@stellar/stellar-base");
    let issuerPub: string;
    let distributorPub: string;
    try {
      issuerPub = Keypair.fromSecret(issuerSecret).publicKey();
      distributorPub = Keypair.fromSecret(distributorSecret).publicKey();
    } catch {
      return { ok: false as const, error: "Stored wallet keys are not valid Pi wallet keys." };
    }
    const [issuer, distributor] = await Promise.all([
      accountInfo(issuerPub),
      accountInfo(distributorPub),
    ]);
    const hasTrustline = (distributor.balances as Array<{ asset_code?: string; asset_issuer?: string }>).some(
      (b) => b.asset_code === ASSET_CODE && b.asset_issuer === issuerPub,
    );
    const kst = (distributor.balances as Array<{ asset_code?: string; balance?: string }>).find(
      (b) => b.asset_code === ASSET_CODE,
    );
    return {
      ok: true as const,
      required: MIN_NATIVE_BALANCE,
      issuer: { publicKey: issuerPub, exists: issuer.exists, balance: issuer.balance },
      distributor: {
        publicKey: distributorPub,
        exists: distributor.exists,
        balance: distributor.balance,
      },
      hasTrustline,
      kstBalance: kst?.balance ?? "0",
      ready: issuer.exists && distributor.exists && distributor.balance >= MIN_NATIVE_BALANCE,
    };
  });

/** Step 1: make sure both wallets exist and the distributor holds enough test-Pi. */
async function fundDistributor(distributorPublicKey: string, issuerPublicKey: string) {
  const [issuer, distributor] = await Promise.all([
    accountInfo(issuerPublicKey),
    accountInfo(distributorPublicKey),
  ]);
  if (!issuer.exists || issuer.balance <= 0) {
    throw new Error(
      `STEP 1 - FUND ISSUER: Issuer wallet (${issuerPublicKey}) is not activated on Pi Testnet yet. Send at least 1 test-Pi (XLM) to this address from your Pi Testnet wallet, then mint again.`,
    );
  }
  if (!distributor.exists || distributor.balance <= 0) {
    throw new Error(
      `STEP 2 - FUND DISTRIBUTOR: Distributor wallet (${distributorPublicKey}) has no test-Pi at all, so it does not exist on Pi Testnet yet. Open the Pi Testnet wallet in Pi Browser and send at least ${MIN_NATIVE_BALANCE} test-Pi to this address, then mint again.`,
    );
  }
  if (distributor.balance < MIN_NATIVE_BALANCE) {
    throw new Error(
      `STEP 2 - TOP UP DISTRIBUTOR: Distributor wallet holds only ${distributor.balance} test-Pi. Send at least ${MIN_NATIVE_BALANCE} test-Pi to ${distributorPublicKey}, then mint again. (Pi Testnet has no faucet endpoint, so funding must come from your Pi Testnet wallet.)`,
    );
  }
  return { funded: true, balance: distributor.balance, viaFaucet: false };
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
      const funding = await fundDistributor(
        distributorKeyPair.publicKey(),
        issuerKeyPair.publicKey(),
      );

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

/**
 * Pi Testnet wallets refuse to send test-Pi to an address that does not exist
 * yet ("The recipient's address does not exist."). On Stellar-based networks a
 * brand-new address must be created with a create_account operation, which the
 * wallet UI cannot do. This function does it from a funded wallet: the admin
 * pastes the secret key of their own Pi Testnet wallet (the one holding
 * test-Pi) and we create + fund the issuer and distributor accounts directly.
 */
export const activateWallets = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        passcode: z.string().min(1).max(200),
        fundingSecret: fundingCredentialSchema,
      })
      .parse(input),
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
      return { ok: false as const, error: "Save both wallet secret keys first." };
    }

    const { Keypair, Account, TransactionBuilder, Operation } = await import("@stellar/stellar-base");

    let funder: ReturnType<typeof Keypair.fromSecret>;
    let issuerPub: string;
    let distributorPub: string;
    try {
      funder = await keypairFromSecretOrPassphrase(data.fundingSecret);
      issuerPub = Keypair.fromSecret(issuerSecret).publicKey();
      distributorPub = Keypair.fromSecret(distributorSecret).publicKey();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "One of the secret keys is not a valid Pi wallet key.";
      return { ok: false as const, error: message };
    }


    const ISSUER_SEED = "1.5";
    const DISTRIBUTOR_SEED = String(MIN_NATIVE_BALANCE + 1);
    const needed = Number(ISSUER_SEED) + Number(DISTRIBUTOR_SEED);

    try {
      const funderInfo = await accountInfo(funder.publicKey());
      if (!funderInfo.exists) {
        return {
          ok: false as const,
          error: `Funding wallet ${funder.publicKey()} does not exist on Pi Testnet. Use the secret key of the Pi Testnet wallet that already holds test-Pi.`,
        };
      }
      if (funderInfo.balance < needed + 1) {
        return {
          ok: false as const,
          error: `Funding wallet holds only ${funderInfo.balance} test-Pi. It needs at least ${needed + 1} test-Pi to create and fund both wallets.`,
        };
      }

      const [issuer, distributor] = await Promise.all([
        accountInfo(issuerPub),
        accountInfo(distributorPub),
      ]);

      const ops: Array<{ target: string; amount: string; exists: boolean }> = [
        { target: issuerPub, amount: ISSUER_SEED, exists: issuer.exists },
        { target: distributorPub, amount: DISTRIBUTOR_SEED, exists: distributor.exists },
      ];
      const todo = ops.filter((o) => !o.exists);
      if (todo.length === 0) {
        return {
          ok: true as const,
          created: [] as string[],
          message: "Both wallets already exist on Pi Testnet. You can mint now.",
        };
      }

      const fee = await fetchBaseFee();
      const raw = (await horizonGet(`/accounts/${funder.publicKey()}`)) as { sequence: string };
      const source = new Account(funder.publicKey(), raw.sequence);
      const builder = new TransactionBuilder(source, {
        fee: String(Number(fee) * todo.length),
        networkPassphrase: NETWORK_PASSPHRASE,
      });
      for (const op of todo) {
        builder.addOperation(
          Operation.createAccount({ destination: op.target, startingBalance: op.amount }),
        );
      }
      const tx = builder.setTimeout(60).build();
      tx.sign(funder);
      const response = await submit(tx.toXDR());

      return {
        ok: true as const,
        created: todo.map((o) => o.target),
        txId: response.id ?? "",
        message: "Wallets created and funded on Pi Testnet. You can mint now.",
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not activate the wallets.";
      console.error("activateWallets failed:", message);
      return { ok: false as const, error: message };
    }
  });
