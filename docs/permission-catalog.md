# Permission catalog v1

**Status:** Reviewable specification, October 12, 2026. This translates the [authorization plan](authorization-permissions-plan.md) into stable actions/scopes. The [typed catalog and pure authorization engine](authorization-engine.md) are implemented for review. No database migration or live permission change is included.

## Reading the catalog

Roles: `owner`, `admin`, `office`, `field`. New ordinary invitations default to `field`. Agreed: exactly one Owner per workspace and exactly one role per teammate in that workspace (October 12, 2026). A user may have different roles in different workspaces. Agreed for v1: only the four built-in roles, with no custom roles or per-person permission overrides (October 12, 2026). Owners configure role-wide ordinary grants within the permanent ceilings.

`W` = all authorized records in the current workspace. `A` = assigned records as defined below. `R` = limited related customer details. `J` = estimates linked to assigned jobs. `S` = own/assigned calendar entries. `✓` = enabled without a selectable record scope. `—` = denied. Every enabled action still requires current membership, implemented feature, valid resource state, and applicable plan availability.

Rows marked **Agreed** translate a user decision. **Proposed** rows fill out the original plan but have not been individually approved. Owner/Admin defaults on operational rows follow the baseline plan; explicit user confirmations primarily settled Office/Field differences and administrative boundaries. Future features are catalogued for consistency, not activated by listing a grant.

## Scope definitions

| Scope identifier | Meaning and query boundary |
|---|---|
| `workspace` (`W`) | Records in the authenticated workspace only; includes unassigned leads/jobs. Never cross-workspace |
| `assigned` (`A`), leads | Current lead owner equals the signed-in user. Job-team membership does not imply access to its source lead |
| `assigned` (`A`), jobs | Current primary owner OR current job-team membership includes the signed-in user. Losing both relationships revokes this access |
| `related_assigned` (`R`), customer details | Minimal customer/service/contact DTO needed for an authorized assigned lead/job; no unrelated history, other jobs, private billing data, or general customer browsing. Read-only fields are limited to the customer name, service location, contact details, and service information necessary for the assigned work; the exact field schema must be reviewed before implementation |
| `assigned_job` (`J`), estimates | Estimate belongs to a job currently accessible through the user’s job assignment/team membership. Creating an estimate validates its job first; a client-provided job ID is insufficient |
| `own_assigned` (`S`), calendar | User’s schedule and entries for authorized assigned jobs; not everyone else’s schedule |
| `assigned` (`A`), reports | Aggregate only authorized assigned leads/jobs and permitted related data. Filter before counts/grouping; no hidden workspace totals or identifiable unrelated teammates |

Each permission declares its supported scopes below. Unsupported scope/resource combinations fail validation. Mutation scope cannot exceed the corresponding read scope. Creation checks the proposed parent/resource relationship rather than pretending a not-yet-created record already has an owner. Creation never implicitly grants reassignment.

## Workspace and leads

| Permission ID | Action / supported scopes | Owner | Admin | Office | Field | Decision |
|---|---|---|---|---|---|---|
| `home.access` | Open workspace Home; widgets use underlying read grants | ✓ | ✓ | ✓ | ✓ | Reviewed baseline, all four roles (October 12, 2026) |
| `leads.read` | Lists, details, search, pipeline counts; W/A | W | W | W | A | Agreed |
| `leads.create` | Create a lead; workspace-local input | ✓ | ✓ | ✓ | — | Field denial agreed |
| `leads.update` | Ordinary editable lead fields; W/A | W | W | W | A | Agreed |
| `leads.stage.update` | Change an allowed lead stage; W/A | W | W | W | A | Agreed |
| `leads.assign` | Change lead owner; W | W | W | W | — | Agreed |
| `leads.archive` | Archive lead; W | W | W | — | — | Agreed |
| `leads.delete` | Delete lead if retention/lifecycle permits; W | W | W | — | — | Agreed |

