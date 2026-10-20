# Materials catalog plan

Status: draft for Q&A walk-through. Follows the pattern of `work-orders-plan.md` (requirement IDs, status column, delivery slices).

## 1. Decisions already made

| # | Decision |
|---|----------|
| D1 | v1 is a **catalog only**: no inventory, no purchasing, no supplier ordering. |
| D2 | Catalog management is **owner and admin only**. Office can read names/units and propose items (D11); field can only read names/units when picking items. |
| D3 | Items store **internal cost** and **customer price** separately. A markup % is a form helper that fills price from cost; it is not stored as the source of truth. |
| D4 | Fields: name, unit, SKU, supplier, category, cost, price, notes, optional image URL. Items are **archived, never deleted**. |
| D5 | **CSV export only** in v1 (no import). |
| D6 | **No supplier or Home Depot search in v1** (third-party search APIs are paid). Items are entered in the form or through the assistant. The item shape keeps `sourceUrl` so a search provider can be added later without a migration of meaning. No scraping of homedepot.com. |
| D7 | The assistant can search the catalog, suggest items for a work order (marked as suggestions) and propose adding items, never exposing cost or price to roles without permission. |
| D8 | Work-order items keep the existing rule: linking copies name and unit and **snapshots** cost and price; later catalog edits do not change existing work orders (CNT-3a). |
| D9 | Images are **link only** (pasted URL) until file storage exists. |
| D10 | Units are a **fixed list** (each, ft, lb, box, gal, hr, other). Categories are **free text with suggestions** from existing categories. |
| D11 | Office users can **propose** new catalog items; an owner/admin approves or rejects. Approved proposals become normal items. |
| D12 | The item shape is designed so **estimates can reuse the catalog** later. |
| D13 | Tax is out of scope; money is **USD cents only**. |

## 2. Requirements

### Catalog page (`/materials`)
| ID | Requirement | Status |
|----|-------------|--------|
| MAT-1 | Table with search, category filter, supplier filter, archived toggle, sort and numbered pages (25/50/100) | Proposed |
| MAT-2 | Columns: name, SKU, unit, category, supplier, cost, price, margin %, updated. Cost, price and margin only shown with the price/cost permissions | Proposed |
| MAT-3 | Add/edit dialog with all D4 fields, markup helper, validation (name required, cost/price >= 0, unique SKU per workspace when present) | Proposed |
| MAT-4 | Archive and restore with confirm; archived items cannot be newly linked but stay on existing work orders | Proposed |
| MAT-5 | Export current filters as CSV (owner/admin, audited, formula-injection safe, same pattern as work-order export) | Proposed |
| MAT-6 | Empty, loading, error and read-only states; mobile layout as cards | Proposed |
| MAT-8 | Proposals: office submits a proposed item (same fields minus nothing hidden by permission); admins see a "Proposed items" queue with approve (optionally edit first) and reject with reason; proposer is notified in-app | Built (proposer told of decisions, approvers told of new proposals) |
| MAT-9 | Proposed items are not linkable until approved; proposer can withdraw a pending proposal; duplicate name/SKU is flagged to the approver | Proposed |
| MAT-7 | Duplicate-name warning on create (not blocking) | Proposed |

### Deferred: supplier search
Home Depot search through a paid product-search API is deferred. If revisited: server-side only, per-workspace caps and caching, results are reference prices never auto-synced, and provider behind an interface.

### Work order integration
The work-order side is already shaped for this: `workOrderMaterials.catalogId` exists (no foreign key yet), the materials mutation and `WorkOrderMaterials` component already carry `catalogId`, a `catalog` prop and price/cost redaction, and the assistant's `add_materials` currently sends `catalogId: null`. Today the client supplies the name, unit, price and cost, so the server must start deriving them from the catalog.

