# Gmail Lead Capture: connection and real-account test plan

Date: November 3, 2026. Status: plan and checkpoint one approved in chat; [checkpoint two](lead-capture-gmail-connections.md) implemented and tested with fictional provider grants and the real app button/callback path. The first real local Google consent/connection check passed on November 4; sample retrieval and ingestion acceptance remain pending. Both owned Gmail migrations and a private keyring are prepared locally. This plan adds account connection and proves the complete capture journey locally, followed by a scoped staging pilot. No staging deployment or Gmail ingestion activation is recorded here. See the [foundation checkpoint](lead-capture-gmail-foundation.md) and [operator setup instructions](lead-capture-gmail-google-setup.md).

## Current implementation

- Approved canonical Gmail account, rules, sample, mapping, workflow and final-review components already exist. Reuse them and their colocated stories.
- The connected wizard currently supplies an empty account list, `connectionAvailable=false` and inactive connect/reconnect callbacks in `apps/web/src/features/lead-capture/connected/capture-wizard-route.tsx`.
- No Gmail OAuth client, token lifecycle or message ingestion worker was found. The auth account token columns belong to application identity and are not a Gmail integration store.
- Web and worker delivery authorities currently return `gmailReady=false`. A displayed connection must not bypass those checks.
- Source configuration supports account/connection references; immutable receipts and retained samples have Gmail shapes. Those references do not currently establish a real provider connection.
- Assistant pasted-sample extraction/approval exists, but its setup sample is separate from the exact account-bound `captureSourceSamples` record required by publication. Add a real bridge rather than making fake provider/sample records.
- Shared Intake Review persistence exists; complete and verify its authorized backend/page connection before claiming that an ingested message can be reviewed and turned into a lead. The assistant plan already tracks this gap in checkpoint six.
- Publication/lifecycle assistant checkpoint five has work in progress. Inventory and verify its relevant shared services before depending on them; do not treat its unfinished verification as complete.
- Staging configuration must be inspected afresh before rollout. Earlier deployment records are evidence of earlier settings, not current environment state.

## Product behavior and proposed defaults

Existing approved behavior: one selected Gmail account per capture source; multiple accounts can be connected to a workspace. Gmail access requires an eligible plan. Phrase matching is case insensitive, supports subject/body/both and all/any. Every accepted Gmail match enters Intake Review; a human explicitly decides whether to create/link/dismiss it. Reading Gmail does not send, delete, mark read or modify email. Connecting does not launch intake.

Proposals to review with this plan:

1. Approved by the user November 3: capture new incoming messages after explicit launch; no historical mailbox import. Selecting an older representative sample is a separate read-only action and creates no intake item or lead.
2. While deliberately paused or archived, do not enqueue new intake. Resume opens a new eligibility window; restore remains paused until explicit review/resume. A temporary worker outage while active catches up eligible messages rather than dropping them. Keep durable eligibility windows so these cases can be distinguished.
3. Use worker polling with Gmail history cursors for the first release, targeting approximately one-minute polling under normal conditions. Make concurrency, page/message/byte limits, retry budgets and polling cadence configurable. Pub/Sub can follow later.
4. Connected accounts are workspace resources managed by authorized users, separate from signing into Salesmora. Display which account a source uses. Reconnect must verify the same provider account; choosing another account is an explicit versioned draft change requiring renewed sample review.
5. A mailbox may be selected by more than one source. Poll it once per workspace/account, evaluate each eligible source independently and deduplicate within each source using stable provider-account/message identity. Multiple source matches remain separate review items with provenance; existing duplicate-lead review prevents unreviewed duplicate creation. Confirm this behavior before finalizing constraints.
6. Exclude sent-only messages, drafts, spam and trash from incoming capture. Define and test self-sent mail, incoming mail immediately archived by a Gmail filter, label changes and imports. No new Inbox/label selection UI is proposed.

Approved test-account choice November 3: use an existing Gmail account. Use unique fictional markers in test matching rules and test messages, and explicitly select representative samples. Google read-only authorization remains mailbox-wide; test rules restrict capture admission, not the OAuth grant. The user approved proceeding with this plan in chat; each implementation checkpoint remains separately reviewed under the repository instructions.

## Implementation checkpoints

Follow the repository's reviewed checkpoint sequence. For UI work: update canonical components and mocked stories, review them, connect the page, then connect assistant behavior. Deliver a reviewable result after each checkpoint.

### 1. Provider setup, contracts and custody

