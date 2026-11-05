# Admin audit log

The **Audit log** link in the separate admin home opens `/audit`. The log is not
a customer route and does not accept customer sessions. Cloudflare Access and a
valid admin password-plus-factor session remain required.

## Access and recorded evidence

Only a current, active Super Admin with the relevant `admin.audit.read` or
`admin.audit.verify` permission can read or verify the log. The page and API check
the current database session, disabled state, role and Access email. Session
expiry and idle/absolute limits are checked again before returning results.

Authenticated staff without permission receive no audit data. Their denied
read/verification is appended as `audit.viewer.access_denied` and committed before
the service returns a denial. If that append fails, the request fails rather than
returning a misleading successful audit outcome.

The viewer reads stored audit events, not customer domain tables. It shows the
event's recorded actor role, current display name (or retained staff ID if the
account no longer exists), target/workspace/request IDs, reason, before/after
JSON, full recorded IP address and user agent, sequence and stored hashes.
Missing fields are explicitly shown as not recorded. Display names are not
historical identity snapshots; the hashed event retains its actor ID and role.

Denied-access events record the browser user agent, bounded to 2,048 characters.
IP addresses are not inferred from untrusted forwarded headers. Existing events'
IP/user-agent values are shown as recorded; this viewer does not backfill missing
request metadata or imply that caller-supplied user agents are authenticated.

## Filtering, paging and deep links

- The default is **Last 7 days**; Today uses midnight UTC. Other ranges are 30 or
  365 days. All displayed times are UTC.
- Search is a literal, case-insensitive substring match over event ID, action,
  staff ID/current display name, target type/ID, workspace ID, request ID and
  reason. `%`, `_` and backslash are treated literally, not as SQL wildcards.
- Staff/system and action-category filters combine with the search and dates.
  Categories derive from action prefixes. Unclassified actions appear under
  **Other actions**; they are never silently excluded from All actions.
- The server returns five events per page, ordered by occurrence time descending
  and then sequence descending. Page size is not caller configurable.
- A read captures an `asOf` time and high-water sequence. Further filtering and
  paging use those anchors so later/backdated appends do not move events between
  pages. **Refresh audit data** captures new anchors.
- `/audit#q=<URL-encoded ID>` initializes the search; fragment navigation updates
  it. Staff account cards link to their audit history. The details drawer's
  **Only events for this target** updates the same fragment and search.
- The default date range still applies to deep links. If an older ID has no
  matches, expand the range. Invalid/oversized fragment queries show an error.
- Read failures hide the prior table/details rather than displaying stale
  results as current. **Retry audit request** requests fresh data. Debounced
  filters cancel superseded reads; out-of-order responses cannot replace newer
  results or undo a denied verification.

All API responses use `Cache-Control: no-store`. The API is
`GET /api/admin/audit` with strict `query`, `actor`, `category`, `range`, `page`,
`asOf` and `throughSequence` parameters. Duplicate/unknown parameters, invalid
ranges, future snapshots and excessive query/page values are rejected.

## Verify the database chain

**Verify database chain** calls `POST /api/admin/audit` with no body and the exact
configured admin Origin. It does not accept a date range or caller-selected
verification scope. A filter showing zero events does not restrict verification.

The shared verifier captures the current sequence head and recomputes hashes
from the first event through that head, checking each previous-hash link.
Sequence gaps caused by rolled-back transactions are valid. Reads use batches
of 500 events instead of loading the entire ledger into memory. The API has a
30-second verification budget checked between batches and a 30-second SQL
statement timeout; lock waits are limited to five seconds. A timeout or database
failure is an error, never an intact result.

The result reports the checked count, captured sequence and check time. An
intact result applies only through that sequence; later events need another
verification. A broken result identifies the first mismatched sequence.

**This is database-chain verification, not proof of external immutability.**
Without an external checkpoint it cannot detect a privileged actor deleting the
tail or recomputing the full chain. Stored hashes displayed in event details are
not independent proof of verification. On a mismatch, stop sensitive
administration and contact the incident owner; do not assume emails or dashboard
incident alerts have been sent.

## Scope and outstanding work

This slice needs the existing identity, append-only audit and lifecycle tables;
it adds no migration and does not apply schema changes to any database.

The viewer displays events already written by existing producers. Fictional
Storybook system events do not mean every refused sign-in, view-as page view,
R2 export or retention event has a live producer yet.

The following are **not implemented in this slice**:

- Nightly R2 delivery, immutable checkpoints, retention/purge enforcement.
- Automated incident emails, dashboard alerts and the incident runbook.
- Production hosting, Cloudflare policy/tunnel configuration or deployment.

## Local archive format

The approved first implementation step supplies local format generation and
verification. The preparation-only worker/status, locally tested R2 adapters
and fictional publication/verifier runners are described below. There is still
no production delivery executable, scheduler or live health API.

[Archive contracts](../packages/contracts/src/admin/audit-archive.ts) define
strict v1 raw records, checkpoint anchors and manifests.
[Archive primitives](../packages/data/src/admin-audit-archive.ts), exported as
`@salesmora/data/admin-audit-archive`, provide:

