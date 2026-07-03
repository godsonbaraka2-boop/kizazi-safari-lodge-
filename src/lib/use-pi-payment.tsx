import { useCallback, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { approvePiPayment, completePiPayment } from "./pi-payments.functions";
import { ensurePiReady } from "./pi-sdk";
import { dispatchWrongDomain } from "@/components/WrongDomainModal";
import { describeDomainCheck, discoverPiDomain } from "./pi-domain";

export type PiPaymentInput = {
  amount: number;
  memo: string;
  metadata?: Record<string, unknown>;
};

export type PiPaymentResult = {
  paymentId: string;
  txid: string;
};

export function usePiPayment() {
  const approve = useServerFn(approvePiPayment);
  const complete = useServerFn(completePiPayment);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pay = useCallback(
    async (input: PiPaymentInput): Promise<PiPaymentResult> => {
      setError(null);

      // Domain discovery BEFORE createPayment — ensures origin + validation-key.
      const check = await discoverPiDomain();
      if (!check.ok) {
        const msg = describeDomainCheck(check);
        setError(msg);
        if (
          check.reason === "wrong-host" ||
          check.reason === "wrong-origin" ||
          check.reason === "missing-pi-sdk" ||
          check.reason === "validation-key-missing" ||
          check.reason === "validation-key-mismatch"
        ) {
          dispatchWrongDomain({
            reason: check.reason,
            message: msg,
            currentOrigin: check.currentOrigin,
            expectedOrigin: check.expectedOrigin,
          });
        }
        throw new Error(msg);
      }

      setPaying(true);



      return new Promise<PiPaymentResult>((resolve, reject) => {
        ensurePiReady()
          .then((Pi) => {
            if (!Pi.createPayment) {
              throw new Error(
                "Pi.createPayment unavailable. Open this app inside the Pi Browser.",
              );
            }
            Pi.createPayment(
              {
                amount: input.amount,
                memo: input.memo,
                metadata: input.metadata ?? {},
              },
              {
                onReadyForServerApproval: async (paymentId) => {
                  try {
                    await approve({ data: { paymentId } });
                  } catch (e) {
                    reject(e);
                  }
                },
                onReadyForServerCompletion: async (paymentId, txid) => {
                  try {
                    await complete({ data: { paymentId, txid } });
                    resolve({ paymentId, txid });
                  } catch (e) {
                    reject(e);
                  }
                },
                onCancel: (paymentId) => {
                  reject(new Error(`Payment cancelled (${paymentId})`));
                },
                onError: (err) => {
                  reject(err);
                },
              },
            );
          })
          .catch(reject);
      })
        .then((res) => {
          setPaying(false);
          return res;
        })
        .catch((e: unknown) => {
          setPaying(false);
          const msg = e instanceof Error ? e.message : "Pi payment failed";
          setError(msg);
          console.error("Pi payment failed", e);
          throw e;
        });
    },
    [approve, complete],
  );

  return { pay, paying, error };
}
