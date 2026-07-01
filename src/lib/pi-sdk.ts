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

// Sandbox = true kwa Testnet (Pi Developer Portal checklist step 10).
// Badilisha kuwa false ukishakubaliwa Mainnet.
const PI_SANDBOX = true;

let initPromise: Promise<PiSdk> | null = null;
export function ensurePiReady(): Promise<PiSdk> {
  if (!initPromise) {
    initPromise = loadPiSdk().then(async (Pi) => {
      await Promise.resolve(Pi.init({ version: "2.0", sandbox: PI_SANDBOX }));
      return Pi;
    });
  }
  return initPromise;
}
