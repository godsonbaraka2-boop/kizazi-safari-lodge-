import { timingSafeEqual, createHash } from "crypto";
import { getRequestHeader } from "@tanstack/react-start/server";

const MAX_FAILS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function clientKey(): string {
  const ip =
    getRequestHeader("cf-connecting-ip") ||
    getRequestHeader("x-real-ip") ||
    getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export type AdminCheck = { ok: true } | { ok: false; error: string };

/** Verifies the admin passcode with constant-time compare and blocks brute force (5 fails / 15 min). */
export async function verifyAdmin(passcode: string): Promise<AdminCheck> {
  const expected = process.env["ADMIN_PASSCODE"];
  if (!expected) return { ok: false, error: "Admin access is not configured." };
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const key = clientKey();
  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const { count, error } = await supabaseAdmin
    .from("admin_login_attempts")
    .select("id", { count: "exact", head: true })
    .eq("client_key", key)
    .gte("created_at", since);
  if (error) return { ok: false, error: "Could not verify access. Try again." };
  if ((count ?? 0) >= MAX_FAILS) {
    return { ok: false, error: "Too many wrong attempts. Try again in 15 minutes." };
  }
  if (!safeEqual(passcode, expected)) {
    await supabaseAdmin.from("admin_login_attempts").insert({ client_key: key });
    return { ok: false, error: "Wrong admin passcode." };
  }
  return { ok: true };
}
