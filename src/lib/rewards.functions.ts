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
    const users = await supabaseAdmin.from("pi_users").select("uid,username,verified_at").order("verified_at", { ascending: false }).limit(500);
    const rewards = await supabaseAdmin.from("pi_rewards").select("id,user_uid,amount,status,payment_id,txid,created_at").order("created_at", { ascending: false }).limit(100);
    if (users.error || rewards.error) throw new Error("Could not load rewards.");
    return { users: users.data, rewards: rewards.data, configured: Boolean(process.env["PI_REWARD_WALLET_SECRET"] && process.env["PI_API_KEY"]), network: "Pi Testnet" };
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