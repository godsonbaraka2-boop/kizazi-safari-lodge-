import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { roomPricePerNight, roomTotal, foodTotal, tourPrice, nightsBetween } from "./prices";

const bookingSchema = z.object({
  confirmationCode: z.string().min(3).max(20),
  guestName: z.string().min(1).max(80),
  phone: z.string().min(5).max(20),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  nights: z.number().int().min(1).max(365),
  guests: z.number().int().min(1).max(12),
  room: z.string().min(1).max(120),
  pricePerNight: z.number().min(0).max(1000000),
  totalPi: z.number().min(0).max(1000000),
  paymentId: z.string().min(1).max(200),
  txid: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
});

/** Statuses that occupy a room and therefore block another booking. */
const BLOCKING_STATUSES = ["confirmed", "paid", "checked-in"] as const;

export const ROOM_TAKEN_MESSAGE =
  "This room is already booked for your selected dates. Please choose different dates or another room.";

const availabilitySchema = z.object({
  room: z.string().min(1).max(120),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

/**
 * Overlap rule: (requested_check_in < existing_check_out) AND (requested_check_out > existing_check_in)
 */
async function findConflicts(room: string, checkIn: string, checkOut: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("id, check_in, check_out")
    .eq("room", room)
    .in("status", BLOCKING_STATUSES as unknown as string[])
    .gt("nights", 0)
    .lt("check_in", checkOut)
    .gt("check_out", checkIn)
    .limit(1);
  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Public availability check used by the booking form before the Pi payment starts. */
export const checkRoomAvailability = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => availabilitySchema.parse(input))
  .handler(async ({ data }) => {
    if (data.checkOut <= data.checkIn) {
      return { available: false as const, reason: "Check-out must be after check-in." };
    }
    try {
      const conflicts = await findConflicts(data.room, data.checkIn, data.checkOut);
      return conflicts.length > 0
        ? { available: false as const, reason: ROOM_TAKEN_MESSAGE }
        : { available: true as const, reason: null };
    } catch (err) {
      console.error("checkRoomAvailability failed", err);
      return { available: false as const, reason: "Could not verify availability. Please try again." };
    }
  });

export const saveBooking = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => bookingSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { verifyPiPayment, paymentAlreadyUsed } = await import("./pi-verify.server");
    if (await paymentAlreadyUsed("bookings", data.paymentId)) {
      return { ok: false as const, message: "This payment was already used." };
    }
    // Price is decided by the server, never by the browser.
    const nights = nightsBetween(data.checkIn, data.checkOut);
    const pricePerNight = roomPricePerNight(data.room);
    const totalPi = roomTotal(data.room, nights);
    if (nights < 1 || pricePerNight === null || totalPi === null) {
      return { ok: false as const, message: "Invalid room or dates." };
    }
    const verified = await verifyPiPayment(data.paymentId, totalPi);
    if (!verified.ok) return { ok: false as const, message: verified.reason };
    // Server-side double-booking guard (authoritative).
    const conflicts = await findConflicts(data.room, data.checkIn, data.checkOut);
    if (conflicts.length > 0) {
      return { ok: false as const, conflict: true as const, message: ROOM_TAKEN_MESSAGE };
    }

    const { error } = await supabaseAdmin.from("bookings").insert({
      confirmation_code: data.confirmationCode,
      guest_name: data.guestName,
      phone: data.phone,
      check_in: data.checkIn,
      check_out: data.checkOut,
      nights,
      guests: data.guests,
      room: data.room,
      price_per_night: pricePerNight,
      total_pi: totalPi,
      payment_id: data.paymentId,
      txid: verified.txid,
      notes: data.notes ?? null,
      status: "paid",
    });
    if (error) {
      console.error("saveBooking failed", error.message);
      if (error.code === "23P01") {
        return { ok: false as const, conflict: true as const, message: ROOM_TAKEN_MESSAGE };
      }
      return { ok: false as const };
    }
    return { ok: true as const };
  });

const paymentSchema = z.object({
  kind: z.enum(["room", "food", "tour"]),
  itemName: z.string().min(1).max(120),
  amountPi: z.number().min(0).max(1000000).optional(),
  quantity: z.number().int().min(1).max(50).optional(),
  guestName: z.string().max(80).optional(),
  paymentId: z.string().min(1).max(200),
  txid: z.string().max(200).optional(),
});

/** Records a one-off Pi payment (room quick pay, food order, tour) in the bookings log. */
export const recordPiPayment = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => paymentSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { verifyPiPayment, paymentAlreadyUsed } = await import("./pi-verify.server");
    if (await paymentAlreadyUsed("bookings", data.paymentId)) {
      return { ok: false as const, message: "This payment was already used." };
    }
    const expected =
      data.kind === "room"
        ? roomPricePerNight(data.itemName)
        : data.kind === "food"
          ? foodTotal(data.itemName, data.quantity ?? 1)
          : tourPrice(data.itemName);
    if (expected === null) return { ok: false as const, message: "Unknown item." };
    const verified = await verifyPiPayment(data.paymentId, expected);
    if (!verified.ok) return { ok: false as const, message: verified.reason };
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let suffix = "";
    for (let i = 0; i < 4; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await supabaseAdmin.from("bookings").insert({
      confirmation_code: `KIZ-${suffix}`,
      guest_name: data.guestName?.trim() || "Pi guest",
      phone: "—",
      check_in: today,
      check_out: today,
      nights: 0,
      guests: 1,
      room: data.itemName,
      price_per_night: expected,
      total_pi: expected,
      payment_id: data.paymentId,
      txid: verified.txid,
      notes: `${data.kind} payment`,
      status: "paid",
    });
    if (error) {
      console.error("recordPiPayment failed", error.message);
      return { ok: false as const };
    }
    return { ok: true as const };
  });

export const listBookings = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ passcode: z.string().min(1).max(200) }).parse(input))
  .handler(async ({ data }) => {
    const { verifyAdmin } = await import("./admin-auth.server");
    const auth = await verifyAdmin(data.passcode);
    if (!auth.ok) return { ok: false as const, error: auth.error, bookings: [] };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("bookings")
      .select(
        "id, confirmation_code, guest_name, phone, check_in, check_out, nights, guests, room, price_per_night, total_pi, payment_id, txid, status, notes, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) {
      console.error("listBookings failed", error.message);
      throw new Error("Could not load bookings");
    }
    return { ok: true as const, bookings: rows ?? [] };
  });

export const updateBookingStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        passcode: z.string().min(1).max(200),
        id: z.string().uuid(),
        status: z.enum(["paid", "checked-in", "cancelled"]),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { verifyAdmin } = await import("./admin-auth.server");
    if (!(await verifyAdmin(data.passcode)).ok) return { ok: false as const };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("bookings")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) {
      console.error("updateBookingStatus failed", error.message);
      return { ok: false as const };
    }
    return { ok: true as const };
  });

/** Public: names of rooms occupied today by a paid booking (no guest details). */
export const listOccupiedRooms = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("room")
    .in("status", BLOCKING_STATUSES as unknown as string[])
    .gt("nights", 0)
    .lte("check_in", today)
    .gt("check_out", today)
    .limit(200);
  if (error) {
    console.error("listOccupiedRooms failed", error.message);
    return { rooms: [] as string[] };
  }
  return { rooms: Array.from(new Set((data ?? []).map((r) => r.room))) };
});
