# Lead Capture implementation plan

Status: plan and implementation order approved October 28, 2026. Items 1–11 approved. User approved redesigning field setup into two assistant-guided screens; item 12a (paste example and extract) approved; item 12b findings and all requested revisions approved. Item 13 sample-rule check approved. Item 14 lead workflow approved. Item 15 final setup review approved October 29, 2026, after removal of the slot-reservation note. Item 16 publication instructions approved October 29, 2026. Actual public form hosting is explicitly tracked in integration step 4. Item 17a pause/resume review approved October 29, 2026. Item 17b archive/restore review approved October 29, 2026. Item 17c scheduled-launch change review approved October 29, 2026. Item 17d source duplication review approved October 29, 2026. Item 18 source dashboard summary approved October 29, 2026. Item 19 source settings/details approved October 29, 2026. Item 20a Intake Review toolbar approved October 29, 2026, after removing its visible heading. Item 20b Intake Review list approved October 29, 2026, including source-type pills. Item 21 intake source evidence approved October 29, 2026. Item 22 proposed-lead editor approved October 29, 2026. Item 23 duplicate decision approved October 29, 2026. Item 24 final intake decision review approved October 29, 2026. Individual component checkpoints are approved. Page 1 capture-source list composition approved October 29, 2026. Page 2 website setup composition approved October 30, 2026. Page 3 Gmail setup composition approved October 30, 2026. Page 4 final review/publication composition approved October 30, 2026. Page 5 source dashboard/settings composition approved October 30, 2026, including the header action menu and tab-bar revisions. Page 6 Intake Review queue composition approved October 30, 2026. Page 7 intake detail composition approved October 30, 2026. All seven page compositions are approved. Integration step 1 design approved in this chat; contracts/persistence foundation implemented and verified October 31, 2026. Integration step 1 implementation approved. Integration step 2 draft CRUD and page connections, including responsive preview framing and header/content/footer corrections, were approved October 31, 2026; the user selected one wizard URL per source with the step in the query string.

## Confirmed delivery requirements

- Rename Campaigns to Lead Capture throughout the product and its supporting references.
- Approved terminology: **Lead Capture** for the section, **capture source** for an individual configured item, and **Create capture source** for the primary action (Q2, October 28, 2026).
- Approved technical rename: use `/lead-capture` and corresponding Lead Capture identifiers in code, permissions, billing and stored lead provenance. Migrate existing data and preserve old links through redirects; explicitly track any compatibility aliases (Q3, October 28, 2026).
- Approved access defaults: Owner, Admin and Office can view, create, edit, launch, pause/resume and archive capture sources; Field has no access by default. Retain the configurable permission system. Office archive eligibility/defaults must be updated alongside server enforcement, permission dependencies, policy migration and tests; existing explicit permission customizations must not be silently overwritten (Q4, October 28, 2026).
- Approved website admission: valid website submissions create leads immediately through the shared lead-creation boundary; possible duplicates and accepted submissions needing corrections go to Intake Review before lead creation. Invalid or abusive requests remain subject to server validation and abuse controls. Gmail matches require supervised review before creating a lead (Q5, October 28, 2026).
- Base flows on the current prototypes, adapting them to current shared components and branding.
- Review planning decisions one question at a time.
- After plan approval, implement one Storybook component, validate it, and pause for user review. Incorporate requested changes before advancing.
- Assemble full page stories only after their components are approved; connect approved pages to application services afterward. Implement assistant behavior after page integration.

- Approved form defaults (Q6a): Name required; at least one of Email or Phone required; Service requested required; Project details optional; Service address optional. Admins can change labels, order and required fields. Exact field types and customization limits remain to be reviewed.
- Approved custom fields (Q6b): admins can add short text, long text, dropdown, checkboxes and date fields alongside standard contact/service fields. Store custom answers on the captured lead; retain them on pending intake before approval. Define typed validation and field/version identity during technical design so later form edits do not reinterpret historical answers.
- Approved visitor success behavior (Q6c): show an editable thank-you message in place on the form, without redirecting, only after the submission is successfully saved. Default copy: “Thanks for your request. Our team will be in touch.” Saving into Intake Review also counts as successful receipt; the message must not imply that a CRM lead was already created.
- Approved paused visitor state (Q6d): the embedded form and hosted link show an editable unavailable message with the business's public contact details while the capture source is paused. Disable submissions until it resumes, enforcing the paused state on the server as well as in the interface.
- Approved privacy/consent presentation (Q6e): support a business-provided privacy policy link and an optional consent checkbox that admins can configure as required. Keep this separate from any future marketing opt-in. Preserve the displayed consent wording/version and submitted choice with the submission; enforce required consent on the server. Business-specific wording remains configurable.
- Approved spam protection (Q6f): every public form includes a hidden bot-trap field, server-enforced submission rate limits and duplicate-request protection. Present a CAPTCHA challenge only when suspicious activity is detected. Select the challenge provider and detection thresholds during integration design; ordinary submissions should remain simple. Transport retries must not create duplicate intake items or leads.
- Approved Gmail account binding (Q7a): each Gmail capture source connects to exactly one Gmail account. Incoming email for that account is checked under Q7b.
- Revised Gmail intake scope (Q7b, October 28, 2026): select/connect one Gmail account by its email address and check incoming email for that account. The user removed the Inbox-versus-label choice as unnecessary granularity. Matching rules filter incoming messages in the next step; no separate message-scope selection is required.
- Approved Gmail matching (Q7c): case-insensitive phrase matching against incoming email in the selected account. Admins select subject, body or both and choose whether all configured phrases (AND) or any configured phrase (OR) must match. Keep the rule visible in setup, sample preview and final review. Sender and attachment matching conditions remain outside first-release phrase rules.
- Approved Gmail field mapping (Q7d): the assistant suggests lead-field mappings from a sample email; admins review and correct them before launch. Show the source text beside each proposed value and visibly flag missing or uncertain values. Suggestions remain drafts until reviewed; email content is untrusted input.
- Approved Gmail sample preview (Q7e): require at least one reviewed representative email sample before launch, selected from Gmail or pasted manually. Retain that sample with the capture source for testing future rule changes, accessible only to authorized users. Testing a sample never creates a lead. A pasted sample supports setup even when no matching message is available in Gmail.
- Approved duplicate dispositions (Q8a): Intake Review offers update/link to the existing lead, create a separate lead, or dismiss. Require explicit review of proposed field changes before updating an existing lead; never merge automatically. Server checks must authorize both the intake item and any existing lead involved, preserve provenance and prevent repeated decisions from applying changes twice.
- Approved intake correction/review (Q8b): authorized reviewers can correct extracted fields, then approve or dismiss an intake item. Keep the original email or submission visible beside editable lead details. Block approval until required fields are complete, with authoritative server validation; preserve original evidence separately from reviewer corrections.
- Approved first-release assignment (Q9a): each capture source chooses the business's default assignment rule or one selected teammate. Round-robin assignment remains deferred.
- Deferred business-default assignment settings (approved October 28, 2026): add **Settings → Leads → Default assignment** later, offering **Leave leads unassigned for manual assignment** or **Assign to one selected teammate**. Capture sources may inherit this business default or override it with a specific teammate. This setting does not currently exist; the workflow component's business-default option is draft presentation only. Before connecting it to live lead creation, implement the setting and its authoritative assignment resolution rather than assuming a configured rule exists. Conditional automatic assignment workflows remain a separate deferred capability.
- Approved starting stage/tags (Q9b): each capture source can configure the starting lead stage using existing lead stages and apply tags. Default to New with no tags. Apply these settings when creating a new lead from a valid website submission or approved intake item; do not silently overwrite an existing lead's stage/tags when linking a duplicate—include any proposed changes in the approved duplicate review.
- Approved assigned-teammate notifications (Q9c): each capture source has a “Notify assigned teammate” option, enabled by default. When a new lead is created, use the app's existing notification preferences to notify its assigned teammate. Deliver once despite submission/approval retries. This option does not send customer emails.
- Approved launch timing (Q10a): after explicit setup review and approval, support launch now or schedule a future launch in the first release. Show scheduled times in the business's timezone and persist an unambiguous launch instant. Recheck authorization/configuration readiness, source state and subscription capacity at the appropriate launch boundary; capacity reservation semantics remain Q11.
- Approved duplication (Q10b): first release supports copying a capture source's configuration into a new draft, excluding captured leads, history and retained email samples. Do not inherit the original publication identity, launch schedule or approval. Require connection confirmation, a newly reviewed Gmail sample when applicable and final setup review before launch.
- Approved template deferral (Q10c): reusable capture-source templates shared within the business are deferred. First release provides reuse through duplication. Later templates contain configuration only, with fresh connection/sample confirmation and review before launch.
- Approved archive/restore behavior (Q10d): archiving stops new intake while preserving existing leads, pending intake reviews and history. Existing pending items remain reviewable under their permissions. Restoration returns the source to a paused state and requires explicit setup review before relaunch; it never automatically resumes intake. Archiving cancels any scheduled launch. Define restored Gmail cursor/backlog eligibility explicitly before integration rather than assuming archived messages should be ingested.
- Approved active-source editing (Q10e): edits stay in a draft revision while the current approved configuration continues running. Require explicit review and publication to replace the active revision. Gmail rule or mapping changes require a fresh sample preview against the proposed revision. Bind review/publication to the exact version and keep historical intake associated with the configuration that processed it.
- Approved published-source capacity (Q11a): active, paused and scheduled capture sources consume a plan slot; drafts and archived sources do not. Scheduling reserves capacity. An active source's draft revision does not consume an additional slot. Enforce capacity atomically when entering a slot-consuming state; restored archived sources enter paused and therefore must acquire a slot before restoration succeeds.
- Approved voluntary downgrade behavior (Q11b): before a voluntary downgrade, require admins to archive enough capture sources to fit the new plan's slot limit, including published Gmail sources when moving to Free. Preserve source data and clearly identify the affected sources. Revalidate against the effective target plan and downgrade timing in the existing billing flow. Involuntary entitlement changes require a separate policy decision.
- Approved exhausted lead-capacity behavior (Q11c): continue accepting eligible submissions into Intake Review when monthly new-lead capacity is exhausted. Block creation of new CRM leads until capacity resets or the workspace upgrades, with a clear capacity warning for staff. Queued items require review and are not automatically approved when capacity returns. Keep existing abuse/storage safeguards and enforce the shared admission check atomically, including website submissions racing for the last slot. A visitor success response requires durable receipt of the intake item.
- Approved entitlement-loss behavior (Q11d): when an effective billing change removes access to capture sources, stop new intake for affected sources, preserve leads/pending reviews/history, and notify admins to resolve access. Scheduled launches must not bypass the block. Access restoration does not automatically relaunch sources; require explicit relaunch with readiness and entitlement checks. Align billing-state transitions with the existing billing system. If only the slot limit is exceeded, define a deterministic affected-source selection policy before integration rather than choosing sources silently.
- Approved forced slot-reduction selection (Q11e): if an involuntary plan change leaves more published sources than allowed, stop intake for all published sources until an admin chooses which sources to retain within the new limit. Preserve data and pending reviews. Show the capacity/access block explicitly rather than treating a paused source as slot-free; reconcile retained versus archived sources and require explicit relaunch without automatically activating the retained selection. Scheduled launches remain blocked until resolved.
- Approved dashboard basics (Q12a): show Captured to date, Awaiting review now and Approved to date, with source status and a direct Intake Review link. Valid website submissions that create leads immediately count as approved. Captured counts unique accepted inbound source items, including possible duplicates but excluding delivery retries; Awaiting review counts undecided intake items; Approved counts each successfully approved item once, including reviewed duplicate link/update dispositions. Persist automatic website acceptance distinctly from human approval for audit. Advanced charts and date filters are deferred.
- Approved source list (Q12b): support name search, source-type and status filters, and a separate Archived view. Each row shows source name, type, status, captured count and last activity. Follow prototype screen 17, adapting terminology and controls to current shared components and permissions. Keep paused sources in the normal view.
- Approved assistant scope (Q13): provide setup suggestions, draft configuration changes, source summaries and explanations of items needing review. Require explicit in-app confirmation for saving changes, launching sources and deciding intake items; conversational agreement is not a substitute. Enforce current actor/record permissions and bind confirmations to current versions. Integrate assistant behavior after the approved pages are connected, while preserving the previously approved sample-based mapping suggestions as part of the completed release.
- Deferred assignment workflows (Q9a): add the ability to configure automatic lead assignment based on a set of predefined requirements/conditions. The condition types, rule ordering, conflicts, fallback assignment and configuration experience require later design and approval. Keep current assignment configuration extensible for this capability without implementing its builder or rule engine in the first release.

## Existing evidence and discrepancies

- `prototype/prototype-screen-17-campaigns.html`: list, status filters, archived view, lifecycle controls.
- `prototype/prototype-screen-18-source.html`: naming and website/Gmail source selection.
- `prototype/prototype-screen-19-website-brief.html`: business brief, field suggestions and intake plan.
- `prototype/prototype-screen-20-form-editor.html`: field editor and visitor preview.
- `prototype/prototype-screen-22-gmail-scope.html`: Gmail connection and scope.
- `prototype/prototype-screen-23-gmail-rules.html`: currently redirects through gmail-field-mapping to gmail-workflow; it is not a standalone rules design. The sample-assist modal in `prototype/prototype-screen-19-website-brief.html` supplies the existing phrase/location pattern. The gmail-preview and gmail-field-mapping files also redirect to gmail-workflow.
- `prototype/prototype-screen-23-gmail-workflow.html`: post-approval configuration.
- `prototype/prototype-screen-25-campaign-review.html`: approval, launch and publication instructions.
- `prototype/prototype-screen-26-intake-review.html` and `27-intake-detail.html`: queue, evidence, edits and duplicate decisions.
- `prototype/prototype-screen-28-campaign-dashboard.html`: source health and metrics.
- `docs/user-journeys.md` and `docs/campaign-dashboard.md` previously place website and Gmail in Phase 1. Advanced follow-ups, job conversion, external destinations and expanded analytics are deferred there, despite appearing in prototypes.
- Older documents describe Owner/Admin/Member access. The current permission catalog uses Owner/Admin/Office/Field; Office currently has default read/create/update/activate/pause access, while archive defaults to Owner/Admin. Resolve this explicitly before changing access.
- Existing billing defines concurrent published-source limits (Free 1, Standard 5, Premium unlimited). Gmail is documented as Standard/Premium. Lead creation already has a shared admission boundary; capture must reuse it.
- Navigation currently uses `campaigns` and `/campaigns`; authorization, billing and lead provenance also contain technical campaign identifiers. These require compatibility planning rather than unchecked text replacement.

## First-release scope

Approved source scope: website forms/shareable links and Gmail intake, with website capture implemented first (Q1, October 28, 2026). Website sources provide an embeddable form and hosted link. Gmail uses an explicitly connected account, visible phrase rules, confirmed field mapping and a tested representative sample, then supervised Intake Review. Detailed behaviors remain subject to the decisions below.

Shared features: drafts, setup review, immediate or scheduled launch, duplication into a new draft, source status, list/dashboard, pause/resume, archive/restore, assignment, initial lead stage/tags, owner notification and source provenance. Scheduling (Q10a) and duplication (Q10b) are approved for the first release; reusable templates are deferred (Q10c).

Keep follow-up sequences, automatic Gmail approval, round robin, conditional assignment workflows, external delivery, automatic job conversion and advanced analytics out of the proposed first release. Conditional assignment workflows will later allow automatic assignment based on predefined requirements. Do not build their controls from the prototypes until separately approved.

## Decisions to review sequentially

Ask only the next unresolved question. Record answers here before proceeding.

| ID | Decision | Proposed starting point | Status |
| --- | --- | --- | --- |
| Q1 | First-release source scope | Website/shareable links and Gmail; website first | Approved October 28, 2026 |
| Q2 | What one configured item is called | Lead Capture is the section; call an individual item a capture source, with Create capture source as the action | Approved October 28, 2026 |
| Q3 | Rename technical references and compatibility | New code/routes use lead-capture naming; migrate stored permission/billing/provenance references with explicit compatibility for old data/links | Approved October 28, 2026 |
| Q4 | Access by current roles | Owner/Admin/Office can view/create/edit/launch/pause/resume/archive; Field has no access by default; retain configurable permissions | Approved October 28, 2026 |
| Q5 | Website admission and duplicate behavior | Valid website submissions create leads immediately; possible duplicates and accepted submissions needing corrections go to Intake Review; Gmail requires review | Approved October 28, 2026 |
| Q6 | Form field capabilities and visitor experience | Default fields/settings (Q6a), custom fields/answers (Q6b), success message (Q6c), paused unavailable state (Q6d), privacy/consent (Q6e) and spam protection (Q6f) approved | Approved October 28, 2026 |
| Q7 | Gmail account, scope, matching, mapping and examples | Account (Q7a), scope (Q7b), matching (Q7c), reviewed mappings/evidence (Q7d) and required reviewed retained sample without lead creation (Q7e) approved | Approved October 28, 2026 |
| Q8 | Intake Review actions and duplicate handling | All three duplicate dispositions with change review/no automatic merging (Q8a), and correction/approve/dismiss with visible original evidence and required-field enforcement (Q8b) approved | Approved October 28, 2026 |
| Q9 | Default assignment, stages, tags and notifications | Assignment (Q9a), existing starting stages/tags defaulting to New/no tags (Q9b), and assigned-teammate notification enabled by default using existing preferences (Q9c) approved; conditional workflows and round robin deferred | Approved October 28, 2026 |
| Q10 | Lifecycle and first-release extras | Immediate/scheduled launch (Q10a), duplication (Q10b), template deferral (Q10c), archive/restore (Q10d) and reviewed draft revisions while the approved configuration runs (Q10e) approved | Approved October 28, 2026 |
| Q11 | Capacity and subscription behavior | Slot states (Q11a), voluntary downgrade cleanup (Q11b), intake at the monthly lead limit (Q11c), entitlement loss (Q11d) and admin selection with all published intake blocked after forced slot overflow (Q11e) approved | Approved October 28, 2026 |
| Q12 | Dashboard and list | Basic dashboard metrics/status/review link (Q12a) and searchable/filterable source list with separate Archived view and approved row fields (Q12b) approved | Approved October 28, 2026 |
| Q13 | Assistant scope | Setup suggestions, draft configuration changes, summaries and review explanations; explicit in-app confirmation for saves, launch and intake decisions; integrate after connected pages | Approved October 28, 2026 |
| Q14 | Approve implementation order | Navigation rename → individual Storybook components → composed page stories → backend/page connections → assistant integration; review after each item | Approved October 28, 2026 |

