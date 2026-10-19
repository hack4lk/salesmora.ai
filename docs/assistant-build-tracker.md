# Shared assistant build tracker

## Current placement and approval — October 12, 2026

The user approved the floating bottom-right callout, dark-blue modal, and hand cursor. This supersedes the original top-of-page form; earlier entries below preserve the design history. Embedded assistants remain deferred.

The live runtime is now connected for local development: Thinking, real streamed answers, persisted private history, Stop/retry/reconciliation, verified help citations and permission-scoped lead pipeline totals. The user selected Owner/Admin/Office/Field roles; current app policies govern both retrieval and tools. Eight reviewed articles and 23 real development vectors support help retrieval. Reviewed lead creation is connected through a persistent draft and explicit confirmation; the model has no commit tool. See the [chat implementation plan](chat-implementation-plan.md) for bounds and release gates. Earlier entries below preserve completed slice history.

References: [architecture](context-aware-agent-architecture.md), [structure](application-structure-plan.md), owner/team Home prototypes, and the lead-form prototype. Preserve prototype visual language with approved brand controls, typography, and spacing.

## Provider usage accounting — October 12, 2026

Added a server-owned call ledger for planning, streamed answers, query embeddings, shared help ingestion and development evaluation. Known token usage includes input/output/cache/reasoning breakdowns; interrupted or unfinished calls retain unknown usage. Private transcript deletion does not erase accounting. A local monthly report is available with `pnpm ai:usage`. The accounting slice changed no UI; the subsequent approved allowance slice adds the `Assistant/AssistantPanel/MonthlyAllowance` story and a specific app error state.

The approved default is 5 million tokens per workspace per UTC calendar month, shared by all teammates. Server configuration and trusted local per-workspace overrides are supported; no settings screen was added. Atomic reservations precede generation/query embeddings, known usage settles them, and unknown calls retain conservative holds. Manual lead creation and confirmation of already completed drafts remain independent. See [accounting and enforcement details](ai-usage-accounting.md).

## Step 1 — Shared panel for review

- Added `packages/ui/src/assistant/assistant-panel/` with source, copy, and colocated stories; exported through `@salesmora/ui`.
- Header, optional selected-record label and clear-record callback, conversation messages, and composer. Sending is explicit. Ordinary page labels and suggestion buttons were removed during design review. Enter inserts a newline.
- Parent supplies conversation/context and send callback. Rendering is plain text. The panel has no model calls, domain mutations, database access, or persistence.
- Trim messages, reject blank/over-limit input, lock duplicate sends, preserve failed messages for retry, show errors, and restore composer focus. The 4,000-character limit is provisional UI validation; authoritative server validation will be added with the contract.
- Storybook uses fictional responses and explicitly says no AI request is sent or record saved. Page context will be supplied by the app adapter without displaying an ordinary page label.
- Review URL: http://127.0.0.1:6006/?path=/story/assistant-assistantpanel--default
- User approved adding the panel to the page after the cleanup; shared workspace placement is now connected. Visual emphasis is the next separate design step.

## Next steps after UI approval

Follow the staged [chat implementation plan](chat-implementation-plan.md), beginning with contracts, shared capability policy, and extraction of existing lead use cases. Review each completed slice before proceeding. Streaming UI/persistence and seeded development RAG precede live model integration; explicit review/confirmation precedes business commits.

## Step 1 validation

- All ten Storybook interaction/Axe checks passed: blank input, editable suggestions, conversation, duplicate-send protection, retry, thrown errors, message limit, record-context clearing, disabled state, and mobile.
- Reviewed conversation screenshots at 1440px and 320px. Corrected a cramped mobile header and reran all ten checks; no horizontal overflow.
- Workspace lint/typecheck and Storybook production build passed. Storybook emits existing dependency module-directive warnings.

## Design cleanup — October 11, 2026

User requested removal of “Using Home” and the suggested-action buttons below the composer. Removed the suggestion UI, props, fixtures, and story. The default panel has no context badge; optional selected-record context remains available for explicit record tasks. This does not change the planned server-side page context or permissions.

