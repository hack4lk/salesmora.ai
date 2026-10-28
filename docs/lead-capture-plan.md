# Lead Capture implementation plan

Status: draft for interactive review, October 28, 2026. No implementation approved yet.

## Confirmed delivery requirements

- Rename Campaigns to Lead Capture throughout the product and its supporting references.
- Base flows on the current prototypes, adapting them to current shared components and branding.
- Review planning decisions one question at a time.
- After plan approval, implement one Storybook component, validate it, and pause for user review. Incorporate requested changes before advancing.
- Assemble full page stories only after their components are approved; connect approved pages to application services afterward. Implement assistant behavior after page integration.

## Existing evidence and discrepancies

- `prototype/prototype-screen-17-campaigns.html`: list, status filters, archived view, lifecycle controls.
- `prototype/prototype-screen-18-source.html`: naming and website/Gmail source selection.
- `prototype/prototype-screen-19-website-brief.html`: business brief, field suggestions and intake plan.
- `prototype/prototype-screen-20-form-editor.html`: field editor and visitor preview.
- `prototype/prototype-screen-22-gmail-scope.html`: Gmail connection and scope.
- `prototype/prototype-screen-23-gmail-rules.html`: matching/mapping configuration. The files named gmail-preview and gmail-field-mapping currently redirect to gmail-workflow; they are not separate implemented designs.
- `prototype/prototype-screen-23-gmail-workflow.html`: post-approval configuration.
- `prototype/prototype-screen-25-campaign-review.html`: approval, launch and publication instructions.
- `prototype/prototype-screen-26-intake-review.html` and `27-intake-detail.html`: queue, evidence, edits and duplicate decisions.
- `prototype/prototype-screen-28-campaign-dashboard.html`: source health and metrics.
- `docs/user-journeys.md` and `docs/campaign-dashboard.md` previously place website and Gmail in Phase 1. Advanced follow-ups, job conversion, external destinations and expanded analytics are deferred there, despite appearing in prototypes.
- Older documents describe Owner/Admin/Member access. The current permission catalog uses Owner/Admin/Office/Field; Office currently has default read/create/update/activate/pause access, while archive defaults to Owner/Admin. Resolve this explicitly before changing access.
- Existing billing defines concurrent published-source limits (Free 1, Standard 5, Premium unlimited). Gmail is documented as Standard/Premium. Lead creation already has a shared admission boundary; capture must reuse it.
- Navigation currently uses `campaigns` and `/campaigns`; authorization, billing and lead provenance also contain technical campaign identifiers. These require compatibility planning rather than unchecked text replacement.

## Proposed first release — pending scope approval

Website forms and Gmail intake, delivered in that order. Website sources provide an embeddable form and hosted link. Gmail uses an explicitly connected account, visible phrase rules, confirmed field mapping and a tested representative sample, then supervised Intake Review.

Shared features: drafts, setup review, launch, source status, list/dashboard, pause/resume, archive/restore, assignment, initial lead stage/tags, owner notification and source provenance. Scheduling, duplication and reusable templates are documented requirements whose first-release inclusion needs an explicit decision.

Keep follow-up sequences, automatic Gmail approval, round robin, external delivery, automatic job conversion and advanced analytics out of the proposed first release. Do not build their controls from the prototypes until separately approved.

## Decisions to review sequentially

Ask only the next unresolved question. Record answers here before proceeding.

