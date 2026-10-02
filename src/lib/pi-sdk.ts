// Shared Pi SDK loader/initializer + global types.

export type PiAuthResult = {
  accessToken: string;
  user: { uid: string; username: string };
};

export type PiPaymentCallbacks = {
  onReadyForServerApproval: (paymentId: string) => void;
  onReadyForServerCompletion: (paymentId: string, txid: string) => void;
  onCancel: (paymentId: string) => void;
  onError: (error: Error, payment?: unknown) => void;
};

export type PiSdk = {
  init: (opts: { version: string; sandbox?: boolean }) => Promise<void> | void;
  authenticate: (
    scopes: string[],
    onIncompletePaymentFound: (payment: unknown) => void,
  ) => Promise<PiAuthResult>;
  createPayment?: (
    payment: { amount: number; memo: string; metadata: Record<string, unknown> },
    callbacks: PiPaymentCallbacks,
  ) => void;
};

declare global {
  interface Window {
    Pi?: PiSdk;
  }
}

const SDK_SRC = "https://sdk.minepi.com/pi-sdk.js";

function loadPiSdk(): Promise<PiSdk> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Pi SDK requires a browser"));
  }
  if (window.Pi) return Promise.resolve(window.Pi);

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SDK_SRC}"]`,
    );
    const onReady = () => {
      if (window.Pi) resolve(window.Pi);
      else reject(new Error("Pi SDK loaded but window.Pi missing"));
    };
    if (existing) {
      existing.addEventListener("load", onReady, { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Pi SDK")),
        { once: true },
      );
      return;
    }
    const script = document.createElement("script");
    script.src = SDK_SRC;
    script.async = true;
    script.onload = onReady;
    script.onerror = () => reject(new Error("Failed to load Pi SDK"));
    document.head.appendChild(script);
  });
}

// Primary production domain registered in the Pi Developer Portal.
export const PI_PRIMARY_URL = "https://kizazi-safari-lodge.vercel.app";

// Sandbox mode is ONLY for local dev / Lovable previews opened outside Pi Browser.
// vercel.app and pinet.com must run with sandbox:false — inside Pi Browser the
// SDK talks to Pi servers directly; sandbox:true there causes
// "Transaction not allowed" / "Invalid redirect_uri".
function isSandboxHost(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    /(^|\.)lovable\.app$/i.test(host)
  );
}

let initPromise: Promise<PiSdk> | null = null;
export function ensurePiReady(): Promise<PiSdk> {
  if (!initPromise) {
    initPromise = loadPiSdk()
      .then(async (Pi) => {
        const sandbox = isSandboxHost();
        console.info("[Pi] init", { host: window.location.host, sandbox, sdk: SDK_SRC });
        await Promise.resolve(Pi.init({ version: "2.0", sandbox }));
        return Pi;
      })
      .catch((e) => {
        console.error("[Pi] init failed", e);
        initPromise = null;
        throw e;
      });
  }
  return initPromise;
}
