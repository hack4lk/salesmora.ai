# Estimates page plan

Status: **Draft for QA walkthrough** — October 19, 2026. Every Decision / Status cell and every open question is blank on purpose; walk it top to bottom.
Scope: the estimates list (`/estimates`), the estimate editor and record page (`/estimates/new`, `/estimates/[estimateId]`), the print-ready preview, sending and publishing, recording the customer's decision, revisions, expiry, linking to leads, customers and jobs, the business identity the estimate carries, and estimate operations in the shared assistant.

> Folder note: the request said "documents"; this repository's documentation folder is `docs/`, so the file lives here.

## How to use this document

Walk it in a QA session, as we did for [customers-page-plan.md](customers-page-plan.md), [leads-page-plan.md](leads-page-plan.md) and [calendar-page-plan.md](calendar-page-plan.md). Every requirement has an ID (`ACC-`, `LST-`, …) and a **Decision / Status** column: `Agreed`, `Change`, `Defer`, or `Question`. Section 12 collects open questions, each with a recommendation; section 13 holds risks. Nothing here is built until a requirement is `Agreed`.

Sources: `prototype/prototype-screen-34-estimates.html` (list), `-33-estimate.html` (editor, preview, decision), `-07-lead-detail.html` and `-12-job-detail.html` ("Create estimate" entry points), `-05-leads.html`/`-08-customers.html` (estimate-sent stage and related records); [permission-catalog.md](permission-catalog.md), [job-module-plan.md](job-module-plan.md), [user-journeys.md](user-journeys.md), [application-structure-plan.md](application-structure-plan.md), [context-aware-agent-architecture.md](context-aware-agent-architecture.md), [privacy-and-messaging-baseline.md](privacy-and-messaging-baseline.md), [salesmora-product-roadmap.md](salesmora-product-roadmap.md), [component-conventions.md](component-conventions.md), [chat-tools.md](chat-tools.md).

**Cross-plan decisions this plan inherits (do not re-decide):** numbered pages 25/50/100; export is a streaming CSV with a configurable cap starting at 50,000 rows and no async path, default Owner/Admin; delete is confirmed by typing the record number; the assistant proposes and the user confirms on a card (a model tool never commits); sorting and filtering from chat are "open in list" links; `workspaces.timezone` is the date authority; in-app notifications are always on and email opt-out lives in the shared per-user notification preferences; the assistant is a global shared panel that receives page context; `recordRefs` is the way a page tells the assistant which record is in focus.

---

## 1. Current state

| Area | Exists today | Gap |
|---|---|---|
| Prototype | Screen 34: list with search, one status filter, five sample estimates, "Create estimate", an "Estimate assistant" card that filters the list. Screen 33: editor with name, generated number, line items (description, qty, unit price), one tax rate, customer message, valid-until, payment terms, deposit, custom terms, work scope, status panel with **Mark accepted / Mark declined**, history, US Letter preview with Print / Save PDF, **Confirm and Send** and **Confirm and Publish**, and a decision dialog. Entry points: "Create estimate" on lead detail (07) and job detail (12). Everything is client-only; sending and decisions are simulated | Everything below |
| Statuses in the prototype | Draft, Sent · awaiting response, Published · not sent, Accepted, Declined | No expiry, revision, void or archive states; no way to edit after sending |
| Data / contracts / API | No estimate table, contract, store, route or navigation entry. Lead stage `Estimate sent` exists as a lead stage only. Jobs have a "Related records" area reserved for estimates | New migration, contracts, store, routes (§3, §4) |
| Permissions | Catalog already defines `estimates.read`, `.create`, `.update`, `.send` (Owner/Admin/Office W, Field J = estimates on jobs they are assigned to) and the `assigned_job` scope. Nothing for decisions, void, archive, delete or export | Add permissions (§6.1) |
| Business identity | `workspaces` holds business name and type. The prototype paper shows address, phone, estimate email, license-style footer. None of this is stored | Business profile and estimate defaults (§6.9, Q4) |
| Tax and money | Prototype uses floating-point arithmetic and one flat rate | Integer cents and a defined rounding rule (§4, Q7) |
| Email | Resend transport and template pattern exist (`server/email/*`, verification, invitation, reset) and the worker sends lead-assignment emails | No estimate email, no customer-facing page, no share token |
| Assistant | Global shared assistant with page context, permission-filtered `customers_query`/`customers_propose_action` and lead tools, durable explicit-confirmation cards | No estimate surface or tools. Context architecture already names `search_estimates`, `get_estimate`, `draft_create_estimate`, `draft_update_estimate`, `draft_preview_estimate` |
| Jobs / Customers | Both are live locally (board/table/detail, customer list/profile). Accepted-estimate-to-job conversion is not built | Conversion step (§6.5) depends on the Jobs creation service |
| Workspace timezone | `workspaces.timezone` exists (default UTC) | Use it for "valid until" and expiry; do not add another timezone field |

---

## 2. Product decisions this page depends on

| ID | Statement (from existing docs and prototypes) | Status |
|---|---|---|
| D-1 | An estimate stays connected to the lead or job it was prepared for ("Estimate stays connected to its lead or job") | Agreed (prototype) |
| D-2 | The user reviews every price. The assistant organizes scope and drafts line items; it never decides pricing silently and never sends | Agreed (roadmap, prototype) |
| D-3 | Sending and publishing are separate: **send** emails the customer; **publish** makes it shareable without an email | Agreed (prototype) |
| D-4 | The customer's decision is **recorded by staff** in MVP (Mark accepted / declined). It is not an online signature, a contract or a payment | Agreed (prototype notice) |
| D-5 | Accepting an estimate does **not** create a job automatically; it makes the estimate eligible to move into job planning | Agreed (prototype) |
| D-6 | Estimate permissions are the four in the catalog, with Field limited to estimates on assigned jobs (`J`). Sending needs explicit confirmation and never bypasses required fields, recipient validation or idempotency | Agreed (catalog) |
| D-7 | Estimates is in the fixed primary navigation order: Home, Leads, Customers, **Estimates**, Jobs, Calendar, Reports, Campaigns | Agreed (structure plan) |
| D-8 | SalesMora does not use Gmail to send messages. Estimate email goes through the platform transport; SMS is not available | Agreed (privacy baseline) |
| D-9 | The paper is "Not a contract or invoice" and carries sample business data in the prototype; the real business identity must come from the workspace | Agreed (prototype) |

