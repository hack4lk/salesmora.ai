# Local team invitations

Invitation delivery and the approved acceptance component are connected end to end. Email is captured in local [Mailpit](http://127.0.0.1:18025/); no external provider is configured.

## Owner flow

1. Register and complete Business → Services → Team → Review in the real app on port 3000. Include teammate email addresses, a Field, Office or Admin permission role (Field is the default). Storybook remains isolated and never saves invitations.
2. Create workspace. Unverified owners' invitations stay `pending_verification` without sending.
3. Use the owner's latest verification email in Mailpit. Verification releases and sends the saved invitations. If the owner was already verified, workspace creation sends them immediately.
4. Home shows each invitation as waiting for verification, waiting to send, sent, accepted, or cancelled. Only the workspace owner sees the invitation list and Send pending invitations action.
5. If local delivery fails, pending invitations remain queued. Restore Mailpit and select Send pending invitations. Each invitation can be attempted once per minute; sent invitations are skipped. Workspace/account creation is retained even when mail fails.

The existing development account and workspace are preserved. The user reported truncating tables during testing, explaining why the current workspace had no saved invitations at integration time. No recipient addresses were invented or reconstructed. Start with fresh registration/onboarding test data to exercise delivery.

## Invitee flow

Open the invitation email's real Accept invitation link. Viewing it does not create membership. The page shows business, inviter, invited email, role and expiry.

- Signed out: new teammates enter their name and set/confirm a password directly on the invitation, accept the terms, and choose Set password and continue. The invited email is prefilled and disabled. Existing users choose Sign in to accept. Account creation returns to the same invitation; membership is saved only after explicit acceptance. A short-lived HttpOnly/SameSite cookie retains the invitation through authentication; successful auth returns through `/setup` to the invitation instead of owner onboarding.
- Wrong account: Switch account signs out, preserves the invitation context, and opens sign-in. Acceptance requires the session email to match the addressed email.
- Matching account: explicitly Accept invitation, then Go to workspace. Membership takes the stored role only after current inviter authority is checked; client-supplied permissions are rejected. Invitation possession plus a matching authenticated account verifies that email and marks onboarding complete.
- Accepted links are idempotent for the original accepting account. Existing membership permissions are preserved rather than overwritten. Another account cannot reuse an accepted invitation.
- Expired, cancelled, and invalid links hide private details. Continue to account clears stale invitation context so normal login/setup remains usable.

Continuation selects `/home?workspace=<id>` with server membership checks. Users cannot open another workspace by editing that query parameter. The full workspace switcher and product Home remain future components.

## Backend

Migration `202610110002_invitation_delivery` adds a unique token hash, expiry, sent/accepted timestamps, accepting user, and delivery attempt metadata to `workspaceInvitations`, with `sent`, `accepted`, and `revoked` statuses. It is additive and applied to development/test databases. The authorization cutover adds inviter identity and retires work profiles. See [cutover notes](authorization-live-cutover.md).

Tokens use 32 cryptographically random bytes, stored only as SHA-256 hashes, and expire seven days after delivery. The raw token is present only in the addressed email/request and short-lived browser context. No credentials, tokens, or recipients are logged on delivery errors. Invitation URLs are excluded from Next incoming logs; sensitive routes use no-referrer/no-store policies.

Delivery is triggered after owner verification, after workspace creation (including idempotent retries), or by the authenticated owner's Home action. The database checks the owner's current verification state, locks each invitation, and skips sent/accepted/cancelled records. A local SMTP failure records the attempt and leaves a retryable queue item. This is a local dispatcher, not an independently running background worker. SQL and SMTP cannot share an atomic commit: a process crash after SMTP accepts an email but before SQL commits can require retry and produce an extra email. Normal concurrent calls and retries are serialized and tested; a production mail outbox/provider/worker needs a stronger recovery design before deployment.

`POST /api/invitations/accept` requires a session and exact trusted Origin, accepts only the token, and rate limits authenticated attempts in PostgreSQL (10 per minute per account). A transaction locks the workspace before user/invitation rows, validates current inviter membership/policy/target-role authority and token/state/expiry/recipient, inserts membership without replacing existing permissions, consumes the invitation, and completes/verifies the account. Any persistence failure rolls back all those changes. Retries for the accepting user return the same workspace. `/api/invitations/context` stores/clears only validated internal invitation context and rejects untrusted origins.

Automatic verification uses Better Auth's documented [afterEmailVerification callback](https://better-auth.com/docs/concepts/email). Owner verification is checked again in the dispatcher.

## Verification and remaining scope

The isolated test suite covers two-recipient verification release, verified-owner creation, local HTML/plain-text mail, hashed tokens/expiry, real registration/login return, recipient/role/origin/session checks, concurrency, rollback, existing membership preservation, acceptance limits, workspace scoping, expiry/revocation, and desktop/mobile layout. An injected sender checks failed delivery, retry cooldown, and concurrent delivery without interrupting the user's Mailpit service. Test records use only `salesmora_test`; invitation tests remove their own mail.

Adding teammates after onboarding, replacing expired invitations, owner cancellation controls, and invitation management UI are subsequent components. Expired/cancelled invitations are not automatically reissued. Production email delivery and a continuously running queue worker are not configured. The current integration is ready for local owner-to-invitee review.
