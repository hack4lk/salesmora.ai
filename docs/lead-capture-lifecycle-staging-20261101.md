# Lifecycle staging deployment — November 1, 2026

The reviewed lifecycle backend and connected list/dashboard dialogs were deployed to the existing Railway staging web and matching worker after user approval. The application is available at [staging](https://web-staging-cc17.up.railway.app). No public delivery activation was included.

## Frozen source

The candidate overlays 27 reviewed files on the previously deployed frozen release, contains 2,574 files and preserves all 112 migration files and dependency lockfiles. The moving workspace was not uploaded.

- Source manifest SHA-256: `44715c227cf13b86ee6bc1b756a1cd515694f4d974c9232da172d864baa9059b`.
- Source archive SHA-256: `94b0d6409824ccc734e91b6e4a078f8da7f9d32c5898ff3a2ea571ddeca92110`.
- Private local manifest/archive: `.local/releases/capture-lifecycle-deploy-20261101/`.
- Web deployment: `14a121ec-32cb-4989-81c4-d0fd9b4036d4`, Railway `SUCCESS`.
- Worker deployment: `f711a754-09aa-44c6-852a-e02145bb7a96`, Railway `SUCCESS`.

The existing pre-release backup and restoration evidence remain recorded in the earlier release preparation. This release introduces no schema change. Railway's web pre-deploy migration command completed successfully; the live ledger before and after deployment matched the candidate's exact 112 migration names.

## Live verification

- Web production build, TypeScript checks and startup passed; `/api/health` returned 200 with `{"status":"ok"}` and login returned 200.
- The new lifecycle endpoint returned 401 without a session and 403 for a foreign origin. Scoped source reads also required a session. No authenticated hosted mutation was fabricated for this smoke check; the four real authenticated browser journeys were verified locally as documented in the UI checkpoint.
- Both archived synthetic sources remained unavailable. Their hosted pages intentionally return 200 with unavailable content; their public projections returned `state: unavailable`. The initial smoke expectation of 404 was corrected to match that existing behavior.
- Public submission transport remained disabled: the empty fictional submission probe returned 503 with `state: retry`; no submission was accepted.
- All four existing GET-only gateway smoke groups passed: liveness, private-route isolation despite forwarded-host forgery, canonical loader, and hosted/embed security headers.
- Read-only before/after database snapshots matched: nine retained synthetic receipts, two archived sources with unchanged versions, and unchanged hashes/counts for receipt processing, pending intake, captured lead data and approved configurations.
- Worker startup reported `tasks: retention`; its read-only diagnostic reported ready, retention scheduled, one worker, zero failed jobs and no notification-delivery rows.
- The maintained `.railway/railway.ts` plan reported configuration already up to date. PostgreSQL, Redis and forms-gateway deployment IDs remained unchanged; production remained empty.
- The temporary Railway SSH key was revoked, the account key list confirmed no registered keys, and this task's isolated agent/private key files were removed.

## Remaining checkpoints

Public submissions, general publication and unavailable delivery authority remain gated. The subsequent [runtime-role and embed checkpoint](lead-capture-runtime-cutover-20261101.md) completed restricted staging connections with strict enforcement and unavailable-form cookie/resize checks. Active hosted cookie-blocked entry/submission, delivery/scheduler activation and general publication remain separate checkpoints. This lifecycle deployment itself retained the owner-level connection; the subsequent record documents its cutover.

Local validation evidence: [backend](lead-capture-lifecycle-api.md) and [connected dialogs](lead-capture-lifecycle-ui.md), including 3,422 unit tests, 27 database groups, four authenticated browser journeys and 36 responsive Storybook cases.
