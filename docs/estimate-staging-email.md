# Estimate email on staging

October 28, 2026. **Enabled on staging and provider-backed smoke check passed.**

## Rollout

`ESTIMATE_EMAIL_ENABLED=true` on **both web and worker** enables the existing Send/Resend and customer-link flows only when Railway's server-provided `RAILWAY_ENVIRONMENT_NAME` is `staging` and `BETTER_AUTH_URL` is a valid HTTPS origin. The flag does not enable production. Local loopback Mailpit flows continue without the flag. No schema or permission-policy migration is required.

Staging reuses `EMAIL_PROVIDER=resend`, `EMAIL_FROM`, `RESEND_API_KEY`, `BETTER_AUTH_URL` and the existing `FILE_MASTER_KEY`. No keys should be pasted into chat, logged or committed. Both services already have the required provider/storage/encryption settings. The global assistant uses the same server-enabled permission set, so it inherits this capability without a separate Home update.

The rollout enables public customer paper and protected staff Copy Link in addition to the email worker: sending a link that remains locally gated would be unusable. Public reads retain token validation, active/expiry/revocation checks, conservative shared rate limiting, frozen customer-safe snapshots, no-store/no-referrer/noindex protections and existing authorization boundaries. Forwarded request headers are not used as trusted deployment or requester identity. No new customer edit/decision feature is enabled.

## Delivery

The existing reviewed Send/Resend operation creates the durable delivery; the worker rechecks sender membership, current Send/Read permission, estimate state and active signed link at delivery time. Browser confirmation, version/snapshot binding, recipient review, history, five-attempt backoff and secret-safe failure reporting remain. Resend receives the stable `estimate-delivery-<delivery UUID>` idempotency key, frozen recipient/subject/paper, business reply-to and inline logo. Local delivery retains Mailpit message-ID lookup and crash recovery.

[Resend retains idempotency keys for 24 hours](https://resend.com/docs/dashboard/emails/idempotency-keys). External transport refuses automatic sends once the durable `queuedAt` is 23 hours old, keeping even acceptance/transaction-rollback recovery inside that window. Invalid or future timestamps fail closed. Older pending deliveries eventually show the existing failed-delivery state; staff must explicitly review and resend with a new delivery identity. A provider receipt means accepted for sending, not confirmed human inbox delivery. Bounce/complaint webhook processing is not added in this change.

## Verification and operation

Unit checks cover staging/production/flag/origin/config boundaries, stable provider headers and inline attachments, masked failures, stale-queue denial and preserved local behavior. Existing browser/API tests cover Send/Resend, Copy Link/public paper, revoked/expired links, explicit confirmation and retries.

After deploying both services, verify `worker.estimate_delivery_started`, worker readiness, a fictional Estimate Send to [Resend's documented test delivery address](https://resend.com/changelog/sending-test-emails), one provider-backed Sent receipt, a working signed-out customer link, and no duplicate delivery on replay. Then use the staging UI to send a test estimate to an inbox you control for human inbox/rendering checks. Never test on an existing customer's record or address.

To pause the feature, disable `ESTIMATE_EMAIL_ENABLED` on both staging services and redeploy them. Stored estimates/history remain; pending work and public links are unavailable while paused. Production, paid billing and local credentials remain unchanged.

## Local validation and frozen release

- Full unit suite: **3,114 checks passed**. Workspace typechecks and production web/worker builds passed. Repository lint: **0 errors, 43 existing warnings**.
- Three focused browser/API journeys passed: staff confirmation/origin/access/version/replay and inactive public reads; Publish/Copy Link/signed-out paper; Send plus corrected-email Resend through Mailpit. The Send/Resend journey passed again after updating the queued-delivery message for both providers. Targeted copy/test lint passed.
- Frozen upload: **1,978 files** before its manifest, digest `df1926f97cdfadb09e77552909b24736617425e0c84c8122e61e793e90a63ee8`. Derived from the prior deployed full-app snapshot using only the explicit email rollout overlay. Credentials, local accounts/databases, environment files, build output and Git metadata are excluded. No migration or permission-policy edit.
- `ESTIMATE_EMAIL_ENABLED=true` set on staging web and worker, with immediate automatic deploys skipped until the validated source upload. Runtime identity/Resend configuration were checked using safe booleans only. Production settings and local secrets are unchanged.
- Web deployment `589ba322-c154-4466-9c37-2d0af6b884b0`: SUCCESS. Matching worker and actual provider smoke verification completed successfully (below).

## Completed staging activation

- Web `589ba322-c154-4466-9c37-2d0af6b884b0` and worker `05fba878-ff4b-4164-b4f3-498a386c7865` are both **SUCCESS**, using the same frozen source above. Final public health is 200. Runtime checks confirm the switch is true and the server environment is staging on both services.
- A new fictional account/workspace/customer/Job/business profile/Estimate exercised the normal strict review and Send APIs. Send was advertised with current permission; forged Origin was rejected. One confirmed send to Resend's documented `delivered@resend.dev` test address moved to Sent on the first worker attempt. Replaying the identical confirmed request returned the original receipt without creating a second delivery.
- The protected staff Copy Link endpoint returned the active customer path. Signed-out public API and browser paper worked over HTTPS; the public body excluded the fixture's staff-only notes. No-store/no-referrer response protections passed.
- The fictional Owner/workspace was queued for deletion via the normal password-confirmed account API (202); its sessions were revoked, and browser/API contexts were closed. No existing customer's record or recipient was used. No password, session, provider credential, customer-link token or message body was logged as verification evidence.
- PostgreSQL/Redis deployment IDs remain unchanged. No schema migration, provider-key rotation, SSH access registration or production deployment occurred in this section. Production remains empty and the code gate rejects external non-staging environments even with the flag enabled.

This test establishes actual provider acceptance and a working customer view, not delivery/rendering in a human inbox. Use an inbox you control to review the email's visual appearance and links. Resend's test-address simulation does not establish bounce/complaint webhook integration.