| ID | Requirement | Status |
|----|-------------|--------|
| WOM-1 | Material picker on the work-order materials card replaces the empty `catalog` prop: search active catalog items by name, SKU or category, choose quantity and status; free text still allowed | Proposed |
| WOM-2 | **Server-side snapshot.** When a row has a `catalogId`, the server loads the active item in the same workspace and copies name, unit, cost and price itself; client-sent values for those fields are ignored on creation of the link. Unknown, archived, proposed or cross-workspace ids are rejected | Proposed |
| WOM-3 | Redaction is unchanged: users without `view_prices` or `view_costs` never receive price or cost in the picker or detail read, and cannot set them. Snapshotting still happens server-side so their picks are priced correctly for office | Proposed |
| WOM-4 | Office with price access can override the customer price per row without touching the catalog (CNT-3b); line totals and a materials total shown for those users | Built (override), totals proposed |
| WOM-5 | Re-linking or changing the item on a row re-snapshots; editing only quantity, status or note does not. Catalog edits never alter existing rows | Proposed |
| WOM-7 | "Add to catalog" on a free-text row: owner/admin creates the item directly and links the row; office submits a proposal (D11) and the row stays free text until approved, then offers to link | Proposed |
| WOM-8 | Foreign key `(workspaceId, catalogId)` to the catalog with `ON DELETE SET NULL`; existing rows with a null or stale `catalogId` keep working | Proposed |
| WOM-9 | Duplicate work order copies rows with their `catalogId` and a fresh snapshot only if the item is still active; otherwise it keeps the old snapshot as free text | Proposed |
| WOM-10 | Print crew sheet and completion form keep showing name, quantity and unit only; no prices or costs | Built |
| WOM-11 | Estimate-to-work-order (CRE-3) will copy catalog-linked lines as unpriced rows and re-snapshot on issue review; shape reserved now, built with estimates | Deferred |
| WOM-12 | Work-order activity records the catalog item name when a row is linked, so history reads "Added 4 ft copper pipe (catalog)" | Proposed |
| WOM-13 | Job-level view (later): total planned materials across a job's work orders, office with price access only | Deferred |

### Assistant
| ID | Requirement | Status |
|----|-------------|--------|
| AST-1 | Read-only tool `materials_query`: search by name/SKU/category, details by id; respects price/cost permissions | Proposed |
| AST-2 | Work-order `add_materials` resolves names to catalog items server-side (never model-supplied ids), sets `catalogId`, shows matched items on the draft card with unmatched ones as free text, and labels suggestions; confirmation applies WOM-2 snapshotting | Proposed |
| AST-6 | On a work-order page the assistant is aware of the linked materials (names, quantities, status; prices only with permission) and can answer "what do we still need to order?" | Proposed |
| AST-3 | Catalog changes (create, edit, archive) are proposed on a confirm card, owner/admin only; for office the card submits a proposal for approval instead | Proposed |
| AST-4 | Export from chat uses the same audited export path | Proposed |
| AST-5 | The assistant can take item details typed in chat (name, unit, SKU, supplier, cost, price) and propose a new catalog item on a confirm card; it never looks items up on the web | Proposed |

## 3. Data model

New table `materialCatalog`: id, workspaceId, name, sku, unit, category, supplier, costCents, priceCents, notes, imageUrl, sourceUrl, archivedAt, version, createdBy, createdAt, updatedAt. Unique (workspaceId, lower(sku)) where sku is not empty. Constraints mirror `workOrderMaterials` (cents >= 0, name 1-200 chars).

Items gain `status` (proposed/active/rejected) with proposedBy, decidedBy, decidedAt and rejectionReason; only active, non-archived items are linkable. Money columns are USD cents with no tax fields.

New table `materialAudit` (action, actorId, materialId, changes) for edits and archives, plus `materialExportAudit` like the work-order export audit.

Existing `workOrderMaterials.catalogId` gets a composite foreign key to `materialCatalog (workspaceId, id)` with `ON DELETE SET NULL`.

## 4. Permissions

Add `materials.propose` (office; creates pending proposals) and `materials.read` (names, units, SKU for picking; eligible all roles), `materials.manage` (create, edit, archive, export; owner/admin), and reuse `workorders.view_prices` / `workorders.view_costs` for price and cost visibility. 

## 5. Architecture

