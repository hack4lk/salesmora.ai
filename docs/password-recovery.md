# Password recovery — local implementation

Status: implemented; awaiting local review. This completes password recovery only. Email verification and invitations are separate steps.

## Test it yourself

1. Run Docker, then `corepack pnpm db:setup`. This starts SalesMora PostgreSQL and Mailpit without changing existing credentials or development accounts.
2. Keep `corepack pnpm dev` running. Use `http://127.0.0.1:3000` consistently.
3. Register a fictional account if needed, then sign out.
4. Open [password recovery](http://127.0.0.1:3000/forgot-password), enter that account's email, and click **Send reset link**.
5. Open [Mailpit](http://127.0.0.1:18025). Find **Reset your SalesMora.ai password** and click **Choose a new password**.
6. Enter matching passwords of 8–128 characters. After success, use **Back to sign in** and log in with the new password.
7. The old password should fail. Opening the same email link again should show an invalid-link message. Other signed-in sessions should require login when they next contact the server.

Mailpit captures local mail; it does not deliver to real inboxes. SMTP is bound to `127.0.0.1:11025`, inbox UI/API to `127.0.0.1:18025`. No SMTP credentials or external email account are required. Messages are temporary and disappear when the container is recreated. Do not use real credentials in local testing. Delivery is disabled for non-loopback auth URLs until a production provider is implemented.

## UI review

- [ResetPasswordForm](http://127.0.0.1:6006/?path=/story/auth-resetpasswordform--default): default, required, mismatch, pending, server error, invalid link, success, keyboard.
- [ResetPasswordScreen](http://127.0.0.1:6006/?path=/story/auth-resetpasswordscreen--default): default, invalid link, mobile.
- [PasswordRecoveryScreen](http://127.0.0.1:6006/?path=/story/auth-passwordrecoveryscreen--default): active request form, default/mobile.

Storybook callbacks are mocked and never send mail. Product UI uses shared components, Tailwind, and colocated `.data.ts` copy.

## Implementation

`apps/web/src/server/email/templates/password-reset/` contains the email's data and renderer. `apps/web/src/server/email/send-password-reset.ts` owns local delivery. Future templates belong under `templates/`; provider changes belong in the server delivery boundary. The HTML email uses brand colors, table layout and inline CSS for email client compatibility. This is an email-specific exception to the app's Tailwind rule. Plain text includes the same reset link. Dynamic URLs are HTML escaped.

Better Auth owns token generation, hashing of identifiers in `verifications`, expiry checking, atomic consumption, password hashing, password update, and session revocation. No schema changes or second token system were added. Tokens expire after 30 minutes, can be consumed once, and are not consumed merely by opening the email. Concurrent reset attempts are tested: exactly one succeeds.

The server fixes the reset destination to its configured `/reset-password` URL, rejects supplied untrusted origins, and rate limits requests in PostgreSQL: three recovery requests per minute, five reset submissions per minute. Local callers share a bucket; deployment proxy configuration remains a future requirement. Known and unknown emails receive the same acknowledgement; only known accounts receive mail. The SMTP availability check runs for either case. If sending fails after that check, the server logs a generic delivery failure and retains the same acknowledgement to avoid exposing account existence. Delivery is not durably queued or retried yet.

Missing, invalid, expired, or previously used tokens lead to a request-new-link message. Success clears passwords and removes the token from the current browser URL. Reset responses use `no-store` and `no-referrer`; Next development request logging excludes reset URLs. Production proxy/APM logging must likewise redact token URLs. Password reset does not automatically sign the user in or mark their email verified.

## Repeatable checks

```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm --filter @salesmora/web exec playwright test password-reset.spec.ts
corepack pnpm test:e2e
corepack pnpm build
corepack pnpm storybook:build
```

End-to-end tests start port 3002, use only `salesmora_test`, and send mail to unique fictional addresses in Mailpit. Cleanup deletes only their own messages; manual development accounts and inbox messages are preserved. Docker/Mailpit must be running before these tests.

Production email delivery, verified sending domains, durable email jobs/retries, and deployment configuration remain separate work. The current transport is deliberately local-only.

## Verification recorded

All 25 authentication end-to-end tests pass. All 25 recovery/reset Storybook stories pass interaction and Axe checks. Desktop/mobile email layouts and live reset pages were visually reviewed; live reset pages also pass Axe. Lint and workspace typecheck pass. Production app and Storybook builds pass.

Configuration references: [Better Auth password options](https://better-auth.com/docs/reference/options), [Mailpit Docker images](https://mailpit.axllent.org/docs/install/docker/).
