import { useEffect, useState } from "react";

export const PI_APP_URL = "https://kizazilodgeuqc0446.pinet.com";
export const WRONG_DOMAIN_EVENT = "kizazi:wrong-domain";

export type WrongDomainReason =
  | "wrong-host"
  | "wrong-origin"
  | "missing-pi-sdk"
  | "validation-key-missing"
  | "validation-key-mismatch";

export type WrongDomainDetail = {
  reason?: WrongDomainReason;
  message?: string;
  currentOrigin?: string;
  expectedOrigin?: string;
};

export function isPiAppDomain(): boolean {
  if (typeof window === "undefined") return true;
  return /(^|\.)pinet\.com$/i.test(window.location.hostname);
}

export function dispatchWrongDomain(detail: WrongDomainDetail = {}) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<WrongDomainDetail>(WRONG_DOMAIN_EVENT, { detail }),
    );
  }
}

type Variant = {
  badge: string;
  title: string;
  headerClass: string;
  body: (host: string) => JSX.Element;
};

function buildVariant(detail: WrongDomainDetail): Variant {
  const reason = detail.reason;

  if (reason === "validation-key-missing") {
    return {
      badge: "Validation key haipatikani",
      title: "Namba 8 haijakamilika",
      headerClass: "bg-amber-600 text-white",
      body: () => (
        <>
          <p>
            Faili <code className="bg-earth-900/5 px-1.5 py-0.5 rounded text-xs">/validation-key.txt</code>{" "}
            <b>haipatikani</b> kwenye origin hii. Pi Developer Portal
            (<b>Namba 8 – Domain Verification</b>) inahitaji faili hilo lipatikane kwenye URL rasmi
            kabla <code className="bg-earth-900/5 px-1 py-0.5 rounded text-xs">Pi.createPayment()</code> haijaruhusiwa.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Fungua Developer Portal → <b>Namba 8: Domain Verification</b>.</li>
            <li>Nakili validation key upya, iweke kwenye <code>public/validation-key.txt</code>.</li>
            <li>Deploy tena kisha bonyeza <b>Verify</b> kwenye Developer Portal.</li>
          </ul>
        </>
      ),
    };
  }

  if (reason === "validation-key-mismatch") {
    return {
      badge: "Validation key haifanani",
      title: "Namba 8 – key imepitwa na wakati",
      headerClass: "bg-amber-600 text-white",
      body: () => (
        <>
          <p>
            Key iliyopo kwenye <code className="bg-earth-900/5 px-1.5 py-0.5 rounded text-xs">/validation-key.txt</code>{" "}
            <b>haifanani</b> na iliyosajiliwa kwenye Pi Developer Portal (Namba 8).
            Pi Network imekataa kuanzisha muamala.
          </p>
          <ol className="list-decimal pl-5 space-y-1 text-xs">
            <li>Rudi Developer Portal → <b>Namba 8 – Domain Verification</b>.</li>
            <li>Bonyeza <b>Regenerate / Copy</b> validation key mpya.</li>
            <li>Ibandike kwenye <code>public/validation-key.txt</code>, deploy, kisha <b>Verify</b>.</li>
          </ol>
        </>
      ),
    };
  }

  if (reason === "missing-pi-sdk") {
    return {
      badge: "Pi SDK haijapatikana",
      title: "Fungua kwenye Pi Browser",
      headerClass: "bg-earth-900 text-sand-50",
      body: () => (
        <p>
          <code className="bg-earth-900/5 px-1.5 py-0.5 rounded text-xs">window.Pi</code>{" "}
          haijapakia. Malipo yanahitaji <b>Pi Browser</b> kwenye Testnet mode.
        </p>
      ),
    };
  }

  return {
    badge: "Malipo hayaruhusiwi hapa",
    title: "Domain isiyo sahihi",
    headerClass: "bg-red-600 text-white",
    body: (host) => (
      <>
        <p>
          Uko kwenye <code className="bg-earth-900/5 px-1.5 py-0.5 rounded text-xs">{host}</code>.
          Pi Network inaruhusu <b>miamala ya Pi</b> tu kwenye domain rasmi ya <b>pinet.com</b>.
        </p>
        <p>Fungua app kwenye <b>Pi Browser</b> ukitumia URL rasmi ili malipo yafanye kazi:</p>
      </>
    ),
  };
}

export function WrongDomainModal() {
  const [open, setOpen] = useState(false);
  const [host, setHost] = useState("");
  const [detail, setDetail] = useState<WrongDomainDetail>({});

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<WrongDomainDetail>;
      setHost(window.location.hostname);
      setDetail(ce.detail ?? {});
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

  const variant = buildVariant(detail);
  const isKeyIssue =
    detail.reason === "validation-key-missing" ||
    detail.reason === "validation-key-mismatch";

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
        <div className={`px-6 py-4 ${variant.headerClass}`}>
          <div className="text-[10px] uppercase tracking-widest opacity-80">
            {variant.badge}
          </div>
          <h2 className="font-display italic text-xl">{variant.title}</h2>
        </div>

        <div className="px-6 py-5 text-sm space-y-3">
          {variant.body(host)}

          {detail.message && (
            <div className="bg-earth-900/5 border-l-4 border-earth-900/40 text-earth-900 p-3 text-xs rounded">
              <b>Sababu:</b> {detail.message}
            </div>
          )}

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
            {isKeyIssue ? (
              <>
                Kidokezo: baada ya ku-deploy key mpya, rudi Developer Portal
                → <b>Namba 8</b> → bonyeza <b>Verify</b> kabla ujaribu tena kulipa.
              </>
            ) : (
              <>
                Kidokezo: Fungua <b>Pi Browser</b> → bandika URL hapo juu →
                Sign in with Pi → jaribu tena kulipa.
              </>
            )}
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