- Inventory the relevant current code/migrations and choose a bounded implementation manifest from the moving working tree.
- Define strict shared API contracts and an explicit capability matrix for listing, connecting, selecting, reconnecting and disconnecting workspace Gmail accounts. Reuse source edit/read grants where appropriate; introduce a connection-management grant only if existing grants cannot express the intended access. Recheck permissions and paid eligibility on every operation and OAuth callback.
- Create additive migrations for workspace/provider account identity, encrypted credentials, one-use OAuth attempts, connection health, mailbox checkpoints, source eligibility windows and retry-safe message processing. Store Google's stable account identity independently of email spelling and connection row replacement. Separate secret records from safe account projections.
- Use authenticated encryption, a dedicated environment-specific integration key and key version, with workspace/account binding. Follow existing encryption conventions without reusing a file key implicitly. Define rotation and backup/restore key requirements. Exclude credential tables/columns from staff reads, assistant context, exports, logs and ordinary account APIs.
- Define account ownership, workspace deletion, disconnect, grant revocation and retention behavior. Existing immutable receipt/sample evidence follows the approved data retention policy; disconnect erases usable credentials and stops retrieval. Distinguish removing an account from a source from disconnecting the account for all its sources.
- Prepare Google Cloud setup instructions: Gmail API, consent audience/test users, web OAuth client, exact local and staging callback URIs, server-only client credentials and encryption keys. Prefer separate local/staging clients and projects, keeping grants and revocation isolated. Use the user's existing Gmail account and a second sender/account where available.
- Acceptance: disposable runtime-role migration/rollback tests; tenant isolation; secret-read exclusions; key mismatch/tampering rejection; no credential data in public account contracts.

### 2. Connect, select, reconnect and disconnect accounts

- Implement server-side OAuth authorization-code flow through an established Google auth library. Request `gmail.readonly` and only the identity scopes needed to establish stable account identity. Request offline access; verify granted scopes and Gmail profile access before marking connected.
- Bind a short-lived, random, one-use OAuth state to the initiating actor/session, workspace, source/draft intent, expected versions, PKCE verifier and allowlisted return path. Handle session loss, denied consent, expired/replayed callbacks, concurrent tabs, missing scopes and mismatched account identity. A provider `login_hint` is not identity verification.
- Persist refresh credentials encrypted; handle Google omitting a refresh token on later authorizations without destroying a valid existing one. Coordinate refreshes, handle credential generation races and revocation, and show reconnect-required for permanent authorization failures. Keep temporary provider outages distinct.
- Replace the wizard's empty account data and no-op callbacks using the canonical account component. Preserve unsaved work through navigation to Google and back; do not place draft content in OAuth state or URLs. Define encrypted, expiring server-side continuation or an explicit save-before-connect path before wiring the redirect.
- Persist selected account through a dedicated authorized, version-checked service; generic draft JSON must not be allowed to forge `connectionId` or `accountEmail`. Account changes invalidate dependent sample/mapping approval.
- Disconnect review identifies affected sources. Stop intake for all dependent sources atomically and invalidate pending work. Handle provider revocation scope carefully, including other grants under the same OAuth client; never silently disconnect another environment.
- Acceptance: account A/B selection survives reload; read-only member and other workspace denied; denial/reconnect preserve drafts; wrong-account reconnect rejected; refresh and disconnect races covered. Real local OAuth milestone may be tested here, with ingestion still disabled.

### 3. Real Gmail sample selection and approval

November 4 retrieval substep: the user approved the canonical UI. Authorized Gmail search/preview and wizard integration are implemented and tested, including the actual marked-message search, preview and use flow locally. Durable sample approval/publication binding is complete locally, including real extraction, explicit approval, save and reload; see [approval checkpoint](lead-capture-gmail-sample-approval.md). See [sample checkpoint details](lead-capture-gmail-samples.md). Local mailbox retrieval and sample approval are verified. Ingestion readiness remains pending checkpoint 4.

- Add bounded, authorized retrieval of recent candidate messages from the selected account, plus explicit message selection. Retain the existing pasted-example path.
- Parse MIME safely: plain text preferred, HTML converted to inert text, encoded headers/charsets/multipart handled, size/time limits enforced. Do not load remote images or process attachments in the first release. Treat message text as untrusted content.
- Feed selected and pasted examples into the existing assistant extraction/mapping services and usage accounting. Show exact source evidence, uncertainty and editable corrections using the canonical findings UI.
- Bridge explicit sample approval to the real publication sample contract: exact workspace/source, draft version, verified account identity, rules, fields and mappings. A pasted example may be approved after connecting an account, but its provenance remains pasted; it is not a claimed Gmail retrieval.
- Recheck version/account/rule/mapping binding on save and publication. Reconnecting the same stable account and switching accounts have deliberately different invalidation behavior.
- Acceptance: sample retrieval and approval create no lead or intake; account/rule/content edits invalidate approvals; stale sample approval fails; reconnect preserves only still-valid bindings; malicious markup and injected instructions stay inert.

