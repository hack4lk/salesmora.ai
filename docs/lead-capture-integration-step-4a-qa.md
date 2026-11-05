# Lead Capture integration step 4a — component previews

Implemented October 31, 2026 after user approval of the [step 4 implementation plan](lead-capture-integration-step-4-plan.md). This checkpoint covers components and local Storybook behavior. Settings persistence/page integration is slice 4b.

## Default assignment

Added the controlled `DefaultLeadAssignment` component under `apps/web/src/features/settings/default-lead-assignment/`, using the established settings-card layout, shared form controls and colocated copy/stories. The initial explicit rule is **Leave leads unassigned for manual assignment**. The alternative selects one eligible teammate. Sources with their own assignment keep it; existing leads are not reassigned.

The host supplies authorization, saved rule/revision and eligible teammates. Save requests carry the selected rule and expected revision. Loading, denied/read-only, stale teammate, pending, conflict/reload, failed save/retry and discard states preserve the appropriate draft or prevent submission. An unassigned rule remains valid when no teammates exist. Save success requires the host callback to resolve and acknowledge the saved value. No API or database write is connected here.

## Visitor form protection and retries

Extended the existing approved visitor form without introducing a second renderer. A host-controlled protection projection shows challenge required/verifying/verified/expired/error and rate-limit states. Challenge content is a host-mounted slot; the component never loads a provider script or treats UI completion as server authorization. Missing challenge tokens and active/invalid rate deadlines block submission. Inputs remain available while a challenge is being completed; all values remain present after challenge/rate errors.

An uncertain response keeps the original normalized answers and request UUID for a **Retry same request** action. Editing is locked until that request has a definite result, preventing an accidental new submission after a lost acknowledgement. A refreshed challenge token is transport evidence and does not generate a new submission identity. Success is displayed only after the host returns a durable-receipt success.

The security-preview button and tokens are explicitly fictional. Real Turnstile server verification, shared rate enforcement, hosted delivery, DNS and persistent settings remain later slices.

## Verification

Verified October 31, 2026:

- 46 Storybook stories passed at 1440px, 768px and 320px: **138 browser cases**. The initial 45-story run passed 135 cases; the added expired-challenge/request-identity regression passed three more.
- Browser checks ran each story's interactions, Axe WCAG A/AA rules, horizontal-overflow detection and browser-error capture. No violations or errors remained. Representative assignment and visitor challenge screenshots were visually inspected.
- Assertions include saved-version payloads, eligibility and permission gates, failed save/retry, duplicate pending-submit protection, preserved input, challenge-required/expired/error states, missing-token blocking, rate-limit states and matching request identities after an uncertain response. The token-refresh regression verifies that a fresh token changes while the original answers and submission UUID stay the same.
- The seven existing visitor validation unit tests passed.
- Web typecheck, focused lint and `git diff --check` passed. An initial lint pass caught ref access during render and a synchronous state update in an effect; both were corrected before the final clean check.

The rate-limit previews demonstrate UI blocking and elapsed-deadline behavior. Actual distributed enforcement, provider token validation and server admission are intentionally not implemented in this component checkpoint.

Review locally:

- [Default assignment](http://127.0.0.1:6010/?path=/story/settings-defaultleadassignment--default)
- [Choose teammate and save](http://127.0.0.1:6010/?path=/story/settings-defaultleadassignment--choose-and-save)
- [Visitor security check](http://127.0.0.1:6010/?path=/story/lead-capture-visitorcaptureform--challenge-required)
- [Expired challenge and safe retry](http://127.0.0.1:6010/?path=/story/lead-capture-visitorcaptureform--challenge-refresh-keeps-request)

User approved this component checkpoint October 31, 2026. Settings → Leads persistence and page integration continue in slice 4b.
