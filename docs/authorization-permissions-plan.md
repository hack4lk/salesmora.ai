# Authorization and permissions implementation plan

**Status:** Role model and key defaults/administration safeguards reviewed with the user. The [first shared authorization-engine slice](authorization-engine.md) is implemented for review; a [database/repository slice](authorization-persistence.md) now provides tested persistence, role conversion and scoped lead reads. The [live cutover](authorization-live-cutover.md) now enforces current policies in existing Home/lead/invitation flows and filters current navigation. The Settings editor and enforcement for future modules remain pending. The [permission catalog v1](permission-catalog.md) now translates the reviewed matrix into action IDs, scopes, dependencies, and menu gates. Proposed rows and remaining defaults require review before implementation. October 12, 2026.

## Agreed direction

- Permission roles are **Owner, Admin, Office, and Field**. Office and Field become actual permission roles, replacing the Member role plus presentation-only work profiles. This supersedes the earlier role/profile decision for future implementation; the local database and app now use the four-role model.
- Office has campaign access by default (user decision, October 12, 2026): read, create, edit, and activate are separate enabled grants. Field campaign access remains off by default.
- Field can view and work with leads assigned to them, including ordinary edits/stage updates, but cannot create leads (user decision, October 12, 2026). Lead reassignment is a separate permission, agreed off for Field.
- Field can view and prepare (create/edit draft) estimates for assigned jobs (user decision, October 12, 2026). Field can also send estimates to customers for those assigned jobs (user decision, October 12, 2026); sending remains a distinct enabled permission.
- Office can view workspace-wide reports; Field can view reports limited to their assigned work (user decision, October 12, 2026). Data exports are permanently limited to Owner/Admin; Office and Field cannot export (user decision, October 12, 2026). Export access is separate from report viewing.
- Admins can invite teammates and assign Office/Field roles; only Owners can assign Admin (user decision, October 12, 2026). Admins cannot promote themselves or modify Owner/Admin memberships. Role assignment does not allow editing role permissions.
- Unassigned leads and jobs are visible to Owner/Admin/Office; Field sees only assigned work and cannot discover unassigned records through lists, counts, search, reports, APIs, or chat (user decision, October 12, 2026).
- For jobs, Field assignment includes being the primary owner or a current job-team member, even when someone else is primary owner (user decision, October 12, 2026). This scope applies to permitted job actions, related estimate preparation/sending, and assigned-work reports. It does not grant access to unrelated customer records or separately assigned leads. Removing the relationship revokes this source of access.
- Field can mark assigned/team jobs completed. Job cancellation and reassignment are limited to Owner/Admin/Office by default (user decision, October 12, 2026). Completion does not grant reopening, cancellation, or assignment changes.
- Deleting or archiving leads, customers, and jobs is permanently limited to Owner/Admin; Office and Field cannot do either (user decision, October 12, 2026). Deletion and archive remain distinct permissions and must respect record lifecycle/retention rules.
- New teammate invitations default to Field (user decision, October 12, 2026). Owner/Admin must explicitly select Office when needed; only Owner can select Admin. Invitations never assign Owner.
- Permission edits take effect only after explicit Save changes, with a before/after change summary and an audit record (user decision, October 12, 2026). Toggling a control alone never changes live access.
- Owner-only permission management, billing, and ownership transfer are locked invariants: they cannot be granted to other roles or disabled through the role editor (user decision, October 12, 2026). Ownership transfer remains a separate confirmed workflow.
- Field cannot create customers/jobs or access Intake Review, business Settings, or integrations by default. Office can create customers/jobs and handle Intake Review (user decision, October 12, 2026). These grants remain subject to the shared workspace and record-scope rules.
- Field can update active job status and add progress notes on assigned/team jobs, and view their own/assigned-job schedules. Scheduling changes stay with Owner/Admin/Office; reopening completed/cancelled jobs stays with Owner/Admin (user decision, October 12, 2026).
- Owner/Admin/Office can view and edit workspace customer records and reassign leads. Field has read-only access to customer/contact details necessary for assigned work, with no customer editing or lead reassignment (user decision, October 12, 2026).
- Business Settings and integration management are limited to Owner/Admin by default; Office and Field cannot access those pages or their management APIs/chat operations (user decision, October 12, 2026). Office campaign access does not grant integration administration or credentials.
- Admin can remove Office/Field teammates; only Owner can remove an Admin (user decision, October 12, 2026). Team removal cannot remove the Owner or substitute for ownership transfer.
- Office can dismiss intake items and pause/resume campaigns by default (user decision, October 12, 2026), within the current workspace and normal workflow/lifecycle rules.
- Campaign archiving is permanently limited to Owner/Admin; Office and Field cannot archive campaigns (user decision, October 12, 2026). Office campaign read/create/edit/activate/pause/resume access does not imply archive access.
- Export, delete, and archive permissions are permanently restricted to Owner/Admin (user decision, October 12, 2026), including campaign archiving. Owner cannot grant these actions to Office/Field. Enforce the eligible-role ceiling in policy Save validation and every execution path, independently of stored role grants.
- Exactly one Owner per workspace and one role per teammate in that workspace (user decision, October 12, 2026). Membership roles may differ across workspaces. Ownership transfer must atomically preserve exactly one Owner and keep workspace ownership and membership role consistent.
- Version 1 uses only Owner/Admin/Office/Field, with no custom roles or per-person permission overrides (user decision, October 12, 2026). Owner edits apply to a role within the workspace, subject to protected powers and permanent role ceilings.
- Each role has an explicit set of permitted actions and data scopes. Only Owners can change workspace role permissions through **Settings → Permissions** (user decision, October 12, 2026). Admin, Office, and Field cannot access the editor or change permissions through APIs or chat.
- Main menu items appear only when the signed-in user can access that area. Direct URLs and APIs enforce the same rules independently.
- The future chat agent consumes this same policy for information access, retrieval, tools, and actions. If Field lacks campaign access, chat cannot retrieve or disclose campaign information or perform campaign operations.
- Chat runtime work is deferred until this foundation is implemented and validated. This is a planning document; no current permissions or memberships have been changed.

