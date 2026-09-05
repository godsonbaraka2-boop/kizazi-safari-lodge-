import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { listBookings, updateBookingStatus } from "@/lib/bookings.functions";
import {
  activateWallets,
  getWalletFunding,
  getWalletSecretStatus,
  mintKizaziToken,
  saveWalletSecrets,
} from "@/lib/token.functions";


export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Bookings Admin — Kizazi Safari Lodge" },
      {
        name: "description",
        content:
          "Private admin panel for Kizazi Safari Lodge staff to review guest bookings paid with Pi.",
      },
      { property: "og:title", content: "Bookings Admin — Kizazi Safari Lodge" },
      {
        property: "og:description",
        content: "Staff-only booking dashboard for Kizazi Safari Lodge.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Admin,
});

type Booking = {
  id: string;
  confirmation_code: string;
  guest_name: string;
  phone: string;
  check_in: string;
  check_out: string;
  nights: number;
  guests: number;
  room: string;
  price_per_night: number;
  total_pi: number;
  payment_id: string | null;
  txid: string | null;
  status: string;
  notes: string | null;
  created_at: string;
};

const STATUSES = ["paid", "checked-in", "cancelled"] as const;

function toCsv(rows: Booking[]) {
  const headers = [
    "confirmation_code",
    "guest_name",
    "phone",
    "room",
    "check_in",
    "check_out",
    "nights",
    "guests",
    "price_per_night",
    "total_pi",
    "status",
    "payment_id",
    "txid",
    "notes",
    "created_at",
  ] as const;
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => esc(r[h])).join(",")),
  ].join("\n");
}