The existing conversation, pending/error/retry, input validation, optional record-context, and mobile stories remain available after this cleanup.
- Cleanup validation: all nine remaining Storybook interaction/Axe checks, workspace lint/typecheck, and desktop/320px layout checks passed.

## Shared page placement — October 11, 2026

- User approved placing the panel on the page and requested visual emphasis changes in the next step.
- Added AssistantPanel at the top of WorkspaceShell, above the page heading/content, covering existing Home and Create lead pages and future pages using this shell.
- Kept the reviewed panel styling, omitted ordinary page context and suggestions, and marked the disabled chat “Chat coming soon.” No fictional replies are exposed on live pages.
- Runtime, typed request context, persistence, and tools remain pending. Login/registration/onboarding use their existing layouts; this step connects the workspace pages.
- Placement validation: all eight real lead browser/API tests and six WorkspaceShell interaction/Axe checks passed, along with lint/typecheck. Reviewed Home desktop and shell 320px screenshots without overflow.
- Production workspace build passed. Next: user-directed design edits to distinguish the assistant panel from ordinary page cards.


## Conversation panel and backdrop — October 11, 2026

- User chose Conversation panel and approved dimming/lightly blurring the whole page while chat is expanded. This supersedes the earlier no-backdrop design clarification.
- Shared assistant now has a branded blue header. Input focus or Expand chat promotes the same component into a native modal dialog, with a semi-transparent ink backdrop and light blur. Background navigation/content are not restyled.
- Escape, Collapse chat, and clicking the visible backdrop close the expanded panel. Drafts, errors, and messages stay in the same mounted component. Focus returns to Expand chat, and background scrolling is restored. Keyboard Tab/Shift+Tab wrap inside the expanded chat.
- Existing pages allow typing local drafts and expansion while Ask assistant remains disabled, labeled Chat coming soon. No model requests, fake live replies, or CRM changes were added.
- Mobile expansion uses available screen width and scrolls within the panel when needed. No motion is required for opening/closing, respecting reduced-motion users.
- Validation: all eleven assistant interaction/Axe checks passed; the eight existing lead E2E scenarios and new expanded-chat scenario passed across the full run and targeted rerun. The real-page check covers desktop/320px focus containment, Escape, desktop backdrop click, Collapse chat, preserved draft, restored focus/scrolling, no horizontal overflow, and no lead writes. Visual screenshots reviewed at both widths. Lint, workspace typecheck, whitespace checks, and production build passed.


## Tint and input-only expansion — October 11, 2026

- User removed the Expand chat button and clarified that blue/mint tint should cover the whole component. Replaced the solid blue header/white body treatment with one subtle blue-to-mint surface, dark text, and an opaque white composer.
- Collapsed chat opens from input focus, click, or typing. Collapse chat is visible only while expanded. Escape, collapse, and backdrop dismissal retain the draft and return focus to the input without immediately reopening; clicking it again reopens normally.
- Updated existing interaction and real-page coverage to use the input instead of the removed button.
- Validation: all eleven existing component interaction/Axe checks and the updated desktop/320px real-page chat scenario passed. Reviewed screenshots of the blue/mint surface, backdrop, and white input at both widths. Lint, workspace typecheck, and production build passed.


## Dark blue palette — October 11, 2026

- User selected the screenshot’s dark blue approach, superseding the blue/mint tint. Both collapsed and expanded chat use a medium-blue header, navy body/input, lighter blue message bubbles, pale text, and pale-blue primary controls.
- Assistant-specific shared color tokens keep this treatment scoped to the chat. Input expansion, collapse, backdrop, and draft behavior remain unchanged.
- Validation: all eleven assistant interaction/Axe checks passed. Desktop and 320px screenshots confirmed readable colors and no horizontal overflow. Workspace lint, typecheck, production build, and whitespace checks passed.


## Floating assistant entry — October 11, 2026