`leads.update` cannot change workspace, creator, assignment, stage, audit fields, or deletion state. Each excluded operation requires its own capability. First create-lead validation proposes: without `leads.assign`, owner must be the creator; choosing Unassigned/another member requires assignment authority. Finalize this creation-field rule before permitting customized create-without-assign policies.

## Customers and jobs

| Permission ID | Action / supported scopes | Owner | Admin | Office | Field | Decision |
|---|---|---|---|---|---|---|
| `customers.read` | Full permitted customer DTO/list; W | W | W | W | — | Agreed |
| `customers.related.read` | Minimal assigned-work customer DTO; W/R | W | W | W | R | Agreed |
| `customers.create` | Create customer | ✓ | ✓ | ✓ | — | Agreed |
| `customers.update` | Edit permitted customer fields; W | W | W | W | — | Agreed |
| `customers.archive` | Archive customer; W | W | W | — | — | Agreed |
| `customers.delete` | Delete customer if permitted; W | W | W | — | — | Agreed |
| `jobs.read` | Lists, details, search, counts; W/A | W | W | W | A | Agreed |
| `jobs.create` | Create job | ✓ | ✓ | ✓ | — | Agreed |
| `jobs.update` | Ordinary job description/service fields; W | W | W | W | — | Proposed |
| `jobs.schedule.update` | Change dates/deadlines; W; Field `A` is limited to jobs where they are the **primary owner** (job-team membership alone is not enough) | W | W | W | A | Agreed (calendar plan Q2, October 14, 2026) |
| `jobs.assign` | Change primary owner/job team; W | W | W | W | — | Agreed |
| `jobs.status.update` | Ordinary allowed active-status transitions; W/A | W | W | W | A | Agreed |
| `jobs.progress.create` | Append progress note; W/A | W | W | W | A | Agreed |
| `jobs.complete` | Mark completed; W/A | W | W | W | A | Agreed |
| `jobs.cancel` | Mark cancelled; W | W | W | W | — | Agreed |
| `jobs.reopen` | Reopen completed/cancelled job; W | W | W | — | — | Agreed |
| `jobs.archive` | Archive job; W | W | W | — | — | Agreed |
| `jobs.delete` | Delete job if permitted; W | W | W | — | — | Agreed |
| `calendar.read` | Schedule view; W/S | W | W | W | S | Agreed |

Generic job update/status operations cannot change assignment, scheduling, completion, cancellation, reopening, archive, or deletion state. Completion/cancellation and immutable history rules remain domain constraints; a permission does not authorize rewriting progress history. The agreed `jobs.reopen` permission is limited to Owner/Admin by default and remains separate from completion. Calendar display checks job access and excludes unrelated event details.

## Work orders

Agreed in the work-orders plan (Q8, October 19, 2026); reviewed and enabled with the live work-order list (migration `202610190003` backfills existing workspaces and the seed template carries the defaults). `A` = work orders on jobs the user can currently access as assigned (assignee or job team); losing access to the job revokes access to its work orders.

| Permission ID | Action / supported scopes | Owner | Admin | Office | Field | Decision |
|---|---|---|---|---|---|---|
| `workorders.read` | Lists, details, print; W/A | W | W | W | A | Agreed |
| `workorders.create` | Create draft from a job | ✓ | ✓ | ✓ | — | Agreed |
| `workorders.update` | Edit instructions, tasks list, materials, safety notes, crew; W | W | W | W | — | Agreed |
| `workorders.issue` | Issue a draft to the crew | W | W | W | — | Agreed |
| `workorders.progress` | Check tasks, log materials used, add crew notes and photos; W/A | W | W | W | A | Agreed (plan ACC-4) |
| `workorders.complete` | Complete, including sign-off capture; W/A | W | W | W | A | Agreed (plan Q19) |
| `workorders.cancel` | Cancel with reason; W | W | W | W | — | Agreed |
| `workorders.reopen` | Reopen completed/canceled; W | W | W | W | — | Agreed (matches `jobs.reopen`; plan LIF-6) |
| `workorders.archive` | Archive; W | W | W | — | — | Agreed |
| `workorders.delete` | Delete drafts only, typed-number confirmation; W | W | W | — | — | Agreed |
| `workorders.export` | Export authorized work-order data; W/A | W | W | — | — | Agreed defaults |
| `workorders.view_prices` | See and override customer prices on work-order materials; W | W | W | W | — | Agreed (plan CNT-3b) |
| `workorders.view_costs` | See internal cost and margin on work-order materials; W | W | W | — | — | Agreed (plan CNT-3c) |

