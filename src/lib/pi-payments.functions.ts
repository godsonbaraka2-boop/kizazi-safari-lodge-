import { createServerFn } from "@tanstack/react-start";

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
  .inputValidator((input: { paymentId: string }) => {
    if (!input?.paymentId || typeof input.paymentId !== "string") {
      throw new Error("paymentId is required");
    }
    return { paymentId: input.paymentId };
  })
  .handler(async ({ data }) => {
    await piRequest(`/payments/${encodeURIComponent(data.paymentId)}/approve`);
    return { ok: true as const };
  });

export const completePiPayment = createServerFn({ method: "POST" })
  .inputValidator((input: { paymentId: string; txid: string }) => {
    if (!input?.paymentId || !input?.txid) {
      throw new Error("paymentId and txid are required");
    }
    return { paymentId: input.paymentId, txid: input.txid };
  })
  .handler(async ({ data }) => {
    await piRequest(
      `/payments/${encodeURIComponent(data.paymentId)}/complete`,
      { txid: data.txid },
    );
    return { ok: true as const };
  });
