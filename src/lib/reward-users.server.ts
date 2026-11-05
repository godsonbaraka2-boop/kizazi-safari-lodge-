import { verifiedPaymentOwner } from "./reward-policy";

export async function recoverPaidUsers(apiKey: string) {
  const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
  const bookings = await db.from("bookings").select("payment_id,txid").not("payment_id", "is", null);
  const orders = await db.from("dining_orders").select("payment_id,txid").not("payment_id", "is", null);
  if (bookings.error || orders.error) throw new Error("Could not load paid guest records.");
  const payments = new Map([...bookings.data, ...orders.data].filter(p => p.payment_id).map(p => [p.payment_id, p.txid]));
  let recovered = 0;
  let unavailable = 0;
  for (const [id, txid] of payments) {
    if (!id) continue;
    try {
      const res = await fetch(`https://api.minepi.com/v2/payments/${encodeURIComponent(id)}`, { headers: { Authorization: `Key ${apiKey}` } });
      if (!res.ok) { unavailable++; continue; }
      const uid = verifiedPaymentOwner(await res.json(), id, txid);
      if (!uid) { unavailable++; continue; }
      const existing = await db.from("pi_users").select("uid").eq("uid", uid).maybeSingle();
      if (existing.error) throw new Error("Could not check verified guest.");
      if (existing.data) continue;
      // Pi payment responses supply uid but not username. Never promote a
      // guest-entered name to a verified Pi username.
      const inserted = await db.from("pi_users").upsert({ uid, username: `Pi guest ${uid.slice(0, 8)}`, identity_source: "payment" }, { onConflict: "uid", ignoreDuplicates: true });
      if (inserted.error) throw new Error("Could not save verified guest.");
      recovered++;
    } catch { unavailable++; }
  }
  return { recovered, unavailable };
}