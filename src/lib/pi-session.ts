// Access tokens stay in memory, never in browser storage or logs.
let accessToken: string | null = null;
export const setPiAccessToken = (token: string | null) => { accessToken = token; };
export function getPiAccessToken(): string {
  if (!accessToken) throw new Error("Please sign in with Pi before making a payment.");
  return accessToken;
}