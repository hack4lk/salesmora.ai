# Lead Capture assistant setup checkpoint

Prepared November 2, 2026; verified November 3, 2026. Checkpoint four of the approved [assistant plan](lead-capture-assistant-plan.md). The connected-read checkpoint was approved. This checkpoint connects draft setup proposals and their explicit confirmations locally; publication/lifecycle and intake assistant work remain later checkpoints.

## Implemented behavior

`lead_capture_propose_action` prepares eight operations: `create_source`, `begin_revision`, `save_draft`, `suggest_website_fields`, `suggest_workflow`, `extract_sample`, `refine_mapping` and `approve_sample`. Current assistant and exact source create/update/read permissions determine advertised operations and are checked again by the data service. No model commit tool exists. A chat “yes” cannot execute a business mutation.

Preparation stores an author-owned proposal linked to its chat turn/thread. Typed `capture.setup` events and independently validated history tickets display the canonical assistant result card. Its review composes the actual field, workflow and Gmail findings components and shows the exact proposed configuration, prior saved summary, notification effects and save boundary. Only a completed originating turn can be confirmed. Draft create/revision/save delegates to the existing canonical application services.

Website Suggest fields, workflow guidance and Gmail extraction/refinement open the existing shared assistant with a prepared prompt. Clicking Ask uses its normal model, usage reservation, streaming, Stop/retry and private history infrastructure. These controls do not run a second provider pipeline. Unsaved setup/sample intent is bounded to 10,000 UTF-8 bytes within the existing 16,000-byte chat request limit; oversized input is rejected without truncation. Pasted bodies are at most 6,000 characters and subjects at most 2,000 within that total. Source text, pasted messages and findings are untrusted evidence rather than instructions.

Applying a confirmed suggestion updates only the exact matching unsaved wizard state. The host compares canonical source/draft/name/configuration/sample/findings before confirmation and again before applying the receipt. A changed or unavailable setup requires a fresh review. Applying fields/workflow/mapping is separate from saving a source draft, and saving remains separate from publication.

## Gmail sample boundary

Extraction findings contain deterministic quote provenance: proposed values must occur in the supplied subject/body quote, which must occur in the pasted sample. Unknown fields, duplicate included mappings, unsupported values and required-field/contact omissions are rejected. Model output cannot label a manual correction as extracted evidence. The canonical findings screen permits explicit corrections; its approval checkbox/action binds those corrections to the actor's previously applied extraction and exact sample.

Confirmed pasted-sample approval retains an immutable `captureSetupSamples` row bound to the source/draft and fields/contact/rules/mappings hash. It returns the issued sample ID to the unsaved wizard. Saving uses the canonical draft validator and accepts changed sample/mapping authority only when the exact retained approval exists. Reloading a saved Gmail draft restores its matching approved sample/findings through a scoped read.

This table is deliberately separate from `captureSourceSamples`, which requires real provider connection/account evidence. No mailbox IDs or accounts are invented. Setup approval cannot satisfy Gmail publication readiness, connect a mailbox, read email, admit requests or send notifications. Account/OAuth and ingestion remain separate integration work. The existing Gmail wizard continues to block launch progression without a real account.

## Persistence and security

The additive migration `202611040002_capture_assistant_setup.ts` creates private proposals, immutable minimal setup audit, retained setup samples and bounded proposal evidence IDs on turns. It has been exercised only in newly created disposable local databases. No configured local database or hosted database has been migrated by this checkpoint.

Proposals bind actor, workspace, turn/thread, operation, input hash, authority, source/draft/approved versions and unsaved base. A workspace write lock precedes confirmation/source mutation. Confirmation receives only proposal ID, hash and decision; business input cannot be substituted. Pending proposals expire after fifteen minutes; a new proposal supersedes the same actor/thread's pending one. Exact decision retries return the recorded receipt. Concurrent generation, conflicting decisions, changed records, permission revocation, changed plan eligibility and unavailable selected teammates fail closed.

Proposal evidence participates in stream/completion and follow-up validation. Old text does not regain validity merely because a proposal was confirmed. A saved receipt card is validated independently against the current saved source/draft versions. Another workspace administrator cannot read or decide the author's private proposals. Private transcript deletion cascades proposal content, while the minimal audit and approved business setup sample survive. Audit contains IDs, operation/action and hash rather than pasted content. Approved pasted text is retained business setup evidence and is removed with workspace deletion, not private chat deletion.

## Verification

Commands (Node 22):

```sh
node --import ./packages/data/node_modules/tsx/dist/loader.mjs packages/data/src/lead-capture/setup-proposals.rehearsal.ts
node scripts/capture-assistant-e2e.mjs
node scripts/check-capture-assistant-stories.mjs
pnpm exec vitest run --exclude apps/worker/src/file-processing-simple.test.ts
pnpm --filter @salesmora/contracts --filter @salesmora/agent --filter @salesmora/data --filter @salesmora/web typecheck
```

The database and authenticated-browser harnesses require a distinct loopback `_test` connection and create/drop fresh random databases. They use fictional identities, disabled capture delivery/publication/scheduling and the actual web runtime role. Revision testing creates one approved publication as a local canonical-service fixture and verifies assistant revision creation leaves it unchanged. No external mail/provider call is made. Fixture-model browser tests exercise orchestration and authorization, not live model quality.

Verification passed: 3,506 tests across the full 228-file unit suite, plus the five final adapter regression tests (one additional unique case); eight fresh runtime-role database groups; nine authenticated fixture-model journeys; 123 story interaction/accessibility/layout cases at 1440px, 768px and 320px; all four package typechecks; focused lint; and diff whitespace checks. The browser main run passed eight journeys, then its Gmail selector was corrected for the canonical “Subject (optional)” label. The isolated Gmail rerun passed extraction, explicit approval, Save, restored findings and the clean-draft indicator after reload. These are complementary runs, not a claim that the earlier nine-test invocation passed.

The restored-sample dirty-state regression is covered separately: hydration of matching approved business evidence does not mark the draft changed; pasted edits, corrections and a new approval still require saving. Non-secret validation records, logs, screenshots and reviewed-file hashes are retained under `.local/releases/capture-assistant-setup-20261103/`. This moving workspace contains unrelated admin/worker changes; it is not a deployable frozen candidate.

## Next review

Review this setup checkpoint before enabling assistant publication/lifecycle proposals. Those actions must recheck exact versions, readiness, capacity, timezone and actual delivery authority at confirmation. Intake application services and the centrally unreviewed intake correction permission remain separately tracked. No staging gates, domains, worker mode, migration ledger, source configurations or receipts were changed by this local checkpoint.
