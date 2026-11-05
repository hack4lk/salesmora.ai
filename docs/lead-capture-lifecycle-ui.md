# Connected lifecycle dialogs — November 1, 2026

Status: **deployed and verified in staging** after UI review and deployment approval. Source-list and dashboard actions open the existing approved pause/resume/archive dialogs and call the confirmed lifecycle API. See the [deployment record](lead-capture-lifecycle-staging-20261101.md). Production remains empty; public submissions and general publication activation remain disabled.

## Behavior

The source list receives server-derived pause/archive capabilities, narrows actions by source state, and retains its existing setup/edit actions. The dashboard receives per-source lifecycle capabilities. Unsupported restore/duplicate/scheduled-change actions stay hidden. Read-only users do not acquire controls from their role name or a client-side guess.

Opening an action fetches the latest scoped source details before showing its review. The server projects source/approved versions, action capabilities and resume readiness; the client verifies the requested workspace/source and review bindings. Read-only reviews reuse the mutation's approved-configuration, delivery, assignment, access, capacity and pending-work checks. The mutation independently rechecks them under write locks.

The dialogs retain their approved layouts, consequences, Cancel focus and long-review behavior. Resume displays the persisted approved version and configuration, not an unpublished draft. When delivery readiness is unavailable, the user can read the review but cannot confirm resume. No preview fallback or client readiness flag enables real intake.

After confirmation, the host freezes the action, request ID, source version and approved-version selection. A lost or malformed acknowledgment keeps the dialog open and retries that identical command. Success closes the dialog and refreshes the server-backed list/dashboard. Concurrent updates return a conflict: confirmation is disabled until the user explicitly reloads, reviews the latest source and obtains a fresh command. Readiness failures refresh the checked review; read/action denial clears the modal and hides stale source details. Pending mutations prevent duplicate actions and dismissal. Reads and lifecycle writes have bounded request timeouts.

List pagination, filters and current/archived view remain server-driven. Archiving refreshes the visible rows; the source may disappear from the current filter. Cancelling a review also refreshes the host so newly observed source changes are reflected without applying a mutation.

## Verification

- **3,422 unit tests across 210 files passed**, including scoped client-response/acknowledgment validation and the authenticated API boundary. Workspace typechecks and focused lint passed.
- **Nine lifecycle and 18 publication/capacity/scheduler database groups passed** against disposable local databases with runtime-role connections. The additional group verifies that read-only lifecycle projections bind current versions, expose actual permissions, perform no mutations, and use the same readiness decisions as the mutation.
- **Four authenticated Chromium journeys passed** against the real local Next app/API and a fresh disposable database:
  1. List pause confirmation and cancellation; a deliberately lost accepted acknowledgment; identical retry and one operation receipt; blocked resume review; dashboard archive and refreshed state.
  2. Dashboard pause after a concurrent real draft revision; conflict lockout; explicit source reload; fresh expected version/request ID; one accepted pause.
  3. Archive permission revoked after opening its review; server denial; dialog/source details cleared; unchanged source state.
  4. List archive of a scheduled source; explicit launch-cancellation copy; cancelled transition and removal from the current filtered rows.
- **36 responsive Storybook cases passed**: 12 connected stories at 1440, 768 and 320 pixels, covering pause, archive, resume, blocked resume, lost acknowledgment, conflict/reload, initial/reload denial, readiness changes, pending protection and review-only states. Interaction, Axe WCAG checks and horizontal-overflow checks passed.
- A focused keyboard check passed at all three widths: the long resume review starts at its content and Tab reaches the Cancel footer, scrolling it into view on phone. Desktop pause and phone blocked-resume screenshots were visually inspected.

The Storybook success responses are explicitly fictional mocks. Real authenticated browser tests preserve unavailable delivery authority and verify that resume remains blocked; they do not claim a live successful resume against an enabled provider. No external provider call, email or public submission was made by this local verification.

## Review

[Pause confirmation](http://127.0.0.1:6010/?path=/story/lead-capture-connectedlifecycle--pause-review) · [Archive confirmation](http://127.0.0.1:6010/?path=/story/lead-capture-connectedlifecycle--archive-review) · [Blocked resume](http://127.0.0.1:6010/?path=/story/lead-capture-connectedlifecycle--resume-blocked) · [Conflict/reload](http://127.0.0.1:6010/?path=/story/lead-capture-connectedlifecycle--conflict-reload)

The local Storybook server must be running for preview links. Safe visual evidence is retained in `.local/releases/capture-lifecycle-ui-20261101/`.

Run `pnpm test:lead-capture-lifecycle:e2e` for the real local browser flow; it reuses the existing harness with a separate port/build directory and a new disposable database. The original wizard harness remains available through its existing command. Run `pnpm test:lead-capture-lifecycle:db` for data-service/readiness regressions.

This completes dialog wiring and its staging deployment. Restricted runtime-role cutover, public delivery authority, scheduler activation, broad publication enablement, and the other embed/cookie/resize rollout checks are still separate checkpoints. Restore and duplicate workflows are not implemented by this slice.
