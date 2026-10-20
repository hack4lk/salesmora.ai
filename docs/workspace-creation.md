# Workspace creation

Updated October 12, 2026. See [authorization cutover](authorization-live-cutover.md).

## Test locally

Open [the local app setup](http://127.0.0.1:3000/setup), sign in if needed, and complete Business → Services → Team → Review. Edit any section to verify the other drafts remain intact. Create workspace now saves the selected details and opens `/home`, a minimal confirmation of persisted data. Reload or sign in again: an account with a workspace goes to `/home` instead of starting setup again.

Storybook remains an isolated component preview and performs no workspace writes. Use the app on port 3000 for real creation. Drafts are retained while navigating the mounted setup flow; unfinished drafts are not yet stored across reloads. Only the final confirmation writes to PostgreSQL.

## What is saved

| Table | Purpose |
|---|---|
| `workspaces` | Business name/type, optional postal code/range, owner account and creation time |
| `workspaceMemberships` | The signed-in account's Owner membership; one of Owner/Admin/Office/Field per teammate |
| `workspaceServices` | One record per selected catalog identifier |
| `workspaceInvitations` | Normalized teammate emails, Field/Office/Admin role, inviter identity and queue status |
| `users` | Onboarding status changes to complete in the same transaction |

The additive migration is `packages/data/src/migrations/202610110001_workspaces.ts`. It has been applied to development and isolated test databases. Existing accounts remain intact. No npm dependency was added.

Invitations default to Field. The Owner can explicitly select Office or Admin; work profiles are no longer collected.

The shared catalogs and `workspaceSchema` live in `packages/contracts/src/`. The existing UI data files re-export/import them, so the server and pickers accept the same options. Workspace names and postal codes have 100-character limits; setup accepts up to 100 invitations. The invitation Owner is always derived from the authenticated account.

## API and consistency

`POST /api/workspaces` requires the authenticated session and the configured app Origin. Its body contains only `business`, `services`, and `team.invitations`; caller-supplied ownership, Owner roles, and unlisted choices are rejected. Inputs are validated/normalized on the server; owner invitations and case-insensitive duplicate invitations are rejected.

A transaction locks the account row, creates the workspace, Owner membership, versioned default policy and audit, services, invitations, and completion status together. Failure rolls all of them back. One initial workspace per account is enforced with a unique owner key. Concurrent submissions/retries return the same workspace identifier and never overwrite an existing workspace. A future multi-workspace feature will need a separate creation policy.

Responses: 201 created, 200 already created, 400 malformed JSON, 401 signed out, 403 wrong/missing Origin, 413 oversized request, 422 invalid details, 500 failed save. The client disables actions during submission, preserves details on error, and allows retry. `/setup` and `/home` are protected; Home requires current membership, a valid saved policy and Home access. Each widget checks its own read grant.

## Invitations and next scope

Unverified owners' invitations are saved as `pending_verification`; verified owners' invitations are saved as `queued`. The connected dispatcher sends queued invitations only after workspace creation and Owner email verification. Access is granted only through explicit acceptance, with current inviter authority rechecked. Both workspace creation and verification must be complete before delivery.

## Verification

Run `corepack pnpm --filter @salesmora/web exec playwright test` using Node 22. The runner starts port 3002 with the isolated `salesmora_test` database and never clears development data. Workspace tests cover real four-step creation, selections and permissions, skipping, retry, concurrent idempotency, rollback after a database failure, session/origin checks, invalid and forged input, verified queue state, membership-scoped Home, and mobile/desktop layouts.

Verified: 25 existing auth/recovery tests and nine workspace tests pass across the suite and targeted follow-ups; 55 onboarding/flow Storybook stories pass interactions and Axe checks. Lint, typecheck, production package/app build, Storybook build, and desktop/mobile layout checks pass.
