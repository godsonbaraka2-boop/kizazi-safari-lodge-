import { describe, it, expect } from "vitest";
import { csvCell } from "./csv";
import { assertOwnedPayment } from "./pi-payment-policy";
describe("payment ownership", () => {
  const p = { user_uid: "owner", direction: "user_to_app", status: { developer_approved: true, transaction_verified: true }, transaction: { txid: "actual" } };
  it("rejects approval by a different Pi user", () => expect(() => assertOwnedPayment(p, "attacker")).toThrow());
  it("rejects completion by a different Pi user", () => expect(() => assertOwnedPayment(p, "attacker", "actual")).toThrow());
  it("rejects a substituted transaction", () => expect(() => assertOwnedPayment(p, "owner", "fake")).toThrow());
  it("accepts a verified owner's transaction", () => expect(() => assertOwnedPayment(p, "owner", "actual")).not.toThrow());
  it("rejects app-to-user payments at the guest endpoint", () => expect(() => assertOwnedPayment({ ...p, direction: "app_to_user" }, "owner")).toThrow());
});
it("neutralizes CSV formulas, whitespace and control prefixes", () => {
  for (const value of ["=1+1", "+1", "-1", "@SUM(A1)", "  =1", "\t=1", "\r=1"]) expect(csvCell(value)).toBe(`"'${value}"`);
  expect(csvCell('Guest "A"')).toBe('"Guest ""A"""');
});