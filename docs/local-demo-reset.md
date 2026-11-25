# Local demo database reset

## Purpose

The reset command replaces the local development database with a
freshly migrated database containing a realistic, fictional service business.
The data should support individual login, role and plan testing, CRM workflows,
calendar views, and reports without contacting real customers or providers.

The command is `pnpm db:reset:demo`. It is separate from
`pnpm db:setup` and normal application startup.

## Before resetting

1. Stop the local web app, worker, and any other clients connected to the
   development database. The command reports active connections and stops;
   it does not terminate them.
2. Ensure PostgreSQL is running and local configuration exists. The command
   verifies that the migration owner and application URLs point to the
   standard loopback development database on port 55432.
3. Back up anything you want to keep. A reset permanently deletes the current
   development database and its contents, including local accounts and data.
   The command does not reset `salesmora_test`, remote databases, or shared
   infrastructure.
4. Review the displayed target and confirm the destructive action explicitly.
   An unattended invocation requires an explicit confirmation flag; the flag
   does not bypass the local-target checks.
5. Existing workflow configurations are preserved only when their workspace,
   publisher, recipients and referenced settings map to the seeded demo
   accounts. A non-demo or unsupported dependency stops the reset before
   deletion. Referenced website capture sources are preserved; other source
   types stop the reset.

Run `pnpm db:reset:demo` from the repository root and type `reset salesmora`
at the confirmation prompt. For unattended use, `pnpm db:reset:demo --yes`
confirms deletion explicitly.

If migration or seeding fails, the command reports the phase and last
confirmed state. Inspect the database before retrying: a failed phase may have
partially completed. Demo passwords may already have been added to `.env.local`
if the connection check fails.
Rerunning the reset is destructive and starts again from an empty database.
The command prints the path of a private workflow recovery snapshot in
`.local/backups/demo-workflows/` before deletion. If the reset fails after
the database was dropped and the replacement has no workflows, pass that path
as `--workflow-snapshot=/absolute/path/to/snapshot.json` on the next reset.
The snapshot contains workflow and capture-source configuration, may contain
sensitive data, and is retained with owner-only permissions; remove it only
when no longer needed. If the replacement already contains workflows, the
recovery option stops rather than replacing them; inspect the database first.

The final pre-drop check temporarily disables new database connections. If
the process is interrupted during that check, an owner can restore
connections with `ALTER DATABASE salesmora WITH ALLOW_CONNECTIONS true`
from the local maintenance database after verifying that no reset is running.

## What the reset will do

1. Validate configuration, required dependencies, target identity, and
   confirmation. Prepare credentials and check active connections.
2. Save a private snapshot of workflow configurations and their required
   demo identities, services and website sources. Rehearse migration, seeding
   and restoration in a disposable local database. Recheck connections and
   snapshot consistency before dropping anything.
3. Drop and recreate only the local development database.
4. Run all current migrations in order, including the fresh baseline, then
   verify web runtime access using the existing database roles.
5. Capture one seed timestamp and populate the demo data. Account and CRM
   phases use separate transactions; a failed CRM phase may leave accounts
   behind, but the command will report failure rather than success.
6. Restore saved workflows and referenced website sources paused. Queued
   workflow history and deliveries are not restored. Verify the complete
   migration ledger, restored configurations, seed invariants, account
   access, and a representative sample of the data. Print a summary without
   passwords.

Database reset does not imply deletion of external object storage, Redis,
email inboxes, or third-party resources. The seed must not depend on stale
external data or trigger real email, payment, or integration activity.

## Login credentials

| Business | Plan | Login accounts |
| --- | --- | --- |
| Evergreen Home Services | Premium | `owner@demo.example.test`, `admin@demo.example.test`, `office@demo.example.test`, `field@demo.example.test` |
| Cedar Handyman | Free | `free@demo.example.test` |
| Harbor Property Care | Standard | `standard@demo.example.test` |

| Login | Workspace role | Password variable |
| --- | --- | --- |
| `owner@demo.example.test` | Premium owner | `DEMO_OWNER_PASSWORD` |
| `admin@demo.example.test` | Premium admin | `DEMO_ADMIN_PASSWORD` |
| `office@demo.example.test` | Premium office | `DEMO_OFFICE_PASSWORD` |
| `field@demo.example.test` | Premium field | `DEMO_FIELD_PASSWORD` |
| `free@demo.example.test` | Free owner | `DEMO_FREE_OWNER_PASSWORD` |
| `standard@demo.example.test` | Standard owner | `DEMO_STANDARD_OWNER_PASSWORD` |

Demo passwords are stored in the ignored `.env.local` file, not in source
code or tracked documentation. The reset generates missing passwords
securely, retains existing ones on subsequent resets, and validates them
before dropping the database. It preserves unrelated environment settings,
sets owner-only file permissions, and does not print passwords.
Developers can retrieve the passwords from `.env.local` locally; do not
commit, share, or reuse them outside local development.

The premium workspace contains all four roles so the same records can be
tested with different permissions. The separate free and standard owners
access their own fictional workspaces. Paid-plan status is local fixture data,
not a real subscription or payment; billing-provider actions require their
own separately configured sandbox.

## Demo data and dates

The data describes connected customers, leads, estimates, jobs, work
orders, materials, calendar visits, assignments, and activity. Records will
cover different statuses and business outcomes, including recent completed
work and upcoming or overdue work. Reports will use the actual underlying
records and supported financial fields rather than fabricated report totals.
All people, businesses, addresses, contact details, and amounts are fictional.

The reset derives all relative dates from one captured run time. It
include visits visible today and in upcoming calendar ranges, as well as
historical data for date-filtered reports. The seeded workspaces use the
reset machine's time zone so date-only visits align with the local day.
Fixtures age naturally after the reset; run it again to refresh their dates.
Automated tests supply fixed reference dates, including month and year
boundaries.

## After resetting

Once the command reports success, start the app and worker using the normal
[development setup](DEV_SETUP.md). Use the printed login names and locally
stored passwords to check the four roles, switch between the fictional
businesses using their separate owner accounts, and inspect CRM, calendar,
and report screens. Role and report visibility still follows the default
workspace policy; financial reports require their normal explicit permission.

The seed itself does not send emails or call providers. After starting the
app and worker, ordinary actions and background jobs still use your local
configuration, so keep external integrations disabled unless intentionally
testing a sandbox.
