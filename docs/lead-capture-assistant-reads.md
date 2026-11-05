# Lead Capture assistant — connected reads checkpoint

November 2, 2026. Implements checkpoint three of the approved [assistant plan](lead-capture-assistant-plan.md). Source pages now use the existing shared assistant, with authenticated typed reads, durable evidence, streamed result tickets, private history and authorized record navigation. This is verified locally; staging remains on the defaults-off activation release.

## Available behavior

The registered `lead_capture_query` tool supports five read operations: source search, saved source details, source summary, publication readiness and installation instructions. `assistant.use` and current `leadCapture.read` are independently required. The tool is relevant globally for authorized teammates; explicit source-page context supplies only the current selection or source-list filters.

List reads reuse the canonical source-window projection with one to twenty rows, real totals and complete non-overlapping pagination. Manual page pagination remains unchanged. Record reads require an exact current source ID or the explicit selected source; missing selection returns a clarification. Missing current-page filters also require clarification rather than broadening a request silently. Old conversation is never used as an implicit record selection.

Saved configuration distinguishes drafts from approved configurations. Summaries expose current scoped source totals without returning intake payloads. Readiness uses the normal canonical source review and web delivery authority; it does not prove an accepted real request or authorize launch. Installation returns only the existing scoped persisted artifact projection, or null. No URL or public key is invented.

Source list, new, setup and detail pages enable the existing shell assistant when the runtime and current app permissions allow it. A small client context adapter updates selection/filters across navigation and leaves unsaved wizard state untouched. Clearing selected context omits it from subsequent turns. Typed turn contracts reject context for another surface and reject client readiness/authority fields.

No proposal/commit tool is registered. Website suggestions, saving drafts, publication/lifecycle mutations, Gmail sample mapping/connection and intake decisions are subsequent checkpoints. Existing manual page actions are preserved.

## Persistence and access boundaries

The additive migration `202611040001_capture_assistant_reads.ts` adds nullable `captureStamp` and `captureResult` columns to `chatTurns`, plus the SHA-256 stamp constraint. It follows the existing Calendar/Estimates pattern. Existing table-level runtime grants cover these columns; no credential or role change is required. Down migration refuses to remove retained capture evidence. Private transcript deletion/retention removes the columns' contents with the turn; no business record is changed by these reads.

The server-private conservative fingerprint includes the current actor, canonicalized policy/grants and enabled permissions; scoped source/draft/approved/publication/transition rows; receipt/intake metadata used by counters; relevant workspace, membership, teammate, services, plan and billing state; effective plan state; and the safe effects of delivery/installation configuration. It contains no provider credentials. Permission-row ordering does not alter an otherwise identical fingerprint. Foreign workspace changes do not invalidate this workspace's result.

Evidence is bound before exposing current page facts, persisted before tool results reach the model, rechecked during streaming and before completed result release, and validated on saved-history/result reads. Follow-up turns inherit only currently valid capture stamps. Source edits, access changes, new counter evidence or deployment-control changes invalidate dependent answers/cards conservatively. A source change during generation stops the run before a stale result ticket is emitted. Stored historical configuration text remains explicitly untrusted data.

`GET /api/chat/lead-capture` accepts only an authenticated workspace/turn/result/hash binding. It requires the current author-owned completed turn and thread, exact stored result, current evidence and current permissions. Same-workspace teammates with their own read permission cannot read another author's private result.

`POST` on that route is navigation only: it additionally accepts a source ID that must be in the stored result and still belong to the authorized workspace. It checks Origin and returns the fixed application record route. The client rejects wrong result IDs/operations/workspaces and external or mismatched navigation. It cannot interpret a confirmation or perform a business mutation.

The production read adapter uses the already reviewed `CaptureAssistantResult` and canonical source list/summary/details/installation components. A small readiness presentation was extracted from `CaptureSetupReview` and is shared by manual launch review and assistant reads. No parallel launch form was introduced.

## Help and provider scope

