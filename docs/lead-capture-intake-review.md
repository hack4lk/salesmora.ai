# Intake Review application checkpoint — November 4, 2026

This completes the application prerequisite (4a) of the [Gmail integration plan](lead-capture-gmail-integration-plan.md). Gmail ingestion is still unavailable. No worker, activation boundary, history cursor, polling or staging rollout is claimed by this checkpoint.

## Implemented behavior

- `/intake?workspace=…` lists authorized captured requests with search, source, review-status and attention filters, deterministic ordering and pagination. Workspace navigation preserves the selected workspace.
- `/intake/:id?workspace=…` composes the established IntakeDetailPage, source evidence, proposed-value editor, duplicate decisions and final confirmation. Connected stories exercise these same components with mocked API responses.
- Original email/form evidence and original answers remain separate from reviewer corrections. Missing/uncertain values remain visible. The source's immutable configuration and workflow versions govern admission even if the source is subsequently archived or paused.
- Preparing a decision produces an actor-bound, ten-minute immutable review snapshot. Corrections invalidate prior client choices. The server rederives matches, permissions, assignment and versions before applying a decision. The UI never silently refreshes a frozen confirmation after expiry.
- Creating a lead and creating an explicit separate lead share the existing admission service and capacity lock. Linking retains the receipt on an existing lead and applies only explicitly selected, currently authorized fields. Dismissal closes intake without creating or updating a lead.
- Exact decision retries and concurrent submissions produce one decision, admission and retained provenance. Invalidated or expired reviews return conflict; exhausted capacity preserves the awaiting item. Dismissal and linking do not consume new-lead capacity.
- Existing assignment, tags, lead history and notification/outbox behavior runs transactionally with admission. **A future approval can send an assignment email when the reviewed workflow has `notifyAssigned: true`.** All fictional database fixtures use notifications off; this checkpoint sends no emails. Disable notifications and application email delivery before the real Gmail pilot.

## Authority and transport

Shared contracts are in `packages/contracts/src/lead-capture/intake-views.ts`. The data use cases are in `packages/data/src/lead-capture/intake-store.ts`. Web endpoints are GET `/api/intake`, GET `/api/intake/:id`, POST `/api/intake/review`, POST `/api/intake/decisions`. Responses are private/no-store; mutations reuse the session, exact-origin, current membership/policy, suspension and workspace transaction boundary.

`intake.read` governs retained evidence independently of source management. Corrections require `intake.update`; create/separate require `intake.approve`, current `leads.create`/assignment authority, valid reviewed fields/workflow/assignment and capacity. Duplicate lookup intersects each candidate with current lead read scope, including assigned-only access. Hidden candidate identities and values are never returned; their existence can still require an explicit duplicate disposition. Linking uses the stricter `intake.approve` + lead read/update permission intersection, including field-level checks; individual proposed changes are independently filtered and rechecked. Dismissal requires `intake.dismiss`.

`intake.update` is now marked reviewed in the central permission catalog and the four existing intake permissions are enabled in the web application. Existing policy defaults already contain these permissions. No database schema or policy migration was needed. Intake assistant operations remain unimplemented/disabled by their own operation registry; marking corrections reviewed does not register assistant write tools.

## Validation and local evidence

- Full unit suite: 3,554 tests across 238 files.
- Guarded runtime-role scratch DB rehearsal: eight groups, covering tenant/read isolation, archived sources, corrections/normalization, immutable evidence, concurrent exact retries, selected-field link decisions, duplicate arrival/version changes, snapshot expiry, capacity exhaustion, revoked actions and assigned-only visibility. The scratch database is created and dropped by the harness; the development database is not seeded with fictional receipts or leads.
- Connected stories: 42 distinct cases at 1440/768/320 pixels (39-case final suite plus nine focused assignment/create/dismiss checks): create, corrections, exact retry, conflict, duplicate comparison/link/separate, exhausted-capacity dismissal, read-only, resolved dismissal, access revoked, review failure and list. WCAG A/AA and horizontal-overflow checks run with interactions.
- Contracts/data/web typechecks and focused lint; only the existing root React version detection warning is expected.
- The user's signed-in local app loaded the actual empty Intake Review page for DRIZL LLP. The real Gmail sample is still only a sample: it is not a receipt or captured request.

Screenshots are in ignored `.local/releases/intake-review-20261104/`, including `local-intake-empty.png` and responsive duplicate/list previews. Logs for this checkpoint are `/private/tmp/intake-*.log`. These contain fictional fixture diagnostics, not credentials or mailbox exports.

Run with Node 22:

```sh
pnpm test
pnpm --filter @salesmora/data test:intake
node scripts/check-intake-stories.mjs
pnpm --filter @salesmora/contracts typecheck
pnpm --filter @salesmora/data typecheck
pnpm --filter @salesmora/web typecheck
```

The DB harness requires an existing guarded, separate local `TEST_DATABASE_URL` in ignored configuration; do not point it at the main development database or staging.

## Next checkpoint

The user approved 4a. The [Gmail worker core](lead-capture-gmail-worker-core.md) is now implemented and tested; its live integration remains next. Original 4b scope: separately selected Gmail worker with durable history and activation boundaries, leases, retries, deduplication, bounded recovery and supervised receipt/intake admission. Keep delivery authority false until that worker and publication/readiness integration have passed review. Only messages arriving after explicit launch are eligible; historical import remains out of scope. The existing connected account, saved source and exact reviewed sample are already available locally; do not register another OAuth client or expose credentials.

Staging still needs its own reviewed source/migration/backup and environment/OAuth preparation. The shared workspace has many unrelated changes; do not deploy, reset, commit or push the whole tree.