## Proposed component delivery order

Each numbered item is its own implementation and approval checkpoint. Refine boundaries after decisions; reuse existing controls, metric cards, dialogs and layout rather than rebuilding them.

1. Existing workspace navigation rename: Lead Capture label, accessible copy, story expectations and role visibility.
2. Capture-source list toolbar: search, status/source filters and Archived view.
3. Capture-source list: rows, status, available actions, empty/loading/error/permission states.
4. Setup progress/header: draft identity, steps, back/save/continue, unsaved changes.
5. Source selection: name, website/Gmail choice and entitlement state.
6. Website brief: business context and editable suggested intake fields.
7. Form field editor: approved field types, ordering, required/optional settings and validation.
8. Visitor form: accessible responsive fields, submit, validation, pending/success/unavailable states.
9. Form preview: render the same visitor form from the draft configuration.
10. Gmail account: select/connect one email account, reconnect and handle connection failures. Check incoming email for that account; no Inbox/label controls.
11. Gmail matching rules: phrase input, matching location and AND/OR behavior.
12. Assistant-guided Gmail field setup, delivered for component review in order: (12a) paste example and extraction state; (12b) findings with the assistant as the main experience and editable field cards alongside it, including guided add-field questions and explicit mapping approval.
13. Integrate representative sample testing, matched phrases, proposed values and source evidence into the findings screen; this is not a third setup screen.
14. Post-approval workflow: assignment, stage, tags and approved notification behavior.
15. Final setup review: source, rules, destination, workflow, readiness and explicit launch approval.
16. Publication instructions: hosted link, embed snippets, copy feedback and public availability.
17. Source lifecycle review: pause/resume/archive/restore and any approved scheduling/duplicate/template operations, delivered individually if distinct components are needed.
18. Dashboard summary: reuse metric cards; source state, three approved metrics and review drill-down.
19. Source settings/details: current approved configuration, publication/connection state and edit access.
20. Intake queue toolbar and list: deliver separately; review flags, source/status filters and authorized actions.
21. Intake source evidence: email/submission content rendered as untrusted data, with extraction evidence.
22. Intake proposed-lead editor: corrections, required fields and uncertainty flags.
23. Duplicate decision: permitted existing lead context and explicit disposition.
24. Intake decision review: approve/dismiss, capacity/conflict feedback and retry state.

Use colocated `.tsx`, `.data.ts`, and `.stories.tsx` under `apps/web/src/features/lead-capture/` or `features/intake/`; shared primitives stay in `packages/ui`. Keep copy in data files and styling in Tailwind classes. Storybook callbacks are mocked until integration.

## Page assembly and connection

After component approvals, deliver each composed page story for review: source list; website setup; Gmail setup; final review/publication; source dashboard/settings; Intake Review queue; intake detail. Confirm whether setup is one routed wizard or separate routes during planning.

Then integrate incrementally, with a review/checkpoint for each slice:

1. Define strict contracts and persisted records: tenant, source identity/type/status, versioned drafts/approved configuration, publication identity, Gmail account/cursor, retained sample, intake decision/evidence and audit events. Final tables and migrations follow approved decisions.
2. Implement authorized draft CRUD and source list/detail queries; bind the approved list/setup pages. Enforce tenant and record access on the server.
3. Implement version-bound approval/publication and capacity reservation atomically. Define concurrent launch and downgrade behavior before shipping.
4. Implement actual public form hosting and embedded submission (explicit follow-up approved October 29, 2026). Provision the real public origin/domain and stable publication URLs; serve the approved visitor form at the hosted route and through iFrame/JavaScript embedding, including the embed loader. Generate installation artifacts from the real publication identity instead of the reserved example-domain fixtures. Render only the approved configuration, apply published revisions to the same form identity, and enforce active/scheduled/paused/archived/access-blocked availability on the server. Connect submissions with server validation, consent handling, abuse limits and retry deduplication; create leads through the shared admission use case or retain accepted items in Intake Review, preserving immutable source provenance. Verify hosted and embedded end-to-end flows before calling publication functional. Storybook instructions alone do not implement hosting.
5. Implement Gmail OAuth and token lifecycle, minimal approved scopes, ingestion jobs, cursor recovery and deduplication by account/message identity. Confirm provider setup and consent requirements before integration. Do not mark simulated connections as working.
6. Implement authorized Intake Review, atomic approve/dismiss/duplicate disposition, optimistic concurrency and retry safety. Apply approved assignment/stage/tags and notifications once.
7. Bind dashboard aggregates to persisted source/intake events. Captured excludes transport retries; Approved counts an intake item once; Awaiting Review reflects undecided items.
8. Complete lifecycle semantics: website unavailable state, Gmail pause/resume backlog, archive history and explicit restore review; include approved extras only.
9. Integrate assistant tools after pages work: authorized reads and reviewed proposals, current configuration binding, audit and provider failures. Treat captured content as untrusted input.
10. Finish the reference migration: product copy, prototypes, active docs, permission labels, billing wording, assistant/help corpus, tests and scripts. Track intentional compatibility aliases; update knowledge versions where required. Preserve historical evidence rather than silently rewriting recorded events.

## Verification and approval record

For each UI item: default, empty, loading, error, disabled/permission and relevant pending/conflict states; keyboard/focus behavior, accessibility, narrow/wide layouts and targeted interactions. Run relevant lint and type checks, and build checks appropriate to the delivered slice. Record the exact story, evidence, limitations and user approval before the next item.

For integration: tenant isolation, role grants, capacity races, ingestion retries, duplicate approval, stale edits, public abuse, unsafe email markup, pause/archive enforcement and atomic lead/notification behavior. Exercise real website submission and provider-backed Gmail flows separately from mocked stories.

Q1–Q14 are approved. Conditional automatic assignment workflows and reusable templates are explicitly tracked as deferred scope.

### Item 1 — navigation rename: approved

The shared navigation now displays Lead Capture and uses `/lead-capture` as its preview href. Added LeadCapture, LeadCaptureMobile and LeadCaptureComingSoon stories; updated the denied-capability story and authorization check script to assert the new label. The application still presents the module as Coming soon until page integration.

Compatibility staging: the navigation ID remains `campaigns` for now because current server-resolved navigation permissions use that key. Rename it alongside the authorization catalog, policy/data migration and consumers during the approved integration step. Legacy route redirects and other product references remain in that migration scope; this item is the shared navigation component only. Office archive access is approved in the plan and will be implemented with permission migration, not represented as completed by these navigation stories.

Validation: targeted ESLint, UI typecheck and UI TypeScript build passed. Sixteen browser checks across 1440px and 320px passed for Lead Capture, mobile, Coming soon, Owner, Admin, Office, Field and denied-capability stories: story interactions, role visibility, keyboard activation/focus, Axe WCAG checks and horizontal-overflow checks. Inspected desktop/mobile screenshots. The pre-existing Storybook on port 6006 had stale optimized dependencies; a fresh instance on port 6007 served the verified review stories.

Review: `http://127.0.0.1:6007/?path=/story/workspace-workspacenavigation--lead-capture`, plus `lead-capture-mobile` and `lead-capture-coming-soon`. User approved item 1 before work on item 2.

### Item 2 — capture-source toolbar: approved

Added the controlled `CaptureSourceToolbar` under `apps/web/src/features/lead-capture/capture-source-toolbar/`, with colocated copy and stories. Reuses the shared FilterBar and removable filter chips. Supports name search (200-character limit), Website/shareable-link or Gmail source filtering, current-source status filtering, and separate Current sources/Archived views. Paused sources remain in the current view. Switching views preserves search/source and resets status; the archived view fixes status to Archived. Clear all preserves the selected view. All controls honor the disabled state. The host will own authorization, URL persistence, querying and results during page integration; the toolbar currently updates Storybook state only.

Stories: Default, Filtered, Archived, SearchAndFilter, SwitchViews, ClearArchivedFilters, Disabled, Keyboard, LongSearch and Narrow. The archived explanation follows the approved restore-to-paused decision rather than the prototype's older restore-to-draft wording.

Validation: targeted ESLint and web typecheck passed. Storybook production test build passed, with module-level `use client` bundling warnings. Thirty browser checks across 1440px, 768px and 320px passed, covering all ten stories, interactions, Axe WCAG accessibility and horizontal overflow. Native keyboard checks confirmed view-to-search tab order and visible focus; story checks verified chip-removal/clear focus recovery, filter payloads, view transitions and disabled callbacks. Inspected desktop/mobile filtered-state screenshots.

Review: `http://127.0.0.1:6007/?path=/story/lead-capture-capturesourcetoolbar--default`, plus `filtered`, `archived` and `narrow`. User approved item 2 before work on item 3.

### Item 3 — capture-source list: approved

Added `CaptureSourceList` with colocated data and stories under `apps/web/src/features/lead-capture/capture-source-list/`. Reuses the shared DataTable and StatusBadge: desktop table and narrow-screen cards show source name/type/status, captured count, pending review count when nonzero and last activity in the supplied business timezone. Current/archived views remain distinct. Includes empty, filtered-empty, archived-empty, loading, retryable error, permission-denied, read-only, restricted-action and per-row pending states.

Record-level allowed actions are intersected with lifecycle state: drafts offer Continue setup; active sources offer Edit setup/Pause; paused sources offer Edit setup/Review and resume; scheduled sources offer Edit setup; archived sources offer Review and restore. Duplicate and Archive appear where eligible and permitted. Source names open details. Pending rows disable navigation/actions. No read permission renders only a denial without record content. Callbacks request setup/review flows; actual confirmations, mutations, version checks and authoritative server permissions are deferred to their approved integration steps. No extra child component or full page has been started.

Stories: Default, Archived, LifecycleActions, ReadOnly, RestrictedActions, Pending, PermissionDenied, Loading, Error, Empty, NoMatches, ArchivedEmpty, LongContent, Keyboard and Narrow.

Validation: targeted ESLint, web typecheck and Storybook production test build passed (module-level directive bundling warnings). Forty-five browser checks across 1440px, 768px and 320px passed for all fifteen stories: interaction callbacks, state-dependent action eligibility, archived separation, permissions, retry, disabled pending actions, Axe WCAG checks and horizontal overflow. Verified native keyboard focus and story keyboard activation/tab order. Inspected desktop table and mobile-card screenshots.

Review: `http://127.0.0.1:6007/?path=/story/lead-capture-capturesourcelist--default`, plus `archived`, `read-only`, `pending`, `error` and `narrow`. User approved item 3 before work on item 4.

### Item 4 — setup progress/header: approved after visual revision

Added `CaptureSetupHeader` with colocated data/stories. Follows prototype screen 18's three steps: Choose source, Set up intake, Review & launch. Shows source identity, source type, Draft/Draft revision status, step position, back/list navigation, Save draft and Continue. Earlier completed steps are navigable; future/current steps are not clickable. Read-only users have no edit/continue controls. The final step leaves launch controls to the separately approved final-review component. A draft revision explains that the approved configuration remains live.

Reuses StatusBadge, FormFeedback and ConfirmDialog. Dirty back/list/step navigation requires explicit discard confirmation, with Keep editing focused initially. Dirty/pending state installs browser unload protection. Save rejects preserve dirty state and show retry feedback; an in-flight guard prevents duplicate saves and locks navigation/controls. The host owns form validation, successful-save dirty/version updates, actual navigation and persistence. Continue requests host validation and advancement; it never publishes a source. All callbacks remain mocked in Storybook.

Stories: Default, WebsiteIntake, GmailReview, DraftRevision, SaveDraft, SaveError, Saving, Pending, ReadOnly, BlockedContinue, Continue, StepNavigation, KeepEditing, DiscardChanges, UnsavedReview, LongName and Narrow.

Validation: targeted ESLint, web typecheck and Storybook production test build passed (module-level directive bundling warnings). Browser checks cover all seventeen stories across 1440px, 768px and 320px: save success/failure/in-flight locking, callbacks, discard/cancel, dialog initial focus, unload protection, Axe WCAG accessibility and horizontal overflow. Native keyboard checks confirm tab order and visible focus. Desktop/mobile and discard-dialog screenshots inspected; corrected primary-button text styling and step-marker sizing during visual QA.

Review: `http://127.0.0.1:6007/?path=/story/lead-capture-capturesetupheader--website-intake`, plus `draft-revision`, `unsaved-review`, `save-error` and `narrow`. Pause for user approval before item 5 (source selection).

#### Item 4 visual revision — approved

User requested the same design inspiration as existing app headers with steps. Restyled the header using `onboarding-step-frame` and `estimate-creation-flow` as the direct references: a compact horizontal progress row with numbered circles and bottom rules; filled active marker, lighter completed markers and muted upcoming steps; step count/title/description beneath progress; and a divided action footer that stacks controls on narrow screens. Removed the boxed progress panel and large step tiles. Preserved source identity, draft/revision status, permission/pending behavior, save handling and discard confirmation. Step changes now focus the heading, following the existing flows.

Repeated lint, web typecheck and Storybook production test build after the styling changes. Rechecked story interactions, keyboard/unload protection, Axe accessibility and responsive layouts, with an explicit assertion that the three steps remain in one horizontal row. Desktop screenshots inspected against the established pattern; mobile review uses stacked marker/label content within that same horizontal row. User approved the revised item 4 before work on item 5.

### Item 5 — source selection: approved

Added `CaptureSourceSelection` with colocated data/stories, following prototype screen 18 and the existing registration plan-selection card pattern. Reuses the shared TextField for the required capture-source name, retaining the prototype's 80-character input limit. Native radio cards offer Website or shareable link and Gmail inbox, with matching explanations of immediate website lead creation versus supervised Gmail intake. Supports server-supplied field errors and read/view permissions, pending controls, Gmail available/upgrade-required/loading/unavailable states, and an optional Review plans callback.

Access is supplied by the host as an entitlement capability rather than inferred from a displayed plan name. An unavailable Gmail option cannot be selected; a previously selected Gmail source remains visible and checked with corrective feedback rather than silently changing the draft. Website remains available while Gmail access is loading. Source selection does not connect accounts, save, publish or consume a published-source slot. The approved header owns Save/Continue; integration will enforce name/source validation and capability checks again and guard navigation to plan review.

Stories: Default, Website, Gmail, EditSelection, FreePlan, StaleGmailSelection, LoadingAccess, GmailUnavailable, ReadOnly, Pending, PermissionDenied, ValidationErrors, NameLimit, Keyboard, LongName and Narrow.

Validation: targeted ESLint, web typecheck and Storybook production test build passed (module-level directive bundling warnings). Browser verification covers all sixteen stories at 1440px, 768px and 320px: controlled name/source payloads, exclusive radio selection, plan gates, stale selection retention, pending/read-only/view denial, validation presentation, name limit, native radio keyboard navigation/focus, Axe accessibility and desktop-card/mobile-stack layouts. Desktop screenshot inspected; narrow layouts checked separately. No full page or next component has been started.

Review: `http://127.0.0.1:6007/?path=/story/lead-capture-capturesourceselection--website`, plus `gmail`, `free-plan`, `validation-errors` and `narrow`. User approved item 5 before work on item 6.

### Item 6 — website brief: approved

Added `WebsiteCaptureBrief` with colocated copy/stories. Uses prototype screen 19's brief, suggested-field review and intake-plan concepts, adapted to the approved website scope. Shows business context (name, services and service area), an editable brief, field suggestions with type/requirement/reason, explicit Use suggested fields acceptance, and a concise SalesMora destination/publication/admission summary. Reuses the app's MUI multiline field conventions, FormFeedback and StatusBadge. The approved six default fields are represented in fixtures, including the shared email-or-phone requirement.

Suggestion generation and acceptance are separate controlled callbacks. Each suggestion has an identity and the exact brief it was prepared against. Changing the brief disables acceptance of stale suggestions until refreshed; a host-accepted suggestion is identified by ID rather than object identity. Pending/error/validation states block acceptance and preserve the brief/current draft. Supports read-only, no-read permission, missing context, empty and long-content states. No publication, AI provider call, save or lead creation is implemented here.

The current prototype mixes Gmail sample extraction, round robin and follow-up choices into its website brief. Those controls were not carried into this component: Gmail mapping and sample review have their own approved components, workflow controls are item 14, and round robin/follow-ups remain deferred. Detailed edits to suggested field labels/order/requirements belong to item 7 (field editor), avoiding two competing editors. The website brief accepts a reviewed field proposal into the host draft; later page integration connects it to that editor.

Stories: Default, Empty, SuggestFields, AcceptFields, StaleSuggestions, Accepted, Pending, Error, ReadOnly, PermissionDenied, NoBusinessContext, ValidationError, LongContent and Narrow.

Validation: targeted ESLint, web typecheck and Storybook production test build passed (module-level directive bundling warnings). Forty-two browser checks across 1440px, 768px and 320px passed for all fourteen stories: controlled callbacks, explicit acceptance, stale-proposal refresh, pending/error/read-only/view-denial behavior, Axe WCAG accessibility and horizontal overflow. Native keyboard checks confirmed textarea-to-actions tab order and visible focus. Inspected desktop/mobile screenshots.

Review: `http://127.0.0.1:6007/?path=/story/lead-capture-websitecapturebrief--default`, plus `empty`, `stale-suggestions`, `error` and `narrow`. User approved item 6 before work on item 7.

### Item 7 — form field editor: approved after revisions

Added `CaptureFormFieldEditor` with colocated copy, stories and configuration validation. Follows prototype screen 20's field editing and the existing estimate-items editor's controlled updates, move controls and focus recovery. Supports editable labels, per-field required settings, add/remove and keyboard-accessible ordering, the six standard lead fields, and custom short text/long text/dropdown/checkboxes/date fields. Standard field types retain their CRM mapping; custom types can be changed. Dropdown/checkbox fields have editable choices with stable IDs. Field and choice IDs survive label edits; re-adding a removed field creates a new identity. Draft choices are retained when switching to a non-choice type and ignored for that type.

Defaults retain required Name/Service requested, the shared email-or-phone requirement, optional project details/address and optional individual email/phone fields. Admins can change per-field requirements and the shared contact requirement. A form requiring contact must retain at least one mapped Email or Phone field. The editor does not write lead records; authoritative validation and routing of incomplete submissions remain integration responsibilities.

