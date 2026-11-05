# Gmail sample selection — checkpoint 3

Updated November 4, 2026. Status: picker UI approved by the user; authorized retrieval and the connected wizard are implemented and passed the first real marked-message search/preview/use check. Durable sample approval and publication binding are now complete locally; see [approval checkpoint](lead-capture-gmail-sample-approval.md). The real local OAuth connection passed separately. Capture remains off.

## Reviewed design to implement

The approved integration plan requires bounded mailbox candidates, explicit selection, safe MIME parsing, the existing extraction/mapping review, and an exact account/draft/rules-bound publication sample. The user approved the canonical UI on November 4 before this backend/page integration, following the repository's component/stories/review sequence.

`GmailSamplePicker` is composed by the existing `GmailEmailExample` when the host supplies its optional `mailbox` prop. There is no alternate preview-only feature component. Existing pasted-example callers continue to use the same form. The picker does not fetch on mount. Its deliberate actions are:

1. Enter a required subject phrase of 3–100 characters and search. The server enforces the last 30 days and at most 10 results. The host sends a versioned, same-origin search request; arbitrary Gmail query syntax is rejected.
2. Review candidate metadata: subject, sender and received time. Bodies/snippets are not part of the candidate projection.
3. Choose Preview for one message. Its text appears inert, without HTML rendering, remote images or attachments. Invalid/mismatched/oversized previews fail closed; the text limit matches the existing 20,000-character example contract.
4. Choose Use this example. The host applies the selected text and retains provider provenance independently. This action does not start extraction.
5. Review or edit the example, then explicitly choose Extract fields. The connected host will reuse the existing assistant review and accounting services.

The picker unmounts on account/draft binding changes, read-access loss, edit-access loss or disconnected-account state. Late results cannot populate the replacement picker. The UI key includes source/draft versions and account identity/version. The server reference additionally binds the full saved configuration and credential generation. Pending operations prevent duplicate requests. Search, preview and application failures preserve a retry path. A disconnected account does not remove the pasted-example path.

The UI stories use fictional messages and mocked callbacks. A separate live local check used only the user's explicitly prepared fictional email. Neither path sends mail or starts ingestion.

## Verification

Run under Node 22:

```sh
pnpm --filter @salesmora/web typecheck
pnpm exec eslint apps/web/src/features/lead-capture/gmail-sample-picker apps/web/src/features/lead-capture/gmail-email-example/gmail-email-example.tsx apps/web/src/features/lead-capture/gmail-email-example/gmail-email-example.stories.tsx
node scripts/check-capture-gmail-stories.mjs 'gmailsamplepicker|gmailemailexample'
```

The story checker runs interactions, WCAG A/AA accessibility checks and horizontal-overflow checks at 1440, 768 and 320 pixels. Coverage includes deliberate metadata/preview/use boundaries, the composed extraction path, retained paste fallback, retry, duplicate submission, invalid queries, oversized/mismatched messages, result-count limits, inert injected markup, pending account changes, and revoked read access. Verification passed: 105 story cases, a final six-case composition rerun after the copy adjustment, web typecheck and focused lint. Sanitized evidence is in `.local/releases/capture-gmail-connections-20261103/sample-ui-validation.json`; screenshots are beside it.