The reviewed local help corpus now includes `lead-capture-assistant`, filtered by `leadCapture.read`, explaining search, readiness, installation, historical evidence and the read-only boundary. Corpus parsing/metadata regressions pass. The corpus has not been seeded into hosted retrieval or re-embedded by this checkpoint.

Authenticated tests use the isolated fixture planner/answer provider through the real graph, authorization, SQL, streaming, persistence and UI. They make no OpenAI calls. They verify execution boundaries and durable outcomes, not live model selection/answer quality. The fixture answer includes structured evidence for inspection; its mobile screenshot is layout evidence, not a sample of polished live-provider prose. Bounded live-provider evaluation remains part of the later integrated completion review.

## Verification

- **3,496 unit tests / 226 files passed**, excluding the pre-existing unrelated `apps/worker/src/file-processing-simple.test.ts` manual helper, which declares no Vitest suite. The first unrestricted run exposed that existing helper issue and the expected help-corpus count change. No unrelated worker file was modified.
- **Seven fresh local runtime-role database groups passed**: disjoint bounded windows/manual pagination, independent grants, current filters, explicit selection/tenant denial, no fabricated readiness/installation or business writes, control/configuration invalidation, ordering-stable stamps and foreign-workspace isolation.
- **Six authenticated Chromium/API journeys passed** (final run 1.5 minutes): streamed reads/history/replay/navigation; selection/clearing/foreign-source denial; actual mobile source list/detail/setup assistant; disabled installation/readiness and Field denial; stale card/history withholding with a fresh follow-up; source-change-during-generation rejection. Same-workspace admin read access does not grant another author's private result. The app connected through the restricted web role with role enforcement enabled.
- **99 interaction/accessibility/layout cases passed** across 33 canonical/connected stories at 1440, 768 and 320 pixels. This includes all prior presentation stories after integration, current API result binding, safe navigation, access revocation, configuration/readiness and missing installation. Mobile actual-page layout was also checked and its screenshot visually inspected.
- Contract, agent, data and web typechecks passed; focused ESLint passed with only the existing React auto-detection warning.

Commands:

```sh
export PATH=/Users/lukasz/.nvm/versions/node/v22.23.3/bin:$PATH
node --import ./packages/data/node_modules/tsx/dist/loader.mjs packages/data/src/lead-capture/assistant-read.rehearsal.ts
node scripts/capture-assistant-e2e.mjs
node scripts/check-capture-assistant-stories.mjs
pnpm exec vitest run --exclude apps/worker/src/file-processing-simple.test.ts
pnpm --filter @salesmora/contracts --filter @salesmora/agent --filter @salesmora/data --filter @salesmora/web typecheck
```

Both database/browser harnesses require a distinct loopback `_test` connection and create/drop new random databases. They never migrate, reset or truncate a configured database. Browser fixtures use fictional identities/contacts, no notifications and disabled capture transport/publication/scheduling. The browser harness reuses only `.next-e2e-capture-assistant` compilation artifacts; `--clean` explicitly clears that one disposable build. It restores its own generated Next type-path edit without overwriting other changes. No framework/package upgrade, authentication bypass or user's dependency cleanup was required.

Non-secret validation records, logs, owned-file hashes and the actual mobile screenshot are retained under `.local/releases/capture-assistant-read-20261102/`. This directory is evidence, not a frozen deployable release. The large moving workspace still includes unrelated admin/worker work: reconcile and prepare an explicit reviewed overlay before any later upload. Neither that tree nor this migration was deployed.

## Next checkpoint

Review this connected-read slice, then implement checkpoint four: durable setup proposals and browser confirmation, source create/revision/save, website field/workflow suggestions, pasted Gmail sample extraction/refinement and exact sample approvals. Connect the approved setup controls to the same tracked provider/services. Preserve dirty-draft fingerprints and distinguish applying suggestions locally, saving a draft and publishing it. The canonical service gaps and centrally unreviewed intake correction permission remain tracked in [checkpoint one](lead-capture-assistant-contracts.md).

The independent staging scoped pilot remains pending. No hosted gates, domain, worker mode, migration ledger, sources or receipts were changed by this assistant checkpoint.