Configuration checks cover nonempty labels, unique field/choice identities, duplicate standard mappings, missing contact fields, empty forms and distinct case-insensitive choice labels. Draft editor bounds are 50 fields, 2–50 choices for choice fields and 60-character field/choice labels; these must be reflected in future authoritative contracts. Error summaries are available through `showErrors`, with touched-field feedback for labels/choices. Read-only, pending and no-read states enforce presentation capabilities. Add/remove/reorder recovers keyboard focus and field ordering changes are announced. The approved header owns draft save/continue; visitor rendering and preview remain items 8–9.

Stories: Default, EditLabel, Reorder, RemoveAndRestore, CustomTypes, ChoiceOptions, Requirements, Invalid, Empty, Pending, ReadOnly, PermissionDenied, FieldLimit, LongContent and Narrow.

Validation: targeted ESLint, web typecheck, six configuration-validation unit tests and Storybook production test build passed (module-level directive bundling warnings). Forty-five browser checks across 1440px, 768px and 320px passed for all fifteen stories: edit payloads, ordering/focus recovery, field re-add identity, all custom types, choice identity on rename/removal, required/contact settings, errors, pending/read permissions, limits, Axe WCAG checks and horizontal overflow. Native keyboard checks verified move actions and focus rings. Inspected desktop and mobile editor screenshots.

Review: `http://127.0.0.1:6007/?path=/story/lead-capture-captureformfieldeditor--default`, plus `choice-options`, `invalid` and `narrow`. Pause for user approval before item 8 (visitor form).

#### Item 7 desktop row revision — approved with final editor revision

User requested field name, type and Required on the same desktop line. Moved these controls into one row at the app's desktop breakpoint; narrow screens retain a vertical layout. Field type now uses the existing MUI native-select conventions and shared field classes, aligning its floating label/input with the shared field-label input. Required stays aligned with the inputs when validation adds helper text. Rechecked lint and web types, plus eighteen targeted browser cases across 1440px, 768px and 320px for default/custom/reorder/invalid/pending/narrow stories. Checks included explicit desktop alignment and narrow stacking, keyboard/focus, interactions, Axe accessibility and overflow. Item 7 remains awaiting user approval; visitor form work has not started.

#### Item 7 left-side actions and selectable types — approved

User requested vertically stacked up/down/delete icon buttons to the left of each field box and reported that dropdowns could not be selected. Moved field actions outside the fieldset into a left-side column, using existing MUI arrow/delete icons exposed through the shared UI icon exports. Each action retains its accessible name, hover title, 44px target, pending/boundary disabling and focus recovery.

The lead-field type selectors had been explicitly disabled. They are now enabled when editable, with compatible formats that preserve the original CRM mapping: Name short/long text; Email email; Phone phone; Service requested short text/dropdown; Project details short/long text; Service address address/short/long text. Custom fields retain all five approved formats. Configuration validation rejects incompatible mappings. Added LeadFieldTypes interaction coverage for enabled selectors and stable identity/mapping after type changes, plus a seventh unit test for format compatibility. Actual lead submission and persistence remain future integration work.

Validation: forty-eight browser cases across 1440px, 768px and 320px passed, including explicit vertical/left positioning of the icon actions, SVG presence, reorder/remove behavior, supported lead-field type changes, pending/read permissions, keyboard focus, Axe accessibility and responsive layouts. Lint, shared UI/web types, seven validation tests and Storybook build passed. Desktop/mobile screenshots inspected. User approved the final editor revision before item 8.

### Item 8 — visitor form: approved

Added `VisitorCaptureForm` with colocated copy/stories and visitor-answer validation. Renders the approved field definitions in order, including short/long text, mapped email/phone/address fields, native dropdown/date controls and checkbox choices. Uses shared form styling, FormFeedback and SubmitButton. A centered responsive public form displays business name, configurable title/intro/submit text, privacy link and optional/required consent. There is no CRM navigation or staff-only content.

Client checks enforce configured requirements, shared email-or-phone admission, email validity using the existing lead schema, mapped field lengths, calendar dates and known/unique choice IDs. Errors focus the first affected control and preserve entered data; successful durable receipt replaces controls with the configured in-place thank-you message and focuses its receipt. Paused/blocked or invalid-definition states hide submission controls and show the configured unavailable message/public business contact details. Unsafe privacy URLs are never rendered as links.

Submission callbacks carry published definition ID/version, whitelisted normalized answers keyed by stable field/choice IDs, versioned consent choice, a hidden bot-trap value and an idempotency key. Identical retries reuse the key; pending submissions reject duplicate attempts and lock controls. Changing the published definition starts a fresh internal UI session so old asynchronous results cannot update the new form. The host must reset controlled answer state when changing source/definition. An ok result means durable receipt, including receipt into Intake Review, not necessarily creation of a CRM lead.

Stories use mocked callbacks only: no public route, saved submission, lead creation, provider call or live publication has been connected. Server-side published-version binding, field/consent validation, bot/rate/storage gates, conditional challenge handling, transaction-safe deduplication and the shared lead-capacity/admission boundary remain required integration work before public launch. Privacy and consent wording/version evidence must be recorded from the authoritative published definition on that boundary.

Stories: Default, PhoneOnly, SuccessfulSubmit, Submitting, NetworkError, ServerFieldError, RetrySameRequest, RequiredFields, InvalidEmail, AllFieldTypes, CustomFieldSubmission, PrivacyAndConsent, ConsentRequired, Paused, ServerUnavailable, InvalidConfiguration, LongCopy and Narrow.

Validation: targeted ESLint, web typecheck, seven visitor-validation unit tests and Storybook production test build passed (module-level directive bundling warnings). Fifty-four browser cases across 1440px, 768px and 320px passed for all eighteen stories: phone-only admission, client/server errors, success/focus, pending duplicate prevention, preserved answers, retry-key reuse, custom choices/dates, consent, unavailable states, Axe WCAG accessibility and overflow. Nine additional checks verified final rounded field-focus styling and representative form/consent layouts. Inspected desktop/mobile screenshots.

Review: `http://127.0.0.1:6007/?path=/story/lead-capture-visitorcaptureform--default`, plus `all-field-types`, `privacy-and-consent`, `successful-submit`, `paused` and `narrow`. Pause for user approval before item 9 (form preview).


### Item 9 — form preview: approved with revisions

User approved the visitor form and requested continuing. Built `CaptureFormPreview` from the customer-preview panel in `prototype/prototype-screen-20-form-editor.html`, rendering the existing visitor form directly from its draft definition.

- Desktop/mobile controls preserve test answers and receipts. Mobile uses phone padding independently of the staff viewport; the visitor form's default responsive appearance is unchanged.
- Clearly labeled, in-memory test submissions exercise the same validation and thank-you screen. The component accepts no external submission callback and creates no lead, provider request or persisted draft.
- Preview accepting requests or the paused message with public business contact details. These controls change only the preview.
- Reset clears answers, errors and receipts. Draft changes reset the session even when the draft ID/version is unchanged, preventing stale test responses.
- Read permission hides the source content. Invalid drafts show staff feedback and the visitor unavailable state.
- Twelve stories cover desktop/mobile, size switching, test receipt, reset, paused/resumed previews, same-version draft updates, invalid configuration, denied access and long/narrow content.

Validation: all thirty-six story/browser cases passed across 1440px, 768px and 320px, including interaction plays, Axe accessibility and overflow checks. Keyboard mode switching and the mobile frame (384px maximum with phone padding) passed explicit checks. Desktop/mobile screenshots inspected. Lint, web type checking and Storybook production build passed.

Review: `http://127.0.0.1:6007/?path=/story/lead-capture-captureformpreview--default`, plus `mobile`, `test-submission`, `paused-preview` and `draft-change`. Pause for user approval before item 10 (Gmail account and scope).


### Item 9 revision — editable form title and introduction: awaiting review

User requested editing the default “Tell us about your project” title and “Share a few details and our team will follow up with you.” introduction during form creation. Added a controlled `CaptureFormContentEditor`, following the title/description controls in `prototype/prototype-screen-20-form-editor.html`. Its required title validates on blur/review; the introduction is optional and may be cleared. Both fields obey read/edit permissions and pending state.

The default `CaptureFormPreview` story now places this editor beside the preview, sharing one draft text value so changes appear immediately. Narrow layouts stack the editor and preview. No submission, save or publication is introduced; full-page integration remains in the approved later phase. Stories cover editing both values, blank-title validation, removing the introduction, read-only/pending/denied states and live preview updates.

Validation: thirty browser cases passed across 1440px, 768px and 320px, covering interaction plays, Axe accessibility and overflow checks. Desktop and narrow screenshots reviewed. Lint, web type checking and Storybook production build passed.

Review: `http://127.0.0.1:6007/?path=/story/lead-capture-captureformpreview--default` or `lead-capture-captureformcontenteditor--default`. This revision remains within item 9; pause for approval before Gmail work.


### Item 9 revision — editable paused message: awaiting review

User requested editing paused text as well as the title/introduction. Added a multiline Paused message control to the same controlled form-text draft and connected it to the visitor definition in the live-preview story. The paused preview updates while typing, retains public business contact information and keeps submissions unavailable. Clearing the text (including whitespace-only text) uses the standard contact message, as described beside the control. The new control follows the existing pending/read-only/read-permission behavior. Dedicated stories verify draft updates, live paused rendering and the fallback.

Validation: thirty-six interaction/accessibility/overflow browser cases passed at 1440px, 768px and 320px. Desktop/mobile screenshots reviewed. Lint, web type checking and Storybook production build passed.

Review the default form preview and select Preview state → Paused message, or open `lead-capture-captureformpreview--editable-paused-message`. Pause for approval before the next component.


### Item 9 revision — optional paused business contacts: awaiting review

User clarified that the email/phone checkboxes control business contacts shown in the paused message, rather than customer-input fields. Added independent Show business email / Show business phone checkboxes below Paused message. Both are initially selected to preserve the existing preview; the user can show either, both or neither. The controlled draft carries explicit visibility flags into the visitor definition, preserving the business contact values when hidden. Older definitions without flags keep their existing display behavior.

The controls respect edit/read/pending permissions. The paused message remains visible with neither contact selected. These settings do not remove or change customer email/phone fields, requirements or submission behavior. Stories verify all four visibility combinations, toggling back on, preserving the message, unaffected customer fields, and disabled/read-denied states.

Validation: twenty-four browser cases passed across 1440px, 768px and 320px, covering interactions, Axe accessibility and overflow. Phone checks passed on rerun after a story-loading timeout during compilation. Lint, web type checking and Storybook production build passed; desktop/mobile screenshots reviewed.

Review: `http://127.0.0.1:6007/?path=/story/lead-capture-captureformpreview--default` (select Paused message), or `lead-capture-captureformpreview--optional-paused-contacts`. Pause for approval before the next component.


### Item 10 — initial Gmail account and scope: superseded by account-only revision below

User approved item 9 including editable form text/paused message and optional business contact checkboxes. Added controlled `GmailCaptureScope` with copy and stories, based on `prototype/prototype-screen-22-gmail-scope.html` and the approved Q7a/Q7b decisions.

- One selected account per source, with connect/reconnect callbacks, connection status, pending/failure states and account-load retry. Reconnecting the same account retains scope/label; changing the selected account clears both and requires a fresh scope choice.
- Explicit Inbox messages or Messages with a label selection. The prototype's recipient-address scope is excluded because it was not approved for the first release.
- Label loading, error/retry, empty and removed-label states. Label resources carry their account identity; mismatched responses are never offered to the newly selected account. Unavailable saved selections stay visible with corrective feedback rather than silently changing the draft.
- Read/edit permissions and resolved Gmail entitlement states control interactions. Read-denied content is hidden. Save/Continue stays with the approved setup header; the host will enforce readiness, authorization and provider identity again at integration.
- Explains read-only intake, no processing before launch, and supervised Intake Review before lead creation. Stories explicitly label connection actions as simulated; no OAuth, tokens, Google permissions or ingestion are implemented here.
- Twenty-five stories cover connection/scope changes, reconnect, provider/list failures and retries, loading, missing selections, stale account/label identity, permissions, entitlements and long/narrow layouts.

Validation: seventy-five browser cases passed across 1440px, 768px and 320px, covering all twenty-five stories, interaction plays, Axe accessibility and overflow checks. Three additional cases verified native keyboard scope selection and focus into the label selector. Desktop/mobile screenshots reviewed. Lint, web type checking and Storybook production build passed.

Review: `http://127.0.0.1:6007/?path=/story/lead-capture-gmailcapturescope--default`, plus `label-scope`, `reconnect-required`, `change-account` and `labels-failure`. Pause for user approval before item 11 (Gmail matching rules).


### Item 10 revision — Gmail account only: awaiting review

User removed the Inbox-versus-label granularity. Revised the current Q7b requirement and simplified this step to one selected/connected email account. Incoming email for that account is checked against matching rules configured in the following step. Removed scope/label draft properties, controls, label resource state and label callbacks. Keep account selection, connect/reconnect, failure/retry, permissions and entitlement states. The selected email address is also displayed in wrapping text so it remains readable on narrow screens.

The existing `GmailCaptureScope` folder/story identifier is retained to keep the current review URL working; visible UI says Gmail account. Earlier scope/label checkpoint details above are historical and superseded. Provider OAuth and ingestion remain deferred to integration; stories simulate connections. Eighteen stories cover the revised account-only behavior and its existing connection/access states.

Validation: all fifty-four browser cases passed across 1440px, 768px and 320px, including interaction plays, explicit keyboard/focus-ring checks, Axe accessibility and overflow. Desktop/mobile screenshots reviewed. Lint, web type checking and Storybook production build passed.

Review: `http://127.0.0.1:6007/?path=/story/lead-capture-gmailcapturescope--default`, plus `connected`, `change-account` and `reconnect-required`. Pause for approval before item 11.


### Item 10 layout revision — account dropdown and Connect on one row: awaiting review

User requested that the email dropdown share a line with Connect and no longer span the card. Grouped the selector and connection actions in a responsive row, using the existing `max-w-sm` (384px) width limit for the field. Controls stack on phones. Account details, status and feedback remain below the row; input helper errors do not move the button out of alignment with the input.

Validation: twenty-four targeted browser cases passed at 1440px, 768px and 320px, checking explicit row alignment/field width, narrow stacking, keyboard focus, Axe accessibility and overflow in the existing default, connected, validation, pending, reconnect, read-only and long/narrow stories. Desktop/phone screenshots reviewed. Lint passed. No behavior or account contract change.

Review the existing `lead-capture-gmailcapturescope--default` story. Item 10 remains awaiting approval before matching rules.


### Item 11 — Gmail matching rules: awaiting review

User approved the simplified Gmail account component and its inline dropdown/Connect layout. Added controlled `GmailCaptureRules` following approved Q7c, the existing subject/body/phrase pattern in prototype screen 19's sample-assist modal, and current shared form/card conventions. The file named gmail-rules currently redirects through field-mapping to workflow, so it supplies no standalone rules layout.

- Add/edit/remove literal phrases with stable draft IDs; choose Subject, Body or Subject or body; choose All phrases (AND) or Any phrase (OR).
- Case-insensitive matching ignores outer spaces while preserving literal punctuation/internal spaces. For subject-or-body, each complete phrase may appear in either field; AND phrases can be distributed across the two fields. A phrase cannot span the subject/body boundary.
- Keep a readable rule summary visible as the draft changes. Blank, duplicate, unsupported or invalid rules show incomplete/error feedback instead of implying that all emails match. Sender/attachment conditions remain outside this release.
- Bound draft lists to 1–20 phrases and 200 characters per phrase. Validate distinct normalized text and unique phrase IDs. These component limits are implementation safeguards to review here and enforce again at integration.
- Read/edit/pending permissions guard controls. Adding/removing phrases preserves keyboard focus. The UI updates local draft state only; no Gmail reads, processing or lead creation occur.
- Colocated pure validation and literal matcher are reusable by the later sample-preview step. Authoritative persisted-rule validation and ingestion remain in the approved integration phase.
- Sixteen stories cover locations, AND/OR, editing and live summary, addition/removal, blank/duplicate/empty lists, limits, permissions, pending and long/narrow content.

Validation: seven matcher/configuration unit tests and forty-eight browser cases passed across 1440px, 768px and 320px. Browser checks covered all sixteen stories, interaction plays, keyboard focus and computed focus rings, Axe accessibility and overflow. Desktop/mobile screenshots reviewed. Lint, web type checking and Storybook production build passed.

Review: `http://127.0.0.1:6007/?path=/story/lead-capture-gmailcapturerules--default`, plus `change-rule`, `add-remove-phrase`, `empty-phrase` and `any-phrase`. Pause for approval before item 12 (Gmail field mapping).


### Item 11 layout revision — form left, summary right: awaiting review

User requested a desktop two-column layout. The matching-rule form now sits on the left and the rule summary on the right from the shared large-screen breakpoint, with both panels aligned at the top. Tablet/phone layouts retain the stacked form-then-summary order. Rule behavior, permissions and validation are unchanged. Item 11 remains awaiting approval before field mapping.

Validation for the two-column revision: twenty-four targeted browser cases passed at 1440px, 768px and 320px, including explicit desktop left/right alignment, tablet/phone stacking, existing interactions, keyboard focus, Axe accessibility and overflow. Desktop/mobile screenshots reviewed. Lint passed.


### Item 11 visual revision — styled rule-summary phrases: awaiting review

User requested better styling for rule-summary items. Replaced plain text list rows with an ordered list of soft-background, bordered cards. Each item has a muted blue numbered circle and stronger phrase text, using existing brand/spacing tokens. Long phrases wrap within each card. The numbers are decorative for assistive technology; the list retains semantic structure. Updated the existing edit-story text selector for the nested phrase span. Rule behavior and the approved left-form/right-summary layout are unchanged.

Validation for styled summary items: twenty-one targeted browser cases passed at 1440px, 768px and 320px, including edit/add/remove interactions, phrase limits, long-text wrapping, left/right or stacked panel layout, keyboard focus, Axe accessibility and overflow. Desktop/mobile screenshots reviewed. Lint passed. Awaiting user approval before field mapping.


### Item 12 — earlier technical mapping preview: superseded by assistant-guided redesign