Sources: [existing user journeys](user-journeys.md), [application architecture](application-structure-plan.md), [chat plan](chat-implementation-plan.md), current workspace membership/invitation migrations, navigation, and lead services. Historical role/profile statements in those documents are superseded by this decision; implementation must update them consistently during the migration step.

## Decisions to review together

Walk through these in order. Resolve each decision before implementing its dependent step.

| Review | Decision | Proposed starting point |
|---|---|---|
| 1 | Role definitions and assignment | Agreed: one Owner per workspace and one role per workspace membership. Agreed for v1: only four built-in roles, no custom roles or per-person overrides |
| 2 | Default access by role | Agreed decisions are recorded above and marked in the matrix below. Review remaining proposed defaults before implementation |
| 3 | Who can edit which roles | Agreed: only Owner manages editable role policies; Admin/Office/Field cannot change permissions |
| 4 | Record access scope | Agreed: Owner/Admin/Office can see unassigned leads/jobs; Field sees assigned work only. Agreed: job primary ownership or current job-team membership counts as Field assignment |
| 5 | Permissions screen behavior | Agreed: explicit Save with a before/after change summary and audit record. Grouped matrix, scope selectors, and locked-control presentation remain proposed |
| 6 | Migration and release | Map existing memberships/invitations safely, validate two workspaces and four roles, then enable the new editor; chat follows later |

Role labels express defaults, not hard-coded business access. If a workspace grants Field an ordinary configurable business permission, UI/API/chat all honor it within its allowed record scope. Export/delete/archive actions cannot be granted to Office/Field, even by Owner. Security invariants and Owner-only powers remain locked.

## Proposed default role matrix

These are proposals for discussion, not implemented behavior. “Assigned” includes only records reached through an explicitly authorized assignment/team relationship; it does not automatically include every related record. “Off” means absent from the menu where applicable and denied by server authorization. Future modules remain unavailable until implemented, even when their default policy is defined.

