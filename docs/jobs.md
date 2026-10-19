# Jobs implementation

Local foundation implemented October 19, 2026, before the reviewed Jobs UI and Calendar slices. Prototypes 09/10/11/12 and 30 remain design references. Product scope and outstanding slices live in [the Jobs plan](job-module-plan.md) and [Calendar plan](calendar-page-plan.md).

## Live core integration — October 19, 2026

The reviewed core components now connect locally at `/jobs` and `/jobs/[jobId]`. Workspace navigation uses current `jobs.read`; direct pages and `/api/jobs` / `/api/jobs/[jobId]` independently authenticate and authorize. Lists, counts, facets, metrics, search, service/customer/owner/date filters, sorting and pagination run within the SQL read scope. Board pagination is explicit; lane counts describe the current page. Relative dates use the workspace timezone.

Connected: existing-customer job creation with explicit assignment and final review; board/table/peek/detail; assignments and optional team; status/Waiting/complete/cancel/reopen review; scheduled date/arrival window; completion deadline; immutable text notes; paginated activity; authorized customer/source-lead links. The same shared transaction services enforce current permissions, optimistic versions, lifecycle and actor-bound retries. Stale dialogs require reload; failed saves retain input. Success toasts dismiss after two seconds.

Pending and excluded from the live page: ordinary details editing (`jobs.update` remains unreviewed), inline new-customer/job creation, attachments/storage, job team chat, CSV export, Jobs assistant tools/proposals, notifications/reminders, automatic lead conversion, follow-on work and configurable labels. The existing global assistant remains available with its already implemented capabilities; no Jobs capability is falsely registered by this integration.

Saved role policies are preserved. Field reads/progress/status/completion follow their current assigned scope. Field scheduling is available only with an explicit current scheduling grant and primary ownership; this release does not silently add a grant to existing policies. The versioned Field default-policy cutover remains pending. No permanent Jobs delete API, new schema migration, environment variable or staging deployment is part of this slice.

## Foundation files and responsibilities

| File | Responsibility |
|---|---|
| `packages/contracts/src/job.ts` | Strict create/mutation/query inputs, stable status and arrival-window IDs, actual local-date validation, bounded pagination and public record DTO |
| `packages/domain/src/jobs/lifecycle.ts` | Schedule auto-transitions, Waiting/cancellation reasons, explicit close confirmation, reopen/deadline review |
| `packages/domain/src/authorization/authorize.ts` | Existing policy authority plus the Field scheduling primary-owner restriction; no owner exception around revoked grants |
| `packages/data/src/migrations/202610190001_jobs_foundation.ts` | Jobs, member assignments, activity, operation receipts, per-workspace counters, tenant-safe foreign keys and once-per-source-lead uniqueness |
| `packages/data/src/jobs/store.ts` | Shared create/read/mutation services, SQL scope before counts/pagination, current policy/workspace locks, versions, actor-bound retries, bounded history |
| `packages/data/src/customers/store.ts` | Refuses customer deletion with active linked jobs; compatible with pre-foundation local schemas while Jobs stays disabled |
| `apps/web/src/features/jobs/job-status-badge/` | First reviewed UI item, composed from the shared StatusBadge; copy and fictional previews colocated |

The earlier foundation-only slice did not expose Jobs APIs/navigation. The live core integration above supersedes that boundary; Jobs assistant capability registration and Calendar remain pending. Existing feature gates continue to hide unavailable operations. There is no permanent job-delete service, generic update endpoint or model SQL/commit tool. `jobs.update` remains unreviewed; the legacy `jobs.delete` catalog placeholder is unavailable.

## Rules

- Identity comes from the server session, enabled permissions from server configuration, and grants from the current persisted workspace policy. Callers must use `withWorkspaceAuthorization`; the in-transaction mutation helper assumes its authorized workspace write transaction is held.
- Owner/Admin/Office default reads are workspace-wide; assigned scope includes the primary owner and explicitly current job-team members. SQL scope applies before list counts, filters and pagination. Field scheduling additionally requires primary ownership, even when a saved grant has broader scope.
- Creation requires current customer read/create-job/assignment authority, an active workspace customer, an explicit primary-owner choice (including explicit Unassigned), and valid current teammates. Optional lead references require current lead read access and a matching linked customer. No implicit customer creation, owner selection, old-lead backfill or automatic Won conversion is performed.
- Source-lead uniqueness is prepared for later conversion integration; replaying a create submission returns the same small `{jobId, version}` receipt. Reusing a submission for a different actor/payload fails. Confirmation adapters must perform their own expiry/provenance checks before calling the shared service.
- Mutations recheck current read/action authority, lock the workspace and record, and compare versions. Progress notes append independently of unrelated stale edits, with one activity row per submission. Closing/reopening and schedule changes retain previous/new values and actor/source. No service edits or deletes saved activity.
- The six lifecycle IDs are stable. Scheduling only auto-transitions Needs Scheduling/Scheduled. In Progress/Waiting remain explicit. Waiting requires a reason; completion/cancellation require confirmation, and cancellation requires a reason. Reopening requires `jobs.reopen`, confirmation and an explicitly retained/changed/removed deadline.
- Scheduled work dates and completion deadlines are independent workspace-local `YYYY-MM-DD` values. Date fields are explicitly formatted in SQL to avoid PostgreSQL driver's implicit timezone conversion. Fixed arrival presets require a scheduled date.
- Removing a primary owner removes their job-based access unless another grant independently authorizes access. Team replacement is explicit; the previous owner is excluded from the replacement team before any later explicit re-add.
- Active jobs block customer deletion. Closed jobs keep historical customer/source number snapshots; nullable source IDs are cleared when the source record is deleted. Account deletion may still erase the workspace through its separately authorized privacy flow. No client job-delete endpoint exists.

## Local verification

```sh
corepack pnpm db:migrate:test
corepack pnpm --filter @salesmora/data test:jobs
corepack pnpm test
corepack pnpm typecheck
corepack pnpm --filter @salesmora/web test:e2e jobs.spec.ts customers.spec.ts customer-chat.spec.ts
node scripts/check-jobs-stories.mjs
```

The database rehearsal rejects development/non-loopback URLs, creates only its own fictional test users/workspaces, tests actual concurrent writes, and removes those fixtures afterward. Retained content-free authorization audits follow the existing test database policy. It does not reset a database. The first failed migration rehearsal rolled back; the missing tenant-composite lead reference key was added before successful test and development migration. Development migration followed a private native PostgreSQL backup, restore-fingerprint comparison and successful migration of the disposable restored copy. No existing record conversion or role-policy rewrite ran.

The UI/protected APIs and current action confirmations are now connected for core Jobs. Notifications and the versioned default-policy cutover for Field scheduling remain pending. Keep ordinary edits, attachments, team-visible chat, conversion, reminders and Calendar marked as pending until their own acceptance checks pass. No new environment values or staging deployment are part of this foundation.


## Jobs UI batch review

JobStatusBadge is approved; the user requested all remaining Jobs components together before connection. The [review gallery](http://127.0.0.1:6006/?path=/story/jobs-reviewgallery--default) and [component index](jobs-components-review.md) now cover 34 entries and 196 fictional states. Complete board/table/detail and creation previews compose the components, including direct review dialogs, note/file states, separate job team chat and private global assistant cards. All 588 state/viewport checks pass, as do workspace types/lint, 487 unit tests and production builds. The earlier first-badge-only UI status is superseded; core backend routes are now connected as described above; tools and additional integration services remain pending.
