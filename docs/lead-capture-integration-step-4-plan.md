# Lead Capture integration step 4 — public website delivery

Design prepared for implementation review, October 31, 2026. Step 3 implementation approved. Public domain selected by the user: **forms.salesmora.ai**. No DNS, TLS or deployment changes have been made. Domain, challenge provider, initial per-form/IP thresholds and initial business-default assignment are user approved. The user approved the implementation sequence October 31, 2026. Slice 4a was user approved October 31, 2026. Slice 4b was user approved October 31, 2026. Slice 4c hosted rendering/origin isolation was user approved October 31, 2026. Slice 4d durable submission was user approved November 1, 2026. Slice 4e was user approved November 1, 2026; [QA and review notes](lead-capture-integration-step-4e-qa.md) track the checkpoint before 4f.

The user selected `forms-staging.salesmora.ai` for the first rollout November 1, 2026, reserving `forms.salesmora.ai` for production. No external changes have been made.

## Result to deliver

Serve the approved visitor form through a stable hosted URL, iFrame and JavaScript embed. Accept eligible submissions durably, create valid new leads through shared admission, and retain duplicates/corrections/capacity-blocked submissions in Intake Review. Reuse the approved visitor-form and publication-instructions components and prototype screens 20 and 25; preserve the approved application layout.

## Origin and installation artifacts

- Canonical production origin: `https://forms.salesmora.ai`. Generate URLs from validated server configuration and persisted publication keys, never request Host headers or client-supplied workspace IDs. Local tests use explicit local origins.
- Proposed routes: `/f/{publicKey}` for hosted forms, `/embed/{publicKey}` for the embedded form, and `/embed.js` for a small loader that inserts the same isolated iFrame. Both form variants submit to the public origin. The loader does not inspect the customer's page or collect its fields.
- Revisions retain the existing publication key/URL. Public projections expose approved visitor copy, fields, consent and business contact details only. Drafts, workflow/teammate IDs, lead records and internal source history stay private.
- Public routes must work without a workspace session or third-party cookies. Apply origin/route isolation so private application routes and auth actions are not served through the forms domain. Scope session cookies appropriately.
- Embedding permits the intended third-party parents. Resize messages must validate the exact forms origin, expected iFrame window and bounded message shape. Do not use wildcard messages carrying visitor answers. Resolve CSP/frame policy and hostname routing in the implementation plan.
- Live installation instructions become available only after the canonical origin and deployed delivery path are verified. Existing fixtures remain explicitly simulated.

## Availability and submission transaction

1. Resolve the publication key to its owning workspace/source. Render only the currently approved immutable configuration; never use a mutable draft. Keep availability responses uncached so pause, archive, suspension and entitlement loss take effect promptly.
2. Bind each rendered form to its exact publication/configuration version and an expiring server-issued submission context. Recheck operational state inside the workspace-locked submission transaction. A stale version requires a visible refresh path without silently interpreting answers against new fields.
3. Validate bounded answers, field/choice IDs and consent against the bound immutable definition. Retain consent wording/version, original answers and source provenance. Render all submitted text as data.
4. Deduplicate by publication and submission UUID with a canonical payload fingerprint. An identical retry returns its durable outcome; a changed payload conflicts. Never expose private lead/duplicate details in visitor responses.
5. Commit the receipt and either one admitted lead or one pending intake item atomically. Reuse shared lead admission and duplicate policy. At the monthly lead limit, accept eligible intake durably without creating a CRM lead or automatically approving it later. Return success only after commit.
6. Apply approved assignment, starting stage/tags and assigned-teammate notification intent once. Slice 4b supplies the authoritative business-default assignment resolver for publication and scheduling; connect its resolved outcome/version to durable admission in 4d. Use the explicitly persisted unassigned rule when selected; do not treat a missing/invalid rule as unassigned or discard configured tags/notifications. Staff Intake Review actions remain step 6.

## Abuse controls — provider and initial thresholds approved

Keep the approved hidden bot trap, shared server-enforced rate limits and transport deduplication. Define separate challenge and hard rejection thresholds, bounded payload/storage limits, trusted client-address handling and short retention for abuse identifiers. Counters must work across app replicas; browser-only or process-local enforcement is insufficient.

User selected Cloudflare Turnstile October 31, 2026, invoked when server signals require it. Verify tokens server-side and bind verification to the configured hostname/action/submission context. Preserve retry behavior despite single-use challenge tokens. Challenge/service failures preserve visitor input and never fabricate receipt success. Missing production credentials keep challenge-required requests blocked.

User approved these initial submission thresholds October 31, 2026:

- Count new submission attempts per public form and client IP in a rolling ten-minute window. Attempts 1–5 normally use the bot trap and server validation; attempts 6–20 additionally require Turnstile. Reject attempts beyond 20 with HTTP 429 and a retry time, even if a challenge succeeds.
- A filled bot trap is rejected without creating a receipt or reporting success. Treat additional detected abuse as requiring a challenge or rejection; never infer a successful challenge from a client flag.
- Committed identical retries return their existing public receipt outcome without consuming new-submission allowance. Keep general request-level protection on retry lookups. Bind challenge verification retries to the same submission so replay cannot create additional records.
- Keep thresholds configurable and shared across replicas. Use only trusted proxy metadata for client IP, store a keyed digest rather than the raw address in limiter records, and expire limiter records after their enforcement window. Resolve aggregate traffic/storage limits during implementation design; per-form/IP thresholds alone are insufficient for production readiness.

