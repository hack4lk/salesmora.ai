# Estimates: remaining features implementation plan

Status: **Slices 1-8 are locally implemented and user-approved. All Slice 9 assistant operations are implemented and user-approved, including permanent Draft deletion, Estimate-to-Job conversion and the review-only CSV handoff (sections 24-44). Final cross-operation local acceptance passed and was user-approved (section 45). The authorized non-production Estimate provider-backed acceptance passed after fixing an unsupported JSON Schema union (section 46) and awaits review. Production rollout remains separate and unapproved.**

This is a current implementation-gap audit and a companion to the [approved Estimates plan](estimates-page-plan.md). Existing product decisions remain approved; the sequence and unresolved integration details below need review. Implement one agreed slice, demonstrate it, and stop for feedback before proceeding.

**Current step:** Final cross-operation local acceptance is user-approved. The non-production Estimate provider-backed acceptance passed and awaits review (section 46). No customer email, deployment or production operation was used; production rollout remains separate.

## 1. Summary

The main gap is **connecting the approved components to real lifecycle operations**, not redesigning the estimate editor. Draft editing, the three-step creation flow, customer paper, payment links, sharing and local email delivery are already connected.

The cancellation workflow already designed in Storybook is **Void estimate**:

| Operation | Purpose | Current integration |
|---|---|---|
| Delete Draft | Permanently delete a never-shared Draft after typed-number confirmation | Connected in the editor and list |
| Void estimate | Withdraw a Sent/Published estimate, disable its customer link, and retain its frozen paper and staff history | Connected in the editor and list |
| Archive / Restore | Hide or restore an eligible closed record without deleting it or changing its status | Connected in the editor and list; review-approved |
| Record Declined | Record the customer's decision; this is not cancellation by the business | Connected in the editor, alongside Accepted and corrections |

These are estimate operations. None cancels a Job, collects/refunds a payment, recalls an email, or introduces a separate invoice lifecycle.

**Completed and review-approved locally:** Void, the live shared-record status rail, paged staff history, Accepted/Declined decisions and reasoned corrections, revisions/supersession/family history, scheduled expiry, Archive/Restore, listing Duplicate/Delete/Create revision, and accepted-Estimate-to-Job conversion. Final Slice 6 approval was received on October 26, 2026.

## 2. Review evidence and current coverage

### Review scope

- Baseline audit inventoried **39 groups / 1,345 scenarios** across `Estimates/*` and `Assistant/Estimate*`; delivered slices add connected-form and decision composition stories. This is an inventory, not a claim that all scenarios were rerun.
- Compared story components, preview eligibility/validation and the approved requirements with the live routes, permission gates, data services, worker startup, linked-record entry points and assistant registry.
- Inspected rendered Void, decision, Restore, conversion and export dialogs. Conversion already uses the Jobs review dialog; it should not be rebuilt.
- The assembled [editor-page stories](../apps/web/src/features/estimates/estimate-editor-page/estimate-editor-page.stories.tsx) are fictional. Lifecycle requests do not persist; Revise only reports that a new Draft was requested.

### Already connected: preserve rather than rebuild

| Area | Working local functionality |
|---|---|
| List | Authorized SQL-scoped records, search/filter/sort, numbered paging, metrics, archived/older-revision inclusion filters and all row-menu callbacks with current per-record grants |
| Drafts | Create/read/update, lead/job picker, Materials lookup, calculations, scope, terms, private notes, editor/list Duplicate and Delete |
| Business settings | Persisted identity/defaults/payment presets, version checks, encrypted/validated logos |
| Creation flow | Details -> Review -> Send, inline numbered progress, saved review/version/hash checks, Review Print Preview in a separate tab |
| Customer output | Saved-Draft preview, immutable shared paper/logo, signed-out customer page, browser Print |
| Payment option | Optional HTTPS URL, Pay Now with readable URL beside it on paper/email; no payment callout on Send |
| Sharing/delivery | Send, Publish, Copy active link, separately confirmed Resend, local Mailpit worker/retries/delivery states, email attribution |
| Decisions | Record Accepted/Declined, saved decision metadata, reasoned and metadata-only corrections, immutable entries, frozen accepted amounts and staff history |
| Revisions | Snapshot-derived Drafts, one pending revision, durable numbering, atomic supersession and paged family history |
| Expiry protection | Date-derived Expired status plus immediate/minute worker persistence, inactive-link checks and stopped queued delivery |

### Remaining inventory

Storybook links below use the existing local server.