---

## 3. Design and architecture

### 3.1 Routes

| Route | Purpose |
|---|---|
| `/estimates` | List. `?q`, `?status`, `?owner`, `?parent`, `?sort`, `?page`, `?size` in the URL (shareable, back-button safe; invalid values ignored) |
| `/estimates/new` | Editor in create mode. `?leadId=`, `?jobId=` or `?customerId=` pre-link the parent; the server re-validates the parent and the user's access |
| `/estimates/[estimateId]` | Editor for a Draft; read-only record page for every other status (items, totals, history, decision, delivery) |
| `/estimates/[estimateId]/preview` | Print-ready US Letter page (also the content of the preview dialog) |
| `/e/[token]` (public) | Customer-facing read-only estimate view for a Sent or Published estimate. **New public surface; see §6.6 and Q5** |

| API | Purpose |
|---|---|
| `GET /api/estimates` | List, scoped in SQL (workspace and permission scope before counts and paging), filters, sort, paging, metrics |
| `POST /api/estimates` | Create a draft (idempotent) |
| `GET/PATCH /api/estimates/[id]` | Read; update a Draft with `version` check |
| `POST /api/estimates/[id]/send`, `/publish`, `/decision`, `/revise`, `/void`, `/archive`, `/duplicate`, `/convert` | Lifecycle actions; each re-authorizes, validates state, checks `version`, is idempotent, and writes activity |
| `GET /api/estimates/export` | Streaming CSV (shared export rules) |
| `GET /api/public/estimates/[token]` | Public read, rate limited, no session, returns the frozen snapshot only |

### 3.2 Layering

`apps/web/src/features/estimates/*` (UI only) → route handlers and server actions → `packages/domain` (state machine, totals, expiry, authorization) → `packages/data` (store, migrations) → worker (email delivery, expiry, reminders). Totals are computed by one pure function in `packages/domain` shared by the editor, server and assistant. The browser never submits totals as authority.

### 3.3 List layout (from prototype 34, plus additions)

Top bar breadcrumb **Workspace / Estimates** → page header with **＋ Create estimate** and **Export** (permission-gated) → metrics row (awaiting response, open value, accepted this month, expiring soon) → assistant card (opens the shared assistant) → toolbar (search, status, owner, related-record type, sort, clear) → table (Estimate, Customer / service, Status, Amount, Related record, Owner, Valid until, Updated, row actions) → numbered pager (25/50/100). Empty, loading, error and Field-scoped states.

### 3.4 Editor and record page (from prototype 33)

Header: estimate name, status badge, Save draft, Preview. Left: linked-record card, details (name, read-only number, recipient), items table with tax and discount, customer message, valid-until, payment terms and deposit, scope and assumptions. Right rail: status panel (decision buttons when eligible), history, delivery status. Draft is editable; every other status is read-only with the action that fits the state (Revise, Record decision, Convert to job, Void, Duplicate).

### 3.5 Preview and paper

US Letter, 8.5 × 11 in, print stylesheet (prototype), business identity block, "Prepared for", estimate meta, scope, items table, totals, message, terms and assumptions, signature lines, footer. The preview renders the **frozen snapshot** once the estimate is sent or published, so a later business-profile edit never changes a sent paper.

---

## 4. Data model (additive; depends on existing leads, customers and jobs)

| Table / column | Notes |
|---|---|
| `estimates` | `id`, `workspaceId`, `number` (per-workspace counter, shown `EST-####`), `revision` (starts 1), `name`, `status`, `parentType` (`lead` \| `job`) and `leadId`/`jobId`, derived `customerId`, `ownerId` (prepared by), `recipientName`, `recipientEmail`, `serviceAddress`, `scope`, `message`, `termsNote`, `paymentTerms`, `depositType` (`none`/`percent`/`amount`) and `depositValue`, `taxRateBp` (basis points), `discountType`/`discountValue`, `subtotalCents`, `discountCents`, `taxCents`, `totalCents`, `currency` (`USD`), `validUntil` (local date), `sentAt`, `publishedAt`, `decidedAt`, `decidedBy`, `decisionChannel`, `decisionNote`, `supersededById`, `archivedAt`, `version`, `createdAt`, `createdBy`, `updatedAt`. Unique `(workspaceId, number, revision)` |
| `estimate_items` | `estimateId`, `position`, `description`, `quantity` (`numeric(12,3)`), `unitPriceCents`, `taxable`, `amountCents` (stored for the snapshot; recomputed server-side) |
| `estimate_snapshots` | Immutable JSON captured at send/publish: business identity, recipient, address, scope, items, totals, terms, message, valid-until, content hash. One per send or publish |
| `estimate_share_tokens` | Hash of the token (never the token), `estimateId`, `snapshotId`, `expiresAt`, `revokedAt`, `viewCount`, `lastViewedAt` |
| `estimate_deliveries` | Per send: recipient (stored hashed for logs), provider message id, status (queued, sent, bounced, failed), attempt count, idempotency key |
| `estimate_activity` | Append-only: type, actor, source (`ui`/`chat`/`worker`), before→after summary, no free-form PII beyond the decision note |
| `estimate_operation_receipts` | Idempotency for create/send/decision/convert |
| `workspace_estimate_settings` | Business profile for the paper (address, phone, reply-to email, logo reference, license/registration line), default tax rate, default valid-for days, payment-term presets, default message and terms, number prefix (Q4) |
| Leads / jobs / customers | Optional `acceptedEstimateId` on the job created from an estimate (conversion, §6.5). No change to lead stages |

