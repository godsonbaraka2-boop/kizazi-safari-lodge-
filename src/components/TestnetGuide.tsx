import { useEffect, useState } from "react";

const DISMISS_KEY = "kizazi_testnet_guide_dismissed_v1";
const PI_BROWSER_URL = "https://minepi.com/pi-browser";
const APP_URL = "https://kizazi-safari-lodge.vercel.app";

function isPiBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /PiBrowser/i.test(ua) || typeof (window as unknown as { Pi?: unknown }).Pi !== "undefined";
}

export function TestnetGuide() {
  const [open, setOpen] = useState(false);
  const [inPi, setInPi] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    const pi = isPiBrowser();
    setInPi(pi);
    if (!dismissed) setOpen(true);
  }, []);

  const close = (remember: boolean) => {
    if (remember) localStorage.setItem(DISMISS_KEY, "1");
    setOpen(false);
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(APP_URL);
      alert("App URL copied — paste it in Pi Browser address bar.");
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      {/* Floating help button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Testnet payment guide"
        className="fixed bottom-5 right-5 z-40 bg-savannah text-sand-50 rounded-full shadow-lg px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-savannah/90 transition-colors"
      >
        Testnet Guide
      </button>

      {!open ? null : (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-earth-900/70 backdrop-blur-sm p-0 sm:p-4"
          onClick={() => close(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-sand-50 text-earth-900 w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="px-6 py-4 bg-savannah text-sand-50 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-widest opacity-80">
                  Pi Developer Portal
                </div>
                <h2 className="font-display italic text-xl">
                  Step 10 — Make a Test Payment
                </h2>
              </div>
              <button
                onClick={() => close(false)}
                aria-label="Close"
                className="text-sand-50/90 hover:text-sand-50 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-5 overflow-y-auto text-sm space-y-4">
              {!inPi && (
                <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-900 p-3 text-xs rounded">
                  <b>Onyo:</b> Umefungua kwenye browser ya kawaida. Malipo ya Pi
                  <b> hayafanyi kazi</b> hapa. Fungua ndani ya <b>Pi Browser</b>.
                </div>
              )}

              <ol className="space-y-3 list-decimal list-inside">
                <li>
                  <b>Pakua Pi Browser</b> kwenye simu yako kama huja isakinisha.
                  <div className="mt-1">
                    <a
                      href={PI_BROWSER_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="text-savannah underline text-xs"
                    >
                      minepi.com/pi-browser →
                    </a>
                  </div>
                </li>
                <li>
                  Fungua <b>Pi Browser</b> → ingia kwa akaunti yako ya Pi.
                </li>
                <li>
                  Nenda kwenye <b>Profile → Settings → Pi Apps Sandbox</b> na
                  <b> washa "Enable Sandbox / Testnet"</b>.
                </li>
                <li>
                  Rudi Pi Browser, kwenye address bar andika (au bandika) URL
                  ya app:
                  <div className="mt-1 flex gap-2 items-center">
                    <code className="bg-earth-900/5 px-2 py-1 rounded text-[11px] break-all flex-1">
                      {APP_URL}
                    </code>
                    <button
                      onClick={copyUrl}
                      className="text-[10px] uppercase tracking-widest bg-savannah text-sand-50 px-2 py-1 rounded"
                    >
                      Copy
                    </button>
                  </div>
                </li>
                <li>
                  Ndani ya app, bonyeza <b>"Sign in with Pi"</b> na kubali
                  ruhusa (<i>username</i>, <i>payments</i>).
                </li>
                <li>
                  Nenda sehemu ya <b>Book Your Stay</b>, chagua tarehe, weka
                  jina + simu, kisha bonyeza <b>"PAY WITH PI"</b>.
                </li>
                <li>
                  Dirisha la Pi litafunguka. Bonyeza <b>Confirm</b> ili kutuma
                  Test-π (hii ni sarafu ya majaribio, sii halisi).
                </li>
                <li>
                  Ukiona <b>"Booking Confirmed! Code: KIZ-XXXX"</b>, malipo
                  yamefaulu. Rudi <b>Pi Developer Portal</b> → bonyeza
                  <b> "Verify"</b> kwenye Step 10 — itaonekana ✅.
                </li>
              </ol>

              <div className="bg-earth-900/5 rounded p-3 text-xs space-y-1">
                <div className="font-bold uppercase tracking-widest text-[10px] text-savannah">
                  Kama malipo yanashindwa
                </div>
                <ul className="list-disc list-inside space-y-1">
                  <li>Hakikisha "Sandbox / Testnet" imewashwa kwenye Pi Browser.</li>
                  <li>Akaunti yako ya Testnet inahitaji Test-π — omba faucet kwenye Developer Portal.</li>
                  <li>Hakikisha umeingia (Sign in with Pi) kabla ya kubonyeza PAY.</li>
                  <li>Fungua tena app baada ya kuwasha Sandbox.</li>
                </ul>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-earth-900/10 flex gap-2 justify-end">
              <button
                onClick={() => close(true)}
                className="text-xs uppercase tracking-widest px-3 py-2 text-earth-900/70 hover:text-earth-900"
              >
                Usionyeshe tena
              </button>
              <button
                onClick={() => close(false)}
                className="text-xs uppercase tracking-widest bg-savannah text-sand-50 px-4 py-2 rounded-full hover:bg-savannah/90"
              >
                Nimeelewa
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
