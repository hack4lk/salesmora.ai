# Staff access, invitations and approvals

The Staff page is `/staff` in the **separate admin application**, not the customer
application. Cloudflare Access and the admin password-plus-factor session are both
required. The server binds the session email to the verified Access identity and
loads the current role on every read, verification and mutation.

## What is available

- Staff accounts with their active role, registered factor summaries and last
  recorded session activity. An account with no active role is shown as having no
  access, not as an active administrator.
- Invitation creation, revocation, delivery status and failed/pending email retry.
- Super Admin invitation requests, independent approval or rejection, and expiry.
- Disable/re-enable and existing-account role changes, including independent
  approval for Super Admin promotions and restorations.
- Atomic, hash-chained audit events for account, invitation and approval
  mutations, plus email delivery outcomes.

Only Super Admin currently has the staff-management permissions. This slice does
not implement factor resets or profile management. A staff account is not created until invitation enrollment
successfully verifies its password and a registered second factor.

## Before using it locally

1. Provision the database roles using the existing database-role runbook.
2. Apply migrations to the intended local admin database, including
   `202610300005_admin_staff_management.ts` and
   `202610300006_admin_staff_lifecycle.ts`. The implementation rehearsal applies
   these migrations **only to the isolated local test database**; other databases
   are not automatically changed.
3. Configure `ADMIN_DATABASE_URL`, `ADMIN_AUTH_SECRET`, `ADMIN_AUTH_URL` and the
   existing Access configuration for the admin process. `ADMIN_DATABASE_URL` must
   use `salesmora_admin_app`, not the customer runtime or schema-owner role.
4. Configure the existing email transport. Local `EMAIL_PROVIDER=mailpit` uses
   SMTP on `127.0.0.1:11025` and the Mailpit interface on port 18025.
   HTTPS deployments require `EMAIL_PROVIDER=resend`, `RESEND_API_KEY` and
   `EMAIL_FROM`. Enrollment links use `ADMIN_AUTH_URL`, never the customer origin.
5. Start the admin app with `pnpm admin:dev` and complete the existing staff
   bootstrap/enrollment/sign-in flow. The Staff page is linked from admin home.

Production hosting, Cloudflare policy/tunnel wiring and deployment approval remain
separate work. Do not expose this service as an unprotected customer-app route.

## Invite Support or Billing staff

1. Open Staff, choose **Invite staff**, and enter a company email and role.
2. Review the invitation and enter an audit reason.
3. Verify your admin password, followed by your passkey or authenticator code.
4. Confirm **Send invitation**.

The server stores an action-bound verification challenge hashed at rest and bound
to the current staff user and session. A confirmation does not accept replacement
action details from the browser. Verification expires after 5 minutes, is single
use, and rechecks session validity, role and target eligibility when applied.
Password/factor attempts are limited to 30 per user per 15-minute window; each
challenge permits at most 5 factor attempts. Authenticator time steps cannot be
reused for another staff-action challenge.

Invitations expire after 24 hours and may be accepted once. Only a token hash is
stored in the invitation. Existing staff accounts and active invitations cannot
be duplicated, including by concurrent requests.

## Invite a Super Admin

The same review and reauthentication flow creates an **approval request**, not an
invitation or email. It expires after 5 minutes.

A different authorized staff member opens **Review request**, chooses approve or
reject, supplies their own audit reason and completes password-plus-factor
verification. The server checks both reviewers' current permissions, prevents
self-review, and locks the request so concurrent decisions cannot issue multiple
invitations. Approval creates and emails the invitation; rejection does not.
An expired or decided request cannot be reused. Refresh Staff to see new requests
and decisions made by another administrator.

## Disable, re-enable or change a staff role

The Staff accounts cards expose **Review disable**, **Review re-enable**, and
**Review role change**. Choose a different role before reviewing a role change.
Each action requires an audit reason and fresh password-plus-factor verification.