Review the composed flow at [Gmail example selection](http://127.0.0.1:6010/?path=/story/lead-capture-gmailemailexample--mailbox-example-then-extraction). Its fictional identity is intentionally separate from the user's real Gmail account.

## Retrieval and connected wizard implementation

Two same-origin authenticated POST routes, `/api/lead-capture/gmail/samples/search` and `/preview`, accept strict source/draft-version contracts. They authorize the current session, actor, workspace, source update/read permissions, paid plan and connected selected account both before and after the provider operation. Provider calls run outside SQL transactions. A changed or revoked authority discards the result.

Search requests only Gmail IDs and Subject/From metadata, not snippets or bodies. Subject phrases are quoted into a fixed 30-day query, then filtered as literal case-insensitive substrings against decoded headers and Gmail's internal receipt time. At most 10 metadata requests are made. Only an explicitly chosen candidate can fetch `format=full`. There is no attachments endpoint, automatic pagination or mailbox import. Response streaming is limited to 10 KB for ID lists, 30 KB for each metadata projection and 1 MB for a full-message response, under a shared 15-second provider deadline.

Candidate references are encrypted with the existing private keyring using a separate authenticated purpose. They contain actor/session binding, exact source/draft/configuration/account-generation binding, provider message identity, search phrase and 15-minute expiry. Raw provider IDs never become client authority. Tampered, expired, cross-session and stale references fail before content access. These references are stateless and require no database migration.

Gmail's MIME tree is parsed with depth, node, byte and text limits. Base64url transfer data is decoded once, supported charsets and encoded headers are handled by established libraries, plain text is preferred over alternative HTML, and HTML is converted to inert text. Filename/attachment parts, externally stored parts, images, scripts, styles and link destinations are excluded. Unsupported or oversized messages fail rather than silently truncating evidence. Google authorization loss marks the account reconnect-required and records a safe event; temporary failures preserve the connection.

The canonical wizard composes the picker and actual APIs. Configuration changes require saving/rebinding before a new search; editing the local example alone does not force a save. Use this example copies text without extraction, preserving local preview provenance separately. Editing its text clears that provenance. This is not durable publication approval: the existing assistant path still accepts editable example text, and provider-reference validation/retention at approval is now implemented by the [approval checkpoint](lead-capture-gmail-sample-approval.md). No new independent model client was added.

## Real local acceptance — November 4

The earlier source `1eaf8922-850b-467f-a0cb-c94fd3c1ef20` was found archived and was left intact. The current **Gmail Demo Intake** draft, `4af59f17-4d20-421e-bf94-2ac2489cd293`, already had the connected account selected and was used instead; no replacement source was created.

The user sent a fictional message with subject `SALESMORA-GMAIL-LOCAL-20261104`. The actual app found it using that exact subject filter, previewed its text, and copied it into the editable example only after Use this example. The text was “Alex Morgan needs a water heater quote. Contact alex@example.com.” No assistant request was submitted during this retrieval check. The source remained a draft with no approved version, message jobs, capture receipts, retained samples or open eligibility windows. Private local screenshots and sanitized state evidence are in `.local/releases/capture-gmail-connections-20261103/`. The test does not claim staging or ingestion acceptance.

Direct unauthenticated search returned HTTP 401; a foreign-origin preview POST returned HTTP 403. Scratch database tests cover real runtime-role access and concurrent authority changes using fictional providers. Parser/transport tests cover encoded headers, charset handling, multipart preference, inert HTML, attachment exclusion, bad encodings, size/depth bounds, query/path injection, streaming limits and provider failures. Final counts are in the local retrieval validation artifact.

Implementation references: [Google message retrieval](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/get), [Google message/MIME representation](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages), [libmime](https://github.com/nodemailer/libmime), [HTML-to-text](https://github.com/html-to-text/node-html-to-text).

## Completed approval follow-up

The [approval checkpoint](lead-capture-gmail-sample-approval.md) completed durable Gmail/pasted provenance, exact draft-version publication binding, shared-assistant review and usage tracking, and a real approval/save/reload journey. Continue from that document for the current state. Intake Review, worker readiness and staging remain pending.

## Final retrieval validation

Passed 3,549 unit tests across 236 files, 15 disposable database rehearsal groups, 135 story interaction/accessibility/layout cases at 1440/768/320 pixels, and final connected-story reruns (30 cases, then nine focused cases after the last search-availability assertion). Contracts, data and web typechecks and focused lint passed. Evidence: `.local/releases/capture-gmail-connections-20261103/sample-retrieval-validation.json`. That retrieval-only check preceded the now-completed approval, save and reload journey linked above.

The remaining sample-approval items above were completed by the later [approval checkpoint](lead-capture-gmail-sample-approval.md), including real extraction, approval, save and reload. Continue from that document; worker/Intake Review and staging remain pending.
