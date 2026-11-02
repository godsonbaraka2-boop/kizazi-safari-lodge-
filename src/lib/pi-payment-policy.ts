export type OwnedPiPayment = {
  user_uid?: string;
  direction?: string;
  status?: { cancelled?: boolean; user_cancelled?: boolean; developer_approved?: boolean; transaction_verified?: boolean };
  transaction?: { txid?: string } | null;
};
export function assertOwnedPayment(payment: OwnedPiPayment, uid: string, txid?: string) {
  if (payment.user_uid !== uid || payment.direction !== "user_to_app") throw new Error("This payment does not belong to your Pi account.");
  if (payment.status?.cancelled || payment.status?.user_cancelled) throw new Error("Payment was cancelled.");
  if (txid && (!payment.status?.developer_approved || !payment.status.transaction_verified || payment.transaction?.txid !== txid)) {
    throw new Error("Payment transaction has not been verified by Pi.");
  }
}