User approved the matching-rule component and its layout/styled summary revisions. Built controlled `GmailFieldMapping` using prototype screen 19's CRM field / label in email / extracted sample-value pattern. The file named gmail-field-mapping redirects to workflow and supplies no separate mapping layout.

- Review supplied draft suggestions; choose an existing standard/custom lead field, extraction rule and email label, include/exclude mappings, and add/remove rows with stable IDs and focus restoration.
- Extraction supports literal, case-insensitive labels before a colon on the same body line, the entire subject, or the entire body. These explicit rules are locally testable; no regex or freeform AI extraction is executed by this component. AI suggestion generation and registered custom-field creation remain host/integration concerns.
- Each proposed value is paired with original source evidence, safely rendered as text. An expandable original-email section helps correct missing labels. Missing or multiple candidates are visibly flagged; ambiguous candidates are preserved rather than silently choosing the first.
- Explicit per-mapping review is bound to sample identity/version and exact mapping configuration. Edits, exclusion/re-inclusion or sample version/identity changes require fresh review. The future host must version every sample-content change and authoritatively enforce this binding.
- Block review of incomplete/ambiguous rows or invalid email proposals; validate one mapping per target, stable row IDs, required lead targets and an Email-or-Phone mapping. The supplied target catalog is authoritative for available standard/custom fields at this UI boundary; final contracts and server checks remain integration work.
- Up to 50 mappings and 100-character email labels. Pending/read/edit permissions guard inputs; denied readers see no source email. Optional missing mappings can be excluded without fabricating values.
- Twenty stories cover review, destination/label edits, extraction modes, missing/ambiguous values, custom destinations, include/exclude, add/remove/focus, changed or absent samples, duplicate targets, original-source inspection, permissions, pending, unsafe email text and long/narrow content.

Validation: eight extraction/review/configuration unit tests passed. Sixty browser cases passed across 1440px, 768px and 320px, covering all twenty stories, interaction plays, keyboard focus and computed focus rings, Axe accessibility and overflow. Original-email inspection passed after adjusting its multiline-text assertion. Desktop/mobile screenshots reviewed. Lint, web type checking and Storybook production build passed.

Review: `http://127.0.0.1:6007/?path=/story/lead-capture-gmailfieldmapping--default`, plus `review-mappings`, `ambiguous-value`, `changed-sample`, `inspect-source` and `untrusted-email`. Pause for approval before item 13 (Gmail sample preview).


### Approved redesign — two assistant-guided field-setup screens

User approved two screens: (1) paste a typical email and click Extract fields, with a clear agent-working state; (2) review findings through an assistant conversation as the main experience, with editable field cards alongside it. The user approved this direction after discussing simpler alternatives to the technical mapping editor.

The findings screen will show proposed values and source evidence, flag missing/uncertain data, and support edit/exclude/add actions followed by explicit Approve field mapping. Adding fields should prompt one question at a time about meaning, example values and whether the field is required, with contextual consequences such as required missing values blocking approval. Distinguish correcting this example from changing what future emails should extract. Do not silently create business-wide CRM schema or change live configuration. Keep original email text untrusted; conversational agreement does not replace the final in-app approval. Reuse existing assistant UI when composing this screen; wire real agent/server behavior after component/page approval in the established integration phase.

The previous technical mapping editor remains a reference, not the intended default experience. Pasted sample setup comes first; provider-selected examples can prefill the same input during integration under the approved Q7e capability. Sample testing and evidence belong within the findings step rather than a third screen.

### Item 12a — paste email and extract: approved

Added controlled `GmailEmailExample`, using prototype screen 19's pasted subject/body pattern and the approved two-step design. It shows only the current form, with a two-step indicator. Subject is optional; body is required. Extract fields shows a spinner and agent-working explanation while pending, disables editing, prevents repeated extraction and preserves input on failure/retry. Source text and line breaks are passed unchanged to the extraction callback; oversize input is reported without truncation (500-character subject / 20,000-character body UI limits, to enforce again on the server).

The host owns extraction, binding findings to the exact submitted snapshot, and transition to findings. Stories simulate latency, completion and failure; no live assistant/Gmail request, retention, lead creation or mapping approval is implemented here. Read/edit permissions are supplied by the host. The findings component is the next approval checkpoint.

Validation: four input-validation unit tests and forty-two unique browser cases (fourteen stories across 1440px, 768px and 320px) passed. Browser checks included pending/error/retry, duplicate extraction prevention, preservation of original text, input limits, permissions, keyboard focus with computed outline, Axe accessibility and overflow. Tablet/phone checks passed on rerun after a development-page reload interrupted the first pass. Desktop/mobile screenshots reviewed. Lint, web type checking and Storybook production build passed.

Review: `http://127.0.0.1:6007/?path=/story/lead-capture-gmailemailexample--default`, plus `filled`, `extracting`, `extraction-failure` and `retry-extraction`. Pause for approval before the findings screen.


### Item 12b — GmailFieldMapping replaced with assistant-guided findings: approved

User approved the paste-and-extract screen and explicitly requested updating `GmailFieldMapping` itself. Replaced its default technical mapping editor at the existing Storybook URL with screen two of the approved flow: assistant conversation on the left, editable finding cards on the right, stacked on smaller screens. The two-step indicator marks Review findings current; parent setup navigation owns any return to the example.

- Each card shows the lead-field name, found/uncertain/missing or user-edited status, an editable example value and supporting source text. Exclude unwanted fields without discarding their evidence. Correcting an example does not rewrite future extraction instructions.
- Future-email instructions, required-field consequences and destination changes live behind How future emails are handled. Existing required standard fields remain required. Missing/invalid values, unsupported or duplicate destinations, stale evidence/sample identity, missing required targets and missing Email/Phone mapping block approval.
- The inline assistant uses the shared assistant color/message conventions and shared controls, without opening the global modal over the cards. Host-owned messages/callbacks support guided follow-ups; sample text and messages are rendered as text and never interpreted as tool actions.
- Add a field starts a one-question-at-a-time fixture conversation covering name, meaning/recognition, an explicit user-provided example, and optional/required choice with consequences explained. It creates only a source-local draft target/card in Storybook; no business-wide field or persisted schema is created.
- Approval requires a separate review checkbox and explicit Approve field mapping action. Acknowledgment is keyed to the exact findings/sample/target snapshot and resets when that snapshot changes. The async callback receives an immutable snapshot; server authorization/version checks and real persistence remain integration work. Approval does not publish or create a lead.
- Busy actions lock editing and prevent concurrent/repeated sends or approvals. Assistant/approval failures preserve edits. Quick prompts preserve an unsent composer draft. Read-denied users see neither sample nor findings/conversation.
- Twenty-one stories cover example correction vs future instructions, guided field addition and consequences, explicit approval/reset/error, assistant failure/thinking, missing/uncertain data, changed samples, exclusion, permissions, pending, unsafe email text, draft preservation and long/narrow layouts. The prototype label parser helpers remain reference utilities; the findings screen now accepts structured assistant findings rather than running that parser as its default experience.

Real extraction/conversation is not connected yet. Storybook uses explicitly mocked assistant replies; the host adapter will implement agent generation, source-local field contracts, immutable/versioned samples, authorization and approval binding during integration.

Validation: sixty-three browser cases passed (all twenty-one stories at 1440px, 768px and 320px), covering guided field creation, correction vs future instruction changes, approval/reset/failure, assistant failure/thinking, unsent draft preservation, stale samples, access, safe text rendering, keyboard focus, Axe accessibility and responsive overflow/layout checks. Seven new findings-validation tests and eight retained extraction-reference tests passed. Lint, web type checking and the final Storybook production build passed. The composer uses the shared native assistant-textarea pattern after fixing a floating-label contrast failure on the dark surface. Desktop/mobile screenshots reviewed.

Review: `http://127.0.0.1:6007/?path=/story/lead-capture-gmailfieldmapping--default`, plus `guided-add-field`, `correct-example`, `future-extraction`, `approve` and `uncertain`. Pause for approval before proceeding.


### Findings header revision — remove Change example; inline field count: approved

User requested removing Change example and keeping Fields found plus the included-field count on one line. Removed the button and its unused callback/copy/story argument. The fields heading now shares a centered, space-between row with the non-shrinking live count, including on narrow screens. Parent setup navigation remains outside this component; no replacement navigation control was added.

Validation for the findings-header revision: eighteen targeted browser cases passed at 1440px, 768px and 320px, checking that Change example is absent, heading/count are aligned on one row, the live count updates with included/custom fields, existing interactions, keyboard focus, Axe accessibility and overflow. Desktop/mobile screenshots reviewed. Lint passed.


### Findings card revision — less copy and compact value/source columns: approved

User requested removing the mapping-publication/Intake Review footer note, the example-only correction helper beneath each value, and the source-local-field note in the assistant panel. Removed all three notes and their unused copy entries.

On desktop, each finding now places its example value and source evidence in two columns; they stack on smaller screens. User-added examples without source evidence keep a full-width value. The include control is grouped with the name/status header, and card padding/gaps are tighter to reduce vertical space. Existing future-extraction controls, assistant guidance and approval behavior are unchanged.

Validation for the compact findings revision: twenty-four targeted browser cases passed at 1440px, 768px and 320px, explicitly checking the three notes are absent, value/source columns on desktop and stacking below desktop, header/count alignment, editing, inclusion, guided custom fields, safe email rendering, keyboard focus, Axe accessibility and overflow. Desktop/mobile screenshots reviewed. Lint passed.

### Findings badge placement revision: approved

Removed the introductory sentence beneath Review the findings. Each status badge now sits beside its field name, while the Include field checkbox and label stay in the upper right. The name/badge group wraps when needed on narrow screens.

Validation: twenty-four targeted browser cases passed at 1440px, 768px and 320px, checking removed copy, desktop name/badge alignment, upper-right inclusion controls, existing interactions, keyboard focus, Axe accessibility and responsive overflow/layout. Desktop/mobile screenshots reviewed. Targeted lint and diff whitespace checks passed.

### Shared Gmail field setup progress: approved

Both email-example and field-mapping screens now use GmailFieldSetupProgress for Paste an example / Review findings. The layout follows the approved CaptureSetupHeader: equal-width steps, numbered circles, bottom rules, responsive stacked circle/label alignment, and current/completed/upcoming states. The completed Paste an example step now supports returning through a host callback; current and upcoming steps remain informational. The paste form keeps its readable width while its progress spans the same available width as the findings screen.

The shared component has separate stories for each active step, including interaction assertions for current and completed/upcoming semantics.

Validation: thirty-three targeted browser cases passed across both screens and the shared progress stories at 1440px, 768px and 320px. Checks cover matching progress dimensions, equal columns and bottom rules, active-step/access semantics, extraction and guided-field interactions, Axe accessibility and overflow. Desktop/mobile screenshots reviewed. Targeted lint, web type checking and diff whitespace checks passed.


### Return from findings to the example: approved

The completed Paste an example progress step is now a keyboard-accessible button on GmailFieldMapping. A required onBack callback lets the host preserve the example and draft while navigating. Navigation is disabled during assistant/approval work or an external pending state, with an in-flight guard. Read-only viewers may return to view the example.

The Storybook host demonstrates returning with the original email intact, editing it, and explicitly extracting again into a new versioned findings snapshot with approval reset. Extraction is a scripted fixture only. Step transitions move focus to the new screen heading. New stories cover the round trip and progress-button callback/pending behavior.

Validation: thirty-nine browser cases passed at 1440px, 768px and 320px, covering returning with the email intact, editing and re-extraction, fresh approval, keyboard activation/focus, pending/assistant-work navigation locks, read-only access, matching progress dimensions, Axe accessibility and overflow. Targeted lint, web type checking and diff whitespace checks passed.


### Item 13 — representative sample rule check within findings: approved

Added GmailSampleCheck as a compact panel within Review findings, keeping the approved two-screen flow. It reuses the existing literal, case-insensitive AND/OR matcher to show whether the current sample matches and identifies each phrase in the subject, body, both, or neither. It respects the configured search location; any-phrase rules may pass while showing other phrases as not found. Missing samples and invalid rules never report a pass. No network/provider call or lead creation occurs.

Mapping approval now requires a matching representative sample as well as valid findings. The exact matching rules join the immutable approval snapshot and acknowledgment signature; changed rules reset acknowledgment and trigger a fresh derived check. Existing sample identity/version and source-evidence validation remain in place. Real sample retention, server revalidation and extraction stay in the later integration phase.

Ten component stories cover matching/non-matching, all/any, subject/body, missing sample, invalid rules, read denial, changed sample and long phrases. Findings stories additionally demonstrate a non-matching sample blocking approval and a rule change resetting acknowledgment.

Validation: fifty-one browser cases passed across ten sample-check stories and seven findings stories at 1440px, 768px and 320px, covering matching evidence, no-match approval blocking, rule-change acknowledgment reset, back/re-extraction, permissions, keyboard focus, Axe accessibility and overflow. Nineteen unit tests passed (five new evidence-check tests, seven rule-matcher tests and seven findings tests). Targeted lint, web type checking, diff whitespace checks and the Storybook production build passed. Desktop/mobile screenshots reviewed. The build emitted module-directive/chunk-size warnings.

Review the existing GmailFieldMapping default story or GmailSampleCheck default/no-match/any-phrase stories. Pause for approval before item 14 (assignment, stage, tags and notifications).


### Item 14 — assignment, stage, tags and teammate notification: approved

Added controlled CaptureLeadWorkflow, following the assignment/organization and side-summary pattern in prototype-screen-23-gmail-workflow.html and the app’s existing form conventions. Settings appear on the left and a live summary on the right on desktop; smaller screens stack them. The same component supports website and Gmail sources with source-specific timing explanations.

Defaults are business assignment, existing stage New, no tags, and Notify assigned teammate enabled. Direct assignment requires an eligible teammate supplied by the host; missing or stale selections are preserved visibly and reported as invalid. Loading, failed/retry and empty teammate lists are explicit; business default remains available. Switching back to business default clears the direct-assignee ID. Starting-stage options reuse the existing lead-stage list. Comma-separated draft tags are trimmed for preview and validated for case-insensitive duplicates, a 20-tag count and 50-character per-tag limit; persisted tag identities/contracts remain integration work.

Notification text uses existing teammate preferences, without adding channel/customer-email controls. The summary explains application to newly created leads and explicit review for existing-lead stage/tag changes. Round robin, conditional assignment workflows, follow-ups and job handoff remain deferred. Parent setup owns Save/Continue. No assignment, notifications or persistence execute from the stories. Read/view permissions and pending guards are supplied by the host; server authorization and atomic lead/notification behavior remain integration work.

Sixteen stories cover default website/Gmail timing, direct/default assignment, stage/tags, notification opt-out, stale teammates, invalid tags, empty/loading/failed teammate lists, read-only, pending, read denial and long/narrow layouts. Four unit tests cover current-eligible-member checks, default assignment availability, tags and supported values.

Validation: forty-eight browser cases passed (all sixteen stories at 1440px, 768px and 320px), covering live summary changes, default/direct assignment, stale teammate correction, stage/tags, notification opt-out, permissions, pending/retry states, keyboard focus, Axe accessibility and responsive overflow/layout. Four validation tests, targeted lint, web type checking, diff whitespace checks and the Storybook production build passed. Desktop/mobile screenshots reviewed.

Review: `http://127.0.0.1:6007/?path=/story/lead-capture-captureleadworkflow--default`, plus `gmail`, `select-teammate` and `change-stage-and-tags`. Pause for approval before item 15 (final setup review).


### Item 15 — final setup review and launch approval: approved

Added controlled CaptureSetupReview, following prototype-screen-25-campaign-review.html and the approved review/publication boundaries. The left column summarizes source/destination, captured information and workflow, with authorized Edit actions. The right column shows readiness and launch choices; narrow screens stack the same sections. Gmail stories include account, visible phrase rules and a reviewed representative sample; workflow summaries include assignment, stage, tags and teammate notifications. Website and Gmail admission behavior is explained separately.

Launch now and Schedule launch require an explicit review checkbox. The acknowledgment and accepted-result state bind to the exact review snapshot and timing; draft/version/readiness/time changes reset them. The host receives an immutable draft/version plus an immediate-launch request or a scheduled UTC instant, business timezone and entered local time. Duplicate submissions and edit/timing controls are blocked in flight; failures retain the reviewed values for retry. Success says request accepted rather than claiming that a real source was published.

Scheduling resolves the entered wall-clock time in the business timezone independently of the browser timezone. Invalid dates/timezones, past times, nonexistent daylight-saving times and repeated ambiguous times are rejected. Time is rechecked immediately before calling the launch host and periodically while the component is open. The chosen instant is also displayed in the business timezone. Ambiguous times require a different unambiguous time in this first presentation.

Required readiness checks cover source configuration, fields, workflow, plan access and published-source capacity; Gmail additionally requires account and reviewed-sample checks. Missing, checking or blocked readiness disables approval. The slot-reservation explanation was removed from the review UI at the user’s request on October 29, 2026; the approved capacity and reservation behavior remains an integration requirement. The real host must compute trustworthy readiness, resolve the deferred business-default assignment dependency, enforce permission/version/state/entitlement checks, and reserve capacity atomically before publishing or scheduling; no service, queue, provider read or slot reservation is connected here. The approved setup header/page owns broader navigation.

Twenty stories cover website/Gmail review, immediate/scheduled approval, section edits, capacity/readiness blocks, missing Gmail checks, past/gap/fold times, timing/draft acknowledgment reset, failed and duplicate requests, read-only/pending/denied access and long content. Six validation tests cover readiness completeness, Gmail checks and timezone/instant validation.

Validation: sixty browser cases passed (all twenty stories at 1440px, 768px and 320px), plus fifteen targeted rechecks after enriching destination/tags/Gmail rule/sample summaries. Checks covered explicit launch/scheduling payloads, edit callbacks, acknowledgment reset, blocked/unfinished readiness, failed/duplicate submissions, permissions, keyboard focus, Axe accessibility and overflow. Six validation tests, targeted lint, web type checking, diff whitespace checks and the Storybook production build passed. Desktop/mobile screenshots reviewed.

Review: `http://127.0.0.1:6007/?path=/story/lead-capture-capturesetupreview--default`, plus `gmail`, `scheduled`, `capacity-blocked` and `clock-fold`. Pause for approval before item 16 (publication instructions).


### Item 15 copy revision — approved October 29, 2026

