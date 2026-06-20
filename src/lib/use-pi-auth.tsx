import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { verifyPiAccessToken, type PiUser } from "./pi-auth.functions";

type PiAuthResult = {
  accessToken: string;
  user: { uid: string; username: string };
};

declare global {
  interface Window {
    Pi?: {
      init: (opts: { version: string; sandbox?: boolean }) => Promise<void> | void;
      authenticate: (
        scopes: string[],
        onIncompletePaymentFound: (payment: unknown) => void,
      ) => Promise<PiAuthResult>;
    };
  }
}

const SDK_SRC = "https://sdk.minepi.com/pi-sdk.js";
const STORAGE_KEY = "pi_auth_user";

function loadPiSdk(): Promise<NonNullable<Window["Pi"]>> {
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

let initPromise: Promise<NonNullable<Window["Pi"]>> | null = null;
function ensurePiReady(): Promise<NonNullable<Window["Pi"]>> {
  if (!initPromise) {
    initPromise = loadPiSdk().then(async (Pi) => {
      // Pi.init may return a Promise — await it fully before authenticate.
      await Promise.resolve(Pi.init({ version: "2.0" }));
      return Pi;
    });
  }
  return initPromise;
}

export function usePiAuth() {
  const verify = useServerFn(verifyPiAccessToken);
  const [user, setUser] = useState<PiUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoTriedRef = useRef(false);

  // Restore cached session for UI continuity (server validated previously).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as PiUser);
    } catch {
      /* ignore */
    }
  }, []);

  const signIn = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const Pi = await ensurePiReady();
      const auth = await Pi.authenticate(["username"], (payment) => {
        console.warn("Incomplete Pi payment found", payment);
      });
      const verified = await verify({ data: { accessToken: auth.accessToken } });
      setUser(verified);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(verified));
      } catch {
        /* ignore */
      }
      return verified;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Pi sign-in failed";
      setError(msg);
      console.error("Pi sign-in failed", e);
      return null;
    } finally {
      setLoading(false);
    }
  }, [verify]);

  const signOut = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  // Auto-trigger Pi authentication on app load (browser only, once).
  useEffect(() => {
    if (autoTriedRef.current) return;
    autoTriedRef.current = true;
    void signIn();
  }, [signIn]);

  return { user, loading, error, signIn, signOut };
}
