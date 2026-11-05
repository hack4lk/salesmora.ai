# Staging runtime roles and embed checks — November 1, 2026

The approved next checkpoint is complete: staging web and worker now connect through their separate restricted PostgreSQL logins, with `DATABASE_ROLE_ENFORCED=true`. The owner connection is retained as web's `MIGRATION_DATABASE_URL`. Public submissions and general publication/delivery authority remain disabled.

## Cutover and recovery

Before provisioning, neither `salesmora_web` nor `salesmora_worker` existed on staging. Fresh independent passwords were generated privately. The existing deployed `db-roles.ts` provisioned only those two roles and applied its reviewed grants; no admin/audit login was provisioned. Credentials were transferred through stdin and kept out of command arguments and evidence. No `DB_*_PASSWORD` variable was added to either service. Runtime credentials are retained in Railway's private service configuration; temporary local credential state was erased after verification.

The web owner URL was separated from `DATABASE_URL`, then web and worker were switched and checked in order. After both passed, strict startup enforcement was enabled and both services redeployed. Redeployments used the preceding frozen lifecycle release, not the moving workspace; source manifest SHA-256 remains `44715c227cf13b86ee6bc1b756a1cd515694f4d974c9232da172d864baa9059b`.

| Service | Restricted connection deployment | Final enforced deployment |
| --- | --- | --- |
| Web | `c6186d5a-af68-4e8d-b05c-016b2c3aaa7f` | `9d09a9dd-c442-46ec-85c5-e3ba44b71016` |
| Worker | `e746aa50-70e3-4ecd-b18c-ce53e35cfa85` | `96b25e29-c980-4475-8373-6ffd9a611147` |

Both final deployments reported Railway `SUCCESS`. One worker redeploy request failed without creating a deployment; inspection confirmed that before a successful retry. A read-only status tool approval also timed out and passed on the permitted retry.

Recovery remains configuration-only: set web `DATABASE_URL` back to its retained migration owner connection, or worker to the existing PostgreSQL owner reference; set `DATABASE_ROLE_ENFORCED=false` and redeploy the approved release. The restricted roles/grants can remain. No rollback was needed.

## Fresh backup and restoration

The pre-cutover snapshot-consistent custom-format backup is retained privately at `.local/backups/capture-runtime-cutover-20261101/staging.dump` outside the database volume (directory mode 700, files mode 600). Its SHA-256 is `91d5efdf16d6c002dd6e37ad95b84e8bfc4df7c8b695493a2b1d575d44fe61ca`, size 844,169 bytes.

The off-volume copy was hash-checked, copied back as a distinct restore input, and fully restored into a separate scratch database. All **168 table counts and 112 migration names matched** the exported snapshot. Public scratch access was revoked; the scratch database was dropped afterward. The same-volume backup remains at `/var/lib/postgresql/data/release-backups/capture-runtime-cutover-20261101/`.

## Live role and application verification

- Both actual runtime connections report the expected login, `superuser=false`, `databaseOwner=false` and `canCreateInPublic=false`. Both running service environments confirm strict enforcement is enabled.
- Runtime access to application/auth/capture tables passed. An isolated auth rate-limit row was inserted/read inside a transaction and rolled back; its absence afterward was confirmed for each login. No authentication account or session was fabricated.
- Privilege checks deny migration history, admin schema usage, capture-receipt truncation and direct user-email updates. Real SELECT attempts on migration history and staff identities returned permission denial. Worker-only notice UPDATE access is present; web lacks it.
- Web migrations completed through the owner connection; neither final startup log contained an owner-role warning. Application health/login rendered, anonymous source/lifecycle requests returned 401 and a foreign-origin lifecycle request returned 403.
- Worker readiness passed with retention scheduled, one worker and zero failed jobs. Its task mode remains retention; notification delivery tables returned no rows.
- The exact live ledger still matches all 112 approved migrations. Hashes/counts for the nine retained synthetic receipts, their processing, pending intake, captured lead data and approved configurations match the preceding deployment snapshot. Both existing sources remain archived at their existing versions.
- All ten application/public smoke assertions and all four gateway smoke groups passed. Submission transport returned 503 with `state: retry`; no submission was accepted. PostgreSQL, Redis and gateway deployment IDs are unchanged; production remains empty. The maintained Railway plan reports configuration already up to date.
- Temporary Railway SSH access was revoked; the account key list showed no registered keys. The isolated agent, private key files and temporary credential state were removed.

This checks actual database access and auth-store readiness, not a successful interactive login with a real customer's credentials. Workspace creation and assistant/provider requests were not performed against hosted customer data by this checkpoint.

## Live embed verification and limits

An isolated Chromium context loaded the real forms gateway from a temporary localhost customer-site fixture, with third-party cookie restrictions explicitly enabled through CDP. The fixture server and browser were closed afterward.

One direct iframe and two JavaScript-loader embeds rendered the archived test form's unavailable state. Loader height handshakes passed; wrong origin/window/channel, malformed heights and extra resize fields did not alter the checked height. Native child messages contained only protocol/type/channel/height metadata. At 1440, 768 and 320 pixels, neither the host nor embedded documents overflowed horizontally. Keyboard navigation traversed the embeds and reached the following host control. The mobile screenshot was visually inspected.

No forms request carried Cookie or Authorization, and no forms response set a session cookie. A fictional host-only application cookie remained on an application-origin request; this establishes cookie isolation, not continuing real-user authentication. The first malformed-message run incorrectly included its own injected message in the native-message assertion; the harness was corrected to inspect native metadata before injection and the complete check passed.

Safe JSON evidence, the read-only browser script and screenshot are in `.local/releases/capture-runtime-cutover-20261101/`.

These checks covered **unavailable archived forms**, without republishing them or changing their evidence. The subsequent approved [active browser checkpoint](lead-capture-active-embed-20261101.md) verified a new bounded staging canary, including cookie-blocked direct/loader submissions, then archived it and disabled transport again. Delivery authority, scheduler activation and general publication remain separate review checkpoints.
