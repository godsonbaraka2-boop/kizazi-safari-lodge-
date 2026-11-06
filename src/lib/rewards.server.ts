import { assertTestnet, rewardCreationRejection } from "./reward-policy";
class CreationRejected extends Error {
  constructor(public code: string, message: string) { super(message); }
}
type Payment = { identifier: string; user_uid: string; amount: number; direction: string; network: string; from_address: string; to_address: string; metadata?: { reward_id?: string }; status?: { cancelled?: boolean; user_cancelled?: boolean; developer_completed?: boolean; transaction_verified?: boolean }; transaction?: { txid?: string } | null };
export async function runPiReward(input: { requestId: string; uid: string; amount: string }, apiKey: string, walletSecret: string) {
  const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
  const stellar = await import("@stellar/stellar-base");
  const wallet = stellar.Keypair.fromSecret(walletSecret);
  const horizon = "https://api.testnet.minepi.com";
  async function api(path: string, body?: unknown) {
    const res = await fetch(`https://api.minepi.com/v2${path}`, { method: body ? "POST" : "GET", headers: { Authorization: `Key ${apiKey}`, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    if (!res.ok) {
      const body: unknown = await res.json().catch(() => null);
      console.error("[Pi reward] request rejected", { path, status: res.status });
      const rejection = path === "/payments" ? rewardCreationRejection(res.status, body) : null;
      if (rejection) throw new CreationRejected(rejection.code, rejection.message);
      throw new Error("Pi could not confirm this reward. Reconcile before sending again.");
    }
    return res.json();
  }
  const user = await db.from("pi_users").select("uid").eq("uid", input.uid).single();
  if (user.error) throw new Error("Select a verified Pi user.");
  let row = (await db.from("pi_rewards").select("*").eq("id", input.requestId).maybeSingle()).data;
  let created = false;
  if (!row) {
    const inserted = await db.from("pi_rewards").insert({ id: input.requestId, user_uid: input.uid, amount: Number(input.amount) }).select("*").single();
    if (inserted.error) throw new Error("Another reward is unfinished. Reconcile it first.");
    row = inserted.data; created = true;
  }
  if (!row || row.user_uid !== input.uid || Number(row.amount) !== Number(input.amount)) throw new Error("Reward details do not match the original request.");
  if (row.status === "completed") return { amount: row.amount, txid: row.txid };
  if (row.status === "dismissed") throw new Error(row.error_message ?? "This request was closed. Start a new reward request.");
  // Claim once; failed requests remain in review. A crashed processing request is
  // deliberately not automatically retried, since an external call may be in flight.
  const claim = await db.from("pi_rewards").update({ status: "processing", updated_at: new Date().toISOString() }).eq("id", row.id).in("status", ["pending", "review"]).select("id").maybeSingle();
  if (claim.error || !claim.data) throw new Error("This reward is already being processed. Do not send another.");
  async function save(values: { payment_id?: string; signed_xdr?: string; txid?: string; status?: string; error_code?: string | null; error_message?: string | null }) {
    const result = await db.from("pi_rewards").update({ ...values, updated_at: new Date().toISOString() }).eq("id", input.requestId);
    if (result.error) throw new Error("Reward record could not be saved. Stop and reconcile.");
  }
  try {
    let payment: Payment;
    if (row.payment_id) payment = await api(`/payments/${encodeURIComponent(row.payment_id)}`) as Payment;
    else if (created) {
      payment = await api("/payments", { payment: { uid: row.user_uid, amount: row.amount, memo: "Kizazi Safari Lodge reward", metadata: { reward_id: row.id } } }) as Payment;
      await save({ payment_id: payment.identifier });
    } else {
      const incomplete = await api("/payments/incomplete_server_payments") as { incomplete_server_payments?: Payment[] };
      const match = incomplete.incomplete_server_payments?.filter(p => p.metadata?.reward_id === row.id);
      if (match?.length !== 1 || !match[0]) throw new Error("Pi payment creation is uncertain. Manual review is required; no new payout was created.");
      payment = match[0]; await save({ payment_id: payment.identifier });
    }
    assertTestnet(payment.network);
    if (payment.direction !== "app_to_user" || payment.user_uid !== row.user_uid || Number(payment.amount) !== Number(row.amount) || payment.metadata?.reward_id !== row.id || payment.from_address !== wallet.publicKey()) throw new Error("The reward wallet or Pi payment details do not match. No funds were sent.");
    if (payment.status?.cancelled || payment.status?.user_cancelled) throw new Error("Reward was cancelled. Manual review required.");
    let txid = payment.transaction?.txid ?? row.txid;
    if (!txid) {
      let xdr = row.signed_xdr;
      if (!xdr) {
        const accountRes = await fetch(`${horizon}/accounts/${wallet.publicKey()}`);
        if (!accountRes.ok) throw new Error("Fund the connected Testnet app wallet before sending rewards.");
        const account = await accountRes.json() as { sequence: string };
        const tx = new stellar.TransactionBuilder(new stellar.Account(wallet.publicKey(), account.sequence), { fee: "100000", networkPassphrase: "Pi Testnet" })
          .addMemo(stellar.Memo.text(payment.identifier))
          .addOperation(stellar.Operation.payment({ destination: payment.to_address, asset: stellar.Asset.native(), amount: Number(row.amount).toFixed(7) }))
          .setTimeout(120).build();
        tx.sign(wallet); xdr = tx.toXDR();
        await save({ signed_xdr: xdr });
      }
      // Re-submit only the identical signed envelope: never rebuild on a timeout.
      const tx = stellar.TransactionBuilder.fromXDR(xdr, "Pi Testnet");
      const hash = tx.hash().toString("hex");
      const existing = await fetch(`${horizon}/transactions/${hash}`);
      if (!existing.ok) {
        const submitted = await fetch(`${horizon}/transactions`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ tx: xdr }) });
        if (!submitted.ok) throw new Error("Testnet has not confirmed the transfer. Reconcile this reward; do not send another.");
      }
      txid = hash; await save({ txid });
    }
    if (!payment.status?.developer_completed) await api(`/payments/${encodeURIComponent(payment.identifier)}/complete`, { txid });
    const confirmed = await api(`/payments/${encodeURIComponent(payment.identifier)}`) as Payment;
    if (!confirmed.status?.developer_completed || !confirmed.status.transaction_verified || confirmed.transaction?.txid !== txid) throw new Error("Pi has not confirmed completion yet. Reconcile this reward.");
    await save({ txid, status: "completed", error_code: null, error_message: null });
    return { amount: row.amount, txid };
  } catch (e) {
    if (e instanceof CreationRejected && created && !row.payment_id) {
      await save({ status: "dismissed", error_code: e.code, error_message: e.message });
      await db.from("pi_users").update({ wallet_permission_verified_at: null }).eq("uid", row.user_uid);
    } else {
      await save({ status: "review", error_message: e instanceof Error ? e.message : "Reward needs review." });
    }
    throw e;
  }
}
// True only when Pi authoritatively lists no unfinished app-to-user payment for this reward.
export async function piHasNoPaymentForReward(rewardId: string, apiKey: string) {
  const res = await fetch("https://api.minepi.com/v2/payments/incomplete_server_payments", { headers: { Authorization: `Key ${apiKey}` } });
  if (!res.ok) return false;
  const body = await res.json().catch(() => null) as { incomplete_server_payments?: Payment[] } | null;
  if (!body || !Array.isArray(body.incomplete_server_payments)) return false;
  return !body.incomplete_server_payments.some(p => p.metadata?.reward_id === rewardId);
}