- `buildAdminAuditArchive(records, scope, limits)`: accept an ordered iterable or
  async iterable and return complete NDJSON/checkpoint buffers with the
  checkpoint's SHA-256. Explicit positive `maxEvents`/`maxBytes` limits are
  mandatory. Exact limits are allowed; exceeding either fails without truncation
  or a partial result. Source read errors propagate. Output is buffered, not
  streamed to storage; total process memory also includes source records,
  serialization and verification allocations. Production sizing/deadlines are
  a later worker decision, not a claim that memory equals the output byte limit.
- `verifyAdminAuditArchive(ndjson, checkpoint, expectedScope, limits)`: require
  independent expected ledger/sequence/previous-checkpoint evidence; validate
  strict schemas, exact UTF-8 bytes/counts/digests, canonical encoding and every
  event hash/link. Return verified checkpoint metadata and its exact-byte
  SHA-256, or throw an explicit error. Checkpoint input is limited to 16 KiB.

Provision one stable UUID ledger ID per environment when the worker is
introduced. The expected scope must not be copied from an untrusted manifest.
The first segment starts at the ledger genesis (`previousCheckpoint: null`).
Later segments bind the exact preceding checkpoint digest, end sequence and head
hash. The first record must link to that prior head; the final record must reach
the caller's captured sequence bound. Bigint sequence strings retain precision,
and gaps caused by rolled-back transactions are valid. No occurrence-time filter
is used: late/backdated events belong to the next sequence segment. Empty
segments are rejected; a future scheduler must explicitly handle no new events
without claiming a newly completed copy.

NDJSON retains all stored hash-covered fields and the stored hash. It uses the
existing audit canonicalizer, ISO timestamps, decimal sequence strings and one
final LF per record. It is not formula-safe CSV or a new hash algorithm.
Checkpoint bytes contain version/format, ledger ID, prior checkpoint anchor,
first/end sequence, count, NDJSON byte length/SHA-256 and final event hash.
No wall-clock time or random value is added to the files, so identical input and
scope yield identical bytes for a retry. Copy/check times belong in later job
evidence, not in this content format.

**Local consistency is not external immutability.** A self-consistent rewritten
segment/checkpoint is not proof of authenticity without independently retained
evidence. The verifier does not fetch R2, compare the live database, authenticate
who supplied the scope, inspect locks, establish publication/recovery semantics
or detect changes after its inputs were captured. Do not turn this result alone
into a live "checked" health status.

### Approved archive isolation

The user selected a separate audit-only worker and dedicated R2 bucket. Neither
web app, the browser, nor the existing customer worker should receive the audit
bucket credentials or new archive database privileges. Narrow database access
and durable local status are implemented below; separate verification authority
is locally rehearsed below; production isolation remains upcoming. No production
roles or credentials have been provisioned. The preparation-only
role/schema have been exercised in the isolated local test database.

