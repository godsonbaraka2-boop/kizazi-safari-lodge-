import { z } from "zod";
export const rewardAmount = z.string().regex(/^(0|[1-9]\d{0,11})(\.\d{1,7})?$/, "Use up to seven decimal places.").refine(v => Number(v) > 0, "Amount must be greater than zero.");
export function assertTestnet(network: string) {
  if (network !== "Pi Testnet") throw new Error("Pi app-to-user rewards are currently supported on Testnet only.");
}