import { roomTotal, foodTotal, tourPrice, nightsBetween } from "./prices";

const BLOCKING = ["confirmed", "paid", "checked-in"];

/**
 * Runs before the server approves a Pi payment: the guest's money only moves if
 * the amount matches the official price list and (for rooms) the dates are free.
 */
export async function checkPaymentBeforeApproval(
  paymentId: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const key = process.env.PI_API_KEY;
  if (!key) return { ok: false, reason: "Payments are not configured" };
  const res = await fetch(`https://api.minepi.com/v2/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `Key ${key}` },
  });
  if (!res.ok) return { ok: false, reason: "Payment not found" };
  const p = (await res.json()) as { amount?: number; metadata?: Record<string, unknown> };
  const m = p.metadata ?? {};
  const amount = typeof p.amount === "number" ? p.amount : 0;
  const str = (v: unknown) => (typeof v === "string" ? v : "");

  let expected: number | null = null;
  if (m.kind === "room_booking_form") {
    const room = str(m.room);
    const checkIn = str(m.checkIn);
    const checkOut = str(m.checkOut);
    const nights = nightsBetween(checkIn, checkOut);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(checkIn) || !/^\d{4}-\d{2}-\d{2}$/.test(checkOut) || nights < 1) {
      return { ok: false, reason: "Invalid booking dates" };
    }
    expected = roomTotal(room, nights);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select("id")
      .eq("room", room)
      .in("status", BLOCKING)
      .gt("nights", 0)
      .lt("check_in", checkOut)
      .gt("check_out", checkIn)
      .limit(1);
    if (error) return { ok: false, reason: "Could not verify availability" };
    if ((data ?? []).length > 0) {
      return {
        ok: false,
        reason: "This room is already booked for your selected dates. Please choose different dates or another room.",
      };
    }
  } else if (m.kind === "food_order") {
    const qty = Number(m.quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > 50) return { ok: false, reason: "Invalid quantity" };
    expected = foodTotal(str(m.item), qty);
  } else if (m.kind === "tour_booking") {
    expected = tourPrice(str(m.tour));
  } else {
    return { ok: false, reason: "Unknown payment type" };
  }
  if (expected === null) return { ok: false, reason: "Unknown item" };
  if (amount + 1e-7 < expected) return { ok: false, reason: "Payment amount is below the official price" };
  return { ok: true };
}