Removed “Active, paused and scheduled sources use a published-source slot. Scheduling reserves a slot.” and its unused copy entry. User approved the final setup review conditional on this removal.

Validation for the copy revision: six targeted browser cases passed (Default and Scheduled at 1440px, 768px and 320px), explicitly checking the note is absent, keyboard interactions, Axe accessibility and overflow/layout. Targeted lint and diff whitespace checks passed.


### Item 16 — publication instructions: approved October 29, 2026

Added controlled CapturePublicationInstructions based on the prototype’s hosted-link, iFrame/JavaScript and regular-website/WordPress installation choices. The left panel exposes the authoritative hosted link and embed code, with a right-side installation guide; narrow screens stack them. Methods are limited to artifacts supplied by the host. Code is rendered in a read-only text area and is never executed or loaded into an iframe here.

Copy actions report success/failure, prevent overlapping requests and offer a manual-copy fallback that selects all text on focus/click. The browser clipboard is the default adapter; Storybook supplies mocked copy callbacks. Feedback binds to the exact publication/version/artifact and clears when that context changes. External hosted links require HTTPS without credentials and open with noopener/noreferrer. Invalid/missing artifacts hide actionable links/code; unpublished sources receive a publication-first message. Read-denied users see no publication details.

Availability is shown for active, paused, scheduled, archived and access-blocked forms. Scheduled times display an absolute supplied instant in the supplied business timezone. A paused form’s unavailable message is explained without changing lifecycle state. Existing published identities remain host-owned; this component neither creates public URLs nor changes publication status.

Fixtures use a reserved example domain and explicitly state that no live form or embed loader is published. Real publication artifacts, hosted/embedded rendering, JavaScript loader, source-state enforcement and provider/service integration remain later work. Eighteen stories cover both copy targets and embed methods, platform guidance, failure/manual fallback, duplicate pending copy, all availability states, absent/invalid artifacts, pending/read denial, changed publication and long content.

Validation: fifty-four browser cases passed (all eighteen stories at 1440px, 768px and 320px), plus six final checks for numbered regular-website/WordPress instructions. Checks cover exact copy payloads, success/failure/manual selection, duplicate-copy protection, safe code-as-text rendering, stale feedback, availability/permissions, keyboard focus, Axe accessibility and overflow/layout. Four validation tests, targeted lint, diff whitespace checks and the final Storybook production build passed. Desktop/mobile screenshots reviewed. Web type checking reports only an unrelated readonly-invoices fixture mismatch in `features/settings/billing-page/billing-page.stories.tsx:81`; publication component/story diagnostics are clear.

Review: `http://127.0.0.1:6007/?path=/story/lead-capture-capturepublicationinstructions--default`, plus `java-script`, `word-press`, `copy-failure`, `paused` and `scheduled`. Pause for approval before item 17 (individual lifecycle controls).


### Publication approval follow-up — actual form hosting

User approved item 16 on October 29, 2026 and explicitly requested tracking implementation of actual form hosting. Integration step 4 now includes the real public origin/domain, stable hosted URLs, approved visitor-form rendering, iFrame and JavaScript delivery/loader, real installation artifacts, server-enforced source availability, submission handling and hosted/embed end-to-end verification. Hosting remains unimplemented; example links and mocked publication must not be presented as live.


### Item 17a — pause/resume review: approved October 29, 2026

Added CapturePauseResumeDialog using the shared ConfirmDialog and the prototype source-list action pattern. Pause and Resume are explicit requested actions, never inferred as a toggle after source state changes. Requests contain an immutable source snapshot and version; the host must reauthorize and compare the current persisted state before applying them and close only after success.

Pausing website intake explains the configured paused visitor message and disabled submissions. Resuming explains returning to the approved form. Gmail pausing stops intake processing without deleting account messages; resuming processes eligible messages received during the pause using current approved rules, routing matches to Intake Review as documented in user-journeys.md. Both actions preserve leads, pending review and history. Resume displays the approved configuration and states that unpublished draft changes are not applied.

Only active sources can pause and only paused sources can resume. Capabilities are supplied by the host, with checking/blocked resume readiness preventing confirmation. Pausing remains possible when resume readiness is blocked. Archived/scheduled/draft sources are ineligible for these actions. Read denial hides source details. Conflict blocks confirmation and supports a version-refresh callback; failures retain the review. Pending operations prevent dismissal, reloading and duplicate requests. Resume reviews begin focused on their scrollable content; the standard pause confirmation starts on Cancel.

Twenty stories cover both source types and transitions, explicit requests, cancel/focus restoration, readiness/status/permission blocks, mutation failure, conflict/reload failure, pending/duplicate protection and long reviews. Four unit tests cover transitions, separate capabilities, approved configuration/readiness and version identity. Real server lifecycle mutation, public-state enforcement, Gmail pause cursor/backlog recovery, intake deduplication and audit remain integration work.

Validation: all sixty unique browser cases completed across twenty stories at 1440px, 768px and 320px. The suite covered exact version-bound requests, cancellation and focus return, permissions/readiness/status blocks, reload/conflict/failure paths, duplicate/pending guards, Axe accessibility and horizontal overflow. Three final long-review checks verified keyboard scrolling after the shared entrance transition settled. Modal visibility assertions wait for the shared animation. Four validation tests, targeted lint, web type checking, diff whitespace checks and the final Storybook production build passed. Desktop/mobile screenshots reviewed.

Review: `http://127.0.0.1:6007/?path=/story/lead-capture-capturepauseresumedialog--default`, plus `website-resume`, `gmail-resume`, `resume-blocked` and `reload-conflict`. Pause for approval before archive/restore review.


### Item 17b — archive/restore review: approved October 29, 2026

Added CaptureArchiveRestoreDialog using the shared ConfirmDialog and the existing approved pause/resume review layout, adapted from prototype screen 17’s source actions. Archive is available for authorized current drafts, active, paused or scheduled sources; already-archived sources cannot archive again. Restore is available only for archived sources and explicitly requests a paused target state. No action auto-resumes intake or reinstates an old scheduled launch.

Archive explains preservation of existing leads, pending Intake Review items and history, with a specific cancellation note for scheduled launches and a distinct explanation for unpublished drafts. Website and Gmail effects are described separately. Restore requires host-provided access/capacity readiness, blocks checking/failed readiness, and explains the later setup review/resume requirement. Gmail restoration does not process messages; restored cursor/backlog eligibility remains a required integration decision, as previously recorded.

Requests include immutable source identity/version/state and an explicit archived or paused target. The host must enforce current capabilities, lifecycle state and optimistic version checks; atomically cancel scheduled launches on archive and acquire published-source capacity on restore. Read denial hides source details. Conflicts block confirmation and support reload; retry failures preserve the review. Pending mutations/reloads prevent dismissal and repeated requests. Archive starts on Cancel; restore starts on its keyboard-scrollable content. Role names are not hardcoded: Office archive support depends on the previously approved server/catalog migration.

Twenty-three stories cover website/Gmail archive and restore, scheduled cancellation, draft archival, capacity/access blocks, checking readiness, exact transition requests, cancellation/focus restoration, forbidden/ineligible/denied states, failures/conflict reload, pending/duplicate protection and long content. Four validation tests cover allowed states, separate capabilities, restore readiness versus archival availability, and valid identity/version. Actual persistence, scheduler cancellation, capacity acquisition, hosting availability and Gmail behavior remain integration work.

Validation: sixty-nine browser cases passed (all twenty-three stories at 1440px, 768px and 320px), covering archive/restore target snapshots, scheduled cancellation and unpublished drafts, capacity/access/permission/status checks, failure/conflict/version reload, duplicate/pending guards, cancellation and focus return, long-review keyboard scrolling, Axe accessibility and overflow/layout. Four validation tests, targeted lint, web type checking, diff whitespace checks and the Storybook production build passed. Desktop/mobile screenshots reviewed.

Review: `http://127.0.0.1:6007/?path=/story/lead-capture-capturearchiverestoredialog--default`, plus `website-restore`, `gmail-restore`, `scheduled-archive` and `capacity-blocked`. Pause for approval before scheduled-launch changes/duplication reviews.


### Item 17c — scheduled-launch changes: approved October 29, 2026

Added CaptureLaunchChangeDialog following the prototype final-review scheduling layout and the shared lifecycle ConfirmDialog pattern. The review displays the current launch time and business timezone, with options for another future time or explicit launch now. It uses the approved configuration; unpublished draft edits are not applied. Cancel dismisses the review without changing the schedule. Archiving remains the separately approved action that cancels a scheduled launch; no new cancel-to-draft/paused transition was invented here.

The component reuses the final setup review’s business-timezone resolver and timing checks. Unchanged instants, past/invalid local times, daylight-saving gaps and ambiguous folds block confirmation. Only authorized scheduled sources with current positive versions, a valid future existing schedule and ready configuration/access checks may submit. A passed original launch time requires a source reload instead of acting on potentially stale scheduler state. State/timing are checked again immediately before dispatch.

Requests bind an immutable source/version/current-schedule snapshot to a now request or an unambiguous UTC instant with business timezone and local input. The authoritative host must serialize worker execution and rescheduling, compare the version/state, replace/cancel the old launch job atomically and reuse the existing source reservation. No jobs, publication or capacity mutations execute in Storybook. Conflict/reload and error/retry preserve the chosen time; pending locks edits, dismissal and duplicate requests. Read denial hides source and schedule data.

Twenty-three stories cover website/Gmail, current-versus-proposed time, unchanged/edit-time checks, exact now/scheduled requests, cancel, readiness/status/elapsed/past/DST/permission blocks, failures, conflict/version reload, pending/duplicate protection and long content. Four new tests cover source eligibility, schedule/readiness races and unchanged/new instants; the six existing timezone/review tests are retained and reused.

Validation: sixty-nine browser cases passed (all twenty-three stories at 1440px, 768px and 320px), covering exact version/timezone/instant requests, native time edits, unchanged-time blocking, immediate launch, readiness/status/elapsed/DST/permission checks, failures/conflict/reload, pending/duplicate guards, cancel, keyboard focus/long-review scrolling, Axe accessibility and overflow. Ten validation tests passed (four new eligibility/change tests and six reused final-review/timezone tests). Targeted lint, web type checking, diff whitespace checks and the Storybook production build passed. Desktop/mobile screenshots reviewed.

Review: `http://127.0.0.1:6007/?path=/story/lead-capture-capturelaunchchangedialog--default`, plus `gmail`, `unchanged`, `launch-now`, `clock-fold` and `reload-conflict`. Pause for approval before source duplication review.


### Item 17d — duplicate a capture source into a new draft: approved October 29, 2026

Added CaptureDuplicateDialog using the shared lifecycle confirmation layout and prototype screen 17’s duplication action. The review identifies whether an approved or draft configuration/version is being copied and shows a host-supplied setup summary. An editable draft name uses the existing 80-character source-name limit; the suggested “(copy)” suffix remains within that limit without splitting Unicode characters. Authorized sources in all five lifecycle states can be copied, subject to host-resolved draft-creation access. Published-source capacity does not by itself block creating a draft.

The copy review explicitly excludes captured leads, pending intake records, history, retained samples/sample approvals, public hosted/embed identity, launch approval, schedule and processing state. Website copies require a separate review/publication; Gmail copies require connection confirmation, a freshly reviewed matching example and final setup review. The original’s status and configuration are not changed. Reusable templates remain deferred.

The request includes only source ID/expected version, configuration kind/version, normalized name, target draft state and a request identifier. Configuration contents are loaded authoritatively by the host rather than trusting rendered summary text. The request ID remains stable on retry of the same review and changes for a different reviewed payload; the server must atomically deduplicate creation using that key to handle uncertain transport outcomes. Close/reopen starts a new copy intent. Creation/persistence and all safe-copy allowlisting remain integration work.

Capabilities, checking/blocked access, invalid identity/configuration/name, read denial and conflict states gate creation. Pending operations prevent editing, dismissal and repeated submissions. Failures retain the name; conflict reload requires updated source/configuration versions. Twenty-two stories cover both source types and configuration kinds, archived/scheduled sources, name editing/limits, exact requests, retry identity, cancel, access/readiness/permission blocks, conflicts/reload, failures/pending/duplicate guards and long content. Five validation tests cover states/capability, source/configuration versions, readiness, name bounds and Unicode-safe suggestions.

Validation: all sixty-six unique browser cases passed across twenty-two stories at 1440px, 768px and 320px. The tablet/phone pass was rerun after a development-page reload interrupted the initial pass. Checks covered configuration/version-bound draft requests, exact names and limits, stable request identity on retry, status/access/readiness/permission guards, conflicts/reload, failure/pending/duplicate handling, cancel, keyboard focus/scrolling, Axe accessibility and overflow. Five validation tests, targeted lint, web type checking, diff whitespace checks and the Storybook production build passed. Desktop/mobile screenshots reviewed.

Review: `http://127.0.0.1:6007/?path=/story/lead-capture-captureduplicatedialog--default`, plus `gmail`, `draft-source`, `confirm-copy`, `retry-uses-same-request` and `reload-conflict`. Pause for approval before item 18 (source dashboard summary).


### Item 18 — source dashboard summary: approved October 29, 2026

Added CaptureDashboardSummary using the shared MetricCard and source-list status badges, following prototype screen 28’s source/metrics/review entry pattern. The summary shows source name/type/lifecycle state, optional intake-block/attention feedback, Captured to date, Awaiting review now and Approved to date. Counts use the approved unique accepted-item semantics; immediate website approvals and reviewed duplicate links/updates count as approved items. No charts, conversion rates or date filtering were added.

The host supplies authorized consistent totals. Missing, negative, fractional, unsafe or internally inconsistent counts display unavailable/error states rather than zero. Loading uses the shared metric skeletons. Actual zeros remain visible. Error retry does not remove the authorized Intake Review action, and paused, archived or access-blocked sources retain that link for existing pending items. The source’s lifecycle status stays visible alongside a separate intake-block marker.

Intake Review access is a separate read capability from source-summary access. A host-supplied source/tenant-scoped internal URL is required; unsafe or missing links are not navigable. The component validates local navigation shape but the actual route/filter contract and authorization remain host integration work. The Storybook fixture link is intercepted in keyboard checks, so it does not claim a connected Intake Review page. Header actions stack on phones; metric cards stack below the shared medium breakpoint and use three columns above it.

Seventeen stories cover website/Gmail, zero and large totals, all five lifecycle states, effective intake blocks, loading/error/retry/missing/inconsistent data, separate intake permissions, unsafe links, read denial and long text. Four unit tests validate count invariants, source identity/state and local-link safety. Real persisted aggregate queries, source-state resolution and scoped Intake Review navigation remain integration work.

Validation: fifty-one browser cases passed (all seventeen stories at 1440px, 768px and 320px), covering exact zero/ready/unavailable displays, effective source states, error retry, separate read permissions, internal scoped-link keyboard activation, large counts, Axe accessibility and overflow/layout. Layout checks use the app’s actual 900px medium breakpoint, with cards stacked at 768px and 320px. Four validation tests, targeted lint, web type checking, diff whitespace checks and the Storybook production build passed. Desktop/mobile screenshots reviewed.

Review: `http://127.0.0.1:6007/?path=/story/lead-capture-capturedashboardsummary--default`, plus `intake-blocked`, `archived`, `loading`, `error` and `large-totals`. Pause for approval before item 19 (source settings/details).


### Item 19 — source settings/details: approved October 29, 2026

Added CaptureSourceDetails following prototype screen 28’s approved-configuration and source/publication cards, using the app’s existing detail-card layout and shared status badges. Configuration and publication/connection cards sit side by side on desktop and stack below the large breakpoint. Authorized summary rows show the approved version; draft-only sources are explicitly labeled as drafts. A newer unpublished revision appears separately with Continue editing draft, keeping the approved configuration visible.

Website sources expose publication status and an authorized View publication details callback to the already approved publication component. Gmail sources show one account, connection/reconnect status and a separately authorized Manage connection action. Archived sources require restoration before editing or managing connections. Read-only users retain permitted details; denied reads reveal neither account nor configuration. Loading and error states hide stale configuration; retry is host-controlled. Pending operations disable actions. Invalid versions, mismatched source kinds and missing connected-account identity fail closed.

Nineteen stories cover website/Gmail, draft/approved configurations, unpublished revision, reconnect/missing connection, paused/scheduled/archived sources, separate capabilities, pending/loading/error/retry, invalid revision/account data and long content. Three validation tests check approved/draft separation, revision ordering and incomplete configuration. Callbacks and data are mocked; actual authorized loading, draft creation/edit navigation, publication routes, OAuth and persistence remain integration work. The host must reauthorize source-scoped actions and preserve version bindings. Actual public form hosting and business-default assignment settings remain deferred as already recorded.

Validation: all fifty-seven browser cases passed across nineteen stories at 1440px, 768px and 320px, covering interaction assertions, keyboard focus, permission gates, approved/draft separation, Axe accessibility and overflow. Desktop columns and tablet/phone stacking were verified against the app’s 1200px large breakpoint. Three validation tests, targeted lint, web type checking, diff whitespace checks and the Storybook production build passed. Desktop/mobile screenshots reviewed.

Review: `http://127.0.0.1:6007/?path=/story/lead-capture-capturesourcedetails--default`, plus `gmail`, `unpublished-revision`, `reconnect-required`, `draft`, `read-only` and `archived`. Pause for approval before item 20 (Intake Review toolbar, then list).


### Item 20a — Intake Review toolbar: approved October 29, 2026

Added IntakeReviewToolbar using the shared FilterBar and removable filter chips, following prototype screen 26’s name/email/subject search and review flags. It defaults to Awaiting review, with capture-source, review-status (all/awaiting/approved/dismissed) and review-flag filters (all/needs attention/possible duplicate/missing details/no flags). Explicit Clear all removes every filter and switches to All statuses; removing individual chips preserves the other values. Search is limited to 200 characters. Desktop uses four aligned controls, tablet two columns and phones one column.

Source options are authorized host data and may include paused/archived sources with accessible intake history. A missing selected source remains selected and is labeled unavailable rather than silently broadening to all sources. Source loading/errors disable only the source picker, retaining search/status/flag controls and selected values. Retry is host-supplied. Full disabled state locks inputs, chips, clear and retry; denied reads reveal no filter controls or source options. The toolbar has no approve/dismiss or bulk actions; these remain in the individually reviewed item flow.