| ID | Decision | Proposed starting point | Status |
| --- | --- | --- | --- |
| Q1 | First-release source scope | Website/shareable links and Gmail; website first | Open |
| Q2 | What one configured item is called | Lead Capture is the section; call an individual item a capture source, with Create capture source as the action | Open |
| Q3 | Rename technical references and compatibility | New code/routes use lead-capture naming; migrate stored permission/billing/provenance references with explicit compatibility for old data/links | Open |
| Q4 | Access by current roles | Preserve the reviewed permission catalog unless explicitly changed; explain Office/Field capabilities during review | Open |
| Q5 | Website admission and duplicate behavior | Direct lead creation for valid submissions; review uncertain/duplicate cases; confirm this against desired queue behavior | Open |
| Q6 | Form field capabilities and visitor experience | Confirm fields, required/optional rules, success message, consent, spam protection and unavailable message | Open |
| Q7 | Gmail matching, mapping and examples | Case-insensitive phrase rules, AND/OR, subject/body/both; visible evidence and at least one confirmed retained sample | Open |
| Q8 | Intake Review actions and duplicate handling | Approve/edit/dismiss, explicit link/update versus separate lead; no automatic merging | Open |
| Q9 | Default assignment, stages, tags and notifications | Business default or selected teammate; existing lead stages; notify assigned owner | Open |
| Q10 | Lifecycle and first-release extras | Define schedule, duplicate, templates, archive/restore and edits to already active configuration | Open |
| Q11 | Capacity and subscription behavior | Confirm which states consume a slot, downgrade behavior and treatment of pending items when lead capacity is exhausted | Open |
| Q12 | Dashboard and list | Captured/Approved lifetime totals, Awaiting Review current count; no date filtering or advanced funnel | Open |
| Q13 | Assistant scope | Read/explain first, then explicitly reviewed configuration proposals; publication requires an app confirmation | Open |
| Q14 | Approve implementation order | Confirm component inventory and first component before coding | Open |

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
10. Gmail connection/scope: connect/reconnect, selected account, label/scope and connection failure states.
11. Gmail matching rules: phrase input, matching location and AND/OR behavior.
12. Gmail field mapping: CRM field choices, extraction rules, missing/ambiguous values.
13. Gmail sample preview: selected/pasted example, matched phrases, proposed values and source evidence.
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

1. Define strict contracts and persisted records: tenant, source identity/type/status, versioned drafts/approved configuration, publication identity, Gmail scope/cursor, retained sample, intake decision/evidence and audit events. Final tables and migrations follow approved decisions.
2. Implement authorized draft CRUD and source list/detail queries; bind the approved list/setup pages. Enforce tenant and record access on the server.
3. Implement version-bound approval/publication and capacity reservation atomically. Define concurrent launch and downgrade behavior before shipping.
4. Implement public hosted/embed submission with server validation, abuse limits and retry deduplication; create leads through the shared admission use case and preserve immutable source provenance.
5. Implement Gmail OAuth and token lifecycle, minimal approved scopes, ingestion jobs, cursor recovery and deduplication by account/message identity. Confirm provider setup and consent requirements before integration. Do not mark simulated connections as working.
6. Implement authorized Intake Review, atomic approve/dismiss/duplicate disposition, optimistic concurrency and retry safety. Apply approved assignment/stage/tags and notifications once.
7. Bind dashboard aggregates to persisted source/intake events. Captured excludes transport retries; Approved counts an intake item once; Awaiting Review reflects undecided items.
8. Complete lifecycle semantics: website unavailable state, Gmail pause/resume backlog, archive history and explicit restore review; include approved extras only.
9. Integrate assistant tools after pages work: authorized reads and reviewed proposals, current configuration binding, audit and provider failures. Treat captured content as untrusted input.
10. Finish the reference migration: product copy, prototypes, active docs, permission labels, billing wording, assistant/help corpus, tests and scripts. Track intentional compatibility aliases; update knowledge versions where required. Preserve historical evidence rather than silently rewriting recorded events.

## Verification and approval record

For each UI item: default, empty, loading, error, disabled/permission and relevant pending/conflict states; keyboard/focus behavior, accessibility, narrow/wide layouts and targeted interactions. Run relevant lint and type checks, and build checks appropriate to the delivered slice. Record the exact story, evidence, limitations and user approval before the next item.

For integration: tenant isolation, role grants, capacity races, ingestion retries, duplicate approval, stale edits, public abuse, unsafe email markup, pause/archive enforcement and atomic lead/notification behavior. Exercise real website submission and provider-backed Gmail flows separately from mocked stories.

Implementation has not started. Q1 is the next decision.
