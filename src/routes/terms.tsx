import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Kizazi Safari Lodge" },
      {
        name: "description",
        content:
          "Terms of Service for Kizazi Safari Lodge: bookings, Pi Network payments, cancellations and support contacts.",
      },
      { property: "og:title", content: "Terms of Service — Kizazi Safari Lodge" },
      {
        property: "og:description",
        content:
          "Booking, Pi payment, refund and cancellation terms for Kizazi Safari Lodge, Arusha, Tanzania.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <main className="min-h-screen bg-earth-900 text-white px-6 py-16">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-savannah">
            Kizazi Safari Lodge
          </p>
          <h1 className="mt-3 font-display text-3xl md:text-4xl">Terms of Service</h1>
          <p className="mt-2 text-xs text-white/40">
            Northern Corridor, Arusha, Tanzania
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="font-display text-xl">1. Bookings</h2>
          <p className="text-sm text-white/70 leading-relaxed">
            Rooms, meals and safari tours are reserved once payment is confirmed.
            Your booking code (format KIZ-XXXX) is your reference for check-in and
            for any support request.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl">2. Payments in Pi</h2>
          <p className="text-sm text-white/70 leading-relaxed">
            All prices are shown in Pi (π) at the Global Consensus Value benchmark.
            Payments are processed through the Pi Network SDK inside the Pi Browser.
            A payment is only valid after Pi Network reports it as completed with a
            transaction ID.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl">3. Cancellations & refunds</h2>
          <p className="text-sm text-white/70 leading-relaxed">
            Free cancellation up to 48 hours before check-in; the Pi amount is
            returned to the paying wallet. Within 48 hours, one night is retained.
            Meal and tour orders can be cancelled until preparation begins.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl">4. Guest responsibilities</h2>
          <p className="text-sm text-white/70 leading-relaxed">
            Guests are asked to follow wildlife-safety instructions from lodge
            guides at all times, and to respect local communities and park
            regulations during tours.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl">5. Support & contact</h2>
          <p className="text-sm text-white/70 leading-relaxed">
            Email:{" "}
            <a className="text-savannah underline" href="mailto:godsonbaraka2@gmail.com">
              godsonbaraka2@gmail.com
            </a>
            <br />
            Phone / WhatsApp:{" "}
            <a className="text-savannah underline" href="https://wa.me/255654617865">
              +255 654 617 865
            </a>
          </p>
        </section>

        <div className="flex gap-4 pt-4 text-xs uppercase tracking-widest">
          <Link to="/" className="text-savannah hover:text-white transition-colors">
            ← Back home
          </Link>
          <Link
            to="/privacy-policy"
            className="text-white/50 hover:text-white transition-colors"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </main>
  );
}