Fifteen stories cover the default queue, combined filtering, chip removal/clear, approved history from an archived source, missing-detail flags, no available sources, unavailable selection, loading/error/retry, disabled/read-denied, keyboard focus restoration, search limit and long content. Story interaction checks exercise the controlled state rather than duplicating it in unit tests. Data and changes remain Storybook mocks. The integrated host must own authorized queries, status/flag semantics, search debounce, URL state, pagination reset and durable history; no intake querying or mutation is implemented.

Validation: all forty-five browser cases passed (fifteen stories at 1440px, 768px and 320px), including Storybook interaction assertions, keyboard source selection/focus restoration, source/status/flag filtering, search limits, permission/disabled gates, Axe accessibility and horizontal overflow. Desktop alignment and phone stacking were verified; desktop/mobile screenshots reviewed. Targeted lint, web type checking, diff whitespace checks and the Storybook production build passed.

Review: `http://127.0.0.1:6007/?path=/story/lead-capture-intakereviewtoolbar--default`, plus `filtered`, `approved-history`, `source-unavailable`, `sources-error`, `keyboard` and `long-content`. Pause for approval before item 20b (Intake Review list).


Item 20a approval revision: removed the visible “Find intake items” heading at the user’s request. The shared FilterBar now supports an optional hidden heading, preserving its accessible section name and existing defaults for other consumers. Clear all remains available. Six targeted browser cases passed at desktop/phone widths for heading removal, filter removal/clear, keyboard focus, Axe accessibility and overflow. Targeted lint and diff whitespace checks passed. User approved the toolbar with this change; item 20b Intake Review list is next.


### Item 20b — Intake Review list: approved October 29, 2026

Added IntakeReviewList using the shared DataTable, mobile cards and StatusBadge styling, adapting prototype screen 26’s proposed lead, source summary, review status/flags and received-time layout. Rows show name/contact, email subject or submission summary, capture-source type pill, review disposition and duplicate/missing/uncertain/capacity flags. Missing name/contact/summary/timestamps have explicit fallbacks; invalid timestamps/timezones show unavailable instead of crashing or silently changing zones. Email-derived strings render as plain React text.

Host-resolved per-record canOpen/canReview capabilities determine Review versus View details. Approved/dismissed history always opens details; awaiting items without review permission remain viewable when authorized. Restricted detail access exposes no navigation button. Pending records disable their action. The list opens the individually reviewed flow only: no inline approve/dismiss, automatic duplicate merge, bulk selection or lead mutations. Capacity flags do not prevent opening a review, where duplicate dispositions and authoritative admission checks will be handled separately. Paused/archived-source history remains present when returned by the authorized host query.

Seventeen stories cover Gmail/website, mixed review flags, approved/dismissed history, read-only/restricted actions, missing fields, pending/loading/error/retry, empty/filter-empty/read denial, invalid time data, untrusted text, long content and keyboard opening. Story interactions exercise actual callbacks and access gates. The host must supply authorized summaries, oldest/newest ordering, timezone, filtered/paged rows and source access; the page will compose the already shared Pagination control with server-scoped totals. Queries, durable history, record version checks, detail navigation and all decisions remain integration work.

Validation: all fifty-one browser cases passed (seventeen stories at 1440px, 768px and 320px), including callback/access/pending assertions, missing data, history, loading/error/retry, literal untrusted text, keyboard focus/opening, Axe accessibility and overflow. The shared 900px table-to-card breakpoint was verified. Desktop/tablet/phone screenshots reviewed. Targeted lint, web type checking, diff whitespace checks and the Storybook production build passed.

Review: `http://127.0.0.1:6007/?path=/story/lead-capture-intakereviewlist--default`, plus `history`, `read-only`, `missing-values`, `long-content` and `error`. Pause for approval before item 21 (intake source evidence).


### Item 20b revision — source type pills: approved October 29, 2026

Replaced the capture-source name and type description with one shared StatusBadge pill. It displays only Gmail or Embedded form in both desktop rows and mobile cards, as requested. Source identity/name remains in host row metadata for later authorized detail navigation but is no longer displayed in this column.

Validation: eight targeted desktop/phone browser cases passed for source-pill styling, exact labels, removed source names, interactions, Axe accessibility and overflow. Targeted lint, web type checking and diff whitespace checks passed.


### Item 21 — intake source evidence: approved October 29, 2026

Added IntakeSourceEvidence following prototype screen 27’s original email and per-field source-text pattern. It shows an immutable original Gmail sender/subject/body or labeled website submission answers, capture-source identity and received time. A separate read-only Field evidence section marks verified source text, uncertain evidence or missing evidence. The later proposed-lead editor will own corrections; this component never changes the original or creates lead values.

The authorized host supplies one intake-ID/version-bound snapshot containing the original and its field evidence. Email quotes must exist verbatim in the declared sender/subject/body; form quotes must exist in the identified original answer. Missing, blank, fabricated, stale or wrong-source-kind quotes are not presented as verified evidence. Unsupported quote text is withheld with a verification notice. Snapshot identity/version and unique field/answer IDs are checked. All source content is rendered as React text, with no HTML rendering, executable content, remote images or automatic links. Provider-side body conversion, safe limits and authoritative snapshot/version binding remain host responsibilities.

Permission denial shows neither source content nor retry. Loading/error states hide stale original content. Retry is host-controlled. Missing sender/subject/body/answers and received-time data have explicit fallbacks, and invalid dates/timezones do not crash or silently change zones. Sixteen stories cover both source kinds, body/sender/subject evidence, missing/uncertain/unsupported/wrong-kind quotes, absent content, loading/error/retry/invalid snapshots/read denial, invalid time, untrusted content and long text. Three validation tests exercise original-location quote verification, form answer/source-kind binding and snapshot identity/version/unique IDs.

The host must load authorized retained original content and matching extraction evidence, preserve it separately from reviewer corrections and provide the item’s current version. No Gmail access, public-form service, extraction agent, persistence or decision action is connected. The page will later compose this component beside the proposed-lead editor, with reviewer edits leaving the evidence snapshot intact.

Validation: all forty-eight browser cases passed (sixteen stories at 1440px, 768px and 320px), covering source and evidence displays, verified/missing/uncertain/unsupported quotes, source-kind mismatches, read denial, loading/error/retry, time fallback, literal untrusted text without images/links, retry focus, Axe accessibility and overflow. Three validation tests, targeted lint, web type checking, diff whitespace checks and the Storybook production build passed. Desktop/mobile screenshots reviewed.

Review: `http://127.0.0.1:6007/?path=/story/lead-capture-intakesourceevidence--default`, plus `form-submission`, `unsupported-quote`, `untrusted-content`, `long-content` and `error`. Pause for approval before item 22 (intake proposed-lead editor).


### Item 22 — intake proposed-lead editor: approved October 29, 2026

Added IntakeProposedLeadEditor following prototype screen 27’s editable proposed details, using existing MUI/shared field styling and the approved stable field/option definitions. Standard name/email/phone/service/details/address fields and approved custom short/long text, dropdown, checkbox and date fields are supported. Name and service must be included and required in the host’s correction definition, alongside the approved one-contact policy, so excluded/missing extraction values cannot bypass mandatory CRM fields. Custom field IDs/choice IDs remain stable; fields cannot be added, removed or retyped during item review.

Validation reuses the public capture validator, whose input type was narrowed to only the fields/contact/consent properties it actually reads. Required values, one email/phone, supplied email format, length, allowed choices and real calendar dates follow the existing rules. The decision host can turn on showErrors after a review attempt and call exported validateIntakeProposedAnswers before proceeding. Original values and uncertain-field metadata remain separate from controlled corrections: edited badges never erase original missing/uncertain provenance, and changing checkbox order alone is not treated as an edit. Original source content stays in the separately approved evidence component.

Read access is required before rendering any proposed values. Edit access and unresolved item state gate changes; text remains selectable read-only, while choice controls are disabled. Pending operations lock all fields; loading/error states hide stale values without clearing host-controlled corrections. Record identity/version and the correction definition are checked before editing. The host must reset the controlled session when switching item/version/definition, guard unsaved navigation, and enforce authoritative permissions, concurrency and lead contracts. Corrections remain in preview state only: no save, approval, dismissal or lead creation is performed here. Decision review remains item 24.

Fifteen stories cover correction/original preservation, missing-required errors and correction, phone-only contact, invalid email, custom choices/dates, view-only/resolved/pending/loading/error/retry/read denial, invalid definitions and long values. Four validation tests cover mandatory definitions, contact/required checks, custom validation and original-versus-edited comparison. Existing public-form validation tests are also included in regression checks because the validator input type is shared.

Validation: all forty-five browser cases passed (fifteen stories at 1440px, 768px and 320px), covering controlled corrections/original preservation, required-field errors and correction, phone-only contact, invalid email, custom dropdown/checkbox interaction, view-only/resolved/pending/loading/error/retry/read denial, focus rings, Axe accessibility and overflow. Eleven unit tests passed across the four new validation checks and seven existing public-form checks. Targeted lint, web type checking, diff whitespace checks and the final Storybook production build passed. Desktop/mobile screenshots reviewed.

Review: `http://127.0.0.1:6007/?path=/story/lead-capture-intakeproposedleadeditor--default`, plus `correct-value`, `missing-required`, `custom-fields`, `read-only` and `pending`. Pause for approval before item 23 (duplicate decision).


### Item 23 — intake duplicate decision: approved October 29, 2026

Added IntakeDuplicateDecision following prototype screen 27’s possible-existing-lead comparison and the three approved duplicate dispositions. An explicit controlled choice selects Update / link existing, Create separate lead or Dismiss. The Default story displays a previously selected link draft; FreshDecision starts with no disposition. Selecting link opens the first available authorized candidate for comparison; multiple matches can be selected explicitly. No lead or intake record changes at selection time; final decision execution belongs to item 24 and later integration.

The comparison renders existing/proposed values as plain text and requires opt-in checkboxes for each changed field. No field update is selected automatically. Stage and tag proposals appear in the same explicit review, preventing workflow defaults from silently overwriting an existing lead. Unselected values remain unchanged; linking with no selected fields attaches provenance without overwriting data. Switching candidates resets selected changes. Existing/proposed equal values cannot be selected. Identity/version and unique change-ID checks reject invalid targets, invented/unchanged/repeated changes and stale lead versions.

The controlled choice binds to a host-supplied review revision and target lead version. The host must advance that revision whenever intake/proposal corrections, candidate values, capabilities or versions change. Stale selections no longer display as current and require a fresh choice; no automatic migration to new data occurs. The later decision host must validate the revision and all capabilities again, bind selected IDs to authoritative typed values, authorize both records, and apply only explicitly reviewed changes atomically with provenance/idempotency guarantees. This presentation component performs no persistence or mutation.

Separate read/match/selection/create/dismiss permissions gate data and choices. No-match, match-access denial, match loading/errors/retry, capacity-blocked separate creation, read-only/resolved/pending states are covered. Match loading/errors hide stale existing-lead details while separate/dismiss remain available when authorized. Authorized candidate summaries alone should be passed; a denied match-read capability renders no names or comparison data. Pending disables selections and retry.

Seventeen stories cover no initial choice, all three choices, per-field selection, multiple matches/reset, link-only, capacity/access restrictions, read-only/pending/resolved, stale revision, match loading/error/retry, no matches, overall read denial and long comparison text. Four validation tests cover identity/uniqueness, review/target version binding, exact changed-field allowlisting and explicit unresolved choices. Actual candidate lookup, capacity resolution, match evidence and decision execution remain host/service integration work.

Validation: all fifty-one browser cases passed (seventeen stories at 1440px, 768px and 320px), covering disposition selection, exact change allowlists, match switching/reset, capacity/access gates, read-only/pending/resolved, stale review/reselection, match loading/error/retry, keyboard checkbox activation/focus, Axe accessibility and overflow. Four validation tests, targeted lint, web type checking, diff whitespace checks and the Storybook production build passed. Desktop/mobile screenshots reviewed.

Review: `http://127.0.0.1:6007/?path=/story/lead-capture-intakeduplicatedecision--default`, plus `fresh-decision`, `select-changes`, `multiple-matches`, `capacity-blocked` and `stale-review`. Pause for approval before item 24 (intake decision review).


### Item 24 — final intake decision review: approved October 29, 2026

Added IntakeDecisionReview following prototype screen 27’s reviewed outcome and post-approval summary. It presents Create lead, Create separate lead, Update/link existing or Dismiss, with one explicit final confirmation and Back to details. Create/separate displays the reviewed fields and source workflow; linking shows the authorized target and only selected existing/proposed changes, or a link-only notice. Dismissal neither creates nor updates a lead. The composed host selects the normal create/dismiss intent or passes the duplicate component’s explicit choice.

Authoritative-readiness presentation gates access checking/blocks, action-specific permissions, resolved/invalid context, required proposal fields, duplicate revision/target/change allowlists, definition/workflow versions and new-lead capacity. Required fields and capacity apply to creation/separate creation; permitted linking or dismissal remain available without creating a lead. Duplicate-required items cannot bypass the approved duplicate choice. The host must load an authorized frozen snapshot, advance its revision for corrections, candidate/workflow/access/readiness changes, and recheck all facts on confirmation.

Create requests carry the intake ID/expected version, reviewed revision, field-definition/workflow versions, and normalized allowlisted answers. Linking sends only the selected target ID/expected version and reviewed change IDs; the server must resolve their authoritative typed values from the exact persisted/frozen review revision, not infer them from display strings or current workflow defaults. Dismiss sends no lead values. Every request includes a generated request ID, retained for an identical retry and replaced for a changed reviewed payload. The service must atomically deduplicate decisions and enforce item/lead permissions, versions, source provenance, capacity admission and once-only workflow/notification effects.

Pending operations lock confirmation, Back and reload, with an in-flight guard against duplicate submits. Success disables repeated confirmation for that exact payload. Generic/network failures preserve the review and reuse the request ID on retry. Conflict responses block until the host supplies a new intake version or review revision; calling reload without refreshing the snapshot does not unblock. Server capacity races leave the item queued, block the same reviewed attempt and offer reload; the host must provide a refreshed review revision/readiness before proceeding. Reload errors preserve corrections. Responses from an older snapshot are scoped to its request/revision and do not mark a different review successful.

Twenty stories cover create/separate/link/link-only/dismiss requests, missing fields, capacity/readiness/permission gates, stale duplicates, pending/double-submit protection, network retry identity, service errors, conflict/no-op reload and refreshed reload, server capacity races, read denial, resolved records and long values. Four validation tests cover canonical allowlisted creation, gates, dismissal at capacity, and exact duplicate target/change/version binding. All persistence and mutations remain mocked; this component alone does not implement Intake Review services.

Validation: all sixty browser cases passed (twenty stories at 1440px, 768px and 320px), covering exact create/link/dismiss requests, selected-only updates, capacity and required-field gates, duplicate revision binding, pending/double-submit protection, identical retry identity, service failures, unchanged/refreshed conflict reloads, capacity races, permission/read denial, resolved items, keyboard Back activation/focus, Axe accessibility and overflow. Four validation tests, targeted lint, web type checking, diff whitespace checks and the Storybook production build passed. Desktop/mobile screenshots reviewed.

Review: `http://127.0.0.1:6007/?path=/story/lead-capture-intakedecisionreview--default`, plus `link-changes`, `dismiss`, `retry-same-request`, `reload-conflict` and `capacity-race`. Pause for approval before composing full page stories, starting with the capture-source list page. Service integration and assistant logic follow page approvals in the previously agreed order.


### Page 1 — capture-source list composition: approved October 29, 2026

Added CaptureSourcePage as a controlled composition of the approved capture-source toolbar/list and shared Pagination, with a Lead Capture heading and permission-gated Create capture source action. The authorized host supplies filtered/paged rows, totals, capabilities, loading/error state, timezone and reviewed-dialog content. Query and URL ownership remain outside the page; no guessed API/route contract was introduced. Loading locks controls, errors preserve filters and offer retry, and unavailable results do not display fabricated zero totals. Read denial hides source controls, rows, counts and dialogs.

Added a Storybook-only CaptureSourcePagePreview adapter using the shared WorkspaceNavigation, current Lead Capture label and existing legacy navigation ID pending technical migration. It filters fictional names/type/status, switches Current/Archived views, resets page on filter/size changes and clamps page after local changes. The approved pause/resume, archive/restore and duplicate dialogs open from the approved row capabilities. Confirmation updates in-memory state only, preserves history counts, increments mock source versions independently of configuration versions, restores to paused and creates separate empty-history drafts. Restored unpublished drafts retain draft configuration and require setup/publication review; they do not gain a Resume action. Cancellation leaves rows unchanged; mocked failures retain the open review; pending confirmation locks the dialog. Duplicate request IDs are deduplicated in the preview adapter. These mechanisms demonstrate composition, not service enforcement.

Create, source details and edit/continue-setup invoke distinct preview callbacks and feedback; the corresponding page stories follow in the agreed assembly order. Scheduled-source Edit setup similarly opens the future setup callback; the already approved launch-change dialog will compose with the appropriate setup/detail page. Navigation, actual CRUD, source queries, authorized totals, lifecycle readiness, capacity, persistence and provider behavior remain integration work. The adapter’s owner identity is fictional presentation; capabilities come from explicit preview access flags and row actions rather than role-name checks.

Eighteen page stories cover filtering/no matches, create/detail/setup callbacks, pause/resume, archive/restore, duplicate draft, cancel, Archived view, paging/filter/size reset, read-only/read denial, loading/error retry/empty, failed/pending confirmations and long content. The host will preserve server-side authorization/version checks and explicit review before lifecycle actions when this approved composition is connected. Assistant integration remains in its agreed later phase.

Validation: the initial seventeen page stories passed fifty-one browser cases at 1440px, 768px and 320px, including filters/pagination resets, preview navigation, approved lifecycle dialogs and row updates, failures/pending/cancel, permissions, Axe accessibility and overflow. After fixing the restored-draft/configuration-version edge case, twelve focused regression cases passed across all three widths, including the added eighteenth story. An additional desktop round trip verified that archive/restore advances the source version while duplication still reviews approved configuration version 1. Desktop sidebar/content alignment and mobile stacking are explicitly asserted. Targeted lint, web type checking, diff whitespace checks and the final Storybook production build passed. Desktop/mobile screenshots reviewed.

