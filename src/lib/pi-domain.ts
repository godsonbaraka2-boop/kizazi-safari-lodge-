// Pi domain discovery/validation utilities.
// Runs BEFORE Pi.createPayment() to ensure the app is on the
// approved Pi Network domain and validation-key.txt is served.

export const PI_ALLOWED_ORIGINS = [
  "https://kizazilodgeuqc0446.pinet.com",
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

/**
 * Verify the currently loaded page is on an approved Pi Network origin
 * AND that /validation-key.txt returns the expected key.
 */
export async function discoverPiDomain(): Promise<DomainCheck> {
  if (typeof window === "undefined") {
    return { ok: false, reason: "no-window" };
  }

  const currentOrigin = window.location.origin;
  const host = window.location.hostname;

  if (!isPinetHost(host)) {
    return {
      ok: false,
      reason: "wrong-host",
      currentOrigin,
      expectedOrigin: PI_ALLOWED_ORIGINS[0],
    };
  }

  if (!PI_ALLOWED_ORIGINS.includes(currentOrigin)) {
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
      return `Uko kwenye ${check.currentOrigin ?? "domain isiyo sahihi"}. Malipo yanaruhusiwa tu kwenye ${check.expectedOrigin}.`;
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