### 4. Intake Review prerequisites and Gmail worker

November 4: application prerequisite 4a is implemented locally; see [Intake Review checkpoint](lead-capture-intake-review.md) for scope, validation and review. The [Gmail worker core](lead-capture-gmail-worker-core.md) is now implemented and fault-tested in scratch databases. Live activation, tracked extraction, task registration and readiness integration remain next. Delivery authority remains false.

- Complete the missing canonical Intake Review list/detail/evidence/correction/duplicate/decision path needed by this pilot, reusing the existing immutable receipts, review snapshots, lead-admission, assignment and audit services. This may be a separate reviewed subcheckpoint before the Gmail worker.
- Add an explicitly selected Gmail worker task. Enable only that task and its dependencies for a scoped pilot; do not enable every worker task as a shortcut.
- Establish an activation boundary without skipping messages that arrive during launch. Use durable mailbox history checkpoints and source eligibility windows, with idempotent processing keyed by workspace, stable account, source and message ID. Reconnect or a new connection row must not replay old intake.
- Poll history with pagination, leased work and bounded retries. Advance a checkpoint only after every candidate has a durable outcome or a durable retry obligation. Recover from crashes and concurrent workers without loss or duplicates. Do not hold database locks over Google or model requests.
- Fetch bounded content for eligible incoming candidates, apply exact deterministic phrase rules, then use the approved versioned mapping/extraction service for matches. Track provider/model usage and quotas. Preserve original evidence and uncertain or missing values for review.
- Atomically commit immutable Gmail receipt, intake proposal, workflow/configuration versions and source event. Every Gmail receipt uses supervised admission; there is no automatic lead-creation branch. Validate active status, account generation, entitlement, capacity and configuration again at commit so pause/disconnect races cannot admit work.
- Recover invalid/expired Gmail history cursors with a bounded rescan of the eligible interval and persistent deduplication. If the interval cannot be recovered within configured bounds, surface a recovery-required state and an explicit recovery action; never silently reset to the newest cursor or scan an entire mailbox without limits.
- Handle deleted/unavailable messages, MIME failures, quota/rate errors and provider outages distinctly. Expose connection health, last successful sync, retry/recovery state and safe error messages.
- Acceptance: crash/retry/concurrent-worker tests; no missing or repeated intake; active revision boundary tests; pause/archive/disconnect/downgrade stop admission; outage catch-up preserves eligibility; old cursor and quota recovery demonstrated.

### 5. Readiness and assistant integration

- Supply the same real Gmail readiness to web publication, manual resume, assistant proposal confirmation and scheduled activation. Require configured provider, healthy connection, exact reviewed sample, current grants/entitlement, available worker and explicit workspace/source pilot scope. Connection status alone is insufficient.
- Connect the existing account/rules/sample/workflow/final-review page composition to these services. Provide reconnect, disconnect and recovery feedback using canonical dialogs and colocated stories, including narrow layouts and denied/error states.
- The shared assistant can explain connection health, guide the user to Connect Gmail, suggest rules/mappings and prepare authorized proposals. OAuth consent remains a deliberate browser interaction. Neither a model reply nor verbal agreement connects an account or activates capture.
- Keep secrets out of assistant tools; fetch bounded email content only through current authorized sample/intake references. Test prompt injection, stale evidence, account changes and revoked access. Reuse tracked provider calls rather than adding an independent extraction client.
- Acceptance: assistant-created Gmail draft can proceed through actual connect, sample review, save and explicit launch; denied permissions and unready worker block launch consistently across every path.

### 6. Real-account local acceptance

Use a dedicated local workspace with eligible plan, the user's existing Gmail account, a second sender and fictional request details. Configure a unique per-run phrase marker before launch so unrelated incoming mail does not become test intake. Select samples explicitly and keep ordinary mailbox content out of test artifacts. The application Gmail integration stays read-only; the tester sends test mail separately. Any application notification/follow-up email remains disabled for the pilot so reviewing a fictional request cannot contact a recipient unexpectedly.

