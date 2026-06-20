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
    const res = await fetch("https://api.minepi.com/v2/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${data.accessToken}`,
      },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("Pi /v2/me validation failed", res.status, body);
      throw new Error(`Pi token validation failed (${res.status})`);
    }

    const json = (await res.json()) as { uid?: string; username?: string };
    if (!json.uid || !json.username) {
      throw new Error("Pi /v2/me returned unexpected payload");
    }
    return { uid: json.uid, username: json.username };
  });
