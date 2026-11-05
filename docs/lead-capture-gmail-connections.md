# Gmail account connection checkpoint

November 3, 2026. Checkpoint two of the [Gmail integration plan](lead-capture-gmail-integration-plan.md). The customer flow is implemented: **Connect Gmail account → Google account picker/consent → return to the same saved Gmail draft with the verified account selected**. Existing-account selection, reconnect, reviewed disconnect and private refresh services are connected to shared application boundaries. Real-account acceptance is pending Salesmora's Google client configuration; no mailbox has been accessed during this checkpoint.

## Customer flow

- The canonical `GmailCaptureScope` and `GmailSetupPage` are reused in the live wizard. Their connected stories render the actual `CaptureWizardRoute` with mocked API responses.
- When edits are unsaved, an explicit save-before-consent dialog saves them before redirecting. The server binds OAuth to those resulting source/draft versions. The wizard releases its navigation guard only for the validated Google authorization URL.
- Google cancellation/failure returns the user to the saved draft with safe status text. No callback parameter, authorization code or provider error description is rendered or logged. Next request logging ignores the callback; private/no-referrer response headers cover Gmail endpoints.
- Successful authorization verifies the signed Google ID token, expected audience/nonce, access-token audience and read-only scopes, stable Google subject, verified email and Gmail profile. The app reads profile metadata for connection verification; no message list/body is retrieved. Pasted sample setup and publication readiness remain separate.
- Account changes use a dedicated versioned server operation. Browser JSON cannot establish an email identity or connection merely by writing draft fields. Different-account selection clears dependent sample/mapping approval. The selected account survives reload.
- Reconnect must return the same stable Google subject and expected account version. An unchanged account retains its reviewed draft version, while source authority advances. A valid existing refresh token survives a later authorization that omits a new one; disconnected or permanently failed grants cannot be resurrected by reusing an invalid old refresh token.
- Disconnect uses a private, expiring, author-bound server review listing affected sources. Confirmation checks the current account, source/draft and pending-launch snapshot. It erases usable credentials, increments the credential generation, invalidates relevant OAuth attempts, stops that account's intake, cancels affected schedules, closes its windows and retires queued work. A live source using another account continues while its disconnected-account draft remains unready.
- Disconnect does not silently revoke every Google grant for the OAuth client. The confirmation explicitly explains local removal and the separate Google Account revocation action. It preserves historical evidence and never automatically resumes intake after reconnect.

## Server boundaries

- The official `google-auth-library` 11.3.3 supplies OAuth, ID-token verification and token lifecycle. PKCE, nonce and short-lived state bind the current authenticated session. The state token and PKCE verifier are encrypted; database lookup uses hashed state/session/configuration identity. Account/source authority and session expiry/revocation are rechecked before exchange and final commit. The final session row is share-locked through commit.
- OAuth attempts are consumed atomically before the provider exchange. Callback retries cannot exchange twice. Exact start retries return the same encrypted attempt while still pending. Expired attempts are purged when a new authorized attempt starts. Pending attempts are bounded per actor/workspace; connected account identities are bounded to 100 per workspace.
- Provider requests have a ten-second per-request deadline, redirects disabled and SDK retries explicitly disabled by a request interceptor. Google endpoints are fixed; provider responses and secrets are never used as arbitrary destinations.
- Refresh claims a durable generation-bound lease before contacting Google, with no provider call under a database lock. Its final compare-and-set prevents late refresh results overwriting a disconnect/reconnect. Transient provider failures preserve the connection; permanent authorization loss commits reconnect-required and source holds before returning an error. Future sample/ingestion services must use this internal refresh boundary; this checkpoint adds no Gmail worker task.
- Every public operation reloads current workspace membership, permissions and entitlement. Read uses source-read; connection/selection uses source-edit and an eligible plan. Disconnect additionally requires pause access and remains possible on downgrade. Same-origin POST checks apply, while Google's GET callback uses the one-use session-bound state flow.
- All Gmail connections are defaults-off and explicitly workspace scoped through `CAPTURE_GMAIL_CONNECTIONS_ENABLED`, `CAPTURE_GMAIL_ENVIRONMENT` and `CAPTURE_GMAIL_WORKSPACE_IDS`. This enables connection controls only. Web/worker `gmailReady` remain false; no source can launch actual Gmail delivery from this work.

## APIs and migration

| Route | Behavior |
| --- | --- |
| `GET /api/lead-capture/gmail/accounts?workspace=…` | Current authorized safe account projections and availability/capabilities; disabled configuration does not query unmigrated Gmail tables. |
| `POST /api/lead-capture/gmail/connect` | Versioned connect/reconnect intent; returns the validated Google consent URL. |
| `GET /api/lead-capture/gmail/oauth/callback` | Verified callback and fixed same-origin return to the draft; no browser-supplied return URL. |
| `POST /api/lead-capture/gmail/select` | Versioned selection with actor-bound retry receipt. |
| `GET /api/lead-capture/gmail/disconnect` | Private affected-source review, reused while the same snapshot remains valid. |
| `POST /api/lead-capture/gmail/disconnect` | Explicit reviewed disconnect; changed versions or substituted retries conflict. |