- User replaced the top-of-page form with a chatbot-like floating callout in the bottom-right corner. This supersedes the original top-of-page placement and focus-to-expand interaction.
- The shared workspace shell now presents the callout on Home, Create lead, and future workspace pages. It opens the existing dark-blue modal with a dimmed/blurred backdrop. Page content no longer starts with a chat form.
- Keyboard activation focuses the composer. Escape, Close chat, and desktop backdrop click return focus to the launcher; closing preserves the draft and restores page scrolling. The launcher remains usable while sending is unavailable.
- Validation: all eleven component interaction/Axe checks passed, including keyboard launcher activation, closed initial state, disabled sending, and retained drafts. The real Home/Create lead scenario passed at 1440px and 320px with focus containment, Escape, backdrop/Close chat dismissal, and restored launcher focus/scrolling. Desktop/mobile launcher and modal screenshots reviewed without horizontal overflow. Lint, typecheck, and production build passed.


## Resumed contracts and authorization boundary — October 12, 2026

Added strict turn/stream schemas in `packages/contracts/src/chat.ts` and surface/tool access checks in `packages/agent/src/access.ts`. Chat reuses the app authorizer and mandatory collection scopes; Field lead summaries stay assignment-scoped and Field cannot draft new leads. Tools are disabled unless the server explicitly enables an implementation. Planned help retrieval must filter every source by current permissions, and history must enforce ownership and current data access. No chat endpoint or live tool is connected yet.

Next reviewable UI slice: Thinking followed by incremental text, Stop, interruption/retry and retained modal state. Persistence, seeded real development vectors and provider integration follow; reviewed lead commits reuse the transactional manual service.

Validation: all 301 unit tests passed, including the new chat contract/access cases; workspace lint/typecheck and contracts/domain/agent builds passed. This slice changes no visual components, so existing assistant Storybook designs remain unchanged.


## Streaming presentation slice — October 12, 2026

The shared panel accepts transport-owned run status, partial messages, interruption markers, Stop and async retry callbacks. Thinking appears before the first delta, followed by Responding and an explicit completion/stopped/interrupted status. The conversation log does not announce every text delta; a separate live status announces progress. Stop remains available while sending; Close hides the modal and preserves the active run. Retry shares the duplicate-submission lock and clears errors/draft on success. Partial answers remain marked incomplete.

Added fictional incremental Storybook fixtures for Streaming, Interrupted Stream, Stop Stream, Close During Stream, Thinking, Stop While Thinking, and Reading Earlier Messages. The modal follows the latest output only near the bottom; completion restores composer focus without scrolling readers away from earlier messages. The app launcher remains disabled for sending: these previews use no provider calls, persistence, vectors or CRM writes.

Review: http://127.0.0.1:6006/?path=/story/assistant-assistantpanel--streaming

Next slice after local review: authenticated transcript/run persistence and POST streaming transport, with thread ownership, cancellation, recovery and fragmented SSE parsing. RAG ingestion with real fictional development vectors follows before live provider rollout.

Validation: all 36 assistant desktop/320px interaction, accessibility and layout checks passed; the final 14 streaming-specific checks also passed after cancellation-copy refinements. Existing floating-chat app regression passed. Workspace lint/typecheck, production build and Storybook build passed. Reviewed desktop and mobile screenshots.


## Authenticated conversation and transport slice — October 12, 2026

Added app-owned threads/turns/messages, private history/list/delete endpoints, repeat-safe acceptance, persisted cancellation, expired-lease recovery and typed POST SSE delivery. Current sessions and app permission are rechecked per delta; Owners cannot read another user's chat. The fetch decoder handles fragmented UTF-8/frames and demands a terminal event. Stop polls persisted control even while awaiting a token, and browser disconnect aborts the run. Exact submission replay returns existing state rather than generating again.

The development database now has the additive tables after a private backup/restore rehearsal. Only the isolated test server has a fictional streaming provider. The regular app retains the disabled composer; no provider key, live answer, CRM action, vectors or checkpoint integration was added. See the chat plan for bounds and remaining history/provenance/retention work.

Validation: 304 unit tests passed, all seven authenticated chat E2E cases passed (including quiet-generation heartbeat), and 23 existing authorization/permissions/lead regressions passed. Workspace lint/typecheck and production build passed. Backup/restore rehearsal and additive development migration succeeded. No visual components changed in this slice.


## Development RAG foundation — October 12, 2026