- Contracts: `packages/contracts/src/material.ts` (query, item, mutation schemas, DTOs).
- Data: `packages/data/src/materials/` (`store.ts`, `mutations.ts`, `export.ts`).
- Routes: `/api/materials`, `/api/materials/[id]`, `/api/materials/export`.
- Web: `apps/web/src/features/materials/` with `materials-page`, `materials-route`, `material-dialog`, `material-archive-dialog`, `material-picker` (used by work orders). Each component has `.tsx`, `.data.ts`, `.stories.tsx`.
- Storybook: full page layouts (table, empty, read-only, mobile) and each dialog state, including validation errors and the markup helper.
- Navigation: new "Materials" entry for owner/admin; work-order users reach it only through the picker.

## 6. Delivery slices

1. Contracts, migration, permissions, data layer and rehearsal checks.
2. Catalog page and dialogs in Storybook (prototype review), then live route and navigation.
3. **Work-order connection:** foreign key, server-side snapshot (WOM-2), picker replacing the `catalog` prop, totals, re-link rules, duplicate behavior and rehearsal checks for cross-workspace, archived and redacted cases. This is a core slice, not an afterthought; the catalog is not useful until it ships.
4. CSV export.
5. Assistant: `materials_query`, catalog-aware `add_materials` (AST-2) and work-order page awareness (AST-6).
6. "Add to catalog" from a work order (WOM-7). The catalog-changed hint (WOM-6) was dropped from scope.

## 7. Resolved questions

| # | Question | Answer |
|---|----------|--------|
| M1 | Images | Link only |
| M2 | Units | Fixed list plus other |
| M3 | Categories | Free text with suggestions |
| M4 | Office proposals | Yes, admin approves (D11, MAT-8/9) |
| M5 | Estimates reuse | Yes, design shape now |
| M6 | Tax | Out of scope |
| M7 | Currency | USD cents only |

No open questions remain. Slice 2 (catalog page) should include the proposals queue, and slice 1 the `status` column and `materials.propose` permission.

## 8. Delivery notes

### Slice 1 (built)
- Permissions `materials.read` (all roles), `materials.propose` (office) and `materials.manage` (owner/admin) are in the catalog, the new-workspace seed (`defaults-v1.json`), a backfill in migration `202610190008` and the permissions page. Catalog price and cost visibility reuse `workorders.view_prices` / `view_costs`, checked workspace-wide.
- Migration `202610190008` adds `materialCatalog`, `materialAudit`, `materialOperations` (idempotent submissions) and `materialExportAudit`, plus the `workOrderMaterials` composite foreign key. Deleting a catalog row nulls only `catalogId`. Existing unmatched ids were set to null.
- SKU uniqueness applies to active, non-archived items only: proposals may duplicate (the approver sees a duplicate flag) and archiving frees the SKU, which restore re-checks.
- Contracts in `packages/contracts/src/material.ts`; data layer in `packages/data/src/materials/` (`readMaterials`, `mutateMaterial`: create, propose, update, archive/restore, approve, reject, withdraw). Edits never apply field defaults.
- Rehearsal: `pnpm test:materials` (11 checks).
- Not yet built: proposal-decision notifications to the proposer (slice 2 with the queue UI), export (slice 4), routes and UI.

### Slice 2 (built)
- Components in `apps/web/src/features/materials/`, each with `.tsx`, `.data.ts` and stories: `materials-page` (composes the parts below; sort, pages, empty/loading/error/read-only states), `material-status-tabs` (Catalog / Proposals / Rejected), `materials-filters`, `materials-toolbar` (count, export, add), `material-name-cell`, `material-row-actions`, `material-card` (mobile), `material-dialog` (add, propose, edit and review-proposal modes with markup helper, margin and duplicate-name warning), `material-reject-dialog`, `material-archive-dialog` (archive and restore) and `materials-route` (live data and writes). Storybook: `Materials/MaterialsPage` with play-tested stories.
- Live: `/materials` page (`server/materials/read-page.tsx`), `GET`/`POST /api/materials` (`server/materials/http.ts` maps access to 404, conflict to 409, validation to 422), `materials.list` assistant surface key, and a Materials nav item for owners, admins and anyone who can propose.
- The export button was hidden until slice 4 (now built).
- Deferred: proposal approve/reject notifications to the proposer (needs a new notification kind, table and menu rendering). Proposers see decisions in the Proposals and Rejected tabs meanwhile.

