# Lead Capture lifecycle API

Status: **deployed and verified in staging** — November 1, 2026, following backend/UI review and deployment approval. This closes the missing mutation-handler gap identified during the staging revision/lifecycle checks. The existing confirmation dialogs and list/dashboard actions are connected; see the [UI verification](lead-capture-lifecycle-ui.md) and [deployment record](lead-capture-lifecycle-staging-20261101.md). Staging submissions and general publication activation remain disabled.

## Request and response

`POST /api/lead-capture/:sourceId/lifecycle` uses the existing application session and same-origin write boundary. The body contains `workspaceId`, `sourceId`, `requestId` (UUID), `expectedVersion` (current source version), `action` and `confirmed: true`.

| Action | Required permission, in addition to source read | Allowed current states | Extra body field |
| --- | --- | --- | --- |
| `pause` | `leadCapture.pause` | Active | None |
| `resume` | `leadCapture.pause` | Paused | `configuration: { kind: "approved", version: <current approved version> }` |
| `archive` | `leadCapture.archive` | Draft, active, paused or scheduled | None |

The command is strict: it rejects client-supplied actors, readiness, authority and mutable configuration bodies, missing confirmation, draft configuration selection, unsupported restore/duplicate actions and extraneous approved-version context on pause/archive. The path and body source identities must match. Roles and custom policies come from the existing catalog; there is no hardcoded role shortcut. The server's implemented-permission list now includes pause and archive alongside the existing capture actions. Office can archive under the default policy; Field cannot archive.

Success is `{ ok: true, sourceId, sourceVersion }`. Refresh the scoped source/list after success; the acknowledgment intentionally does not substitute for current state. Reuse the same request ID and exact command when a response is lost. A changed command needs a new request ID and a fresh source version.

The existing private/no-store and `Vary: Cookie` response policy applies. Cross-origin writes return 403; absent sessions return 401; unavailable identities or permissions return 404; version/state/idempotency conflicts return 409; invalid commands or failed readiness return 422; oversized bodies return 413. Readiness failures include the server's existing checked failure codes. Unexpected errors do not expose database details.

## Transaction and retention behavior

All actions take the established workspace/source locks, reauthorize the actor, compare the source version and record an actor-bound operation receipt plus a source event in the same transaction. Exact retries are reauthorized before replay, so revoked access cannot retrieve an old success. A retry after a later transition acknowledges the original operation without reversing the later transition.

Pause and archive cancel any pending launch/revision atomically and retain its immutable approved configuration as editable draft work using the existing restoration helper. They do not delete receipts, leads, pending Intake Review items, approved configurations, public identity or audit history. A paused source continues to reserve its published-source slot; archiving releases that slot. Scheduled/draft sources cannot be paused, and resuming an archived source requires a separate future restore workflow.

Resume selects the persisted approved version and ignores unpublished draft changes. It rechecks delivery authority, configuration/fields, assignment, owner access, plan/capacity and pending work. A confirmed, newly reviewed resume can clear a historical block after those checks pass; access recovery alone never resumes a source. Gmail sample checks use the retained approved sample's reviewed draft binding rather than an unrelated new draft head. Gmail delivery/cursor/backlog processing is not activated by this API.

Readiness remains fail-closed through `unavailableCaptureDelivery` in the HTTP handler. Production delivery authority is a separate activation checkpoint, not a client flag. Pause/archive remain available when delivery is unavailable.

If reconciliation discovers an access loss and advances the source version during resume, it commits that protective block and returns 409 afterward. The caller must reload/review the new version. Rolling that reconciliation back would cause repeated conflicts against a version that never persisted; the new transaction boundary prevents that loop.

## Verification

- **3,419 unit tests across 209 files passed**, including strict command validation and authenticated HTTP boundary coverage.
- **Eight new runtime-role database groups passed** on fresh disposable local databases: action-specific grants; Office/Field archive behavior; cross-workspace denial; actor-bound/revoked retry handling; draft/approved separation; default unavailable authority; receipt and pending-intake retention; assignment/access checks; explicit reviewed recovery; scheduled cancellation; legal states; concurrent commands; persisted reconciliation conflicts; and audit-failure rollback.
- **18 existing publication/capacity/scheduler database groups passed** after extracting their shared configuration checks.
- All workspace typechecks passed. Focused ESLint and whitespace checks passed; ESLint retains the existing React-version detection notice.

The database checks connect as `salesmora_web` and allocate/drop their own random local `_test` databases. They do not migrate or truncate configured application/test or hosted databases. The controlled audit-failure trigger exists only in that disposable database.

Run `pnpm test:lead-capture-lifecycle:db` for the database checks. The command requires the standard local test connection and previously provisioned local runtime roles. Request/response contracts are in `packages/contracts/src/lead-capture/lifecycle.ts`; the data service is in `packages/data/src/lead-capture/lifecycle.ts`; the HTTP handler is in `apps/web/src/app/api/lead-capture/[sourceId]/lifecycle/route.ts`.

The backend checkpoint required no schema migration or new UI component. The dialogs and authenticated browser flow were subsequently verified locally, then the reviewed backend/UI candidate was deployed as recorded above.

## Connected review metadata

Scoped source reads now include optional `lifecycleReview` metadata (source/approved versions, action capabilities and checked resume readiness), and list permissions include optional pause/archive capabilities. The server always supplies these new fields; older preview fixtures without them remain fail-closed. This projection is read-only and shares the mutation’s readiness implementation. The client binds the response to the requested tenant/source and requires current review metadata before opening an action.
