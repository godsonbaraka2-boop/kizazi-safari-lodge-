import { expect, it } from "vitest";
import { rewardAmount, assertTestnet, PI_AUTH_SCOPES, rewardCreationRejection, verifiedPaymentOwner } from "./reward-policy";
it("accepts the amount chosen by admin without substituting a fixed reward", () => {
  expect(rewardAmount.parse("2.3456789")).toBe("2.3456789");
  expect(rewardAmount.parse("10")).toBe("10");
});
it("rejects zero, negative and precision beyond Pi's seven decimals", () => {
  for (const v of ["0", "-1", "0.00000001", "NaN"]) expect(rewardAmount.safeParse(v).success).toBe(false);
});
it("blocks Mainnet rewards until Pi supports them", () => {
  expect(() => assertTestnet("Pi Mainnet")).toThrow();
  expect(() => assertTestnet("Pi Testnet")).not.toThrow();
});
it("requests wallet consent as well as username and payments", () => {
  expect(PI_AUTH_SCOPES).toEqual(["payments", "username", "wallet_address"]);
});
it("releases only explicit wallet permission rejections, never ambiguous creation", () => {
  const body = { error: "User has not granted wallet_address permission" };
  expect(rewardCreationRejection(400, body)?.code).toBe("wallet_permission_required");
  for (const status of [408, 429, 500, 502]) expect(rewardCreationRejection(status, status === 429 ? {} : body)).toBeNull();
  expect(rewardCreationRejection(400, { error: "Unknown error" })).toBeNull();
});
it("recovers the owner only from a completed Pi payment matching the stored transaction", () => {
  const p = { identifier: "pay-1", user_uid: "verified-owner", direction: "user_to_app", status: { developer_completed: true, transaction_verified: true }, transaction: { txid: "tx-1" } };
  expect(verifiedPaymentOwner(p, "pay-1", "tx-1")).toBe("verified-owner");
  expect(verifiedPaymentOwner(p, "pay-1", "different")).toBeNull();
  expect(verifiedPaymentOwner({ ...p, direction: "app_to_user" }, "pay-1", "tx-1")).toBeNull();
  expect(verifiedPaymentOwner({ ...p, status: { ...p.status, cancelled: true } }, "pay-1", "tx-1")).toBeNull();
});