import { useEffect, useState } from "react";

export const PI_APP_URL = "https://kizazilodgeuqc0446.pinet.com";
export const WRONG_DOMAIN_EVENT = "kizazi:wrong-domain";

export function isPiAppDomain(): boolean {
  if (typeof window === "undefined") return true;
  return /(^|\.)pinet\.com$/i.test(window.location.hostname);
}

export function dispatchWrongDomain() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(WRONG_DOMAIN_EVENT));
  }
}

export function WrongDomainModal() {
  const [open, setOpen] = useState(false);
  const [host, setHost] = useState("");

  useEffect(() => {
    const handler = () => {
      setHost(window.location.hostname);
      setOpen(true);
    };
    window.addEventListener(WRONG_DOMAIN_EVENT, handler);
    return () => window.removeEventListener(WRONG_DOMAIN_EVENT, handler);
  }, []);

  const goToPiApp = () => {
    window.location.href = PI_APP_URL;
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(PI_APP_URL);
      alert("URL copied — paste it in Pi Browser address bar.");
    } catch {
      /* ignore */
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-earth-900/80 backdrop-blur-sm p-0 sm:p-4"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-sand-50 text-earth-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden"
      >
        <div className="px-6 py-4 bg-red-600 text-white">
          <div className="text-[10px] uppercase tracking-widest opacity-80">
            Malipo hayaruhusiwi hapa
          </div>
          <h2 className="font-display italic text-xl">Domain isiyo sahihi</h2>
        </div>

        <div className="px-6 py-5 text-sm space-y-3">
          <p>
            Uko kwenye <code className="bg-earth-900/5 px-1.5 py-0.5 rounded text-xs">{host}</code>.
            Pi Network inaruhusu <b>miamala ya Pi</b> tu kwenye domain rasmi ya
            <b> pinet.com</b>.
          </p>
          <p>
            Fungua app kwenye <b>Pi Browser</b> ukitumia URL rasmi ili malipo yafanye kazi:
          </p>
          <div className="flex items-center gap-2">
            <code className="bg-earth-900/5 px-2 py-1 rounded text-[11px] break-all flex-1">
              {PI_APP_URL}
            </code>
            <button
              onClick={copyUrl}
              className="text-[10px] uppercase tracking-widest bg-earth-900/10 px-2 py-1 rounded hover:bg-earth-900/20"
            >
              Copy
            </button>
          </div>
          <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-900 p-3 text-xs rounded">
            Kidokezo: Fungua <b>Pi Browser</b> → bandika URL hapo juu →
            Sign in with Pi → jaribu tena kulipa.
          </div>
        </div>

        <div className="px-6 py-4 border-t border-earth-900/10 flex gap-2 justify-end">
          <button
            onClick={() => setOpen(false)}
            className="text-xs uppercase tracking-widest px-3 py-2 text-earth-900/70 hover:text-earth-900"
          >
            Funga
          </button>
          <button
            onClick={goToPiApp}
            className="text-xs uppercase tracking-widest bg-savannah text-sand-50 px-4 py-2 rounded-full hover:bg-savannah/90"
          >
            Fungua kwenye pinet.com
          </button>
        </div>
      </div>
    </div>
  );
}