Money is stored in integer cents. Rate is basis points. Rounding rule is defined once in §6.4 and tested.

---

## 5. Storybook plan

Follow [component-conventions.md](component-conventions.md): kebab-case folders with `.tsx`, `.data.ts`, `.stories.tsx`; check existing primitives before adding.

### 5.1 Shared primitives (`packages/ui`; reuse first)

`StatusBadge` (extend variants only if needed), `MetricCard`, `DataTable`/pager, `ConfirmDialog`, `TypedConfirmDialog`, `EmptyState`, `Toolbar`, `MoneyText` (formatting only), `Drawer`.

### 5.2 Estimate components (`apps/web/src/features/estimates/`)

| Component | Purpose | Key stories |
|---|---|---|
| `estimates-metrics` | Awaiting, open value, accepted this month, expiring soon | populated, zero, loading |
| `estimates-toolbar` | Search, filters, sort, clear | default, filtered, chips |
| `estimates-table` | Rows, status, amount, related record, owner, valid until | populated, Field scope, empty, loading, error |
| `estimate-row-menu` | Open, Duplicate, Revise, Void, Archive, Delete draft | per status, permission-denied |
| `estimate-status-badge` | Draft, Sent, Published, Accepted, Declined, Expired, Superseded, Void | all states |
| `estimate-details-card` | Name, number, recipient, address | create, edit, read-only |
| `estimate-items-editor` | Line items with quantity, price, taxable, discount, live totals | empty, many lines, invalid, locked |
| `estimate-totals` | Subtotal, discount, tax, total, deposit due | tax-free, rounding case, discount |
| `estimate-terms-card` | Message, valid-until, payment terms, deposit | default, custom terms |
| `estimate-linked-record` | Lead, job or customer link card | lead, job, no customer yet |
| `estimate-status-panel` | State text and available actions | per status and role |
| `estimate-decision-dialog` | Record accept or decline with channel, date, note | accept, decline, change decision |
| `estimate-send-dialog` | Recipient, subject preview, totals, confirm | valid, invalid email, resend |
| `estimate-publish-dialog` | Publish without email; copy link | default, link copied |
| `estimate-preview-paper` | US Letter paper | draft, sent snapshot, long items, print |
| `estimate-history-timeline` | Activity with before→after | all event types |
| `estimate-delivery-card` | Delivery and view status | queued, sent, bounced, viewed |
| `estimate-convert-dialog` | Review before creating a job | ready, missing customer, already converted |
| `estimate-export-dialog` | Shared export dialog, estimate columns | default, over cap |
| `estimate-business-profile-form` | Business identity for the paper | empty, complete, invalid |
| `public-estimate-view` | Customer-facing read-only page | sent, expired, revoked, mobile |

### 5.3 Assistant components (`packages/ui/src/assistant/`)

`estimate-draft-card` (create/update before→after items and totals, prices flagged "needs your price"), `estimate-send-card` (recipient, subject, total, preview link, Confirm send), `estimate-decision-card`, `estimate-convert-card`, `estimate-summary-card` (read results). Reuse the shared confirmation shell; add only estimate content.

### 5.4 Full-page stories

`estimates-page.stories.tsx`: Owner populated, empty/first-run, loading, error, Field (assigned jobs only), filtered, mobile and tablet. `estimate-editor-page.stories.tsx`: new from lead, new from job, draft with items, validation errors, sent (read-only), accepted with convert action, expired, superseded, void, preview open, assistant modal with a draft. Each page story has desktop/tablet/mobile variants and `play` interactions for send and decision.

---

## 6. Requirements checklist (QA walkthrough)

### 6.1 Access and permissions (ACC)

| ID | Requirement | Decision / Status | Notes |
|---|---|---|---|
| ACC-1 | `/estimates`, `/estimates/[id]` and the APIs require a session and `estimates.read`; otherwise login or branded 404. The nav item shows only with current `estimates.read` | | |
| ACC-2 | Owner/Admin/Office read all estimates in the workspace. Field reads only estimates whose parent job they can currently access (`J`); losing the job assignment revokes access | | |
| ACC-3 | Create needs `estimates.create`; for `J` the proposed parent job is validated server-side (a client job id is not enough). Field cannot create on leads or customers | | Q3 |
| ACC-4 | Edit needs `estimates.update` and Draft state; send/publish needs `estimates.send` | | |
| ACC-5 | New permissions proposed: `estimates.decide` (record accepted/declined), `estimates.void`, `estimates.archive`, `estimates.delete` (drafts only), `estimates.export`. Defaults and Field scope | | Q8 |
| ACC-6 | Converting an accepted estimate to a job also needs `jobs.create` and customer access; the dialog shows what is missing | | |
| ACC-7 | Buttons are hidden or disabled with a reason; the server rejects forged calls; cross-workspace ids return 404; permission changes apply without re-login | | |
| ACC-8 | Customer R (related) access never exposes full customer browsing through an estimate | | |

### 6.2 List (LST)

