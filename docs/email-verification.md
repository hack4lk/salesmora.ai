# Email verification

The approved verification notice and email template are connected to Better Auth. Verification is optional for registration, login, setup, and workspace access. Invitation delivery is now connected; see [Team invitations](team-invitations.md).

## Behavior

- Registration sends a branded HTML/plain-text verification email through the configured email transport. Local development uses Mailpit; Railway staging uses Resend. If email delivery fails, account creation and its session still succeed; the owner can resend later.
- Home displays the signed-in account's email and verification status. Returning from another tab refreshes the server session state.
- Resend posts to `/api/auth/send-verification-email`. A valid session and exact app Origin are required. The server supplies the account email and fixed result URL; forged recipient addresses are rejected.
- A successful resend starts the approved 60-second UI cooldown. Better Auth's database-backed limit permits one resend per 60 seconds in the local request bucket. Local clients share this bucket because proxy headers are deliberately not trusted. A verified deployment proxy/rate-limit configuration is required before public hosting.
- Better Auth signs verification links with the existing auth secret and validates their one-hour expiry. Links are stateless JWTs, not password-reset database records. No migration or extra database is needed. A valid repeated click is harmless and leaves the email verified; resending does not revoke earlier unexpired links.
- Verification changes `users.emailVerified`. It does not automatically sign someone in or replace an account already signed in. A signed-out browser can verify the email, then sign in to view the result.
- `/verify-email` shows the approved verified/pending notice or a generic invalid/expired-link message. Status comes from the server session rather than query parameters. The token is absent from the result URL. Verification routes use no-store/no-referrer headers, and incoming verification URL logging is suppressed.
- Verification processes saved owner invitations through the configured email transport. Local development uses Mailpit; Railway staging uses Resend. Delivery failures remain queued for owner retry from Home; see [Team invitations](team-invitations.md).

Email rendering follows the established inline CSS/table convention for email clients. Copy lives in the template data file; brand tokens are shared. The approved PNG logo is embedded as a CID attachment. App UI uses Tailwind and the existing approved components.

The implementation uses the installed Better Auth API and its [email verification configuration](https://better-auth.com/docs/concepts/email).

## Review locally

Keep the app on `127.0.0.1`, matching its auth origin.

1. Open [Home](http://127.0.0.1:3000/home), sign in, and choose Resend email. Existing accounts can use this without registering again. Owners who have not finished setup can use [Email verification](http://127.0.0.1:3000/verify-email).
2. Open [Mailpit](http://127.0.0.1:18025/). Find the newest “Verify your SalesMora.ai email” sent to your account. This is a real local link, unlike the earlier fictional template preview.
3. Click Verify email. The result page should show Email verified when signed in as that account. Continue returns to Home or unfinished setup.
4. Reload Home; verification persists. The resend button disappears. A second click on the email link is safe.
5. For a pending account, an invalid link displays recovery guidance. Resend failures allow retry; rate limits show a wait state. Verification is not needed to continue using the workspace; saved team invitations send after owner verification.

## Validation

`pnpm --filter @salesmora/web test:e2e email-verification.spec.ts` covers local SMTP delivery, registration and Home resend, persisted verification, cooldown, invalid/expired/tampered links, callback restrictions, signed-out/other-account handling, retry feedback, and desktop/mobile layout. The test harness uses only `salesmora_test` on port 3002 and removes its own verification messages from Mailpit. Password-reset email tests now filter by subject so automatic verification emails cannot be mistaken for reset messages.

## Deployed email transport

All verification, invitation and reset emails share `apps/web/src/server/email/transport.ts`. Local loopback origins default to Mailpit; remote origins refuse Mailpit. Set `EMAIL_PROVIDER=resend`, `EMAIL_FROM=SalesMora Staging <no-reply@staging.mail.salesmora.ai>` and the domain-restricted `RESEND_API_KEY` on the Railway staging web service. Resend requires an HTTPS app origin; local origins cannot opt into live sends. Secrets are server-only and never bundled into the browser. No database migration is required.

The transport calls the fixed Resend HTTPS `/emails` endpoint with a 10-second timeout, existing HTML/plain-text templates and base64 CID logo attachments. Provider errors are reduced to generic errors; recipient addresses, API keys, message contents and auth links are not logged. It does not automatically retry ambiguous sends. Reset preflight checks the same configuration for existing and unknown accounts without contacting the provider; it cannot prove provider credentials are valid. A successful API response means accepted, not delivered to the inbox. Confirm delivery in Resend and exercise the actual inbox links after deployment.

Provider reference: [Resend send API](https://resend.com/docs/api-reference/emails/send-email), [CID attachments](https://resend.com/changelog/embed-images-using-cid). Keep open/click tracking disabled for auth emails in Resend.