[R2 token presets](https://developers.cloudflare.com/r2/api/tokens/) provide
bucket-scoped object read/write, not a write-only preset. The approved design
uses separate archive credentials rather than pretending that preset is
write-only. Reading object evidence and lock configuration requires the
appropriate separate read authority; exact permissions and deployment
isolation must be confirmed before live wiring.
[R2 bucket locks](https://developers.cloudflare.com/r2/buckets/bucket-locks/)
prevent overwrite/deletion under active rules, but authorized configuration
holders can change/remove those rules. The intended one-year lock is not
irrevocable compliance-mode retention. No real bucket or lock is configured by
this step; purge/anchors, automated incident handling and deployment remain
separate approvals.

## Isolated preparation worker

[The audit worker](../apps/audit-worker/) is a separate one-shot process, not a
task in the customer worker. It neither loads `.env.local` nor falls back to
`DATABASE_URL`, admin-app credentials, customer Redis or object storage.
`pnpm audit-worker:prepare` explicitly invokes the worker’s `prepare:archive` script. It is deliberately not a package `prepare` lifecycle hook, so dependency installation and Docker builds never start audit preparation. The command requires explicitly supplied:

- `ADMIN_AUDIT_DATABASE_URL`: a `salesmora_audit_worker` login URL targeting a
  localhost/127.0.0.1 database ending in `_test`. Connection overrides such as
  `user`/`options` are refused. This slice also refuses `NODE_ENV=production`.
- `ADMIN_AUDIT_LEDGER_ID`: one stable UUID for that database. UUID case is
  normalized; do not generate a new ID per invocation. A conflicting ledger ID
  is an explicit error, not a new independent chain.

No long-running service is started. There is no default-dev startup wiring,
nightly scheduler, upload or published-checkpoint advancement. Provision
credentials only through a secret manager/approved environment configuration,
never through chat or command logs. The command does not print object contents,
passwords, URL values or raw database exceptions.

[The preparation migration](../packages/data/src/migrations/202610300009_admin_audit_preparation.ts)
adds `admin.auditArchiveJobs` and `admin.auditArchiveAttempts`. It must be
reviewed/applied by the owner separately before running the CLI; the CLI cannot
migrate or provision itself. Normal role provisioning accepts the optional
`DB_AUDIT_WORKER_PASSWORD` (at least 24 characters); do not run provisioning
against another environment without approval. The role has no runtime-group
membership and can only read the audit ledger and read/insert/update preparation
metadata. It cannot append/change/delete audit events, read customer or staff
identity tables, delete jobs or create schema objects. The admin app may only
read preparation metadata; customer web/worker roles have no access. Startup
fails closed on a privileged/wrong role or drift granting extra table access.
Preparation metadata is operational state, **not an append-only or independently
immutable audit ledger**.

### State and retry semantics

- An exclusive session advisory lock serializes preparation across the database.
  A competing run fails `busy` without creating another attempt.
- Initial capture commits `pending` with a fixed genesis-to-head scope. An empty
  database instead records `no_events` with no scope/attempt or fake checkpoint;
  a future explicit invocation may capture its first real scope.
- Each run commits `preparing` and a numbered attempt before reading evidence.
  Reads use 500-record keyset batches; statement/lock waits are bounded to
  30/5 seconds. Preparation has a 60-second deadline checked between reads,
  records, format verification and final status commit. It is not a hard
  process-kill timer: a running query/serialization can finish before the next
  deadline check. Metadata setup and failure recording have their own SQL
  bounds outside that preparation budget.
- Exactly 50,000 records and exactly 32 MiB of NDJSON are allowed. Exceeding
  either fails visibly without truncation or a usable checkpoint. This phase
  does not split a larger backlog or silently advance scope; resolving an
  over-limit captured backlog needs a reviewed segmentation/policy change.
- Only a fully built, locally verified segment commits `prepared` with the
  checkpoint/digest in both current status and its successful attempt.
  Successful attempt evidence is retained across later failures and used as a
  comparison baseline when rebuilding that scope. This baseline is still in the
  database, not independent external evidence.
- Failed preparation or final-success recording rolls back any success-shaped
  status and records `failed` with a bounded failure code. If the database cannot
  record failure, the invocation still exits unsuccessfully; `preparing` may
  remain until recovery. The next lock holder marks abandoned preparing attempts
  `interrupted` before starting a new numbered attempt. There is no automatic
  retry loop.
- Retries use the original captured scope, including after failure or new
  backdated appends. New events are not claimed covered. There is no `copied`,
  locked, archived or externally verified state in this slice.

The CLI returns only identifiers, local status and the checkpoint digest. Raw
NDJSON/checkpoint buffers are prepared in memory then discarded on process exit;
they are not saved to local files or object storage. The separate publication
lifecycle below rebuilds/rechecks captured scope before delivery and defines
partial-upload recovery; it does not change the preparation command.

### Local database rehearsal

`pnpm test:admin-audit-preparation:db` refuses non-local/non-`_test` databases.
It replays only the preparation migration up/down in a rolled-back transaction,
then applies that named migration to the isolated test database. It refuses to
overwrite existing preparation jobs. Synthetic empty/tampered/rewritten/
50,000/50,001/32-MiB fixtures run inside rolled-back owner transactions; normal
fictional rehearsal audit appends remain. Real committed job transitions,
concurrency, injected final-commit failure and crash recovery are also checked.
Test jobs, attempts, failure triggers and any newly created test-only role are
cleaned afterward. A newly created temporary role also exercises the actual CLI
with a random ephemeral login credential; no credential is printed or saved.
The test migration remains applied; other migrations/databases are not changed.
Final read-only cleanup verification confirms zero preparation jobs/attempts,
no rehearsal trigger and no remaining ephemeral audit-worker role. Existing
runtime-grant regression rehearsal also passes all 24 checks.

## R2 delivery adapters (local validation only)

Slice 3a adds [dedicated R2 adapters](../packages/data/src/admin-audit-r2.ts)
and [delivery/verification primitives](../packages/data/src/admin-audit-delivery.ts).
They are **not wired into the preparation CLI, a scheduler or the live admin
panel**. The locally rehearsed publication lifecycle below composes them through
injected fictional capabilities. They have been tested only
against fictional in-memory storage and injected SDK/HTTP transports. No real
bucket requests, credentials, lock changes or infrastructure changes were made.
The existing customer-chat retention worker is unchanged; no audit deletion or
retention task is added.

### Credential and storage boundaries

- `createAuditR2Writer(target, credentials)` creates only a conditional-create
  capability; it needs no object-reader or configuration token.
- `createAuditR2Verifier(target, readerCredentials, lockReadToken)` creates only
  object-read and configuration-GET capabilities; it never receives writer
  credentials. Neither adapter exposes delete, overwrite, list, presigning,
  bucket creation, or lock configuration mutation.
- `createAuditR2Storage(...)` composes those capabilities for local orchestration
  and requires distinct writer/reader key IDs and secrets. It does not establish
  two isolated deployed processes. Separate local verifier runtime/permissions
  and durable publication are described in slice 3b below; production process
  isolation remains outstanding.
- Targets explicitly specify account ID, dedicated bucket and jurisdiction
  (`default`, `eu` or `us`). Endpoints are constructed from those values; there
  is no generic customer-storage/environment fallback or arbitrary endpoint.
  Delivery refuses account/bucket/jurisdiction disagreement between capabilities.
  FedRAMP endpoints are not implemented.

Provisioning must use a dedicated bucket-scoped Object Read & Write writer
identity, a separate Object Read only reader identity, and separate configuration
read authority. Standard object tokens do not work with the Cloudflare REST
configuration API; the documented Admin Read only tier can view bucket
configuration but has broader account/bucket visibility. Its precise approved
deployment/resource scope must be confirmed before provisioning. The adapter
cannot introspect actual token permissions or prove process isolation: issuing
GET requests does not make a privileged token intrinsically read-only. Keep
these secrets out of either web app and the customer worker. No production
permission grants or runtime configuration are authorized by this slice.

### Delivery and recovery

`deliverAdminAuditArchive(archive, expectedScope, limits, writer, reader, locks,
signal)` first validates the local format/digest and owns fixed buffer/scope/
limit snapshots across asynchronous requests. Limits may be lower than, but
cannot exceed, the approved 50,000 events/32 MiB. Object keys are deterministic:

- `admin-audit/v1/<ledger UUID>/segments/<NDJSON SHA-256>.ndjson`
- `admin-audit/v1/<ledger UUID>/checkpoints/<checkpoint SHA-256>.json`

For each key, delivery reads any existing object and fetches lock rules before
writing. A missing object requires qualifying prospective protection. An existing
object requires byte-for-byte equality and qualifying current protection based
on its independently read upload time. It is never overwritten.

The writer sends one `PutObject` with `If-None-Match: *`; SDK retries are disabled.
`409 ObjectLockedByBucketPolicy` and `412 PreconditionFailed` mean an existing
object must be independently read and compared, not that delivery succeeded.
Conditional-request conflicts, server failures and transport timeouts are
uncertain. A successful or uncertain create must be confirmed by exact-byte
read-back and another lock check. Missing/mismatched evidence fails; there is no
automatic overwrite or second write attempt in that invocation. Permission
failures remain errors, not uncertain-success results.

The segment is uploaded/read-checked first; only then is the checkpoint written.
A failed checkpoint write may leave an orphaned segment. An explicit retry can
reuse that matching, protected segment and create only the missing checkpoint.
No orphan is deleted. A final independent fetch verifies both objects and lock
evidence again before returning. If protection disappears after an upload, the
invocation fails even if one or both objects were created. Publication-last is
an ordering rule, **not a cross-object or database/R2 atomic transaction**.
Slice 3b below adds local durable attempt status, acceptance-gated scope
advancement, crash recovery and private baseline retention. Production rollout
and truly isolated external-storage identity remain outstanding.

### Independent snapshot verification and lock scope

`verifyStoredAdminAuditArchive(reader, locks, expectedScope,
expectedCheckpointSHA256, limits, signal)` can run using read-only capabilities.
The expected digest/scope must come from independently retained trusted evidence,
not the downloaded manifest. It compares checkpoint bytes to that digest before
parsing, fetches the content-addressed segment, and runs the approved full
format/count/byte/event-hash/link verifier. It does not trust an ETag or recorded
metadata checksum. Missing objects and failures are explicit errors.

Lock inspection uses only Cloudflare's configuration `GET`, with the matching
jurisdiction header, no redirects and no caching request. It requests identity
encoding; unexpectedly compressed configuration is refused rather than applying
compressed Content-Length to decoded JSON. Response parsing requires a
successful, error-free envelope and valid, bounded rules. Omitted optional
rules mean an explicitly empty configuration, never protection.

Protection evidence is computed separately for each object from the fetched
rules and read-back upload timestamp:

- Age rules must cover at least **365 days from upload** and remain unexpired at
  observation time. Retrying an older object does not require another full year
  from the retry time.
- Date rules must extend at least 365 days from upload and beyond observation.
- Indefinite rules qualify, with `protectedUntil: null` meaning indefinite
  **under that observed rule**, not missing evidence.
- Disabled/nonmatching rules do not count. The longest matching valid rule wins.
  Exact expiry is unprotected. Invalid/future upload timestamps fail.

The result is `snapshot_checked`, with object/checkpoint keys and digests,
count/head/sequence, observation time, and rule/upload/expiry evidence for both
objects. It checks only those fetched inputs. It does **not** compare the live
database, prove who retained the expected digest, protect later events, prove
continuously current health, establish irrevocable immutability or claim any
incident notification. Rules can be changed by privileged Cloudflare holders.
Do not show this library return value as a live archive-health status until
durable and independently sourced evidence integration is complete.

### Network and resource limits

Each SDK/lock request has a 15-second deadline composed with the caller's required
abort signal. Stream waiting is interruptible even after headers; read streams
are cancelled/destroyed on completion/error. Object data is counted as it streams
and capped at the requested size (at most 32 MiB); verification fetches checkpoint
data with a 16 KiB limit. Advertised lengths must be valid and match actual bytes
when present. Configuration responses are capped at 1 MiB and 1,000 rules.
Buffers, parser allocations and fixed input copies mean total process memory is
larger than the payload cap. Per-request deadlines are not a whole-job wall-clock
or CPU deadline; the future runnable worker must supply its overall budget.

Local tests exercise actual signed SDK serialization through injected transports,
not just mock service callbacks. Real Cloudflare token scope, conditional-create
and lock enforcement, jurisdiction configuration and target-Node validation
remain deployment rehearsals requiring separate approval.

## Durable publication and verifier-owned acceptance

Slice 3b adds [publication services](../packages/data/src/admin-audit-publication.ts),
[private retained checkpoint storage](../packages/data/src/admin-audit-baseline.ts)
and [one-shot rehearsal runners](../apps/audit-worker/src/publication.ts).
This is **local integration only**: no production/R2 execution, scheduler,
customer-chat retention change, audit deletion or live-panel integration is
enabled. The preparation CLI still performs preparation only.

### Separate privileges and state

[The publication migration](../packages/data/src/migrations/202610310001_admin_audit_publication.ts)
adds current copy rows, numbered copy attempts and verifier observations:

- `auditArchiveCopies`: fixed ledger/target/sequence scope, current
  pending/copying/copied/failed status, prepared checkpoint/digest and copy
  evidence. Writer UPDATE privileges cover state/evidence columns only, not
  ledger/target/scope/identity.
- `auditArchiveCopyAttempts`: numbered copying/copied/failed/interrupted
  outcomes, with timestamps and bounded failure codes. The writer cannot update
  attempt identity or remove attempts.
- `auditArchiveChecks`: append-only accepted/failed verifier observations.
  Accepted observations include retained checkpoint identity and fresh remote
  byte/hash/lock evidence. The writer can read, but cannot insert/update/delete
  them. Only `salesmora_audit_verifier` can INSERT; it cannot update/delete them,
  mutate copy state, append/change audit events or read customer/staff identities.
  The admin app has SELECT only; customer roles have no access.

An explicit optional `DB_AUDIT_VERIFIER_PASSWORD` is supported by owner
provisioning; no production role/password is provisioned in this slice. Startup
role checks remain mandatory and reject membership, elevated/owner privileges,
sequence access or extra table privileges. These SQL controls exclude runtime
forgery, not privileged database-owner rewriting.

### Publication and verification lifecycle

Copy and verification runs share the preparation advisory lock, held on one
connection across separately committed transitions and external awaits:

1. Copy captures genesis-to-head, or uses the last independently accepted
   checkpoint as the next segment's predecessor. A new segment is eligible only
   after verifier acceptance. A copied/unaccepted segment returns
   `awaiting_verifier`, not a new scope. No new events returns `no_events`;
   missing database tail below the accepted head is an error.
2. Each copy attempt commits `copying` before preparation. Interrupted copying
   attempts are retained as `interrupted` when the next lock holder retries.
   Reads/builds reuse the approved 500-record, 50,000-event/32-MiB machinery.
   Excess backlog fails without splitting/truncation or changing scope.
3. The expected digest commits **before** external IO. Retry rebuilds the same
   scope and refuses a changed digest. Delivery uses the approved create-only,
   checkpoint-last adapters. Complete read-back commits `copied`, but does not
   establish independent acceptance. Failed copy/final metadata commits record
   failure while retaining the prepared digest. Orphaned uploads are reused
   only if matching and protected; nothing is deleted.
4. A separate verifier reads its retained private checkpoint chain and compares
   it with database copy evidence. It independently rebuilds the selected
   database segment, compares its exact checkpoint digest, then fetches/verifies
   remote bytes/hashes and both objects' lock protection. Its previous anchor
   comes from private retained state, not just database status.
5. After those checks, the verifier atomically retains the new checkpoint
   **before** committing an accepted database observation. If the database commit
   fails afterward, private acceptance remains; the invocation fails and the
   next verifier run reconciles that same retained checkpoint with fresh checks.
   It does not overwrite the file or skip to a later segment.
6. Failed verification appends a failed observation and blocks publication of
   the next segment until an explicit successful recheck. A not-yet-copied
   candidate instead returns `awaiting_copy`; it does not create a failure that
   would prevent completing the copy. Without a new candidate, verification
   rechecks the last retained segment, including its database head and current
   remote locks. No candidate/baseline returns `no_copy`.

Database setup/reconciliation failures are explicit invocation errors even when
there is no valid copy ID to which a verifier observation can be attached.
If failure recording itself is unavailable, no successful result is returned;
the pending/copying state may require the next explicit recovery run.

Both workflows have a 120-second overall budget starting before connection
allocation, composed with 15-second network requests and checked using both an
abort signal and wall-clock time between reads/records and before final
acceptance/status. SQL statement/lock waits remain 30/5 seconds. This is not a
hard process-kill/CPU timer; an in-progress operation may finish before the next
budget check. Failure recording/cleanup can outlive the work budget and use
their own bounded SQL operations. There is no automatic retry loop.

### Private checkpoint storage, bootstrap and recovery boundaries

`createAuditBaselineStore(absoluteDirectory)` requires a verifier-owned private
directory (0700) and private regular files (0600); symlinked directories/files,
malformed/oversized metadata and invalid checkpoint chains fail closed.
Accepted files are named by sequence and contain versioned target, scope,
checkpoint and exact checkpoint digest. The store validates every retained
predecessor link and ledger/target binding when reopened.

Acceptance writes a uniquely named private temporary file, syncs it, publishes
it using a **create-only hard link**, then syncs the directory. Existing accepted
bytes are never overwritten. Reaccepting the exact same retained head is
idempotent; replacing it, changing the predecessor or changing ledger/target
fails. Crash-left unpublished temporary files are not accepted evidence.
Deleting a predecessor or corrupting retained bytes breaks verification, rather
than resetting trust. If all private checkpoints are missing but database
acceptance exists, verification refuses bootstrap.

Use one directory per database/ledger and one coordinated verifier; the database
lock serializes its acceptance path. Standalone concurrent writers to that
directory outside this lifecycle are unsupported. Local tests run under the
developer's OS user: **0700 is not isolation from another process under that
same UID**. Production must provide a separate verifier identity, private
persistent mount/backup unavailable to the archive writer/admin app, and an
approved recovery process. The code does not provision those boundaries.
Hard-link/directory-sync support and durable-volume behavior need target-platform
rehearsal before deployment.

The first empty-store acceptance is a **trust bootstrap**, not proof that no
rewrite happened before the first checkpoint. Production must explicitly review
the genesis/database head and provision the dedicated storage/target binding.
If privileged actors erase both database history and all independent state, or
compromise the verifier's OS identity/backups, these local mechanisms cannot
detect it. Do not reset the directory or restore an old database independently
to “fix” a mismatch; stop and follow a reviewed incident/recovery procedure.

The verifier checks the selected segment and retained head, not every historic
database row on every run. Older segments remain linked through retained
checkpoint hashes; full database-chain verification is still a separate action.
All acceptance is snapshot evidence, not continuously current protection,
irreversible R2 lock enforcement, protection of later events or incident delivery.

### Runnable local integration and validation

The one-shot runners require `ADMIN_AUDIT_REHEARSAL=fictional-storage` and
explicitly injected storage capabilities. They do not construct a real R2
transport or offer a production executable:

- Copy uses the existing dedicated local-test `ADMIN_AUDIT_DATABASE_URL` and
  stable `ADMIN_AUDIT_LEDGER_ID`.
- Verification uses `ADMIN_AUDIT_VERIFIER_DATABASE_URL`, requiring the exact
  separate verifier role, the same ledger ID, and
  `ADMIN_AUDIT_VERIFIER_STATE_DIRECTORY`. It receives no writer capability.
- Both reuse strict localhost/`_test`/non-production URL validation and close
  their database pools. The fictional mode marker does not authenticate an
  injected capability: approved hosts/tests must supply fictional adapters;
  there is no built-in real-storage CLI path.

`pnpm test:admin-audit-publication:db` replays the named publication migration
up/down only in the isolated local test database and refuses to overwrite
existing copy rows. It leaves that migration applied. Rehearsals exercise
committed copy/acceptance state, narrow privileges, interrupted attempt
recovery, partial-upload reuse, verifier-only advancement, private-filesystem
acceptance followed by injected DB commit failure, missing private state,
protection failure, retained DB metadata/tail tampering and the whole-job
deadline. Tampered fixtures are rolled back; normal fictional audit appends stay.

When it creates both temporary test roles, it also launches **separate one-shot
copy and verifier processes** with distinct ephemeral credentials and fictional
file-backed object storage. The verifier process receives no writer database
credential. Tests clean copy rows, attempts, observations, injected triggers,
newly created roles and all explicitly created temporary directories afterward.
No real Cloudflare request, production migration/credential, scheduler, UI
integration or deletion occurs.

Final local validation passed on the repository-supported Node 22.23.3:
78 focused unit/regression tests, contracts/data/audit-worker builds, admin
typecheck and scoped ESLint (with the existing React-version detection warning).
Publication and preparation database rehearsals passed, along with the runtime
grants (24 checks) and audit-chain (6 checks) regressions. Read-only cleanup
confirmation found zero copy/check/attempt/preparation fixture rows, no temporary
worker/verifier roles or rehearsal triggers, and both named archive migrations
applied in the isolated local test database only.

## Archive-health Storybook preview

`Admin/Audit/AdminAuditArchiveHealth` places a read-only external-archive panel
inside the approved audit-viewer layout and AdminFrame. This component and its
fictional evidence remain Storybook-only; the live page uses the separate
`AdminAuditArchiveHealthLive` component below.

The panel separates the latest UTC copy window/attempts from the last completed
archive. Pending or failed copies may show earlier evidence, but that evidence
does not cover the missing window. Observation time, copy time, archived event
count/sequence range, checksum result, checkpoint comparison scope/time and lock
check/protection dates are shown explicitly. Unconfigured, loading, unavailable,
missing/unchecked lock, unchecked/unavailable checkpoint and checksum states do
not become a successful protection result.

Even a completed copy is not labeled checked unless the fictional evidence
includes a matched checksum, matching checkpoint through the archived end
sequence, and confirmed lock protection extending beyond the observation time.
A checksum or checkpoint mismatch calls for stopping sensitive administration
and contacting the incident owner; the preview never claims an alert was sent.
An archived snapshot may be checked while later database events are broken.
Database-chain verification and list filters do not change archive status.
No archive status implies protection for later events or the whole current
database, and historical checks are not a claim of continuously current health.

**Inspect archive evidence** opens the shared read-only drawer with fictional
bucket/object identifiers and hashes. They are plain text, not download links or
credentials. The drawer traps focus; closing it restores the opener. Support and
Billing previews expose no global archive data. The future service must enforce
authorization and record denied attempts independently; the UI is not a security
boundary.

The nightly-copy and one-year-lock policy remains approved, but this preview
does not establish that a real bucket is locked or that retention/purge is safe.
The presentation was approved October 30. The live read-only evidence view is
described below; neither preview state nor the live view activates copy,
verification, retries, deletion or incident handling.

## Read-only archive-health API and live panel

The audit page renders
[`AdminAuditArchiveHealthLive`](../apps/admin/src/components/admin-audit-archive-health/admin-audit-archive-health-live.tsx)
and reads `GET /api/admin/audit/archive-health`. The no-store, force-dynamic
route accepts no query parameters. It uses the same admin-session plus verified
Cloudflare Access email checks and current staff/session/role validation as the
audit viewer. Only Super Admins with `admin.audit.read` may see global archive
metadata. Authenticated denials commit `audit.viewer.access_denied` before
returning 403. The admin database role has SELECT-only access to the lifecycle
tables; no write, copy or verification action is exposed by this route.

The service validates every accepted retained checkpoint and verifier evidence
record before returning a strict [health contract](../packages/contracts/src/admin/audit-archive-health.ts).
It reports the latest fixed-scope copy state/attempt, the latest verifier
observation for that copy, and the most recent accepted snapshot. When a later
copy or recheck fails, the earlier accepted snapshot remains separately visible
with its own sequence, checksum and lock evidence. Malformed or inconsistent
persisted metadata returns an unavailable response, never a success-shaped
fallback. Raw internal exceptions are not sent to the browser.

The live panel states what is recorded and when it was observed. It does not
contact R2, invoke the verifier, refresh bucket-lock rules, compare the live
database, start copies, schedule retries, or delete/repair objects. Its reload
button repeats only the read-only GET. “Independently accepted” means that a
separate verifier previously committed this observation; it is not a new check
performed by the page. Displayed lock protection is historical evidence at the
verifier's check time, not continuous or irrevocable protection. The independent
private checkpoint directory is intentionally inaccessible to the admin app,
so this endpoint presents the durable verifier observation but cannot
cryptographically detect privileged database-owner rewriting of both its rows
and related audit evidence.

The new live Storybook stories use fictional responses and mock only this GET.
The existing archive preview stories remain separate, fictional UI tests. The
live panel is operationally useful only once the separately deployed verifier
has populated the local lifecycle tables with real accepted evidence; this slice
does not provide that production worker, R2 connection, scheduler, infrastructure
configuration, incident alerts, retention enforcement or deployment.

Validation on Node 22.23.3 passes four archive-health contract tests, contracts
build, admin typecheck, focused ESLint, the isolated audit viewer/archive-health
API database rehearsal, admin production build (with ephemeral local `_test`
credentials) and admin Storybook production build. The API rehearsal covers
no-store output, unauthenticated and denied access, durable denial logging,
query rejection, accepted evidence, failed rechecks retaining an earlier
accepted snapshot, and linkage from a later pending scope to its accepted
predecessor. Read-only cleanup checks found zero archive lifecycle rows
and no rehearsal staff users. Storybook's seven new live-panel stories are
present in the build index; the already-running shared Storybook server has a
stale story catalog, so it was not restarted and browser play interactions were
not run against that process.

## Export CSV

Only a current Super Admin with `admin.audit.export` may export. **Export CSV**
reviews all matching events across every page, not just the five visible rows.
The review fixes the literal search, staff/system, category, UTC date range,
snapshot time and sequence anchor. Later or backdated appends above that
sequence are excluded, including the export's own audit event. Search semantics
are shared with the viewer, including matching current staff display names.

1. Review the matching count and scope and enter an operational reason (up to
   1,000 characters).
2. Re-enter your admin password.
3. Use a registered passkey with user verification or a verified TOTP. Recovery
   codes are not export factors.
4. Confirm the export. Save the sensitive file in an approved secure location.

The server binds the review reason and snapshot to a hashed, random one-use
challenge scoped to this admin session and the export purpose. Staff-management
challenges cannot authorize exports or vice versa. Verification expires five
minutes after the server creates the challenge, not five minutes after the last
factor. Passkey counters and TOTP replay protection are shared with staff
actions. The same 30-attempt/15-minute verification budget applies across both
flows, with a five-attempt ceiling per challenge.

Every step rechecks current role, Access email, disabled state and session.
Authenticated staff without export permission receive no evidence; the denied
attempt is committed as `audit.viewer.access_denied` with operation `export`.
Cancellation discards client credentials and verification; the server challenge
expires naturally or is invalidated by a new review or session revocation.

The server counts the fixed scope again before issuing a challenge and before
preparing the file. **More than 50,000 matches is blocked**, never truncated.
Exactly 50,000 is allowed. Empty/changed counts require refreshing and reviewing
again. The additional approved size limit is **32 MiB of UTF-8 CSV bytes**;
oversize files are rejected without releasing a partial file. Preparation reads
500-row batches and has a 30-second budget, alongside the existing SQL/lock
timeouts. No new schema migration is required.

The file includes sequence, event ID, UTC timestamp, recorded staff ID/role,
action, target/workspace/request IDs, reason, IP/user agent, before/after JSON
and stored previous/current hashes. It deliberately omits joined current staff
display names. CSV values are quoted, embedded quotes doubled, and
spreadsheet-formula prefixes (including whitespace/BOM-prefixed formulas) are
neutralized using the existing CSV serializer. This changes presentation of
formula-like values; the export is not canonical input for hash recomputation.
Export does not run or prove hash-chain verification.

The complete file is prepared before a transaction commits
`staff.audit_export` and consumes the challenge. The event records the reason,
filters/anchors, event count, byte count, factor and SHA-256 of the exact file.
If preparation, audit append or authorization fails, no file is released.
Concurrent/replayed commits cannot release a second file with that token.
Only after commit does the API return a no-store CSV attachment with
`X-Export-Count`, `X-Audit-Event-Id` and `X-Export-SHA256`. The browser checks the
count and checksum before requesting a save.

**The audit event proves preparation for download, not successful delivery.**
A lost response may follow a committed audit event. Download failures close the
review and show an explicit uncertain-outcome message; they are never
automatically retried. Check the audit history and start a fresh review if a new
download is needed. The viewer stays on its existing snapshot; refresh to see
the new export event. The server does not retain the CSV or create a reusable
download URL.

The API is `GET /api/admin/audit/export` for registered methods and JSON
`POST /api/admin/audit/export` for `start`, `factor` and `commit`. Mutations
require the exact admin Origin; bodies are bounded to 16 KiB, operations are
strictly validated, and scope/reason cannot be replaced at commit. Database
failures return explicit no-store 503 JSON, never CSV or a success placeholder.

## Local verification and review

- `pnpm test:admin-audit-viewer:db` uses only the provisioned local
  `TEST_DATABASE_URL` ending in `_test`. It seeds fictional staff/session records
  and more than 500 events, checks page and verification authorization, durable
  denials, filters, exact date boundaries, pagination snapshots and real tamper
  detection across batches. Tamper updates are rolled back; fixture identities
  are removed. Fictional append-only audit events remain.
- `pnpm test:admin-audit:db` covers the existing writer, concurrent appends,
  tamper detection and insert-only app privileges.
- `pnpm test:admin-audit-export:db` covers real password/passkey/TOTP, durable
  denials, factor replay/attempt limits, session/purpose binding, complete CSV
  evidence and checksum, one-use concurrent commits, audit-append rollback,
  explicit API failures, exactly 50,000 versus 50,001 records and the 32 MiB
  limit. Bulk/oversize fixtures and intentional audit-append failure are isolated
  in rolled-back local test transactions; fictional normal export events remain.
- `pnpm test:admin-identity:db` and `pnpm test:admin-staff:db` cover related
  isolation and lifecycle regressions.
- Review `Admin/Audit/AdminAuditViewer` and
  `Admin/Audit/AdminAuditViewerLive` in the user-managed Storybook on port 6007.
  Live-adapter stories mock HTTP and do not query or verify a real database.
- Review `Admin/Audit/AdminAuditExportReview` for export scope, exact limit
  boundaries, password/passkey/TOTP, denied and failed requests, expiry,
  duplicate-submit suppression, cancellation and keyboard focus restoration.
- `Admin/Audit/AdminAuditExportLive` connects the approved UI to mocked HTTP,
  with browser saves intercepted. No real credentials, file download or audit
  write occurs in these stories. It covers discovery, fixed snapshot binding,
  TOTP, cancelled passkey, malformed CSV/checksum, lost responses and a denied
  verification preventing a late download.
- `Admin/Audit/AdminAuditArchiveHealth` uses fictional archive/checkpoint/lock
  evidence only. Stories cover independent database/archive outcomes, incomplete
  evidence, failures, denied access, evidence disclosure and keyboard handling.