| ID | Requirement | Decision / Status | Notes |
|---|---|---|---|
| LST-1 | Columns: Estimate (name + number), Customer / service, Status, Amount, Related record, Owner, Valid until, Updated, Actions | | Prototype lacks Owner and Valid until |
| LST-2 | Status filter covers every status in §6.7 including Expired, Superseded and Void; superseded and archived are hidden by default | | Q2 |
| LST-3 | Owner filter (members, Unassigned, Me) and related-record type filter (Lead, Job) | | |
| LST-4 | Search across name, number, customer, service and related record id; debounced; URL-backed | | |
| LST-5 | Sort: Updated (default), Amount high/low, Valid until soonest, Number | | |
| LST-6 | Numbered pages 25/50/100 with total count (cross-plan) | | |
| LST-7 | Metrics row (workspace-wide for permitted scope): awaiting response, open value, accepted this month, expiring in 7 days | | Q11 |
| LST-8 | Amount column shows the stored total; Draft amounts shown muted; currency USD | | |
| LST-9 | Related record cell links to the lead or job the user may read; unauthorized links render as plain text | | |
| LST-10 | Row actions: Open, Duplicate, Revise (Sent/Published/Declined), Void, Archive, Delete draft; permission-aware | | |
| LST-11 | **＋ Create estimate** opens `/estimates/new`; from a lead or job it pre-links the parent | | |
| LST-12 | Assistant card opens the shared assistant with estimates context (list filters, selected rows ≤ 50) | | |
| LST-13 | Empty first-run state explains how to create an estimate from a lead or job | | |
| LST-14 | Loading skeleton, error with retry, stale-while-refresh on filter change | | |
| LST-15 | Responsive: table becomes cards under the tablet breakpoint | | |
| LST-16 | Bulk actions (archive, void, owner change) | | Q12 |

### 6.3 Editor: details and linking (EDT)

| ID | Requirement | Decision / Status | Notes |
|---|---|---|---|
| EDT-1 | Estimate name (required, ≤ 120) and a **read-only generated number** (`EST-####`, per-workspace counter, never reused) | | |
| EDT-2 | Parent: exactly one of lead or job; the linked-record card shows name, record id, status and an Open link | | Q3 |
| EDT-3 | Customer: derived from the lead's or job's customer; when the lead has no customer yet, the paper uses the lead's contact details and the Convert step handles customer creation | | |
| EDT-4 | Recipient name and email are prefilled from the parent and editable; email is validated; required to send, not to save | | |
| EDT-5 | Service address prefilled and editable; the paper shows "Confirm before sending" until set; sending requires an address when the business profile says so | | Q4 |
| EDT-6 | Prepared-by owner defaults to the creator; assignable with `jobs.assign`-style rule (Owner/Admin/Office) | | |
| EDT-7 | Scope and assumptions text (≤ 5,000) shown on the paper; internal-only notes are separate and never printed | | Q13 |
| EDT-8 | Autosave is off in MVP; **Save draft** is explicit, with `version` conflict handling and unsaved-changes guard | | |
| EDT-9 | Draft header shows status, "Last updated", and who prepared it | | |
| EDT-10 | Duplicate action creates a new Draft copying name (suffixed), items, terms and parent; recipient and dates reset | | |
| EDT-11 | Delete draft (typed number confirm) only for Drafts that were never sent or published | | |
| EDT-12 | Concurrency: stale `version` shows the latest values; nothing is overwritten | | |
| EDT-13 | A lead or job may have many estimates; the record shows an Estimates section (count, latest status, total) | | |
| EDT-14 | Creating from a lead that already has an open (Draft/Sent) estimate warns and offers Open existing | | |

### 6.4 Items and totals (ITM)

| ID | Requirement | Decision / Status | Notes |
|---|---|---|---|
| ITM-1 | Each line: description (required, ≤ 200), quantity (> 0, up to 3 decimals), unit price (≥ 0, 2 decimals), taxable toggle, computed amount | | |
| ITM-2 | Add, remove, reorder lines (keyboard accessible); at least one valid line to send; max 100 lines | | Q6 |
| ITM-3 | Totals: subtotal, discount, tax, total, deposit due; all computed by the shared pure function in integer cents | | |
| ITM-4 | Rounding rule: line amount = round half up of qty × unit price to cents; tax = round half up on the taxable subtotal after discount; documented and tested with edge cases | | Q7 |
| ITM-5 | Tax rate: one flat rate per estimate in MVP, prefilled from the workspace default, up to 3 decimals as in the prototype (e.g. 8.875%); stored as basis points; no tax engine | | Q7 |
| ITM-6 | Taxable toggle per line (labor vs materials) | | Q7 |
| ITM-7 | Discount: one overall discount (percent or amount) shown as its own line; never negative totals | | Q6 |
| ITM-8 | Deposit: none, percent or amount; "Deposit due" and "Balance" are computed and shown on the paper; no payment is collected | | Q9 |
| ITM-9 | Negative unit prices and zero-priced lines are blocked except an explicit "included at no charge" zero-price line | | |
| ITM-10 | Optional / alternate items and good-better-best options | | Defer? |
| ITM-11 | Saved items or service-catalog price book to speed entry | | Q6 |
| ITM-12 | Currency USD only; the UI never shows floating-point artifacts; very large values are rejected with a clear limit | | |
| ITM-13 | Paste or import of line items (CSV or text) | | Defer? |
| ITM-14 | Totals update live and match the server result exactly; the server value wins and the UI refreshes on save | | |

### 6.5 Linking, conversion and lead/job effects (LNK)

| ID | Requirement | Decision / Status | Notes |
|---|---|---|---|
| LNK-1 | Entry points: Create estimate on the lead detail and job detail, from the Estimates list, from the customer profile (preselects a lead or job), and from the assistant | | Q3 |
| LNK-2 | Lead and job records show an Estimates card (number, status, total, link); jobs show it in Related records | | |
| LNK-3 | Sending an estimate **suggests** moving the lead to **Estimate sent**; the user confirms (the stage never changes silently) | | Q10 |
| LNK-4 | Accepting an estimate offers **Convert to job**; it opens the review dialog from the Jobs/lead conversion flow prefilled with customer, service, scope and amount; nothing is created until confirm | | Q10 |
| LNK-5 | Converting links the new job to the accepted estimate and shows it in Related records; an estimate converts at most once | | |
| LNK-6 | If the parent is a lead without a customer, convert uses the shared link-or-create customer prompt (customers plan) | | |
| LNK-7 | Declining an estimate offers (not forces) moving the lead to Lost or keeping it open | | Q10 |
| LNK-8 | Archiving or deleting the parent lead/job: estimates stay readable via the record history; deleting a customer or lead with estimates is blocked or shows the consequence per the owning plan | | |
| LNK-9 | Job completion or cancellation does not change a historical estimate | | |
| LNK-10 | Reports later read estimate totals and win rate; no report work here | | Defer |