| Area/action | Owner | Admin | Office | Field |
|---|---|---|---|---|
| Home | Authorized workspace overview | Authorized workspace overview | Authorized workspace overview | Assigned-work overview |
| Lead read | Workspace | Workspace | Workspace | Assigned — agreed |
| Lead create | Yes | Yes | Yes | Off — agreed |
| Lead edit/stage | Workspace | Workspace | Workspace | Assigned — agreed |
| Lead assignment | Workspace — agreed | Workspace — agreed | Yes — agreed | Off — agreed |
| Customer read | Workspace — agreed | Workspace — agreed | Workspace — agreed | Necessary assigned-work details only — agreed |
| Customer create | Yes | Yes | Yes — agreed | Off — agreed |
| Customer edit | Yes — agreed | Yes — agreed | Yes — agreed | Off — agreed |
| Job read | Workspace | Workspace | Workspace | Primary owner or current team member — agreed |
| Job create | Yes | Yes | Yes — agreed | Off — agreed |
| Job schedule | Yes — agreed | Yes — agreed | Yes — agreed | Off — agreed |
| Job status/progress notes | Workspace | Workspace | Workspace | Assigned/team — agreed |
| Job completion | Workspace | Workspace | Workspace | Assigned/team — agreed |
| Job cancellation/reassignment | Yes — agreed | Yes — agreed | Yes — agreed | Off — agreed |
| Job reopen | Yes — agreed | Yes — agreed | Off — agreed | Off — agreed |
| Calendar read | Workspace | Workspace | Workspace | Own/assigned schedule — agreed |
| Estimate read | Workspace | Workspace | Workspace | Assigned jobs — agreed |
| Estimate create/edit draft | Yes | Yes | Yes | Assigned jobs — agreed |
| Estimate send | Yes | Yes | Yes | Assigned jobs — agreed |
| Intake read/review/approve | Yes, distinct grants | Yes, distinct grants | Yes, distinct grants — agreed | Off — agreed |
| Intake dismiss | Yes | Yes | Yes — agreed | Off |
| Campaign read | Yes | Yes | Yes — agreed | Off |
| Campaign create/edit/activate | Yes, distinct grants | Yes, distinct grants | Yes, distinct grants — agreed | Off |
| Campaign pause/resume | Yes | Yes | Yes — agreed | Off |
| Campaign archive | Yes — agreed | Yes — agreed | Off — agreed | Off — agreed |
| Reports | Workspace | Workspace | Workspace — agreed | Assigned work — agreed |
| Lead/customer/job delete | Yes — agreed | Yes — agreed | Off — agreed | Off — agreed |
| Lead/customer/job archive | Yes — agreed | Yes — agreed | Off — agreed | Off — agreed |
| Export data | Yes — agreed | Yes — agreed | Off — agreed | Off — agreed |
| Business settings/integrations | Yes, distinct grants — agreed | Yes, distinct grants — agreed | Off — agreed | Off — agreed |
| Team/invitations | Full within ownership safeguards; assigns Admin — agreed | Invite and assign Office/Field — agreed | Off | Off |
| Team removal | Admin/Office/Field — agreed | Office/Field only — agreed | Off — agreed | Off — agreed |
| Settings → Permissions | Manage editable policies — agreed | Off — agreed | Off — agreed | Off — agreed |
| Billing/ownership/account deletion | Owner-only protected operations | Off | Off | Off |
| Assistant | Own authorized features/data | Own authorized features/data | Own authorized features/data | Own authorized features/data |

Lead/customer/job deletion and archive are separate grants from edit and are agreed off for Office/Field by default. Job completion/cancellation, estimate sending, intake approval, campaign activation, exports, integration changes, and user management need explicit actions rather than one broad “manage everything” switch. The catalog will list these separately during Review 2.

## Permission model

The reviewable [permission catalog v1](permission-catalog.md) defines action identifiers, default grants, resource scopes, dependencies, protected powers, and navigation gates. Implement it as a code-owned typed catalog of stable permission identifiers, display descriptions, valid scopes, dependencies, and whether a permission is configurable. Example identifiers: `leads.read`, `leads.create`, `leads.update`, `leads.assign`, `campaigns.read`, `campaigns.create`, `campaigns.activate`, `reports.read`, `exports.create`, and `permissions.manage`.

Store workspace-scoped role grants in PostgreSQL. A grant is an allow with an optional supported scope; absence means deny. No wildcard grants and no competing allow/deny inheritance in the initial version. All four roles remain workspace-scoped; being Owner of workspace A gives no access to workspace B.

