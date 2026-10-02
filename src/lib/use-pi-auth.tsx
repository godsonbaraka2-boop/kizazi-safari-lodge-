import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { verifyPiAccessToken, type PiUser } from "./pi-auth.functions";
import { completePiPayment } from "./pi-payments.functions";
import { ensurePiReady } from "./pi-sdk";

const STORAGE_KEY = "pi_auth_user";

export function usePiAuth() {
  const verify = useServerFn(verifyPiAccessToken);
  const completeIncomplete = useServerFn(completePiPayment);
  const [user, setUser] = useState<PiUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoTriedRef = useRef(false);

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
      console.info("[Pi.auth] authenticating", window.location.origin);
      const auth = await Pi.authenticate(["payments", "username"], (payment) => {
        // An unfinished payment blocks new ones — finish it on the server.
        const p = payment as { identifier?: string; transaction?: { txid?: string } | null };
        console.warn("[Pi.auth] incomplete payment found", p);
        if (p?.identifier && p.transaction?.txid) {
          completeIncomplete({ data: { paymentId: p.identifier, txid: p.transaction.txid } })
            .then(() => console.info("[Pi.auth] incomplete payment completed", p.identifier))
            .catch((err) => console.error("[Pi.auth] failed to complete incomplete payment", err));
        }
      });
      console.info("[Pi.auth] success", auth.user?.username);
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

  useEffect(() => {
    if (autoTriedRef.current) return;
    autoTriedRef.current = true;
    void signIn();
  }, [signIn]);

  return { user, loading, error, signIn, signOut };
}