Review: `http://127.0.0.1:6007/?path=/story/lead-capture-capturesourcepage--default`, plus `pause-and-resume`, `archive-and-restore`, `duplicate-draft`, `pagination` and `read-only`. User approved this page. Next: compose the website setup page story using its approved components.


### Page 2 — website setup composition: approved October 30, 2026

Added WebsiteSetupPage using the approved three-step setup header and source selection, website brief, field editor, form-content editor/customer preview and lead workflow components. Source selection leads into one visible intake section at a time: Business brief, Form fields, Form text & preview, Lead workflow. Section buttons preserve the same controlled draft. The content editor and customer preview share fields/text/paused contact settings directly, with desktop columns and narrow stacking. Preview submissions remain isolated simulations through the approved preview component.

Continue validates the current section and saves the draft before advancing; the workflow section validates the whole website draft before handing off to the separate final review/publication page. The save callback must return the same draft identity and an advanced version. Final review receives that saved identity/version, not stale pre-save metadata. Manual Save draft shares the same frozen, version-bound payload and in-flight guard. Failures preserve values and prevent advancement; pending saves disable editors/navigation, while permission denial hides all source data. Older save completions cannot advance a different draft or a session whose read/edit permission was revoked.

The header’s approved unsaved-navigation dialog is wired to restore the host’s last saved snapshot only after explicit discard; Keep editing preserves corrections. Website settings never accompany a Gmail handoff: only normalized source identity is saved, then the host receives the saved draft reference. Gmail entitlement availability gates progression. Published-source revisions retain the approved live-configuration note and lock source identity/type during source selection. The composed host remains responsible for authoritative entitlements, revision concurrency and navigation guards outside this page.

WebsiteSetupPagePreview supplies an explicit in-memory adapter, shared workspace navigation, default field configuration, fixture business context/teammates, local save versions and deterministic mock suggestions. Suggestions are accepted explicitly before replacing draft fields. No assistant, backend persistence, visitor hosting, OAuth or publication is connected. Default assignment remains the previously deferred presentation option; the integration host must resolve it authoritatively before launch. The production routing contract remains undecided: this story demonstrates a single wizard surface without creating routes.

Seventeen stories cover each source/intake section, a complete save-and-advance path, live form-title preview, manual save, discard/keep editing, required-name/title checks, save failure/pending locks, Gmail handoff isolation, read-only/read denial and draft revisions. Three validation tests cover section/all-step checks, isolated versioned snapshots and exclusion of website data from Gmail saves.

Validation: all fifty-one browser cases passed (seventeen stories at 1440px, 768px and 320px), covering the full save-and-advance path with advanced version handoff, mock suggestions/acceptance, live title preview, draft save/discard/keep-editing, required-name/title checks, failures/pending locks, Gmail payload isolation, permissions/revisions, keyboard focus, Axe accessibility and overflow. Desktop shell alignment and side-by-side editor/preview with narrow stacking were explicitly checked. Six additional focused cases verified complete website progression and Gmail handoff after adding the website-only intake boundary. Three validation tests, targeted lint, web type checking, diff whitespace checks and the final Storybook production build passed. Desktop/mobile screenshots reviewed.

Review: `http://127.0.0.1:6007/?path=/story/lead-capture-websitesetuppage--default`, plus `complete-setup`, `preview`, `live-form-text`, `discard-navigation`, `save-failure` and `gmail-handoff`. User approved this page. Continue with the Gmail setup composition.


### Page 3 — Gmail setup composition: approved October 30, 2026

Added GmailSetupPage using the approved setup header/source selection, Gmail account, matching rules, paste-example screen, assistant-guided findings and lead workflow components. One intake section is visible at a time: Email account, Matching rules, Field setup and Lead workflow. The two field screens retain their shared progress navigation, preserve the pasted example on return and focus the new section heading after navigation.

Continue validates and saves before advancing. Extraction binds the findings to the exact submitted email, account, rules, targets and current draft session. Mapping approval requires a matching sample, valid included fields and explicit confirmation, then saves the approved snapshot before showing workflow. Account, rules, example, target or finding changes invalidate approval. Workflow changes preserve approval of the extracted fields. The final Continue revalidates the complete setup and hands off the newly saved draft identity/version to final review; it does not publish or create a lead. Save results must preserve draft identity and advance the version. Pending operations lock editing/navigation. Failed extraction or approval saves retain the user's work. Changed sessions, permissions or account availability prevent stale asynchronous results from advancing the flow.

The header's approved Keep editing/Discard changes dialog preserves corrections or restores the most recent saved snapshot. Website handoff saves source identity only; Gmail data is excluded. Read denial hides configuration, and read-only users can inspect sections without changing or approving fields. Connected account and entitlement checks gate progression. Every Gmail match still requires Intake Review before lead creation.

GmailSetupPagePreview is an explicit in-memory adapter with two fictional accounts, local version checks, literal fixture extraction and scripted assistant follow-up questions for custom fields. Custom targets stay source-local and remain available for review on repeated extraction. No OAuth connection, real email access, model invocation, persistence, publication, routing or lead creation is connected. The integration host must independently authorize, validate and bind all snapshots; the UI approval key is only a freshness marker. Business default assignment and condition-based assignment workflows remain deferred as previously recorded.

Twenty-three stories cover each section, complete setup through a versioned final-review handoff, back-to-example navigation, approval requirements, changed account/rule invalidation, pending and failed extraction/saves, reconnect/entitlement/account-loading errors, read-only/read denial, isolated website handoff, guided custom-field creation and discard/keep editing. Four validation tests cover exact extraction binding, access/account/matching gates, approval freshness and isolated versioned save payloads.

Validation: all sixty-nine browser cases passed (twenty-three stories at 1440px, 768px and 320px), including story interactions, Axe WCAG checks and overflow checks. Desktop navigation/main alignment and Continue keyboard focus were checked explicitly; desktop and phone screenshots were inspected. Four validation tests, targeted ESLint, web typecheck, diff whitespace checks and the Storybook production test build passed.

Review: `http://127.0.0.1:6007/?path=/story/lead-capture-gmailsetuppage--default`, plus `full-setup`, `findings`, `guided-custom-field`, `changed-account`, `changed-rules` and `discard-navigation`. User approved this page. Continue with the final review/publication composition.


### Page 4 — final review/publication composition: approved October 30, 2026

Added CaptureReviewPage using the approved three-step setup header, final setup review and publication instructions. Before launch, the saved snapshot shows source, captured information, workflow, readiness and immediate/scheduled timing. Edit-section and Back actions return navigation intents to the host. Confirmation remains explicit, and the page does not expose public installation artifacts before an accepted launch result. The shared header accepts optional pending/review messages and Save draft visibility so this saved review page shows accurate launch text and omits its unused save action; other header consumers retain their existing defaults.

The launch callback receives an isolated snapshot with the exact reviewed draft identity/version and a retry identifier retained for repeated attempts at that same request. The authoritative host must honor idempotency, reauthorize, revalidate the current saved configuration and reserve source capacity atomically. It must also reconcile uncertain outcomes and preserve idempotency across remounts. UI readiness checks and client request identifiers do not replace that server boundary.

Completion validates the response against draft identity/version, source type/name, source identity/version and requested timing. Website publication artifacts must match that accepted source/version/status and scheduled time; Gmail responses must not contain website installation artifacts. Stale responses cannot advance a changed review or a session that lost read/launch permission. Failures leave the summary and timing available for retry, pending requests lock editing/navigation and duplicate submission, and denied reads hide source details.

A successful website result replaces draft chrome with a focused completion heading and the approved hosted-link/embed installation component, including scheduled availability. Gmail completion shows active/scheduled timing and preserves the Intake Review requirement, with navigation to Intake Review or the source dashboard. Both offer a return to Lead Capture. The host owns actual routing and subsequent source state.

CaptureReviewPagePreview supplies fictional saved summaries/readiness, a frozen clock, local launch responses, reserved example-domain artifacts, clipboard mocks and navigation feedback. No launch, capacity reservation, public hosting, Gmail monitoring, clipboard write or persistence occurs. Actual form hosting remains explicitly deferred to integration step 4. Assistant logic remains after full-page approval and application integration.

Twenty-one stories cover website/Gmail review and immediate/scheduled completion, edit/back intents, missing confirmation, capacity/checking gates, failure/retry identity, pending duplicate submission, mismatched and stale responses, clipboard failure, read-only/read denial, revisions, past scheduling and invalid timezone. Four validation tests exercise launch readiness/timing, exact completion identity, scheduled artifact binding and Gmail/website separation.

Validation: all sixty-three browser cases passed (twenty-one stories at 1440px, 768px and 320px), including interactions, Axe WCAG accessibility and overflow checks. Fifteen focused cases rechecked review and website/Gmail completion after final header/badge refinements; six regression cases verified the shared header's existing default and pending stories. Desktop shell alignment and Back keyboard focus were checked; desktop and phone screenshots were inspected. Four validation tests, targeted ESLint, web typecheck, whitespace checks and the final Storybook production test build passed.

Review: `http://127.0.0.1:6007/?path=/story/lead-capture-capturereviewpage--default`, plus `website-launch`, `website-schedule`, `gmail-launch`, `gmail-schedule` and `failure-and-retry`. User approved this page. Continue with source dashboard/settings.


### Page 5 — source dashboard/settings composition: approved October 30, 2026

Added CaptureDashboardPage using the approved dashboard summary, source details, publication instructions and lifecycle dialogs. Overview shows source status/attention, captured/review/approved totals and the host-supplied source-scoped Intake Review link. Settings keeps the approved configuration separate from an unpublished revision, offers setup/connection navigation only with the corresponding capability, and permits publication navigation independently of editing. Website-only Form installation validates artifact source identity, approved configuration version, current status and schedule before rendering copyable links or code. Section buttons preserve the source snapshot and focus the section content after navigation. The source name remains visible across sections.

Status-eligible lifecycle actions are intersected with host capabilities. Clicking opens a frozen review snapshot; it does not mutate immediately. Pause/resume, archive/restore, scheduled-launch changes and duplication use their approved dialogs. Resuming uses the approved configuration, restoration returns to paused, and copying starts a separate draft without leads/history/publication identity/sample approval. Pending operations lock page controls and dialog dismissal, while failures retain the review and conflicts require reload before confirmation. The host owns authoritative permissions, readiness/capacity checks, concurrency, idempotency, routing and state refresh.

Fixed a configuration presentation edge case in the shared source-details validator: an unpublished draft may remain a draft while archived or restored to paused. It cannot be displayed as approved or resumed before separate setup approval/publication. Draft revisions of published sources still require a newer version and cannot replace the approved configuration in this view. Office archive capability is independent of setup editing, preserving the approved role decision; the actual permission migration remains deferred to integration.

CaptureDashboardPagePreview supplies fictional metrics/configuration, local versioned lifecycle transitions, blocked/pending/error/conflict states and reserved example-domain installation artifacts. Connection/setup navigation and copy operations are mocked. Duplication demonstrates the draft-copy request and leaves the original source unchanged. No API writes, source lifecycle changes, capacity reservations, hosting, OAuth, Gmail access, persistent draft creation or actual clipboard writes occur. The real scoped Intake Review URL and page routing remain integration responsibilities.

Twenty-six stories cover overview/settings/publication and unpublished-form installation guidance, Gmail connection/reconnect, unpublished revisions and drafts, pause/resume, archive/restore including unpublished drafts, immediate/rescheduled launches, duplication, pending/failure/conflict reload, blocked restoration, Office archive, read-only/read denial, loading/retry, metrics retry, mismatched artifacts and publication/intake access boundaries. Four validation tests cover capability/status intersections, draft archive/restore safety, configuration revision separation and publication identity/version/status/schedule binding.

Validation: all seventy-eight browser cases passed (twenty-six stories at 1440px, 768px and 320px), including lifecycle and permission interactions, Axe WCAG accessibility and overflow checks. Twelve regression cases verified the shared source-details default, draft, archived and revision stories. Nine focused cases checked final source identity presentation, simulated source-scoped Intake Review navigation and read denial after the final refinements. Desktop shell alignment and Back keyboard focus were checked explicitly; desktop and phone screenshots were inspected. Four validation tests, targeted ESLint, web typecheck, whitespace checks and the final Storybook production test build passed.

Review: `http://127.0.0.1:6007/?path=/story/lead-capture-capturedashboardpage--default`, plus `settings`, `publication`, `gmail-settings`, `pause-and-resume`, `archive-and-restore`, `archived-draft-restore` and `office-archive`. User approved this page, including both menu/tab revisions. Next: compose the Intake Review queue page.


Page 5 review revision: moved lifecycle controls into a three-dot Source actions menu beside Open Intake Review in the Overview source header. Settings and installation sections retain the same menu in the page header. The former bottom-row action buttons are removed. The shared summary accepts an optional action slot and retains its existing default behavior. The menu uses the established MUI menu and shared MoreHoriz icon, with source/status capability filtering, disabled pending controls, keyboard navigation and Escape/focus return. It waits for menu dismissal before opening a review dialog, and rejects stale source/version/capability snapshots at handoff. Existing lifecycle confirmations and Office archive capability remain intact. Updated lifecycle stories use menu items, and a keyboard story covers opening, arrow navigation and closing without mutation.


Menu revision validation: all eighty-one dashboard browser cases passed (twenty-seven stories at desktop, tablet and phone widths), including lifecycle handoff, keyboard/focus and permission behavior. Three additional open-menu cases verified placement beside Open Intake Review, all three current-source actions, Axe accessibility and overflow; desktop/phone screenshots were inspected. Six shared-summary regression cases, targeted lint, web typecheck, whitespace checks and the Storybook production build passed. Page 5 subsequently approved October 30, 2026.


Page 5 second review revision: moved Open Intake Review into the Source actions menu and placed that menu beside Back to Lead Capture in the page header on every section. The Intake Review menu item appears only with read access and a valid host-supplied scoped URL; view-only users can retain that navigation without receiving lifecycle controls. The Overview summary no longer renders a separate Intake Review link. Replaced section-toggle pills with a connected underline tab bar, active-tab background/text/border styling, tablist/tab/tabpanel semantics, roving focus and Left/Right/Home/End keyboard navigation. Selecting a tab retains tab focus; its associated panel is keyboard accessible.

Validation: all eighty-four dashboard cases passed (twenty-eight stories at 1440px, 768px and 320px), including tab keyboard navigation, menu navigation/confirmation, permissions, accessibility and overflow. Three additional cases checked the open header menu, its four authorized items, placement beside Back to Lead Capture and Axe accessibility. Desktop/mobile screenshots were inspected. Targeted lint, web typecheck, whitespace checks and the Storybook production build passed. Page 5 subsequently approved October 30, 2026.


### Page 6 — Intake Review queue composition: approved October 30, 2026

Resumed from the approved Page 5 checkpoint after the application closed. Added IntakeReviewPage using the approved toolbar, list and shared pagination, following prototype screen 26 and the existing page shell. The queue defaults to Awaiting review and supports search, source, status and review flags. Source-scoped entry uses the same controlled filter, with authorized archived-source history and an unavailable-source state. Review and View details hand off the selected item to the host without applying a decision. Record-level open/review capabilities remain separate from page read access.

The controlled host owns authorized queries, URL state, pagination resets, current record access and detail navigation. The Storybook-only preview demonstrates case-insensitive fixture search, combined filters, page resets, local retries and simulated navigation. Loading and pending states lock interactions, row/source errors retain filters, read-only users can inspect details, and denied reads hide queue data and filters. No routes, persisted intake queries, email access, lead creation, approval, dismissal or assistant logic are connected.

Browser accessibility checks found that the shared DataTable scroll area was unreachable when all row actions were disabled or restricted. It now has a named keyboard focus target and visible focus ring; no row actions or mutations were added. The pending queue story includes a regression check for keyboard scrolling when the desktop table is visible.

Validation: twenty-one queue stories passed sixty-three browser cases at 1440px, 768px and 320px, including interactions, Axe WCAG checks and overflow checks. Twelve existing shared-table story cases passed across those widths. Desktop shell alignment and search keyboard focus were checked, and desktop/phone screenshots were inspected. Targeted lint, web type checking, whitespace checks and the final Storybook production test build passed.

Review: `http://127.0.0.1:6010/?path=/story/lead-capture-intakereviewpage--default`, plus `source-scoped`, `archived-source-history`, `flags`, `history`, `pagination`, `read-only` and `error-and-retry`. Port 6007 was already occupied, so this resumed preview uses port 6010. User approved this page October 30, 2026. Continue with intake detail composition.


### Page 7 — intake detail composition: approved October 30, 2026

Added IntakeDetailPage using the approved source evidence, proposed-lead editor, duplicate decision and final decision review components, following prototype screen 27 and the shared workspace shell. The original email or website submission stays separate from reviewer corrections and remains visible beside the editable proposal on desktop, with narrow stacking. Corrections retain original extraction flags. Resolved items show their saved decision and read-only details; missing/loading/error/denied states hide unavailable content.

Review decision freezes the exact authorized context before presenting the approved final review component. Nothing is submitted until its explicit confirmation. Required fields, duplicate choice, permissions, capacity and access checks gate progression; linking and dismissal do not require new-lead capacity. The host must advance the review revision and clear duplicate approval when corrections, candidates, workflow or permissions change. Candidate summaries are also intersected with current visibility and link access before either comparison or final review. Evidence must match the intake identity/version. Confirmation payloads must exactly match the frozen review, including definition/workflow and existing-lead versions where relevant.

Pending confirmation/reload locks editing and page navigation, with an in-flight guard against repeated submits. Retry identifiers survive returning to details and reopening the same review within this mounted page. Changed context or revoked read access prevents an old completion from advancing the page. Conflicts remain blocked after returning to details and editing corrections, until an explicit reload supplies a refreshed context; reload can advance the review revision without changing the intake version. Capacity failures keep new-lead creation blocked while permitting a separately reviewed link or dismissal. Corrections survive failures and Back to details. Leaving with unsaved changes opens the shared Keep reviewing/Discard and leave dialog; browser unload is guarded while corrections or an operation are pending. The integration host remains responsible for other routing guards, authoritative reauthorization/concurrency, idempotency across remounts, uncertain-outcome reconciliation and accepted result semantics.

IntakeDetailPagePreview supplies fictional Gmail/form originals, local versioned corrections/candidate projections, explicit duplicate dispositions, simulated reloads and scripted service outcomes. Completion acknowledges only the mocked accepted result. No routes, backend reads/writes, real lead creation/update/dismissal, Gmail access, notifications, assignment resolution or assistant/model behavior are connected. Assistant integration remains after application integration, and public hosting remains explicitly tracked in integration step 4.

