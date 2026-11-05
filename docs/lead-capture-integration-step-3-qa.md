# Lead Capture integration step 3 — publication and capacity verification

Implemented October 31, 2026 under the approved [step 3 design](lead-capture-integration-step-3-plan.md). User approved this implementation checkpoint October 31, 2026. Continue with the step 4 hosting design.

## Delivered behavior

- Server-derived review binds approval to the saved source, draft and previous approved version. Current membership, activation permission, configuration, assignment, capacity and delivery prerequisites are checked again inside the publication transaction.
- Approved immutable configuration, stable website publication identity, source state, capacity reservation, operation receipt and redacted event commit together. Exact retries reauthorize the actor and return the original receipt; changed actors or payloads conflict.
- Workspace locking serializes last-slot launches and billing changes. Active, paused and scheduled sources consume capacity, including blocked sources. Revisions reuse their source's reservation.
- Scheduled revisions retain the running configuration until the worker applies the immutable target. Cancelled or blocked transitions retain history and restore editable work. Failed prerequisites and restored access never silently activate a source.
- Voluntary downgrades identify affected sources and recheck before billing intent/provider mutation. Effective-plan reconciliation handles overflow, Gmail entitlement loss and staff override expiry, with deduplicated in-app owner/admin notices. Staff enqueue access checks without receiving permission to update capture sources.
- Connected review uses authoritative checks and preserves error/conflict states. Its approval callback does not display the simulated launch result or installation artifacts.

## Delivery and rollout limits

Actual website hosting/embed/submission delivery remains integration step 4. Gmail authorization, retained sample approval and ingestion remain step 5. Production readiness adapters intentionally return unavailable. No operational launch or installation URL is available through this checkpoint.

The forward migration `202610310002_capture_publication.ts` adds publication transitions, access-check intent and admin notices, and extends runtime grants/event constraints. The worker checks that publication tables exist before starting its periodic reconciliation. Apply the reviewed migration chain before running the updated application/worker against a persistent environment.

The user's configured databases were not migrated for this checkpoint. Database verification allocated and removed a fresh local database, using the actual web, worker and admin roles. No deployment, OAuth action or outbound message was performed.

## Verification

Completed before the interrupted chat ended:

- All 3,395 unit tests across 198 files passed.
- Publication database rehearsal passed 18 groups: unavailable delivery/default assignment, last-slot races, scoped/version-bound approval and actor-bound retries, revision identity/capacity, competing schedule workers, cancellation and blocked recovery, atomic rollback, downgrade quote/confirmation/provider retry checks, forced overflow, durable loss before recovery, override expiry and admin-role boundaries, Gmail entitlement loss, approving-user permission loss, workspace suspension, pending downgrades and unlimited Premium.
- Connected Chromium application flow passed, including blocked real publication without an approved snapshot/publication artifact.

Resume verification completed October 31, 2026:

- All workspace typechecks passed again. The web typecheck also passed after the final preview callback correction.
- All 22 review-page stories passed interactions, Axe WCAG A/AA checks and horizontal-overflow checks at 1440px, 768px and 320px: 66 cases. The new authoritative-receipt story confirms the approval callback does not invoke simulated launch or display a fake operational URL/status. Desktop/mobile default screenshots were visually inspected.
- Corrected the preview callback type declaration after browser checks caught unsupported Storybook indexed-access type metadata. The final run had no browser errors or accessibility violations.
- Focused lint and `git diff --check` passed. The initial broad focused lint emitted only the repository React-version detection notice; final preview lint was clean.

Local review: [connected saved review](http://127.0.0.1:6010/?path=/story/lead-capture-connecteddrafts--saved-review) shows authoritative delivery/workflow blockers. The [authoritative receipt preview](http://127.0.0.1:6010/?path=/story/lead-capture-capturereviewpage--authoritative-receipt) exercises the approval callback with an explicit simulation. Storybook remains a fixture preview.

Reproduce core checks with Node 22 and pnpm:

```sh
pnpm test
pnpm -r typecheck
pnpm test:lead-capture-publication:db
pnpm test:lead-capture-drafts:e2e
```

The publication rehearsal requires the existing local test connection/roles and creates its own disposable database. Never substitute a production connection. The established browser harness also allocates a separate database.
