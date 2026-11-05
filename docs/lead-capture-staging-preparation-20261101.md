# Lead Capture staging preparation — November 1, 2026

Completed ledger inspection, private backup with off-volume retention and restoration verification, and source freeze. No application deployment, live migration, role provisioning, DNS update or publication activation was performed.

## Live ledger and release scope

Read the staging PostgreSQL ledger through temporary SSH access. All **92 applied migration filenames** exist in the frozen source. The historical release manifest also contains exactly those 92 filenames. The frozen candidate has **112 migration files**, leaving **20 pending**: the original runbook's 19 plus `202611010001_admin_email_change.ts`. The user explicitly approved including the additional admin email-change work in this release scope.

Previously applied source `202610120001_authorization.ts` differs from the prior release, as already recorded in the rollout proposal. Its historical-replay change will not rerun an applied migration. Filenames establish ledger continuity; Knex does not provide applied-source checksums.

Pending migration order:

```text
202610280001_runtime_grants.ts
202610280002_suspension.ts
202610290001_plan_override.ts
202610290002_account_audit.ts
202610290003_team_admin_grants.ts
202610290004_ownership_transfer.ts
202610300001_admin_identity.ts
202610300002_admin_bootstrap_invitations.ts
202610300003_admin_enrollment.ts
202610300004_admin_audit.ts
202610300005_admin_staff_management.ts
202610300006_admin_staff_lifecycle.ts
202610300007_lead_capture_foundation.ts
202610300008_lead_capture_permissions.ts
202610300009_admin_audit_preparation.ts
202610310001_admin_audit_publication.ts
202610310002_capture_publication.ts
202610310003_lead_assignment_settings.ts
202610310004_capture_submissions.ts
202611010001_admin_email_change.ts
```

## Backup and restoration evidence

- A repeatable-read, read-only exported PostgreSQL snapshot supplied the custom-format dump, migration ledger and exact counts for every non-system table. This avoids comparing the dump with a later, potentially changed live table count.
- Railway copy: `/var/lib/postgresql/data/release-backups/capture-preparation-20261101/staging.dump`.
- Private off-volume copy on this Mac: `.local/backups/capture-release-20261101/staging.dump`, **640,817 bytes**, file mode **600** within a **700** directory.
- Both copies have SHA-256 `47d2a61152522398070627108c873e841a860404cc378aa2a74952376b8c73a5`.
- The off-volume copy was transferred back and fully restored using `pg_restore --exit-on-error` into the separate `salesmora_capture_restorecheck_20261101` database. All **120 table counts** and all **92 migration entries** matched the snapshot evidence exactly.
- The scratch database was dropped, and a separate catalog read confirmed its absence. The live database was not reset, seeded, migrated or restored over.
- Private ledger/count/restore evidence is retained beside the local backup. The original and round-tripped backup files remain in the remote private backup directory.
- This establishes a verified logical backup and a Mac copy outside the Railway volume. It does not establish managed backups, PITR, automated retention, cluster-role/password backup or an independent-host disaster recovery rehearsal.

## Frozen source

- Read-only source directory: `/private/tmp/salesmora-capture-release-20261101/`.
- Retained archive: `.local/releases/capture-release-20261101/source.tar.gz` (mode 600).
- Manifest: `.local/releases/capture-release-20261101/release-manifest.json`.
- **2,562 source files** before the manifest; **112 migrations**.
- Source manifest digest: `46e06572fc08f1dbe52b3b15fbfdd2b0fa34427d85ff6e4b014517f92e9a729f`.
- Archive SHA-256: `04236334715f3e3af834df61948625327a933832ec2c806755d58c1a5a37204f`.
- Every archived source file was rechecked against its manifest hash. Environment files, private key files, dependencies, Git metadata, local data/backups, prototypes and build/test output were excluded. The generated Next route declaration is reset for build-time regeneration.
- The archive freezes the approved source scope; it does not claim new build/test validation of the additional admin email-change work. Earlier 3,412-test results predate that additional work. Use this same frozen source for both web and worker and finish release validation before deployment.

## Access cleanup

The user explicitly approved a temporary Railway SSH key for these checks. It was registered, then revoked after verification. Railway confirmed **no registered SSH keys** afterward. The isolated SSH agent was stopped and its temporary private/public key files were removed. Existing SSH configuration was not modified.