Authorization combines authenticated membership, current role policy, required action, record relationship/scope, lifecycle restrictions, and applicable feature/plan availability. A configurable permission cannot bypass a missing membership, another tenant’s records, an unavailable feature, or a read-only completed job. Plan entitlements can restrict a capability but cannot grant one. Unknown permissions/scopes or failed policy reads fail closed.

Use scopes only where meaningful: `workspace`, `assigned`, and any precisely defined `self`/team variant. Scope choices must be defined per resource, not interpreted loosely by a generic string comparison. For example, assigned job access may permit a limited customer DTO, not the customer’s entire history, unrelated jobs, or all contact fields.

Create/update operations require field-level checks: creating a record does not grant assignment to any teammate, editing progress does not grant schedule/owner changes, and access to Settings does not grant connector secrets. Required dependencies are validated together (e.g. update requires appropriate read scope). The UI may offer to enable a dependency but must show that change before Save; the server rejects inconsistent policy submissions.

## Shared enforcement architecture

- `packages/contracts`: permission/role identifiers and schemas for policy changes, supported scopes, revision IDs, and safe capability DTOs. No secrets/database/provider dependencies.
- `packages/domain`: a single authorization service plus reusable domain use cases. `authorize(actor, action, resource)` evaluates trusted membership/policy and resource facts; list scope resolution produces structured restrictions for repositories. UI and agent code do not interpret policy independently.
- `packages/data`: membership, role-policy, audit repositories and scoped queries. Keep resource predicates in queries before pagination, counts, aggregates, exports, or search results are produced. Never read everything and rely on UI/model filtering.
- `apps/web`: authenticated server loaders/routes/actions call shared use cases; workspace shell receives only safe effective capability/menu data. Server-derived role values in the browser are display hints, not trusted authority.
- `packages/ui`: render filtered menus, permitted controls, and the permissions editor through props. Remove hard-coded `owner || admin` menu logic; no business authorization decisions in shared presentation components.
- `packages/agent` later: derive tool/retrieval access from the same authorization service. No separate agent permission store, role assignments, or privileged fallback credential.

Audit all current entry points, including lead-owner choices, pipeline counts, invitation creation/acceptance, workspace summaries, and background handlers. Helpers that accept only a workspace ID must be behind an authorized use case or receive trusted authorization scope. Existing membership-only checks are insufficient for the new model.

## Main menu behavior

Maintain a registry mapping destinations to required read/access capabilities. Filter the main menu, Settings subnavigation, quick actions, record buttons, mobile menu, and account actions from the current server-derived capability snapshot. Show a Settings parent only when at least one accessible Settings child exists. Account/profile and Sign out remain available independently of workspace management access.

Separate **authorized** from **implemented**. A denied destination is hidden completely, including any Coming soon placeholder. An allowed but unimplemented destination may retain the current Coming soon treatment. Preserve consistent labels/order among visible destinations. Reports can be shown for assigned-scope access without implying team-wide access. Individual action buttons still require their own capabilities.

Direct navigation/API attempts are denied server-side using non-disclosing responses for inaccessible records. Navigation capability data is refreshed after policy/role changes and workspace switches; stale visible controls cannot make a denied action succeed. If the current page becomes forbidden, clear protected data and send the user to an authorized landing page or access-unavailable screen. Do not globally cache one workspace/user’s navigation for another.

## Settings → Permissions

Design and review this component in Storybook first. Group permissions by product area, with a role selector or desktop role columns and mobile role tabs. Use switches/checkboxes for actions and selectors for supported record scopes. Show readable descriptions, dependencies, current/default values, and protected controls.

Owner-only editing, protected permission-management/billing/ownership-transfer powers, and Admin Office/Field assignment boundaries are agreed. Additional operational safeguards below remain implementation proposals:

- Owner has fixed access to permission administration and ownership recovery. The editor cannot remove the sole Owner, disable their recovery powers, or grant Owner-only operations to another role. Ownership transfer is a separate confirmed workflow.
- Only the current workspace Owner can edit any role policy. Admin cannot edit Owner, Admin, Office, or Field permissions. Hide Settings → Permissions from non-Owners and independently deny its read/write endpoints and any future agent tool. Validate current ownership and protected invariants server-side on every operation.
- Agreed: Admin can invite teammates and assign Office/Field roles, including switching eligible teammates between those two roles. Only Owner can assign Admin. Admin cannot assign/invite Owner/Admin, change Owner/Admin memberships, or promote themselves. This supersedes the existing Admin-invitation behavior and must be enforced for invitations, acceptance, and membership updates. Ownership transfer remains separate.
- Permission administration is an immutable Owner-only capability, not a configurable toggle. The editor cannot delegate it to Admin, Office, or Field. Permission management, billing, and ownership transfer cannot be toggled off for Owner or granted to another role. Other Owner business permissions may be configurable only where these protected powers and recovery access remain intact.