- You cannot disable, re-enable or change the role of your own staff account.
- The last active Super Admin cannot be disabled or demoted. Disabled accounts
  do not count as active administrators.
- Disable retains the account, its role history and registered factors. It
  deletes all current sessions and blocks new password sign-in/session creation.
- Re-enable retains the previous role and registered factors. Previous session
  cookies remain invalid; the staff member must sign in again.
- Every applied role change preserves role-assignment history and deletes all
  target sessions. Current pending password-factor verification records are
  also invalidated when an account change is applied.
- Promotion to Super Admin or re-enabling a disabled Super Admin creates a
  five-minute approval request. The current role/access state is unchanged until
  a different authorized reviewer completes their own verification and approves.
  The target cannot decide their own account change. Rejection/expiry applies
  no change. Account approvals never send an enrollment invitation or email.

The server loads the target's role and disabled state rather than trusting
browser claims. Requests and verification challenges bind an account version;
if another administrator changes the account during review, the old action or
approval fails and must be reviewed again. Refresh Staff before starting over.
The requester's current authorization is checked again at approval time.

Staff-management transactions share a database advisory lock and lock affected
records, preventing cross-admin lock inversions and last-admin races. Session
insertion also locks the staff account and rejects disabled accounts or a
session timestamp preceding the latest access change. Account updates, session
revocation, challenge consumption and audit records commit or roll back together.
These controls do not replace the separate Cloudflare Access boundary.

## Delivery failures and retries

Invitation creation and approval commit before email delivery. A delivery failure
does not undo the invitation or falsely report that an email was sent.

- The delivery record retains an **encrypted** enrollment token until delivery
  succeeds or the invitation is revoked. Tokens are never returned by the staff
  API, displayed in the staff table, or included in audit payloads.
- A failed or pending invitation exposes **Retry email**. This sends the same
  still-valid invitation, not a new token or role grant; it requires a current
  staff-management session. It does not extend invitation expiry.
- Retries are serialized and limited to 5 provider attempts. After that, revoke
  the invitation and create another through the reviewed verification flow.
- Resend receives a stable per-delivery idempotency key. SMTP/Mailpit delivery is
  at-least-once if a process crashes after SMTP acceptance but before the delivery
  transaction commits; duplicate local messages can therefore contain the same
  single-use link. Never assume SMTP provides exactly-once delivery.
- There is no background delivery worker in this slice. Pending/failed deliveries
  are durable and recovered manually using Retry email.
- A lost confirmation response is treated as an uncertain outcome. The client
  refreshes authoritative data and does not automatically resubmit a mutation.

Revocation immediately invalidates enrollment and clears any queued encrypted
token. Already delivered email cannot be recalled, but its link no longer works.

## Validation and UI review

- `pnpm test:admin-staff:db` runs database and route rehearsals using only a local
  `TEST_DATABASE_URL` ending in `_test`. It needs provisioned database roles,
  applied migrations and local Mailpit. Fixture accounts and invitations are
  removed; append-only audit events remain, and Mailpit receives a fictional test
  invitation.
  It also covers self-change/permission denial, disabled sign-in, session and
  pending-factor invalidation, fresh sign-in after re-enable, role history,
  account-version conflicts, independent account approval/rejection/expiry,
  duplicate approval decisions and concurrent cross-admin disable/demotion.
- `pnpm test:admin-auth:db`, `pnpm test:admin-enrollment:db`,
  `pnpm test:admin-identity:db` and `pnpm test:admin-bootstrap:db` cover related
  regressions.
- Storybook: `Admin/Staff/StaffManagement`,
  `Admin/Staff/StaffActionReview`, `Admin/Staff/StaffAccountControls` and
  `Admin/Staff/StaffManagementLive`.
  Live-adapter stories mock requests; use fictional credentials only.
- Use the existing user-managed Storybook on port 6007; do not start a duplicate.
