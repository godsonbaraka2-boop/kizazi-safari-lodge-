import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Kizazi Safari Lodge" },
      {
        name: "description",
        content:
          "Kizazi Safari Lodge privacy policy. Learn how we collect, use, and protect your personal information.",
      },
      { property: "og:title", content: "Privacy Policy — Kizazi Safari Lodge" },
      {
        property: "og:description",
        content:
          "Kizazi Safari Lodge privacy policy. Learn how we collect, use, and protect your personal information.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-sand-50 text-earth-900 font-sans">
      <header className="bg-earth-900 text-white px-6 py-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="text-sm font-bold uppercase tracking-widest hover:text-savannah transition-colors"
          >
            ← Back to Kizazi Lodge
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-display italic mb-4">
            Privacy Policy
          </h1>
          <p className="text-earth-900/60 text-sm">Kizazi Safari Lodge</p>
        </div>

        <section className="prose prose-earth max-w-none">
          <p className="text-lg leading-relaxed mb-6">
            Tunakusanya: Jina, Email, Phone Number, na maelezo ya malipo ya Pi kwa ajili ya booking tu.
          </p>
          <p className="text-lg leading-relaxed mb-6">
            Data yako hatuitumii kwa wengine. Inahifadhiwa kwa usalama.
          </p>
          <p className="text-lg leading-relaxed mb-12">
            Kwa maswali: {" "}
            <a
              href="mailto:godsonbaraka2@gmail.com"
              className="text-savannah underline hover:text-savannah-dark"
            >
              godsonbaraka2@gmail.com
            </a>
          </p>
        </section>

        <div className="border-t border-earth-900/10 pt-10">
          <h2 className="text-xl font-bold mb-4">Contact Developer</h2>
          <div className="space-y-2 text-sm text-earth-900/70">
            <p>
              Email: {" "}
              <a
                href="mailto:godsonbaraka2@gmail.com"
                className="text-savannah underline hover:text-savannah-dark"
              >
                godsonbaraka2@gmail.com
              </a>
            </p>
            <p>
              Phone/WhatsApp: {" "}
              <a
                href="tel:+255654617865"
                className="text-savannah underline hover:text-savannah-dark"
              >
                +255 654 617 865
              </a>
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-earth-900 text-white px-6 py-8">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-white/30 tracking-widest uppercase">
          <p>© {new Date().getFullYear()} Kizazi Safari Lodge · Tanzania</p>
          <a
            href="https://github.com/godsonbaraka2-boop/kizazi-safari-lodge-"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/60 transition-colors"
          >
            Source code managed on Lovable platform
          </a>
        </div>
      </footer>
    </div>
  );
}
