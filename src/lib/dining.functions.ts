import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const KITCHEN_STATUSES = ["Pending", "Cooking", "Ready", "Delivered"] as const;

const orderSchema = z.object({
  itemName: z.string().min(1).max(120),
  quantity: z.number().int().min(1).max(50),
  guestRoom: z.string().min(1).max(60),
  guestName: z.string().max(80).optional(),
  totalPi: z.number().min(0).max(1000000),
  paymentId: z.string().max(200).optional(),
  txid: z.string().max(200).optional(),
});

/** Creates a kitchen order after a successful Pi payment. */
export const createDiningOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => orderSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("dining_orders").insert({
      item_name: data.itemName,
      quantity: data.quantity,
      guest_room: data.guestRoom.trim(),
      guest_name: data.guestName?.trim() || null,
      total_pi: data.totalPi,
      payment_id: data.paymentId ?? null,
      txid: data.txid ?? null,
      status: "Pending",
    });
    if (error) {
      console.error("createDiningOrder failed", error.message);
      return { ok: false as const };
    }
    return { ok: true as const };
  });

/** Staff-only: list today's kitchen orders (initial load for the kitchen screen). */
export const listDiningOrders = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ passcode: z.string().min(1).max(200) }).parse(input),
  )
  .handler(async ({ data }) => {
    const expected = process.env["ADMIN_PASSCODE"];
    if (!expected || data.passcode !== expected) {
      return { ok: false as const, orders: [] };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const since = new Date(Date.now() - 36 * 3600 * 1000).toISOString();
    const { data: rows, error } = await supabaseAdmin
      .from("dining_orders")
      .select(
        "id, item_name, quantity, guest_room, guest_name, total_pi, status, payment_id, txid, created_at",
      )
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) {
      console.error("listDiningOrders failed", error.message);
      throw new Error("Could not load kitchen orders");
    }
    return { ok: true as const, orders: rows ?? [] };
  });

/** Staff-only: advance an order through Pending → Cooking → Ready → Delivered. */
export const updateDiningOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        passcode: z.string().min(1).max(200),
        id: z.string().uuid(),
        status: z.enum(KITCHEN_STATUSES),
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
      .from("dining_orders")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) {
      console.error("updateDiningOrderStatus failed", error.message);
      return { ok: false as const };
    }
    return { ok: true as const };
  });
