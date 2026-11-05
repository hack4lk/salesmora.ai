# Lead Capture revision and lifecycle gates — November 1, 2026

Status: **live revision, stale-consent, pause/resume, owner-access-loss and archive gate checks passed** on a fictional staging form. Temporary submissions are disabled again and shutdown is verified. General publication authority remains disabled.

## Scope

The user approved proceeding with the immediate revision/lifecycle verification step. A second notification-free source was created in the existing synthetic canary workspace using existing authorized draft/review/publication functions and a one-shot delivery authority bound to that workspace. No customer data, staff account, new authentication session, test provider or bypass route was created. The earlier seven receipts were retained unchanged. The same frozen web release was redeployed as `93e30a2c-36c9-47e8-b644-1482bc4d36b3` with submission transport temporarily enabled; no application source upload was needed.

The test source's private identity and safe evidence are retained in `.local/releases/capture-revision-20261101/`. Its `state.json` identifies the source/publication and stable URL. Signed request payloads remain only in the private temporary diagnostic directory, not in source or this document.

## Passed checks

1. **Stable identity and publication history.** Version 1 accepted one fictional request. A revision changed the title, added a field and changed consent wording/version. Saving that draft did not change the public version. Publishing version 2 retained the exact public key, URL and publication row, incremented the publication version, and preserved the complete approved version-1 configuration.
2. **Stale context and consent.** A new request using the version-1 context returned stale after revision. A version-2 context with version-1 consent returned invalid. A request with current consent was accepted. An exact retry of the already accepted version-1 request still returned its original acknowledgment.
3. **Real browser refresh.** A browser held a filled version-1 form with checked consent while version 2 was published. Submitting it displayed the refresh control and locked the stale form. Refresh loaded version 2 at the same URL, preserved matching answer fields, added the new field and cleared the consent checkbox. Submitting without accepting revised consent displayed the consent validation error and did not create a receipt. Screenshot: `.local/releases/capture-revision-20261101/stale-refresh-consent.png`.
4. **Pause/resume gates.** An audited, authorized, version-checked pause made the public form unavailable, omitted fields, and rejected new writes. Accepted exact retries remained acknowledged. The corresponding controlled resume restored the same version-2 definition and URL.
5. **Owner access loss.** The existing `suspendUser` function suspended only the synthetic owner with a system actor and audit reason. Public reads became unavailable, new writes were refused and the attempted admission recorded a persistent workspace block. Accepted exact retries remained acknowledged. The existing `unsuspendUser` function restored the owner with an audit record. The form deliberately stayed paused/blocked; access restoration does not silently reactivate a form after an observed incident. A reviewed relaunch is required.
6. **Archive and retention.** The blocked test source was archived using an authorized, version-checked operator lifecycle transaction, recording a `source.archive` operation and `source.archived` event. The public view remained unavailable and new writes were rejected. Both new receipts, both approved versions and all seven earlier receipts remain present. Consent versions on the two new receipts match their approved configuration versions. No assignment notifications or assignment-email intents were queued. The owner is no longer suspended; source status is archived, version 9, with the workspace block retained as evidence.

## Limits and next implementation gap

The deployed app has no customer-facing pause/resume/archive API handlers yet. The lifecycle gates above were exercised through constrained operator transactions using existing workspace authorization, lifecycle/result contracts, optimistic version checks and audit events. They do **not** establish an end-to-end customer lifecycle UI/API workflow. Implement and review that workflow before general activation; do not replace it with direct client database access or a production test endpoint.

This slice also does not claim blocked-third-party-cookie coverage, mobile layout QA, resize-forgery rejection, restricted-runtime-role cutover, scheduler activation or general installation projection. Those remain later rollout work. Broad publication authority was not enabled.

## Cleanup

`CAPTURE_SUBMISSIONS_ENABLED` was reset to false and the existing frozen web release redeployed. The synthetic source is archived and all retained evidence remains intact. Temporary SSH access was revoked; Railway reported no registered keys afterward, and the isolated SSH agent/private/public key files were removed. No schema change, reset, rollback, seed or production deployment was performed.

Shutdown deployment `db311173-ac8b-42d3-ab12-32aa76ce0ebf` reached **SUCCESS**. Configuration reports submissions disabled; the live submission endpoint returns retry before processing input, the archived public view remains unavailable, and existing application HTTPS health passes. The completed test tab was closed.