- Added the reviewed help corpus, pgvector canonical/vector storage, Redis/BullMQ worker, repeat-safe seed/reindex commands and permission-filtered exact retrieval. Private backup/isolated restore validation preceded the local image upgrade; existing account and CRM rows and the original data volume were preserved.
- Generated 23 actual development embeddings using a server-only development key. Twenty-query semantic evaluation scored 19/20 expected sections in the top three; the unrelated query returned no source. Reseeding completed zero new jobs. Campaign planning content is excluded from current help.
- Added the authenticated current-version help viewer and Default/Narrow stories at `Help/HelpArticle`. Current membership, assistant access, role/capability/plan/product/publication filters apply to both retrieval and citation reads. Plain-text rendering escapes HTML. The main assistant remains disabled pending live runtime integration.
- Checks: 309 unit tests; rollback-only knowledge security/lifecycle rehearsal; 24 browser/API citation/chat/authorization/permissions tests; four narrow/wide story interaction/Axe/layout checks and visual review; lint/typecheck/build. Live model injection and deployment restore evaluations are still pending.
- Next approved slice: bounded provider/model runtime, persisted modal transport, help citations and authorized lead read tools. Reviewed lead actions follow separately. See `docs/chat-implementation-plan.md` and `docs/local-development.md` for commands and limits.


## Live read-only assistant — October 12, 2026

Connected the existing dark-blue modal to live server streaming and private history. Added verified source links and a New conversation control with colocated Assistant/AssistantPanel Sources story; the connected app adapter lives in its own feature folder. Thinking, partial output, Stop, retry, close/reopen and refresh retain their reviewed behavior. No agent business writes are implemented.

The bounded LangGraph runtime exposes only permission-filtered help search and the existing authorized pipeline counts. Server checks are repeated for tools, output and saved-history reads; metadata-only checkpoints cannot restore revoked content. Source/version/policy changes hide prior assistant output conservatively.

Validation: 320 unit tests, existing authorization/permissions/chat/lead browser regressions, 38 narrow/wide assistant interaction/Axe/layout checks, two fictional live provider/RAG/scope/injection evaluations, backup/restore checkpoint targeting, lint/typecheck and production build. Review the local app and `Assistant/AssistantPanel/Sources`; next slice requires explicit lead draft review/confirmation.


## Reviewed lead creation — October 12, 2026

The model can now prepare a saved lead draft for authorized Home/Create lead users. The new `LeadDraftCard` uses the approved blue modal treatment and lead-form prototype field labels, showing all fields, defaults, expiry and explicit Confirm/Cancel. Ask for a replacement draft to change details. The server validates again at confirmation and saves the lead/approval/audit atomically. Field users remain denied by default; the model cannot invoke a commit.

Review: http://127.0.0.1:6006/?path=/story/assistant-leaddraftcard--review

The additive proposal/audit migration passed a restored-copy rehearsal and was applied locally. Local help content/vectors now explain the implemented confirmation workflow. The feature stops here for local review; production hardening and additional tools remain separate slices.

Validation: 325 unit tests; 28 chat/approval/manual-lead browser checks; 54 desktop/mobile assistant/review interaction, accessibility and layout checks; real provider drafting, verbal-confirmation denial and saved-outcome checks; backup/restore rehearsal, lint/typecheck and production build passed.

## Chat retention cleanup — October 12, 2026

Implemented 90-day inactivity cleanup for private assistant transcripts, draft payloads and turn checkpoints. The trusted local worker schedules daily bounded cleanup at 03:00 UTC. Workspace locks and eligibility rechecks protect concurrent activity; immutable action audits and monthly token accounting survive deletion. No operational trace sink exists, so the 30-day trace policy has no stored data to expire yet. No component or schema changes. See [retention operations and validation](chat-retention.md). Production worker scheduling, account-deletion orphan reconciliation, backup retention and separate business audit/accounting policy remain release gates.

Validation: rollback-only retention database checks and existing monthly allowance/concurrency checks passed; 342 unit tests, lint and workspace type checking passed. No provider calls or customer data changes were needed for validation. Next proposed component: Owner-only AI usage page under Settings, pending user direction.

## Owner AI usage page — Storybook review, October 12, 2026

