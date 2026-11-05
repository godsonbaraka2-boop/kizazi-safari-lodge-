import { z } from "zod";
export const rewardAmount = z.string().regex(/^(0|[1-9]\d{0,11})(\.\d{1,7})?$/, "Use up to seven decimal places.").refine(v => Number(v) > 0, "Amount must be greater than zero.");
export function assertTestnet(network: string) {
  if (network !== "Pi Testnet") throw new Error("Pi app-to-user rewards are currently supported on Testnet only.");
}
export const PI_AUTH_SCOPES = ["payments", "username", "wallet_address"];
export function rewardCreationRejection(status: number, body: unknown): { code: string; message: string } | null {
  const text = JSON.stringify(body ?? {}).toLowerCase();
  // Only an explicit client-side permission denial proves creation was rejected.
  if (status >= 400 && status < 500 && status !== 408 && /wallet.?address/.test(text) && /permission|scope|grant|authoriz/.test(text)) {
    return { code: "wallet_permission_required", message: "This user has not granted wallet-address permission. Ask them to sign in again in Pi Browser and allow wallet access, then retry. No reward was created." };
  }
  return null;
}
export function verifiedPaymentOwner(payment: { identifier?: string; user_uid?: string; direction?: string; status?: { developer_completed?: boolean; transaction_verified?: boolean; cancelled?: boolean; user_cancelled?: boolean }; transaction?: { txid?: string } | null }, id: string, txid: string | null): string | null {
  if (payment.identifier !== id || payment.direction !== "user_to_app" || !payment.user_uid || !txid || payment.transaction?.txid !== txid || !payment.status?.developer_completed || !payment.status.transaction_verified || payment.status.cancelled || payment.status.user_cancelled) return null;
  return payment.user_uid;
}