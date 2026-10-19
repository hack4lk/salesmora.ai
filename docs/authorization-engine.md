# Shared authorization engine — first implementation slice

Implemented October 12, 2026 from the [permission catalog](permission-catalog.md) and [authorization plan](authorization-permissions-plan.md).

## Implemented

- `packages/contracts/src/authorization`: 60 typed permission definitions, four fixed roles, default grants, supported resource scopes, dependencies, permanent eligible-role ceilings, protected Owner powers, and strict input/policy/change schemas.
- `packages/domain/src/authorization`: pure policy validation, default-policy templates, per-record authorization, collection query scopes, target-role safeguards, and Owner-only proposed policy-save validation.
- A local workspace dependency connects domain to contracts. Neither package imports Next.js, React, database clients, model providers, or queue clients.
- Unit tests cover all 240 default role/action combinations plus cross-workspace/identity denial, assignment/team relationships, related customer access, estimate/job relationships, current feature availability, unknown/duplicate/unsupported grants, field restrictions, escalation, protected powers, and revision checks.
- Vitest discovers unit tests only. Playwright browser/API tests keep their existing separate runner and isolated database lifecycle.

## Public domain API

| Function | Result and use |
|---|---|
| `createDefaultWorkspacePolicy(workspaceId, revision?)` | Fresh validated template, including documented proposed grants; not a saved or active policy |
| `validateWorkspacePolicy(unknown)` | Validated cloned policy or denial reason; rejects invalid roles/scopes, duplicates, role-ceiling violations, missing read dependencies and removal of protected Owner powers |
| `authorize(context, request)` | Action/individual-record decision; scoped actions require current server-resolved resource facts |
| `resolveAuthorizedCollectionScope(context, permission)` | Explicit resource/workspace/user/scope/revision constraints for lists, search, counts, reports and exports; never a blanket permission to query all rows |
| `authorizePolicyChange(context, change)` | Current Owner authority, same workspace, expected current revision and exactly-next candidate revision, with complete policy validation; does not write anything |

`AuthorizationContext` is a trusted server adapter input: session-derived user, current workspace membership, authoritative Owner ID, freshly loaded workspace policy, and server-configured implemented/entitled permission IDs. Schema validation checks shape and consistency; it does **not** prove that browser-supplied identity or resource facts are authentic. Never forward a client-provided context/policy/relationship list to this engine as authority.

Resource facts must be loaded through tenant-scoped repositories. Nested estimate/calendar jobs and customer relationships also validate workspace consistency. Field lead access requires current lead ownership; job access requires current ownership or team membership. Estimates require an assigned job plus enabled job-read access; limited customer data requires an independently authorized assigned lead/job. These relationships do not imply broader customer/history/lead access.

An allowed result reports the applicable scope. Callers must apply it in SQL before pagination, counts, aggregates or exports and must shape minimal DTOs. In particular, `related_assigned` is not permission to return a full customer row. Reports additionally return per-source lead/job scopes, intersected with each enabled read grant; revoking a source read removes it from report access. The initial report contract supports lead/job sources only; other report sources need explicit reviewed mappings. The [persistence slice](authorization-persistence.md) now implements isolated lead-list/count SQL adapters. Other resource repositories remain pending; current lead creation/count adapters are connected locally.

For `leads.update`, a nonempty requested field list is required and limited to ordinary lead fields. Assignment, stage, tenant, creator, audit, archive and deletion fields cannot pass through it. Other actions do not accept a generic field-authorization list; their strict payload schemas and business rules belong in their use cases. Callers must derive requested fields from the validated mutation itself, not a separate client assertion.

## Fail-closed behavior and protected constraints

Missing/invalid context, membership/Owner inconsistency, missing policy, unknown permission, wrong resource type/tenant, absent grants, incompatible scopes, and unavailable permission dependencies all deny. A missing policy never falls back to defaults. Policies cannot grant export/delete/archive outside Owner/Admin or protected powers outside Owner.

An explicit enabled-permissions set is required on each decision. It must be the server-owned intersection of implemented capabilities and applicable entitlements; model/browser/UI tool lists cannot populate it. Unreviewed catalog entries are denied independently, even if enabled or present in a default template. Home and assistant baseline access are now reviewed for all four roles. Current proposed entries include team directory, ordinary job update, intake-field editing, activity export and workspace deletion. Their metadata must be reviewed before those specific actions are connected.

Admin invitation/assignment/removal targets are limited to Office/Field. Only Owner can assign/remove Admin. Neither team operations nor ordinary policy rows can transfer ownership, remove the Owner, or modify the actor’s own membership through these paths.

The create-only lead assignment rule remains a catalog proposal. Until reviewed, customized create-without-assignment authority denies rather than silently assigning another teammate. Existing documented defaults have create and assignment enabled together for Owner/Admin/Office. The later create-lead adapter must still validate the actual requested owner against current workspace membership.

Policy-save validation is only the pure decision portion. The data adapter now locks/reloads current authority and revision and atomically saves policy/audit. The future HTTP editor boundary must add Origin, session and recent-authentication checks. A prior allowed result is not a reusable authorization token.

## Deferred to the next reviewed slices

The [database/repository slice](authorization-persistence.md) adds tested policy persistence, role conversion and scoped lead reads. Existing Home/lead/invitation server flows and current navigation are now connected, and the migration is applied locally. Field pipeline counts are restricted to directly assigned leads. The permission editor, chat runtime, future resource adapters and background workers remain pending. See [live cutover notes](authorization-live-cutover.md).

The engine evaluates permissions and record relationships. Business-state transitions, immutable history, retention/deletion eligibility, payload schemas, recipient checks, idempotency, quotas, database transactions, secret handling, invitation acceptance/replay, current-policy loading and revocation propagation remain required in the authorized use cases/adapters. Exactly-one-Owner consistency must be enforced transactionally during the later migration and ownership workflow, not claimed from pure input validation alone.

Next: implement the Owner-only Permissions screen and server Save boundary, then complete production security acceptance. See the [persistence and cutover notes](authorization-persistence.md).

## Validation

All 289 unit tests pass, including the 240 default role/action combinations and report-source revocation/scope intersection. Workspace lint/typecheck and production build passed; final contracts/domain builds verify the report constraint addition. No browser/database tests were needed for this pure, unconnected package slice.