Field cannot edit instructions, reassign, reschedule beyond the `jobs.schedule.update` primary-owner exception, or see prices. Notifications and the assistant never include sensitive access notes.

## Estimates, intake, campaigns, and reports

| Permission ID | Action / supported scopes | Owner | Admin | Office | Field | Decision |
|---|---|---|---|---|---|---|
| `estimates.read` | Read estimate; W/J | W | W | W | J | Agreed |
| `estimates.create` | Create draft; workspace or assigned-job parent | W | W | W | J | Agreed |
| `estimates.update` | Edit draft estimate; W/J | W | W | W | J | Agreed |
| `estimates.send` | Explicitly send an estimate; W/J | W | W | W | J | Agreed |
| `intake.read` | View intake items/evidence; W | W | W | W | — | Agreed |
| `intake.update` | Correct proposed intake data; W | W | W | W | — | Office handling agreed; exact fields proposed |
| `intake.approve` | Approve intake proposal; W | W | W | W | — | Agreed |
| `intake.dismiss` | Dismiss intake proposal; W | W | W | W | — | Office access agreed |
| `campaigns.read` | View campaigns and campaign help; W | W | W | W | — | Agreed |
| `campaigns.create` | Create campaign draft | ✓ | ✓ | ✓ | — | Agreed |
| `campaigns.update` | Edit campaign draft/configuration; W | W | W | W | — | Agreed |
| `campaigns.activate` | Publish/activate campaign; W | W | W | W | — | Agreed |
| `campaigns.pause` | Pause/resume campaign; W | W | W | W | — | Office access agreed |
| `campaigns.archive` | Archive campaign; W | W | W | — | — | Agreed: permanent Owner/Admin ceiling |
| `reports.read` | View permitted aggregates; W/A | W | W | W | A | Agreed |
| `leads.export` | Export authorized lead data; W/A | W | W | — | — | Agreed defaults |
| `customers.export` | Export authorized customer data; W | W | W | — | — | Agreed defaults |
| `jobs.export` | Export authorized job data; W/A | W | W | — | — | Agreed defaults |
| `activity.export` | Export authorized CRM activity; W/A | W | W | — | — | Owner/Admin-only default agreed; exact activity scope proposed |

Sending does not bypass required estimate fields, recipient validation, lifecycle rules, idempotency, or explicit confirmation for a future agent action. Intake approval checks all resulting effects: approving a new lead requires lead creation authority, and assigning it requires assignment authority. Campaign activation cannot configure an action the actor cannot authorize; referenced integration use and downstream service identity must be explicitly defined. Report read alone never authorizes any export. Export rows require matching resource read scope.

## Settings, team, protected powers, and assistant