Added `Settings/AIUsagePage` under `apps/web/src/features/settings/ai-usage-page/` with colocated copy and 13 stories. Read-only summary shows used/reserved tokens, remaining tokens, monthly allowance and the next UTC reset; explains shared usage, reservations and early admission denials. States include near-limit, exhausted, allowance lowered below usage, zero allowance, new month, loading, retryable error, invalid snapshot, long content and Admin/Office/Field denial. Refresh is an injected callback for this component slice.

Validated 26 narrow/wide Storybook interaction/accessibility/layout checks, keyboard refresh, manual screenshot review, lint, workspace type checking and web production build. Review URL: `http://127.0.0.1:6006/?path=/story/settings-aiusagepage--default`. Paused for component approval per `docs/component-conventions.md` before live integration. No database changes, live usage requests, allowance editing, Settings navigation or server authorization changes in this slice. Next slice connects a fresh Owner-authorized usage read, refresh, Settings overview and left submenu.

## Owner AI usage page — live integration, October 12, 2026

Approved page now lives at `/settings/ai-usage`, with a Settings overview link and left Settings submenu beside Permissions. The default Settings profile screen remains intact. Initial server reads and the no-store refresh API authorize current Owner membership before accessing the ledger. Totals include reservations and the UTC reset date; refresh handles failure, retry, timeout, unmount and access revocation. No budget editing, model tool, provider call or migration added. See [usage accounting](ai-usage-accounting.md) for file responsibilities.

Validation: 11 browser checks passed across the new usage flow and existing Permissions suite (10 unchanged checks plus the corrected/re-run Owner flow). Ownership-revocation fixture uses a valid transactional transfer to retain the database's one-Owner invariant. Also passed 42 desktop/mobile Storybook interaction/accessibility/layout checks, lint, workspace type checking and web production build. Live app screenshots reviewed at 1440px and 320px. All browser data was fictional in the isolated test database; development accounts and CRM data were not changed.

## Worker deployment configuration — October 12, 2026

Shared worker runtime now accepts explicit production/staging database, authenticated/TLS Redis and dedicated queue settings, while local seed/evaluation guards and Docker connections stay intact. Added retention-only mode, non-watching start and status commands, migration readiness checks, bounded startup/shutdown, generic persisted job failures and structured diagnostic/completion events. Runtime dependency packaging includes tsx. No Docker worker service, hosting deployment, provider call or alert destination added. See [worker deployment](worker-deployment.md) for remaining staging release steps.

Validation: 358 unit tests, lint, all workspace type checks and worker build passed. Two isolated local Docker rehearsals verified retention execution, failed-job retries, status, graceful shutdown/restart and stable daily scheduling without provider calls. No development account/CRM changes or schema migrations. Production credentials/services and external alerts remain unconfigured; streaming/proxy, recovery and deployment checks remain staging release work.

## Local Docker proxy rehearsal — October 12, 2026

Added an opt-in pinned Nginx container on loopback port 3003 forwarding only to the isolated test server. Dedicated Playwright configuration reuses existing chat API/UI/action security checks through the public proxy origin. Added incremental-vs-buffered transport control, early heartbeat observation, proxy idle timeout/recovery and the real 90-second application deadline fixture. The deterministic buffered control runs only inside the test harness on host port 3006; it is not an app route. No production chat configuration, provider calls, schema changes or normal local app port changes. See [proxy rehearsal](chat-proxy-rehearsal.md) for commands and staging follow-up.

Validation complete: 26 unique proxy browser checks passed (25 final regressions plus the real 90-second deadline check), along with 358 unit tests, lint, workspace type checking and production build. The negative buffered control passed. Fixed the test harness to use one server, forward development HMR and force fictional provider mode. Initial failed harness runs are superseded by the final passes. Proxy container stopped after testing. No paid provider calls or development CRM/account changes. Next release gate: repeat streaming/security checks through the actual staging hosting/CDN/TLS chain.

## Railway staging preparation — October 12, 2026

