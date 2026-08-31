import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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
  paymentId: z.string().max(200).optional(),
  txid: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
});

export const saveBooking = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => bookingSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("bookings").insert({
      confirmation_code: data.confirmationCode,
      guest_name: data.guestName,
      phone: data.phone,
      check_in: data.checkIn,
      check_out: data.checkOut,
      nights: data.nights,
      guests: data.guests,
      room: data.room,
      price_per_night: data.pricePerNight,
      total_pi: data.totalPi,
      payment_id: data.paymentId ?? null,
      txid: data.txid ?? null,
      notes: data.notes ?? null,
      status: "paid",
    });
    if (error) {
      console.error("saveBooking failed", error.message);
      return { ok: false as const };
    }
    return { ok: true as const };
  });

const paymentSchema = z.object({
  kind: z.enum(["room", "food", "tour"]),
  itemName: z.string().min(1).max(120),
  amountPi: z.number().min(0).max(1000000),
  guestName: z.string().max(80).optional(),
  paymentId: z.string().max(200).optional(),
  txid: z.string().max(200).optional(),
});

/** Records a one-off Pi payment (room quick pay, food order, tour) in the bookings log. */
export const recordPiPayment = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => paymentSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
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
      price_per_night: data.amountPi,
      total_pi: data.amountPi,
      payment_id: data.paymentId ?? null,
      txid: data.txid ?? null,
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
    const expected = process.env["ADMIN_PASSCODE"];
    if (!expected || data.passcode !== expected) {
      return { ok: false as const, bookings: [] };
    }
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
    const expected = process.env["ADMIN_PASSCODE"];
    if (!expected || data.passcode !== expected) {
      return { ok: false as const };
    }
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