| Feature | Existing prototype / source | Live gap | Slice |
|---|---|---|---|
| Status/action rail | [Status panel](http://127.0.0.1:6006/?path=/story/estimates-estimatestatuspanel--sent), [action eligibility](../apps/web/src/features/estimates/estimate-actions.ts) | Connected for implemented actions and saved decisions; conversion creation remains for its slice | 1-2 complete; extend per slice |
| Staff history | [Timeline](../apps/web/src/features/estimates/estimate-history-timeline/estimate-history-timeline.tsx) | Authorized bounded read API/DTO and live display connected; extend event adapters with future lifecycle writes | 1 complete; extend per slice |
| Void / withdraw | [Sent review](http://127.0.0.1:6006/?path=/story/estimates-estimatevoiddialog--sent) | Connected mutation, token revocation, queue coordination, history and editor/list refresh | 1 complete |
| Record/correct decision | [Accept review](http://127.0.0.1:6006/?path=/story/estimates-estimatedecisiondialog--accept), [validation](../apps/web/src/features/estimates/estimate-decision-dialog/estimate-decision-dialog.preview.ts) | Connected contracts, services, API, status panel/dialog, saved metadata and immutable history | 2 complete |
| Revise / supersession | [Editor stories](../apps/web/src/features/estimates/estimate-editor-page/estimate-editor-page.stories.tsx), [domain states](../packages/domain/src/estimates/state.ts) | Detail/list creation, supersession and family history connected | 3 complete; list extension verified in 4 |
| Scheduled expiry | [Approved REV requirements](estimates-page-plan.md#68-revisions-expiry-void-archive-rev) | Worker persistence, once-only activity, shutdown/restart and read-time expiry connected | 3 complete |
| Archive / Restore | [Archive](http://127.0.0.1:6006/?path=/story/estimates-estimatearchivedialog--archive), [Restore](http://127.0.0.1:6006/?path=/story/estimates-estimatearchivedialog--restore) | Mutations, permission enablement and approved editor/list dialogs connected and approved | 4, Archive/Restore approved |
| List action menu | [Row menu](../apps/web/src/features/estimates/estimate-row-menu/estimate-row-menu.tsx) | Open/Duplicate/Revise/Void/Archive/Restore/Delete connected and review-approved | 4 complete |
| Lead/job/customer links | [Related Estimates card](http://127.0.0.1:6006/?path=/story/estimates-relatedestimatescard--lead), [lead-stage suggestion](http://127.0.0.1:6006/?path=/story/estimates-estimateleadstagesuggestion--after-send), [linked-record stories](../apps/web/src/features/estimates/estimate-linked-record/estimate-linked-record.stories.tsx) | Shared card, host compositions, authorized related reads and direct creation connected and user-approved. Suggestion component is integrated locally with exact version/authorization rechecks and explicit confirmation | 5 complete; approved |
| Convert Accepted to Job | [Conversion review](http://127.0.0.1:6006/?path=/story/estimates-estimateconvertdialog--review) | Atomic conversion service, real customer/member data, receipt and bidirectional links connected locally and approved | 6 complete; approved |
| Notifications/reminders | [Approved NTF requirements](estimates-page-plan.md#610-notifications-ntf), [shared notification store](../packages/data/src/notifications/store.ts) | Estimate event projection, inbox/unread/read/deep links, preferences and staff email/reminder worker connected locally and review-approved | 7 complete; approved |
| CSV export | [Export review](http://127.0.0.1:6006/?path=/story/estimates-estimateexportdialog--default) | Authorized filtered streaming endpoint, matching columns/count/cap, actual download | 8 complete locally; review pending |
| Assistant | [Draft card](../packages/ui/src/assistant/estimate-draft-card/estimate-draft-card.stories.tsx), [Estimate card sources](../apps/web/src/features/estimates) | Estimate surface/context, tool contracts/handlers, result rendering, durable proposals and confirmed executors | 9 |
| Production sharing/delivery | [Current local-sharing gate](../apps/web/src/server/estimates/local-sharing.ts) | Deployment/provider/public-origin readiness; local Mailpit is not production delivery | Separate rollout gate |

### Foundations that exist but do not constitute finished features

- The [foundation migration](../packages/data/src/migrations/202610230001_estimates_foundation.ts) already has decision/archive/void/supersession columns, activity, operation receipts, and the Job's `acceptedEstimateId`. Do not create a parallel lifecycle store.
- The current [server permission list](../apps/web/src/server/authorization/permissions.ts) enables Draft operations, Void, Decide, Archive/Restore, locally gated Send and Estimate export. Export uses its existing Owner/Admin catalog grants and also requires Estimate read access.
- The [live editor](../apps/web/src/features/estimates/estimate-editor-page/estimate-editor-route.tsx) now composes the real shared-record status/history rail. It explicitly disables the remaining unimplemented lifecycle capabilities.
- Public reads distinguish withdrawn/replaced/expired links. Authorized withdrawal and revision/supersession writes are connected.
- Default latest-revision filtering, revision creation and the revision panel are connected. Restore must preserve those filtering rules.
- First-view activity is already written; first-view **notifications** are not.

## 3. Shared implementation rules

Apply these within each vertical slice, not as a large infrastructure-only project:

1. Reuse the approved dialogs, shared action matrix, domain states, copy conventions and existing API/data error patterns. Never pass fictional permissions or records into live components.
2. Reauthorize the workspace, membership, record, parent and action at read/review/commit. Field scope remains assigned-job only. Inaccessible related records must not leak through counts, links or history.
3. Bind commands to the actual record/version and applicable frozen snapshot. Explicit conflict responses require reload and another review; do not silently retry a changed command.
4. Reuse existing receipts/transaction patterns for repeatable confirmations. Add narrowly scoped migrations where necessary: Void/Revise/Archive/Restore are now supported in local development and the isolated test database.
5. Commit state, token changes, activity and operation receipts atomically. Follow the existing workspace/record/token/outbox lock discipline across public reads, sharing and delivery; prove serialization with database concurrency tests.
6. Enable a permission only when its server path, live UI and tests are ready. UI hiding never substitutes for server enforcement.
7. Keep frozen content/hash/logo immutable, including legacy snapshots without a payment-link property. No fallback to mutable Draft, profile or catalog data.
8. Keep reasons, correction notes and internal history out of customer pages, print and customer email. History should identify changed fields rather than copy private text or payment URLs.
9. Preserve the approved three-step flow and latest copy/layout refinements. No fixed disclaimer reintroduction, payment provider, online decision signing, PDF generation or automatic customer follow-ups.

## 4. Proposed delivery slices

Each slice ends with focused story/contract/domain/data tests, applicable database journeys and a real browser demonstration. Stop for review before the next slice.

### Slice 1 - Real status/history and Void estimate

**Delivery:** connected locally; see section 8 for verification and review boundaries.

**Reuses:** status panel, row menu, Void dialog, history timeline, public withdrawn view.

- Add a server-owned lifecycle/history projection and bounded history endpoint. Map existing persisted event names/payloads to the approved timeline instead of assuming they already match its preview union.
- Render only what older events actually recorded; do not invent historical field diffs. Extend future writes with the safe field-change metadata needed by the timeline.
- Show saved status, revision and authorized actions on shared records without replacing the Details/Review/Send shell.
- Connect history loading, older events, explicit errors/retry, actor/source/timezone and staff-only reasons. Add a payment-link *field label* when reporting edits; do not expose its URL as a history change.
- Add the Void command: only effective Sent/Published, unarchived records; required trimmed reason, 1-500 characters; `estimates.void` for eligible Owner/Admin/Office.
- In one transaction, validate status/version, set Void/reason, revoke active tokens, record history and persist the confirmation receipt.
- Coordinate queued/retry delivery with withdrawal. Mail must not be submitted after a completed Void; SMTP already accepted before withdrawal cannot be recalled.
- Wire Void from the editor and list menu, retain the record/paper internally, and refresh list metrics, status, history, Copy/Resend availability and public view.

**Acceptance:** Sent and Published can be withdrawn; invalid reasons, stale versions, expired/accepted records and denied/cross-workspace requests make no changes. Repeated confirmation produces one event. Old page and logo links show no paper. Void/public-read/delivery races have deterministic outcomes. No Job, decision or payment changes.

**Review checkpoint:** demonstrate withdrawing one Sent record and one Published record, including the customer-facing withdrawn state and retained staff history.

### Slice 2 - Decisions and corrections

**Delivery:** approved and connected locally; see section 9 for verification and review boundaries.

**Depends on:** Slice 1's live lifecycle/history integration.

- Connect Accept/Decline to the existing decision dialog. Record only from effective Sent/Published; require an actual valid date no later than workspace today, channel, and optional note of at most 500 characters.
- Enforce `estimates.decide`; eligible Field users may record decisions only for assigned-job estimates. Corrections require Owner/Admin/Office plus the grant.
- Persist the outcome, decision metadata and accepted amount from the validated frozen snapshot. Lock the record and add an immutable decision event/receipt.
- Connect correction from Accepted/Declined with the current matching decision/version and required reason of at most 500 characters. Preserve both entries; support correcting metadata without changing the outcome.
- Update list metrics/status/history without emailing the customer or creating a Job.
- Preserve the existing public-link eligibility for Accepted/Declined until token expiry/revocation; recording or correcting a decision never renews the link. Verify queued-delivery/Resend eligibility after the status changes.
- Cover correction after conversion: never silently cancel/delete/rewrite the existing Job. The approved presentation retains its authorized link with a **Job unchanged** notice; see section 6.

**Acceptance:** valid Accept/Decline and correction persist; future/invalid dates, long notes/reasons, expired state and stale or revoked access fail explicitly. Two concurrent decisions cannot overwrite each other. The captured accepted total never comes from mutable fields.

**Review checkpoint:** demonstrate Accept, Decline and a reasoned correction, including history and unchanged customer paper.

### Slice 3 - Revisions, supersession, revision history and scheduled expiry

**Completed locally and user-approved (October 26, 2026):** the revision-history panel, lifecycle foundation, replacement-review component, live revision integration and scheduled expiry are approved. Revision/family APIs, detail-page Revise/history, Send/Publish confirmation and the scheduled expiry worker are connected; see sections 13-14. The user chose one pending Draft per family and carried payment links with explicit re-review before sharing.

**Depends on:** Slice 1 for live history/action wiring. Revision and expiry services can be developed independently; this grouping is a review sequence, not a false data dependency.

- Connect Revise on eligible Sent/Published/Declined/Expired records using the existing grants/action matrix. Create a new Draft with the same number and next revision, prefilled from the prior frozen snapshot.
- Establish source/family lineage and concurrency rules. Creating or deleting a revision Draft must not withdraw the currently shared revision.
- Route the revision through the existing Details -> Review -> Send flow. One pending Draft per family; another Revise opens it. Carry the payment URL but require explicit re-review of that URL against the current revision before Send/Publish; confirmation must be bound to the reviewed version/hash.
- Extend the existing Send/Publish transaction: revalidate predecessor/version, commit the new frozen revision, mark the prior revision Superseded, and revoke its tokens atomically.
- Coordinate old queued emails with replacement; old customer links show the approved replaced state without exposing the new token.
- Add a **storied revision-family panel** before integrating it into the page. This panel is approved in requirements but is not an existing finished component: show authorized revisions, status, total and Open.
- Persist Expired once after valid-until ends in workspace timezone; use the same date authority as reads/public access. Retry/restart safely and do not overwrite a concurrent decision, Void or supersession.

**Acceptance:** revise/edit/delete keeps the original active until successful Send/Publish; failed sharing never partially supersedes it. Concurrent revisions/sends cannot reuse a revision or leave two active predecessors. Old frozen hashes remain valid. Expiry passes end-of-day, timezone/DST, restart and concurrency tests.

**Review checkpoint:** complete a revision and inspect both customer links, family history and a date-boundary expiry.

### Slice 4 - Archive/Restore and complete list actions

**Completed locally and user-approved (October 26, 2026):** Archive/Restore and Open/Duplicate/Revise/Void/Archive/Restore/Delete listing callbacks are connected, verified and approved; see sections 15-17.

**Depends on:** Slice 1's lifecycle plumbing. It does not require conversion, export or assistant work; it can move earlier if preferred.

- Connect Archive for Declined/Expired/Superseded/Void, and Restore for archived records, using `estimates.archive` and the existing dialog.
- Preserve status, decisions, snapshots, revision identity and history; toggle only archive metadata plus version/activity/receipt.
- Refresh default/included list results and metrics. Restoring an older revision still obeys latest-revision/filter rules; never renew any customer link.
- Complete row-menu callbacks for Open, Duplicate, Revise, Void, Archive, Restore and Delete as their handlers become available.
- Reuse the already-connected Duplicate/Delete services and typed-number Delete confirmation. Do not build second implementations for the list.

**Acceptance:** no Archive on Draft/Sent/Published/Accepted; Restore never changes status or link validity. Editor and list agree on eligibility, conflict handling and permissions. Duplicate still clears recipient/date/payment as designed; Delete still cannot remove a shared record.

**Review checkpoint:** archive/restore a closed record and demonstrate list Duplicate/Delete.

### Slice 5 - Related records, direct entry points and lead suggestions

**In progress (October 26, 2026):** the user's "go" after final Slice 4 approval started this slice. The reusable Estimates card in Storybook is user-approved (section 18); the subsequent "go" approved connecting host compositions/reads and creation entry points (section 19). The user's "approved" at 09:10 confirms that integration. The 09:11 "go" started the separate lead-stage suggestion component; its behavior was confirmed interactively and the user's "approved" at 09:26 confirmed the component. The subsequent "go" delivered live suggestion integration, now awaiting review sign-off (section 20).

**Dependencies:** existing Draft APIs suffice for related lists and Create estimate. Decision suggestions additionally require Slice 2.

- Connect authorized related-estimate lists/cards on lead, Job and customer views, reusing existing linked-record presentation and SQL scoping.
- Replace coming-soon/disabled Create estimate entry points with the current editor and an authorized, server-validated parent seed.
- Surface existing-open-estimate warnings consistently; never allow a query parameter to bypass parent access or silently create duplicates.
- After Send, offer the already-approved **Estimate sent** lead-stage suggestion. After Decline, offer **Lost** or keep open; after Accept, offer conversion when available.
- Use existing lead mutation/confirmation behavior and permissions. Suggestions never change stages automatically or alter a Job.
- Add/update stories for host-page compositions before route integration.

**Acceptance:** lead/Job/customer views show only permitted estimates and correct deep links; inaccessible parents do not leak. Create prefills the intended parent. Dismissing a suggestion does nothing; confirming revalidates the lead/version/grant.

**Integration review checkpoint:** inspect related estimates and Open on lead/Job/customer pages; start from a lead and a Job, and select a related parent from a customer. Navigation alone must not create a Draft. Review this integration before the separate stage-suggestion step.

**Final slice review checkpoint:** after the separately reviewed suggestion implementation, accept/dismiss a stage suggestion and verify its explicit confirmation.

### Slice 6 - Convert an Accepted lead estimate to a Job

**Depends on:** Slice 2. Slice 5 improves navigation but is not required to make conversion atomic.

- Reuse the existing conversion dialog and Jobs form contracts. Supply real active members, customer access, assignment and scheduling capabilities.
- Allow only Accepted, unarchived, lead-linked estimates with a valid frozen snapshot and accessible customer; require the Jobs creation/assignment/read grants already enforced by the Jobs service, plus scheduling permission when dates are supplied.
- If the customer is missing, use the existing link/create-customer prompt and re-review before conversion. Never invent or silently link one.
- Prefill title/service/location/scope; show the immutable accepted amount read-only. Do not turn estimate items into Work Orders or record a payment automatically.
- Extract/reuse a transaction-level Jobs creation helper as needed. The current `createJob` opens its own authorization transaction; do not call it as a separate committed operation before setting the estimate link.
- Atomically create the Job/team/calendar effects and Job activity, set `acceptedEstimateId`, bind the estimate's converted Job, and write estimate history/receipt.
- Enforce at-most-once conversion at the database boundary, including existing one-Job-per-source-lead checks. Job-linked estimates open the existing parent Job instead.

**Acceptance:** simultaneous confirmations create one Job; retry returns the authorized existing result. Job-creation/link/calendar failure rolls back everything. No schedule without its grant, inaccessible customer/member, second Job for the lead, or conversion of non-Accepted/archived records.

**Review checkpoint:** convert an accepted lead estimate, open the linked Job and return to its source estimate.

### Slice 7 - Notifications and expiry reminders

**Dependencies:** existing sharing/delivery/first-view events; Slice 2 for decisions; Slice 3 for persisted expiry. Add projections incrementally without blocking unrelated lifecycle slices.

- Extend the existing notification contracts, scoped inbox/read/unread projection, preference Settings and email outbox patterns rather than building a separate inbox.
- Support Sent, delivery failure, first customer view, decision recorded, expiring soon and Expired. Bounce requires a real provider event source; a preview state or Mailpit acceptance is not a bounce integration.
- Deduplicate recipients: estimate owner and parent owner/assignee, excluding the actor. Reauthorize visibility at inbox read and before email submission.
- Keep in-app on; email follows the shared per-user preferences. Add the estimate preference through the existing Settings contract/UI if needed, preserving unrelated preference values.
- Schedule the approved default three-day staff reminder using workspace dates and a durable deduplication key. Recheck current state/revision/access before emitting it.
- Keep notifications minimal: number/name/status/link, no total, contact information, notes or payment URL. Do not generate customer reminders.

**Acceptance:** one first-view alert, one reminder per eligible revision/date/recipient, and one expiry event despite retries. No self-alerts, stale-access leaks or email after opt-out. Read/unread/paging/deep links work with the existing notification kinds.

**Review checkpoint:** show an inbox event, email preference behavior, a reminder and duplicate suppression.

### Slice 8 - Filtered CSV export

**Dependencies:** existing authorized list/query infrastructure, not decisions/conversion/notifications.

- Connect the approved export dialog to a protected streaming endpoint and the existing list filters/sort/revision/archive semantics. Preview the authorized count and reject counts above the configured cap, initially 50,000.
- Reuse shared CSV escaping, cancellation/streaming and authorization patterns from [existing exports](../packages/data/src/leads/export.ts).
- Use `estimates.export`, default Owner/Admin under the current catalog. Do not silently broaden eligible roles.
- Reconcile the story's placeholder column choices with approved EXP-3: number, revision, name, status, customer, parent type/id, owner, total, sent date, valid until, decided date, decision channel.
- No line items, private notes, contacts or payment URL. Preserve date-only fields as dates; timestamps use UTC ISO. Neutralize spreadsheet-formula prefixes and quote safely.
- Remove fictional download copy when live; make the cap server-owned, not the current hardcoded story-only message. Reauthorize rows as required by the shared export rules.

**Acceptance:** actual CSV matches current filters and approved headers; test zero rows, cap/cap+1, escaped text/formulas, permissions lost during export, abort and stable pagination. No async export/PDF path.

**Review checkpoint:** download filtered data and compare it with the visible authorized list.

### Slice 9 - Estimate assistant integration

**Depends on:** the real operation being exposed. Read tools can ship before lifecycle tools; no card gets a fake or independently implemented executor.

**Current implementation status:** All eight read-only operations and every approved assistant operation are connected and user-approved. The approved Summary card is connected to bounded search/list/aging results and checked navigation, including live streaming, restoration and retained-evidence checks (section 25). Detailed reads and each proposal family—including permanent Draft deletion—are connected and reviewed (sections 26-42). Estimate-to-Job conversion and the separate review-only CSV handoff are user-approved (sections 43-44). Cross-operation local acceptance passed; its results are recorded in section 45. Production/provider rollout remains outstanding.

- Add estimate list/detail surfaces, record references, page context and permitted tool IDs to the shared chat contracts, server context/prompt registry, handlers and client result renderers.
- Connect read/search/summary/aging/preview first. Reuse list scoping, metric definitions and authorized frozen/Draft projections; summary remains bounded to the approved ten visible rows with Open in list links.
- Connect the existing Draft card for **create/update**. That prototype does not already implement Revise/Duplicate proposals. Map those operations to the approved shared confirmation presentation when their services are ready.
- Connect Send/Publish/Resend, decision/correction and lifecycle operations to the corresponding real backend/shared dialog. The separate CSV export handoff and Estimate-to-Job conversion are documented in sections 44 and 43; conversion opens the existing review form and is not itself confirmation to create a Job.
- Persist proposals bound to membership/policy, input hash, parent and record versions, with the approved 15-minute lifetime. Confirm/Cancel are explicit user actions; model tools cannot commit.
- Preserve approved pricing provenance; no invented prices or copying internal notes into customer text. Reconcile older card projections with payment-link changes before enabling them.

**Acceptance:** conversation alone never sends/mutates/converts/exports. Expired, superseded, changed-policy/version and cross-workspace proposals fail safely. Confirm/retry is idempotent; cancellation is non-mutating. All tool results/cards/context paths have registered contract/rendering coverage.

**Review checkpoint:** demonstrate authorized read -> Draft proposal -> explicit confirmation, then enable remaining cards one operation at a time.

## 5. Rollout and regression gates

Local sharing and Mailpit are working; do not reopen them as missing implementation. Conversely, do not remove their local-only guards as a side effect of lifecycle work.

- Production rollout remains a separate approval: public HTTPS origin, trusted-client rate-limit identity, provider configuration, encrypted-token recovery/key management, public page/logo behavior, worker deployment and operational observability.
- Provider bounce callbacks require authenticated, replay-safe event ingestion and delivery matching before "bounced" is a live event.
- Every slice preserves Draft CRUD, exact totals, business presets/settings, legacy and new snapshot hashes, logo access, separate delivery recipient, payment-link validation/display, Review Print Preview, and Send/Resend receipts/retries.
- Use the smallest relevant contract/domain/component suites and database journeys. Add end-to-end journeys for the actual mutation, customer-link outcome, permission loss, concurrency and retry, not just a successful dialog close.
- New/changed page compositions need stories, keyboard/focus/mobile and accessibility checks. Keep private panels out of browser print.
- Validate list performance against the approved P95 <300 ms / 10,000-estimate target when changing family/history/filter queries. Verify CSV's exact column shape and threshold independently.
- Update the approved plan's delivery log after each reviewed slice; do not label a feature connected merely because its schema, story or permission exists.

## 6. Integration details to review before their slice

These are gaps between approved behavior and implementation details, not a reopening of the original product decisions.

| Detail | Proposed resolution / review boundary |
|---|---|
| Pending revision Drafts | **Decided October 25:** one outstanding Draft per family; another Revise opens it. Add transactional/uniqueness protection. Deleting it leaves the shared predecessor active and does not reuse its revision identity. |
| Revise and external payment URLs | **Decided October 25:** carry the prior frozen URL, but require explicit re-review before sharing because checkout links may be amount-specific. Bind confirmation to the current revision/version/hash; never treat a carried URL as silently approved. Duplicate continues to clear its URL. |
| Correction after conversion | **Decided and connected in Slice 2:** allow correction, retain the Job and conversion audit, and show its link only with `jobs.read`, alongside a **Job unchanged** notice in the review and status panel. Job changes require separate authorized actions. |
| Delivery after a recorded decision | **Verified in Slice 2:** Accepted/Declined stops queued/retry mail and disallows Resend. In-flight SMTP completes before the decision commits; already accepted mail cannot be recalled. Existing customer paper remains accessible only until the original token expiry/revocation; no renewal or replacement token is created. |
| Export mismatch | Prefer approved EXP-3 over placeholder story columns; review the updated column picker before integration. Keep current catalog role eligibility; broader granting requires a separate explicit policy decision. |

## 7. Out of scope

No online acceptance/signature collection, payment processing/refunds/status tracking, separate invoice accounting, automatic customer follow-up, reusable estimate templates, itemized CSV, bulk lifecycle actions, generated PDF/attachments, legal-copy redesign or automatic Job/lead-stage changes.

**Next review:** Slice 3's verified data foundation, before the next live page and worker integration step.

## 8. Slice 1 delivery and verification

Approved by the user's "go" after the remaining-work plan. Implemented locally on October 24, 2026:

- `GET /api/estimates/[estimateId]/lifecycle` reauthorizes each request and returns 25 events per page with full-precision timestamp/ID cursors. Legacy events show only recorded metadata; unknown/invalid events fail explicitly.
- `POST /api/estimates/[estimateId]/void` enforces origin, identity, permission, effective state, expected version, 1-500-character private reason and actor-bound idempotency. Status/reason/version, token revocation, stopped queued/retry mail, history and receipt commit together.
- Existing workspace locks serialize withdrawal with public paper/logo reads and worker SMTP submission. A transport already accepted before withdrawal stays Sent; withdrawal cannot recall it.
- Live editor and list reuse the approved Void dialog. Changed versions require Reload and another review. The editor keeps successful withdrawal feedback without a server refresh that would remount and clear it.
- Staff can inspect retained frozen paper after Void. Customer paper/logo links are withdrawn, Copy/Resend are unavailable, history/private reasons never print or reach the customer, and no Job/payment changes occur.
- Added Shared lifecycle, Withdrawn lifecycle and permission-denied composition stories. Decision controls were subsequently connected in Slice 2; revision/archive/conversion/assistant controls remain gated.

Verification: **1,601 focused tests**, **30 isolated database journeys**, **7 production-mode browser/API journeys**, **10 mobile/desktop story interaction and Axe checks** at 320/1440px without overflow; workspace typechecks, focused lint, production build and Storybook build pass. Production browser tests cover history paging/retry/access loss, permission revoked after review, stale-version re-review, both withdrawal entry points, retained frozen preview/print privacy, and the existing Mailpit Send/Resend flow.

The additive receipt migration is applied to the local development and isolated test databases only. Local-only sharing/delivery rollout gates are unchanged. No staging/production deployment or real customer estimate was withdrawn during verification.

## 9. Slice 2 delivery and verification

**Review approved (October 25, 2026):** the user approved Record Accepted/Declined and Correct decision after receiving the live-app review checklist. Slice 2 is complete; this approval does not start or approve Slice 3.

Approved by the user's request to move on to Record Accepted/Declined and correct decisions. The converted-Job choice was explicitly approved as **preserve and show**. Implemented locally on October 24, 2026:

- **Mark accepted / Mark declined** in the shared-record status panel opens the existing review dialog. Confirmation requires an effective active Sent/Published record, actual workspace-local date no later than today, supported channel and optional private note of at most 500 characters.
- **Correct decision** is available on eligible Accepted/Declined records to Owner/Admin/Office with `estimates.decide`. It requires the matching previous decision/version and a nonblank reason of at most 500 characters. Metadata-only correction is supported. Field may record an initial decision only on an authorized assigned-job estimate, never on a lead estimate or as a correction.
- `GET /api/estimates/[estimateId]/decision` loads an authorized frozen review. `POST` rechecks origin, identity, grant, state, version, snapshot hash and previous decision. Receipts are actor/input/record-bound; conflicts preserve edits and require explicit Reload and review.
- Append-only decision entries retain the original outcome/date/channel/note and each correction reason, predecessor and frozen amount. Database protection rejects updates except actor anonymization for user deletion. Legacy rows without decision entries do not receive invented metadata or correction eligibility.
- Current status, recorded date, accepted amount, version, activity, stopped queued/retry deliveries and confirmation receipt commit atomically. Accepted metrics use the frozen amount, including legitimate zero totals; older accepted rows retain their existing amount fallback. The recorded date uses workspace midnight rather than server-local time.
- Frozen paper/hash/logo and existing customer tokens remain unchanged. No customer decision email, payment operation or automatic Job creation occurs. Existing Job data and links are preserved; references and **Job unchanged** notices are shown only where that Job is readable.
- The live status panel displays saved outcome/date/channel/private note and refreshes history after success. Decision metadata, notes and reasons stay out of print, customer paper and email.
- Added connected **DecisionActions**, **CorrectableDecision** and **CorrectionWithConvertedJob** stories.

Verification rechecked on October 25, 2026: **1,625 focused tests**, **38 isolated database journeys** and **12 production-mode browser/API journeys** pass, including immutable-entry rejection, exact frozen accepted amount, zero total, workspace date, Field lead denial, concurrent opposing decisions, revoked grants, correction chains, unchanged Job/customer paper and in-flight SMTP ordering. Workspace typechecks, focused lint, the production app build and Storybook production build pass. Earlier checks of this slice also passed **12 representative mobile/desktop story interaction, Axe and overflow checks**.

**Crash recovery completed (October 25, 2026):** implementation files and both applied decision migrations survived. The earlier Storybook `ENOSPC` blocker is resolved and the outstanding validation reruns passed. Existing PostgreSQL, Redis, Mailpit and object-storage containers were stopped after the crash; they were restarted without recreating containers or resetting their persistent volumes. Local login now responds successfully and the decision API correctly rejects unauthenticated requests. Verification used fictional records in the isolated test database; no storage cleanup, production deployment or real customer decision was performed.

The two additive decision migrations are applied to local development and isolated test databases only. No staging/production deployment or real customer decision was made. Revisions, Archive/Restore, conversion creation, notifications, export and assistant tools remain outside this slice.

## 10. Slice 3 first component: revision-history panel

Approved to start on October 25, 2026, after the completed decision slice. The user selected **one pending Draft per family** and **carry payment links with explicit re-review before sharing**.

The [Revision history panel](http://127.0.0.1:6006/?path=/story/estimates-estimaterevisionspanel--pending-revision) was explicitly **approved** by the user on October 25. It reuses the shared panel, status badge, money formatting, links and error patterns. It shows accessible revisions newest-first, each status/total, **Viewing** on the current revision, **Open** for other authorized revisions and a pending-Draft explanation. A bounded page/count and Load older revisions support large families; access loss clears rows, links and counts. The panel is hidden in print. Unavailable totals are not shown as zero.

Validation: **70 focused ordering/action tests**, **32 responsive interaction/Axe/overflow/print checks** (16 stories at 320/1440px), web typecheck, focused lint and Storybook production build pass.

**Component boundary:** the panel still uses fictional Storybook data; live page integration is a later step.

## 11. Slice 3 lifecycle data foundation

**Review approved (October 25, 2026):** the user explicitly approved the verified foundation before work began on the sharing-review controls.

Implemented and verified on October 25 after panel approval:

- Strict revision and family-read contracts; record/version/snapshot-bound Revise with actor-bound retry receipts. Read/update/create grants are rechecked, including Field assigned-job scope and source-owner inheritance without granting reassignment.
- One pending Draft per family is enforced by the workspace lock and a database uniqueness constraint. Repeat Revise opens that Draft. A persistent per-family counter prevents reuse of a deleted Draft's revision number; a scoped FK prevents cross-family/workspace predecessor references.
- New revision values come from validated frozen paper, not mutable source fields or current catalog data. Recipient, scope, terms, amounts, units and optional payment URL are preserved; private notes are not copied. Copied units survive save/preview/edit without a live catalog reference.
- Family reads are bounded to 25 rows plus a next cursor and authorized count; shared totals come from validated immutable snapshots. Inaccessible family members do not appear in rows, links or counts.
- Send/Publish rechecks the predecessor's version/state/authority and requires explicit confirmation for a carried payment URL. Sharing the new snapshot, setting the predecessor Superseded, revoking old tokens, stopping queued/retry mail, activity and receipt commit together. Failed/stale confirmations leave the predecessor active. Old customer links show Replaced without revealing the new token; both frozen papers remain unchanged.
- The expiry sweep service uses database time and the workspace timezone, persists Expired once, increments version, stops queued mail and writes worker history under the same workspace lock. Restart/retry, concurrent sweeps and failed-batch rollback are covered. A deterministic server-side clock argument supports exact date-boundary tests; normal execution uses the database clock after locking. **The periodic worker is not connected yet.**
- Superseded Declined records retain readable original decision metadata and existing converted Jobs without enabling corrections to the replaced estimate.

Verification: **1,645 focused tests**, **48 isolated database journeys**, **12 existing production browser/API regression journeys**, workspace typechecks, focused lint, app production build and Storybook production build pass. The 32 approved panel checks and two additional mobile/desktop snapshot-unit interaction/Axe checks pass. Database cases cover concurrent revision creation/sharing, deletion/no number reuse, scoped family pagination, carried-link refusal, predecessor acceptance/version conflicts, queued/in-flight SMTP, expiry retry/rollback, and exact midnight across spring/fall DST, leap day and fractional/offset timezones.

**Review boundary:** the additive revision migration is applied to the isolated test database only. No live revision/family endpoint, Revise control, final carried-link checkbox or periodic expiry startup hook is connected. No real customer record was revised, replaced or expired. The next step is live API/page integration and the worker hookup, followed by new end-to-end revision journeys.

## 12. Slice 3 replacement and carried-payment review component

**Review approved (October 25, 2026):** the user's "move on" approved the component and proceeding with live page/API integration.

Implemented the standalone [replacement review](http://127.0.0.1:6006/?path=/story/estimates-estimaterevisionreview--carried-payment-link) component after foundation approval. It explains which previous revision Send/Publish will replace and that the previous customer link will stop working. An unchanged carried payment URL requires an unchecked-by-default acknowledgement against the new amount and terms. Changed or removed URLs do not require that carried-link acknowledgement.

Acknowledgements are bound to the Draft ID/version, current snapshot hash, exact payment URL and predecessor ID/version. Changing those values invalidates the checked state and confirmation. Pending work disables interaction; lost read access removes the number, source details and payment URL. Non-Draft/archived records, stale previews, missing sharing permission and ineligible predecessors cannot produce a confirmation. The component is hidden in print; it does not add a customer Pay Now callout.

Verification: **178 focused revision/Send/Publish review tests**, web typecheck, focused lint and Storybook production build pass. All **28 responsive story interaction/Axe/overflow/print checks** pass across 14 stories at 320/1440px, including draft/predecessor changes, access loss and keyboard focus.

**Component-step boundary:** the standalone component was approved before the live connection in section 13. No development-database migration or real record changes were made in the standalone component step.

## 13. Slice 3 live revision integration

**Review approved (October 26, 2026):** the user's "go" approved live revision integration and proceeding with scheduled expiry.

Connected locally on October 25 after replacement-review approval:

- `GET /api/estimates/[estimateId]/revisions` and `POST /api/estimates/[estimateId]/revise` reuse the existing session/workspace/origin/no-store/error boundary and strict contracts. Family paging validates its cursor; Revise rechecks current authorization, version, frozen hash and retry identity.
- **Create revision** in the detail Actions menu and status panel opens the new or already-pending family Draft. The number is retained, values come from frozen paper and staff notes are cleared. The existing Details -> Review -> Send flow remains unchanged for ordinary Drafts.
- The live **Revision history** panel shows authorized newest-first rows, current revision, status, total, pending explanation and Open links. Older-page loading, explicit retry and access-loss clearing are connected; refreshed family/version data gates Revise without refreshing or unmounting an open decision dialog.
- The creation flow's Review step requires explicit carried-link acknowledgement. Draft edits, going back, changed snapshot/URL or changed predecessor invalidate that acknowledgement. Confirm-and-continue rechecks the current paper and predecessor; final Send/Publish carries the exact reviewed predecessor/version confirmation.
- Send/Publish dialogs also render the approved replacement review and submit its confirmation. The Send screen still has no Pay Now callout or payment checkbox; its summary identifies the revision being replaced.
- Authorized preparers without `estimates.send` can still read/preview a revision Draft; reading the predecessor does not grant permission to share or replace it. Sharing continues to reauthorize the predecessor inside the write transaction.
- Successful Send/Publish atomically replaces the predecessor, stops its future queued mail and disables its old customer link. Both frozen papers and staff histories remain readable; no acceptance, Job creation or payment operation is performed.

Verification: **1,658 focused tests**, **48 isolated database journeys**, **17 production browser/API journeys**, workspace typechecks, focused lint, production app build and Storybook production build pass. **Six additional responsive interaction/Axe/overflow checks** cover the integrated form and both sharing dialogs at 320/1440px. New browser/API journeys cover pending-Draft reopening/deletion and non-reused numbering, strict route/cursor/access guards, mobile Send and desktop Publish replacement, fresh acknowledgement after returning to Review, predecessor acceptance during review, family paging/retry/access loss, frozen-paper preservation and print-hidden staff history.

The additive revision migration is now applied to **local development and isolated test databases only**, with lineage/counter schema verified afterward. Login returns 200 and the signed-out family API returns 401. No staging/production deployment or real customer revision was performed.

**Step boundary:** live revision controls were approved before the scheduled-expiry connection in section 14. Complete listing-menu callbacks remain in Slice 4 as planned.

## 14. Slice 3 scheduled expiry and final verification

Connected on October 26 after live revision approval:

- The worker checks the required estimate tables, runs an immediate expiry sweep and repeats every 60 seconds. It uses the existing bounded data service and database clock, not a browser/process date or server-local calendar.
- Expiry scheduling is independent of the local Mailpit/sharing rollout and runs in both worker modes. It does not need an encryption key or embedding provider of its own.
- In-process ticks cannot overlap. Failed sweeps log a sanitized event and retry on the next tick. Graceful shutdown clears the timer and waits for in-flight work before database teardown; restart immediately catches up.
- The existing workspace lock and transactions preserve once-only activity, version increments and stopped queued mail across concurrent expiry/decision/replacement operations. Frozen snapshots and customer tokens remain unchanged; Accepted/Declined estimates and estimates valid through today do not expire.
- Startup, nonzero completion and failure events provide safe diagnostics. The existing queue-oriented status command is not an expiry heartbeat; see [worker operations](worker-deployment.md#scheduled-estimate-expiry).

Verification: **1,694 focused Estimate/worker tests**, **48 isolated database journeys**, **18 production browser/API journeys**, workspace typechecks, focused lint, production app build and worker build pass. The real worker rehearsal verifies the expiry startup hook on initial startup and restart, plus existing status and graceful SIGTERM shutdown. The new browser/API journey runs the real expiry scheduler against fictional records, verifies Sent/Published expiry, stopped queued mail, unchanged Accepted/Declined and valid-today records, exact snapshot/token preservation, persisted System automation history and no duplicate events after restart.

The previous step's Storybook build and responsive interaction/Axe checks remain applicable; this step adds no UI component or layout. No new migration, dependency, staging/production deployment or customer notification is introduced by the scheduler.

**Local runtime verified:** restarted only the development worker under Node 22.23.3. It reports `worker.estimate_expiry_started` with a 60,000ms interval and `worker.ready`; the status command reports one worker per existing queue and login remains HTTP 200. The web server, Storybook, Docker services and database contents were not reset.

**Final review approved (October 26, 2026):** the user's "approved" confirms scheduled expiry and the completed Slice 3. All Slice 3 implementation and automated checks are complete locally. Archive/Restore and full listing actions remain Slice 4 and have not been started.

## 15. Slice 4 Archive/Restore foundation

**Foundation approved (October 26, 2026):** the user's next "go" approved this step and proceeding to editor/list integration.

Implemented on October 26 after approval to start Slice 4:

- A strict `archive`/`restore` command binds the workspace, estimate, current version and submission identity. Client-supplied archive timestamps, actor, status and authority are rejected.
- Both operations reload current membership/read access and the shared `estimates.archive` grant inside the existing exclusive workspace transaction. Owner/Admin/Office remain the eligible roles; saved grants alone never enable a disabled server feature.
- Archive accepts effective Declined/Expired/Superseded/Void only. Restore requires an archived record. Only archive timestamp/actor, version and update time change; the transaction also commits one staff activity and operation receipt.
- Exact retries return the committed result without duplicate activity. Reused confirmations, stale versions, changed state and competing confirmations fail explicitly. The shared workspace lock serializes a concurrent decision correction, preventing an archived Accepted result.
- Frozen snapshots, line items, saved decisions, family identity, tokens, queued-delivery records and Jobs are not rewritten. Archive is not withdrawal: it hides a closed record from default lists without changing customer-link validity. Restore never renews expired/revoked links or revives withdrawn/replaced paper. Older restored revisions still obey latest-revision/filter rules.
- A narrow additive migration extends the existing receipt operation allowlist. At this foundation step it was applied only to the isolated test database; development migration followed in section 16. Staging/production migration remains deferred.
- The staged `POST /api/estimates/[estimateId]/archive` adapter reuses the existing origin/session/no-store/error boundary. At this foundation step it deliberately remained unavailable while the server's Archive permission was disabled. No live controls or artificial test-only permission bypass were introduced.

Verification: **1,667 focused Estimate tests**, **57 isolated database journeys**, **19 production browser/API journeys**, workspace typechecks, focused lint and the production app build pass. Nine new database journeys cover metadata-only changes, authorization/revocation, valid/invalid states, exact retries and competing submissions, receipt-failure rollback, archive/correction concurrency, older revisions and inactive-link preservation. The new production API journey verifies that the staged route stays disabled without partial writes; positive live HTTP Archive/Restore journeys belong to the next integration step.

**Foundation-step boundary:** no new component/layout or Storybook changes were made in this step. No development migration, real customer archive/restore or production deployment occurred during foundation verification. The user approved proceeding with the approved dialog in section 16; listing Duplicate/Delete/Create revision remains separate.

## 16. Slice 4 live Archive/Restore integration

Connected locally on October 26 after foundation approval:

- Added current server-owned Archive grants to editor seeds and list reads. The implemented permission surface now enables `estimates.archive`; eligibility and the Owner/Admin/Office ceiling remain authoritative at commit. Field users never gain Archive/Restore.
- The detail Actions menu offers **Archive estimate** for unarchived Declined/Expired/Superseded/Void records, or **Restore estimate** for archived records. Draft/Sent/Published/Accepted records do not gain Archive. Dirty/conflicting/pending forms cannot open a mutating review.
- Listing row Actions use the same approved dialog and connected review adapter. Before confirmation it fetches the current authorized record/version/grant; current recipient details come from that read, not a substituted list customer name.
- Initial loading, read failure/retry, changed-version conflict and explicit reload are connected. Losing access clears private dialog contents and blocks confirmation. Retrying a lost successful response reuses the submission identity and does not duplicate history.
- After success, the editor updates archive/version metadata and refreshes staff history, family history and sharing state. The list reloads rows and metrics, preserving filters. If archiving removes the last row from a later page, navigation returns to the last populated page rather than showing an empty page.
- Restore retains the underlying status, paper and customer-token validity; it does not send mail, create/change Jobs or renew expired/withdrawn/replaced links.
- Added editor-menu/dialog and table-menu/dialog composition stories plus a distinct loading-review state. No redesign or parallel archive workflow was introduced.

Verification: **1,667 focused Estimate tests**, **57 isolated database journeys**, **24 production browser/API journeys**, workspace typechecks, focused lint, production app build and Storybook production build pass. **16 responsive interaction/Axe/overflow checks** cover eight stories at 320/1440px. New live journeys verify API guards/replay/preservation, desktop editor and mobile list Archive/Restore, cancellation, persisted history/reload, lost-response retry, stale review/reload, failed-read retry, revoked Office authority and removal of a final paged row. Database assertions also verify current editor/list Archive grants and Field/revoked-grant denial.

The only pending local development migration was the additive Archive/Restore receipt allowlist extension. It is now applied and its constraint verified; no other migration or database reset was performed. Login remains HTTP 200 and signed-out Archive requests return 401. No real customer archive/restore or staging/production deployment occurred.

**Integration approved (October 26, 2026):** the user's next "go" approved Archive/Restore and proceeding with the remaining listing callbacks in section 17.

## 17. Slice 4 complete listing actions

Connected locally on October 26 after Archive/Restore approval:

- **Duplicate estimate** calls the existing versioned/idempotent Duplicate API and opens the resulting Draft. The copy receives a new estimate number and retains the established clearing of recipient name/email, valid-until and payment URL. The source remains unchanged.
- **Create revision** reads the authorized family review and checks that its source ID/version still matches the selected row before submitting the existing snapshot-bound Revise command. It opens the one pending revision Draft rather than creating another. The predecessor stays active until the existing Send/Publish replacement workflow succeeds.
- **Delete draft** reuses the approved typed-number dialog and existing Delete API. A connected adapter fetches current authoritative saved details, sharing history and Delete authority before enabling input. Cancellation never deletes. A conflict requires explicit reload and fresh exact-number entry; failed reads can retry, and access loss removes private review details.
- Row reads now expose independent Duplicate/Revise/Delete grants. SQL reloads actual job-owner/team facts; the existing authorizer checks each record rather than substituting the collection Create button or assuming workspace scope. Revise needs both Create and Update; Field never gains Delete. The table applies these grants to both desktop rows and mobile cards.
- While a Draft action is pending, menus are disabled and a preparation status is shown. Lost Duplicate/Revise responses retry with the same submission identity and open the committed Draft once. Stale/denied actions block until explicit list reload; no silent fresh-version submission occurs.
- Successful deletion refreshes the existing filtered list/metrics. Removing the last Draft on a later page returns to the last populated page. Deleting a pending revision does not withdraw its predecessor, alter its snapshot or renew/revoke its customer link.
- Added table-menu Duplicate/Revise interactions, typed Delete composition, per-row permission and pending stories, plus the deletion-review loading state. No second mutation service, dialog redesign, migration or dependency was introduced.

Verification: **1,668 focused Estimate tests**, **58 isolated database journeys**, **34 production browser/API journeys**, workspace typechecks, focused lint, production app/Storybook builds and **16 responsive interaction/Axe/overflow checks** pass. The ten added browser journeys cover desktop/mobile copy/delete, exact confirmation and cancellation, pending-revision reuse/deletion, lost Duplicate/Revise responses, stale list versions, failed deletion reads, explicit conflict re-review, revoked Office authority and final-page deletion. Database checks cover primary/team assignments, independent Create/Update/Delete grants and mixed record scopes; mapping tests preserve per-row grants independently of collection Create.

**Final Slice 4 approval (October 26, 2026):** the user's "approved" confirms Archive/Restore and the complete listing actions. Slice 4 is complete locally and review-approved. At that checkpoint Slices 5-9 had not started; the subsequent "go" starts Slice 5 in section 18. No real customer mutation, new development migration or staging/production deployment occurred in this step.

## 18. Slice 5 related Estimates card

Built on October 26 after approval to start Slice 5. The existing linked-record component displays an estimate's parent; it is not the inverse Estimates card required on lead/Job/customer records. Added a presentation-only [RelatedEstimatesCard](../apps/web/src/features/estimates/related-estimates-card/related-estimates-card.tsx) using the established related-record and revision-panel styling, shared status badges, exact money display and native Open links.

- Displays the authorized estimate name, number/revision, status/Archived flag, total and Open estimate. A missing total remains unavailable rather than becoming zero; an actual zero displays as $0.00.
- Lead/Job variants expose a host-authorized Create estimate callback for that parent. The customer variant explains that an authorized related lead or Job must be chosen first; its story demonstrates only that selection request, not a new parent-picker implementation or an orphan Draft.
- Read authority defaults to denied. Loading, errors and unavailable/access-loss states hide stale rows, links, counts and creation actions. Error/retry and missing navigation/creation/paging adapters are explicit; pending blocks all callbacks/navigation.
- Scoped totals and controlled Load more use host-supplied data only. The component does not authorize, query, sort, deduplicate or infer record/family eligibility. Live integration must enforce parent access, estimate read scope, latest/archived rules and independent Create authority.
- Customer rows can identify their authorized lead/Job; the host omits that optional summary when it cannot disclose the parent. Existing customer/parent components and live routes are unchanged.

Verification: web typecheck, focused lint and Storybook production build pass. **25 stories / 50 interaction, Axe, overflow and minimum-44px action-target checks** pass at 320/1440px, including keyboard traversal and the shared 3px focus ring, three creation contexts, read-only/empty states, load-more, failed-read retry, access loss, all statuses, null/zero totals, unavailable navigation, long content and literal text. **74 existing action/list/revision helper tests** also pass.

**Component approved (October 26, 2026):** the user's "approved" confirms the reusable related Estimates card. At that component checkpoint no host-page integration, API/data changes, migration, real record mutation or customer notification occurred. The subsequent "go" authorized the integration in section 19; lead-stage suggestions follow as a separate reviewed step, and Slices 6-9 remain unstarted.

## 19. Slice 5 related-record and direct-creation integration

Connected locally on October 26 after the user's "go" following card approval.

- Reused the approved card in the lead detail sidebar, Job detail related-record area and customer profile Overview. Added host-composition stories and a working lead-header Create estimate action; the existing Job work-order and other related-record sections remain intact.
- Added strict related-read and customer-parent query contracts and authenticated, private/no-store APIs. Reused the existing estimate SQL scopes, effective expiry and latest-revision/archive rules, plus the existing parent readers and authorizer. Customer grouping follows the current authorized lead/Job customer relationships, never customer-name search or a query-string authorization shortcut.
- Related reads return only authorized names, number/revision, status, archive flag, total, parent summary and editor links. Counts and 10-record pages are scoped before pagination. Include archived and older revisions is explicit and off by default. A version of the authorized result set prevents appending stale cached pages after visibility/content changes; errors or access loss clear private rows, counts, links and Create.
- Lead and Job Create reuse the existing parent-seeded editor. Customer Create first uses the existing picker with a server-constrained set of linked, readable, creatable leads/Jobs. Closed Jobs remain eligible; archived leads/customers do not offer creation. The route rechecks the selected customer relationship, and the save command rechecks/locks it and includes the optional customer context in retry identity. A changed relationship rejects without creating a Draft.
- Opening any entry point or choosing a parent does not save a Draft. Existing Create validation and idempotency remain authoritative. New-lead warnings consistently include current unexpired Draft/Sent/Published estimates and omit archived, expired or older revisions.
- Corrected the reused picker option's accessible name to retain its visible content. The regression suite's shared-estimate action count now includes the already-existing Create revision item; no action-menu behavior was changed.

### Verification

- **1,681 focused tests** covering Estimate contracts/domain/data/UI helpers.
- **65 isolated database journeys**, including exact/forged parents and tenants, Field ownership/team scope, independent parent/Create/read grants, customer-source constraints, pagination/read-version changes, zero/unavailable totals, archived history, no-save navigation, changed relationships and current Published warnings.
- **42 full production browser/API journeys**, including eight new related-record journeys: real lead-header/card and Job/customer entry points, correct Open targets, current/older revision visibility, no Draft on navigation, one saved customer-bound Draft, server revalidation, paging refresh and privacy after revoked access.
- Final follow-up: **four affected production journeys**, the **65 DB journeys**, workspace types and focused lint passed again after tightening the archived-customer route guard and simplifying strict hidden-filter parsing.
- **38 stories / 76 checks** at 320/1440px: interaction/play success, Axe WCAG2A/AA/2.1AA, no horizontal overflow and related-card action targets at least 44px. Includes host compositions, all approved card states, picker variants, connected header and Published warning.
- Workspace typecheck, focused lint, production app build (through the production browser launcher) and Storybook build pass. Focused lint retains one pre-existing unused-import warning in the Job detail page; no lint errors. Local login remains available.

**Integration approved (October 26, 2026, 09:10):** the user's "approved" confirms related-record cards, authorized reads, navigation and direct creation on lead/Job/customer pages. Lead-stage suggestions remain the next separate step, awaiting "go"; conversion, notifications/reminders, CSV and assistant integration remain unstarted. No migration, real customer mutation, deployment, automatic lead-stage change or new email behavior was introduced. Only isolated fictional fixtures were created during validation.

## 20. Slice 5 lead-stage suggestion component

Started after the user's October 26, 09:11 "go". The user then explicitly confirmed these behavior rules:

- After successful initial Send confirmation, suggest **Estimate sent** only from **New** or **Contacted**. A queued email is not confirmed delivery.
- When a saved decision changes the outcome to **Declined**, suggest **Lost** from **New**, **Contacted** or **Estimate sent**, with an equally explicit **Keep lead open** action.
- Never reopen **Won/Lost** leads. Do not retrigger for Publish, Resend, or note/date/channel-only corrections to an already-Declined decision. A correction from Accepted to Declined is a qualifying outcome change.
- Suggestions apply only to an estimate's exact lead parent, never a Job's source lead. Dismissal/keep-open makes no request to change a record.

Built the presentation-only [EstimateLeadStageSuggestion](../apps/web/src/features/estimates/estimate-lead-stage-suggestion/estimate-lead-stage-suggestion.tsx), reusing approved Estimate panel/button styling and the existing [MoveStageDialog](../apps/web/src/features/leads/move-stage-dialog/move-stage-dialog.tsx) in fictional compositions. Review preselects Estimate sent or Lost; Lost retains the existing optional reason. A separate Confirm move is required. There is no second stage form or mutation implementation.

The shared [presentation eligibility helper](../apps/web/src/features/estimates/estimate-lead-suggestions.ts) requires an appropriate event, still-current Sent/Declined presentation status, an unarchived estimate and lead, explicit authorized read/move facts and an eligible open lead stage. Missing read authority, loading, errors and unavailable state suppress private references and stage actions. Pending disables review/dismiss callbacks. Host-owned errors/reload and permission/archive/closed-state messages are explicit.

Verification:

- **50 new eligibility tests**, plus **66 existing action tests** (**116 combined**).
- **32 stories / 64 responsive checks** at 320/1440px: successful interaction/play completion, Axe checks, no horizontal overflow and action controls at least 44px in both dimensions.
- Covers initial Send/Decline, corrected-to-Declined versus metadata corrections, Publish/Resend exclusions, preselected review, optional Lost reason, explicit confirmation, keep-open, dismissal/cancel/Escape, keyboard focus restoration, pending duplicate-submit protection, failure/retry, conflict/reload, read errors and access loss during an open review, independent move permission, archived/closed/already-target leads, Job source-lead exclusion and long/literal content.
- Web typecheck, focused lint and Storybook production build pass. Shared keyboard focus ring verified at **3px**.

**Component approved (October 26, 2026, 09:26):** the user's "approved" confirms the lead-stage suggestion component and its existing-dialog compositions.

**Live integration delivered locally (October 26, 09:27 "go"):**

- Added an estimate-bound lead-stage review/confirm API at [route.ts](../apps/web/src/app/api/estimates/[estimateId]/lead-stage/route.ts), backed by [lead-stage.ts](../packages/data/src/estimates/lead-stage.ts) and strict contracts in [estimate-lead-stage.ts](../packages/contracts/src/estimate-lead-stage.ts).
- Send and decision flows now capture their durable source submission IDs and surface suggestions only for eligible lead-linked records in [estimate-editor-route.tsx](../apps/web/src/features/estimates/estimate-editor-page/estimate-editor-route.tsx). Publish and Resend do not create suggestions.
- Suggestion confirmation reuses the existing [MoveStageDialog](../apps/web/src/features/leads/move-stage-dialog/move-stage-dialog.tsx) and existing lead stage mutation service, with exact estimate/lead version checks, source-operation verification, permission rechecks and idempotent retries.
- The helper keeps the approved product behavior: only open leads; Send -> Estimate sent from New/Contacted; outcome-changing Declined -> Lost from New/Contacted/Estimate sent; no Won/Lost reopen; keep-open/dismiss makes no mutation.
- Updated [EstimateDecisionReview](../apps/web/src/features/estimates/estimate-decision-dialog/estimate-decision-review.tsx) to return a suggestion source only when the saved outcome newly becomes Declined.

Validation:

- **74 full isolated estimate database journeys** pass, including new lead-suggestion atomicity/authorization/replay checks.
- **69 focused tests** pass (new contract and eligibility suites).
- **5 production browser/API journeys** pass in [estimates-sharing.spec.ts](../apps/web/e2e/estimates-sharing.spec.ts): two new lead-suggestion flows plus three existing send/decision regressions.
- Web typecheck, workspace typecheck, focused lint and Storybook production build pass.

**Integration approved (October 26, 2026, 09:57):** the user's approval confirms the live lead-stage suggestion integration. Slice 5 is complete and user-approved locally. No conversion, notification/reminder, CSV export or assistant lifecycle behavior has started; those remain in later slices and require separate authorization before implementation.

## 21. Slice 6 Accepted Estimate-to-Job integration

Started after the user's October 26 "go" for Slice 6. The approved conversion dialog and Jobs form remain the presentation; this slice connects them to the live Estimate editor without creating Work Orders, recording payments, changing Lead stage or sending customer email.

- Added strict conversion command, review and receipt contracts plus a protected review/confirmation API. The command binds the Estimate version and frozen snapshot hash, source Lead version, Customer version, reviewed Job fields and a stable submission ID.
- Reused Jobs validation and authorization inside the Estimate transaction through `createJobInTransaction`. Job/team rows, calendar synchronization, Job activity, the accepted-Estimate link, Estimate conversion history and the idempotency receipt commit or roll back together.
- Added a partial unique index for at-most-one Job per accepted Estimate and rechecked the existing one-Job-per-source-Lead rule. Replays return the authorized existing Job; stale Estimate/Lead/Customer bindings and inaccessible records fail closed.
- Connected the Estimate status action to the live review. The review uses current active members and server-owned creation/assignment/scheduling grants. Missing Customer resolution opens the existing Customers page separately and refreshes the conversion review on return. A Job-parent Estimate opens its existing parent Job.
- Conversion history now projects the authorized Job reference. A source Lead that already has a Job blocks another conversion, including when the previous Job was created elsewhere.

Validation:

- **78 isolated Estimate database journeys** pass, including simultaneous confirmations/replays, stale Lead and Customer versions, missing Customer, pre-existing source-Lead Job, and a forced Estimate-history failure proving Job, Job activity and Calendar rows roll back before retry.
- **10 Jobs database journeys** pass, preserving the existing Job creation flow.
- **305 focused UI tests** pass across the conversion dialog, assistant conversion card, Estimate editor preview and action selector.
- Contracts, data and web typechecks pass. The production web build and Storybook production build pass; the build includes `/api/estimates/[estimateId]/convert`.
- The workspace-wide Vitest run has **2,515 passing tests and 3 unrelated failures** in `packages/domain/src/authorization/authorize.test.ts`: its permission-count assertion expects 78 but finds 83, and its Office ceilings for `estimates.archive` and `estimates.delete` do not match the current catalog. This slice does not change the authorization catalog.

**Status:** Slice 6 was review-approved on October 26, 2026. The conversion used isolated local test data; no real customer operation, production migration or deployment occurred.

## 22. Slice 7 Estimate notifications and expiry reminders

Started after the user's October 26 "approved, go" for Slice 6. This slice extends the shared notification inbox, per-user preference and worker email patterns; no separate inbox or customer reminder flow was added.

- Added Estimate event persistence, scoped inbox projection and read/unread handling for Sent, first customer view, decision recorded, terminal delivery failure and expiry. Notification creation, inbox reads and email submission recheck current Estimate state and recipient access.
- Added the Estimate email preference to the existing Settings UI and shared preference contract. In-app notifications remain on; staff email follows the recipient's preference. Emails contain only the Estimate number, name, status and staff-facing link.
- Connected events to send/resend, first view, decision, final delivery failure and scheduled expiry. Actor self-alerts are suppressed; delivery retries are idempotent.
- Added a workspace-local three-day expiry reminder sweep with catch-up inside the reminder window and a durable Estimate/date/recipient deduplication key. Superseded revisions do not receive reminders.
- Bounce handling remains excluded until a real provider event source exists. No customer reminder or customer email was added.

Validation:

- **80 isolated Estimate database journeys** pass, including notifications, scope/access, preferences, retries, reminder dates/deduplication and a regression proving an older sent revision receives no reminder when a newer revision exists.
- **20 Calendar command rehearsal checks** pass, including shared notification scope, preferences and retry-safe delivery.
- **16 focused email/worker tests** pass. Contracts, data and web typechecks; production web build; Storybook production build; and `git diff --check` pass.
- The Storybook dev index failed to parse during story authoring; after simplifying the Estimate story args, the index loads and the Estimate-preference interaction story passes. No production migration, deployment or real email was performed.

**Status:** Slice 7 was review-approved on October 26, 2026. The inbox event, email preference behavior, reminder and duplicate suppression were demonstrated. Slice 8 was then separately approved.

## 23. Slice 8 filtered Estimate CSV export

Connected the Estimates list export action to an authorized preview and streamed CSV download. Preview and generation reuse the list's current filters, scope, effective status and sort; export removes pagination so it includes every matching row. The download is capped by the server-owned `ESTIMATE_EXPORT_ROW_LIMIT` (default 50,000; accepted configuration range 1–1,000,000) and rejects empty or over-limit exports rather than silently truncating them.

- Enabled the existing `estimates.export` permission for its Owner/Admin catalog grants. Both preview and generation reauthorize and intersect export access with `estimates.read`, including assigned-Job scope.
- Added the approved EXP-3 fields only: Estimate number, revision, name, status, customer, parent type/ID, owner, total, sent date, valid-until date, decision date and decision channel. Private notes, contacts, line items and payment URLs are excluded.
- The preview provides the current matching count and row limit. Before download, the client compares the streamed snapshot count with the preview and cancels if the matching set changed.
- CSV output is UTF-8 with a BOM, uses the shared formula-safe CSV serializer, formats date-only values as `YYYY-MM-DD` and timestamps as UTC ISO strings, and streams through a bounded-memory cursor.
- Added immutable audit records for started, completed, failed and rejected exports. Search text and specific owner IDs are hashed; workspace identity and pagination details are not stored as filters.
- The API requires the active session and workspace, rejects cross-origin/fetch-metadata requests when those headers are present, and uses a fetch-only download header. The list disables export while the search draft is still being applied so the preview cannot represent stale visible filters.

Validation:

- **82 isolated Estimate database journeys** pass, including authorized current-revision filtering, approved columns, CSV formula safety/date formatting, cap/empty behavior and cancellation.
- **20 Calendar command rehearsal checks** pass, covering the shared authorization and notification behaviors after enabling the export permission.
- Workspace typechecks, the production web build and Storybook production build pass. Browser Storybook interaction tests pass for the configured row limit, no-columns state, selected columns, filtered preview and export across all pages.
- `git diff --check` passes. No production migration, deployment, or production export occurred.

**Status:** Slice 8 was user-approved. The approved Slice 9 work is tracked in sections 9 and 24.

## 24. Slice 9 read-only Estimate assistant operations

Extended the shared `estimates_query` tool with the remaining approved read-only operations:

- `aging` returns bounded, separately counted groups of Sent/Published estimates waiting beyond the requested age, estimates expiring within the requested window and Accepted Lead estimates with no Job linked through `jobs.sourceLeadId`. Date calculations use the workspace timezone and estimates remain filtered by the viewer's current collection scope.
- `get` now returns line items, canonical totals, current effective status, bounded delivery state, and a redacted decision/delivery event history. It omits recipient details, private editor notes and payment URLs.
- `explain_totals` uses the canonical Estimate calculation for Drafts and verified frozen snapshots for shared estimates, returning line amounts, subtotal, discount, taxable base, tax, deposit, total and balance without assistant-side arithmetic.
- `compare_revisions` compares the two most recent accessible revisions and reports changed fields, bounded line-item differences and the total change.
- `summarize_scope` returns only the authorized parent Lead/Job name, status, service and linked customer name; it does not include contact details, address or private Estimate editor fields.
- `open_in_list` validates supported list filters and generates the path with the canonical Estimates URL serializer. Hidden filters are reauthorized and require `estimates.archive`.

All results are bounded and marked as untrusted CRM evidence. The existing `estimates.read` collection authorization remains mandatory; no assistant mutation, Send, conversion or export operation is enabled.

Validation:

- **44 focused Estimate assistant contract/agent tests** pass, including strict model parameter serialization and bounded operation inputs.
- **85 isolated Estimate database journeys** pass, including aging categories, assigned-Job scope, hidden-record protections and Draft/frozen amount projections.
- Contracts, agent, data and web typechecks; targeted ESLint; and `git diff --check` pass.

**Status:** This read-only stage was user-approved. The next Summary-card stage is tracked below; detailed read displays and proposal/confirmation flows remain separate work.

## 25. Slice 9 connected Summary results

Reused the approved `EstimateSummaryCard` in the shared assistant for `search`, `list`, `aging` and `open_in_list`. Aging renders three independently counted groups; their overlapping counts are not added together.

- SQL computes matching counts and stored totals across the entire authorized result set, not the displayed window. Any unavailable amount or unsafe aggregate makes the matching total explicitly unavailable. Cards show at most ten records per group, with workspace timezone/retrieval metadata, effective statuses and authorized parent references.
- Strict contracts carry app-owned Summary projections through the graph, SSE and saved history. The actual escaped result is bounded to 60,000 characters, below the transport's 64,000-character frame limit; unusually expansive text reduces only the displayed row window, never the counts or totals.
- Saved turn snapshots bind result IDs to canonical list queries. Navigation requires the current session, owned completed turn, saved group/record membership, current permissions and unchanged evidence. No arbitrary client/model URL is trusted.
- Current-list context now includes Awaiting/Expiring quick filters. Customer, amount, date and unsupported aging predicates never receive a broader list link. Only the exact seven-day Expiring aging group can open the existing quick-filtered list.
- A conservative Estimate/CRM evidence stamp covers records, line items, activity/delivery/snapshot rows, parents, assignments, customer/owner changes and the workspace-local date. It is captured before reading and checked before saving, each streamed delta, completion, history restoration and navigation. Follow-up answers inherit the same provenance; changed/restricted evidence redacts retained text as well as cards, including formerly empty searches.
- The additive chat-turn migration was applied only to local development and the isolated test database. No production migration/deployment occurred. No assistant mutation, Send, conversion or export action was enabled.

Validation:

- **80 focused contract, graph, model/access, projection and transport tests** pass.
- **87 isolated Estimate database journeys** pass.
- **8 isolated Playwright journeys** pass: scoped totals and redaction, durable replay, forged navigation identities, current quick filters, hidden access, aging, inherited-answer revocation, empty-result changes during streaming, and actual reload/list/record navigation. The existing workspace-navigation duplicate-key warning also appears on Home before any Estimate card is rendered; it is unrelated to the new result rows.
- **8 connected-result stories** pass interaction and automated WCAG checks. The three-card aging layout fits 320/390/820/1440px without horizontal page overflow.
- Contracts, agent, data and web typechecks, targeted ESLint, Storybook production build and `git diff --check` pass. ESLint retains its existing React auto-detection warning.

**Status:** Summary-result integration is connected locally and user-approved. Detailed get/totals/revision/scope displays, all mutation proposals/confirmations, and final Slice 9 end-to-end acceptance remain later steps; approval of this stage alone does not begin those steps.

## 26. Slice 9 connected detailed read results

The detailed-card layout was separately approved before implementation. Connected read-only `get`, `explain_totals`, `compare_revisions` and `summarize_scope` cards to the shared assistant, using the same typed stream, saved turn snapshots, evidence checks and checked navigation as Summary results. Existing saved Summary snapshots remain valid; this stage needs no new migration.

- **Details:** Estimate identity, effective status/archive flag, parent number, valid-until date, saved line inputs and canonical amounts, safe email/link state and recent redacted lifecycle milestones. History explicitly describes a filtered recent window; recipient/contact data, notes, reasons, actors and customer/payment URLs are excluded.
- **Totals:** Server-owned line amounts and exact subtotal, discount, taxable/non-taxable discount allocations, taxable base, tax, total, deposit and balance. Drafts use the canonical calculator; shared records use verified frozen snapshots. Incomplete/invalid inputs remain explicitly unavailable. The client never recalculates amounts from its displayed line window.
- **Revision comparison:** The two latest accessible revisions, their identities/statuses/sources/totals, exact signed total difference, changed name/scope/adjustment/date fields, and positional line changes including units, additions and removals. A single revision has an explicit no-comparison state. Navigation permits only the two saved revision IDs. Direct reads retain existing current-record visibility; an older hidden revision can still be opened through its authorized comparison.
- **Scope:** Saved Draft/frozen Estimate scope plus independently authorized parent Lead/Job context. A readable Estimate does not grant parent access; restricted parents are omitted while saved scope remains visible. Untrusted text renders literally.
- **Durability and bounds:** Strict contracts reject private extensions, mismatched operations/identities and inconsistent windows/comparisons. Actual escaped result JSON is capped at 60,000 characters; only trailing visible lines/changes may be omitted, with explicit notices and unchanged complete totals/counts. Long comparison text uses marked excerpts.
- **Access and presentation:** Live streaming, restored history, inherited follow-ups and Open estimate reuse current authority/evidence checks. Changed evidence blocks later streamed text and stale navigation and redacts retained answers/cards. Cards are read-only and excluded from print. Status/error copy uses assistant-specific foreground tokens rather than page badge/error colors, preserving contrast on the dark assistant surface.

Review examples: [Details](http://127.0.0.1:6006/?path=/story/assistant-estimatereadresult--details), [Totals](http://127.0.0.1:6006/?path=/story/assistant-estimatereadresult--totals), [Revision comparison](http://127.0.0.1:6006/?path=/story/assistant-estimatereadresult--comparison), [Scope](http://127.0.0.1:6006/?path=/story/assistant-estimatereadresult--scope), [Incomplete Draft](http://127.0.0.1:6006/?path=/story/assistant-estimatereadresult--incomplete-draft).

Validation:

- **93 focused contract, graph, model/access, projection and transport tests** pass, including old Summary compatibility, strict detailed variants, comparison consistency, null amounts, escaped payload thresholds and typed replay.
- **87 isolated Estimate database journeys** pass, preserving canonical Draft/frozen values and existing authorization/lifecycle behavior.
- **15 isolated Playwright journeys** pass: the eight Summary regressions plus seven detailed journeys covering real Draft/Publish/Revision API fixtures, exact money, redaction, restricted parent access, missing/single-revision states, forged navigation, no read-side Estimate/activity writes, inherited-answer revocation, mid-stream changes and browser reload/navigation to both compared revisions.
- **23 Storybook interaction/WCAG checks** pass: 13 detailed states, two new connected navigation states and eight Summary regressions. All 13 detailed states fit 320/390/820/1440px without horizontal overflow (**52 responsive checks**).
- Contracts, agent, data and web typechecks; targeted ESLint; Storybook production build; and `git diff --check` pass. The previously recorded Home workspace-navigation duplicate-key warning remains unrelated. A Storybook development navigation was interrupted during the concurrent production build; the complete story validation rerun after the build passed.

**Status:** Detailed read integration was user-approved on October 26, 2026 through the review form. No assistant proposal/confirmation, Send, conversion, export action, new migration or production deployment was introduced. All mutation proposals/confirmations and final Slice 9 acceptance remain separate, unstarted work; this approval does not start them automatically.

## 27. Slice 9 connected Draft create/update proposals

The user approved connecting the server and UI together for this stage. Connected `estimates_propose_action` to the approved Draft card, durable owned proposals, explicit browser Confirm/Cancel and an unsaved editor handoff. This stage enabled only Draft create/update; this is not final Slice 9 acceptance.

- **Preparation is not a save:** The model may prepare one create/update review using exact Lead/Job/Estimate numbers or IDs, including validated current-page references. Null changes preserve defaults or saved values; a supplied items array replaces the entire ordered list. Preparation, editor navigation, editor refresh and cancellation do not create or update an Estimate. Natural-language yes cannot confirm.
- **Verified pricing:** Current-user monetary tokens, explicit zero-price no-charge quotes, authorized catalog selling prices and unchanged version-bound saved prices are supported. Unsupported prices remain blank and prevent confirmation. Catalog values come from current server rows, not model claims; saved catalog snapshots survive unchanged updates. There is no pricing-rule source. Browser-edited prices are treated as user inputs, never trusted posted source labels.
- **Durable review:** Proposals have a 15-minute maximum lifetime, a complete input hash, current membership/policy bindings, parent/Estimate versions and conservative CRM/catalog evidence. One pending Estimate proposal per owned thread is retained; a new/refreshed proposal supersedes the previous one. Strict contracts enforce identity/window consistency and unique line IDs. Complete escaped view JSON is capped at 55,000 characters; reviewed fields are never silently truncated.
- **Explicit atomic confirmation:** Same-origin, metadata-only browser requests reauthorize the owned completed turn, proposal, parent, target, prices and current evidence. Existing transaction-level Draft helpers perform the business mutation together with the receipt, proposal resolution and audit. A retry returns the existing result rather than writing twice. History uses the existing `assistant-confirmed` source. Duplicate open parent Estimates are blocked for create; updates remain limited to authorized unarchived Drafts.
- **Protected fields:** Model/card payloads cannot set contacts, owner, internal notes or payment links. Updates preserve these saved fields and unchanged catalog metadata. The unsaved editor receives only timezone/payment-preset context in addition to its safe proposal, not the full private editor seed.
- **Editor and receipt:** Review in editor opens unsaved fields built from the existing Scope/Items/Totals/Terms components. Review refreshed proposal stores a new proposal only; its card requires another explicit Confirm. The refreshed review and confirmed receipt survive reload. Dirty in-app navigation and browser unload use the existing editor guard behavior. Saved-Draft navigation is checked again on the server.
- **Revocation and failures:** Parent/Estimate/catalog changes, policy/assignment loss, membership replacement, expiry and supersession fail closed. Catalog/membership checks also protect live text, restored history and inherited evidence, not just the final confirmation. The editor rechecks on focus and periodically; obsolete callbacks cannot replace a newer proposal or navigate after unmount. Expected target/conflict/validation declines produce explicit unsaved evidence. Stale/forbidden editor routes are unavailable rather than unhandled server errors. Save/refresh failures are not reported as successful saves.
- **Bounded scope:** No assistant Send/Publish/Resend, revision, decision, conversion or export action was added. No customer link, delivery, Job, payment or Lead-stage mutation is part of this stage. Proposal reviews and unsaved editor fields are excluded from print.

Review examples: [Create](http://127.0.0.1:6006/?path=/story/assistant-connectedestimatedraft--create), [Update](http://127.0.0.1:6006/?path=/story/assistant-connectedestimatedraft--update), [Missing price](http://127.0.0.1:6006/?path=/story/assistant-connectedestimatedraft--missing-price), [Unsaved editor](http://127.0.0.1:6006/?path=/story/assistant-estimatedraftproposaleditor--unsaved), [Refreshed review](http://127.0.0.1:6006/?path=/story/assistant-estimatedraftproposaleditor--refreshed-review).

Validation:

- **234 focused tests** pass across contracts, graph/model/access, server projections, transport, approved Draft-card rules and existing editor preview behavior.
- **92 isolated Estimate database journeys** pass, including exact 15-minute expiry, atomic rollback when audit persistence fails, retained receipt behavior, membership replacement, catalog changes and real current-user price/no-charge proof.
- **26 isolated Playwright journeys** pass: 11 new proposal journeys and all 15 approved Summary/detailed-read regressions. Coverage includes no-write preparation/editor/cancel, concurrent confirmation retry, exact total/deposit/balance, protected fields, catalog provenance, supersession, current Field assignment, forged bindings/origin/ownership, no natural-language confirmation, mid-stream catalog revocation, editor review/receipt reload and checked navigation.
- **14 Storybook interaction/WCAG checks** pass: 11 connected Draft/editor states and three existing editor regressions. The 11 new states fit 320/390/820/1440px without horizontal overflow (**44 responsive checks**), all 11 hide private proposal fields/controls from print, and the connected card supports keyboard-visible focus. The initial print probe measured the empty padded story wrapper; checking the actual headings, inputs and controls confirms none are printed.
- Contracts/agent/data/web typechecks, targeted ESLint, Storybook production build and whitespace checks pass. The existing Home duplicate-workspace-key and ESLint React auto-detection warnings are unchanged.

The additive proposal migration was applied only to the guarded local development database and isolated test database. No production migration, deployment, provider-backed model acceptance or real customer operation occurred.

**Status:** Connected and verified locally; user-approved on October 26, 2026 through the stage-review form. That approval did not start later action families automatically. The separately authorized sharing stage is recorded in section 28.

## 28. Slice 9 connected Send / Publish / Resend proposals

The user authorized this bounded stage and approved retaining the existing Send card for ordinary saved Drafts, with a Review action opening the existing sharing dialogs for Publish, Resend and revision sharing. Opening a review does nothing; only its final explicit confirmation shares the saved customer paper.

- **Existing business service:** `estimates_propose_action` accepts strict Send/Publish/Resend preparation requests alongside the already approved Draft operations. Transaction-level helpers extracted from the existing sharing service preserve manual sharing behavior. Confirmation commits the existing snapshot/token/outbox/notification/operation-receipt work together with the durable proposal resolution and metadata-only audit. Activity uses `assistant-confirmed`; the manual UI retains `ui`.
- **Durable owned intent:** A proposal binds its exact saved Estimate/revision/version, customer snapshot hash, current parent, membership/policy, workspace-local date and conservative CRM evidence. The review expires after at most 15 minutes. Draft and sharing proposals supersede each other within one owned conversation. Same-origin browser decisions contain reviewed identifiers/hashes and the revision acknowledgement, not replacement Estimate content. The model has no commit tool, and natural-language yes is not confirmation.
- **Send and Publish:** Both require a complete saved unarchived Draft and current read/send/parent access. Ordinary Send reuses the approved card and its final customer preview, saved destination and server-generated subject. Changing those requires cancelling and editing the saved Draft. Publish uses the existing dialog and creates no email. The connected revision dialog shows the real predecessor replacement and requires payment-link acknowledgement when applicable; confirmation revalidates it before superseding the predecessor and revoking its old token.
- **Resend:** Only an active Sent Estimate with an existing delivery, an active link and no queued email is eligible. The dialog displays the frozen customer paper. Editing the delivery email changes the button to **Review updated recipient**; that action stores a new proposal only. The refreshed review requires a second explicit **Confirm resend**. It does not change the frozen prepared-for contact, saved Estimate or previous deliveries.
- **Private browser review:** Streaming, model evidence and restored chat carry compact typed tickets, not the customer paper, delivery address, payment URL or bearer token. A separately authorized GET loads the exact browser review. The customer preview contains only the existing customer-facing snapshot allowlist, never internal notes or the full private editor seed. Captured Resend logos use the protected staff asset endpoint. No public bearer link is exposed in the assistant.
- **Receipts and next steps:** Concurrent/repeated confirmation queues one email or records one publication, not a second operation. Success says **Email queued**, never delivered, or **published without email**. The receipt survives reload and normal worker delivery updates; opening the saved Estimate rechecks access/version/snapshot. A Lead-linked Send reuses the existing separate Lead-stage suggestion and review. Sharing never moves the Lead automatically; any stage move requires its own existing confirmation.
- **Current access and modal handling:** Parent/Estimate changes, lost grants/assignment, membership replacement, expiry, supersession and mismatched metadata fail closed. Browser reviews recheck on focus and periodically; stale/disabled-host callbacks cannot navigate or replace current content. Shared dialogs portal inside the assistant's native modal so they remain clickable and focus-contained. Tab/Escape close only the nested review. An early user interaction is no longer overwritten by the dialog's delayed initial-focus callback. Private review/card contents are excluded from print.
- **Scope boundary:** No assistant decisions/corrections, Revise/Duplicate/Void/Archive/Restore/Delete proposals, conversion or CSV handoff was enabled. Sending an already-created revision preserves its existing replacement semantics; creating a revision through the assistant remains separate work. Slice 9 final acceptance and production/provider/public-origin rollout remain separate.

Review examples: [Send](http://127.0.0.1:6006/?path=/story/assistant-connectedestimatesharing--send), [Publish review](http://127.0.0.1:6006/?path=/story/assistant-connectedestimatesharing--publish-review), [Resend](http://127.0.0.1:6006/?path=/story/assistant-connectedestimatesharing--resend-review), [Recipient refresh](http://127.0.0.1:6006/?path=/story/assistant-connectedestimatesharing--recipient-refresh), [Revision review](http://127.0.0.1:6006/?path=/story/assistant-connectedestimatesharing--revision-review).

Validation:

- **497 focused tests** pass across strict contracts, graph/access/model, server projections, streaming/replay, Draft rules and the existing Send/Publish review rules.
- **100 isolated Estimate database journeys** pass. Eight new sharing journeys cover no-write preparation/read/cancel, exact receipts, concurrent retry, atomic rollback after audit failure, snapshot/token/outbox effects, recipient refresh, expiry/bindings/ownership/permission/parent checks, selected-page identity, revision/payment acknowledgement, membership replacement and cross-family supersession.
- **39 isolated Playwright journeys** pass: nine new sharing journeys, 26 approved assistant Draft/read regressions and four focused manual-sharing regressions. Real browser/API coverage includes live/reloaded confirmation, no natural-language confirmation, no customer/payment data in streamed tickets/history, origin/ownership/binding checks, nested modal Tab/Escape, current Field access loss, two-step recipient refresh, revision review and the independent Lead-stage confirmation. Existing manual Send/Resend still reaches local Mailpit; Publish/public paper and predecessor revalidation remain intact.
- **19 Storybook interaction/WCAG checks** pass: 13 new sharing states plus six existing Send/Publish/assistant modal regressions. New coverage includes mismatched reviews and late disabled-host responses. All 13 new states fit 320/390/820/1440px without horizontal overflow (**52 responsive checks**) and hide actual private review headings/inputs/controls from print.
- Contracts/data/agent/UI/web typechecks, targeted ESLint, Storybook production build and whitespace checks pass. The existing Home duplicate-workspace-key and ESLint React auto-detection warnings are unchanged.

The additive sharing migration was applied only to the guarded local development database and isolated test database. Database rehearsals and browser suites were run separately where they exercise the global email worker; running them concurrently interferes with synthetic worker fixtures. No production migration/deployment, provider-backed model acceptance or real customer operation occurred.

**Status:** Connected and verified locally; user-approved on October 26, 2026 through the stage-review form. No later assistant action family has started. Approval of this stage does not start them automatically.

## 29. Slice 9 decision/correction server foundation

The user authorized the decision/correction stage and approved reusing the existing Decision card with these input rules:

- Initial missing outcome, absolute date or channel stays visibly missing and blocks confirmation. No current date, relative date or channel is guessed.
- Corrections preserve saved outcome/date/channel/note when the corresponding proposed field is null. An explicit empty note clears it. Corrections always need a nonblank reason.
- Proposed fields are reviewed, not edited inside the card. Changes require a fresh proposal and review.

This first step implements only the protected server foundation:

- [Strict decision contracts](../packages/contracts/src/estimate-decision-chat.ts) separate preparation inputs, compact tickets, the private browser review, metadata-only decisions and checked receipts. The compact ticket excludes the recipient, previous/private notes and correction reason. Relative/nonexistent dates, extra authority/content fields, inconsistent identities, forged readiness and mismatched receipts are rejected. Incomplete or future-dated reviews remain reviewable but cannot confirm.
- [Durable proposals](../packages/data/src/estimates/chat-decisions.ts) bind the owned active turn, exact Estimate or validated current-page reference, current independently readable parent, frozen snapshot/total, previous decision, saved version, policy/membership identity and conservative CRM/date evidence. Their lifetime is at most 15 minutes. Draft, sharing and decision intents supersede one another in the same owned thread; invalid preparation does not replace the current intent.
- Preparation/read/cancel changes no Estimate, decision, staff notification, delivery or CRM record. Only a separate explicit confirmation on the owned completed turn calls the existing decision executor. It atomically commits the immutable decision, status/frozen accepted amount, queued-mail stop, existing staff notifications, history, operation receipt, proposal resolution and metadata-only audit. Retries/concurrent confirmation write once. Audit failure rolls everything back.
- [Transaction-level decision helpers](../packages/data/src/estimates/decisions.ts) retain the manual service wrappers and their validation/authorization. Manual activity remains `ui`; assistant-confirmed activity projects to chat. Field can record an initial decision only within its current assigned-Job scope, never correct a decision. Corrections retain the separate Owner/Admin/Office grant.
- Declined decisions do not move a Lead. The resulting operation receipt remains compatible with the existing separately confirmed Lost-stage review; metadata-only Declined corrections do not suggest another Lost transition. Correcting a converted Estimate does not alter or recreate its Job. Published and legitimate zero-total Estimates are supported.
- Confirmation/read/open recheck current authority and reviewed identity. Expiry, supersession, changed parent/Estimate/private review, stale manual decisions, assignment loss and membership replacement fail closed. Confirmed receipts survive their own business mutation without authorizing another write.

Validation:

- **249 focused tests** pass across strict decision/sharing contracts and the approved Decision card/dialog validation.
- **115 isolated Estimate database journeys** pass, including 15 new assistant decision journeys covering no-write/incomplete/cancel behavior, concurrent confirmation, frozen totals, exact receipts, preserved/cleared notes, immutable history, future dates, correction reasons, bindings/ownership/parent grants, expiry, full rollback, Field limits, membership replacement, Lead follow-ups, converted Jobs, selected-page identity, three-family supersession, Published zero totals and stale/tampered reviews.
- **Four existing manual Playwright journeys** pass: decision API origin/binding/permissions/retries; Accepted/Declined/metadata corrections with frozen paper and converted Job; stale/revoked-grant review; and the independent Lost-stage confirmation.
- Contracts/data/agent/web typechecks and targeted ESLint pass. No component or story was changed in this step; connected decision UI/accessibility/browser acceptance belongs to the next step.

The additive [decision-proposal migration](../packages/data/src/migrations/202610270001_estimate_chat_decisions.ts) was applied only to distinct guarded local development/test databases, with the pending migration list checked first. Retained proposals/audits prevent rollback from dropping their tables. No dependencies, production operation, provider-backed acceptance or real customer mail was introduced.

**Status:** Server foundation implemented, verified locally and user-approved through the server-step review form. At that approval, decision operations were not yet advertised in `estimates_propose_action`; agent/API/transport/card integration was explicitly left for the next authorized step. The subsequent connected implementation is recorded in section 30 and needs its own review.

## 30. Slice 9 connected decision/correction proposals

The user authorized connecting the approved server foundation to the existing Decision card. This step does not redesign the card or begin another action family.

### Connected behavior

- `estimates_propose_action` now accepts strict `decision` and `correct-decision` requests on registered Estimate surfaces. Potential `estimates.decide` access plus independent Estimate read can expose the proposal capability without requiring create/update/send. The server independently rechecks the exact Estimate, parent, current assignment and correction-role ceiling. The model still has no commit tool.
- The [proposal handler](../apps/web/src/server/chat/tools/estimate-drafts.ts), graph envelope, live/replayed `estimates.decision` event and restored history carry only the compact ticket. Recipient, prior/proposed decision notes and correction reason are excluded from that result. Private review fields load separately through the authenticated, no-store [decision endpoint](../apps/web/src/app/api/chat/estimates/decisions/route.ts). Writes require the configured same origin and exact metadata-only bindings; the browser cannot substitute outcome/date/channel/note/reason.
- The [connected Decision card](../apps/web/src/features/assistant/estimate-result/estimate-decision-result.tsx) reuses the approved layout and Existing versus Proposed correction review. It checks the current private review on mount, focus and every 15 seconds, enforces expiry, guards concurrent/late responses and discards private data when its host is disabled or identity changes. Missing initial fields or a correction reason visibly block confirmation. Null correction fields preserve saved values; an explicit empty note clears it. Details cannot be edited in the card; request a fresh proposal instead.
- Only explicit card confirmation invokes the existing atomic decision transaction. Typing yes, preparing, loading, opening or cancelling a proposal records no decision. Confirmation/cancellation receipts restore after reload; opening the saved Estimate rechecks authorization and the exact destination. Failures are explicit, private stale reviews are redacted and private card content is excluded from print.
- An actual transition to Declined on a Lead-linked Estimate reuses the existing independent Lost-stage suggestion and confirmation dialog, including native assistant-modal hosting. Dismissing it changes nothing. A metadata-only Declined correction does not suggest another Lost transition. No automatic Lead-stage change, Job mutation, signature, payment or customer notification is introduced.

### Checked follow-up continuity

Model history receives an app-recorded decision reference containing only proposal state/mode and Estimate ID/number/revision. Only confirmed state proves that a decision was recorded; the original ticket's pre-mutation Estimate status is not a current-status read. Private review values and reasons are not copied into that reference.

Follow-up answers persist flattened source-turn IDs in `chatTurns.estimateDecisionEvidence`, bounded to seven. Older assistant context is dropped rather than exceeding that provenance budget. Each source must be an owned completed turn in the same conversation and must still pass current decision-review authorization. The current CRM/date stamp additionally binds inherited answers. Expiry, supersession, record changes, assignment loss or membership replacement redact retained dependent answers and block later streamed text; deleting a source does not silently erase the dependency.

The additive [provenance migration](../packages/data/src/migrations/202610270002_estimate_decision_evidence.ts), alongside the section 29 proposal migration, was applied only to distinct guarded local development/test databases. Rollback refuses to drop retained provenance.

### Review examples

- [Record Accepted](http://127.0.0.1:6006/?path=/story/assistant-connectedestimatedecision--record-accepted)
- [Correct an existing decision](http://127.0.0.1:6006/?path=/story/assistant-connectedestimatedecision--correction)
- [Explicitly clear the note](http://127.0.0.1:6006/?path=/story/assistant-connectedestimatedecision--clear-note)
- [Missing initial fields](http://127.0.0.1:6006/?path=/story/assistant-connectedestimatedecision--missing-fields)
- [Missing correction reason](http://127.0.0.1:6006/?path=/story/assistant-connectedestimatedecision--missing-reason)

### Verification

- **756 focused tests** pass across strict contracts, graph/access/model, server results, streaming/replay, browser bindings and existing Draft/Send/Publish/Decision review rules.
- **115 isolated Estimate database journeys** pass with both decision migrations present, retaining the 15 decision journeys and existing manual/Draft/sharing behavior.
- **51 distinct Playwright journeys** pass across sequential runs: 12 connected decision journeys, nine sharing, 11 Drafts, 15 Estimate reads and four existing manual decision regressions. Decision coverage includes live/reloaded keyboard confirmation, exact concurrent receipts, missing fields, preserve/clear corrections, origin/ownership/bindings, assignment and membership revocation, independent Lost-stage confirmation, checked model follow-ups, mid-stream revocation and pending-proposal expiry invalidating inherited answers.
- **13 connected Decision stories** pass interaction/WCAG checks and fit 320/390/820/1440px without horizontal overflow (**52 responsive checks**). Private headings, data and controls are excluded from print. States include explicit failures, mismatched reviews and late disabled-host responses.
- Contracts/data/agent/web typechecks, targeted ESLint, production Storybook build and whitespace checks pass. The existing Home duplicate-workspace-key warning, missing Storybook favicon, lint React auto-detection warning and Storybook dependency/chunk-size warnings remain unrelated. Story console checks exclude only the identified favicon 404, not other errors.

Database rehearsals and browser suites were run separately to avoid interference with global synthetic email-worker fixtures. No dependency installation, commit, production migration/deployment, provider-backed model acceptance or real customer mail occurred.

**Status:** Connected, verified locally and user-approved through the integration review form. Approval covers this decision/correction integration step only. The subsequently authorized Revise/Duplicate server step is recorded in section 31. Other lifecycle proposals, assistant conversion, CSV handoff, final Slice 9 acceptance and production/provider rollout remain separate work.

## 31. Slice 9 Revise/Duplicate server foundation

The user approved the existing manual copy/revision rules and a bounded server-first implementation. This stage reuses the real services; it does not add a model commit tool or enable an assistant UI.

### Approved behavior and bindings

- **Revise:** create the next Draft under the same Estimate number from the verified frozen source. Clear source internal notes, preserve frozen customer content and the carried payment URL, and retain the existing payment-link/replacement re-review before any later Send/Publish. The source stays active; preparation and Draft creation do not supersede it, revoke its token or stop its queued mail.
- If that source already has a pending revision Draft, review **reusing that exact saved Draft**, including its current edits and private notes. Confirmation adds only the existing operation receipt and proposal audit, not a second Draft or an overwrite. A create review cannot silently become reuse after another person creates the Draft; it must be refreshed.
- **Duplicate:** create a separate Draft/new Estimate number on the same independently readable Lead/Job. Use the existing saved-row copy rules, not revision snapshot reconstruction: copy content, prices and internal notes; append the existing `(copy)` suffix; clear recipient name/email, valid-through date and payment link. Decisions, delivery history, tokens and snapshots are not copied. The new number is assigned only on confirmation, never predicted during preparation.
- Copied catalog lines retain the saved price, not today's catalog selling price. The private review uses the current permitted/available catalog metadata that the manual create service actually writes; later metadata or availability changes require a fresh review. New revisions copy frozen units without inventing catalog provenance.
- Exact UUIDs keep their exact identity. An exact Estimate number identifies the current family revision; for Revise, a latest pending revision resolves to its source and an explicit reuse plan. A Draft UUID is never silently retargeted to its predecessor. Null references require a registered current Estimate detail/editor reference; an unrelated page reference is not enough.
- Revise retains independent Estimate read/create/update and parent-read authorization; Duplicate requires read/create and parent-read, not update/send/decide. Field remains limited to assigned Jobs and the existing prepared-by rules. No assistant proposal can change the parent, edit copied values, broaden those grants or guess missing dates/prices.

### Server implementation

- [Strict contracts](../packages/contracts/src/estimate-draft-action-chat.ts) separate preparation, compact tickets, protected full reviews, metadata-only browser commands and exact create/reuse receipts. Compact tickets contain source identity, operation, plan and hash/window bindings, not recipient details, scope, items, copied notes or payment links. Review values stay in durable private storage.
- [Shared transaction/review helpers](../packages/data/src/estimates/drafts.ts) preserve the existing public manual wrappers and manual `ui` activity. Assistant confirmation calls those same business operations inside the proposal transaction and attributes newly created Draft activity to `assistant-confirmed`; it does not nest another workspace transaction or implement a second copy engine.
- [Durable proposals](../packages/data/src/estimates/chat-draft-actions.ts) bind an owned active leased turn, registered surface, source/version/status, frozen snapshot where applicable, parent/version, exact copied content and amount, create/reuse plan, next revision counter, membership-incarnation/policy authority and conservative CRM/date evidence. Reviews expire after at most 15 minutes. Preparation/read/cancel writes no business record, number allocation, email, notification or CRM change.
- Only an explicit operation on the owned completed turn may confirm. The business Draft/items/counters/activity/operation receipt, proposal resolution and metadata-only audit commit together. Audit failure rolls everything back, including reuse receipts and number/revision allocations. Concurrent confirmation/retry resolves once to the same exact saved result.
- Confirmed receipts recheck current authority, source, parent, exact saved Draft/value/version/lineage and post-operation evidence. Opening returns only the protected route for that result. Destination edits/deletion, source changes, lost access or replaced membership withhold the old receipt rather than authorizing another write. The conservative stamp also notices later public-link view counters and other CRM changes.
- Draft create/update, sharing, decisions and these Draft actions now supersede pending intent across all four families in one owned conversation. Invalid preparation preserves the previous intent. Expired/superseded evidence cannot authorize later release; expected authorization/conflict/eligibility failures withhold stale private views, while unexpected failures propagate.

The additive [proposal/audit migration](../packages/data/src/migrations/202610270003_estimate_chat_draft_actions.ts) was applied only to distinct guarded local development/test databases after checking the exact pending migration list. Rollback refuses to drop retained proposals/audits.

### Verification and boundary

- **89 focused tests** pass across new contracts, existing Draft/revision/sharing/decision contracts and revision-review/family helpers. The combined advertised proposal schema still rejects Revise/Duplicate: this foundation is deliberately not registered yet.
- **135 isolated Estimate database journeys** pass, including **20 new Draft-action journeys**. Coverage includes no-write preparation/cancellation, frozen versus saved copying, exact canonical totals, concurrent/replayed confirmation, unchanged predecessor links, existing-Draft edits/reuse, exact reference/current-page resolution, changed creation intent, deleted-revision gaps and exact counters, independent grants, Field scope, ownership/turn/window/hash checks, private-payload tampering, both sides of the expiry boundary, all-or-nothing audit failure for create/duplicate/reuse, membership replacement, four-family supersession, closed/archived sources, empty versus zero totals, catalog changes without repricing, destination edits/deletion, parent changes, abort/lease/surface checks and rollback retention.
- **12 existing manual Playwright journeys** pass: revision API scope/origin/identity, live Publish/Send replacement, accepted-predecessor conflict, phone/desktop list Duplicate/Delete, pending revision reuse/deletion, lost-response retries, stale revision reload and detail/Draft duplication. Existing duplicate-workspace-key React warnings remain unchanged.
- Contracts/data/agent/web typechecks, targeted ESLint and whitespace checks pass. The existing lint React auto-detection warning remains. No component/story was changed, so new UI, interaction/accessibility acceptance and Storybook build belong to the subsequent presentation/integration step.

**Status:** Rules and the implemented, locally verified server foundation are user-approved through their respective review forms. Approval covers this server step only; its subsequent separate confirmation presentation is tracked in section 32 and live integration in section 33. At this foundation checkpoint, no model registration, HTTP/browser wiring, dependency installation, commit, new server, production migration/deployment, provider-backed model acceptance or real customer mail occurred.

## 32. Slice 9 Revise/Duplicate confirmation presentation

The user approved a separate Revise/Duplicate card that reuses the established Draft content/totals display, then pauses for Storybook review before live integration.

### Implemented presentation

- Added the application-owned [EstimateDraftActionCard](../apps/web/src/features/estimates/estimate-draft-action-card/estimate-draft-action-card.tsx), colocated copy, typed host boundary, fictional fixtures, review helpers, tests and stories.
- Distinguishes **Create revision Draft**, **Use existing revision Draft** and **Create duplicate Draft**. Shows the exact source number/revision/name, linked Lead/Job and intended revision or separate-number outcome.
- Shows read-only recipient/address/prepared-by/payment information, full scope/message/terms/validity, ordered items, saved prices/units, taxable/included flags and canonical subtotal/discount/tax/total/deposit/balance. A minimal shared renderer export preserves the existing create/update card's markup and behavior; no second money calculator was added.
- States the frozen-content versus saved-row copy rules and the duplicate recipient/date/payment clearing rules. Existing-Draft reuse explicitly preserves its edits and notes without overwriting or creating another Draft. Carried payment links retain their later re-review warning. Internal notes have a separate staff-only section; new revisions do not copy source notes.
- Explicit Confirm/Cancel submits only workspace/proposal/action/source/version/hash bindings. There are no editable fields, API calls, implicit business writes, sends, relinking or navigation. Resolving a callback does not fabricate a saved/cancelled receipt. Only an independently checked host-confirmed receipt offers **Open Draft**, also as a metadata-only host request.
- Strict contract parsing, independent full-view host matching, current grant/parent checks, proposal-window checks and canonical exact-total agreement gate rendering/actions. These are presentation checks, not a browser claim to recompute the server's cryptographic evidence. Invalid, stale or unavailable hosts redact the review. Terminal cards omit copied fields, items and private notes.
- Synchronous single-flight locking, explicit rejected/thrown errors with retry, action-time expiry checks and deadline updates protect interactions. Keyed host lifetimes discard late responses after workspace/proposal/grant/context/disabled/handler changes. The card and all nested private review content are excluded from print.
- Uses the existing assistant message-supplement slot for a fictional native-modal composition. Natural-language “yes” does not operate the proposal. No generic assistant model schema or live adapter was changed.

### Review examples

- [Create revision Draft](http://127.0.0.1:6006/?path=/story/assistant-estimatedraftactioncard--create-revision)
- [Duplicate with cleared fields and copied staff notes](http://127.0.0.1:6006/?path=/story/assistant-estimatedraftactioncard--duplicate)
- [Reuse an edited existing revision Draft](http://127.0.0.1:6006/?path=/story/assistant-estimatedraftactioncard--reuse-edited-draft)
- [Request is not a saved receipt](http://127.0.0.1:6006/?path=/story/assistant-estimatedraftactioncard--request-is-not-a-receipt)
- [Explicit authoritative host outcome](http://127.0.0.1:6006/?path=/story/assistant-estimatedraftactioncard--authoritative-host-outcome)
- [Inside the assistant](http://127.0.0.1:6006/?path=/story/assistant-estimatedraftactioncard--inside-assistant)
- [Maximum 100 saved item rows](http://127.0.0.1:6006/?path=/story/assistant-estimatedraftactioncard--maximum-items)

### Verification and boundary

- **136 focused tests** pass across the new presentation helpers, approved shared Draft review helpers and Draft-action contracts. Coverage includes exact plans/bindings/receipts, malformed projections, copy rules, independent grants, saved-price provenance, catalog units, canonical totals, literal content, null versus zero and exact expiry boundaries.
- **42 new Storybook scenarios** pass their interactions and WCAG 2 A/AA + 2.1 AA checks. Includes all three operations, Lead/Job, archived Duplicate sources, empty/zero/100-item Drafts, waiting versus host-confirmed/cancelled state, expiry, stale/missing context, grants, unavailable/disabled hosts, rejected/thrown operations, successful retry, single-flight requests, late responses and native assistant composition.
- **168 responsive checks** pass at 320/390/820/1440px with no document or open-dialog horizontal overflow. **42 private-print checks** confirm the card's actual private headings, fields, copy, status and controls have no rendered print boxes, without relying on a hidden story decorator.
- **13 existing create/update Draft stories** pass their interaction and WCAG checks after the renderer extraction. The new keyboard story verifies Tab order, the shared 3px focus ring and Enter confirmation. A separate 390px native-modal check verifies 12 trapped Tab steps, Escape closure, restored launcher focus and reopening.
- UI/web typechecks, targeted ESLint, production Storybook build and tracked/untracked whitespace checks pass. Existing Storybook dependency/chunk/timing warnings remain. No business/database implementation changed, so the prior approved server/database/manual-browser evidence remains unchanged rather than being rerun as a proxy for this UI step.

**Status:** The layout and the implemented, locally verified presentation are **user-approved** through their respective review forms. At this presentation checkpoint, live agent/API/history/operation wiring had not started, and no dependency installation, commit, new server, migration, production deployment, provider-backed acceptance or customer mail occurred. The user subsequently authorized the separate integration recorded in section 33; approval here does not cover that integration or other action families.

## 33. Slice 9 connected Revise/Duplicate proposals

The user authorized live integration after approving the server foundation and the separate confirmation presentation. This step connects only those approved Revise/Duplicate operations, without changing their business rules.

### Implemented integration

- The advertised `estimates.propose` union now accepts strict `revise` / `duplicate` preparation with only an exact Estimate UUID/number or registered selected-page reference. Model instructions distinguish preparation from execution. The model cannot supply copied values, confirm an operation or choose a destination.
- The server tool uses the approved proposal service and existing manual transaction helpers. Model evidence contains only source identity and create/reuse-plan metadata with an explicit unsaved boundary. Compact `estimates.draft_action` stream/history tickets omit copied fields, items, private notes, saved receipts and navigation URLs; graph checkpoints do not retain the private review.
- The authenticated [Draft-action endpoint](../apps/web/src/app/api/chat/estimates/draft-actions/route.ts) independently reads the private review and accepts same-origin, metadata-only Confirm/Cancel/Open requests for the owned completed turn. Current grants, parent/source/destination, membership authority, hashes, versions, content/counter evidence and expiry remain server-enforced.
- The [connected adapter](../apps/web/src/features/assistant/estimate-result/estimate-draft-action-result.tsx) reuses the approved card. Mount/focus/periodic reads recheck the protected review. Strict response parsing, immutable ticket comparison, exact action outcomes and exact receipt/workspace navigation checks reject mismatches. Abort/sequence/keyed-lifetime guards discard stale responses after ticket/workspace/disabled changes.
- Confirm resolves the authoritative saved receipt; cancellation saves no business data. Reload/retry failures are visible. A failed history refresh does not invent a failed save or fabricate another receipt. Only explicit, independently checked **Open Draft** navigates; preparation/confirmation neither navigates nor sends/publishes.
- Revise creates the frozen-content Draft under the same number or explicitly reuses the exact edited pending Draft without overwriting it. The predecessor stays active until a later separately confirmed Send/Publish. Duplicate creates a new-number Draft on the same parent, retaining saved content/private notes and clearing recipient name/email, valid-through date and payment link.
- Follow-up model history receives an app-recorded compact state/action/source/plan reference, not the private review or destination receipt. Confirmed history proves the operation, not the saved record's current identity/status; a current read is required for those claims. Flattened inherited source IDs are owned, completed, same-thread and rechecked for current authority, expiry and supersession. Decision and Draft-action sources share a seven-source history budget; older context is omitted rather than overflowing it.
- The additive [Draft-action evidence migration](../packages/data/src/migrations/202610270004_estimate_draft_action_evidence.ts) persists flattened provenance on `chatTurns`. It was applied only to distinct guarded local development/test databases after exact pending-file checks. Rollback refuses retained nonempty provenance.

### Shared pending-intent correction

Integration exposed a cross-family issue: a new proposal could inherit a pending proposal's provenance, supersede that proposal itself, then fail its own evidence check. The shared [supersession helper](../packages/data/src/estimates/chat-proposals.ts) now removes only the pending decision/action source-turn IDs it actually replaced from the **current turn's** corresponding inherited provenance, inside the same transaction. It retains unrelated/confirmed dependencies and all older dependent turns' provenance. Those older answers still redact when their original pending source becomes invalid. All four proposal families use this transition; superseded evidence is not globally ignored.

### Connected review examples

These Storybook previews use fictional data and mocked network outcomes; they do not perform real operations.

- [Create revision Draft](http://127.0.0.1:6006/?path=/story/assistant-connectedestimatedraftaction--create-revision)
- [Duplicate with copied notes and cleared fields](http://127.0.0.1:6006/?path=/story/assistant-connectedestimatedraftaction--duplicate)
- [Reuse the exact edited revision Draft](http://127.0.0.1:6006/?path=/story/assistant-connectedestimatedraftaction--reuse-edited-revision)
- [Confirm, show checked receipt, then explicitly open](http://127.0.0.1:6006/?path=/story/assistant-connectedestimatedraftaction--confirm-revision)
- [Inside the native assistant](http://127.0.0.1:6006/?path=/story/assistant-connectedestimatedraftaction--inside-assistant)

### Verification and boundary

- **308 focused tests** pass across 15 files, including strict tool/stream/client boundaries, seven-source provenance limits, agent instructions/runtime, approved presentation and existing proposal/client regressions.
- **136 isolated Estimate database journeys** pass. The added cross-family journey checks pending decision and Draft-action sources against all four replacement families, preserves unrelated dependencies and leaves older dependent turns untouched. Earlier foundation coverage remains intact.
- **64 distinct Playwright journeys** pass across sequential runs: **17 new Draft-action journeys** and **47 existing assistant read/Draft/sharing/decision regressions**. New coverage includes real browser revision/Duplicate/reuse and restored receipt/opening, no-write preparation/cancellation/natural-language yes, metadata/ownership/origin boundaries, concurrent/lost-response confirmation, stale creation intent, Field-scope loss, same-role membership replacement, changed destinations, exact references, flattened retained provenance, streaming revocation/expiry and cross-family replacement. Same-role replacement during the initial proposal stream withholds later text and the compact ticket.
- **21 connected Storybook scenarios plus 13 existing Draft stories** pass interactions and WCAG 2 A/AA + 2.1 AA checks. The new stories pass **84 responsive checks** at 320/390/820/1440px and **21 private-print checks** against actual private card content, not a hidden decorator. They cover all three plans, checked confirmation/opening, cancellation/restoration, unavailable/expired/superseded/mismatched reviews, explicit errors/retry and late responses.
- A separate connected native-modal check at 390px passes 12 trapped Tab steps, the 3px focus ring, Escape closure, restored launcher focus and reopening.
- Contracts/data/agent/web typechecks, targeted ESLint, production Storybook build and tracked/untracked whitespace checks pass. Existing Home duplicate-workspace React keys, lint React auto-detection and Storybook dependency/chunk/timing warnings remain unrelated.

**Status:** Implemented, verified locally and **user-approved** through the integration review form. The server foundation, presentation and live integration have each received their separate approvals. No dependency installation, commit, new persistent server, production migration/deployment, provider-backed acceptance or real customer mail occurred. Approval is recorded and this step is complete. Void/Archive/Restore/Delete proposals, conversion, CSV handoff, final Slice 9 acceptance and rollout remain separate and unstarted.

## 34. Slice 9 Void server foundation

The user approved the manual-equivalent rules below and selected **Approve and build Void server foundation**. This step deliberately stops before presentation and live assistant integration; it does not include Archive/Restore/Delete or other remaining actions.

### Approved rules and implemented boundary

- Only a currently unarchived Sent or Published Estimate is eligible. Current workspace-local expiry, read access, parent access and the independent Void grant are checked at preparation and confirmation. Update/Send/Decision/Archive/Delete grants do not substitute for Void; an Office user with the required grants may confirm without those unrelated grants. Field has no default Void grant.
- A nonblank staff-history reason is required before confirmation, with the existing **500 raw-character** limit checked before trimming outer whitespace. Internal spaces and line breaks are retained. The model cannot invent a reason: nonnull preparation reasons must be exact quotes from the current persisted user message. A null reason produces an explicitly incomplete, non-confirmable review; confirmation cannot fill or replace it.
- The new [strict Void contracts](../packages/contracts/src/estimate-void-chat.ts) accept only `void`, an exact UUID/Estimate number or registered selected-page reference, and the reason/null. They remain separate from the advertised `estimates.propose` union. An explicit UUID never silently retargets a different revision; an Estimate number resolves the current revision, even when it is an ineligible Draft.
- The [proposal service](../packages/data/src/estimates/chat-voids.ts) returns a compact ticket, excluding the reason, recipient/contact details, amounts, private notes, customer tokens and saved receipt. Independently authorized private reads contain only the frozen source summary/recipient/total, current parent/version, workspace date/timezone and reviewed reason. Snapshot hashes and canonical review/input hashes bind the exact content.
- Durable proposals bind owned thread/turn, workspace/user, source ID/version, membership/policy authority and current CRM/date evidence, with a maximum **15-minute** lifetime. Preparation requires an active leased supported turn; private browser-style reads and operations require the owned completed turn. Metadata-only Confirm/Cancel/Open rejects changed bindings; natural-language “yes” is not an executable decision.
- Preparation/read/cancellation change no Estimate business data. Confirmation reuses the extracted [manual Void transaction](../packages/data/src/estimates/lifecycle.ts), not a second withdrawal engine: set Void and increment the version, revoke active customer tokens, stop queued deliveries, retain the record/frozen snapshot and commit staff history, operation receipt and proposal audit atomically. History stores the established `assistant-confirmed` source and projects it as Chat. The existing manual wrapper retains UI provenance.
- Withdrawal does not archive/delete, create or change a Job, alter a payment or send a new customer message. The customer link returns withdrawn without exposing the reason; frozen content stays unchanged. Queued deliveries are marked inactive using the existing delivery-stop helper.
- Concurrent/replayed Confirm resolves one authoritative receipt, activity and audit. Current authority, source/snapshot/parent/reason/version/updated-time and saved-result evidence are rechecked before restoring a receipt, retrying or returning an explicit checked Open link. Confirmation/cancellation never navigates. A later archive, edit, membership replacement or other evidence change withholds stale outcomes instead of fabricating success.
- All five stored proposal families now share pending-intent supersession. Invalid/aborted preparation cannot supersede the prior intent. The established replacing-turn-only removal of pending decision/Draft-action provenance also applies when Void is the replacement; unrelated sources and older dependent turns remain unchanged. Void-specific stream/history provenance is not connected in this foundation.
- The additive [Void proposal/audit migration](../packages/data/src/migrations/202610270005_estimate_chat_voids.ts) was applied only to distinct guarded local development/test databases after checking that it was the exact sole pending file. Rollback refuses retained proposals/audits; audits contain metadata/hashes, not the reason.

### Verification and known current-worktree UI failures

- **142 focused tests** pass across six contract/history files, including **31 new Void contract cases**. Covers exact references, raw reason limits/trimming, strict metadata-only bindings, compact-ticket privacy, readiness/receipt consistency, eligible source states, the exact review window and continued rejection by the advertised model schema.
- **156 isolated Estimate database journeys** pass: the existing 136 plus **20 new Void journeys**, with the existing inherited-provenance replacement journey extended to the fifth family. Coverage includes no-write preparation/cancellation, missing/invented reasons, exact 500-character/multiline input, Sent/Published/Lead/Job behavior, frozen-snapshot immutability, delivery stops and public withdrawal, concurrent/replayed confirmation, all-or-nothing audit failure, independent/current grants, ownership/completed turns, tampered private/state/metadata, exact expiry, read-time expiration, later manual withdrawal/archive, same-role membership replacement, checked result/opening, exact reference resolution, supersession both ways, aborted/expired-lease/unsupported turns and migration retention.
- **Two targeted Playwright regressions pass**: existing manual Void/history API authority/origin/version/replay, and connected decision -> Draft-action -> sharing supersession.
- **Two broader existing UI journeys do not pass in the current worktree.** On isolated rerun, the editor/list withdrawal journey successfully withdraws the Estimate and reaches its retained-history/customer-link checks, then fails at a disabled **Preview** menu item. The history/access journey fails to show its injected temporary history-retry error. An initial combined run also encountered the local shared signup-rate limit and a transient disabled confirmation. No UI, history adapter, authentication policy or test expectations were changed to mask these failures; they remain explicitly recorded for separate investigation, not passing evidence for this foundation.
- Contracts/data/agent/web typechecks, targeted ESLint and tracked/untracked whitespace checks pass. The existing lint React auto-detection warning remains. No component/story was changed, so presentation, accessibility and Storybook build acceptance are not claimed for this backend step.

**Status:** Rules, build scope and the implemented/verified server foundation are **user-approved** through their respective review forms. The user selected **Approve foundation only; keep UI failures recorded separately**. The two current-worktree UI failures above remain unresolved and are not passing evidence or approval of UI behavior. At this foundation checkpoint, no model capability, HTTP route, stream/history projection, browser card or live assistant operation was enabled for Void. No dependency installation, commit, new persistent server, production migration/deployment, provider-backed acceptance or real customer mail occurred. This foundation step is complete. The user subsequently authorized the separate presentation recorded in section 35; that does not enable live integration or any other remaining action family.

## 35. Slice 9 Void confirmation presentation

After foundation approval, the user authorized presentation only and approved a **separate read-only assistant card with direct explicit confirmation**, rather than editing the manual Void dialog or adding a second repeating confirmation dialog.

### Implemented presentation

- The application-owned [EstimateVoidCard](../apps/web/src/features/estimates/estimate-void-card/estimate-void-card.tsx) shows the exact Estimate number/revision/name, reviewed Sent/Published status, linked Lead/Job, frozen recipient and frozen total. Zero is a valid saved total; invalid amounts are withheld, not replaced with zero.
- The quoted reason is read-only, preserves internal whitespace/literal text and is visibly staff-only. A missing reason clearly blocks **Confirm withdrawal** but permits **Cancel proposal**. Changing the reason or target requires a fresh proposal; the card does not invent, trim, truncate or edit values.
- The review explains withdrawal, customer-link revocation and queued-delivery stopping, plus retained Estimate/frozen paper/history and no new customer message, archive/delete, Job or payment change.
- Only explicit **Confirm withdrawal**, **Cancel proposal** or confirmed-state **Open estimate** calls an injected host callback with the strict metadata-only command. No endpoint, operation adapter, model registration, stream/history projection, automatic navigation or business-data write is added.
- Independent current read/Void/parent grants, strict displayed-versus-authorized full-view equality, workspace identity and the shared canonical review-window check gate rendering/actions. Disabled, inaccessible, mismatched and malformed reviews redact private content. Missing handlers disable operations and explain the disconnection. Server authority/hash/current-eligibility checks remain mandatory; presentation validation does not replace them.
- Synchronous single-flight, exact deadline/action-time rechecks, visible error/retry feedback and keyed lifetime guards prevent duplicate requests and stale responses after proposal/context/workspace/permission/disabled/handler changes. Responses arriving after expiry do not reveal old errors or claim an outcome.
- Callback success means only **request submitted**. Only a new checked host view/receipt shows Withdrawn or Cancelled. Terminal states omit the reason, recipient, total and parent review. Explicit Open is available only for the exact host-confirmed receipt; the card cannot navigate itself.
- The whole private card is print-hidden, including invalid/error/terminal variants. Its native assistant composition remains a fictional presentation preview, not a connected integration.

### Review examples

- [Sent withdrawal review](http://127.0.0.1:6006/?path=/story/assistant-estimatevoidcard--sent)
- [Missing reason blocks confirmation](http://127.0.0.1:6006/?path=/story/assistant-estimatevoidcard--missing-reason)
- [Checked host outcome after explicit confirmation](http://127.0.0.1:6006/?path=/story/assistant-estimatevoidcard--authoritative-host-outcome)
- [Inside the native assistant](http://127.0.0.1:6006/?path=/story/assistant-estimatevoidcard--inside-assistant)

### Verification and boundary

- **136 focused tests** pass across the new presentation helper, Void contracts and approved Draft-action helper regressions. Coverage includes strict full bindings, independent grants, metadata-only commands, canonical property ordering, missing/max-500/multiline/literal reasons, real zero versus invalid amounts, source eligibility, receipt consistency, window limits and exact expiry.
- **45 new Storybook scenarios plus 13 existing Draft regressions** pass interactions and WCAG 2 A/AA + 2.1 AA checks. The new stories pass **180 responsive checks** at 320/390/820/1440px and **45 private-print checks** against actual card content, not a hidden decorator. An initial long-content fixture exceeded the approved 500-character reason limit and was correctly withheld; the fixture was brought within the real contract before the final full passing run.
- A separate real-keyboard native assistant check at 390px passes the **3px focus ring, 12 trapped Tab steps, Escape closure, restored launcher focus, reopening and explicit Enter request-only confirmation**. Narrow native composition was visually reviewed.
- UI/web typechecks, targeted ESLint, production Storybook build and tracked/untracked whitespace checks pass. Existing Storybook dependency/chunk/timing warnings remain. No business/database/manual-UI implementation changed; the foundation's passing evidence and two separately recorded failing UI journeys remain unchanged, not newly rerun or claimed fixed.

**Status:** The build scope, layout and implemented, locally verified presentation are **user-approved** through their respective reviews. The user selected **Approve presentation only**. At this presentation checkpoint, no live Void agent/API/stream/history wiring, dependency installation, commit, new persistent server, migration, production deployment, provider-backed acceptance or customer mail occurred. The user subsequently authorized the separate live integration recorded in section 36; this presentation approval does not cover that integration or other remaining action families.

## 36. Slice 9 connected Void withdrawal proposals

The user authorized live integration after separately approving the Void rules, server foundation and confirmation presentation. This step connects only the approved withdrawal operation, preserving its manual-equivalent business behavior.

### Implemented integration

- The strict advertised `estimates.propose` union accepts `{ operation: "void", estimateRef: exactUuidOrNumber | null, reason: userQuote | null }`. Tool availability includes independent read/Void potential on supported surfaces without requiring create/update/send/decide; the service still reauthorizes the exact source and parent. Model instructions distinguish withdrawal from Declined, archive, deletion and Job cancellation, require a current-user reason quote, and prohibit chat confirmation or invented reasons.
- The tool prepares the existing durable proposal and returns minimal identity/unsaved evidence. The graph and `estimates.void` stream/history carry only the compact ticket, not the reason, frozen recipient/amount, receipt, customer token or navigation URL. Ephemeral input/review content does not enter graph checkpoints.
- The authenticated [Void endpoint](../apps/web/src/app/api/chat/estimates/voids/route.ts) independently loads the private review with owned completed-turn/current authority checks. Same-origin POST accepts only strict metadata-bound Confirm/Cancel/Open; reason edits and model-provided grants/status/results are rejected.
- The [connected adapter](../apps/web/src/features/assistant/estimate-result/estimate-void-result.tsx) reuses the approved separate card. Mount/focus/periodic reads recheck the protected review. Strict parsing and immutable-ticket matching reject wrong records, bindings or requested outcomes. Abort/sequence/keyed lifetime guards prevent late reads, confirmations or Open responses from reviving prior private state or navigating after host changes.
- Preparation/read/cancellation change no business data. Explicit confirmation uses the approved shared manual transaction: withdraw, revoke active customer links, stop queued deliveries, retain frozen paper/history and save one checked receipt/audit atomically. No archive/delete, new mail, Job/payment change or implicit navigation is introduced.
- Only the exact checked host outcome renders Withdrawn/Cancelled. Failed history refresh is visible without inventing a failed save. Only explicit **Open estimate** may navigate, after independently verifying the exact confirmed receipt/workspace path. Restored/retried outcomes remain subject to current source/snapshot/reason/parent/authority/result evidence.
- Follow-up model history receives only an app-recorded state/action/Estimate ID/number/revision reference. Confirmed history proves the withdrawal operation, not current Estimate status. `chatTurns.estimateVoidEvidence` persists flattened owned/completed/same-thread source IDs. Void, decision and Draft-action references share the seven-source inherited-context budget; older context is omitted rather than exceeding it. Expiry, supersession, changed evidence or revoked/replaced membership blocks later streamed claims and redacts restored dependent answers.
- Pending-intent supersession removes only the Void/decision/Draft-action source IDs it actually replaced from the replacing turn. It preserves unrelated/confirmed sources and older dependent turns; no global exemption for superseded evidence is added. The database journey now checks three source families against all five replacement families.
- The additive [Void evidence migration](../packages/data/src/migrations/202610270006_estimate_void_evidence.ts) was applied only to distinct guarded local development/test databases after checking it was the exact sole pending file. Rollback refuses retained nonempty provenance.

### Review examples

These connected Storybook previews use fictional data and mocked network outcomes, not live operations.

- [Sent withdrawal review](http://127.0.0.1:6006/?path=/story/assistant-connectedestimatevoid--sent)
- [Missing reason blocks confirmation](http://127.0.0.1:6006/?path=/story/assistant-connectedestimatevoid--missing-reason)
- [Confirm, show checked receipt, then explicitly open](http://127.0.0.1:6006/?path=/story/assistant-connectedestimatevoid--confirm-and-open)
- [Inside the native assistant](http://127.0.0.1:6006/?path=/story/assistant-connectedestimatevoid--inside-assistant)

### Verification and boundary

- **277 focused tests** pass across 12 files: strict advertised Void input, independent capability access, model instructions/runtime and checkpoint privacy, bounded/compact transport, client metadata/immutable outcomes/exact navigation, approved presentation and existing proposal/client regressions.
- **156 isolated Estimate database journeys** pass. Existing foundation coverage remains intact; pending inherited provenance now checks decision, Draft-action and Void sources against all five replacement families, preserving unrelated sources and older dependent turns.
- **85 distinct Playwright journeys pass across sequential runs: 21 new Void journeys and 64 existing Estimate assistant read/Draft/sharing/decision/Draft-action regressions.** New coverage includes no-write preparation/cancellation/natural-language yes, missing reasons, real browser metadata-only confirmation/reload/explicit opening, Sent queued-delivery/customer-link effects and retained frozen content, concurrent/lost-response confirmation, strict origin/ownership/completed-turn/bindings, current role and parent changes, same-role membership replacement, changed saved outcomes, flattened follow-up evidence/migration retention, initial/inherited streaming revocation/expiry, all five pending replacements, exact references and immutable max-500 literal reasons.
- The combined 85-journey run initially passed 83 and failed two: the new Sent fixture used a nonexistent review recipient field, and the existing Summary navigation card was still Thinking when its five-second visibility wait expired. The fixture now supplies its known saved recipient; both journeys passed a targeted rerun without changing product behavior or relaxing the existing test. A final full run of the new Void file passes **all 21 journeys**. Earlier fixture-only snapshot sorting/loop-rate-window errors were also corrected. The two broader manual-UI failures recorded in section 34 were not rerun or claimed fixed.
- **21 connected Storybook scenarios plus 13 existing Draft stories** pass interactions and WCAG 2 A/AA + 2.1 AA checks. New stories pass **84 responsive checks** at 320/390/820/1440px and **21 private-print checks** against actual private card content, not a hidden decorator. Includes missing/expired/superseded/unavailable/mismatched reviews, receipt validation, errors/retry, history refresh failures and late GET/Confirm/Open outcomes.
- The connected native assistant passes a separate real-keyboard check at 390px: 3px focus ring, 12 trapped Tabs, Escape/restored launcher focus, reopening and explicit Enter producing the checked outcome. Narrow native composition was visually reviewed.
- Contracts/data/agent/web typechecks, targeted ESLint, production Storybook build and tracked/untracked whitespace checks pass. Existing Home duplicate-workspace React keys, lint React auto-detection and Storybook dependency/chunk/timing warnings remain unrelated.

**Status:** Implemented, verified locally and **user-approved through the integration review form**. The user selected **Approve integration**. Foundation, presentation and live integration have each received separate approval; this integration step is complete. No dependency installation, commit, new persistent server, production migration/deployment, provider-backed acceptance or real customer mail occurred. Archive/Restore/Delete proposals, conversion, CSV handoff, final Slice 9 acceptance and rollout remain separate, unstarted work.

## 37. Slice 9 Archive/Restore server foundation

The user approved Archive and Restore together as one bounded server-only step, retaining the manual rules. Permanent Draft deletion remains separate. This does not authorize a new presentation or live assistant integration.

### Implemented foundation

- The strict, deliberately **unadvertised** [preparation contract](../packages/contracts/src/estimate-archive-chat.ts) accepts only `{ operation: "archive" | "restore", estimateRef: exactUuidOrNumber | null }`. Null requires a registered selected Estimate detail/editor reference. Exact numbers resolve the latest revision; explicit UUIDs remain exact, including eligible older revisions. The model cannot supply confirmation, archive metadata, authority, saved status or a receipt. No reason or typed-number confirmation is added to these reversible operations.
- Archive requires an unarchived, workspace-effective Declined/Expired/Superseded/Void source. Restore requires a currently archived source, preserving any underlying status and revision rather than adding an Archive-only eligibility rule. An incomplete saved recipient stays explicitly empty; a valid saved name/number is still required. Neither operation requires frozen paper or a monetary summary that the manual service does not need.
- The [proposal service](../packages/data/src/estimates/chat-archives.ts) independently reloads current membership, assistant/read/archive permission and Lead/Job parent access. Both actions retain the code-owned Owner/Admin/Office ceiling. Send, edit, decision, Void and Delete grants do not substitute for Archive and are not required.
- Durable owned proposals bind the exact action/source/version, current membership authority, private review hash, conservative CRM/date stamp and positive maximum-15-minute window. Compact tickets retain the pre-operation source identity/status/archive flag and omit recipient, parent, reason, amounts, private notes, receipt and navigation URL. A protected service read supplies the bounded saved summary.
- Read/Confirm/Cancel/Open require an owned completed source turn and exact metadata bindings. Preparation, reading and cancellation change no business data. Expiry blocks pending confirmation/cancellation, supersession withholds replaced evidence, and invalid or changed source/review/parent/authority data fails explicitly.
- Extracted [the existing manual executor](../packages/data/src/estimates/lifecycle.ts) into `setEstimateArchivedInTransaction`, preserving the public wrapper and its default UI attribution. Explicit assistant confirmation changes only archive timestamp/actor, version and update time, with staff activity, operation receipt and proposal audit in the same exclusive workspace transaction. History stores `assistant-confirmed` and projects Chat attribution. No customer message, withdrawal, deletion, Job/Lead/payment change, decision rewrite or customer-token renewal occurs.
- Concurrent/exact retries return one checked saved outcome without duplicate activity. Changed receipts or later source/status/archive/parent/authority changes block restoration, replay and Open. A confirmed outcome may survive proposal expiry only while current saved evidence still agrees. Only explicit checked Open returns the exact Estimate/workspace URL; confirmation never navigates implicitly.
- At this foundation checkpoint, all **six stored service families** participate in one pending Estimate intent per owned conversation; only five are live/advertised. Archive/Restore replaces and is replaced by Draft, sharing, decision, Draft-action and Void intent. Existing replacing-turn-only removal of inherited pending decision/Draft-action/Void sources is preserved; unrelated/confirmed sources and older dependent turns are not rewritten. Archive-specific stream/history provenance remained for the separate live stage, which is now recorded in section 39.
- The additive [proposal/audit migration](../packages/data/src/migrations/202610270007_estimate_chat_archives.ts) was applied only to distinct guarded local development/test databases after checking it was the exact sole pending file. Rollback refuses retained proposal or audit records.

### Verification and boundary

- **240 focused tests across 10 files** pass: strict/unadvertised preparation, metadata-only operations, compact/private separation, exact eligibility/window/receipt/navigation shapes, existing lifecycle/proposal contracts, domain state and unchanged agent access/model/runtime boundaries.
- **181 isolated Estimate database journeys** pass: **25 new Archive/Restore journeys**, all 156 existing journeys, and expanded inherited-provenance coverage for three source families against all six replacement service families. New coverage includes no-write review/cancel, metadata-only business effects, independent grants/roles/parents, any archived Restore status, incomplete recipients/no snapshot requirement, effective expiry, exact references and older revisions, single-result concurrent retries, manual conflicts/correction serialization, audit-failure rollback at preparation/confirm/cancel, membership/grant replacement, private/receipt tampering, expiry/evidence, cross-family supersession, inactive-link retention and guarded migration rollback.
- Initial new database-fixture failures were corrected without changing business rules: a public paper read intentionally records view counts, so unchanged-token comparisons now precede that read; an empty name fixture violated the existing database constraint and now retains a valid saved name; a replacement Draft fixture now has its required persisted user message. The final complete 181-journey run passes.
- **11 distinct existing browser/API journeys pass across sequential runs:** six manual Archive/Restore regressions and five connected Void pending-intent replacement regressions. The initial development-server run passed nine; its Office one-shot injected-read check and a restarted worker's signup throttle failed. After clearing only the isolated fixture signup throttle using the existing assistant-test setup, both failed journeys passed unchanged against the production build. No product behavior or existing browser test was relaxed.
- Contracts/data/agent/web typechecks, scoped ESLint, production app build and tracked/untracked whitespace checks pass. The usual React auto-detection lint warning remains.
- A broader authorization test run reports **634 passing tests and three pre-existing stale assertions**: the catalog count expects 78 instead of 83, and generic Office ceiling assertions incorrectly reject the already approved `estimates.archive` and `estimates.delete` grants. No catalog or policy implementation was changed here. The current Archive/Restore grant/role behavior is separately verified by the passing database and browser checks. These assertions remain separate work, not claimed fixed. The two broader manual-UI failures retained in section 34 were not rerun or claimed fixed.

**Status:** Implemented, verified locally and **user-approved through the foundation review form**. The user selected **Approve foundation only; keep baseline issues separate**. This foundation step is complete. No new component, Storybook presentation, assistant tool advertisement, HTTP chat adapter, stream/history wiring, dependency installation, commit, persistent server, production migration/deployment, provider-backed acceptance or real customer mail was included at this foundation checkpoint. The user subsequently authorized the separate presentation in section 38; live integration still needs a separate approval. Permanent Draft deletion and the disclosed baseline issues remain separate work.

## 38. Slice 9 Archive/Restore confirmation presentation

After foundation approval, the user separately approved the presentation scope and layout: one read-only assistant card with Archive and Restore variants, direct confirmation/cancellation, normal reversible-action styling and no second dialog. This step does not authorize live assistant wiring.

### Implemented presentation

- The application-owned [Archive/Restore card](../apps/web/src/features/estimates/estimate-archive-card/estimate-archive-card.tsx) follows the approved Void/Draft-action card conventions, with colocated types, copy, strict review/request helpers, fictional fixtures, tests and stories.
- Pending reviews show the exact Estimate number/revision/name, reviewed status, Archived flag, linked Lead/Job and saved prepared-for name. A missing/whitespace-only saved recipient displays **Not specified**, without inventing required input or disabling an otherwise eligible action. No monetary summary or frozen-paper requirement is added.
- Archive explains default-list hiding, retained records and finding the record through Include archived and superseded before a fresh Restore review. Restore explains removal of only the Archived flag, unchanged status/revision, current filter/latest-revision rules and no renewal of expired/revoked/withdrawn/replaced customer links. Both retain paper/decisions/staff history and clearly exclude mail, withdrawal, deletion and linked Lead/Job/payment changes.
- Direct **Confirm archive** / **Confirm restore** and **Cancel proposal** emit strict metadata only. There is no reason field, typed-number confirmation, editable summary, second confirmation dialog, automatic inverse action, fetch or navigation. Changing action/target or reversing a saved change requires a fresh review.
- The helper strictly parses both the supplied view and independently authorized host context, checks exact full DTO/workspace binding, independent current read/parent/Archive grants, action-specific eligibility and a canonical positive maximum-15-minute window. These are presentation safeguards, not cryptographic authority checks; the approved server remains authoritative.
- Callback success means only **Request submitted**, never a fabricated saved or cancelled result. Only a new checked host view renders Archived/Restored/Cancelled. Confirmed outcomes offer explicit **Open estimate** request-only behavior and never silently reverse the action. Terminal states omit recipient, parent and the original reviewed status/archive flag rather than implying those remain current.
- Synchronous single-flight, full keyed view/context/workspace/grants/disabled/connection lifetime, action-time expiry checks and mounted/late-response guards prevent duplicate requests or revival of replaced private state. Errors are visible and retryable; permission/context loss redacts the review. The entire private card is excluded from print.

### Review examples

All previews use fictional data and callbacks; they do not call the database or live assistant.

- [Archive a Declined Estimate](http://127.0.0.1:6006/?path=/story/assistant-estimatearchivecard--archive-declined)
- [Restore an archived Estimate](http://127.0.0.1:6006/?path=/story/assistant-estimatearchivecard--restore-declined)
- [Missing recipient remains explicit and confirmable](http://127.0.0.1:6006/?path=/story/assistant-estimatearchivecard--missing-recipient)
- [Checked Archive outcome after explicit confirmation](http://127.0.0.1:6006/?path=/story/assistant-estimatearchivecard--authoritative-archive-outcome)
- [Restore inside the native assistant](http://127.0.0.1:6006/?path=/story/assistant-estimatearchivecard--restore-inside-assistant)

### Verification and boundary

- **170 focused tests across three files** pass: new presentation helper/Archive contracts and approved Void-helper regressions. Coverage includes both actions and all source statuses, exact metadata-only commands, independent grants, full ticket/source/review/parent/receipt binding, empty recipient preservation, literal/maximum content, strict extra-field rejection, canonical windows, exact expiry and checked host outcomes.
- **64 new Storybook scenarios plus 13 existing Draft regressions** pass interactions and WCAG 2 A/AA + 2.1 AA checks. The new stories pass **256 responsive checks** at 320/390/820/1440px and **64 private-print checks** against actual card content, not a hidden decorator. Coverage includes all supported source states, both confirmation/cancellation requests and saved outcomes, missing recipient, literal/long content, invalid/unavailable/context mismatches, failures/retry and late responses after access/workspace/proposal/action changes or expiry.
- Real-keyboard native assistant checks pass for **both Archive and Restore** at 390px: 3px focus ring, 12 trapped Tab steps, Escape closure, restored launcher focus, reopening and explicit Enter producing only a submitted request. Initial scratch-check selectors were corrected to the existing launcher label and scoped card status; no product change was needed. Wide Archive and narrow native Restore layouts were visually reviewed.
- UI/web typechecks, scoped ESLint, production Storybook build and tracked/untracked whitespace checks pass. Existing Storybook dependency/chunk/timing warnings remain. No server, migration, manual UI or live assistant integration changed; section 37's baseline assertions and section 34's two separate manual-UI failures were not rerun or claimed fixed.

**Status:** Implemented, verified locally and **user-approved through the presentation review form**. The user selected **Approve presentation only**. Build scope, layout and the implemented presentation have each been approved; this presentation step is complete. No live tool/API/stream/history integration, dependency installation, commit, new persistent server, migration, production deployment, provider-backed acceptance or customer mail occurred in this presentation step. Live integration was implemented later as the separate section 39 step; permanent Draft deletion remains separate.

## 39. Slice 9 connected Archive/Restore proposals

The user separately authorized connecting the approved Archive/Restore service and confirmation card to the live assistant. Permanent Draft deletion remains out of scope.

### Implemented integration

- The strict `estimates_propose_action` operation union now advertises only `{ operation: "archive" | "restore", estimateRef: exactUuidOrNumber | null }`; it cannot accept confirmation, archive metadata, authority or receipt data. Tool availability and the proposal handler independently recheck the current Estimate read/archive capability and exact target/parent access.
- The authenticated, same-origin API independently loads the private review and accepts only exact ticket metadata for Confirm, Cancel or Open. The connected assistant renders the approved card for live events and restored history. Explicit confirmation reuses the approved transaction-level service; preparation, review and cancellation write no Estimate fields.
- Compact tickets and model history exclude private review fields and receipts. Owned completed-turn Archive evidence is bounded to seven source turns, rechecked during streaming and restoration, and safely superseded without rewriting older dependent turns.
- Archive and Restore remain reversible Archive-flag operations: Archive uses the existing eligibility rules; Restore preserves the saved status/revision and never renews customer links. Explicit checked Open is the only navigation path. The shared pending-intent service now covers all six connected proposal families.
- The additive evidence migration was applied only to the guarded local development and isolated test databases after confirming it was the sole pending migration. No production migration or deployment occurred.

### Verification and boundary

- **158 focused tests across seven files** pass, covering the contracts, tool access, proposal/evidence behavior, APIs, connected card, streaming/history and regressions.
- The isolated Estimate database rehearsal passes, including Archive/Restore provenance inheritance and supersession with the other proposal families.
- **Both Archive/Restore Playwright journeys pass.** They cover browser-confirmed Archive, explicit Open and separate Restore, plus no-write preparation/cancellation, compact retained tickets, exact bindings and private-review ownership.
- Contracts, agent and data typechecks pass. The web typecheck remains blocked by three unrelated existing `connected-calendar-result.stories.tsx` errors (`visits` is not present on availability results); Node 20.19.4 also reports the repository's existing Node `>=22.12.0 <23` engine warning.
- Focused ESLint on the integration and its focused tests passes; only the existing React auto-detection warning appears. `git diff --check` passes. No provider-backed model acceptance, production operation, deployment or customer mail occurred.

**Status:** Implemented, locally verified and **user-approved through the separate integration review**. The server foundation and presentation retain their separate approvals. This integration step is complete. Permanent Draft deletion, conversion, CSV handoff, final Slice 9 acceptance and rollout remain separate.

## 40. Slice 9 permanent Draft-deletion server foundation

After approval of the Archive/Restore live integration, the user approved starting the next separate Slice 9 item as a **server-foundation-only** step. The existing manual deletion flow remains in place. No presentation or live assistant integration is authorized by this step.

### Implemented foundation

- Added a strict, unadvertised preparation contract accepting only one exact Estimate UUID/number or a null reference resolved from the selected Estimate detail/editor page. It cannot accept typed confirmation, deletion scope, authority or receipt data. No model/tool union, handler, HTTP route, streaming event or history renderer advertises the operation.
- The durable owned proposal binds one exact revision's ID, version, never-reused number and revision, current assistant/Delete authority, parent access, private review hash and conservative Estimate/CRM stamp. Proposal lifetime is capped at 15 minutes. Its compact ticket excludes the Estimate name, recipient, parent, review and typed confirmation.
- Preparation/review/cancellation write no Estimate fields. The private review independently rechecks read and Delete authorization, parent access, current version, Draft status, unarchived state, no Sent/Published timestamp and no frozen customer snapshot. Only the exact never-shared revision is eligible; linked records and other revisions are not part of the deletion.
- Explicit server confirmation must supply the case-sensitive Estimate number exactly, with no trimming or normalization. The number is not present in the model ticket as a confirmation field. Confirmation reuses the extracted existing deletion transaction and atomically records the deletion, owned proposal receipt and metadata-only audit. Idempotent retries require the same exact number, and checked terminal reads verify the exact target is absent and the committed confirmation audit exists.
- The existing manual delete schema had trimmed the typed value before its equality check, contrary to the approved UI contract. It now preserves the raw input so whitespace/case mismatches are rejected consistently by manual and assistant service paths.
- The shared pending-intent service now includes a seventh stored family (six connected proposal families plus this unadvertised Draft-deletion family). Both directions of supersession with Archive/Restore are exercised. No Draft-delete chat evidence field or retained model-history projection is added at this foundation stage.
- Additive migration `202610270012_estimate_chat_draft_deletes.ts` was the sole pending migration in both local development and the isolated test database. It was applied only to those two databases; rollback refuses to remove tables while proposal/audit records remain.

### Verification and boundary

- The complete isolated Estimate database rehearsal passes **187 journeys**, including selected-page reference resolution, no-write cancellation, exact typed confirmation, direct service reuse, shared-predecessor preservation, permissions, stale versions, cross-family supersession, metadata-only audit and migration rollback protection.
- **5 focused Draft-deletion contract tests** pass; the focused Draft-deletion, Archive/Restore and revision contract selection passes **61 tests**.
- Contracts and data package typechecks, focused ESLint and `git diff --check` pass. The environment reports its existing Node 20.19.4 versus required Node `>=22.12.0 <23` engine warning.
- No UI/Storybook component, assistant tool advertisement, live API, stream/history wiring, production migration/deployment, provider-backed model acceptance or customer mail occurred.

**Status:** Implemented, locally verified and **user-approved through the separate foundation review**. The existing manual Delete Draft flow was preserved and made consistently exact. The confirmation presentation is recorded separately in section 41; the live assistant connection remains a separate follow-up step.

## 41. Slice 9 permanent Draft-deletion confirmation presentation

After the user approved the server foundation in section 40, they approved this separate presentation step and selected a **separate confirmation dialog** rather than an inline typed-number field. The existing manual Delete Draft dialog remains unchanged. This step adds only the disconnected assistant card and its fictional Storybook demonstration.

### Implemented presentation

- Added `apps/web/src/features/estimates/estimate-draft-delete-card/` with the card, copy, strict presentation/request helpers, fictional fixtures, focused tests and Storybook stories. It is not mounted in the assistant or any production page.
- The private review card shows the exact Estimate number, revision, name, linked Lead/Job and recipient when available. It explains that only this eligible never-shared Draft revision and its line items are deleted, other revisions and linked records remain, and the Estimate number is not released or reused.
- **Review deletion** opens the shared destructive `ConfirmDialog`. The dialog repeats the exact target and impact, requires the case-sensitive Estimate number without trimming, and has an explicit Back action. Back only closes the dialog; the separate **Cancel proposal** action submits cancellation.
- Presentation checks require current read/Delete grants, parent access, strict ticket/review equality, valid workspace identity and a usable review window. Missing authority or a mismatched review hides all private details. The server remains the final authority.
- A successful injected callback reports only that a request was submitted. The card does not claim deletion or cancellation until the host supplies an independently checked terminal view/receipt. No navigation/Open action is provided for a deleted revision.
- The card is `print:hidden`. Stories use fictional records and callbacks only; no tool advertisement, route, live API, assistant stream/history or application wiring was added.

### Verification and boundary

- **41 focused preview tests** pass, covering strict binding, grant loss, exact/case-sensitive/untrimmed typed input, proposal expiry, terminal states and minimal request data.
- **20 selected Storybook stories** were exercised in the browser without console errors. The pending card accessibility scan reports **0 violations / 23 passes**; the open-dialog scan reports **0 violations / 27 passes / 2 inconclusive**.
- At viewport widths **320, 390, 820 and 1440 px**, neither the long-content card nor its dialog has horizontal overflow. The dialog’s typed input meets the 44px minimum height and keyboard focus displays the shared 3px ring.
- Focused ESLint and the production Storybook build pass. Web typecheck remains blocked by the three existing Calendar availability-story `visits` diagnostics; no new Draft-deletion card diagnostics remain. Package commands report Node 20.19.4 while the repository expects Node `>=22.12.0 <23`.
- No assistant tool/API, stream/history, provider-backed acceptance, customer mail, production migration or deployment occurred.

**Status:** Implemented, locally verified and **user-approved through the separate presentation review**. Live assistant integration remains a distinct future step requiring its own authorization.

## 42. Slice 9 connected permanent Draft-deletion proposals

After approving the foundation in section 40 and the confirmation presentation in section 41, the user authorized the separate live assistant integration. This connects the approved exact-number card to the existing durable deletion service without allowing model-authored confirmation.

### Implemented integration

- Added strict Draft-deletion preparation to the shared Estimate proposal contract and handler. Availability requires current assistant, Estimate-read and Delete permissions; the access policy limits this path to Owner/Admin. The server independently reauthorizes the target and parent through the existing durable proposal service.
- Added authenticated same-origin `GET`/`POST /api/chat/estimates/draft-deletions` operations. GET provides a private independently checked review; POST accepts only the immutable proposal binding and Confirm/Cancel. Only explicit browser confirmation carries the exact, case-sensitive typed Estimate number.
- Connected the approved card to the assistant. The destructive confirmation is portaled inside the assistant's native dialog so it remains interactable in the top-layer modal. The host checks returned state/receipt before showing success and refreshes conversation history; deletion offers no navigation to the removed Estimate.
- Added the compact `estimates.draft_delete` stream ticket and authorized history restoration. Model context receives only an app-recorded state/action and Estimate ID/number/revision. Private review, recipient data, receipt and natural-language confirmation are excluded.
- Added `chatTurns.estimateDraftDeleteEvidence` with a seven-source maximum. Inherited turns are rechecked for ownership, same-thread completion, current authorization, expiry and supersession; a replacing turn removes only the pending deletion sources it actually superseded. Migration `202610270013_estimate_draft_delete_evidence.ts` is additive and refuses rollback over retained provenance.

### Verification and boundary

- The isolated Estimate database rehearsal passes **190 journeys**, including deletion-evidence expiry, checked receipt retention, supersession cleanup and rollback protection.
- **34 focused contract/authorization tests** pass; **46 focused card/client tests** pass; the complete Draft-deletion E2E passes **2 tests**, including exact typed confirmation, checked history, ownership, mismatch rejection and cancellation.
- Contracts, Agent and Data typechecks pass. Web typecheck reports only the three previously documented Calendar availability-story `visits` diagnostics. Focused ESLint reports no errors; the production Storybook build passes.
- The new evidence migration was applied to the isolated local test database and the guarded local development database only. No production database, provider-backed model, customer email, deployment or commit was used.

### Cross-operation verification before conversion

- All eight connected Estimate assistant E2E specs pass **89/89 tests**, including restored summary cards and checked list/record navigation.
- The isolated Estimate database rehearsal passes **190 journeys**, including Draft deletion, lifecycle operations, conversion boundaries and CSV export behavior.
- Contracts/Agent tests pass **447 tests across 43 files**; Contracts, Agent and Data typechecks pass.
- Web typecheck remains blocked by the three known `visits` diagnostics in the Calendar availability story. No production database, provider-backed model, customer email, deployment or commit was used.
- Conversion and the CSV handoff were completed and approved separately in sections 43-44. Cross-operation local acceptance is recorded in section 45; production/provider rollout remains open.

**Status:** The connected flows covered here were locally verified and user-approved through their separate reviews. Conversion and assistant CSV handoff were still open at this checkpoint.

## 43. Slice 9 Estimate-to-Job assistant conversion proposal integration

The user approved proceeding with conversion as the next assistant gap after final acceptance of the earlier connected operations. This integration was implemented, locally verified and approved through its separate review. It preserves the existing Estimate conversion form as the only Job-creation path.

### Implemented integration

- Added a strict `convert` proposal contract and shared tool operation. The server requires an active Accepted Estimate attached to an eligible Lead and creates a short-lived, metadata-bound proposal; it never creates a Job during preparation or review.
- Added authenticated conversion proposal GET/POST operations, durable proposal/audit storage, bounded same-thread history evidence, expiry and authorization checks, and pending-intent supersession. Migration `202610270014_estimate_chat_conversions.ts` adds the tables and evidence column and refuses rollback over retained provenance.
- Connected the assistant card to a fresh authorized review, then to the existing protected conversion form. The assistant closes its native top-layer dialog before opening the form's MUI dialog, keeping the separate confirmation interactable. Only that form's explicit confirmation can invoke Job creation.
- Kept customer email, Lead-stage changes and Work Order creation outside this assistant path. The model receives only the proposal state/action and Estimate identity/revision as historical evidence, not the private review or a Job-creation receipt.

### Verification and boundary

- The focused conversion browser E2E passes **1/1**. It verifies private-field redaction from model history, no-write cancellation, the history evidence boundary, form opening without a Job, and exactly one Job only after explicit form confirmation; Work Orders, Lead stage and Estimate deliveries remain unchanged.
- The isolated Estimate database rehearsal passes **192 journeys**, including conversion authorization, stale Estimate/Lead/Customer/policy rejection, expiry, cancellation, supersession, audit minimization and migration rollback protection.
- **4 focused conversion contract tests** pass. Contracts, Agent and Data typechecks pass; focused ESLint passes. Web typecheck remains blocked only by the three known Calendar availability-story `visits` diagnostics.
- Migration `202610270014` was applied only to the guarded isolated test database. No development/production database, provider-backed model, customer email, deployment or commit was used.
- This completes only the conversion integration slice, not all of Slice 9. The CSV handoff is tracked separately in section 44; cross-operation acceptance is recorded in section 45.

**Status:** Implemented, locally verified and **user-approved through the separate conversion review**. The handoff and final cross-operation acceptance are recorded separately in sections 44-45.

## 44. Slice 9 assistant CSV export handoff

The assistant can now hand off to the existing protected Estimate export review. This is a review-only navigation flow, not a second CSV generator or a durable mutation proposal. It reuses the approved `estimate.export` behavior in [section 9.3 of the Estimates plan](estimates-page-plan.md#93-proposed-actions-card-user-confirms-never-committed-by-a-tool) and the existing export protections in [section 11.9](estimates-page-plan.md#119-remaining-work-slice-8-filtered-estimate-csv-export).

### Implemented handoff

- Added strict `export` operation arguments for the current Estimate-list filters or supported explicit list filters. Unsupported filter fields are rejected rather than silently broadened.
- The server checks `estimates.export`, reuses the existing authorized export-preview/read projections, and persists the bounded Estimate result needed for history and navigation. The assistant returns a “Review CSV export” action, never CSV contents or a download.
- Checked navigation reauthorizes `estimates.export` and uses a server-owned result destination. The Estimates page removes the one-time handoff marker, then opens the existing export preview dialog against current data.
- The user can inspect the refreshed count and existing export options there. Download remains a separate explicit action through the existing protected route.

### Verification and boundary

- The focused CSV handoff browser E2E passes **1/1**, verifying filtered results, the existing preview dialog, no download before user confirmation, and CSV download only after clicking **Download CSV**.
- The passing browser run logs a duplicate React key warning whose key equals the test workspace UUID; its source has not yet been isolated.
- **131 focused tests across 7 files** pass. Contracts and Agent typechecks pass. Web typecheck reports only the three known Calendar availability-story `visits` diagnostics; no handoff type errors were reported.
- Focused ESLint, the Storybook build and `git diff --check` pass. No database migration, production operation, provider-backed model, deployment or commit was used.
- This completes only the export-handoff integration. Conversion is separately user-approved (section 43); cross-operation acceptance is recorded in section 45.

**Status:** Implemented, locally verified and **user-approved through the separate CSV handoff review**.

## 45. Slice 9 cross-operation final acceptance

The user approved final acceptance after separately reviewing the Estimate-to-Job conversion and CSV handoff. This checkpoint validates their interaction with the previously approved Estimate assistant operations. It is local/test acceptance only; it did not itself authorize provider-backed acceptance or production rollout. The later provider authorization and outcome are recorded in section 46.

### Acceptance results

- **91/91 Estimate assistant browser tests pass** across all nine Estimate E2E specs. Coverage includes authorized reads and checked navigation, Draft/share/decision/revision/lifecycle/delete proposal boundaries, cancellation and explicit confirmation, stale/changed authority, restored history, Estimate-to-Job conversion, and the review-only CSV download flow.
- The previously reported live Summary reload/navigation failure did not reproduce in three targeted repetitions or the complete E2E suite. Its original cause remains unknown.
- The isolated Estimate database rehearsal passes **192 journeys**.
- Contracts and Agent pass **476 tests across 48 files**. Estimate-focused web tests pass **1,762 tests across 41 files**.
- Contracts, Agent and Data typechecks pass. Web typecheck remains blocked by the three known Calendar availability-story `visits` diagnostics; no Estimate-related diagnostics were reported.
- Focused ESLint, the production Storybook build and `git diff --check` pass. The browser run emits a duplicate React key warning whose key equals the test workspace UUID; its source remains unisolated.
- No production database operation, provider-backed model, customer email, deployment or commit was used.

**Status:** Final cross-operation local acceptance passed and was **approved by the user**. The subsequently authorized non-production Estimate provider check passed and awaits review (section 46); production rollout and deployment remain separate.

## 46. Non-production provider-backed Estimate acceptance

The user authorized provider-backed acceptance in a non-production environment. The opt-in [Estimate live acceptance test](../apps/web/e2e/chat-estimates-live.spec.ts) uses a local `salesmora_test` database, verifies that tracing is disabled, and creates only fictional account, customer, Job and Estimate fixtures. Its prompt requests a read-only Estimate search; it does not confirm or execute a proposal.

### Results and boundary

- The local preflight confirmed the provider key is configured, tracing is disabled, and the isolated test database is loopback-only and distinct from the development database. The configured model metadata, minimal token-count request and minimal generation request succeeded.
- The first full live attempt exposed a real integration defect: the combined `estimates_propose_action` schema contained nested `oneOf`, which the provider's strict tool schema rejects. Replacing the shared Estimate adjustment discriminated union with an equivalent regular union in [estimate.ts](../packages/contracts/src/estimate.ts) preserves the accepted data variants while generating provider-supported `anyOf`. The [shared proposal tool contract test](../packages/contracts/src/estimate-share-chat.test.ts) now asserts `anyOf` is present and `oneOf` is absent.
- Estimate-focused contract tests pass **148/148 across 10 files**. Contracts, Agent and Data typechecks and focused ESLint pass. Web typecheck continues to report only the three known Calendar availability-story `visits` diagnostics.
- After the schema fix, the live provider-backed Estimate search passed **1/1**. It retrieved the exact fictional Estimate, status and total, excluded all private sentinel fields from the response, and left the Estimate records unchanged. One preceding post-fix attempt returned `access_denied`; it did not reproduce on the passing run.
- The passing run recorded completed planning and answer usage in the isolated test ledger. Synthetic accounts were cleaned up. The test is gated by `SALESMORA_LIVE_EVAL=1` and is not run by ordinary E2E commands.
- A separate minimal single-word provider smoke request was used for diagnosis; it contained no app or customer data and is not included in the workspace usage ledger.
- No production database, real customer data, customer email or deployment was used. No proposal confirmation was requested.

**Status:** Non-production provider-backed Estimate acceptance **passed and awaits user review**. Production rollout remains unapproved and was not attempted.


## 47. Staging Estimate email activation — October 28, 2026

The user explicitly requested enabling staging email. The configured staging-only rollout now enables reviewed Send/Resend and working signed-out customer links through the existing Resend provider. Local Mailpit retains receipt recovery, and production remains disabled. All 3,114 unit checks, workspace types/builds, focused local Send/Resend/Publish/API regression journeys and lint (zero errors, existing warnings only) passed. Actual staging provider acceptance on the first attempt, idempotent replay and customer-view privacy/browser/API checks passed with a fictional test-address recipient. See [deployment, controls and operational boundary](estimate-staging-email.md). No new schema or permission-policy change; no actual customer recipient or existing workspace was used.