### 6.6 Preview, send and publish (SND)

| ID | Requirement | Decision / Status | Notes |
|---|---|---|---|
| SND-1 | Preview shows the print-ready US Letter paper exactly as the customer will see it; **Print / Save PDF** uses the browser print flow (prototype) | | Q5 |
| SND-2 | Send and publish require: ≥ 1 valid item, a name, a valid-until date in the future, a valid recipient email (send only), and the business profile complete enough for the paper | | |
| SND-3 | **Confirm and Send** shows the recipient, subject, total and a final preview; the click is the only commit path | | |
| SND-4 | Send creates a frozen snapshot, a share token, a delivery record, and queues the email in one transaction; status becomes **Sent** | | |
| SND-5 | Idempotent: double-click or retry never sends twice; **Resend** is an explicit action with its own confirmation and activity entry | | |
| SND-6 | **Confirm and Publish** freezes the snapshot and creates the share link without emailing; status **Published**; the link can be copied | | |
| SND-7 | The email is transactional: business name, short summary (name, total, valid-until), the secure link, reply-to the business email, no marketing content, no personal data beyond the recipient name and the estimate | | Q5 |
| SND-8 | Customer view page `/e/[token]`: read-only paper, mobile friendly, no login, `noindex`, no analytics tracking, rate limited, revocable; shows a clear message when expired or revoked | | Q5 |
| SND-9 | Tokens are random 256-bit values stored hashed; expire at valid-until plus a grace period; one token per snapshot; revocation on Void or Revise | | |
| SND-10 | Delivery states shown to staff: Queued, Sent, Bounced, Failed, and **Viewed** (first view time) | | Q5 |
| SND-11 | Bounce or failure notifies the sender in-app and offers fixing the address and resending | | |
| SND-12 | Sent and published estimates are **immutable**; the paper always renders the stored snapshot | | Q1 |
| SND-13 | PDF attachment on the email and server-side PDF generation | | Q5 |
| SND-14 | Copy-link action available for Sent and Published estimates | | |
| SND-15 | SMS delivery | | Out (D-8) |
| SND-16 | Email opt-out/unsubscribe: operational estimate emails to the requesting customer follow the privacy baseline; counsel reviews classification before launch | | |

### 6.7 Status and decisions (DEC)

| ID | Requirement | Decision / Status | Notes |
|---|---|---|---|
| DEC-1 | Statuses: **Draft**, **Sent**, **Published**, **Accepted**, **Declined**, **Expired**, **Superseded**, **Void**. Archived is a flag, not a status | | Q2 |
| DEC-2 | Allowed transitions are defined once in `packages/domain` and enforced server-side; illegal transitions return a specific message | | |
| DEC-3 | **Record decision** is available for Sent and Published: Accepted or Declined with decision date (default today in workspace timezone), channel (email, phone, in person, other) and optional note (≤ 500) | | |
| DEC-4 | Confirm dialog states the effect ("No job is created automatically") and that the customer is not notified | | |
| DEC-5 | A recorded decision can be corrected by Owner/Admin/Office within the same estimate with a required reason; the history keeps both entries | | Q14 |
| DEC-6 | Accepted locks the estimate; the accepted amount is the snapshot total | | |
| DEC-7 | Declined keeps the estimate and offers Revise (a new revision) or Archive | | |
| DEC-8 | The history timeline shows every transition with actor, source (UI, chat, system) and note | | |
| DEC-9 | Customer self-service accept or decline online with a typed-name consent record | | Q5 (later phase) |

### 6.8 Revisions, expiry, void, archive (REV)

| ID | Requirement | Decision / Status | Notes |
|---|---|---|---|
| REV-1 | **Revise** on a Sent, Published or Declined estimate creates a new Draft revision (same number, revision + 1) prefilled from the previous snapshot; the previous one becomes **Superseded** only when the revision is sent or published | | Q1 |
| REV-2 | Sending a revision revokes the previous token and shows the customer link of the old version as "replaced by a newer estimate" | | |
| REV-3 | The list shows the latest revision per number by default; a revisions panel lists all with status and total | | |
| REV-4 | **Expired** is applied by a worker (and verified at read time) when `validUntil` passes for Sent or Published estimates, in workspace timezone; an expired estimate can be revised or have its date extended through a revision | | Q15 |
| REV-5 | Default valid-for days from workspace settings (prototype shows about 30); the date is required to send | | |
| REV-6 | **Void** withdraws a Sent or Published estimate (customer link shows withdrawn); requires a reason; Owner/Admin/Office | | Q8 |
| REV-7 | **Archive** hides Declined, Expired, Superseded and Void estimates from default lists; restore is available | | |
| REV-8 | **Delete** is only for never-sent Drafts, permanent, with typed-number confirmation; it does not reuse the number | | |
| REV-9 | Expiry approaching: staff reminder N days before valid-until (default 3) in-app and optional email | | Q15 |
| REV-10 | Reminders and follow-ups to the **customer** about an unanswered estimate | | Defer (rules engine) |
| REV-11 | Estimate templates (saved scope and items) | | Defer? Q6 |

### 6.9 Business profile and defaults (BIZ)

