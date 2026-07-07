// Pi domain discovery/validation utilities.
// Runs BEFORE Pi.createPayment() to ensure the app can talk to Pi servers.
//
// NOTE: Pi Network allows any verified domain (Checklist Namba 10) — sio pinet.com pekee.
// Kwa hiyo tunakubali origin yoyote (pinet.com, vercel.app, custom domain, n.k.)
// ilimradi validation-key.txt ipo sahihi na Pi SDK imepakia.

export const PI_ALLOWED_ORIGINS: string[] = [
  "https://kizazilodgeuqc0446.pinet.com",
  // Domain zote za Vercel/custom zinaruhusiwa automatically (tazama isAllowedOrigin).
];

export const PI_VALIDATION_KEY =
  "ad9a2138c79142e52736ebb4ee883c9fcfa46a757819e90b26f5c19145e4360a844d3226fb446edb57acdc1ae12e839368dd35984895792e3d176a38485a0080";

export type DomainCheck = {
  ok: boolean;
  reason?:
    | "no-window"
    | "wrong-host"
    | "wrong-origin"
    | "missing-pi-sdk"
    | "validation-key-missing"
    | "validation-key-mismatch";
  currentOrigin?: string;
  expectedOrigin?: string;
};

export function isPinetHost(host: string): boolean {
  return /(^|\.)pinet\.com$/i.test(host);
}

export function isAllowedOrigin(origin: string, host: string): boolean {
  if (PI_ALLOWED_ORIGINS.includes(origin)) return true;
  if (isPinetHost(host)) return true;
  // Vercel deployments (production + previews)
  if (/(^|\.)vercel\.app$/i.test(host)) return true;
  // Lovable preview/published
  if (/(^|\.)lovable\.app$/i.test(host)) return true;
  // Localhost kwa dev
  if (host === "localhost" || host === "127.0.0.1") return true;
  return false;
}

/**
 * Verify the currently loaded page can run Pi payments:
 *  - origin inakubalika (pinet.com / vercel.app / lovable.app / localhost)
 *  - Pi SDK imepakia
 *  - /validation-key.txt inarudisha key sahihi
 */
export async function discoverPiDomain(): Promise<DomainCheck> {
  if (typeof window === "undefined") {
    return { ok: false, reason: "no-window" };
  }

  const currentOrigin = window.location.origin;
  const host = window.location.hostname;

  if (!isAllowedOrigin(currentOrigin, host)) {
    return {
      ok: false,
      reason: "wrong-origin",
      currentOrigin,
      expectedOrigin: PI_ALLOWED_ORIGINS[0],
    };
  }

  // Confirm Pi SDK loaded (only present inside Pi Browser).
  if (typeof (window as unknown as { Pi?: unknown }).Pi === "undefined") {
    return { ok: false, reason: "missing-pi-sdk", currentOrigin };
  }

  // Validate that /validation-key.txt is being served correctly.
  try {
    const res = await fetch("/validation-key.txt", { cache: "no-store" });
    if (!res.ok) {
      return { ok: false, reason: "validation-key-missing", currentOrigin };
    }
    const text = (await res.text()).trim();
    if (text !== PI_VALIDATION_KEY) {
      return { ok: false, reason: "validation-key-mismatch", currentOrigin };
    }
  } catch {
    return { ok: false, reason: "validation-key-missing", currentOrigin };
  }

  return { ok: true, currentOrigin };
}

export function describeDomainCheck(check: DomainCheck): string {
  switch (check.reason) {
    case "no-window":
      return "Hakuna browser environment.";
    case "wrong-host":
    case "wrong-origin":
      return `Origin ${check.currentOrigin ?? ""} haijaruhusiwa kwa miamala ya Pi.`;
    case "missing-pi-sdk":
      return "Pi SDK haijapatikana. Fungua app ndani ya Pi Browser.";
    case "validation-key-missing":
      return "validation-key.txt haipatikani kwenye origin hii.";
    case "validation-key-mismatch":
      return "validation-key.txt haifanani na key iliyosajiliwa kwenye Pi Developer Portal.";
    default:
      return "Domain haijathibitishwa.";
  }
}