Agreed: changes remain local until explicit **Save changes**, with a before/after change summary and an audit record for each successful policy change. Display affected roles and before/after permissions/scopes, particularly new campaign/export/team-wide access. Reset to defaults is also a reviewed save. Never silently overwrite a customized workspace when default templates change.

On Save: authenticate and validate Origin; load current membership and policy; validate Owner-only authority, dependencies, and protected invariants; compare policy revision; atomically update grants, increment workspace policy revision, and append an audit entry. Reject stale revisions with a conflict message. Concurrent removal of the editor’s authority must serialize with their attempted save; a previously authorized page load cannot authorize a later write.

Audit actor, workspace, target role, before/after grants/scopes, policy revisions, timestamp, and outcome. Log safe denial metadata without credentials or protected business payloads. Define audit access and retention; only authorized administrators can read it. Sensitive role/permission changes should require recent authentication under a documented reauthentication window.

## Data migration and existing access

Proposed tables: code-owned permission catalog/templates; `workspaceRolePolicies` for workspace/role grants and scopes; workspace `authorizationRevision`; and immutable app-owned `authorizationAudit` records. Exact table layout and constraints are settled during implementation review. Use database constraints for valid roles/scopes and unique workspace-role-permission grants.

Map existing `owner` → Owner, `admin` → Admin, `member + office` → Office, and `member + field` → Field. Migrate pending invitations and acceptance contracts too; do not let an old invitation restore an obsolete role or elevate current membership. Review email templates, onboarding defaults, role labels, and tests. New teammate invitations default to Field as agreed. Office requires explicit selection by Owner/Admin; Admin requires explicit selection by Owner. Apply the same choices and server restrictions during onboarding and later team invitations.

Retire the profile column if no separate presentation preference is needed. If retained for UI preferences, rename/redefine it explicitly and ensure it has no authorization effect. Never have both old and new role models active as competing sources of authority.

Backfill a policy for every existing workspace using versioned reviewed defaults, then enforce it. Missing policies deny access rather than fall back to permissive legacy checks. Some existing Members will lose workspace-wide lead counts/read access; test and document the intended transition. New workspace creation seeds defaults atomically with Owner membership. Future default changes apply to new workspaces or explicit reviewed resets, not silently to existing customizations.

Use staged additive migrations and an isolated backup/restore rehearsal. Avoid a mixed-version deployment where old code bypasses new policy or cannot read new roles; use a controlled cutover/maintenance window if compatibility cannot be proved. After restrictive policies take effect, rollback must not restore the old permissive authorization behavior; prefer a forward fix or temporarily disabled affected feature.

## Revocation, caches, and concurrent work

Load current authority on every protected server operation; do not trust role claims cached in a long-lived session/JWT. Sessions establish identity, current membership/policy establishes access. Cache only with workspace/user/policy-revision keys and invalidate on policy/membership changes; cache unavailability must not bypass checks. Begin with uncached server policy reads unless measurement justifies complexity.

Refresh open tabs on role/policy changes (version checks on focus/navigation, with a push/invalidation mechanism if needed). Data already seen cannot be recalled, but future requests and protected writes must deny immediately after the change commits. Sensitive writes coordinate transactionally with membership/policy changes so an outdated decision cannot commit after revocation. Queued jobs recheck authority at execution; scheduled automation needs an explicitly defined accountable service identity rather than inheriting an Admin’s unlimited access.

## Chat integration after authorization is complete

Gate chat access itself if appropriate, then evaluate every requested feature separately. Authorized access to chat never grants access to campaigns or other modules.

