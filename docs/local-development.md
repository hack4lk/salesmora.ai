# Local Development Environment

This guide describes the planned local development setup for SalesMora. The workspace currently contains planning documents; commands and configuration below are implementation guidance, not a claim that the application or Compose stack already exists.

## Architecture

Use Docker Compose to run local infrastructure that should behave consistently across developers:

- **PostgreSQL** for application records and durable workflow state.
- **Redis** for the background job queue.
- **Mailpit** as a local SMTP sink and inbox for inspecting test email without delivering it to real recipients. Production outbound email uses Resend; Mailpit is local development only.
- **MinIO (optional)** as a local S3-compatible object store for exercising job-attachment upload and download flows without touching a production bucket.

Run the Next.js web application and Node.js worker as separate processes. Initially, running them on the host gives developers fast hot reload and straightforward debugging while they connect to PostgreSQL and Redis in Docker. Compose can later run all five services (`web`, `worker`, `postgres`, `redis`, and `mailpit`) when a fully containerized workflow is useful. This mirrors the planned Railway topology of a web service, worker, PostgreSQL, and Redis.

```mermaid
flowchart LR
    Browser[Browser] --> Web[Next.js development server]
    Web --> PG[(PostgreSQL container)]
    Web --> Redis[(Redis container)]
    Redis --> Worker[Node.js worker]
    Worker --> PG
    Worker --> Mailpit[Mailpit SMTP inbox]
    Web --> Mailpit
    Web --> Storage[(Local MinIO object storage)]
```

## Prerequisites

- Docker Desktop or Docker Engine with Docker Compose v2.
- Node.js LTS and pnpm, using the same major Node.js version in local development, CI, and Railway.
- Git and an editor.