| ID | Requirement | Decision / Status | Notes |
|---|---|---|---|
| BIZ-1 | The paper's business block comes from a workspace profile (name, address, phone, reply-to email, optional logo, optional license or registration line), not from sample text | | Q4 |
| BIZ-2 | Defaults: valid-for days, default tax rate, payment-term presets, default customer message, default terms and assumptions, deposit default | | Q4 |
| BIZ-3 | Settings live in Settings (Estimates section); editable by Owner/Admin; a missing profile blocks send with a link to fix it | | Q4 |
| BIZ-4 | Reply-to email must be verified or at least syntactically valid; the From address is the platform's, never the user's mailbox | | |
| BIZ-5 | Logo upload uses the existing asset pipeline when it exists; otherwise the paper shows the initial mark as in the prototype | | Q4 |
| BIZ-6 | Changing the profile does not alter sent snapshots | | |
| BIZ-7 | Estimate number prefix and next number are read-only in MVP | | Q4 |
| BIZ-8 | Terms boilerplate has counsel-reviewable default text and a hard disclaimer that the paper is an estimate, not a contract or invoice | | |

### 6.10 Notifications (NTF)

| ID | Requirement | Decision / Status | Notes |
|---|---|---|---|
| NTF-1 | Events: estimate sent, delivery failed or bounced, viewed by customer, decision recorded, expiring soon, expired | | |
| NTF-2 | Recipients: the estimate owner and the parent's assignee/owner; the actor is skipped | | |
| NTF-3 | In-app always on; email follows the shared per-user preferences (leads E3) | | |
| NTF-4 | Bulk operations produce one digest per recipient (leads E2) | | |
| NTF-5 | Notification content is minimal: estimate number, name, status, link; no totals or contact data in email | | |
| NTF-6 | "Viewed" notifications are deduplicated (first view only) | | |

### 6.11 Export (EXP)

| ID | Requirement | Decision / Status | Notes |
|---|---|---|---|
| EXP-1 | CSV export of the filtered list through the shared export dialog; streaming with the configurable cap (default 50,000) | | |
| EXP-2 | Default Owner/Admin via `estimates.export`; Owner can grant it | | Q8 |
| EXP-3 | Columns: number, revision, name, status, customer, parent type and id, owner, total, sent date, valid until, decided date, decision channel | | |
| EXP-4 | No line-item detail, notes or contact data in the default export; line items are a separate later option | | Q16 |
| EXP-5 | CSV injection protection (cells starting with `=`, `+`, `-`, `@` are neutralized); UTC ISO dates; permission re-checked per row | | |

### 6.12 Quality attributes (QLT)

| ID | Requirement | Decision / Status | Notes |
|---|---|---|---|
| QLT-1 | Accessibility WCAG 2.2 AA: labelled controls, table semantics for items, focus management in dialogs, keyboard reorder, live regions for totals and status changes | | |
| QLT-2 | Performance: list P95 < 300 ms at 10,000 estimates with indexes on workspace, status, owner, updated, valid-until | | |
| QLT-3 | Money correctness: property tests for totals; no floating-point; rounding cases | | |
| QLT-4 | Security: scope in SQL; token hashing, rate limiting and `noindex` on the public page; no estimate content in logs; injection-safe email and paper rendering (text, not HTML) | | |
| QLT-5 | Privacy: bounded fields to the model and in emails; snapshots carry only what the paper shows | | |
| QLT-6 | Copy lives in `*.data.ts`; terms "Estimate", "Valid until", "Prepared for" used consistently; "Published" and "Sent" are defined once | | |
| QLT-7 | Failure handling: retry, preserved form input, partial failure messages, no duplicate sends | | |
| QLT-8 | Time: dates are workspace-local dates; expiry tests for DST and timezone edges | | |
| QLT-9 | Print stylesheet verified in Chrome, Safari and Firefox; one page for short estimates, clean page breaks for long ones | | |
| QLT-10 | Retention: estimates and snapshots follow the CRM retention schedule; account deletion removes them | | |

---

## 7. Component and data flow

```
Lead / Job / Customer ──▶ Create estimate ──▶ Draft (editable)
                                              │ Save draft (version check)
                                              ▼
Preview (paper) ──▶ Confirm and Send ──▶ snapshot + token + delivery (one transaction)
                 └▶ Confirm and Publish ──▶ snapshot + token (no email)
                                              │
        Sent / Published ──▶ Record decision ─┴▶ Accepted ─▶ Convert to job (review dialog)
              │                                   Declined ─▶ Revise or Archive
              ├▶ Revise ─▶ new Draft revision ─▶ (send) previous Superseded
              ├▶ Void
              └▶ validUntil passes ─▶ Expired (worker)
Assistant ─▶ estimate query / propose ─▶ card ─▶ user confirms ─▶ same use cases as the UI
```

## 8. Events, audit, notifications

Activity types: created, updated (changed fields summarized), previewed (not logged), sent, resent, published, delivery result, viewed, decision recorded, decision corrected, revised, superseded, voided, archived, restored, converted, expired, deleted. Every entry has actor, source and timestamp. Notifications follow §6.10 and the shared pattern (in-app always, email per preference, minimal content).

---

## 9. Estimate operations in the shared assistant

The assistant is a global panel. Estimates adds a surface and domain operations in the established permission-filtered query/propose registry.

### 9.1 Surfaces and context

| Surface | Context sent each turn |
|---|---|
| `estimates.list` | Validated filter object, selected rows (≤ 50), page, sort, viewer scope |
| `estimate.editor` / `estimate.detail` | `recordRefs: [{type:'estimate', id}]`, status, version, parent summary; the server reloads and authorizes the record, never trusting browser values |
| Lead / job / customer pages | Existing refs; the assistant can propose "create estimate for this record" |

`chatRecordRefsSchema` gains `estimate`. Unauthorized refs are dropped with a neutral message.

### 9.2 Read operations (no confirmation)

Query tool `estimates_query` with named operations (permission-filtered, bounded results, untrusted-result handling):

