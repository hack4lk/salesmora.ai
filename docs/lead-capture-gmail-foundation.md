# Gmail foundation checkpoint

November 3, 2026. Checkpoint one of the [approved Gmail integration plan](lead-capture-gmail-integration-plan.md) is implemented for review. The user selected new incoming messages after launch and testing with an existing Gmail account. This checkpoint has no OAuth routes, live account connection, Gmail fetch, ingestion or hosted activation.

Subsequent update: checkpoint one was approved, and [checkpoint two](lead-capture-gmail-connections.md) implements the OAuth/account controls and applies both owned Gmail migrations to the main local database. The remaining statements here describe the earlier foundation review snapshot. No hosted activation or real-account test is implied.

## Delivered boundaries

- Strict browser contracts cover public account choices, connect/reconnect intent, version-bound account selection and reviewed disconnect. Browser account objects reject credential/provider-subject properties. Disconnect requires a server review identity; the actual review/confirmation service is next.
- A shared capability function derives access from current Lead Capture grants. Read uses `leadCapture.read`; connect/reconnect/select require `leadCapture.update` and paid eligibility; disconnect additionally requires `leadCapture.pause`. Cleanup remains available after a downgrade. Each future mutation must also authorize the actual source and current versions.
- An authorized account-list data service reloads current workspace authority and selects only ID, email, connection status and version. There is no HTTP endpoint or wizard connection yet. The selector contract is bounded to 100 accounts; checkpoint two must enforce that creation bound or add pagination before exposing it.
- Separate server-only custody contracts are accessible through `@salesmora/contracts/lead-capture/gmail-secrets`, deliberately excluded from the public barrel. The data custody module uses AES-256-GCM with random 12-byte nonces and authenticated purpose/environment/workspace/record/key-version context. Token and OAuth verifier payloads cannot be interchanged. Only read-only Gmail and identity scopes are accepted; sending/modification scopes are rejected.
- The keyring is explicit, environment-specific and versioned. There is no file-key fallback. Errors contain no ciphertext, token, key or provider response details. Rotation can read older keys and reseal under the active key; missing/wrong keys and modified ciphertext fail closed.
- Google provider setup and key management instructions are in [the setup guide](lead-capture-gmail-google-setup.md). The local callback path is reserved for the next checkpoint and is not live yet.

## Additive database foundation

`202611050002_capture_gmail_foundation.ts` introduces:

| Table | Purpose and enforced boundary |
| --- | --- |
| `captureGmailAccounts` | Workspace-scoped stable provider identity, safe account metadata, credential generation and record version. Provider identity cannot be changed; runtime roles cannot delete the identity/tombstone. Reconnect must retain this identity. |
| `captureGmailCredentials` | One encrypted envelope per account, foreign-key bound to that account's credential generation. No plaintext token columns. Web may erase grants; worker may read/refresh, but cannot create or delete credentials. |
| `captureGmailOAuthAttempts` | Hashed state/session binding, actor/source and expected versions, optional exact reconnect target, encrypted PKCE verifier, maximum ten-minute lifetime and resolution state. Web-only runtime access. Callback enforcement and cleanup are checkpoint two. |
| `captureGmailMailboxState` | Exact string history cursor, lease, version/generation, next sync, last success and bounded failure codes; no email bodies. |
| `captureGmailEligibilityWindows` | Exact Gmail source/account/configuration and launch history boundary; at most one open window per source; end cannot precede start. Runtime roles cannot delete windows. |
| `captureGmailMessageJobs` | Durable source/account/message identity, exact eligibility/configuration binding, processing lease/retry state and exact accepted receipt. An accepted job cannot claim another message's receipt. Runtime roles cannot delete dedupe records. |

All account/source/window/receipt references are tenant-bound composite foreign keys. Gmail references cannot target a website source. Credential and verifier envelopes have structural database checks; cryptographic authentication and payload validation belong to the custody service. A small additional receipt index supports exact job-to-receipt identity.

`applyRuntimeGrants` removes inherited broad grants before assigning explicit Gmail web/worker privileges, including when reapplied by later migrations. Staff cannot read any of these tables. Existing workspace export code uses named datasets/columns and does not discover or export these tables. Workspace deletion cascades the new records; the runtime role cannot selectively erase stable account/dedupe identity as a shortcut to reconnect. Empty down/up is tested; rollback refuses retained Gmail records.

These structures support future services. They do not themselves implement provider health, callback verification, polling correctness, cursor recovery, sample approval or atomic disconnect.

## Validation

- Full unit suite: 3,525 tests in 233 files passed, including 11 new Gmail cases. The final focused regression run covers Gmail contracts/custody/capabilities and runtime role checks.
- Contracts and data package typechecks passed.
- Eight disposable-database groups passed: migration replay/down/up, stable identity/generation/envelope constraints, authorized projections and downgrade cleanup, atomic attempt consumption primitive, actual web/worker/staff grants, exact eligibility, job/retry/receipt identity and rollback/purge behavior.
- Existing runtime-grant regression rehearsal: 54 checks passed.
- Focused lint passed; only the existing root React detection warning appeared. No UI changed, so this checkpoint adds no parallel preview or Storybook component.
- Evidence is saved under `.local/releases/capture-gmail-foundation-20261103/`. File hashes describe reviewed whole files in the moving workspace, not a deployment manifest.

The expected retained-data rollback refusal is logged by Knex as a migration error inside its successful negative test. It is not an unresolved migration failure. Scratch databases and schemas are removed by their harnesses.

Repeat the database rehearsal with Node 22 and the existing isolated local `TEST_DATABASE_URL`:

```sh
pnpm test:lead-capture-gmail:db
```

The harness validates the connection is a separate local `_test` database, allocates a new scratch database, replays migrations there and deletes it afterward. It never migrates/truncates the configured test database, main application database or staging.

## Review and continuation

The main local database and staging have not received this migration. No Google project, credentials or user grant was created, and no mailbox was accessed. Gmail delivery authorities remain disabled. Assistant publication/lifecycle work from the earlier checkpoint remains separate and is not certified complete here.

After checkpoint review, implement checkpoint two: validate Google configuration, add the real OAuth start/callback and refresh services, versioned selection and reviewed disconnect; connect the canonical account controls with mocked stories and authenticated tests. Save-before-OAuth must preserve unsaved work. Recheck session/actor/workspace/grants/source/draft/account generation at callback and commit, verify stable provider identity and granted scopes, coordinate refresh races and preserve a valid refresh token when Google omits a new one. Enforce the account count bound and implement attempt expiry/purge. Never store raw state/session tokens, authorization codes or mailbox content in this foundation's metadata tables.

For an existing account, real tests must use unique fictional markers and explicitly selected samples. “New messages only” concerns intake eligibility; it does not narrow Google's mailbox-wide read-only grant. Local connection testing comes before scoped staging, and sample testing must never create intake or a lead.