Pin PostgreSQL and Redis image versions in `compose.yaml` and match the PostgreSQL major version to the Railway environment. Avoid floating `latest` tags so that local development and deployment use predictable database behavior. Compose supports health checks, service-name networking, and named volumes for persistent local data. [Docker Compose quickstart](https://docs.docker.com/compose/gettingstarted/)

## UI component development with Storybook

Once the Next.js application and shared React components exist, use Storybook as an isolated workbench for building, documenting, and reviewing component states. Keep it as a development tool; production routes remain in the Next.js app. The current workspace has no app package or Storybook scripts yet, so add the setup when the application is initialized rather than treating these notes as runnable commands.

Use Storybook's official Next.js setup and choose its Next.js Vite framework when it is compatible with the Next.js version selected for the app. For App Router projects, enable the documented `nextjs.appDirectory` setting. Put stories near their components as `*.stories.tsx`; use args/controls for variants and mock data and callbacks so stories do not depend on live accounts or services. A shared preview decorator should load the SalesMora theme, global styles, fonts, MUI theme provider, and any required providers so stories match the application.

Use Material UI (MUI) as the default component framework when its accessible components fit the interaction. Centralize the SalesMora.ai workspace brand tokens and MUI component overrides in `packages/ui`; add the MUI App Router cache provider described in MUI's official Next.js integration guide when the app is initialized. Use `@mui/icons-material` for in-product icons through the shared icon exports. Do not add favicon files or browser icon metadata/routes, and do not use website favicons as UI icons.

Start with the app shell and shared primitives (buttons, fields, badges, cards, dialogs, and drawers), then add composite CRM components such as lead tables, job boards, estimate previews, and integration cards. Cover useful states such as default, loading, empty, validation error, disabled, and plan/permission limited. Stories support component-level review and interaction checks; verify complete navigation and user journeys in the running application as well.

References: [Storybook for Next.js with Vite](https://storybook.js.org/docs/get-started/frameworks/nextjs-vite), [Storybook for Next.js](https://storybook.js.org/docs/get-started/frameworks/nextjs), [writing stories](https://storybook.js.org/docs/writing-stories), [args and controls](https://storybook.js.org/docs/writing-stories/args), [Material UI with Next.js](https://mui.com/material-ui/integrations/nextjs/), and [Material UI icons](https://mui.com/material-ui/material-icons/).

## Compose infrastructure

Once the application code is created, add a root `compose.yaml` with `postgres`, `redis`, and `mailpit` services. Add an optional MinIO service when implementing attachments and other object uploads. A starting outline is:

```yaml
services:
  postgres:
    image: postgres:17-alpine # Pin to the same major version used on Railway.
    environment:
      POSTGRES_DB: salesmora_dev
      POSTGRES_USER: salesmora
      POSTGRES_PASSWORD: salesmora_local_only
    ports:
      - "127.0.0.1:5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U salesmora -d salesmora_dev"]
      interval: 5s
      timeout: 3s
      retries: 10

  redis:
    image: redis:7-alpine # Pin a tested version; use the same major in CI.
    ports:
      - "127.0.0.1:6379:6379"
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 10

  mailpit:
    image: axllent/mailpit:${MAILPIT_VERSION:?Set MAILPIT_VERSION to an explicit version}
    ports:
      - "127.0.0.1:1025:1025" # SMTP
      - "127.0.0.1:8025:8025" # Web inbox

volumes:
  postgres-data:
  redis-data:
```

The example is a starting point: pin every image to an explicitly selected version before using it in the repository. For host-run application processes, connect to `127.0.0.1`. If `web` and `worker` are later run inside Compose, connect to `postgres:5432` and `redis:6379` using Compose service names instead. Do not publish the database or Redis ports on a public interface.

Copy `.env.example` to `.env.local`, replace the `MAILPIT_VERSION` placeholder with a published, pinned Mailpit version, and start and inspect infrastructure. Compose does not automatically read `.env.local`, so pass it explicitly:

```bash
docker compose --env-file .env.local up -d postgres redis mailpit
docker compose --env-file .env.local ps
docker compose --env-file .env.local logs -f postgres redis mailpit
```

Stop the containers while retaining local database data:

```bash
docker compose --env-file .env.local down
```

Remove the containers and their local data volumes only when you intentionally want a clean reset:

```bash
docker compose --env-file .env.local down --volumes
```

## Environment configuration

Commit an `.env.example` with placeholder values, including a pinned `MAILPIT_VERSION`, and keep actual `.env.local` files out of Git. Use separate settings for processes running on the host and inside Compose, because their database hostnames differ.

Example values for host-run development processes:

```dotenv
NODE_ENV=development
MAILPIT_VERSION=replace_with_pinned_release
DATABASE_URL=postgres://salesmora:salesmora_local_only@127.0.0.1:5432/salesmora_dev
REDIS_URL=redis://127.0.0.1:6379
SMTP_HOST=127.0.0.1
SMTP_PORT=1025
SMTP_SECURE=false
```

Keep provider credentials in untracked local environment files. Use Google OAuth credentials configured for localhost callbacks, Stripe test-mode keys, and a local/test Mailchimp account or mocked connector. Never place production credentials in local Compose files or seed data. If the application runs in Compose, use its internal service DNS names (`postgres`, `redis`, `mailpit`, and `minio`) rather than `127.0.0.1` for service-to-service connections.

## Object storage and job attachments

Use local MinIO or a dedicated non-production Railway bucket to test S3-compatible uploads. Never point local development or preview deployments at the production bucket. Use placeholder/local-only credentials and keep them in untracked environment files. Configure the application through S3-compatible settings (endpoint, bucket, region, access key, secret key, and URL style) so the same storage adapter can target MinIO locally and a Railway Storage Bucket in deployed environments.

Keep Railway object storage private. The backend must authenticate the user, verify organization/job access, and create an opaque object key before issuing a short-lived upload/download URL. Validate allowed file types and size on the server, verify object metadata after upload, and do not permit downloads until any configured malware scan marks the file clean. Removing an attachment must display a confirmation naming the file and warning that it will be permanently lost; after confirmation, destroy its per-file encryption key so any copies are unrecoverable, then delete its object while retaining non-content audit metadata. Maintain daily encrypted disaster-recovery copies of active attachments in a separate private Railway bucket with 30-day retention. Apply durable deletion tombstones before restoring data so user-confirmed deletions never reappear; purge ciphertext for deleted attachments under the deletion process. Target a 24-hour RPO and one-business-day RTO, then validate both through restore drills. Do not expose access keys in frontend configuration or logs. Railway Storage Buckets use HTTPS endpoints and provide separate instances per environment, but current Railway documentation lists server-side encryption, object versioning, object locks, and bucket lifecycle configuration as unsupported. The production design uses application-level envelope encryption with keys kept outside the bucket for sensitive customer documents. Follow the [Railway Storage Buckets](https://docs.railway.com/storage-buckets) and [file upload and serving guide](https://docs.railway.com/guides/storage-buckets-guide) for current platform details.

Example local-only placeholders (use the same names as the eventual storage adapter):

```dotenv
OBJECT_STORAGE_ENDPOINT=http://127.0.0.1:9000
OBJECT_STORAGE_BUCKET=salesmora-dev
OBJECT_STORAGE_REGION=us-east-1
OBJECT_STORAGE_ACCESS_KEY_ID=local_only
OBJECT_STORAGE_SECRET_ACCESS_KEY=replace_with_local_secret
OBJECT_STORAGE_URL_STYLE=path
```

Choose and pin a MinIO image version in Compose when implementation begins. For local tests, use disposable/sample files only; do not use actual customer documents.
Exercise both accepted and rejected file-size cases, including the Phase 1 maximum of 10 MB per attachment.

## Knex schema changes and migrations

Use Knex with the PostgreSQL driver (`pg`) for database access and schema migrations. Keep the Knex configuration and migration files in source control. Store migration state in Knex's migrations table, use timestamped migration names, and include both `up` and `down` implementations where a safe reversal is possible. Knex runs migrations in transactions by default where the database supports them, and its CLI provides migration listing and rollback commands. [Knex migrations guide](https://knexjs.org/guide/migrations)

Suggested package scripts once the application code is in place (run them with pnpm):

```json
{
  "scripts": {
    "db:migrate": "knex migrate:latest",
    "db:migrate:list": "knex migrate:list",
    "db:rollback": "knex migrate:rollback",
    "db:rollback:all": "knex migrate:rollback --all",
    "db:seed:dev": "knex seed:run --env development"
  }
}
```

Local migration loop:

```bash
pnpm install
docker compose --env-file .env.local up -d postgres redis mailpit
pnpm run db:migrate
pnpm run db:seed:dev
```

When changing the schema, generate a migration, implement and review both directions, then test the sequence **latest → rollback → latest** against a disposable database. Keep seed data separate from migrations: migrations change schema and required structural data; repeatable development seeds create fictional sample organizations, users, leads, jobs, and workflow examples.

### Migration and rollback policy

- A `down` migration is an operational recovery tool for schema changes, not a substitute for a database backup. Dropped or transformed customer data may not be recoverable by reversing schema alone.
- Prefer backward-compatible expand-and-contract changes: add a nullable/new field or table, deploy code that supports both forms, backfill safely, and remove obsolete structures in a later release.
- Back up production before migrations that drop, rewrite, or otherwise risk customer data. Review migration duration, locks, and table size for large changes.
- Run `knex migrate:latest` once as a controlled deploy step before the new web and worker services serve traffic. Do not let every replica run migrations independently during startup.
- If a release fails after a migration, decide whether to roll back the application, run a verified Knex rollback, or ship a forward-fix. Confirm schema and data compatibility before taking action.
- Knex's default `migrate:rollback` reverses the latest migration **batch**, not necessarily one migration; `migrate:rollback --all` reverses all completed batches. Check `knex migrate:list` and the deployment record first. [Knex rollback behavior](https://knexjs.org/guide/migrations#rollback)

## Running the application

After the Next.js and worker packages/scripts exist, start them in separate terminals for useful logs and debugger control:

```bash
pnpm run dev
pnpm run worker:dev
```

The Next.js server should handle the UI and request-response endpoints. The worker should consume durable BullMQ jobs from Redis and use shared application/domain modules and the same PostgreSQL schema. Delayed actions, email intake, connector execution, and LangChain work should be tested through the queue rather than simulated by long-running HTTP requests. Production Redis must use AOF persistence, `maxmemory-policy=noeviction`, and a persistent volume; this requires a custom Railway configuration and makes Redis operations, upgrades, and recovery our responsibility. Validate the exact deployment in staging before launch.

## Testing locally

- Use a dedicated `salesmora_test` database and test-only Redis queue names or key prefixes; never point test commands at development or production data.
- Run migrations against the test database before integration tests. Recreate it from migrations and deterministic seeds when isolation is required.
- Test the public widget endpoint with valid, invalid, duplicate, and rate-limited submissions.
- Test queue retry, idempotency, delayed jobs, worker restarts, and dead-letter/failure visibility.
- Use Mailpit to inspect email content and links. Do not send test campaigns to real customers.
- Use Stripe test mode and signed local webhook forwarding; verify Google OAuth with localhost redirect URIs. Mock provider behavior in automated tests where live provider credentials are unnecessary.
- For future Mailchimp integration, test consent changes, unsubscribe synchronization, audience/tag mapping, and webhook signature handling with a dedicated test account or mocks.

## Local services vs. Railway

Local development should resemble production in service boundaries and runtime configuration, while keeping local data and credentials isolated. Railway should run the Next.js web service, a separate Node.js worker, PostgreSQL, and Redis; the worker need not have a public domain. The BullMQ Redis service needs AOF persistence, `maxmemory-policy=noeviction`, and a persistent volume. Railway's standard Redis docs do not confirm these settings, so use a custom-configured deployment and verify it in staging; this makes Redis configuration, upgrades, backups, and recovery our responsibility. Configure Railway's deploy pipeline to run the Knex migration command once, with a backup and recovery plan for risky schema changes. Railway documents this multi-service pattern for Next.js applications with PostgreSQL and Redis-backed background workers. [Railway full-stack Next.js guide](https://docs.railway.com/guides/fullstack-nextjs)