| Permission ID | Action / supported scopes | Owner | Admin | Office | Field | Decision |
|---|---|---|---|---|---|---|
| `settings.business.read` | Read business-settings page/DTO | ✓ | ✓ | — | — | Agreed |
| `settings.business.update` | Edit approved business settings | ✓ | ✓ | — | — | Agreed |
| `integrations.read` | Read safe connector status/configuration DTO | ✓ | ✓ | — | — | Agreed |
| `integrations.manage` | Connect/reconnect/disconnect/configure integration | ✓ | ✓ | — | — | Agreed |
| `team.read` | Workspace team-management directory | ✓ | ✓ | — | — | Proposed |
| `team.invite` | Invite eligible teammate role | ✓ | ✓ | — | — | Owner/Admin agreed |
| `team.role.assign` | Assign eligible role to eligible membership | ✓ | ✓ | — | — | Agreed; target-role ceiling below |
| `team.remove` | Remove eligible teammate | ✓ | ✓ | — | — | Agreed; target-member safeguards apply |
| `permissions.read` | Read permission editor/policy history | ✓ | — | — | — | Owner-only editor agreed |
| `permissions.manage` | Save/reset role grants and scopes | ✓ | — | — | — | Locked Owner-only; agreed |
| `billing.manage` | Billing administration | ✓ | — | — | — | Locked Owner-only; agreed |
| `ownership.transfer` | Separate confirmed ownership transfer | ✓ | — | — | — | Locked Owner-only; agreed |
| `workspace.delete` | Separate confirmed workspace/account-level deletion | ✓ | — | — | — | Proposed Owner-only; not yet approved as a locked power |
| `assistant.use` | Open/use assistant for otherwise-authorized features | ✓ | ✓ | ✓ | ✓ | Reviewed baseline, all four roles (October 12, 2026) |

Protected powers are checked against current workspace ownership, never granted solely because a stored policy row says allow. A new catalog version cannot accidentally turn one into an ordinary toggle. Preserve Owner recovery access and the permission editor’s read dependency. The sole Owner cannot be removed/demoted through team operations. Billing visibility and workspace deletion behavior need separate product contracts before implementation.

`team.invite` and `team.role.assign` have non-configurable target restrictions: Owner may assign Admin/Office/Field; Admin may assign Office/Field only and may not modify Owner/Admin memberships or themselves. Assigning Owner requires `ownership.transfer` and its separate workflow. Agreed: Admin may remove Office/Field teammates; only Owner may remove an Admin. Team removal cannot remove the Owner or bypass the separate ownership-transfer workflow. No ordinary role-policy edit can expand these role-assignment ceilings.

Account profile, Sign out, and session recovery are identity functions, not workspace-administration permissions. Limited assignee selection or colleague labels on authorized jobs use purpose-specific minimal DTOs; they do not require or grant the full `team.read` directory. Likewise, showing a workspace name on Home does not require access to business-settings configuration.

## Dependencies and customizable defaults

- Read checks apply to every referenced record. Update/stage/assign/archive/delete/complete/cancel/reopen/send require appropriate read access plus their own permission and valid state. Archive/delete cannot be disguised as generic update fields.
- Scope containment is resource-specific. Example: `jobs.complete: workspace` with only `jobs.read: assigned` is invalid; `jobs.complete: assigned` with workspace read is valid. Do not compare unrelated scope names as a universal ordering.
- Estimate create/update/send at J require assigned-job read and estimate read at J (creation evaluates the proposed parent); customer R requires the underlying lead/job read and current assignment relationship. Full customer read is not implied.
- `integrations.manage` requires safe integration read. Secrets remain server-only regardless of role. Campaign users may use an explicitly authorized configured integration without receiving connector credentials or its management page.
- Policy Save rejects unsatisfied dependencies and unknown permission/scope IDs. The review UI can suggest additional changes, but cannot silently enable them.
- Ordinary grants are workspace-customizable by Owner within protected ceilings. Permission management, billing, and ownership transfer are locked Owner-only powers. Export, delete, and archive permissions have a permanent Owner/Admin role ceiling (user decision, October 12, 2026): Owner cannot grant them to Office/Field. This applies to the catalogued CRM exports, lead/customer/job deletion and archiving, and campaign archiving, and must apply to future export/delete/archive actions. Owner/Admin grants may be narrowed, but the eligible-role ceiling cannot be expanded by policy rows, scope changes, APIs, chat, or future custom roles. Recovery access and role-assignment ceilings remain independently enforced.
- Every catalog entry also carries feature implementation status, valid scopes, dependency rules, and configurable/protected metadata and eligible-role ceilings in the eventual typed contracts. Disabled/unimplemented features never execute merely because defaults include them.

