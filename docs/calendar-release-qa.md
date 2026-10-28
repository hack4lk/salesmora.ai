# Calendar grouped release QA

Initial QA: October 27, 2026. Approved blocker fixes validated October 28, 2026. Local Docker/test resources only. **Local release gates pass; performance and repository lint blockers are resolved.** The local QA itself made no staging change. A subsequently approved complete-app staging rollout passed on October 28; see the [staging release record](calendar-staging-release.md) for exact deployment, backup, migration and bounded live-verification evidence.

## Results

| Check | Result |
|---|---|
| Contracts, domain dates/availability, assistant/runtime, worker reminders and email unit checks | 186 passed across 23 files |
| Calendar foundation/commands, Jobs, settings, deadlines and notification database regressions | 123 passed across 10 isolated rehearsals in the initial grouped QA; all 20 command checks passed again after optimization, including the new range/queue assertions |
| Browser/API journeys: Calendar, assistant reads/advice/proposals/context, Job settings, Jobs and Estimate conversion | 58 passed after fixes across the grouped run and focused rerun |
| Storybook interactions, Axe accessibility checks and overflow/layout checks | 54 passed: 18 representative stories at 1440/768/320 px |
| Workspace typechecks and production package/web/worker/Storybook builds | Passed; the new benchmark also passes data-package typecheck |
| File UI lifecycle and thumbnail processing | Initial fetch, processing polling, polling stop/cleanup and all four worker thumbnail checks passed |
| Lint of QA changes | Passed |
| Repository-wide lint | **Passed: 0 errors, 43 existing warnings** |
| 10,000-Job Calendar read service performance | **Passed:** Owner P95 129.35 ms / Field P95 79.88 ms; target under 300 ms |

The functional suite covers authentication/tenancy, Field own-scope reads, complete active shared-record authority, concurrent/stale/idempotent mutations, historical schedules on close/reopen, explicit creation/join/separate choices, queue pagination, URL-backed views, narrow-screen visibility, reminder rules and preference/policy gates, notification privacy/deduplication, Thinking/streaming, evidence/replay/inherited-history invalidation, browser confirmation, selected-visit context removal and stale-context recovery. Notification rehearsals inject fixture mail delivery; assistant journeys use a fictional provider. This run does not verify actual provider delivery or Railway runtime behavior.

The Storybook smoke set covers Calendar page navigation/filtering/queue/keyboard/Field/read-only views, shared schedule/clear/warning/conflict reviews, visit-to-assistant handoff and native Escape/focus restoration, workspace settings, Work Order join/separate review and connected assistant save/revocation states. Axe uses WCAG 2 A/AA and 2.1 AA tags; this is automated smoke coverage, not a complete manual accessibility certification.

## Corrections to older tests

- Work Order creation now waits for its actual Job-detail fetch before checking the visit-choice controls, rather than relying on a short development-server rendering deadline.
- The Jobs journey now expects the already-implemented Files and Job team chat sections.
- The note-persistence test waits for successful PATCH completion and an emptied composer, rather than allowing unsaved textarea content to satisfy its assertion before reload.
- The schedule/status sequence waits for the saved Scheduled state before opening another action.
- The Field scheduling-denial check explicitly revokes its grant within that test rather than depending on another test's policy changes.
- The October 28 rerun caught a five-second post-creation navigation timeout. The test now verifies the successful Work Order POST response and allows twenty seconds for the destination page; the focused rerun passed. Creation/link/version assertions remain intact.

These corrections change tests, not application features. Existing unrelated working-tree changes were preserved.

## Performance gate: QLT-2

Reproduce after other test/build workloads have stopped:

```sh
pnpm --filter @salesmora/data exec tsx src/calendar/performance.rehearsal.ts
```

The rehearsal refuses production, non-local connections, the normal application database and database names without `_test`. It creates one disposable workspace with 10,000 Jobs and explicit independent visit/link rows; 250 Jobs are unscheduled and scheduled Jobs span 52 weeks. Owner and Field workloads have visits in the measured week. It performs five warm-ups and 50 measured calls per role, validates scoped counts/crew, captures `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` for the actual read queries, and removes the fixture workspace/users afterward. The benchmark fails when P95 is 300 ms or higher.

Initial October 27 baseline:

| Role | Samples | P50 | P95 | Maximum |
|---|---:|---:|---:|---:|
| Owner | 50 | 289.32 ms | **341.22 ms** | 387.77 ms |
| Field | 50 | 287.75 ms | **306.12 ms** | 309.25 ms |

