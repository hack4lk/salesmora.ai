# Live authorization cutover — October 12, 2026

The local app and database now use **Owner, Admin, Office and Field**, with one role per teammate and exactly one matching Owner per workspace. Existing Member/Office and Member/Field rows and invitations were converted; profile columns were removed. Accounts and business records were preserved.

## Connected behavior

- Workspace creation seeds version 1 defaults and an audit record within the creation transaction. Invitations default to Field, with explicit Office/Admin choices available to the creating Owner. Payloads with obsolete profiles or forged ownership are rejected.
- Home and the assistant launcher are reviewed baseline capabilities for all four roles. Each widget/action independently checks current saved permissions. The launcher still opens the approved modal; model/chat execution remains disabled.
- Owner/Admin/Office can create leads by default. Field cannot open the create form, fetch its assignee choices or submit directly to the API. Creation rechecks current policy and actual assignee membership under a workspace lock before idempotency handling or insert.
- Home counts are filtered in SQL before grouping. Field sees only directly assigned leads; Owner/Admin/Office defaults include workspace-wide/unassigned leads. Empty states and creation actions follow capabilities rather than role-name conditionals.
- Current navigation receives server-derived capabilities. Denied destinations are removed before Coming soon availability is applied. Only Home has a completed navigation destination; the permitted Leads list remains a Coming soon entry. Future modules need explicit implemented-capability bindings and server guards.
- Invitation delivery and acceptance reload the inviter's current membership/policy and target-role authority. Removed inviters, revoked invite permission and Admin→Admin grants deny. Existing memberships are retained; links cannot overwrite a current role. New membership acceptance appends an audit event in the same transaction.
- Server identities come from authenticated sessions; enabled features come from server code. No browser/model role claims or permissive legacy checks are used by these connected flows. Authorization reads are uncached.

## Verification and local rollout

- 289 pure-engine tests and 17 PostgreSQL rehearsal checks passed.
- All 68 browser/API tests passed, including both tenants, four roles, direct URL/API denial, Field assignment counts, existing-session revocation, stale invitations, rollback/idempotency and previous authentication/recovery journeys.
- Lint, workspace typecheck, production build and Storybook build passed. Role-picker interactions, Field Home and filtered-navigation stories passed at 1440px/320px; screenshots were inspected.
- `node scripts/backup-local-db.mjs --rehearse` saved a private custom-format backup, restored it into a temporary database, compared record fingerprints and successfully migrated that copy. The temporary database was removed.
- The local Next.js process was stopped, a fresh backup taken, `pnpm db:migrate` committed the cutover, and the compatible server restarted on port 3000. The saved development Owner policy validated, no Member roles remained, and login/signed-out route checks passed.

Private backups remain under ignored `.local/backups/` with restricted permissions. They contain account/business data and must stay local. Restoring a pre-cutover backup requires applying current migrations before starting the app; never run the old permissive version after enforcement. This local rehearsal is not a production deployment review.

## Next review checkpoint

Navigation displays permitted future sections as disabled **Coming soon** entries, using reviewed grants from the current saved policy and catalog role ceilings. This presentation projection is separate from execution authorization: future pages, queries, actions and assistant tools remain denied by the implemented-feature registry. Home and Settings remain real links only when their live permissions authorize them. Related customer access can show the upcoming Customers entry for Field without granting workspace-wide customer access. An existing migrated Owner workspace was checked read-only: its complete grants were intact; an overly narrow navigation projection caused the missing menu items, so no policy reset or data migration was needed.

The approved [Settings → Permissions editor](permissions-page-design.md) is connected as an Owner-only sub-page/API with live policy loading, explicit before/after Save, current authority and revision checks, transactional audit writes and a 15-minute recent-authentication requirement. The main Settings menu opens its own business-profile overview, available under current business-read or protected permission-read grants; Admin can view general Settings without accessing Permissions. Unavailable/unreviewed features remain disabled. Review this connected screen before the broader authorization acceptance checkpoint. Audit-history browsing is not exposed yet.

Team-management screens after onboarding, ownership-transfer use cases, future resource repositories, cross-tab invalidation and production credential/audit-retention review remain pending. The full planned job/estimate/customer/campaign permissions are catalogued and tested in the pure engine; those modules are not live features. Chat/RAG implementation resumes after the authorization acceptance checkpoint.
