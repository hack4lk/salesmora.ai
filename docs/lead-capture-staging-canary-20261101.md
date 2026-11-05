# Staging canary — November 1, 2026

Status: **real challenge, first-network and cellular-network canary checks passed; canary archived**. Temporary submission transport shutdown is verified. This is a bounded fictional canary, not general publication activation.

## Scope and configuration

The user approved the controlled live canary and explicitly approved completing its real Cloudflare challenge after confirming no emails would be sent. A synthetic workspace and synthetic owner were created without authentication accounts or sessions. Existing authorization, draft, review and publication functions created the form. Its one-shot delivery authority checked exactly that synthetic workspace, the verified staging origin and a 60-second operator-publication deadline; no application/self-service delivery authority was enabled. No test provider, test IP adapter or production-code bypass was deployed.

Preflight confirmed zero existing public publications and zero active/scheduled sources. The complete real submission policy validated with the configured staging Turnstile keys. `CAPTURE_SUBMISSIONS_ENABLED=true` was then staged and the same frozen web source redeployed as `465fc2cf-d881-47df-bcef-6cdd662f7d7e` (SUCCESS). Worker and gateway source were unchanged. This transport setting remains true while the sole active fictional canary awaits the phone test. Self-service publication remains hard-disabled.

The form clearly requests fictional information only. It uses consent ID `staging-test`, version 1, stage `new`, tag `Staging canary`, and explicit assignment to the synthetic owner. `notifyAssigned=false`. No visitor acknowledgment-email feature is invoked. The synthetic subscription uses the free plan and no provider billing operation was made. Durable evidence is retained; no receipt, audit, accepted lead or processing snapshot was deleted.

## Passed live checks

- Five ordinary public submissions were durably accepted. The first exact retry returned the same request acknowledgment without a second receipt; changed answers with that request ID returned conflict.
- All five resulting receipts and leads were queried within the canary workspace. Consent wording/version/acceptance, assignment processing and tags matched the approved configuration; lead stage and owner were correct. Notification intents were zero.
- The first five attempts passed without a challenge; the sixth required one. The real Siteverify endpoint rejected an intentionally invalid challenge token.
- A real browser request then completed the real managed Turnstile challenge. The browser displayed **Request received**, and the database contained exactly one corresponding browser receipt and one verified challenge check. Server validation binds hostname, action, context and token age; no challenge token or provider secret was logged.
- Distinct forged X-Real-IP/X-Forwarded-For headers and a forged ingress key did not change the client identity bucket through the actual Railway HTTPS edge. Terminal and browser attempts shared one bucket.
- The twentieth attempt remained challenge-gated; the twenty-first was rate-limited. An exact retry of an already accepted receipt still returned accepted after the attempt cap.
- A correctly signed context issued 31 minutes in the past was rejected as stale by the live endpoint. This was an operator-generated intentionally expired context, not a claim that a real Turnstile token was held until expiry.
- A localhost-only external-site fixture loaded the real direct iframe and two real JavaScript-loader embeds, each rendering its own form. This confirms cross-origin rendering and multiple embeds; it does not establish a separate third-party-cookie-blocking configuration or a resize-forgery test. The fixture server was stopped and its tab closed afterward.

Last observed state: **6 accepted receipts/leads**, **1 verified challenge check**, **20 attempts in one client bucket**, **0 notification intents**, **0 Phone canary receipts**. No cellular or second-network success is claimed.

## Pending work and state retained

The user agreed to submit one fictional `Phone canary` request with Wi-Fi off. Keep the canary available for that check. Its private operator metadata and safe evidence are retained under `.local/releases/capture-canary-20261101/`, with a mode-600 `state.json` containing the synthetic workspace/source/publication identities and URL. Additional temporary diagnostic scripts and request payloads are under `/private/tmp/salesmora-capture-canary-20261101/`; these are not deployed application routes.

After the phone submission, verify a durable receipt and a client bucket distinct from the first network. Then complete remaining rollout checks, archive/pause the canary through an audited lifecycle transition, and disable the temporary transport setting unless further bounded testing is approved. Retain all accepted receipt evidence. Stable-URL revision, stale-consent, lifecycle/access-loss and broader cookie/mobile/resize checks remain in the rollout checklist; successful basic canary acceptance does not complete those checks or authorize broad activation.

Temporary SSH access was revoked after the checks, Railway reported no registered keys, and the isolated SSH agent/key files were removed. The public canary tab was retained for follow-up.

## Cellular verification and canary closure — November 1, 2026

After the user reported **Request received**, the expected test email identified exactly one phone receipt. The receipt's attempt used a different hashed client bucket from the accepted browser challenge on the first network. There were two distinct client buckets, seven total retained receipts, and zero notification intents. The phone receipt was automatically admitted to a lead; its consent, assignee, stage and processing tags matched the canary configuration. No raw IP address, hash value or submitted personal field was logged in the completion report.

The operator then archived only the synthetic canary using a workspace-authorized, version-checked transaction, the lifecycle command/result contracts, a `source.archive` operation and a `source.archived` event. Source version is now 3. This was an audited operator transition, not a claim that a customer-facing lifecycle endpoint was exercised. No receipt, processing record, lead or immutable history was deleted.

Public checks immediately confirmed that the archived form is unavailable and omits the definition, new writes return unavailable, and an already accepted exact retry remains acknowledged while transport is still enabled. The temporary `CAPTURE_SUBMISSIONS_ENABLED` setting was then set to false and the same frozen web release redeployed for shutdown. After shutdown, endpoint retry responses are expected; continued acknowledgment during a disabled transport is not claimed.

Safe completion evidence is retained at `.local/releases/capture-canary-20261101/completion-result.json`. Temporary SSH access was revoked again after database verification; local key/agent files were removed. Broader publication activation remains disabled and the other rollout checks listed above remain separate work.

Shutdown web deployment `2732e3ee-8c79-49e8-96ad-99eed295749e` reached **SUCCESS**. Railway configuration reports `CAPTURE_SUBMISSIONS_ENABLED=false`; the live submission endpoint returns `503 {"state":"retry"}` before processing input, the archived public view remains unavailable, and existing application HTTPS health passes.
