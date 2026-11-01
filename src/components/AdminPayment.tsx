export default function AdminPayment({ passcode }: { passcode: string }) {
  if (!passcode) return null;
  return <section className="mx-auto max-w-6xl border-t border-sand-50/20 py-8 text-sand-50"><h2 className="font-display text-2xl">Pi user rewards</h2><p className="mt-3 text-sm">Rewards are temporarily unavailable while the app-to-user payout connection is verified.</p></section>;
}
