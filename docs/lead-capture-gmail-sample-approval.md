# Gmail sample approval and publication binding

Updated November 4, 2026. Status: implemented and verified locally with the real connected Gmail account and the explicitly marked fictional email. The approved sample survives a page reload. Gmail delivery/monitoring remains unavailable; staging has not changed.

## Result and live continuation point

The active pilot is DRIZL LLP, workspace `ef692d28-7b89-4a23-8a53-8b7436d89bd2`, source **Gmail Demo Intake**, `4af59f17-4d20-421e-bf94-2ac2489cd293`. The earlier archived test source was left intact.

The real app completed subject search, explicit preview/use, tracked shared-assistant extraction, browser review/confirmation, manual mapping approval, Save draft, and a full page reload. The retained sample has verified Gmail provenance. The subject-only rule is `SALESMORA-GMAIL-LOCAL-20261104`; reviewed fields are Name, Email and Service with exact source quotes. The source remains a draft, source/draft version 3, with no approved publication version. The browser shows **Field mapping approved**, **Matches**, **No unsaved changes**, and enabled Continue after reload.

A read-only live check reports configuration, fields, workflow, account, sample, access, capacity, permission, pending and workspace checks ready. Delivery remains false, so overall launch readiness is false. There are zero capture receipts, intake items and Gmail message jobs. No lead was created or email sent. The live model calls used only the fictional email example through the existing tracked assistant path.

Evidence is private local material under `.local/releases/capture-gmail-connections-20261103/`: `live-sample-approval.json`, `live-gmail-approved-restored.png`, and `sample-approval-validation.json`. No secret, grant, candidate token or real mailbox content is included in the validation artifact. The screenshot contains the fictional example.

## Implementation

Migration `202611050004_capture_gmail_samples.ts` was tested on disposable databases and applied by exact name only to the main local development database. No other pending migration was applied. It adds:

- `captureGmailSamplePreviews`: short-lived immutable retrieval proof, bound to actor/workspace/source/saved draft/account generation/configuration and exact subject/body hash. It retains provider identity and sender metadata without storing the message body. Expired proof can be purged; unexpired proof cannot be updated/deleted. Preview insertion rechecks authority under the workspace lock after the provider request. Each actor/workspace is bounded to 100 unexpired proofs.
- `captureGmailSampleBindings`: immutable exact draft-version bindings for approved samples, with retained Gmail or pasted provenance. Composite ownership constraints prevent cross-source/draft sample binding. Web can read/insert; workers can only read bindings. Workers cannot read previews; staff cannot read either new table. Retained evidence blocks migration rollback.

`retrievalId` is an optional opaque UUID in the existing sample context, not a provider token or a model-minted authority. On explicit sample confirmation the backend validates the preview row against the actor, account generation, saved configuration/version, expiry and exact content hash. Forged, expired, stale and edited proof is rejected. A pasted or edited example remains explicitly pasted. Editing example text clears its retrieval provenance and dependent findings; answer corrections retain original evidence and are marked uncertain where appropriate.

The existing confirmation service now writes both the retained setup sample and the real immutable `captureSourceSamples` record for a connected account. It stores reviewed evidence/answers and verified provenance in one transaction. Unconnected pasted setup work remains available without inventing a provider connection.

Saving carries approval forward only from the current draft lineage and only while account identity, contact requirements, rules, fields and mappings still match. Each saved draft version receives its own immutable binding. Workflow-only changes preserve sample approval. Material changes break the lineage; undoing an edit does not resurrect an old approval. Same-stable-account reconnect can preserve an otherwise valid approved sample, while account health is independently checked. Publication uses the exact saved-version binding and still requires the separate delivery authority.

The canonical findings UI distinguishes selected Gmail examples from pasted/edited examples. Its connected host restores server-retained approval explicitly, so a reload shows approved status without requiring another approval click. Shared assistant tool feedback now identifies bounded invalid field paths/domain issue codes and specifies which unused extraction arguments must be null; it exposes no message values or credentials in error feedback.

## Verification

- Full unit suite: 3,550 tests across 236 files passed.
- Setup runtime-role rehearsal: nine groups passed, including real sample retention, exact retries, workflow-only saves, stable reconnect, material edit/undo invalidation, forged/missing/expired/wrong-actor/stale-generation/content proof rejection, pasted provenance, immutability and retained-proof rollback guards.
- Gmail connection/retrieval rehearsal: 15 groups passed with the new migration.
- Gmail foundation rehearsal: eight groups passed, including empty rollback/re-upgrade in dependency order, runtime grants and staff/worker isolation.
- Story interactions, WCAG A/AA and overflow: 156 cases passed at 1440/768/320 pixels; the final review/connected suite passed 111 cases, including restored approval.
- Contracts/data/web/agent typechecks and focused lint passed. Lint reports only the existing root React version-detection warning.
- Real local browser journey passed through extraction, explicit confirmation, approval, save and reload. No staging or live ingestion acceptance is claimed.

Useful commands (Node 22):

```sh
pnpm test
pnpm test:lead-capture-gmail:db
pnpm test:lead-capture-gmail-connections:db
node --import ./packages/data/node_modules/tsx/dist/loader.mjs packages/data/src/lead-capture/setup-proposals.rehearsal.ts
node scripts/check-capture-gmail-stories.mjs 'gmailfieldmapping|connectedgmailaccount'
```

The database rehearsals create and drop guarded disposable local test databases. Never replace their connection with the main development or staging database.

## Next reviewed checkpoint

Checkpoint 4a now has a local [Intake Review implementation and verification record](lead-capture-intake-review.md). After its review, proceed with the Gmail worker portion of checkpoint 4 of the [integration plan](lead-capture-gmail-integration-plan.md): finish and test the canonical Intake Review path, then implement the separately selected Gmail worker with launch boundaries, history cursors, retry/deduplication and supervised admission. Keep delivery authority false until those prerequisites are accepted. Before a future live launch, disable assigned-lead notifications and verify application email delivery remains off under the approved pilot plan; the current saved workflow defaults were not changed by this sample check. Capture must process only messages arriving after explicit launch; there is no historical mailbox import. Staging deployment requires its own reviewed source/migration/backup and scoped OAuth/environment preparation.

The workspace is shared and contains many unrelated uncommitted changes. Do not deploy, reset, commit or push the whole working tree. Credentials remain only in ignored local configuration. The local web server uses Node 22 on `127.0.0.1:3000`; Storybook is on port 6010. The user is already signed in and Gmail is connected, so no new Google client or consent registration is needed for this local checkpoint.