`202611050003_capture_gmail_connections.ts` adds OAuth input fingerprints, refresh leases, private disconnect reviews and append-only connection events, plus the `gmail.select` operation receipt namespace. Runtime grants exclude staff from these records and workers from OAuth attempts/disconnect reviews. New credentials remain separate from login credentials. Migration rollback refuses retained connection evidence or selection receipts.

Both owned migrations (`202611050002_capture_gmail_foundation.ts` and `202611050003_capture_gmail_connections.ts`) were applied by name to the main local development database after disposable rehearsals passed. Other pending migrations were not requested. A new local encryption keyring was generated in ignored `.env.local` without printing it or overwriting existing settings. Google client credentials, connection enablement and ingestion settings were left unchanged. No staging deployment/configuration or grant was changed.

## Validation and limits

- Full unit suite: 3,530 cases in 234 files passed. Provider tests verify the actual generated consent URL and reject wrong nonce/audience/identity/scope; private token errors contain no provider payloads. A final focused regression run covers provider/custody/contracts and existing capture HTTP adapters.
- Contracts/data/web typechecks and focused lint are recorded with the release evidence.
- Foundation rehearsal: eight disposable-database groups covering full replay, empty down/up through both Gmail migrations, tenant/type/receipt constraints, actual runtime grants, retained-data rollback refusal and workspace purge.
- Connection rehearsal: ten disposable-database groups covering start/replay, concurrent callback consumption, session/grant denial, wrong-account reconnect, omitted refresh token, mid-exchange logout/stale drafts/expiry, versioned selection, successful and cached worker refresh, transient/permanent refresh failure, reviewed downgrade cleanup, active-source/revision isolation, pending schedule cancellation and late-refresh/disconnect races.
- Authenticated browser journey passed against a disposable runtime-role app: real button/save-before-consent/Google URL generation, intercepted external navigation, actual callback cancellation, retained draft, real account-selection/disconnect endpoints, reload persistence, Origin and forged-identity denial. Successful account grants in this browser test are clearly fictional seeded fixtures; real Google consent was not completed.
- 78 story cases passed across 1440/768/320 widths, checking interactions, accessibility and horizontal overflow. These exercise the canonical account controls and actual connected wizard, including read-only, error/retry, missing account, reconnect, selection, disconnect and save-before-consent states.
- Evidence and screenshots: `.local/releases/capture-gmail-connections-20261103/`. Whole-file hashes describe the current reviewed workspace, not an upload/deployment manifest.

Repeat the isolated DB/browser checks with Node 22:

```sh
pnpm test:lead-capture-gmail:db
pnpm test:lead-capture-gmail-connections:db
pnpm test:lead-capture-gmail:e2e
```

The browser harness supplies fictional Google client settings and intercepts external navigation. It does not use real Google credentials or expose a test-provider bypass in production routes.

## Real-user test next

Salesmora's operator must register/configure one Google OAuth application using [the setup guide](lead-capture-gmail-google-setup.md). This is not work each customer performs. The local encryption key and database are already prepared; real Google client ID/secret and the test workspace scope remain to be configured. Restart the app after configuration, then the user can click the actual button and grant their existing Gmail account access through Google.

Record real success, cancellation, wrong-account reconnect, reload persistence and Google revocation/reconnect separately from the fictional tests. Do not claim local/staging live acceptance before those actions succeed. Provider-backed sample retrieval, publication readiness, message ingestion, Intake Review completion and the scoped staging pilot remain the later checkpoints in the approved plan.

## Real local connection acceptance — November 4, 2026

The operator setup in `salesmora-gmail-development` is complete. The existing local Gmail draft in DRIZL LLP used the actual Connect Gmail button, reached Google, and returned after the user completed consent with `lkarpuk@karpukcreative.com` selected and Connected. The web server runs under Node 22; the pilot is scoped to this workspace in ignored local configuration. No credential values are included in this document.

A read-only database check verified the draft/account binding, connected status, matching credential generation, successful encrypted-grant decryption, refresh-token presence and Gmail read-only scope. The source is still a draft with no approved version, message jobs, samples, capture receipts or open eligibility windows. Sanitized local evidence is in `.local/releases/capture-gmail-connections-20261103/live-local-connection.json` and `google-local-connected.png`. The earlier fictional test results remain separate; real cancellation/revocation/reconnect and staging have not been accepted by this success check. Provider-backed sample selection is the next implementation checkpoint.