| Test | Required result |
| --- | --- |
| Connect account A, reload and restart the app | Correct account remains available; encrypted credentials support fresh access |
| Connect account B and select between them | Each source reads only its selected account; no tenant/account substitution |
| Cancel consent / omit permission / choose wrong reconnect account | Clear recoverable error; draft preserved; no false connected state |
| Refresh expired access token; revoke grant in Google; reconnect | Refresh succeeds; revocation stops intake; reconnect restores the same identity safely |
| Retrieve a sample and approve mappings | Exact evidence retained; no lead or intake created by sample testing |
| Send a unique matching fictional message after launch | One receipt and one visible Intake Review item within the normal polling target |
| Subject/body/both and all/any cases, case variations and non-match | Deterministic matching agrees with sample preview; non-match creates no intake |
| Retry/restart/replay; two messages in one thread | One outcome per eligible message/source; distinct messages are not collapsed by thread ID |
| Missing fields, HTML-only, Unicode, malformed/large content | Safe preview; uncertainty/rejection is visible and bounded |
| Pause/archive, mail during pause, restore/resume; worker outage | Approved eligibility policy followed; restore stays paused; outage mail recovered |
| Switch account or publish revised rules with work in flight | Old work cannot enter under the wrong account/configuration; new sample review required |
| Review and create, link duplicate, dismiss, repeat decision | Explicit authorized decision; one durable outcome; immutable original evidence |
| Disconnect and reconnect the same mailbox | Retrieval stops immediately; no old receipt replay after reconnect |

Capture sanitized evidence: release hash, migration list, workspace/source/test marker IDs, timestamps, connection/sync state and receipt/intake/lead counts. Do not store tokens, raw OAuth codes or normal mailbox content in release logs. Record which cases used real Google calls versus deterministic fault injection; token expiration and expired history need not be awaited for days to test their handling.

### 7. Scoped staging pilot

- After local acceptance, freeze an explicit reviewed release, finish required checks, create/restore-test a fresh private staging DB backup and plan migrations against the live ledger. Do not upload the whole moving working tree.
- Inspect current Railway web/worker services, runtime grants and environment configuration. Provision staging-only OAuth/encryption settings, register the exact authenticated web callback origin and deploy the reviewed manifest with Gmail intake disabled initially. The callback belongs on the web app, not the forms gateway domain.
- Test staging OAuth and account/sample loading first. Then enable only the dedicated workspace/source pilot and the Gmail worker task, preserving website controls and unrelated worker task settings.
- Repeat connect/reconnect, sample approval, matching/non-matching mail, receipt/intake decision, replay, pause/resume and disconnect against the staging build. Verify a worker restart does not duplicate intake. Confirm safe health metrics and ordinary app access.
- Rollback: disable Gmail intake, stop new admissions and drain/cancel pending leases safely; retain immutable receipts and evidence. Revert application code only when compatible with additive schema. Never recover by restoring an old database over new user records.
- End with a real-account QA report and an explicit recommendation about wider use. Broad activation/production release remains a later checkpoint.

## Google setup and release constraints

- Local real-account OAuth is supported using registered localhost redirect URIs. Polling needs outbound access but no public callback for Gmail notifications. This makes local testing a useful first milestone, followed by staging HTTPS/cookie/deployment verification. [Google web-server OAuth guide](https://developers.google.com/identity/protocols/oauth2/web-server).
- `gmail.readonly` permits the message content this feature needs and is a restricted scope; `gmail.metadata` cannot provide email bodies. Scope grants apply to the mailbox, not just our phrase matches. The user chose an existing account; use the test admission and evidence controls above. Production verification/security-assessment requirements must be evaluated before broad use; a testing-mode pilot does not establish production approval. [Gmail scopes](https://developers.google.com/workspace/gmail/api/auth/scopes), [restricted-scope verification](https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification).
- External apps in Google's Testing publishing state receive refresh tokens that expire after seven days when Gmail scopes are used. Reconnect is an expected test-mode requirement, not proof of a broken refresh implementation. [Google token expiration](https://developers.google.com/identity/protocols/oauth2#expiration).
- Gmail history cursors can expire and return HTTP 404. The worker must have an explicit resynchronization path constrained by capture eligibility and persistent deduplication. [Gmail synchronization guide](https://developers.google.com/workspace/gmail/api/guides/sync).

## Completion criteria

A real account can be connected, selected, refreshed, reconnected and disconnected locally and on scoped staging. An explicitly published source receives one eligible matching message into visible Intake Review, and an authorized reviewer can complete a retry-safe decision through the shared lead-admission boundary. Nonmatches, samples and repeated transport work create no extra leads. Permissions, tenant separation, lifecycle and provider failures behave as specified. The QA record identifies actual live-provider results and remaining rollout constraints.
