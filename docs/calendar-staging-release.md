# Calendar staging release candidate — October 28, 2026

Status: **Complete current app deployed to staging and smoke-verified October 28, 2026.**

Target: existing SalesMora project `e0865ab2-d136-4e6c-a1bd-e96af3e52e74`, staging environment `41e4f7c2-f517-49ed-9c8e-6b654b926982`. Production is empty and is outside this release.

## Candidate scope

The prepared complete-app candidate includes the approved Calendar/shared-visit assistant, Job defaults/reminders/notifications and existing Jobs/Work Orders/storage integration. It also includes the current integrated Estimate pages/tools/migrations/worker processing and read-only Gantt view. These are already imported by navigation, the global assistant registry, data exports and worker startup; excluding their folders alone would produce an inconsistent release.

The user explicitly approved deploying the complete current application, including Estimates and Gantt, to staging. Web and worker variables were checked in memory: database, storage bucket and encryption-key parity pass; required email/model/storage variables are present; no local test-provider/proxy overrides are present. No secret values were logged. Estimate customer email sending remains deliberately disabled outside local Mailpit by the existing implementation; this release does not enable that separate provider rollout.

The sanitized local candidate excludes credentials, environment files, Git metadata, dependencies, build/test output, local databases/backups and prototypes. The generated Next route declaration is regenerated during the image build. The original working tree and Git index are unchanged.

Candidate directory: `/private/tmp/salesmora-calendar-release-20261028/`. Manifest: `release-manifest.json`, **1973 files** before the manifest, digest `37158ac0533c48b4e22683777d2fd626b0ccd38751817b9eb3166450756a1403`. This is a candidate digest; rebuild the manifest if release source changes before upload.

## Staging readiness inspected

- CLI reauthentication completed by the user. Existing staging web/worker deployments are healthy in Railway; database and Redis services are unchanged.
- PostgreSQL ledger was read from the running staging database: **53 applied migrations**. Every applied filename exists in the local migration directory. The complete candidate adds **39 migrations** in normal filename order; do not choose migrations by numeric suffix alone.
- Railway has no managed backup or schedule on this volume. Manual volume backup creation was refused because the workspace does not have the required Pro plan; no plan or infrastructure upgrade was made. PITR is disabled and the custom PostgreSQL image is unsupported by that feature.
- A logical PostgreSQL custom-format backup was created privately on the existing staging volume at `/var/lib/postgresql/data/release-backups/before-calendar-20261028.dump` (460,902 bytes, mode 600). `pg_restore --list` succeeded. A full `--exit-on-error` restore into `salesmora_calendar_restorecheck_20261028` succeeded and its ledger contained all 53 migrations. The scratch database was dropped by cleanup. No existing workspace, account or record was edited.
- The backup remains on the same volume. It is a pre-migration recovery artifact, **not off-volume disaster recovery**. Do not claim managed backup/PITR or off-volume restoration has been verified.
- A release-only SSH key was used for inspection and removed when preparation ended. No existing SSH configuration was changed; private key and host-key files were isolated under the temporary directory.

## Release procedure (completed; retained for reference)

1. Resolve the complete-app versus Calendar-only scope decision and validate any additional runtime prerequisites.
2. Freeze and hash the exact source package. Recheck the ledger and make a fresh backup if staging data changes materially before cutover.
3. Stop incompatible older writers and workers, then apply the exact approved ordered migration set. Do not roll back retained history or restart old schedule writers against the new shared model.
4. Deploy matching web/worker versions, verify liveness plus database/worker readiness and run bounded fictional-workspace checks for shared schedule/clear, Field denial, notifications/reminders and assistant browser confirmation/context.
5. Record actual deployment IDs, applied migration ledger and observed results. Provider delivery and Railway performance require separate observed evidence.

See [local release QA](calendar-release-qa.md) for passing local checks and the deployment boundary.

## Pre-cutover pending migrations (all 39 now applied)

- `202610210001_calendar_visits.ts`
- `202610210002_calendar_commands.ts`
- `202610210003_calendar_reconcile.ts`
- `202610220001_visit_notifications.ts`
- `202610220002_job_notification_settings.ts`
- `202610230001_estimates_foundation.ts`
- `202610240001_estimate_business_profile_version.ts`
- `202610240002_estimate_sharing.ts`
- `202610240003_estimate_delivery.ts`
- `202610240004_estimate_payment_link.ts`
- `202610240005_estimate_void.ts`
- `202610240006_estimate_decisions.ts`
- `202610240007_estimate_decision_immutability.ts`
- `202610250001_estimate_revisions.ts`
- `202610260001_estimate_archive.ts`
- `202610260002_estimate_chat_results.ts`
- `202610260002_estimate_conversion.ts`
- `202610260003_estimate_chat_drafts.ts`
- `202610260003_estimate_notifications.ts`
- `202610260004_deadline_reminders.ts`
- `202610260004_estimate_chat_shares.ts`
- `202610260004_estimate_exports.ts`
- `202610260005_job_notifications.ts`
- `202610270001_estimate_chat_decisions.ts`
- `202610270001_job_status_notifications.ts`
- `202610270002_estimate_decision_evidence.ts`
- `202610270003_estimate_chat_draft_actions.ts`
- `202610270004_estimate_draft_action_evidence.ts`
- `202610270005_estimate_chat_voids.ts`
- `202610270006_estimate_void_evidence.ts`
- `202610270007_estimate_chat_archives.ts`
- `202610270008_job_assignment_notifications.ts`
- `202610270009_job_deadline_notifications.ts`
- `202610270010_calendar_chat.ts`
- `202610270011_calendar_proposals.ts`
- `202610270011_estimate_archive_evidence.ts`
- `202610270012_estimate_chat_draft_deletes.ts`
- `202610270013_estimate_draft_delete_evidence.ts`
- `202610270014_estimate_chat_conversions.ts`