- `search` / `list` by status, customer, owner, parent, amount range, valid-until window; counts and totals.
- `get` one estimate: items, totals, status, delivery and decision history.
- `aging`: sent and awaiting more than N days, expiring soon, accepted without a job.
- `explain_totals`: show how subtotal, tax and deposit were computed.
- `compare_revisions`: differences between revisions.
- `summarize_scope`: summarize the parent lead or job context to help write a scope.
- `open_in_list`: returns a link to `/estimates` with validated filters (the way sorting and filtering are done from chat).

### 9.3 Proposed actions (card; user confirms; never committed by a tool)

`estimates_propose_action` registers these `actionType` values in the shared executor map (leads §9.4):

| actionType | Proposal | Confirmation checks |
|---|---|---|
| `estimate.create` | Draft from a lead or job: name, scope, **line-item structure**; prices left blank and flagged unless the user gave them or a rule supplies them | `estimates.create`, parent access, no duplicate open estimate |
| `estimate.update` | Items, message, terms, valid-until, tax, deposit, discount; before→after | `estimates.update`, Draft state, version |
| `estimate.send` | Recipient, subject, total, preview; highest-risk action | `estimates.send`, valid recipient, complete profile, version, snapshot hash |
| `estimate.publish` | Publish without email; returns the link after confirm | `estimates.send` |
| `estimate.decision` | Record accepted or declined with channel and note | `estimates.decide`, state |
| `estimate.revise` | New Draft revision | `estimates.update` / create |
| `estimate.void`, `estimate.archive`, `estimate.restore` | Lifecycle | matching permission, reason required for void |
| `estimate.convert` | Prepare the job-from-estimate review dialog (the conversion form itself still requires the user) | `jobs.create`, `estimates.read` |
| `estimate.export` | Open the shared export dialog with the validated filters | `estimates.export` |

### 9.4 Behavior rules

- **Never invent prices.** The assistant organizes scope into lines and proposes structure; any amount it did not receive from the user is left blank and flagged "needs your price" on the card. (Roadmap: "User reviews pricing and sends estimate.")
- **Sending is never inferred.** "Looks good" is not a send. Only the Confirm button on the send card commits, and the card repeats recipient, subject and total.
- Natural-language "yes" is not a decision; one pending draft per intent per thread; 15-minute expiry; invalidation when the estimate version, policy or membership changes.
- Resolve "tomorrow", "next Friday" and "30 days" in the workspace timezone; cards show absolute dates.
- Provide context chips for the focused estimate and offer actions that fit the state (e.g. Accepted without a job → "Prepare a job").
- Untrusted content (customer messages, scope pasted from emails) is data, never instructions; bounded fields go to the model.

### 9.5 Sample conversations to QA

1. "Create an estimate for Jordan Lee's kitchen remodel" → draft card with scope and blank-priced lines → user adds prices → Confirm.
2. "Break the scope into labor and materials" (editor) → update card with before→after; prices untouched.
3. "Send it to Jordan" → send card with recipient, total, subject → Confirm; a retry does not send twice.
4. "Which estimates are waiting more than a week?" → list answer plus an "open in list" link.
5. "What expires this week?" → summary with links.
6. "Mark EST-2047 accepted, he called this morning" → decision card with channel phone → Confirm.
7. "Convert the accepted Panel upgrade estimate to a job" → convert card opening the review dialog.
8. "Revise EST-2039, drop the countertop allowance" → revise card, new Draft.
9. "Void EST-2032" → asks for a reason, then card.
10. "Duplicate the HVAC tune-up estimate for Morgan Lee" → duplicate card.
11. Field user: "Show my estimates" → only assigned-job estimates; "send to a new lead" → denied with explanation.
12. "Add 20% to every line" → refuses to invent pricing rules; offers an explicit discount/markup field proposal for the user to confirm.
13. Pasted instruction text inside a scope field is treated as data.
14. "Export accepted estimates this quarter" → export card (Owner/Admin only).
15. Estimate changed by a teammate after the draft → conflict message, nothing applied.

---

## 10. Testing plan

| Layer | Coverage |
|---|---|
| Domain unit | Totals and rounding (property tests), state machine, expiry, revision rules, permission scope |
| Contracts | Strict schemas, bounds, money and date validation |
| Data / integration | Migration, counters, scope-before-paging, snapshot immutability, idempotent send, token hashing, transaction rollback |
| API | Auth, scope, version conflicts, forged ids, rate limit on public route |
| Worker | Delivery retries, bounce handling, expiry at timezone edges, reminders, idempotent re-run |
| E2E | Create from lead and job, edit, preview, send, publish, decision, revise, convert, void, archive, export, Field scope, public page |
| Assistant | Tool permission filtering, no price invention, send needs button, stale version, injection tests |
| Storybook | Every component and page state in §5 with `play` where noted; accessibility checks |
| Visual / print | Preview and print snapshots, long estimate pagination |

## 11. Delivery sequence (one reviewed slice at a time; Storybook approval before the next component)

0. **Gates**: business profile and estimate defaults decided (Q4); Jobs creation service available for conversion (can ship later); `workspaces.timezone` is already present.
1. Migration, contracts, pure totals/state functions, read use cases, `GET /api/estimates`, tests.
2. Components: status badge, metrics, toolbar, table, then the list page connected read-only; nav entry.
3. Editor: details, items editor, totals, terms, save draft, create/duplicate/delete; permissions.
4. Preview paper and business profile settings.
5. Send/publish with snapshot, token, delivery worker, public page, resend.
6. Decisions, revise, void, archive, expiry worker, notifications.
7. Lead/job/customer integration (Estimates card, stage suggestion, convert to job).
8. Assistant: read operations, then create/update/revise, then send/decision/convert/lifecycle, then export.
9. Export, reports hooks, polish, accessibility and print review.

## 12. Open questions (decide in QA)

