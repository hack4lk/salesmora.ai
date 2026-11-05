# Gmail capture local pilot

The Gmail worker connects saved publication, resume, and scheduled activation to Intake Review. A confirmed activation takes a fresh Gmail history checkpoint before the write transaction. The write rechecks access, the reviewed configuration and sample, account generation, source version, and worker readiness before committing the new eligibility window. The account and active window are checked again when the worker commits an intake item.

The dedicated process runs with `WORKER_TASKS=gmail`. The worker and web server both need `CAPTURE_GMAIL_DELIVERY_ENABLED=true` and the same comma-separated `workspaceId:sourceId` entries in `CAPTURE_GMAIL_DELIVERY_SOURCES`. Use the existing OAuth and encryption configuration on both processes and worker-role database credentials on the worker. The worker needs the app's AI credentials and the Gmail worker migrations `202611050005_capture_gmail_sync.ts`, `202611050006_capture_gmail_worker_readiness.ts`, and `202611050007_capture_gmail_worker_budget_read.ts`. The last migration gives the worker read access to AI budget limits so it can enforce them before extraction. Budget changes still require the admin role. Standard worker modes do not run Gmail capture.

The extractor uses a single forced result function, with token reservation before generation and workspace usage accounting after generation. A field value must be backed by verbatim evidence or match a configured choice whose label appears in that evidence. Jobs denied an AI budget reservation wait until the next UTC budget month. [OpenAI function calling guide](https://developers.openai.com/api/docs/guides/function-calling)

Source Settings shows connection health, sync status, and queued and failed counts. When an expired cursor can be recovered within the existing bounds, the worker rescans automatically. Recovery beyond those bounds remains an operator decision. For the single-source pilot, a reviewed pause and resume opens a fresh window for future mail and preserves the existing receipts. It does not backfill the gap or requeue terminal failures. Mailboxes shared by several active sources keep their existing checkpoint until every open window is closed.

## Local acceptance

The local `Gmail Demo Intake` source was launched on November 5, 2026 at 8:11 a.m. Eastern time. The scope is workspace `ef692d28-7b89-4a23-8a53-8b7436d89bd2` and source `4af59f17-4d20-421e-bf94-2ac2489cd293`. The approved subject rule is `SALESMORA-GMAIL-LOCAL-20261104`. Assignment notifications are off on this source. The web UI showed the source as Active and the worker recorded successful live polling. Intake was empty before the new marked message.

Verification included 3,569 unit tests, 14 Gmail database groups, 20 publication groups, nine lifecycle groups, package type checks, focused lint, and the Gmail recovery story. The database suites use disposable local databases with fictional providers and model output.

The local live ingestion test passed on November 5, 2026. After applying the AI budget read grant, the worker retried the marked post-launch email and recorded one receipt and one item awaiting review. The published fields were Name, Email, and Service. All three extracted values matched text in the email body. The email also contained a phone number. Phone extraction needs a separate acceptance check with a Phone field added to the source, a reviewed sample that includes the number, and a fresh matching email after publishing the updated configuration. The AI call was recorded in workspace usage.

To restart the local pilot worker from the repository root with Node 22, use:

```sh
WORKER_TASKS=gmail DATABASE_ROLE_ENFORCED=true pnpm --filter @salesmora/worker start
```

The test sender sends one new fictional email to the already connected account with subject **SALESMORA-GMAIL-LOCAL-20261104 — Live pilot**. Check that it produces one receipt and one awaiting item in [local Intake Review](http://127.0.0.1:3000/intake?workspace=ef692d28-7b89-4a23-8a53-8b7436d89bd2), with the original evidence and extracted fields. Lead creation remains an explicit review decision.
