import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assertOwnedPayment, type OwnedPiPayment } from "./pi-payment-policy";

const PI_API_BASE = "https://api.minepi.com/v2";

function getApiKey(): string {
  const key = process.env.PI_API_KEY;
  if (!key) throw new Error("PI_API_KEY is not configured on the server");
  return key;
}

async function piRequest(path: string, body?: unknown) {
  const res = await fetch(`${PI_API_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${getApiKey()}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`Pi API ${path} failed`, res.status, text);
    throw new Error(`Pi API ${path} failed (${res.status})`);
  }
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

export const approvePiPayment = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ paymentId: z.string().min(1).max(200), accessToken: z.string().min(8).max(4096) }).parse(input))
  .handler(async ({ data }) => {
    const { verifyPiIdentity } = await import("./pi-identity.server");
    const user = await verifyPiIdentity(data.accessToken);
    const res = await fetch(`${PI_API_BASE}/payments/${encodeURIComponent(data.paymentId)}`, { headers: { Authorization: `Key ${getApiKey()}` } });
    if (!res.ok) throw new Error("Payment not found.");
    assertOwnedPayment(await res.json() as OwnedPiPayment, user.uid);
    // Refuse to approve if the amount is below the official price or the room is taken.
    const { checkPaymentBeforeApproval } = await import("./pi-approval.server");
    const check = await checkPaymentBeforeApproval(data.paymentId);
    if (!check.ok) throw new Error(check.reason);
    await piRequest(`/payments/${encodeURIComponent(data.paymentId)}/approve`);
    return { ok: true as const };
  });

export const completePiPayment = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ paymentId: z.string().min(1).max(200), txid: z.string().min(1).max(200), accessToken: z.string().min(8).max(4096) }).parse(input))
  .handler(async ({ data }) => {
    const { verifyPiIdentity } = await import("./pi-identity.server");
    const user = await verifyPiIdentity(data.accessToken);
    const res = await fetch(`${PI_API_BASE}/payments/${encodeURIComponent(data.paymentId)}`, { headers: { Authorization: `Key ${getApiKey()}` } });
    if (!res.ok) throw new Error("Payment not found.");
    assertOwnedPayment(await res.json() as OwnedPiPayment, user.uid, data.txid);
    await piRequest(
      `/payments/${encodeURIComponent(data.paymentId)}/complete`,
      { txid: data.txid },
    );
    return { ok: true as const };
  });