These are approved application defaults, not provider requirements or measured traffic limits. Start with observable counters and review legitimate challenge/rejection rates before tuning them.

## Business-default assignment prerequisite

The October 28 product decision already specifies **Settings → Leads → Default assignment**, with **Leave leads unassigned for manual assignment** or **Assign to one selected teammate**. Capture sources may inherit that setting or select their own teammate. Reuse these approved semantics; do not introduce conditional rules or round robin.

Implement the persisted, workspace-scoped setting and authoritative resolver before enabling inherited-default publication. Use the existing settings authorization conventions, validate the selected teammate's current membership/account availability, and provide a storied settings component before page integration. Launch, scheduled activation and lead admission must use authoritative assignment readiness; notification intent follows the resolved assignee and existing preferences. Preserve the assignment outcome and relevant setting version in admission evidence.

User approved October 31, 2026: initialize new and existing workspaces to the explicit **Leave leads unassigned for manual assignment** rule. Persist the initial rule/version in the forward migration and workspace-creation transaction. Preserve any configured rule if implementation discovers an existing equivalent setting; do not overwrite it. Existing source-specific teammate choices remain source-specific.

Proposed resolver behavior for implementation review: inherited sources resolve the current business setting at admission and retain its version and resolved assignee in provenance. Settings edits do not rewrite historical receipts or published configuration. Source-specific choices override the business default. If a selected teammate becomes unavailable after publication, retain an otherwise eligible submission in Intake Review with an assignment issue instead of silently reassigning or losing it. Missing or invalid rules block publication/scheduled activation; an explicit unassigned rule is valid and creates no assigned-teammate notification.

References checked October 31, 2026: [Turnstile overview](https://developers.cloudflare.com/turnstile/) and [mandatory server-side token validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/). Turnstile can run without moving site traffic to Cloudflare; tokens expire after five minutes and are single-use.

## Implementation and verification checkpoints

Each numbered slice is a review checkpoint. Slices 4a–4e are user approved. The [4f staging-first rollout proposal](lead-capture-integration-step-4f-rollout.md) is the concrete review boundary before external changes. Live hosting verification and activation remain unfinished.

1. **4a — component previews.** Add the Default assignment settings component using existing settings controls and colocated data/stories. Cover explicit unassigned/selected teammate, loading, stale/ineligible teammate, denied/read-only, pending and save failure. Extend the approved visitor form with challenge-required, challenge expired/error, rate-limited and uncertain-response/retry stories. Reuse the existing form rather than creating a second renderer. Deliver component previews for review before page composition.
2. **4b — settings persistence and page integration.** Add strict versioned setting read/save contracts, a forward migration/default initialization, audited workspace-scoped access and the assignment resolver. Compose Settings → Leads using established settings-page conventions and the appropriate existing settings permissions. Connect the page and publication/scheduler readiness to the persisted rule. Verify tenant separation, stale saves, removed teammates and the initial unassigned rule in disposable runtime-role rehearsals.
3. **4c — hosted rendering and origin boundary.** Add canonical public-origin configuration, host/route isolation, safe public projections, version-bound submission contexts and hosted/embed routes using the approved visitor component. Apply explicit frame/CSP/cache policies and protect private routes on the forms host. Delivery readiness remains disabled while submission handling is incomplete.
4. **4d — durable submission and abuse boundary.** Add a public submission contract, shared durable attempt counters and Turnstile verification, receipt idempotency and atomic lead-or-intake admission. Preserve original answers/consent/provenance, starting stage/tags and one notification intent. Test last-slot lead capacity, duplicates, rejected/stale requests and rollback. Denied access incidents must commit their reconciliation state even when no intake is accepted. Do not hold workspace database locks across the external challenge-provider request; recheck the verified binding and source state within the write transaction.
5. **4e — embed loader and real installation projection.** Deliver the small loader, validated resize messaging, real hosted/embed artifacts and connected publication/settings instructions. Verify real browser flows across two distinct local origins with cookies disabled, revision identity preservation, challenge/error states and unavailable lifecycle states. Existing example-domain success fixtures cannot satisfy this checkpoint.
6. **4f — rollout preparation and delivery verification.** Prepare the exact DNS/TLS/service configuration, required secret names, trusted-proxy policy, migration sequence and smoke checks for the approved forms domain. Review the concrete rollout before external changes. Enable production website readiness only when hosting, submission, limiter/challenge credentials, assignment and origin isolation all pass verification.

Implementation defaults proposed for review: limit public submission bodies to 256 KiB plus the existing per-field/count limits; use durable database-backed enforcement across replicas; configure separate aggregate request/storage budgets and refuse production readiness when those budgets or the trusted-proxy policy are unset. Never acknowledge an uncommitted or storage-rejected submission as accepted. Verify that provider verification retries and committed receipt retries remain safe after a crash. Aggregate budget values will be included in the concrete rollout configuration, based on the deployed storage/request envelope.

Verify disposable runtime-role databases and browser flows for hosted/iFrame/loader rendering, approved revisions, unavailable states, cross-workspace isolation, stale forms, consent, duplicate requests, concurrent last-lead capacity, intake fallback, atomic rollback, challenge failures, abuse limits and forged resize messages. Test existing application authentication on its own origin and verify private routes remain unavailable through the public origin. Cover desktop/mobile, keyboard and accessibility behavior.

DNS/TLS/service configuration and a deployment smoke check are a later concrete rollout checkpoint. Keep production website readiness disabled until the complete delivery path and required dependencies are verified. Gmail readiness remains disabled until step 5.