## Approved full-app cutover progress

The user approved the complete current app, including Estimates and Gantt. The frozen upload contains 1,974 files before its manifest, digest `2de210356202f62b8e8af9dbfb2c1ea1ecfbbfe984e9ecda3bb3e548466b19d9`. Runtime source is unchanged from the validated candidate; the additional authorization test corrections align the old 78-action assertion with 83 actions and the approved Office Estimate archive/delete policy. Explicit Owner-revocation coverage was added; no authorization implementation changed. The complete unit suite passes **3,087 checks / 139 files**, with targeted test lint passing.

The old staging worker was stopped and the old web writer removed for cutover. The first stop command timed out against Railway's API and the conversation was interrupted before uploading replacements; the user reported the services as failed. Inspection confirmed removed/removing old deployments, with no replacement uploaded yet. The frozen web upload was then started as `60aac1dd-cb0f-4167-afcc-48dd103a5437`. Its production build and typecheck passed; image upload/deployment and live migration verification remain in progress. This record does not treat a detached upload as successful deployment.

After confirming no old web/worker instances remained, a second custom-format backup was saved on the existing PostgreSQL volume at `/var/lib/postgresql/data/release-backups/before-full-release-cutover-20261028.dump` (460,901 bytes, mode 600). A full isolated scratch restore and the 53-migration ledger check passed again; the scratch database was removed. This remains a same-volume logical recovery artifact, not off-volume disaster recovery.

## Completed deployment and verification

- Web deployment: `60aac1dd-cb0f-4167-afcc-48dd103a5437`, **SUCCESS**. Pre-deploy reported `Migrations complete (deployment)`. Public HTTPS `/api/health` returns `200 {"status":"ok"}` with `Cache-Control: no-store`.
- Worker deployment: `33332492-3b93-48ba-9780-a54b46e411d0`, **SUCCESS**, uploaded only after migrations completed. Both services use the same frozen manifest digest `2de210356202f62b8e8af9dbfb2c1ea1ecfbbfe984e9ecda3bb3e548466b19d9`.
- Final live ledger: **92 migrations**, exactly matching the approved upload's complete migration filename set. No reset, rollback or seed ran on staging.
- Safe worker status diagnostic: `ready: true`, retention scheduler present, one retention worker, zero failed jobs; assignment/visit/deadline/Job email outboxes were empty at inspection. One delayed recurring retention job is expected.
- PostgreSQL deployment remains `78e3d5ca-f9e6-4791-be81-74ce28e42d2c`; Redis remains `df683cff-ee73-4364-8fee-df16c325f297`. Production remains empty. No bucket, credential, runtime-variable, service-plan or infrastructure change was made; temporary inspection keys were the only added access and were removed afterward.
- Two bounded fictional-workspace smoke runs passed HTTPS liveness and anonymous denial; real account/workspace/customer/Job/Work Order creation; explicit shared-visit creation; combined scheduling and idempotent retry; forged-Origin denial; Field own-scope projection and revoked scheduling denial; cross-workspace denial; combined in-app visit notices; Estimate list and Job notification settings reads; browser Calendar and Gantt rendering; shared clearing into one deduplicated unscheduled visit.
- Actual staging-provider read: private SSE, Thinking before completion and a scoped Calendar result passed. Actual staging-provider schedule proposal: the browser received a review card; the saved visit stayed unchanged before confirmation; clicking **Confirm schedule** saved both active linked records and displayed the confirmed state. No test provider or fixture route was deployed or enabled.
- Both runs requested deletion of their fictional Field accounts before their fictional Owners/workspaces through the normal authenticated API (`202` each). Final aggregate verification found zero active release-fixture accounts. Sessions were revoked. Browser/request contexts closed. No existing account or customer/work record was edited, and no fixture password, session, provider key or prompt content was logged as evidence.

### Remaining operational follow-ups

This release verifies service readiness and bounded live flows, not every local acceptance case against real providers. Real inbox delivery of visit/Job notifications and actual scheduled deadline-reminder delivery were not observed here; role/policy/preference/notification/reminder coverage passed locally. Same-volume dump/restore does not provide off-volume disaster recovery, managed backups, PITR or a complete failure-recovery rehearsal. External alerts remain a separate operational follow-up. Estimate customer email sending remains deliberately disabled outside local Mailpit; other Estimate operations, expiry and staff-notification infrastructure were included as implemented. No production deployment was performed.


### Subsequent Estimate email rollout

The user subsequently requested enabling staging customer email. [Estimate staging email](estimate-staging-email.md) records the matching successful follow-up deployment and provider-backed acceptance/customer-link test. This supersedes the earlier Mailpit-only staging limitation above. Calendar and its schema were unchanged by that follow-up; production remains outside the rollout.