Added pinned Node 22 web/worker Dockerfiles, secret-excluding Docker context, Railway per-service configuration and the existing PostgreSQL/pgvector image configuration. Web binds Railway's PORT on all interfaces, runs migrations once in pre-deploy, and exposes a no-store process-liveness endpoint. Both application containers run as Node and receive SIGTERM directly; termination grace is explicit. Production migrations do not load local env files. Local web/Compose commands remain unchanged. See [staging runbook](railway-staging.md) for variables, persistence, deployment order and remote verification gates.

Validation: both images built without deployment credentials; a fresh disposable Docker database passed production-mode migrations. Container checks passed health/login, forged-origin denial, runtime auth/terms values overriding build placeholders, authenticated Redis, retention scheduler status and worker SIGTERM. All disposable containers/network/credentials were removed. All three Railway configurations pass the current published JSON schema (numeric drainingSeconds, despite the documentation's string examples). All 358 unit tests, lint and workspace types passed. No provider calls, local data edits or remote migrations occurred. Railway CLI is authenticated but the repository is unlinked; no staging project/services/domain/billing resources were created. Email delivery, remote corpus publishing, backups/alerts and actual TLS/edge streaming/recovery remain staging gates.

## Railway staging deployment — October 12, 2026

With explicit user approval, created and linked the `staging` environment in the existing account’s project, now named `salesmora`. Web, retention worker, PostgreSQL/pgvector and authenticated persistent Redis are running. Added secret-excluding Railway upload rules and the supported `.railway/railway.ts` definition with unmanaged variables, replacing the earlier JSON config files which Railway now rejects for new services. Added pinned official IaC SDK. No local data or provider credentials were copied; chat remains disabled. See [deployment evidence and remaining gates](railway-staging.md).

Verified 12 migrations, zero accounts, HTTPS readiness/login/access denial, pgvector availability, Redis persistence/eviction policy, healthy worker/scheduler and graceful restart. Infrastructure SDK types, lint and no-change plan passed. Temporary SSH access was revoked and removed. Managed backups require Railway Pro and were not enabled; no subscription upgrade, external alerts, GitHub auto-deploy, email transport or live chat/RAG verification was performed. Initial volume/pre-deploy/config-format failures were resolved before final successful deployments.


## Railway staging email — October 13, 2026

Connected verification, invitations and password resets to one shared server-only transport. Local loopback origins retain Mailpit; explicitly configured HTTPS deployments use Resend with a domain-restricted key and sender stored in Railway. Templates and CID logo attachments are preserved. Provider errors are sanitized, requests time out after ten seconds, and ambiguous sends are not automatically retried. Removed local Mailpit wording from the invitation status copy. No database migration or UI component added.

Validation: seven transport unit tests, 26 local email browser tests (verification, password reset and invitations), lint and web type checking passed. A non-sensitive message to Resend’s test recipient was accepted using staging configuration without exporting credentials. Staging inbox/link verification remains pending; test-recipient acceptance does not establish inbox delivery.

Deployment `42c1d554-192d-4b55-bb3a-24f05318b86c` subsequently reached SUCCESS, confirmed through Railway after the user reported completion. Public `/api/health` and `/login` both return 200. The initial pre-deploy delay cleared without code changes or a retry. The user subsequently confirmed receipt and successful verification, invitation acceptance and password reset on staging.


## Guarded staging help publisher — October 13, 2026

Added a separate worker operator command with exact staging project/environment/service/database guards, a no-network corpus preview, digest-confirmed publication, a concurrent publisher advisory lock, repeat-safe article ingestion and delayed retirement of missing articles. Embeddings reuse the pinned space and corpus usage ledger; no chat allowance is consumed by shared ingestion. Existing local-only seed/evaluation guards remain intact and the persistent staging worker remains retention-only. No database migration or UI component added.

Preview using staging metadata passed: eight articles, 23 chunks, conservative embedding input bound 7,707 tokens. Nineteen focused worker/target/digest tests, lint, worker type checking and worker build passed. Neither staging web nor worker had an OpenAI key at inspection; the user was asked to add a separate staging key to both services. Chat remains disabled and no vectors or live AI calls were made. Worker deployment `f7635c08-0e2a-44ce-b7bb-2eee2098c403` reached SUCCESS. See [publication procedure](staging-knowledge-publication.md).

The user then added separate staging OpenAI keys to web/worker and deployed both. Web key presence and configured model access (GET model, no generation) were verified. The remote worker preview matched digest `9a899a2b14138aae1f041c46f69c25b436914330609ea9f5894deaa34e6980de`. Publication stopped on its first embedding request. Safe diagnosis returned HTTP 429, `credit_balance_exhausted` / `insufficient_quota`; the user was asked to fund the API organization associated with the key. Database inspection confirmed one draft article, zero vectors and one failed corpus-embedding ledger call; no published help or workspace chat was created. The draft is safe to resume. Chat remains disabled. Temporary SSH key registration was revoked and all temporary key/agent/trust files removed. All 368 unit tests passed.

After the user added API funds, remote publication succeeded for all eight articles/23 vectors and repeat publication reused all eight versions. Twelve direct role/status checks and three semantic retrieval cases passed. Enabled CHAT_ENABLED on staging web (deployment `d5a5216d-595b-4f39-8e27-0358540a784c`) for the authorized live rehearsal. Four newly created fictional Resend test-recipient accounts and two isolated fictional workspaces provide test scope; three memberships were added by a guarded operator fixture setup that checks their exact label/owner/email, without changing existing accounts. Public HTTPS signed-out, forged-origin and cross-workspace denials passed. Live generation/streaming checks follow the rollout.


## Live staging assistant verified — October 13, 2026

Funding resolved the provider gate. Published eight reviewed articles/23 vectors, confirmed repeat publication reused all versions, and passed twelve direct role/status checks plus three semantic retrieval cases. Enabled staging chat and verified successful deployment. All four roles received Thinking followed by live SSE deltas through Railway HTTPS; authorized citations resolved and forbidden Field evidence/actions were absent. Forged-origin, unauthenticated and cross-workspace denials passed. History recovery, completed replay, explicit lead confirmation/idempotency, natural-language non-commit, permission revocation before confirmation, Stop and exhausted allowance checks passed in isolated fictional workspaces.

Usage verification covered seventeen reported calls totaling 11,003 tokens and one conservative unknown-usage reservation after interruption; checkpoint samples passed metadata-only checks. Restored fixture policy grants and five-million-token allowance. Revoked all four fixture sessions and temporary SSH access; removed temporary secrets/session files. Fictional accounts/workspaces, the single explicitly confirmed fictional lead and audit/usage records remain in staging for retention/audit. No schema/UI change in this rehearsal. See [detailed evidence and remaining release gates](railway-staging.md).


## Field clarification and duplicated text regression — October 13, 2026

The user reported that a confirmed Field account was asked for a service when requesting lead creation, with the first sentence duplicated. The answer model lacked the currently authorized tool list even though planning/tool execution enforced it. Added server-authored capability context to both planning and answering; the graph supplies a fresh list immediately before answering. Instructions prohibit collecting proposal inputs or offering drafting when the draft tool is unavailable. Existing execution/confirmation enforcement and role-configurable permissions are unchanged.

An SDK-level stream fixture reproduced the exact repeated sentence by combining a commentary message and a final-answer message. The adapter now suppresses commentary before persistence/streaming and retains final-answer/phase-less text. No UI component, permission policy, schema or model version changed. Added regression coverage for phase handling, authoritative capability context despite user/reference claims, and fresh answer authorization. All 371 unit tests, 15 local chat/action browser checks, workspace types and lint passed. Staging deployment `ef92c142-5ce2-4657-9f5e-1196a4f94348` submitted; live fixture verification follows successful rollout.

Deployment `ef92c142-5ce2-4657-9f5e-1196a4f94348` reached SUCCESS. A live confirmed Field baseline on the prior release reproduced service collection without creating a proposal. After rollout, the same private thread denied the original missing-service request, a request supplying the service and an Owner-role-claim attempt; no clarification or proposal was offered. An authorized Owner still received a valid missing-service statement without repeated sentences. The initial live Owner assertion unnecessarily required a question mark; inspecting its fixture-only history established valid behavior without another generation request. Database checks confirmed actual Field membership, zero leads and zero drafts in the isolated regression workspace. Revoked both fictional sessions and temporary SSH access and removed key/agent/trust/session files. The fictional workspace/accounts remain for audit/retention.
