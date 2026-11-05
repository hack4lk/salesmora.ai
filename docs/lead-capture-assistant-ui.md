# Lead Capture assistant — presentation checkpoint

November 2, 2026. Checkpoint two of the approved [assistant implementation plan](lead-capture-assistant-plan.md). The same canonical adapter is used by the previews and is ready for subsequent authenticated page/runtime integration. No tool handler, provider call, migration, hosted flag or database record is changed by this checkpoint.

Continuation: this presentation checkpoint was approved. The [connected read checkpoint](lead-capture-assistant-reads.md) now integrates source pages and authenticated read handlers locally, reusing this adapter. Its newer verification covers the integrated version; the original results below record presentation-only work.

## Presentation

`apps/web/src/features/assistant/capture-result/` contains the client-driven result/review adapter, its typed client boundary, view binding checks, fictional fixtures and colocated stories. It composes the existing source list, source summary, publication installation instructions, intake evidence, field editor, lead workflow, publication review, pause/resume dialog and intake decision review. Their form markup and business validation are not duplicated inside chat.

Read results retain retrieval time and bounded-window context; a 20-row display never implies that only 20 sources matched. Read-result actions navigate through a host callback and do not expose list mutation buttons. Installation artifacts use the canonical text/copy component and are never executed by the preview.

Proposal reviews open only after selecting Review proposed change. Field/workflow suggestions are fixed review snapshots. Publication requires the existing explicit approval checkbox. Lifecycle confirmation uses the existing dialog; closing it only closes the review, while Cancel proposal is a distinct server decision. Intake confirmation uses the canonical frozen decision review. None of these callbacks is triggered by rendering or conversation text.

The adapter sends only the proposal workspace/ID/hash and confirm/cancel decision to the host client. It checks returned reference, operation, target, versions and terminal state before displaying an outcome. Confirmed copy comes from the returned result, distinguishing applying suggestions to an unsaved draft from saving or publishing a business record. It does not assume that an HTTP success alone proves the business outcome.

## Reuse changes

- `CaptureSetupReview` gains an optional `timingReadOnly` flag. Frozen assistant proposals cannot change timing while retaining the original payload binding. Normal page timing controls retain their existing default behavior. A dedicated canonical-component interaction story verifies this distinction.
- `CaptureFormFieldEditor` and `CaptureLeadWorkflow` accept an optional read-only explanation. Assistant proposals explain their frozen review state rather than incorrectly saying the teammate lacks edit permission. Existing page copy remains the default.

## Failure and lifecycle behavior

Loading, denied, stale binding, expired, pending, cancelled, confirmed and conflict/reload states are represented. Mismatched/denied results hide record details and action controls. Focus refresh rechecks access and drops the old view while checking. An explicit disabled/access-revoked prop remounts the card without exposing its prior view. Reference/workspace changes and unmount abort requests; stale responses cannot update another card lifetime. Confirmation is single-flight and expires locally as well as requiring eventual server expiry checks.

After an uncertain confirmation error, the card offers a read/reload rather than inventing a failure outcome or reusing changed business payloads. The future server client must resolve an already confirmed decision idempotently. A failed history refresh does not undo or misreport a verified business outcome.

The typed host client is intentionally required: this checkpoint does not call an imaginary server route or enable the new tools. Actual wire parsing, fresh authorization, evidence/history validation, exact transactional confirmation and authenticated record navigation belong to the next integration checkpoints. The adapter's checks supplement those server boundaries.

## Review and verification

Run local Storybook on port 6010 and open [the actual shared assistant preview](http://127.0.0.1:6010/?path=/story/assistant-leadcaptureresult--shared-chat-review). Standalone stories cover each supported canonical composition and failure state. The shared-modal stories exercise the existing `AssistantPanel` supplement slot, including nested lifecycle-dialog Escape handling. Fixtures mock the same client boundary used by the canonical adapter; no alternate preview card or provider client exists.

Validation runner: `node scripts/check-capture-assistant-stories.mjs` (optional story-ID regex argument; `STORYBOOK_URL` may override the local URL). It checks Storybook interaction completion, WCAG A/AA violations and horizontal overflow at 1440, 768 and 320 pixels. It also verifies that the shared chat's confirmation control can be scrolled into the viewport. Screenshots are retained under `.local/releases/capture-assistant-ui-20261102/`.

Final stable validation passed: **72 interaction/accessibility/layout cases across 24 stories and three widths**, **47 focused unit/contract tests across six files**, web package typecheck and focused ESLint. Mobile standalone fields, the actual shared chat and its scrolled confirmation/cancellation footer were visually inspected. Evidence and validation metadata are retained in `.local/releases/capture-assistant-ui-20261102/`.

## Next checkpoint and remaining scope

Connect the shared assistant to source pages and validated page context, then implement bounded authorized source queries, installation reads, evidence persistence/revalidation and grounded help. Source setup writes and publication/lifecycle confirmation come after read integration. The UI types currently cover the canonical review families above; restore/duplicate/schedule-change, sample mapping and the remaining setup/intake operations will receive their exact canonical adapters alongside their reviewed services and operation payloads. They are not advertised as executable tools by this checkpoint.

Gmail connection/ingestion, the independent staging scoped pilot and production activation remain separate from this local assistant work. The service gaps in [checkpoint one](lead-capture-assistant-contracts.md) still apply.
