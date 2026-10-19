# SalesMora.ai implementation start plan

**Status:** Proposed delivery sequence for review; no application implementation authorized by this document.
**Prepared:** October 9, 2026.

**Delivery priority update:** Begin product implementation with registration, login, and the accepted organization onboarding flow. Track package installation, screen delivery, and real account wiring in the [auth and onboarding build tracker](auth-onboarding-build-tracker.md). Complete this milestone before expanding into the lead/assistant vertical slice below; the broader foundation and launch gates still apply.

## 1. Verified starting point

Repository inspection succeeded at `/Users/lukasz/dev/salesmora.ai`. At inspection, the checkout was on `main`, tracking `origin/main`, at `bdb54f4` (Merge pull request #3 from hack4lk/prototype).

The repository contains product/architecture documentation, branding assets, and standalone HTML prototypes. There is no application package manifest, workspace configuration, application source tree, migration history, Compose configuration, or runnable application test suite. The README's statement that application implementation has not started is supported by the files, rather than assumed from metadata. The only pre-existing untracked item reported by Git was `branding/.DS_Store`; leave it alone.

This plan adds documentation only. It does not provision services, install packages, change prototypes, or implement application code. Provider availability, prices, terms, model API identifiers, and service configuration have not been independently rechecked during this repository inspection; verifying those is an explicit delivery gate below.

## 2. Governing documents and scope reconciliation

| Source | What it governs |
|---|---|
| [Product roadmap](salesmora-product-roadmap.md) | Product phases, architecture, providers, provisional plans, launch constraints |
| [Application structure](application-structure-plan.md) | Approved workspace packages, routing, dependency direction, UI and tooling |
| [Agent architecture](context-aware-agent-architecture.md) | Surface registry, tool policies, checkpointer, model evaluation, knowledge retrieval |
| [User journeys](user-journeys.md) and [onboarding](first-login-onboarding.md) | Roles, work profiles, owner/invitee entry, fixed lead pipeline, supervised intake |
| [Job plan](job-module-plan.md), especially delivery phases | Phase 1 jobs, attachments, chat, basic deadlines; later automation boundaries |
| [Campaign dashboard](campaign-dashboard.md) | Approved Phase 1 metrics, access, plan gates |
| [Reports/export](reporting-and-data-export.md) | Reports, date semantics, CSV scope and authorization |
| [Privacy baseline](privacy-and-messaging-baseline.md) | Data handling and legal/security review gates |
| [Local development](local-development.md) and [branding](branding.md) | Environment/migration policy, shared theme, fonts, assets |
| [Prototype plan](interactive-prototype-plan.md) and `prototype/` | Interaction references; simulated or later-phase screens do not expand implementation scope |

Use explicit approved decisions and phase-specific sections when older summary prose conflicts. Record the following corrections before implementing the affected feature:

- README calls authenticated email intake “future” and mentions configurable pipelines. The explicit Phase 1 decisions include supervised Gmail; the MVP lead stages are fixed: New, Contacted, Estimate sent, Won, Lost.
- Reporting prose places campaign capture/Gmail later. The roadmap, journeys, and approved campaign dashboard put website and supervised Gmail intake, plus basic intake metrics, in Phase 1. Advanced campaign analytics remain later.
- User-journey job statuses omit Needs Scheduling. The detailed job plan includes it and starts unscheduled jobs there. Lead stages and job statuses are separate concepts.
- Campaign-triggered job conversion is Phase 2. Phase 1 supports explicit manual lead-to-job conversion; a move to Won must not accidentally enable the deferred campaign automation.
- Basic optional per-job deadline, due/overdue alert, private attachments, and team-visible job chat are Phase 1 in the job plan. Multi-offset reminders and expanded notification controls remain Phase 3. Reports must reflect implemented fields without importing advanced operations analytics.
- The roadmap places estimate lifecycle in Phase 3; the job plan's Phase 4 reference should not postpone that roadmap commitment. It does not affect this Phase 1 implementation sequence.
- Clarify retention boundaries between immutable shared job chat/progress history and the agent's deletable 90-day task/checkpoint history before chat persistence is built. Resolve the data classification explicitly; do not silently delete business history or retain every checkpoint indefinitely.

Remaining feature proposals in working documents need a decision only when the affected work is reached. They do not block repository bootstrap.

## 3. Settled implementation choices

- One pnpm workspace: `apps/web`, `apps/worker`, and separate `packages/contracts`, `domain`, `data`, `agent`, `ui`. Keep domain rules independent of Next.js, Knex, queue clients, and model SDKs.
- Next.js App Router + TypeScript; semantic URLs, persistent workspace shell, shared navigation order. Implement routes incrementally; show later destinations as unavailable without creating nonfunctional product flows.
- Tailwind CSS for styling and colocated component data files for copy (see [component conventions](component-conventions.md)); MUI and `@mui/icons-material`; shared Blue & Seafoam theme and Mosaic assets; self-host Source Sans 3 with its license. No favicon files, routes, metadata, or website favicons as UI icons.
- PostgreSQL + Knex; one migration history and one controlled migration step per deployment. PostgreSQL owns business state, drafts, approvals, audit history, and durable workflow state.
- Railway web and separate Node.js worker services. BullMQ on custom Railway Redis with AOF, `maxmemory-policy=noeviction`, and persistent `/data` volume. SalesMora owns Redis operations, upgrades, backups, and recovery.
- Railway PostgreSQL-with-extensions template with `vector` enabled for curated help retrieval. Pin and verify PostgreSQL/pgvector versions, restore, and upgrades in staging. Keep live CRM queries relational.
- LangChain standard tool loop with PostgreSQL-backed LangGraph checkpointer; explicit graphs only where bounded workflows require them. Server-resolved page context; read/draft/confirmed-commit tools; approval before consequential actions.
- OpenAI API: evaluate GPT-6 Luna first; compare GPT-6.1 Sol only if Luna misses the agreed bar. Verify actual available API model identifiers before implementation; display names do not establish API availability.
- Resend for app email, with pay-as-you-go overages disabled; Mailpit locally. Gmail remains read-only and supervised for Phase 1.
- Owner/Admin/Member permissions; Office/Field profiles affect presentation only. Owner controls billing. Owners/Admins manage campaigns and exports; Members access assigned intake items and authorized records.
- Free/Standard/Premium prices and quotas remain the roadmap's provisional hypotheses. Monthly billing only, hard usage caps without automatic overages, preserved CRM access, and no cap on active jobs.

## 4. Delivery sequence

The first slice is a small increment within Phase 1, built on Phase 0. It is not an additional release phase. Stages are ordered by dependencies; commercial, legal, Google, and provider reviews should start during Phase 0 because they can outlast implementation.

### Stage A — Baseline and Phase 0 decisions

**Deliverables:** Source map and scope corrections above; a decision log; first-slice acceptance script; initial data inventory; tenant/permission matrix; service/environment ownership; a dependency/version compatibility record. Choose authentication/session implementation, unit-test runner, exact runtime/dependency versions, and credential/key management. Define model evaluation cases and quality/latency/cost thresholds before comparing models. Begin customer workflow and pricing interviews, legal review, and Google verification preparation.

**Dependencies:** Accessible repository, product reviewer, and named engineering/operations owners. Repository access is confirmed; no cloud credentials are needed to finish the baseline.

**Settled:** Stack, package boundaries, roles, first-login behavior, and Phase 1 sources listed above. Exact package versions, authentication library/provider, and numeric evaluation thresholds are implementation decisions still to record.

**Validation gate:** Every first-slice action maps to an existing requirement; permission rules cover reads and writes; unresolved decisions have owners and block only their dependent tasks. Customer interviews test the actual service-business workflow, not just screen preferences.

**Exit:** Reviewable foundation backlog and acceptance script, with no unresolved first-slice scope conflict. Legal approval, pricing validation, and Google verification may remain in progress but cannot be treated as completed.

### Stage B — Repository and branded app bootstrap

**Deliverables:** pnpm workspace and pinned lockfile; approved app/package boundaries; TypeScript and lint configuration; selected unit-test runner and Playwright location; root install/dev/lint/typecheck/build scripts and CI. Minimal web shell and independently buildable worker entry point. Shared MUI theme/icons, self-hosted Source Sans 3/license, approved logos, and basic loading/error/empty states. Establish Storybook after shared components exist. Document environment variables with placeholders and ignore actual secrets.

**Dependencies:** Stage A tooling/version decisions. No live provider accounts needed.

**Settled:** Next.js App Router, TypeScript, pnpm, all five shared packages, MUI/icon/font/brand rules. Bootstrap package boundaries without filling them with speculative features.

**Validation gate:** Clean frozen-lockfile install, lint, typecheck, web/worker production builds, and shell browser smoke check. Confirm browser bundles cannot import privileged server packages; verify responsive navigation and keyboard focus. Confirm generated favicon defaults are removed. Storybook uses the same theme and mock data.

**Exit:** A clean checkout has documented, repeatable commands and a usable branded shell. No authentication or CRM behavior is claimed yet.

### Stage C — Phase 0 infrastructure and recovery foundation

**Deliverables:** Local Compose PostgreSQL, Redis, Mailpit, and optional object-storage test service when attachment work begins; pinned images, health checks, separate test data, and fictional seeds. Knex configuration and migration conventions. Railway staging web/worker/PostgreSQL/Redis deployment, private service connections, least-privilege secrets, structured redacted logs, queue failure/backlog alerts, and deploy/recovery runbooks. A queue probe demonstrates durable state and repeat-safe completion. Define a durable dispatch/reconciliation approach so a committed database action is not lost if queue publication fails.

**Dependencies:** Stage B; Railway project access and named operator; staging credentials. Finalize operator-owned database and Redis backup/recovery objectives.

**Settled:** PostgreSQL/Knex, BullMQ, separate worker, custom Redis persistence, pgvector template. Local example Compose snippets are guidance; select verified versions and add the required Redis settings to the actual configuration.

**Validation gate:** Fresh database migration → safe rollback → migration; deploy migration runs once. Verify Redis AOF, memory policy, persistent volume, restart recovery, worker interruption, retry/idempotency, and behavior at memory limit. Restore PostgreSQL including vector data to an isolated staging database; verify extension versions and exercise the documented upgrade procedure. Record measured recovery results. Verify web/worker health and alert visibility.

**Exit:** Repeatable staging deployment and evidenced recovery path; no untested persistence assumption is accepted as production-ready. This completes the technical foundation portion of Phase 0.

### Stage D — Identity, workspace, and authorized domain services

**Deliverables:** Registration/sign-in/recovery/session lifecycle using the recorded auth choice; organization and membership model; accepted Screen 02 onboarding; email verification; queued invitations. Tenant-scoped lead/customer repositories, fixed lead stages, assignment checks, activity/audit records, action drafts with record versions, and idempotency contracts. A mail adapter routes development to Mailpit and staging transactional mail to Resend.

**Dependencies:** Stages B–C; auth decision; safe mail configuration and verified sender for external staging delivery.

**Settled:** Owners may enter before verification; invitations and Gmail connection require verification. Invitees accept into the existing workspace and skip owner setup. Invitations default to Member/Office; role and profile remain separate.

**Validation gate:** Two fictional organizations prove cross-tenant denial through pages, actions, APIs, and repository queries. Verify Owner/Admin/Member permissions, invitation expiry/replay, session revocation, seat limits, and verification restrictions. Domain lead create/update/draft/commit behavior works without an LLM. Database commit plus queued notification cannot lose work or duplicate a business effect.

**Exit:** A user can enter the correct workspace and operate only on authorized records. Domain services are ready for both UI and tools.

### Stage E — First vertical slice: reviewed lead creation

**Demo:** Register → review/create workspace → Home → ask the assistant to create a lead → inspect/edit draft → explicitly approve → see the lead in the pipeline and detail page with source, ownership, and activity. Direct manual lead entry uses the same domain service. Leaving the task and resuming it preserves the draft without bypassing approval.

**Deliverables:** Home/Leads list/Lead detail pilot surfaces; code-owned surface registry; validated context envelopes; authorized search/read/draft/commit tools; shared assistant UI; persistent PostgreSQL checkpointer and SalesMora-owned action/approval records. Worker-backed asynchronous task path with persisted status, bounded retries, failure visibility, and safe resume. Evaluate lead search, structured extraction, and draft actions with fictional examples. Add a small reviewed help corpus, worker embedding/reindex pipeline, and source-linked pgvector retrieval.

**Dependencies:** Stage D domain services and Stage C recovery; provider account/API identifiers and data-use review. Define the canonical chat/transcript storage and retention behavior before adding duplicate message tables.

**Settled:** OpenAI Luna-first evaluation; Sol comparison conditional on failure; standard LangChain tool loop/checkpointer; fresh server-authorized context each turn; no vector retrieval for CRM facts or authorization.

**Validation gate:** Complete the demo in staging. Reject forged record references, unauthorized tools, stale drafts, replayed approvals, and cross-tenant thread access. Restart web/worker mid-task and resume safely; repeated delivery produces one committed lead. Model meets thresholds recorded in Stage A, including structured outputs, appropriate missing-field handling, safe tool use, latency, and cost. Help answers cite current published articles; retired articles disappear from retrieval. Disable Responses API storage and confirm chosen provider controls. Test 90-day checkpoint expiry, earlier deletion, and 30-day redacted trace retention.

**Exit:** A reviewer can complete and resume the lead journey with explicit approval and auditable results. Model-selection evidence is recorded. Any provider or infrastructure gate still open is clearly identified and blocks dependent customer use.

### Stage F — Phase 1 CRM, jobs, reporting, and paid foundation

**Deliverables:** Customer records; lead edits, assignments, pipeline, activity and explicit manual lead-to-customer/job conversion. Conversational job creation with reviewed save; job board/table/detail, primary owner/team, statuses and history, immutable progress notes, team-visible chat, basic in-app notifications, optional completion deadline and basic due/overdue alert. Private job attachments and allowed previews/downloads. Role-aware Home summaries, lead/job/team reports, and separate CSV exports for leads, customers, jobs, and CRM activity. Settings/team administration, configurable entitlements/usage accounting, Stripe test-mode lifecycle and billing portal.

**Dependencies:** Stage E reviewed tools/assistant; job permission/status contract and chat-retention reconciliation; storage/key-management decision; Stripe test account. Basic scheduling fields follow the job plan; calendar integration and expanded scheduling remain later.

**Settled:** Needs Scheduling is the default unscheduled job status; planned work date and completion deadline differ. Owners/Admins export on every plan; Members cannot initiate workspace exports. No plan-specific export row quota. Preserve the roadmap's provisional prices/quotas; live paid checkout stays disabled pending commercial validation.

**Validation gate:** Manual conversion is idempotent; assigned-team changes revoke job/chat/file access appropriately. Completed/canceled jobs have read-only chat; ordinary chat sends only in-app notifications to other current team members. Reports reconcile with authorized records and business-timezone date semantics. CSV handles Unicode, quoting, formula-like content, permissions, and technical limits without truncation. Billing tests cover signed/replayed webhooks, upgrade/downgrade, seat limits, hard caps, seven-day failed-payment recovery, and 30-day Owner view/export cancellation grace.

**Attachment gate:** Private Railway bucket, opaque keys, short-lived authorized access, validated allowed formats and 10 MB limit, and verified upload metadata. Review envelope encryption and per-file key lifecycle outside the bucket. Explicit deletion destroys the per-file key and deletes the object; non-content audit metadata remains. Daily encrypted copies in a separate private bucket have 30-day retention; apply durable deletion tombstones before restored data becomes available. Prove 24-hour RPO and one-business-day RTO in staging, including key recovery for active files and non-recovery of deleted files.

**Exit:** A service team can manage leads/customers/jobs and export authorized records; file/chat boundaries and recovery pass; billing is functional in test mode. This is a Phase 1 increment, not completion of Phase 1 intake or launch approval.

### Stage G — Phase 1 website campaigns and supervised Gmail intake

**Deliverables:** Stable campaign draft after source selection; agent-assisted website form builder, hosted link and embed, secure public submissions, notices/consent provenance and spam/rate controls. Explicit setup review and launch/schedule/pause/resume/archive/restore/duplicate/template behavior. Read-only Gmail connection with narrow scope, phrase matching (case-insensitive; subject/body/both; AND/OR), field mappings, mandatory sample preview, and retained sample access controls. Intake proposals, evidence, uncertainty and duplicate flags, reviewer edit/approve/dismiss. Approved action set: create/link SalesMora lead, business-default or selected assignee, starting stage/tags, assigned-owner notification. Basic campaign dashboard.

**Dependencies:** Stages E–F shared services; public-capture security/privacy design; Google credentials and verification work begun in Stage A. Develop Gmail against mocks/authorized testing while verification proceeds; customer production access is gated.

**Settled:** Website/shareable link and basic dashboard on all plans within campaign limits; Gmail Standard/Premium. Gmail never sends or creates drafts. Review approval creates the CRM lead; preview samples do not. No automatic lead-creation mode, advanced follow-up, external destinations, round-robin, sender/attachment matching conditions, or campaign job conversion in this Phase 1 sequence.

**Validation gate:** Valid/invalid/abusive/duplicate website submissions; notice-version provenance; explicit publish approval; paused forms show unavailable/contact state. Gmail account + immutable message ID prevents repeated processing. Possible contact duplicates require human update/link, separate lead, or dismissal. Revocation/reconnect/disconnect/deletion and retries remain visible and safe; resume processes eligible paused-period messages with current rules. Duplicates/templates copy configuration without retained sample or business history. Dashboard counts unique captured items excluding retries, current awaiting review, and approvals counted once; Phase 1 has no date filter. Verify Member access only to assigned review items. Google restricted-scope verification and applicable security assessment must pass before production Gmail connection.

**Exit:** Both Phase 1 sources create traceable, correctly authorized leads with approved post-approval actions. Campaign metrics reconcile with intake records. An unverified Gmail connector remains disabled for customers and means full Phase 1 is incomplete; it need not block internal CRM testing.

### Stage H — Phase 1 release readiness

**Deliverables:** Staging acceptance evidence, recovery/incident runbooks, operator ownership, support/disconnect/deletion paths, production deployment checklist, approved retention schedule, legal/provider review records, model evaluation record, and commercial validation decision. Rehearse production deployment and migration recovery in staging.

**Dependencies:** Stages F–G and every applicable external gate below. Validate public launch separately from development, staging demos, or an explicitly agreed limited pilot.

**Settled:** US-first launch; draft plus approval for consequential agent actions; no SMS. A Phase 1 release is an incremental product, while full operations remains the later broad-release goal.

**Validation gate:** End-to-end owner/invitee, lead/job, export, intake, quota, billing, and retention journeys pass. All enabled features have legal/provider approval and operational evidence. Verify production environment separation, secrets, monitoring, controlled migration, and rollback/forward-fix compatibility. Recheck current provider terms/pricing and documented account settings.

**Exit:** Named release owner records a go/no-go decision supported by evidence. Enable live paid checkout only after observed customer choices, quota fit, and measured unit economics validate packaging. Any limited pilot has explicit scope/terms; it is not represented as full Phase 1 completion.

## 5. External gates and unresolved implementation decisions

| Gate / decision | Start | Blocks | Evidence needed |
|---|---|---|---|
| Authentication/session implementation, package/runtime versions, unit runner | A | B/D as applicable | Recorded choice and compatibility check; do not reopen settled stack decisions |
| Feature-level permission details, deduplication rules, canonical transcript and shared-chat retention | A; finalize before D/F/G | Affected persistence/actions | Reviewed contracts and negative authorization cases |
| Legal review, domain ownership/name clearance, privacy/terms/DPA and incident obligations | A | Public launch; dependent customer data use | Qualified review of actual behavior and customer terms; no claim of universal compliance |
| Customer workflow validation and prices/quotas | A interviews; working pilot after E/F | Live paid billing | Observed plan choices, actual usage, willingness to commit, and measured serving costs; preserve current proposals until evidence supports changes |
| Luna-first model task evaluation | A rubric; E evaluation | Customer-facing AI | Task results and thresholds; Sol comparison only when Luna fails; verify actual model/API availability |
| Provider terms, data handling, pricing and settings recheck | A before customer data; H final | Relevant customer use/launch | OpenAI storage/retention review; Resend terms/retention/deliverability and overages disabled; Railway/Stripe/Google account and service review |
| Google least-privilege/restricted-scope verification and security assessment | A | Production Gmail | Applicable verification/assessment completion and tested disconnect/deletion behavior |
| PostgreSQL/pgvector and Redis recovery/upgrades | C; repeat after material change | Production operation | Pinned versions, successful isolated restore/upgrade/restart drills, memory-limit test, alerts, owners and runbooks |
| Attachment encryption/key recovery/deletion and backup recovery | A design; F drill | Customer attachment use | Reviewed key design, deletion tombstones, restore test meeting attachment RPO/RTO |
| CRM/Gmail/sample/audit/billing/backup retention and deletion schedule | A; before affected customer use | Production data handling | Explicit approved schedules beyond the settled 90-day checkpoint / 30-day trace limits |

These gates are work items with owners, not assumptions that are already satisfied. Assign people when the delivery team is known.

## 6. Timing and later-phase boundaries

The roadmap's 2–3 weeks for Phase 0 and 6–8 weeks for Phase 1 are indicative small-team estimates, not a verified schedule. Do not reuse the roadmap diagram's fixed start date as an actual commitment. Re-estimate after Stage A using team availability, auth/storage scope, provider access, Google assessment lead time, and the recovery exercises. External review deadlines can determine launch even when engineering is complete.

Keep Phase 2 advanced workflow/delay configuration, follow-up review/sequences, campaign job conversion, checklists, advanced campaign analytics, and Google Calendar out of Phase 1. Keep Phase 3 estimates, expanded operational scheduling/reminders, Salesforce and broader connectors, and SMS groundwork in their documented later phases. Mailchimp/accounting ecosystem work remains later. Build durable queue and entitlement foundations early without building every future workflow or plan-gated feature.

## 7. Recommended first implementation task

**Bootstrap the approved pnpm workspace and branded Next.js shell, with a separately buildable Node.js worker.** Complete the short Stage A decision record first, then deliver Stage B as one reviewable change.

Acceptance checklist:

- [ ] `apps/web`, `apps/worker`, and the five approved packages have explicit boundaries.
- [ ] Runtime/package versions and the unit-test runner are selected and recorded; one root lockfile is committed.
- [ ] Fresh install, lint, typecheck, and production builds pass through documented root commands and CI.
- [ ] Web shell uses the approved MUI theme, icons, Mosaic assets, and locally bundled Source Sans 3/license.
- [ ] No generated favicon assets/routes/metadata remain; no privileged imports reach the browser.
- [ ] Web and worker can start independently; environment examples contain placeholders only.
- [ ] Shared UI has representative Storybook states once components exist; shell navigation/focus/responsiveness pass review.
- [ ] Existing docs/prototypes remain references, and README describes the actual new commands and implementation state.

The first task ends with an app/worker foundation that can be reviewed and deployed. Identity, CRM behavior, provider integrations, and infrastructure provisioning follow their own explicit stages.
