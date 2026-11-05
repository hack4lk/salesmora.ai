# Lead Capture integration step 3 — reviewed publication and source capacity

Prepared October 31, 2026 after approval of step 2 and its layout corrections. This checkpoint designs the next implementation slice. The existing product decisions in `lead-capture-plan.md` (Q9–Q11) remain authoritative.

## Result to deliver

Implement a server-owned setup review followed by explicit, version-bound approval. Approval, immutable configuration creation, stable publication identity, source-state transition, slot reservation, operation receipt and redacted audit event must commit together. A stale draft, revoked permission, unavailable dependency or full plan leaves all of those unchanged.

This is the publication control boundary. Real hosted pages, embed delivery and submission handling remain step 4; real Gmail authorization, sample binding and ingestion remain step 5. Do not report a source as operational or produce installation URLs while its delivery path is unavailable. Step 3 can verify its transaction and scheduling machinery with isolated readiness adapters; production activation stays disabled until the relevant real delivery dependency is available.

## Review and authorization

1. Load the saved source and draft using current workspace membership and `leadCapture.read`. Return exact source/draft/base-approved versions, current effective plan/capacity, server-derived readiness and configuration summary. Client-rendered rows, status badges and checkbox state are never readiness evidence.
2. Launch requires `leadCapture.activate`, the exact saved versions, an explicit confirmation and a request UUID. The server reloads everything under the workspace write lock, then the source lock. Requests cannot supply approver identity, arbitrary configuration or a capability grant.
3. Reject stale source/draft/base versions, archived sources, incomplete configuration and invalid timing. Check the selected teammate is still an active workspace member. Business-default assignment remains blocked until its approved authoritative setting/resolver exists; never silently interpret the missing setting as unassigned.
4. Gmail remains blocked until the real connection is authorized for this workspace and an approved retained sample matches the exact proposed account, rules, mappings and draft version. A client-supplied account ID or sample approval marker cannot satisfy this check.
5. Write an immutable approved configuration with server-selected version identities. Preserve field/choice identities and previously approved historical configurations. Clear only the published draft head; retain draft/sample history as required by existing references.
6. Idempotent retries reauthorize the current actor before returning a stored receipt. Actor, operation target and canonical payload fingerprint must match. Changed timing/content or another actor conflicts. Audit/receipt failure rolls back publication and slot acquisition.

## Capacity and concurrent launches

Use the current server-owned effective plan: Free 1, Standard 5, Premium unlimited published sources. Count active, paused and scheduled sources; drafts and archived sources do not consume slots. Access-blocked published sources still count. A revision never reserves a second slot.

The workspace write lock serializes count-and-reserve with other launches, restoration and billing transitions. Two sources racing for the last slot produce exactly one success. No separate provisional slot counter is needed unless implementation evidence shows a benefit; source state remains the reservation authority.

Scheduling a first launch reserves its slot when scheduling is approved, rather than when the worker wakes up. Evaluate known pending downgrade constraints as well as current capacity so a scheduled launch cannot bypass a committed plan change.

## Immediate publication and scheduled revisions

- First launch now: create the approved snapshot and publication identity and enter active only when the actual delivery dependency is ready.
- First launch later: create the approved snapshot, reserve the slot and enter scheduled with an unambiguous future instant plus the business timezone. Use database time and reject past instants; the UI continues rejecting ambiguous/nonexistent local times.
- Active revision now: replace the current configuration pointer atomically while retaining the website's stable publication identity. Historical receipts keep their original configuration/definition/workflow versions.
- Active revision later: keep the current approved version running until the scheduled switch. A pending revision needs an explicit persisted target configuration and activation instant; do not misuse `source.status = scheduled` or replace the current pointer early. The current foundation's single pointer/schedule fields cannot represent this alone, so add a forward-only migration for the pending publication transition.
- A scheduled transition is bound to its approved immutable target, source version and approving actor. It must never pick up later draft edits. Only one pending transition exists per source; replacing/cancelling one requires an explicit reviewed operation and version check, without deleting its historical evidence.

The worker claims due transitions safely across concurrent workers and rechecks effective entitlement, workspace/account status, current authorization, assignment readiness, configuration binding and delivery readiness under the same lock order. Failed prerequisites stop activation with a visible reason and an event. Retries cannot publish twice. Restored access does not silently activate a previously blocked transition.

## Billing transitions and access loss

Voluntary downgrade quotes identify sources that must be archived to fit the effective target plan at the downgrade boundary, including every published Gmail source when moving to Free. Confirmation rechecks under the workspace lock immediately before committing the billing intent. Never archive sources automatically or let a stale quote authorize an over-capacity downgrade.

For involuntary access changes, preserve sources, leads, intake and historical evidence. Stop affected intake and prevent scheduled activation. If published-source count exceeds the new limit, block all published sources as already approved in Q11e; never silently choose winners. Admins must archive excess sources and explicitly relaunch the retained selection. Paused or blocked sources remain slot-consuming until archived. Gmail entitlement loss blocks Gmail even when total source count fits.

Reconciliation must cover provider changes, staff override expiry and other effective-plan changes, using shared policy rather than provider-specific approximations. Record durable, deduplicated admin-notice intent and redacted events; only use an implemented delivery channel. Capacity recovery and upgrades never auto-relaunch sources.

## Connected page behavior

Keep the approved header/content/footer ordering. Replace placeholder readiness with the authoritative review projection. A failed publication preserves the draft and presents the appropriate permission, readiness, conflict or capacity state. An uncertain response retries the same request identity. Changes after review require refreshing/reviewing the current saved version.

Show real installation instructions only after step 4 provides the actual public origin, delivery route and publication projection. Until then, distinguish saved/approved/reserved configuration from an operational form. Do not use example-domain URLs or the existing simulated Storybook launch success as live evidence.

## Verification and completion checkpoint

Use newly allocated disposable databases and the actual runtime roles; do not migrate the user's configured databases or deploy.

- Concurrent last-slot launches; active/paused/scheduled counting; revision without an extra slot; unlimited Premium.
- Exact-version approval; stale edits; cross-workspace IDs; permission revocation/suspension; inactive teammate and absent default assignment.
- Retry equivalence; different actor/payload conflicts; failure between snapshot/publication/receipt/event writes rolls everything back.
- Scheduled first launch and active-revision switch; current version stays active until the switch; competing workers; stale/cancelled transitions; no silent activation after access recovery.
- Voluntary downgrade quote/confirmation races; pending effective-plan timing; forced overflow blocks all; Gmail loss independently enforced; override expiry.
- Stable publication identity across revisions; immutable historical version bindings; no fake operational success when hosting/provider readiness is absent.
- Connected review error/pending/conflict states, desktop/mobile layout, relevant unit tests/typechecks and the established application browser harness.

Deliver an implementation/QA checkpoint for user review before step 4 public hosting. No public deployment, provider OAuth action or live outbound message is part of this design checkpoint.
