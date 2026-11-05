# Lead Capture integration step 1 — implementation and verification

Verified October 31, 2026. The user approved the [step 1 design](lead-capture-integration-step-1-plan.md) in this chat. The contracts/persistence slice is implemented and user approved; step 2 page connections are authorized.

## Result

Added strict shared contracts under `packages/contracts/src/lead-capture/` for incomplete drafts versus complete website/Gmail configurations, stable field/choice identities, historical answers, workflow intent, retained samples/evidence, intake review and decisions, versioned lifecycle/schedule requests, source projections, operation receipts and redacted source events. Unknown fields and cross-type/version mismatches fail validation. Launch schemas require a complete typed configuration; draft saves can remain incomplete.

Added two forward-only migrations:

- `202610300007_lead_capture_foundation.ts` adds twelve tenant-owned tables for sources, immutable configuration versions, mutable drafts, retained Gmail samples, stable website publications, original inbound receipts, corrected intake proposals, server-created review snapshots, terminal decisions, durable operation receipts, redacted source events and lead provenance/custom answers.
- `202610300008_lead_capture_permissions.ts` renames stored capture-source grants to `leadCapture.*`, advances policy revisions and records an audit. Office archive becomes eligible/default for new workspaces and demonstrably untouched default policies. Customized or ambiguous existing policies retain their choices. Conflicting legacy/canonical grant scopes abort the migration transaction.

Composite foreign keys bind source, configuration, receipt, definition/workflow, review and lead references to their tenant and historical version. Unique receipts and terminal decisions prevent duplicate acceptance/decisions. Database guards preserve immutable evidence/history, reject stale intake decisions and cross-tenant lead targets, and allow deleted leads to leave a tombstone without erasing admission accounting or capture history. Workspace deletion cascades through the new tenant data while existing authorization audit retention remains unchanged.

Sample approval metadata can be recorded once; original sample content is immutable. A source that has not been published can switch a draft from Gmail to website without mutating retained Gmail evidence. Its old sample remains bound to its original draft version and cannot become website approval. Published source types remain constrained by their immutable configuration/publication history.

The canonical permission catalog, policy read adapter, new-workspace initialization, billing limit names, permission-editor labels and lead-origin read handling move together. New source/intake server capabilities remain absent from the live implemented-permission registry. No draft CRUD, capture route, publication, ingestion or intake-decision API is enabled by these migrations.

## Compatibility inventory

| Retained identifier | Boundary and removal condition |
| --- | --- |
| `campaigns.*` in `defaults-v1.json` and old migration/audit payloads | Frozen history. Policy reads map the explicit known aliases; new policy saves/cutover write canonical grants. Do not rewrite historical evidence or broaden a missing grant. |
| `campaign` resource | Explicit resource read adapter produces `capture_source`. Canonical permission requests/catalog entries use `leadCapture.*`. |
| `publishedCampaigns` | Explicit legacy-limit reader accepts it and rejects conflicting dual values. Current plan definitions and application references write/read `publishedCaptureSources`. |
| `campaign` creation origin | Historical creation evidence stays intact. Lead-origin reads normalize it to `lead_capture`; source editing remains locked for both legacy and canonical captured leads. |
| Old campaign help capability in the corpus manifest | The metadata reader maps the permission alias. Normalized article metadata changes its digest; future publication still requires the existing explicit digest approval. No corpus/provider publication occurred. Old stored capabilities cannot bypass the current feature/capability intersection. Full help terminology cleanup remains integration step 10. |
| Navigation key `campaigns`, prototype names and `/campaigns` links | Internal presentation/legacy references retained until routing/reference integration. The existing Lead Capture label remains. Old-route redirects and canonical page IDs are tracked for page connection/reference migration; this slice adds no product route. |

## Verification

- Full unit suite: **3,370 tests passed across 191 files**, including shared contracts, permission role ceilings/dependencies, billing, knowledge/publication safeguards and existing application behavior.
- All workspace TypeScript checks passed, including web, main worker, admin and audit worker.
- Targeted ESLint passed. The repository's React auto-detection emits its existing informational warning when linting package files; no code errors or warnings were reported.
- Storybook production test build passed.
- Permission editor: **21 browser cases passed**, seven stories at 1440px, 768px and 320px. Checks include interactions, Axe WCAG accessibility and overflow. New stories verify Office archive independently of setup editing/launch, the permanent Field archive ceiling, and disabled future-source controls. Existing default/Field/review/save stories also passed.
- Foundation PostgreSQL rehearsal: **16 grouped checks passed** after replaying all **108 current migrations** on a newly created disposable local database. Covers conflicting-alias rollback, fresh replay and upgrade, audited canonical grants/default preservation, new-workspace initialization, source/configuration tenant references, configuration versus record versions, immutable originals, Gmail sample/type handoff, transport uniqueness, proposal versus original evidence, historical reviews, stale and competing decisions, automatic website acceptance separation, operation rollback/immutability, actual runtime/staff grants, protection against temporary-table shadowing, lead deletion and workspace deletion. The rehearsal's temporary database was removed.
- Existing authorization rehearsal: **17 checks passed** in a separate disposable database. Existing lead read/write/assignment/export/notification rehearsal: **39 checks passed**. Existing plan-override/billing rehearsal: **9 checks passed**. Each database was removed afterward.
- New actual-service regression: **5 grouped checks passed** through the existing manual creation and chat proposal/confirmation functions using the `salesmora_web` runtime role. Concurrent retries preserve one lead/history/admission; Field and cross-workspace attempts deny; chat proposals and unfinished turns cannot create; explicit confirmation commits once; new creation obeys shared monthly capacity while successful manual/chat retries remain safe. No model was invoked. This rehearsal also creates and removes its own local database.
- Whitespace and documentation link checks passed.

An additional attempt to run the existing full application creation browser tests could not start: port 3002 was occupied, and a temporary application copy encountered framework dependency/root-resolution errors. No application-browser creation result is claimed. The actual service boundaries above were verified directly; the permission UI browser checks and database regressions passed. Page connection will require its own live application end-to-end checks.

## Reproduce locally

With Node 22, dependencies installed, local PostgreSQL running and the existing test runtime roles provisioned:

```sh
pnpm test
pnpm typecheck
pnpm test:lead-capture:db
pnpm test:lead-admission:db
```

The two new database commands require a distinct localhost `TEST_DATABASE_URL` ending in `_test`. They create randomly named disposable databases on that local server and remove them on completion; they do not migrate or reset the configured test, development or deployed application database. The admission command also requires the existing `DB_WEB_PASSWORD`. Credentials are not printed.

## Rollout and next checkpoint

These migrations were applied only inside disposable verification databases. No application database or deployed service was changed. The permission cutover is forward-only: a deployment must use a compatibility-first release sequence or drain/stop old web and worker processes before canonical grants are written, then start the matching application version. Policy revisions advance; proposals or approvals bound to the previous authority must be refreshed. Do not run the cutover while an old catalog continues serving requests; this rehearsal does not establish a zero-downtime rolling deployment strategy.

After review, integration step 2 adds authorized draft CRUD and source list/detail queries and binds the approved pages. Source publication/capacity reservations, actual public hosting/submission abuse controls, Gmail OAuth/ingestion, real intake decisions, assignment defaults, tag persistence, notifications and assistant behavior remain in their agreed later phases. Incomplete draft persistence must not be presented as working capture or an active provider connection.
