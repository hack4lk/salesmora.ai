# Registration backend: local review

Registration is the first feature connected end to end. For each later feature, approve its components and screen, connect the required backend behavior, test it locally, and pause for approval.

## Start locally

With Docker running, from the repository root:

```bash
nvm use
corepack pnpm install --frozen-lockfile
corepack pnpm db:setup
corepack pnpm dev
```

Open [registration](http://127.0.0.1:3000/register). Use fictional details. Submission creates a local account, starts a session, and opens a protected `/setup` handoff. Refresh preserves the session. **Sign out** clears the cookie and revokes the database session. Unauthenticated `/setup` access returns to `/login`. Sign-out also returns to `/login`.

Run `corepack pnpm storybook` in another terminal. Registration stories inject mocked submissions and never call the account API.

`db:setup` generates `.env.local` once, with random database/auth credentials, and preserves it on later runs. Keep it untracked. Next.js, migrations, and test commands read this root file. `.env.example` documents the variables. If an existing `.env.local` is incomplete, add missing variables without replacing credentials for an existing database volume.

Compose owns the `salesmora` project, `salesmora-postgres-1` container, and `salesmora_postgres_data` volume. PostgreSQL 17 is pinned by digest and binds to `127.0.0.1:55432`. Existing projects on 5432 or 6379 are unaffected. Redis is not needed yet. Compose also runs local Mailpit for [password recovery](password-recovery.md), with SMTP 11025 and inbox 18025.

```bash
# Stop the database while preserving accounts.
docker compose --env-file .env.local stop postgres

# Restart and apply pending migrations.
corepack pnpm db:setup
```

Keep the Compose volume to preserve accounts. Five signup attempts per minute share the local rate-limit bucket; wait a minute if manual testing reaches that limit.

## Implementation boundaries

| Location | Responsibility |
|---|---|
| `packages/contracts/src/registration.ts` | Shared Zod input contract and limits |
| `packages/data/src/migrations/` | Knex-owned schema history, including reversal |
| `packages/data/src/database.ts` | PostgreSQL pool and Knex connection factories |
| `apps/web/src/server/auth/` | Better Auth configuration and session checks |
| `apps/web/src/app/api/auth/[...all]/route.ts` | Library HTTP handler, including origin checks and rate limits |
| `features/auth/registration-screen/registration-route.tsx` | Same-origin request, safe errors, fixed setup redirect |
| `/setup` | Authenticated handoff and sign-out; business onboarding is deferred |

Better Auth **1.7.7** handles passwords and sessions. Its PostgreSQL adapter uses Kysely internally; application queries and schema migrations remain on Knex **3.3.0**, with pg **8.23.1**. Knex is the sole migration owner. See the official [PostgreSQL adapter](https://better-auth.com/docs/adapters/postgresql), [database concepts](https://better-auth.com/docs/concepts/database), and [Next.js integration](https://better-auth.com/docs/integrations/next).

The domain package remains free of framework/database imports. Authentication is infrastructure here; organization and membership domain models will be introduced with onboarding requirements.

## Stored records and validation

| Table | Current use |
|---|---|
| `users` | Identity, unique email, verification flag, acceptance version/time, onboarding status |
| `accounts` | Credential account and password hash |
| `sessions` | User reference, token, expiry, timestamps, request metadata |
| `verifications` | Hashed verification identifiers for password reset tokens |
| `rateLimits` | Persistent atomic request counters |

The server requires a nonblank name up to 100 characters, valid email up to 254 characters, password of 8–128 characters, and `termsAccepted: true`. Name/email are trimmed, email is lowercased, and password whitespace is preserved. Confirmation stays client-side. Account, credentials, and initial session run in the library's PostgreSQL transaction. Database uniqueness also rejects email case variants.

Acceptance version/time and onboarding status come from the server. Submitted verification or completion/version fields cannot overwrite them. Failed UI submissions retain inputs and show safe messages. Immediate sign-in means the underlying HTTP response still distinguishes duplicate accounts; rate limiting reduces abuse, and enumeration policy must be revisited with verification before public launch. Cookie caching is disabled; protected pages check the database and reject revoked/expired sessions. Cookies are HttpOnly with SameSite=Lax. Local HTTP does not set Secure; HTTPS deployment must use Secure cookies.

## Repeatable verification

```bash
corepack pnpm db:migrate
corepack pnpm db:rollback:test
corepack pnpm db:migrate:test
corepack pnpm --filter @salesmora/web exec playwright install chromium
corepack pnpm test:e2e
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm build
corepack pnpm storybook:build
```

Rollback is restricted to the disposable `_test` database. The migration passed latest → rollback → latest. Production migrations belong in a controlled deployment step, not web startup.

Playwright starts a separate Next.js instance on **3002**, with its own build directory, using **salesmora_test**. Tests refuse the development database URL and clear only the disposable test database. The normal app can stay on 3000. One test deliberately forces credential storage to fail; its database error in test-server logs is expected.

Verified: 11 browser/backend tests covering persisted registration, normalized identity, hashed credentials, server-owned acceptance, protected routing, refresh persistence, browser sign-out/revocation, expiry, invalid input, duplicate/retry behavior, password whitespace, untrusted origins, concurrent rate limits, and rollback. Registration's 20 Storybook previews pass interaction and Axe checks. Production and Storybook builds, lint, and workspace type checks pass.

## Remaining work before public registration

This is a local development milestone. Legal links disclose development drafts; `TERMS_VERSION` records that draft version. Final documents still need approval. Emails remain unverified; local password recovery is implemented through Mailpit. No organization, membership, workspace, invitation, or CRM records are created yet.

Only the configured origin is trusted. Local rate limiting does not trust caller-supplied proxy IP headers and uses a shared bucket. Before public deployment, verify the hosting proxy/IP boundary, HTTPS/cookies, production secrets/database, and email/verification policy. Restrict unverified users when workspace capabilities are added. See [Better Auth rate limiting](https://better-auth.com/docs/concepts/rate-limit).

Registration and LoginForm are approved. The real `/login` screen is the current review checkpoint; see [local testing](local-testing.md#login-screen-review--login). The existing account/session foundation now supports both registration and login; no additional schema was required.
