import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { listBookings, updateBookingStatus } from "@/lib/bookings.functions";

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
  const [passcode, setPasscode] = useState("");
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

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


            {bookings.length === 0 ? (
              <p className="text-white/60 text-sm">No bookings yet.</p>
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
                    {bookings.map((b) => (
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
                        <td className="px-3 py-3">{b.status}</td>
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
