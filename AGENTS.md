<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Use `react-phone-number-input` for guest phone capture so bookings are validated and stored in international E.164 format.
- Prices live in src/lib/prices.ts and are enforced server-side (payment approval + save); never trust amounts from the browser.
- Admin passcode checks go through src/lib/admin-auth.server.ts (constant-time compare + DB-backed rate limit).
- Kitchen orders are readable only via passcode-protected server functions; no public table access.
- Pi approval/completion verify the bearer with Pi and match the payment owner; browser tokens stay in memory to prevent trusting cached identity.
- Verified Pi identities and reward history are backend-only; reward payouts require admin verification, a dedicated app wallet, explicit Testnet checks, a globally serialized durable record, and identical-XDR reconciliation to avoid duplicate transfers.
- Vercel deploys must be followed by `vercel alias set <deployment> kizazi-safari-lodge.vercel.app`; the domain belongs to another Vercel project, so `--prod` alone does not update it.