function Admin() {
  const fetchBookings = useServerFn(listBookings);
  const setStatus = useServerFn(updateBookingStatus);
  const mintToken = useServerFn(mintKizaziToken);
  const saveKeys = useServerFn(saveWalletSecrets);
  const checkKeys = useServerFn(getWalletSecretStatus);
  const [passcode, setPasscode] = useState("");
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [minting, setMinting] = useState(false);
  const [mintTxId, setMintTxId] = useState<string | null>(null);
  const [mintError, setMintError] = useState<string | null>(null);
  const [issuerKey, setIssuerKey] = useState("");
  const [distributorKey, setDistributorKey] = useState("");
  const [keysSaved, setKeysSaved] = useState(false);
  const [savingKeys, setSavingKeys] = useState(false);
  const [keysError, setKeysError] = useState<string | null>(null);
  const [keysMessage, setKeysMessage] = useState<string | null>(null);
  const checkFunding = useServerFn(getWalletFunding);
  const [funding, setFunding] = useState<
    | {
        required: number;
        issuer: { publicKey: string; exists: boolean; balance: number };
        distributor: { publicKey: string; exists: boolean; balance: number };
        hasTrustline: boolean;
        kstBalance: string;
        ready: boolean;
      }
    | null
  >(null);
  const [fundingLoading, setFundingLoading] = useState(false);
  const [fundingError, setFundingError] = useState<string | null>(null);
  const activate = useServerFn(activateWallets);
  const [fundingSecret, setFundingSecret] = useState("");
  const [activating, setActivating] = useState(false);
  const [activateError, setActivateError] = useState<string | null>(null);
  const [activateMessage, setActivateMessage] = useState<string | null>(null);

  const handleActivate = async () => {
    setActivating(true);
    setActivateError(null);
    setActivateMessage(null);
    try {
      const res = await activate({
        data: { passcode: passcode.trim(), fundingSecret: fundingSecret.trim() },
      });
      if (res.ok) {
        setActivateMessage(res.message);
        setFundingSecret("");
        await handleCheckFunding();
      } else {
        setActivateError(res.error ?? "Could not activate the wallets.");
      }
    } catch {
      setActivateError("Could not activate the wallets. Please try again.");
    } finally {
      setActivating(false);
    }
  };
  const refreshKeyStatus = async (code: string) => {
    try {
      const res = await checkKeys({ data: { passcode: code } });
      setKeysSaved(Boolean(res.ok && res.issuer && res.distributor));
    } catch {
      setKeysSaved(false);
    }
  };

  const handleSaveKeys = async () => {
    setSavingKeys(true);
    setKeysError(null);
    setKeysMessage(null);
    const issuer = issuerKey.trim();
    const distributor = distributorKey.trim();
    if (!/^S[A-Z2-7]{55}$/.test(issuer) || !/^S[A-Z2-7]{55}$/.test(distributor)) {
      setKeysError("Both keys must start with S and be 56 characters long.");
      setSavingKeys(false);
      return;
    }
    try {
      const res = await saveKeys({
        data: { passcode: passcode.trim(), issuerSecret: issuer, distributorSecret: distributor },
      });
      if (res.ok) {
        setKeysSaved(true);
        setIssuerKey("");
        setDistributorKey("");
        setKeysMessage("Both wallet keys are saved securely on the backend.");
      } else {
        setKeysError(res.error ?? "Could not save the keys.");
      }
    } catch {
      setKeysError("Could not save the keys. Please try again.");
    } finally {
      setSavingKeys(false);
    }
  };

  const handleMint = async () => {
    setMinting(true);
    setMintError(null);
    setMintTxId(null);
    try {
      const res = await mintToken({ data: { passcode: passcode.trim() } });
      if (res.ok) setMintTxId(res.alreadyMinted ? "already" : res.txId);
      else setMintError(res.error ?? "Minting failed.");
    } catch {
      setMintError("Minting failed. Please try again.");
    } finally {
      setMinting(false);
    }
  };

  const handleCheckFunding = async () => {
    setFundingLoading(true);
    setFundingError(null);
    try {
      const res = await checkFunding({ data: { passcode: passcode.trim() } });
      if (!res.ok) {
        setFundingError(res.error ?? "Could not check wallet funding.");
        setFunding(null);
      } else {
        setFunding(res);
      }
    } catch {
      setFundingError("Could not check wallet funding. Please try again.");
      setFunding(null);
    } finally {
      setFundingLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text);
  };


  const load = async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchBookings({ data: { passcode: code } });
      if (!res.ok) {
        setError("Wrong passcode.");
        setBookings(null);
      } else {
        setBookings(res.bookings as Booking[]);
        void refreshKeyStatus(code);
      }
    } catch {
      setError("Could not load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (bookings ?? []).filter((b) => {
      if (
        q &&
        !`${b.confirmation_code} ${b.guest_name} ${b.phone} ${b.room}`.toLowerCase().includes(q)
      )
        return false;
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (fromDate && b.check_in < fromDate) return false;
      if (toDate && b.check_in > toDate) return false;
      return true;
    });
  }, [bookings, search, statusFilter, fromDate, toDate]);

  const totalPi = filtered.reduce((s, b) => s + Number(b.total_pi ?? 0), 0);

  const changeStatus = async (id: string, status: string) => {
    setSavingId(id);
    try {
      const res = await setStatus({
        data: { passcode: passcode.trim(), id, status: status as (typeof STATUSES)[number] },
      });
      if (res.ok) {
        setBookings((prev) => (prev ?? []).map((b) => (b.id === id ? { ...b, status } : b)));
      } else {
        setError("Could not update status.");
      }
    } catch {
      setError("Could not update status.");
    } finally {
      setSavingId(null);
    }
  };

  const downloadCsv = () => {
    const blob = new Blob([toCsv(filtered)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kizazi-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-earth-900 text-white px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.3em] text-savannah">Staff only</p>
          <h1 className="text-3xl font-display italic">Bookings Admin</h1>
          <Link to="/" className="text-white/50 text-xs underline">
            ← Back to lodge
          </Link>
        </header>

        {bookings === null ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (passcode.trim()) void load(passcode.trim());
            }}
            className="max-w-sm space-y-4 bg-white/5 border border-white/15 rounded-2xl p-6"
          >
            <label
              htmlFor="admin-pass"
              className="block text-[10px] font-bold uppercase tracking-widest text-white/60"
            >
              Admin passcode
            </label>
            <input
              id="admin-pass"
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-savannah"
              placeholder="••••••••"
              autoComplete="current-password"
            />
            {error && <p className="text-red-300 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white py-3 rounded-xl font-bold uppercase text-xs tracking-widest transition-colors"
            >
              {loading ? "Checking…" : "Sign in"}
            </button>
          </form>
        ) : (
          <>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="bg-white/5 border border-white/15 rounded-xl px-5 py-3">
                <p className="text-white/50 text-[10px] uppercase tracking-widest">Bookings</p>
                <p className="text-xl font-bold">
                  {filtered.length}
                  <span className="text-white/40 text-xs"> / {bookings.length}</span>
                </p>
              </div>
              <div className="bg-white/5 border border-white/15 rounded-xl px-5 py-3">
                <p className="text-white/50 text-[10px] uppercase tracking-widest">Total paid</p>
                <p className="text-xl font-bold text-purple-300">{totalPi.toFixed(6)} π</p>
              </div>
              <div className="ml-auto self-center flex gap-2">
                <button
                  type="button"
                  onClick={downloadCsv}
                  className="text-xs uppercase tracking-widest border border-white/20 rounded-xl px-4 py-3 hover:bg-white/10"
                >
                  Download CSV
                </button>
                <button
                  type="button"
                  onClick={() => void load(passcode.trim())}
                  className="text-xs uppercase tracking-widest border border-white/20 rounded-xl px-4 py-3 hover:bg-white/10"
                >
                  {loading ? "Refreshing…" : "Refresh"}
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search code, guest, phone, room"
                className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-savannah"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-savannah"
              >
                <option className="bg-earth-900" value="all">
                  All statuses
                </option>
                {STATUSES.map((s) => (
                  <option className="bg-earth-900" key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2 bg-white/5 border border-white/15 rounded-xl px-4 py-2 text-xs text-white/60">
                Check-in from
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="bg-transparent text-white text-sm flex-1 focus:outline-none"
                />
              </label>
              <label className="flex items-center gap-2 bg-white/5 border border-white/15 rounded-xl px-4 py-2 text-xs text-white/60">
                to
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="bg-transparent text-white text-sm flex-1 focus:outline-none"
                />
              </label>
            </div>

            {error && <p className="text-red-300 text-xs">{error}</p>}

            <section className="bg-white/5 border border-white/15 rounded-2xl p-6 space-y-3">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.3em] text-savannah">
                  Pi Testnet token
                </p>
                <h2 className="text-lg font-display italic">Kizazi Safari Token (KST)</h2>
                <p className="text-white/60 text-xs max-w-xl">
                  Minting runs in three steps: first the distributor wallet is funded with at least
                  2 XLM on Pi Testnet, then the trustline to the issuer is created, then
                  1,000,000,000 KST is minted to the distributor. Wallet keys stay on the backend.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleSaveKeys();
                }}
                className="grid gap-3 sm:grid-cols-2 border-t border-white/10 pt-4"
              >
                <div className="space-y-1">
                  <label
                    htmlFor="issuer-secret"
                    className="block text-[10px] font-bold uppercase tracking-widest text-white/60"
                  >
                    PI_ISSUER_SECRET
                  </label>
                  <input
                    id="issuer-secret"
                    type="password"
                    value={issuerKey}
                    onChange={(e) => setIssuerKey(e.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="S…"
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-savannah"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="distributor-secret"
                    className="block text-[10px] font-bold uppercase tracking-widest text-white/60"
                  >
                    PI_DISTRIBUTOR_SECRET
                  </label>
                  <input
                    id="distributor-secret"
                    type="password"
                    value={distributorKey}
                    onChange={(e) => setDistributorKey(e.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="S…"
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-savannah"
                  />
                </div>
                <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={savingKeys}
                    className="inline-flex items-center gap-2 border border-white/20 hover:bg-white/10 disabled:opacity-60 text-white px-5 py-3 rounded-xl font-bold uppercase text-xs tracking-widest transition-colors"
                  >
                    {savingKeys ? "Saving…" : "Save keys securely"}
                  </button>
                  <span
                    className={`text-xs ${keysSaved ? "text-green-300" : "text-white/50"}`}
                  >
                    {keysSaved ? "Both keys configured ✓" : "Keys not configured yet"}
                  </span>
                </div>
                {keysError && <p className="sm:col-span-2 text-red-300 text-xs">{keysError}</p>}
                {keysMessage && (
                  <p className="sm:col-span-2 text-green-300 text-xs">{keysMessage}</p>
                )}
              </form>

              <div className="border-t border-white/10 pt-4 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => void handleCheckFunding()}
                    disabled={fundingLoading || !keysSaved}
                    className="inline-flex items-center gap-2 border border-white/20 hover:bg-white/10 disabled:opacity-60 text-white px-5 py-3 rounded-xl font-bold uppercase text-xs tracking-widest transition-colors"
                  >
                    {fundingLoading && (
                      <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    )}
                    {fundingLoading ? "Checking…" : "Check wallet funding"}
                  </button>
                  <span className="text-white/50 text-xs">
                    Pi Testnet has no faucet — fund these addresses from your Pi Testnet wallet.
                  </span>
                </div>

                {fundingError && <p className="text-red-300 text-xs">{fundingError}</p>}

                {funding && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="bg-white/5 border border-white/15 rounded-xl p-4 space-y-2">
                      <p className="text-[10px] uppercase tracking-widest text-white/50">Issuer wallet</p>
                      <p className="text-xs text-white/80">Needs ≥1 test-Pi to be activated.</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono break-all text-savannah flex-1">
                          {funding.issuer.publicKey}
                        </code>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(funding.issuer.publicKey)}
                          className="text-[10px] uppercase tracking-widest border border-white/20 rounded-lg px-2 py-1 hover:bg-white/10"
                        >
                          Copy
                        </button>
                      </div>
                      <p className="text-xs">
                        Balance: <span className={funding.issuer.exists ? "text-green-300" : "text-red-300"}>
                          {funding.issuer.balance.toFixed(6)} XLM
                        </span>
                        {funding.issuer.exists ? " ✓ activated" : " ✗ not activated"}
                      </p>
                    </div>

                    <div className="bg-white/5 border border-white/15 rounded-xl p-4 space-y-2">
                      <p className="text-[10px] uppercase tracking-widest text-white/50">Distributor wallet</p>
                      <p className="text-xs text-white/80">Needs ≥{funding.required} test-Pi before trustline + mint.</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono break-all text-savannah flex-1">
                          {funding.distributor.publicKey}
                        </code>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(funding.distributor.publicKey)}
                          className="text-[10px] uppercase tracking-widest border border-white/20 rounded-lg px-2 py-1 hover:bg-white/10"
                        >
                          Copy
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white/5 border border-white/10 rounded-lg p-2">
                          <p className="text-[10px] uppercase tracking-widest text-white/50">XLM balance</p>
                          <p className={`text-sm font-bold ${funding.distributor.balance >= funding.required ? "text-green-300" : "text-red-300"}`}>
                            {funding.distributor.balance.toFixed(6)}
                          </p>
                          <p className="text-[10px] text-white/50">
                            {funding.distributor.balance >= funding.required ? "✓ ready" : `need ${(funding.required - funding.distributor.balance).toFixed(6)} more`}
                          </p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-lg p-2">
                          <p className="text-[10px] uppercase tracking-widest text-white/50">KST balance</p>
                          <p className="text-sm font-bold text-purple-300">
                            {Number(funding.kstBalance).toLocaleString()}
                          </p>
                          <p className="text-[10px] text-white/50">
                            {funding.hasTrustline ? "✓ trustline exists" : "✗ no trustline"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-3">
                <p className="text-[10px] uppercase tracking-widest text-white/50">
                  Activate wallets on Pi Testnet
                </p>
                <p className="text-xs text-white/70 leading-relaxed">
                  If your Pi Testnet wallet says{" "}
                  <span className="text-red-300">"The recipient's address does not exist"</span>, it is
                  because a brand-new Testnet address must first be <em>created</em> on-chain — the
                  wallet app cannot do that. Paste either the 24-word passphrase of your funded Pi
                  Testnet wallet (this is what Pi Browser shows you) or an S… secret key, and we will
                  create and fund both wallets for you. It is used once for this transaction and is
                  never stored.
                </p>
                <textarea
                  autoComplete="off"
                  rows={3}
                  value={fundingSecret}
                  onChange={(e) => setFundingSecret(e.target.value)}
                  placeholder="24-word passphrase of your funded Pi Testnet wallet (or S… secret key)"
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-savannah"
                />
                <button
                  type="button"
                  onClick={() => void handleActivate()}
                  disabled={
                    activating ||
                    !keysSaved ||
                    !(
                      /^S[A-Z2-7]{55}$/.test(fundingSecret.trim()) ||
                      [12, 24].includes(fundingSecret.trim().split(/\s+/).filter(Boolean).length)
                    )
                  }

                  className="inline-flex items-center gap-2 border border-savannah/60 bg-savannah/15 hover:bg-savannah/25 disabled:opacity-60 text-white px-5 py-3 rounded-xl font-bold uppercase text-xs tracking-widest transition-colors"
                >
                  {activating && (
                    <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  )}
                  {activating ? "Activating…" : "Create & fund wallets"}
                </button>
                {activateError && <p className="text-red-300 text-xs">{activateError}</p>}
                {activateMessage && <p className="text-green-300 text-xs">{activateMessage}</p>}
              </div>



              <button
                type="button"
                onClick={() => void handleMint()}
                disabled={minting || !keysSaved}
                title={keysSaved ? undefined : "Save both wallet keys first"}
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest transition-colors"
              >
                {minting && (
                  <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                )}
                {minting ? "Minting…" : "Mint Kizazi Token Now"}
              </button>
              {mintTxId === "already" && (
                <p className="text-green-300 text-xs font-bold">
                  Already minted — the distributor wallet holds the full 1,000,000,000 KST supply.
                  No new transaction was needed.
                </p>
              )}
              {mintTxId && mintTxId !== "already" && (
                <div className="text-xs space-y-1">
                  <p className="text-green-300 font-bold">Success! Token minted.</p>
                  <p className="text-white/70">
                    Transaction ID: <span className="font-mono break-all">{mintTxId}</span>
                  </p>
                </div>
              )}
              {mintError && <p className="text-red-300 text-xs">{mintError}</p>}
            </section>



            {filtered.length === 0 ? (
              <p className="text-white/60 text-sm">No bookings match your filters.</p>
            ) : (
              <div className="overflow-x-auto border border-white/15 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/10 text-white/70 uppercase tracking-widest text-[10px]">
                    <tr>
                      <th className="px-3 py-3">Code</th>
                      <th className="px-3 py-3">Guest</th>
                      <th className="px-3 py-3">Phone</th>
                      <th className="px-3 py-3">Room</th>
                      <th className="px-3 py-3">Check-in</th>
                      <th className="px-3 py-3">Check-out</th>
                      <th className="px-3 py-3">Nights</th>
                      <th className="px-3 py-3">Guests</th>
                      <th className="px-3 py-3">Total π</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((b) => (
                      <tr key={b.id} className="border-t border-white/10">
                        <td className="px-3 py-3 font-mono text-purple-300">
                          {b.confirmation_code}
                        </td>
                        <td className="px-3 py-3">{b.guest_name}</td>
                        <td className="px-3 py-3">
                          <a
                            href={`https://wa.me/${b.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                          >
                            {b.phone}
                          </a>
                        </td>
                        <td className="px-3 py-3">{b.room}</td>
                        <td className="px-3 py-3">{b.check_in}</td>
                        <td className="px-3 py-3">{b.check_out}</td>
                        <td className="px-3 py-3">{b.nights}</td>
                        <td className="px-3 py-3">{b.guests}</td>
                        <td className="px-3 py-3">{Number(b.total_pi).toFixed(6)}</td>
                        <td className="px-3 py-3">
                          <select
                            value={b.status}
                            disabled={savingId === b.id}
                            onChange={(e) => void changeStatus(b.id, e.target.value)}
                            className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-xs text-white focus:outline-none disabled:opacity-50"
                          >
                            {STATUSES.map((s) => (
                              <option className="bg-earth-900" key={s} value={s}>
                                {s}
                              </option>
                            ))}
                            {!STATUSES.includes(b.status as (typeof STATUSES)[number]) && (
                              <option className="bg-earth-900" value={b.status}>
                                {b.status}
                              </option>
                            )}
                          </select>
                        </td>
                        <td className="px-3 py-3 text-white/50">
                          {new Date(b.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