Thirty-six stories cover Gmail/website evidence, correction and required-field review, create/link/separate/dismiss outcomes, selected changes, stale duplicate approval, candidate access/retry, capacity/checking states, read-only/resolved/denied access, pending locks and browser-unload protection, retry identity across review remounts, conflict reloads, capacity races, stale/revoked confirmation, keep/discard navigation, missing/error/loading states, evidence mismatch, untrusted text and long content.

Validation: all thirty-six stories passed 108 browser cases at 1440px, 768px and 320px, including interactions, Axe WCAG accessibility and overflow checks. Fifteen additional focused cases checked the final default/resolved/missing-field/pending states and browser-unload guard. Six conflict/capacity regression cases passed again after adding same-intake-version reload recovery. Desktop shell alignment and Back keyboard focus were checked explicitly; desktop/phone screenshots were inspected. All eighteen intake validation tests across five files passed, including three new composed-boundary tests. Targeted lint, web type checking, whitespace checks and the final Storybook production test build passed.

Review: `http://127.0.0.1:6010/?path=/story/lead-capture-intakedetailpage--default`, plus `website`, `duplicate`, `correct-and-review`, `link-selected-changes`, `separate-lead`, `dismiss-at-capacity`, `conflict-and-reload` and `keep-corrections`. User approved this page October 30, 2026. All seven planned page compositions are now approved. Application contracts and persistence are the next phase; see the [proposed integration step 1 design](lead-capture-integration-step-1-plan.md) for review before implementation.


### Integration step 1 — design prepared October 30, 2026

Prepared the [contracts and persistence design](lead-capture-integration-step-1-plan.md) after approval of Page 7. It specifies canonical names/legacy mapping, tenant-aware records and constraints, immutable evidence versus corrections, stored review/operation identities, conservative policy migration and Office archive defaults, and local implementation/rehearsal acceptance criteria. It also records dependencies on the existing authenticated lead-creation boundary, default assignment, tags, current runtime grants and later provider/public-hosting work. The design awaits user review; no runtime code, database migration, public hosting, Gmail connection or deployment was changed in this checkpoint.


### Integration step 1 — foundation implemented October 31, 2026

User approved the contracts/persistence design with “go”. Implemented strict shared schemas, twelve tenant-owned persistence tables and immutable/version/uniqueness constraints, canonical permission/billing/provenance adapters, conservative Office archive migration, and reproducible disposable-database/service rehearsals. Source/intake APIs remain disabled. [Implementation, compatibility inventory and verification](lead-capture-integration-step-1-qa.md) records the passing checks, the separate application-browser harness limitation, local-only migration scope and required permission-cutover sequencing. User approved this implementation and authorized integration step 2.


### Integration step 2 — persisted drafts connected October 31, 2026

Implemented authorized draft create/read/save, published-source draft revision creation, scoped source list/detail projections and the approved connected list/setup/review/dashboard pages. The user selected one wizard URL per source; step and panel use query parameters. Draft retries are idempotent, concurrent stale writes preserve corrections, and provider/publication/assistant/lifecycle/intake writes remain disabled for later checkpoints. [Verification and local rollout notes](lead-capture-integration-step-2-qa.md) include the passing real-browser flow, runtime-role database rehearsal, unit tests, typechecks and eight responsive Storybook previews. Main local development database remains unchanged because its pending chain includes unrelated admin work. User approved this checkpoint October 31, 2026, including the final header/content/footer placement. The step 3 publication/capacity design was subsequently approved; its implementation and QA checkpoint were approved October 31, 2026.


### Integration step 3 — publication and capacity implemented October 31, 2026

The user approved the [step 3 design](lead-capture-integration-step-3-plan.md) before implementation. Added authoritative saved-version review and approval, atomic immutable configuration/publication/receipt/event writes, shared source-capacity and downgrade checks, persisted scheduled transitions, worker reconciliation and in-app admin notices. Production activation remains blocked until real website or Gmail delivery is implemented; no installation artifacts are fabricated. [Verification and rollout limits](lead-capture-integration-step-3-qa.md) record the disposable runtime-role database rehearsal, unit suite, application browser flow and final review-preview checks. User approved this implementation checkpoint October 31, 2026. Step 4 public hosting is now in design; the user selected forms.salesmora.ai as the dedicated public domain.


### Integration step 4 — hosting design started October 31, 2026

User approved step 3 and selected `forms.salesmora.ai` as the dedicated public form origin. This is a domain/design decision; DNS, TLS and deployment have not been performed. [Step 4 design draft](lead-capture-integration-step-4-plan.md) tracks hosted and embedded delivery, durable submission handling, abuse protection and verification. The user selected Cloudflare Turnstile for suspicious submissions October 31, 2026. The user approved initial per-form/IP limits October 31, 2026: challenge after five attempts per rolling ten minutes, reject beyond twenty, and exclude committed exact retries from the new-submission count. The already approved Settings → Leads → Default assignment prerequisite will be included before inherited-default publication. The user approved explicit Leave leads unassigned initialization for new and existing workspaces October 31, 2026; source-specific teammate choices stay intact. The user approved the step 4 design and 4a–4f implementation sequence October 31, 2026. Slice 4a Default assignment and visitor challenge-state component previews are implemented and verified (138 browser cases, seven validation tests, web typecheck and focused lint). User approved the 4a components October 31, 2026; 4b page/persistence integration is implemented and verified, user approved October 31, 2026 before public rendering (4c).


### Integration step 4a — component previews ready October 31, 2026

Added the Default assignment settings component with the approved initial unassigned rule and an eligible-teammate alternative, including access/loading/conflict/pending/save-retry states. Extended the existing visitor form with host-controlled challenge and rate-limit states plus fixed-payload retries after uncertain responses; challenge token refresh retains the submission identity. All 46 stories passed desktop/tablet/mobile interaction, accessibility, overflow and browser-error checks (138 cases). [Verification and preview links](lead-capture-integration-step-4a-qa.md). Persistence, page composition, real Turnstile and public delivery remain subsequent slices. User approved the component checkpoint October 31, 2026. Continue with 4b.


### Integration step 4b — persisted assignment and page ready October 31, 2026

Implemented strict saved-version assignment contracts, a forward migration with explicit initial unassigned rules for existing/new workspaces, immutable setting-change audit, permission-checked read/save and a shared authoritative assignment resolver. Settings → Leads is composed and connected through its settings overview card and navigation entry. Saves preserve retry identity and reject stale versions; conflicts retain corrections and require confirmed reload. Publication and scheduled activation now resolve the persisted business default while keeping explicit source teammates independent. Missing rules and unavailable teammates fail closed; real delivery remains blocked.

Verification: 3,397 unit tests, ten assignment database groups, 18 publication regression groups, 27 responsive/accessibility Storybook cases, the connected Chromium settings/capture flow, all workspace typechecks and focused lint passed. [QA and local review](lead-capture-integration-step-4b-qa.md). Configured databases were not migrated or deployed. User approved 4b October 31, 2026; continue with 4c hosted rendering/origin isolation.


### Integration step 4c — hosted rendering and isolation ready October 31, 2026

Implemented canonical public/embedded routes using the approved visitor form, safe approved-only projections with hidden-contact scrubbing, lifecycle/access availability gates, signed expiring public-version contexts, host/session isolation and framing/CSP/referrer/cache policies. Submission stays disabled and real publication readiness remains unavailable; the loader, installation artifacts and rollout remain later slices. The public hostname and independent signing key are explicit server configuration.

Verified 3,402 unit tests, nine runtime-role public database groups, 108 responsive/accessibility Storybook cases, a two-origin Chromium hosted/iFrame/auth-isolation flow with signed-context and CSP nonce checks, all workspace typechecks and focused lint. [QA and local review](lead-capture-integration-step-4c-qa.md). Configured databases and production/DNS/TLS are unchanged. User approved 4c October 31, 2026; continue with 4d durable submissions, admission and abuse enforcement.


### Integration step 4d — durable submissions ready October 31, 2026

Connected the hosted/iFrame visitor form to a strict public submission endpoint with durable receipt idempotency, shared abuse counters, conditional Turnstile and atomic lead-or-intake admission. Original answers/consent, source/version provenance, resolved assignment, configured stage/tags and notification intent are retained together. Stale refresh, lost-response retries, challenge failures and rate limits preserve visitor input. Monthly capacity honors the approved workspace transition, with duplicates/incomplete/capacity/unavailable-assignment submissions held for staff review.

Verified 3,409 unit tests, 16 runtime-role submission database groups, five manual/chat admission regression groups, 132 responsive/accessibility Storybook cases, a two-origin Chromium submission/challenge/retry/refresh/iFrame flow, all workspace typechecks and focused lint. [QA and review links](lead-capture-integration-step-4d-qa.md). Configured databases, production provider accounts, DNS/TLS and deployment are unchanged; production publication authority remains disabled. User approved 4d November 1, 2026; continue with 4e embed loader and installation projection.


### Integration step 4e — loader and installation ready November 1, 2026

Added the canonical forms-host `/embed.js` loader and bounded parent/child resize handshake, using an isolated iFrame and metadata-only messages validated by origin, child window and random channel. Existing publication/settings instructions now receive actual persisted hosted/iFrame/JavaScript artifacts through the authorized source detail projection. Approved revisions keep their URLs and snippets. Production artifacts/publication remain gated for 4f; explicitly configured local delivery is exercised by disposable fixtures.

Verified 3,412 unit tests across 206 files, ten runtime-role public/installation database groups, 210 responsive/accessibility Storybook cases and two Chromium flows across application/forms/customer-host origins, including third-party cookie restrictions, resize forgery rejection, challenge failure/retry, revision identity and unavailable lifecycle/suspension states. All workspace typechecks and focused lint passed. [QA and local review](lead-capture-integration-step-4e-qa.md). Configured databases, production credentials, DNS/TLS and deployment are unchanged. User approved 4e November 1, 2026; continue with 4f rollout preparation.


### Integration step 4f — staging rollout prepared November 1, 2026

The user selected `forms-staging.salesmora.ai` first and reserved `forms.salesmora.ai` for production. Prepared a thin private-upstream gateway, production Dockerfile, staged variable fragments, a GET-only public smoke command and source/migration inventory. Gateway guards canonical routes/host, sanitizes Railway edge identity and strips sessions; web is prepared for dual-stack private networking. The staging forms hostname also fails closed if public configuration is missing.

Read-only Railway plans retain every current resource and propose only gateway creation; the existing files bucket was explicitly retained to correct a dangerous graph omission. The [concrete rollout proposal](lead-capture-integration-step-4f-rollout.md) covers DNS/TLS, widget/secrets, operating caps, migration/backup order, bounded canary verification, activation and recovery. Source comparison identifies 19 additional migrations, including separate admin work; that full scope requires release review. The live ledger was not re-read because no SSH key is registered. No key was added, and no infrastructure, DNS, variables, deployment or configured database was changed. Live verification and publication activation remain unfinished.


### Lifecycle API backend checkpoint — November 1, 2026

Implemented confirmed, version-bound pause/resume/archive handlers using source-scoped authorization, the dedicated pause/archive permissions, persisted approved-only resume readiness, actor-bound retries, atomic pending-schedule cancellation and retained receipt/intake/history. Newly observed access-loss reconciliation commits before returning a reload conflict. Verified eight new runtime-role database groups, 18 publication regressions, 3,419 unit tests, workspace types and focused lint. [Backend contract and QA](lead-capture-lifecycle-api.md). Ready for review before connecting the already approved confirmation dialogs/list/dashboard actions. Hosted services and disabled publication/submission settings were not changed by this local implementation.


### Connected lifecycle UI checkpoint — November 1, 2026

Connected the approved pause/resume/archive dialogs from source-list and dashboard actions to the lifecycle API. Fresh server reads provide bound source/approval versions, capabilities and shared readiness; uncertain retries preserve commands, conflicts require reload, revoked access clears stale detail and successful changes refresh the filtered host. Verified 3,422 unit tests, 27 database groups, four authenticated local browser journeys and 36 responsive Storybook cases plus keyboard/footer reachability at three widths. [UI review and preview links](lead-capture-lifecycle-ui.md). Ready for review; staging and publication activation are unchanged.

### Lifecycle deployment and restricted runtime checkpoint — November 1, 2026

After review approval, deployed the frozen lifecycle backend/dialogs to staging, then completed the approved web/worker restricted-role cutover with strict startup enforcement. A fresh off-volume backup passed full scratch restoration (168 table counts, 112 migrations). Actual runtime connections, rolled-back auth-store writes, worker readiness, HTTP security boundaries and unchanged retained test evidence passed. Live archived-form embeds passed explicit third-party-cookie restriction, resize forgery/malformed-message rejection, three responsive widths and keyboard traversal. [Deployment](lead-capture-lifecycle-staging-20261101.md) and [runtime-role/embed evidence and remaining limits](lead-capture-runtime-cutover-20261101.md). Public submissions/general publication remain disabled; active hosted cookie-blocked entry/submission and delivery/scheduler activation are subsequent review checkpoints.

### Active staging browser checkpoint — November 1, 2026

Following approval, one new fictional source was published with bounded operator authority and no assignment emails. Exactly three real submissions passed: 320-pixel hosted page, cookie-blocked direct iframe and cookie-blocked loader. Multiple embeds, forged/malformed resize rejection, success shrinking, keyboard traversal and three responsive widths passed. The canary was archived through the confirmed lifecycle service, transport disabled, all 12 receipts retained, prior evidence unchanged and temporary SSH access revoked. [Active browser results and remaining review boundary](lead-capture-active-embed-20261101.md). General publication/delivery and scheduler activation remain disabled.

### Website activation design review — November 1, 2026

Reviewed the matching frozen source and identified missing authority propagation through reads/writes, suppressed production installation projection, retention-mode scheduler gating and the need to isolate scheduler candidate scope. Prepared the [concrete activation design](lead-capture-activation-plan.md): explicit workspace allowlist, shared web readiness decisions, a bounded authenticated private worker readiness exchange, independently enabled scoped scheduler, defaults off, no Gmail/new schema and staged local/hosted verification. This checkpoint changes documentation only; implementation and staging activation follow review.


### Full assistant integration design — November 2, 2026

The user requested a fully capable Lead Capture assistant comparable with the other features and approved the [assistant implementation plan](lead-capture-assistant-plan.md). It covers source discovery/summaries, website setup and reviewed draft changes, pasted-sample Gmail mapping, publication/lifecycle/installation and complete intake guidance/decisions. It extends the existing shared assistant, typed tools, evidence/history validation and explicit confirmation model. The initial audit found no registered capture assistant surfaces/tools, disabled connected setup suggestions and incomplete intake application services; the plan includes those dependencies rather than treating a help-only connection as completion.

Checkpoint one is implemented locally: six planned surfaces, eight read/21 proposal operations, strict context/query/evidence/version-bound proposal contracts and current-permission policy. No tool is registered for execution yet. The [contracts checkpoint](lead-capture-assistant-contracts.md) records service gaps, including centrally unreviewed intake corrections. Validation passed: 468 tests, contract/agent typechecks and focused lint. Next is review of canonical assistant presentation/stories. No hosted changes or migrations were made.

Checkpoint one was approved. The [presentation checkpoint](lead-capture-assistant-ui.md) now composes canonical result/setup/publication/lifecycle/intake components inside one client-driven assistant adapter, with standalone and actual shared-modal stories. It verifies fixed proposal bindings, disabled/expired/denied/conflict states, explicit confirmation and server-reported outcomes. Validation passed: 72 browser interaction/accessibility/layout cases at three widths, 47 focused unit/contract tests, web typecheck and focused lint. Next is presentation review, followed by authenticated page context and read-tool integration. No handler or hosted activation was enabled.

Checkpoint two was approved. [Checkpoint three](lead-capture-assistant-reads.md) now connects the actual source pages to the shared assistant and registers five authorized capture read operations, with typed streaming tickets, persisted current-evidence checks, private history and safe record navigation. Validation passed: 3,496 unit tests (excluding an unrelated manual worker helper), seven disposable runtime-role database groups, six authenticated fixture-model journeys, 99 story checks, package types and lint. One additive local-only chat evidence migration is included. Next is read-integration review, then setup suggestions and explicitly confirmed draft writes. Staging remains unchanged.

### Website activation staging deployment — November 2, 2026

The frozen activation candidate `2e914a3c...` is deployed successfully to staging web and worker with publication, submission transport and capture scheduling off. Effective runtime roles, retention readiness, HTTP access boundaries and exact preservation of the 112-name ledger/12-receipt evidence were verified. Temporary SSH access was revoked and erased. See the [staging checkpoint](lead-capture-activation-staging-20261102.md). The separately reviewed scoped pilot remains next.

### Website activation local implementation — November 1, 2026

Implemented the approved scoped website authority across authenticated publication, resume, read reviews and production installation projection; added the bounded authenticated private readiness exchange and independently enabled, workspace-filtered worker scheduler. Defaults remain off, Gmail remains unavailable and no schema/dependency version changed. The isolated candidate passed 3,431 unit tests, 28 publication/lifecycle database groups, five native gateway groups, all workspace types/lint and three actual authenticated browser journeys including a real private-probe scheduled launch and readiness-loss block. [Implementation, artifacts and validation limits](lead-capture-activation-qa.md). No hosted deployment, token provisioning or activation occurred in this checkpoint.


### Lead Capture assistant setup checkpoint — November 2, 2026

The connected-read checkpoint was approved. [Checkpoint four](lead-capture-assistant-setup.md) implements eight source draft/setup operations through `lead_capture_propose_action`, durable author-owned proposals, exact browser confirmations, inherited evidence validation and canonical source services. Website fields/workflow and pasted Gmail extraction/refinement use the shared assistant; applying suggestions remains separate from Save. The canonical Gmail findings approval retains exact corrections/sample/rules/mappings in a setup-only table that cannot satisfy provider publication readiness. Saved matching samples restore after reload. The additive setup migration remains local-only. Verified November 3: 3,506 full-suite unit cases plus final adapter regressions, eight runtime-role database groups, nine browser journeys across complementary runs, 123 responsive story checks, package typechecks and lint. Ready for setup review; publication/lifecycle and intake assistant operations remain later checkpoints.