| # | Question | Options / recommendation | Decision |
|---|---|---|---|
| Q1 | Can a sent estimate be edited? | No: sent and published estimates are immutable; changes go through **Revise** (new revision, same number) (**recommended**) / allow editing with a visible "edited after sending" flag / allow only message changes | |
| Q2 | Status set | Draft, Sent, Published, Accepted, Declined, **Expired, Superseded, Void** with Archived as a flag (**recommended**) / keep the prototype's five and add Expired only | |
| Q3 | What may an estimate be attached to? | Exactly one lead or job (prototype); the customer is derived; Field only on assigned jobs (**recommended**) / also directly on a customer / standalone | |
| Q4 | Business identity and defaults | New Estimates section in Settings holding address, phone, reply-to email, logo, license line, default tax, valid-for days, terms and message; send is blocked until the minimum is set (**recommended**) / use the existing business name only / collect during onboarding | |
| Q5 | How does the customer receive and respond? | Email with a secure view link plus browser print/Save PDF; staff records the decision (prototype); online accept/decline is a later phase with its own legal review (**recommended**) / PDF attachment from day one / online approval in MVP | |
| Q6 | Line item depth | Description, quantity, price, taxable toggle, one overall discount, up to 100 lines; saved items and templates deferred (**recommended**) / add a saved price book now / add optional good-better-best now | |
| Q7 | Tax model | One flat rate per estimate from a workspace default, per-line taxable toggle, half-up rounding on the taxable subtotal; no tax engine or jurisdiction lookup (**recommended**) / flat rate on everything (prototype) / per-line rates | |
| Q8 | New permissions | `estimates.decide`, `estimates.void`, `estimates.archive` default to Owner/Admin/Office (Field J for decide on assigned jobs); `estimates.delete` (drafts) Owner/Admin/Office; `estimates.export` Owner/Admin (**recommended**) / reuse `estimates.update` for all / Owner/Admin only for void | |
| Q9 | Deposits | Structured none/percent/amount with computed deposit and balance on the paper; no payment collection (**recommended**) / free text only (prototype) | |
| Q10 | Effects on lead stage and jobs | Sending suggests "Estimate sent", accepting offers "Convert to job", declining offers "Lost"; all need confirmation; never automatic (**recommended**) / fully manual / automatic stage moves | |
| Q11 | Metrics on the list | Four metrics: awaiting response, open value, accepted this month, expiring in 7 days (**recommended**) / none until Reports / more | |
| Q12 | Bulk actions | None in MVP except export; archive and void are single-record (**recommended**) / bulk archive and owner change | |
| Q13 | Internal vs customer notes | Keep a separate internal notes field never printed or sent (**recommended**) / only the printed scope | |
| Q14 | Changing a recorded decision | Allowed for Owner/Admin/Office with a required reason; both entries kept (**recommended**) / locked once recorded / anyone with update | |
| Q15 | Expiry behavior | Worker marks Expired after `validUntil` (workspace timezone); extend only by Revise; staff reminder 3 days before (**recommended**) / manual only / auto-extend | |
| Q16 | Export content | Summary columns only; line items later (**recommended**) / include items | |
| Q17 | PDF | Browser print for MVP; server-generated PDF in a later slice (**recommended**) / server PDF now | |
| Q18 | Estimate numbers | `EST-####` per-workspace counter, never reused, revisions share the number; configurable prefix later (**recommended**) / per-year numbers / editable | |
| Q19 | Convert to job | Review dialog prefilled from the estimate; at most one job per estimate; job keeps a link back (**recommended**) / allow many jobs / no conversion in MVP | |
| Q20 | Follow-up automation | Not in MVP; assistant can draft a follow-up message only; rules engine later (**recommended**) | |
| Q21 | Estimate visits on the Calendar (calendar plan Q20) | Not in MVP; revisit after estimates exist (**recommended**) | |
| Q22 | Does the estimate assistant card open the shared modal? | Yes, as agreed for Customers Q4 and Calendar Q18 (**recommended**) | |

## 13. Risks

| Risk | Mitigation |
|---|---|
| Money and tax errors | Integer cents, one pure totals function, property tests, server value wins |
| Sending the wrong thing or twice | Frozen snapshot, idempotent send, confirmation with recipient and total, resend as a separate action |
| Public link exposure | Hashed 256-bit tokens, expiry, revocation, rate limits, `noindex`, snapshot only, no PII beyond the estimate |
| Estimate read as a legal contract | Disclaimer on the paper and page, no signature collection in MVP, counsel review of terms |
| Email deliverability and classification | Platform From address, reply-to business email, transactional template, counsel review (privacy baseline) |
| Assistant invents prices or sends | Prices never invented; send only through the confirm button; tests for injection and stale versions |
| Conversion duplicates or loses data | Review dialog, one conversion per estimate, receipts, link back |
| Revision confusion | One number, clear revision labels, latest revision default, previous token revoked |
| Business profile drift | Snapshot at send; profile edits never rewrite sent papers |
| Scope creep (templates, e-sign, payments, tax engine) | Deferred per Q5, Q6, Q7, Q20 |

## 14. Acceptance summary (definition of done)

- Estimates is routed, permission-gated and shown in the nav only with `estimates.read`; Field sees only estimates on assigned jobs.
- List supports search, status, owner and parent filters, sort, numbered paging, metrics and export with the shared rules.
- A Draft can be created from a lead, job or the list, saved with version checks, previewed, duplicated and deleted.
- Totals are exact in integer cents and match across editor, server, paper and assistant.
- Send and publish are confirmed, idempotent and snapshot-based; sent estimates are immutable; Revise, Void, Archive and Expire work as decided.
- The customer view page is tokenized, revocable, rate limited and read-only.
- Decisions are recorded with channel, date and note; Convert to job uses the review dialog and links back.
- The assistant can answer, propose and confirm estimate actions without inventing prices or sending without the card's Confirm.
- Every component and page state in §5 has a Storybook story; tests in §10 pass; docs `estimates.md` and the permission catalog are updated after build.