- Exclude denied tools and independently authorize each tool call, record query, draft, and confirmed commit.
- Filter help articles, citations, resource summaries, and vector results by current feature permissions before sending them to the model. If Field lacks `campaigns.read`, do not retrieve campaign help/content or live campaign records. The assistant can say access is unavailable without disclosing campaign details.
- Revalidate history as well as new retrieval. Tag stored messages/summaries and tool evidence with relevant feature/record provenance; after access is revoked, exclude inaccessible content from transcript/history endpoints and future prompts. Generated answers inherit the restrictions of their source data. Reject or withhold content whose authorization provenance cannot be safely determined.
- Recheck during long-running work before releasing newly obtained protected content; stop an active run when revocation is detected. Never place keys or unrestricted database access in model context. All confirmations recheck current permissions.
- Keep the server-controlled surface/task allowlist as an additional constraint. A surface can narrow capabilities; it cannot broaden the role’s permissions.

## Implementation walk-through

| Step | Work | Completion/review evidence |
|---|---|---|
| 1. Agree policy | Finalize four roles, full permission catalog/default matrix, record scopes, Owner-only permission administration, invite/assignment rules | Reviewed examples for Owner/Admin/Office/Field, including Field campaign denial; unresolved decisions recorded |
| 2. Build policy engine | First typed catalog/pure authorizer slice implemented for review; lead list/count adapters are now tested; other resource adapters remain pending. See [engine notes](authorization-engine.md) | Unit tests for role/action/scope/dependencies, tenant boundaries, Owner-only policy editing, missing/unknown policy, field restrictions |
| 3. Persist and migrate | Policy/audit storage, transactional seeding, role/invitation conversion and revision/concurrency rules are implemented. Backup/restore and live cutover passed. See [persistence notes](authorization-persistence.md) | Isolated migrate/restore/cutover tests; current users map predictably; revocation and escalation tests pass |
| 4. Enforce existing flows | Connected current policy to Home, lead create/owners/counts and invitation delivery/acceptance; regression suite passed | Direct API/URL tests prove denials; allowed manual flows still work; counts disclose only authorized records |
| 5. Filter navigation | Current menu and Home actions filter server-derived capabilities on desktop/mobile. Future pages and open-tab invalidation remain pending | Storybook role/scope matrix; hidden denied items; stale controls and direct URLs cannot bypass server checks |
| 6. Build Permissions page | Approved Storybook editor is connected locally with Owner-only page/API access, protected controls, before/after save, audit writes, conflicts/reset and recent authentication. Audit-history browsing remains pending. See [editor notes](permissions-page-design.md) | Owner save flows, Admin/Office/Field access denial, forbidden edits, stale saves, revoked ownership, password confirmation and keyboard/mobile checks; connected-screen review |
| 7. Security acceptance | Two-workspace/four-role regression suite, cache/revocation/queue checks and operational runbook | Zero unauthorized reads/writes/disclosures; reviewed rollout and recovery; authorization foundation approved |
| 8. Resume chat | Update chat plan to consume final authorizer and history/retrieval policies | Same manual/API/chat permission scenarios; no role-specific agent bypass |

Review one step together before proceeding to the next. The main role-policy decisions are recorded. The catalog, engine, persistence, existing-flow cutover and approved Owner-only Permissions editor are implemented locally. Next, review the connected editor before the broader security acceptance checkpoint. Review unmarked defaults and any newly implemented resource scopes before enabling those features. Keep those remaining details explicit rather than treating approval of one action as approval of unrelated actions. The completed slices are recorded in the live cutover notes.

## Security acceptance cases

Use fictional records and two isolated workspaces, including a user with different roles in each. Test allowed operations as well as denials; hiding menus is never the sole test.

Required denials include forged role/workspace/permission identifiers; cross-workspace reads, counts, exports and writes; Field campaign menu/URL/API/chat/RAG access; unassigned or unrelated records; edit requests containing forbidden assignment/schedule fields; Admin self-promotion or edits to any role grants; Admin/Office/Field permission editor page/API/chat access; stale invitation elevation; concurrent authority revocation and policy saves; lost/replayed save responses; stale cached/session capabilities; and future worker/tool access after revocation.

Verify Settings never exposes secrets, default resets cannot bypass protected invariants, policy audit rows are transactional, and incomplete/error policy loads fail closed. Run existing manual-flow regressions, component accessibility/mobile checks, lint/typecheck/build, and isolated browser/API tests appropriate to each implemented step. No application behavior is changed by this document.