## Navigation mapping

| Destination | Capability gate |
|---|---|
| Home | `home.access`; each widget requires its underlying scoped read grant |
| Intake Review | `intake.read` |
| Leads | `leads.read` |
| Customers | `customers.read`; related-only customer details stay inside authorized lead/job flows |
| Jobs | `jobs.read` |
| Calendar | `calendar.read` |
| Work orders | `workorders.read` |
| Estimates | `estimates.read` |
| Reports | `reports.read`; A shows assigned-work reports only |
| Campaigns | `campaigns.read` |
| Settings → Business | `settings.business.read` |
| Settings → Team | `team.read` |
| Settings → Integrations | `integrations.read` |
| Settings → Permissions | Current Owner plus `permissions.read` |
| Settings → Billing | Current Owner plus `billing.manage` until a separate read capability is defined |

Settings parent appears if at least one child is accessible. Buttons require their action grants separately. Filter denied destinations before applying Coming soon availability. Server guards and queries remain authoritative. Assistant capability alone never makes hidden features available through chat, RAG, stored history, or citations.

## Next review and implementation boundary

Confirm proposed rows in grouped review, especially the remaining administrative actions. Export/delete/archive Owner/Admin ceilings are agreed permanent; verify catalog metadata and Save validation enforce them. Ownership/membership cardinality is agreed: exactly one Owner per workspace and one role per membership. Enforce this atomically during workspace creation and ownership transfer, with database constraints plus transactional invariants; no zero-Owner or two-Owner committed state.

Then implement this specification as typed contracts and pure authorization rules with exhaustive role/action/scope tests. Validate the catalog itself (unique IDs, legal scopes/defaults, dependency closure, immutable powers, menu references, and known feature statuses) before persistence or UI wiring. Live data migration, connected menus, permission editor, and chat integration remain later reviewed steps in the [implementation sequence](authorization-permissions-plan.md#implementation-walk-through).


### Customer implementation alignment — October 18, 2026

Manual customer read/create/update/archive/delete/export and minimal related reads are now enabled locally. Full customer read/create/update permanently exclude Field from eligible roles; legacy excessive Field grants are removed and audited by migration 202610180001. Related Field reads require an exact currently assigned readable work record even under a widened related-read template. Related grants and customer ownership never authorize browsing. Archive/delete/export keep Owner/Admin ceilings. Link/unlink also require current `leads.read` and `leads.update` for the exact lead and `customers.update`; the dedicated `customerId` field check cannot grant a Field user general relationship writes. Customer tool registration remains unimplemented.

Customer chat (local October 18): model-visible customer operations are filtered by the same enabled permissions and current saved policy as manual customer services. Confirmation reauthorizes through those services; tool exposure never grants a write. The full customer read ceiling remains Owner/Admin/Office. Field receives only `related_contact`, resolved through a currently readable, assigned lead with minimal contact fields. Linking intersects customer update and lead read/update scopes. Team-note append follows the manual read-based capability. Customers query/proposal facades are shared across registered chat surfaces.


Jobs foundation checkpoint (October 19): local stores enforce current policy and SQL read scope before counts/records, with an additional Field primary-owner requirement for `jobs.schedule.update`. There is no bypass around a missing/revoked grant. The documented Field default `A` still needs a reviewed, versioned cutover from the existing code/stored default template before enabling Jobs/Calendar; foundation migration deliberately changes no saved grants. `jobs.update` stays unreviewed and `jobs.delete` stays unavailable (cancel retained jobs instead). Protected routes/UI/model tools are not activated in this slice.
