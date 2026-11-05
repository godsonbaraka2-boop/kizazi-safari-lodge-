import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { rewardAmount } from "./reward-policy";
const adminInput = z.object({ passcode: z.string().min(1).max(200) });
export const listRewardUsers = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => adminInput.parse(input))
  .handler(async ({ data }) => {
    const { verifyAdmin } = await import("./admin-auth.server");
    const check = await verifyAdmin(data.passcode);
    if (!check.ok) throw new Error(check.error);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const users = await supabaseAdmin.from("pi_users").select("uid,username,verified_at,wallet_permission_verified_at,identity_source").order("verified_at", { ascending: false }).limit(500);
    const rewards = await supabaseAdmin.from("pi_rewards").select("id,user_uid,amount,status,payment_id,txid,created_at,error_message,error_code").order("created_at", { ascending: false }).limit(100);
    if (users.error || rewards.error) throw new Error("Could not load rewards.");
    return { users: users.data, rewards: rewards.data, configured: Boolean(process.env["PI_REWARD_WALLET_SECRET"] && process.env["PI_API_KEY"]), network: "Pi Testnet" };
  });
export const syncPaidRewardUsers = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => adminInput.parse(input))
  .handler(async ({ data }) => {
    await adminDb(data.passcode);
    const key = process.env["PI_API_KEY"];
    if (!key) throw new Error("Pi payments are not configured.");
    const { recoverPaidUsers } = await import("./reward-users.server");
    return recoverPaidUsers(key);
  });
export const sendPiReward = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => adminInput.extend({ uid: z.string().min(1).max(200), amount: rewardAmount, requestId: z.uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { verifyAdmin } = await import("./admin-auth.server");
    const check = await verifyAdmin(data.passcode);
    if (!check.ok) throw new Error(check.error);
    const apiKey = process.env["PI_API_KEY"];
    const walletSecret = process.env["PI_REWARD_WALLET_SECRET"];
    if (!apiKey || !walletSecret) throw new Error("Connect the app's Testnet reward wallet first.");
    const { runPiReward } = await import("./rewards.server");
    return runPiReward(data, apiKey, walletSecret);
  });
async function adminDb(passcode: string) {
  const { verifyAdmin } = await import("./admin-auth.server");
  const check = await verifyAdmin(passcode);
  if (!check.ok) throw new Error(check.error);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

// No local payment ID is NOT proof Pi never received a create request.
export const dismissReward = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => adminInput.extend({ id: z.uuid() }).parse(input))
  .handler(async ({ data }) => {
    const db = await adminDb(data.passcode);
    const res = await db.from("pi_rewards").update({ status: "dismissed", updated_at: new Date().toISOString() })
      .eq("id", data.id).eq("status", "review").eq("error_code", "wallet_permission_required").is("payment_id", null).is("txid", null).is("signed_xdr", null).select("id").maybeSingle();
    if (res.error || !res.data) throw new Error("This reward has an uncertain outcome. It cannot safely be dismissed without authoritative proof that Pi rejected creation.");
    return { ok: true };
  });

// Remove a Pi username from the reward list. Users with real reward history are kept for the audit trail.
export const deleteRewardUser = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => adminInput.extend({ uid: z.string().min(1).max(200) }).parse(input))
  .handler(async ({ data }) => {
    const db = await adminDb(data.passcode);
    const kept = await db.from("pi_rewards").select("id").eq("user_uid", data.uid).neq("status", "dismissed").limit(1);
    if (kept.error) throw new Error("Could not check reward history.");
    if (kept.data.length) throw new Error("This user has reward history and cannot be deleted.");
    const r1 = await db.from("pi_rewards").delete().eq("user_uid", data.uid).eq("status", "dismissed");
    const r2 = await db.from("pi_users").delete().eq("uid", data.uid);
    if (r1.error || r2.error) throw new Error("Could not delete this user.");
    return { ok: true };
  });
