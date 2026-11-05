import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Gift, RefreshCw, Trash2, Wallet, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteRewardUser, dismissReward, listRewardUsers, sendPiReward, syncPaidRewardUsers } from "@/lib/rewards.functions";
import { rewardAmount } from "@/lib/reward-policy";

type RewardData = Awaited<ReturnType<typeof listRewardUsers>>;
export default function AdminPayment({ passcode }: { passcode: string }) {
  const list = useServerFn(listRewardUsers);
  const send = useServerFn(sendPiReward);
  const sync = useServerFn(syncPaidRewardUsers);
  async function syncGuests() {
    setBusy(true); setError(""); setMessage("");
    try {
      const result = await sync({ data: { passcode } });
      setMessage(`${result.recovered} paid guest accounts added.${result.unavailable ? ` ${result.unavailable} payments could not be verified.` : ""}`);
      await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not recover paid guests."); }
    finally { setBusy(false); }
  }
  const [data, setData] = useState<RewardData | null>(null);
  const [amount, setAmount] = useState("");
  const [uid, setUid] = useState("");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [confirming, setConfirming] = useState(false);
  const removeUser = useServerFn(deleteRewardUser);
  const dismiss = useServerFn(dismissReward);
  async function onDelete() {
    if (!selected || !window.confirm(`Delete @${selected.username} from the reward list?`)) return;
    setBusy(true); setError(""); setMessage("");
    try { await removeUser({ data: { passcode, uid: selected.uid } }); setUid(""); setMessage(`@${selected.username} deleted.`); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not delete user."); }
    finally { setBusy(false); await refresh(); }
  }
  async function onDismiss() {
    if (!active || !window.confirm("Dismiss this stuck reward? Only do this if no payment appears in the app wallet history.")) return;
    setBusy(true); setError(""); setMessage("");
    try { await dismiss({ data: { passcode, id: active.id } }); setRequestId(null); setMessage("Stuck reward dismissed. You can send a new reward."); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not dismiss reward."); }
    finally { setBusy(false); await refresh(); }
  }
  const [requestId, setRequestId] = useState<string | null>(null);
  async function refresh() {
    try { setData(await list({ data: { passcode } })); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not load users."); }
  }
  useEffect(() => { void refresh(); }, [passcode]);
  const active = data?.rewards.find(r => r.status !== "completed" && r.status !== "dismissed");
  const selected = data?.users.find(u => u.uid === uid);
  async function payout(resume = false) {
    const recipient = resume && active ? active.user_uid : uid;
    const value = resume && active ? String(active.amount) : amount;
    const id = resume && active ? active.id : requestId ?? crypto.randomUUID();
    setRequestId(id); setBusy(true); setError(""); setMessage("");
    try {
      const result = await send({ data: { passcode, uid: recipient, amount: value, requestId: id } });
      setMessage(`Reward completed · ${result.amount} test-π · Transaction: ${result.txid}`);
      setRequestId(null); setConfirming(false); setAmount("");
    } catch (e) { setError(e instanceof Error ? e.message : "Reward needs review. Do not create another payment."); setRequestId(null); setConfirming(false); }
    finally { setBusy(false); await refresh(); }
  }
  return <section className="mx-auto max-w-6xl border-t border-sand-50/20 py-8 text-sand-50 space-y-5">
    <div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-display text-2xl">Pi user rewards</h2><p className="text-sm text-sand-50/60 mt-2">Testnet only · Paid from the app wallet · Not KST</p></div>
      <Button variant="ghost" onClick={() => void refresh()} aria-label="Refresh reward users" title="Refresh reward users"><RefreshCw /></Button></div>
    <div className="flex flex-wrap items-center gap-3"><p>{data?.users.length ?? 0} Pi guest accounts</p><Button variant="ghost" disabled={busy} onClick={() => void syncGuests()}><RefreshCw />Recover paid guests</Button></div>
    <p className="flex items-center gap-2 text-sm"><Wallet />{data?.configured ? "Testnet reward wallet connected" : "Testnet reward wallet not connected"}</p>
    <input aria-label="Search Pi usernames" placeholder="Search Pi username" value={search} onChange={e => setSearch(e.target.value)} className="w-full max-w-sm border border-sand-50/20 bg-earth-800 rounded-md p-3" />
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="space-y-2">Pi username<select aria-label="Pi username" value={uid} onChange={e => {setUid(e.target.value); setConfirming(false);}} disabled={busy || Boolean(active)} className="block w-full border border-sand-50/20 bg-earth-800 rounded-md p-3"><option value="">Select user</option>{data?.users.filter(u => u.username.toLowerCase().includes(search.toLowerCase())).map(u => <option key={u.uid} value={u.uid}>{u.identity_source === "payment" ? u.username : `@${u.username}`}</option>)}</select>{selected && <Button type="button" variant="ghost" disabled={busy} onClick={() => void onDelete()}><Trash2 />Delete {selected.identity_source === "payment" ? selected.username : `@${selected.username}`}</Button>}</label>
      <label className="space-y-2">Amount (test-π)<input aria-label="Reward amount" inputMode="decimal" value={amount} onChange={e => {setAmount(e.target.value); setConfirming(false);}} disabled={busy || Boolean(active)} placeholder="0.0000000" className="block w-full border border-sand-50/20 bg-earth-800 rounded-md p-3" /></label>
    </div>
    {data?.users.length === 0 && <p className="text-sm text-sand-50/60">No verified Pi users yet.</p>}
    {selected && !selected.wallet_permission_verified_at && <p role="status" className="text-sm">{selected.identity_source === "payment" ? "Username verification and wallet consent pending." : "Wallet consent pending."} Ask this guest to sign in again in Pi Browser and allow wallet-address access.</p>}
    {confirming ? <div className="space-y-3 border-t border-sand-50/20 pt-4"><p>Send {amount} test-π to @{selected?.username}?</p><div className="flex flex-wrap gap-2"><Button disabled={busy} onClick={() => void payout()}><Gift />{busy ? "Sending…" : "Confirm reward"}</Button><Button variant="ghost" disabled={busy} onClick={() => setConfirming(false)}>Cancel</Button></div></div> : <Button disabled={!data?.configured || !selected || !rewardAmount.safeParse(amount).success || busy || Boolean(active)} onClick={() => setConfirming(true)}><Gift />Send reward</Button>}
    {active && <div className="space-y-3"><p>Unfinished reward: {active.amount} test-π · {active.status}</p>{active.error_message && <p className="text-sm">{active.error_message}</p>}<Button disabled={busy || !data?.configured} onClick={() => void payout(true)}><RefreshCw />{busy ? "Checking…" : "Reconcile reward"}</Button>{active.status === "review" && active.error_code === "wallet_permission_required" && !active.payment_id && !active.txid && <Button variant="ghost" disabled={busy} onClick={() => void onDismiss()}><XCircle />Dismiss rejected reward</Button>}</div>}
    {error && <p role="alert" className="text-destructive">{error}</p>}
    {message && <p role="status" className="break-all">{message}</p>}
    <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead><tr><th className="py-3">Username</th><th>Amount (test-π)</th><th>Status</th><th>Transaction</th></tr></thead><tbody>{data?.rewards.map(r => <tr key={r.id} className="border-t border-sand-50/15"><td className="py-3">@{data.users.find(u => u.uid === r.user_uid)?.username ?? "Verified user"}</td><td>{r.amount}</td><td>{r.status}</td><td className="max-w-48 break-all">{r.txid ?? "—"}</td></tr>)}</tbody></table></div>
  </section>;
}