These are local `readCalendar` service-call timings, including its authorization/transaction and database round trips; HTTP/render time is excluded. They are not a Railway capacity prediction. The baseline Owner queue/read SQL plans measured 120.097 / 141.089 ms individually; Field plans measured 103.416 / 111.470 ms. Existing record-link/Job indexes are used, but the visible-record CTE was projecting all weeks in separate queue/read queries. The initial fixture was corrected to avoid correlating every measured-week Job with Owner assignment; reported results use both roles' populated schedules.

The approved October 28 optimization selects visits in the requested week **plus the entire unscheduled queue** before projecting people, deadlines and active membership. It filters by the shared visit's canonical date, so every readable active record on a selected visit is retained. Full active-link counts still include hidden records, and the limited workspace roster still uses its unbounded authorized record set. Field scoping, filters, queue counts/pagination and complete-record scheduling authority are unchanged. This adds no cache, row truncation, migration or environment variable. The command rehearsal now checks a far-future visit and the same unscheduled queue across multiple requested weeks.

Final October 28 rerun after all other test/build workloads stopped, using the same fixture and sample count:

| Role | Samples | P50 | P95 | Maximum |
|---|---:|---:|---:|---:|
| Owner | 50 | 123.13 ms | **129.35 ms** | 130.27 ms |
| Field | 50 | 70.22 ms | **79.88 ms** | 80.90 ms |

Both roles pass QLT-2. The benchmark validates scoped results and captures the actual SQL EXPLAIN plans, then cleans up its fixtures. No production or staging performance claim is inferred from this local result.

## Repository lint gate

The initial run found these seven errors outside the Calendar integration changes. The approved October 28 follow-up fixed them in their owning modules: file route rows now use `FileRecord` with the uploader projection; storage cleanup and thumbnail options use their existing types; initial Estimate review/file loading is deferred with cleanup; file loading/polling functions are declared before the effect uses them. Repository-wide lint now passes with **zero errors and 43 warnings**. Existing warnings remain visible and are not waived as errors.

| File | Errors |
|---|---|
| `apps/web/src/app/api/jobs/[jobId]/files/route.ts` | Explicit `any` at line 63 |
| `apps/web/src/app/api/work-orders/[workOrderId]/files/route.ts` | Explicit `any` at line 64 |
| `apps/web/src/features/estimates/estimate-convert-dialog/estimate-convert-connected.tsx` | Synchronous state update in an effect at line 94 |
| `apps/web/src/features/jobs/job-files/job-files-list.tsx` | `fetchFiles` and `startPolling` accessed before declaration, lines 30/34 |
| `packages/data/src/files/store.rehearsal.ts` | Explicit `any` at line 24 |
| `packages/data/src/files/thumbnail-processor.ts` | Explicit `any` at line 35 |

## Deployment boundary

1. Approve the release snapshot after the local gates pass. The checkout also contains Estimate/Gantt/file-storage work; do not assume every uncommitted change belongs to this Calendar release.
2. Inspect the actual Railway staging migration ledger and backup/restore readiness. This QA did not inspect or alter staging. Use the ordered migrations belonging to the approved snapshot and their dependencies, not a manually selected filename suffix.
3. Stop older Job/Work Order writers and notification workers before the Calendar command/reconciliation cutover. Apply the matching additive migrations once, then deploy matching web and worker versions; older workers must not consume the newer Job event types.
4. Follow [worker deployment guidance](worker-deployment.md). Calendar context/proposals add no environment variables, provider settings or worker queues. Existing email/provider/Redis/database configuration still applies.
5. On staging, verify worker readiness/status, one shared schedule/clear, Field denial, a scoped combined notification, reminder delivery/preferences and global assistant confirmation/context. Verify actual configured email/model delivery there after approval.

Calendar migrations include the visit/command/reconciliation foundation (`202610210001`–`202610210003`), visit notifications and Job settings (`202610220001`–`202610220002`), deadline reminders, Job lifecycle notification migrations, Calendar chat (`202610270010_calendar_chat.ts`) and proposals (`202610270011_calendar_proposals.ts`). See their source and the worker guide for retained-data rollback restrictions. No rollback over retained history or return to older schedule writers is assumed safe.

Deferred product scope is unchanged: Day/Month/Agenda views, drag-and-drop, recurring/multi-day visits, bulk scheduling, settings drafts from chat, joining/separating from chat, deadline markers, ICS and external calendars.
