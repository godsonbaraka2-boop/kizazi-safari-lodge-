# Security review — 2026-10-07

Scope: read-only backend basic checks, dependency advisory scan, source review, and live database constraint inspection. This is not a penetration test or a guarantee of safety. No real Pi payment was performed. Only the booking conflict wording was changed; security remediation and Vercel deployment were not requested or performed.

## Results
- Basic backend scanner reported no issues; it explicitly does not perform deep source analysis.
- Browser check against a real overlapping booking displayed: “This room is already booked for your selected dates. Please choose different dates or another room.” The submit handler prevented the payment from starting. The Pay button itself remains enabled, and the live availability result is not displayed until submission.
- Preview build reported build OK.

## Priority risks
1. **Price and payment binding:** `saveBooking`, `recordPiPayment`, and `createDiningOrder` trust caller-supplied totals. `verifyPiPayment` compares the real payment against that supplied total, not a server-owned catalog price, dates, and quantity. It does not bind the payment to an authenticated Pi payer or booking intent. Consequently completed-payment checks do not establish correct payment for the requested purchase.
2. **Replay and concurrent booking:** payment-use checks and room-conflict checks occur separately from inserts. Live constraints contain only primary keys and a booking confirmation-code unique constraint; no unique payment constraint or room-date exclusion constraint exists. Payment replay checking is per table, permitting the same payment to be reused across bookings and dining orders. Database-backed atomic payment claims and room reservations are needed.
3. **Public dining data:** the recent-orders SELECT policy allows anonymous access to full recent dining rows, including guest name, room, and payment references. A secret URL or passcode on a function does not protect direct database reads under this policy.
4. **Admin protection:** management and wallet actions rely on a shared server-checked passcode, not individual authenticated staff roles. No rate limiting was identified. Transport is HTTPS; transmitting a passcode is not in itself proof of leakage, but a stolen or guessed passcode grants sensitive access.
5. **Payment endpoints and failure handling:** approve/complete endpoints lack Pi-user authorization; `paymentAlreadyUsed` ignores query errors; the booking form continues toward payment when its final availability call throws. Fail-closed behavior and authenticated payment-intent validation are needed.
6. **Browser logs:** `use-pi-payment.tsx` logs the full payment input, which includes guest contact metadata. Remove sensitive values from diagnostic logs.
7. **Cross-site request protection:** the runtime warns that server functions lack the framework CSRF middleware. Review and add appropriate same-origin protections without breaking legitimate Pi Browser callbacks.
8. **Dependency advisories:** the dependency scan reported high/moderate advisories in transitive source-map-js, browserslist, js-yaml, and baseline-browser-mapping dependencies. These largely concern parsing/build tooling; exploitability in this app was not established. Update compatible dependency versions and rescan.

## Limits
- No adversarial requests, real wallet transactions, admin login, or concurrent paid inserts were executed.
- The basic scan cannot override source-identified weaknesses.
- Vercel has not received the English wording change in this turn.