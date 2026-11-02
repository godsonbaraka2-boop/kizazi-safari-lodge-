import { createServerFn } from "@tanstack/react-start";

export type PiUser = {
  uid: string;
  username: string;
};

export const verifyPiAccessToken = createServerFn({ method: "POST" })
  .inputValidator((input: { accessToken: string }) => {
    if (!input || typeof input.accessToken !== "string" || input.accessToken.length < 8) {
      throw new Error("accessToken is required");
    }
    return { accessToken: input.accessToken };
  })
  .handler(async ({ data }): Promise<PiUser> => {
    const { verifyPiIdentity } = await import("./pi-identity.server");
    const user = await verifyPiIdentity(data.accessToken);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("pi_users").upsert({ ...user, verified_at: new Date().toISOString() });
    if (error) throw new Error("Could not save verified Pi account. Please try again.");
    return user;
  });
