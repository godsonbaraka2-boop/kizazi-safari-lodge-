export async function verifyPiIdentity(accessToken: string): Promise<{ uid: string; username: string; walletPermission: boolean }> {
  const res = await fetch("https://api.minepi.com/v2/me", { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error("Please sign in with Pi again.");
  const user = await res.json() as { uid?: string; username?: string; wallet_address?: string };
  if (!user.uid || !user.username) throw new Error("Could not verify your Pi account.");
  return { uid: user.uid, username: user.username, walletPermission: Boolean(user.wallet_address) };
}