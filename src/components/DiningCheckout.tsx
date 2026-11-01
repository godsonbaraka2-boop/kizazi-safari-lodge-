import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ROOM_USD } from "@/lib/prices";
import { diningDetailsSchema } from "@/lib/dining-details";

export type DiningDetails = { guestRoom: string; guestName: string; quantity: number };

export function DiningCheckout({ item, busy, error, onClose, onPay }: {
  item: { name: string; piAmount: number };
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onPay: (details: DiningDetails) => Promise<void>;
}) {
  const [staying, setStaying] = useState(false);
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [validation, setValidation] = useState<string | null>(null);
  const total = Number((item.piAmount * quantity).toPrecision(6));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const result = diningDetailsSchema.safeParse({ guestRoom: staying ? room : "Walk-in", guestName: name, quantity });
    if (!result.success) return setValidation(result.error.issues[0]?.message ?? "Please check your order details.");
    setValidation(null);
    void onPay(result.data);
  };
  const field = "w-full rounded-md border border-earth-900/20 bg-sand-50 p-3 text-sm text-earth-900";
  return (
    <Dialog open onOpenChange={(open) => { if (!open && !busy) onClose(); }}>
      <DialogContent className="max-w-md max-h-[90dvh] overflow-y-auto bg-sand-50 text-earth-900" onEscapeKeyDown={(e) => { if (busy) e.preventDefault(); }} onPointerDownOutside={(e) => { if (busy) e.preventDefault(); }}>
        <DialogTitle className="font-display text-2xl">{item.name}</DialogTitle>
        <DialogDescription>Food order</DialogDescription>
        <form onSubmit={submit} className="space-y-5">
          <fieldset disabled={busy} className="space-y-3">
            <legend className="mb-2 text-sm font-semibold">Guest type</legend>
            <label className="flex items-center gap-3"><input type="radio" name="guest-type" checked={!staying} onChange={() => setStaying(false)} /> Walk-in (not staying)</label>
            <label className="flex items-center gap-3"><input type="radio" name="guest-type" checked={staying} onChange={() => setStaying(true)} /> I'm staying at the lodge</label>
          </fieldset>
          {staying && <label className="block space-y-2 text-sm">Room<select aria-label="Your room" required disabled={busy} value={room} onChange={(e) => setRoom(e.target.value)} className={field}><option value="">Select your room</option>{Object.keys(ROOM_USD).map((r) => <option key={r}>{r}</option>)}</select></label>}
          <label className="block space-y-2 text-sm">Guest name<input aria-label="Guest name" required maxLength={80} disabled={busy} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} /></label>
          <label className="block space-y-2 text-sm">Portions<input aria-label="Portions" type="number" min={1} max={50} required disabled={busy} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className={field} /></label>
          <div className="flex justify-between border-t border-earth-900/15 pt-4"><span>Total</span><strong>{Number.isFinite(total) ? total : 0} π</strong></div>
          {(validation || error) && <p role="alert" className="text-destructive text-sm">{validation || error}</p>}
          <Button type="submit" disabled={busy} className="w-full bg-savannah text-sand-50 hover:bg-savannah-dark">{busy ? "Processing…" : "Pay with Pi"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}