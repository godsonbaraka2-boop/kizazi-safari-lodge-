import { expect, it } from "vitest";
import { rewardAmount, assertTestnet } from "./reward-policy";
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