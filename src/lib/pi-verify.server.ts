/**
 * Server-only: confirms with Pi Network that a payment really happened
 * before the app records a booking or order as paid.
 */
export async function verifyPiPayment(
  paymentId: string,
  expectedAmount: number,
): Promise<{ ok: true; txid: string } | { ok: false; reason: string }> {
  const key = process.env.PI_API_KEY;
  if (!key) return { ok: false, reason: "Payments are not configured" };
  try {
    const res = await fetch(
      `https://api.minepi.com/v2/payments/${encodeURIComponent(paymentId)}`,
      { headers: { Authorization: `Key ${key}` } },
    );
    if (!res.ok) return { ok: false, reason: "Payment not found" };
    const p = (await res.json()) as {
      amount?: number;
      status?: {
        transaction_verified?: boolean;
        developer_completed?: boolean;
        cancelled?: boolean;
        user_cancelled?: boolean;
      };
      transaction?: { txid?: string } | null;
    };
    const s = p.status ?? {};
    if (s.cancelled || s.user_cancelled) return { ok: false, reason: "Payment was cancelled" };
    if (!s.transaction_verified || !s.developer_completed || !p.transaction?.txid) {
      return { ok: false, reason: "Payment is not completed" };
    }
    if (typeof p.amount !== "number" || p.amount + 1e-7 < expectedAmount) {
      return { ok: false, reason: "Payment amount does not match" };
    }
    return { ok: true, txid: p.transaction.txid };
  } catch (err) {
    console.error("verifyPiPayment failed", err);
    return { ok: false, reason: "Could not verify payment" };
  }
}

/** True when this Pi payment was already used for a record in the given table. */
export async function paymentAlreadyUsed(
  table: "bookings" | "dining_orders",
  paymentId: string,
): Promise<boolean> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from(table)
    .select("id")
    .eq("payment_id", paymentId)
    .limit(1);
  return (data?.length ?? 0) > 0;
}