### Notifications (built)
- Table `materialNotifications`, shown in the bell menu and linking to `/materials`. No email.
- The proposer is told when their item is approved, approved with changes (the approver edited it first) or rejected (with the reason). Nothing is sent when you decide your own proposal.
- Owners and admins are told when someone else proposes an item. That alert is re-checked against `materials.manage` when read, so it never reaches someone who has lost the permission.
- WOM-6 (catalog-changed hint) was dropped from scope.

### Slice 5 (built: AST-1 to AST-6)
- `materials_query` (search, details) is a read tool gated by `materials.read`; cost and price appear only with the work-order price permissions. Handler: `server/chat/tools/materials.ts`.
- Work-order `add_materials` now matches each name to the active catalog on the server (exact name or SKU only), links it, uses the catalog unit and labels the review line "Add catalog material" or "Add material (free text)". Near matches become a warning on the card, never a silent link. Pricing is snapshotted on confirm as for the picker.
- Work-order details read by the assistant flag each material as `fromCatalog`, so "what do we still need to order?" uses the status already returned.
- `materials_propose_action` (AST-3, AST-5): create, edit, archive and restore, one change per turn, prepared as a review card that saves nothing until Confirm. It reuses the work-order draft table, confirm endpoint and card (new `material-*` card actions), and records `source: assistant-confirmed` in the material audit.
  - Items are found by exact name or SKU on the server; near matches are listed in the decline message. The model never supplies ids; the item version is captured at proposal time, so an item changed in between fails Confirm as stale.
  - Owners and admins create directly; users who may only propose submit a proposal for approval. Cost and price can be set only with the matching permissions. Details come only from what the user typed; nothing is looked up on the web. A duplicate SKU is declined, and a duplicate name carries a warning.
- AST-4: `materials_propose_action` also has `export` (optional search text, category and supplier). Confirm runs the same `exportMaterials` as the page button, so it is owner/admin only, count-checked, formula-safe and audited, and downloads `materials.csv`. A confirmed export can't be re-downloaded; ask for a new one.

### Slice 4 (built)
- `POST /api/materials/export` with `{workspaceId, query, expectedCount}` returns `materials.csv`; the Export button on the Catalog tab sends the current filters and the visible total.
- `packages/data/src/materials/export.ts`: owner/admin only, refuses if the count changed or exceeds 50,000 rows or 32 MB, writes a `materialExportAudit` row. Cost and price columns appear only with the matching permission; cells are formula-injection safe through the shared `csvLine`.
- Columns: name, SKU, unit, category, supplier, cost, price, status, notes, supplier link, image link.
- Rehearsal: a new materials check covers permissions, filtering, formula safety, the audit row and the stale-count refusal.

### Add material popup on the work order (built, covers WOM-7)
- The work-order materials card has an "Add material" button that opens `work-order-add-material-dialog`: catalog picker, quantity, price (if permitted) and note.
- "Add a new material" opens the same `MaterialDialog` used on the Materials page (`withLine` adds quantity and note). Managers create the catalog item and link it in one step; propose-only users propose it and the line is added as a custom item until it is approved.

### Slice 3 (built)
- Server (`packages/data/src/work-orders/mutations.ts`, `materials/snapshot.ts`): a work-order row linked to a catalog item gets its name, unit, cost and price copied by the server, whatever the editor can see (WOM-2, WOM-3). Only active, non-archived items of the same workspace can be linked; anything else is rejected. Existing linked rows are never re-snapshotted on quantity, status or note edits (WOM-5), and a catalog edit never changes saved rows. The activity entry lists newly linked items (WOM-12).
- Duplicate (WOM-9): linked rows get a fresh snapshot if the item is still active; otherwise they keep their old details as free text with no link.
- UI: `features/materials/material-picker` (type-ahead search against `GET /api/materials`, loading, empty, error and linked states, prices only when permitted) replaces the old catalog dropdown in `work-order-materials`. Editing the name of a linked row's form clears the link and makes it a custom item.
- Rehearsal: a new work-orders check covers rejection (archived, proposed, cross-workspace, unknown), snapshot, no re-snapshot, and duplicate with active vs archived items.
