# Post-job thank-you with optional external review link

Status: connected implementation, November 25, 2026. The approved canonical card now prepares, publishes and edits the live post-job workflow. Additive migration `202611250001_post-job-thank-you.ts` is applied locally. Automatic customer sends require explicit publication; diagnostics used disposable data and fake transports, with no real workflow publication or customer email.

## Proposed customer experience

“Two days after a job is finished, email the customer a thank-you.” An optional company-supplied external review link can add a review request.

Default to two calendar days at 9 AM in workspace timezone, including weekends. Allow an editable 1–30 calendar-day delay and send time. Default workflow title: Post-job thank-you. The workflow applies to future completions across workspace services; do not backfill previously completed jobs. Recipient is the Job's currently linked customer, never an inferred free-text contact. Email only, with no staff recipient picker or In-app switch for the customer send.

The user reviews the timing, message preview and an optional exact external review URL, then publishes once to authorize future automatic emails. Chat confirmation cannot publish. The assistant shows its suggested neutral thank-you wording and explicitly asks whether to use it, revise it or write a custom message. Neither choice is preselected for a new workflow. The review supports a plain-text custom thank-you message (1–2,000 characters), preserves that draft when switching choices, and previews the selected wording in the branded email. The greeting, neutral review request/button and company contact footer remain separate from the thank-you paragraph. The published definition stores the resolved reviewed wording; changing a later suggested default does not replace it. Assistant revisions happen during setup only; no model call is needed at execution time.

## Finished-work boundary

The Job must be marked Completed, and any linked nonarchived Work Orders must be Completed or Canceled. A Job that is Completed while linked work is still open waits; its follow-up clock starts when the last open linked Work Order closes. If there are no linked Work Orders, the clock starts at the Job completion event. This avoids thanking a customer while recorded work is still unfinished.

Use source events to establish a durable ready-for-follow-up timestamp. Do not infer actual completion from a scheduled visit date. Reopening/canceling the Job or reopening/adding an open linked Work Order cancels its pending send. If the work becomes fully finished again before anything was sent, start a fresh delay. Each Job/customer may receive at most one successful follow-up across workflow edits and soft deletion/recreation. A correction or reopen/re-complete after an email was sent does not send another one.

Only future qualifying completion/ready transitions are admitted while the workflow is active. Resume must not replay completions missed during pause. Holds for unfinished work are event-driven, distinct from pausing the workflow, and must not become periodic per-Job checks.

## Message and review link

Subject: Thank you for choosing [Company]

Hi [Customer first name],

Thank you for choosing [Company]. We appreciate the opportunity to help.

(Only when an external review link is supplied and the customer is eligible:)
We’d love to hear about your experience.

[Leave a review]

If you need anything else, call [Company phone] or email [Company email].

Reuse the established branded email shell, embedded logo and saved company phone/email. Do not suggest replying to the email, include internal Job titles/notes/IDs, insert staff-only links, promise an outcome, invent a review destination or claim a review has been submitted. The request is neutral and shown to every eligible customer; it is not conditional on a satisfaction score.

For an external review request, the company supplies an exact public HTTPS review URL. Show its destination in the preview, validate URL syntax/protocol/credentials, and never fetch arbitrary destinations during setup or send. A blank link is valid and publishes a thank-you-only workflow. A supplied nonblank link must pass validation before publication; no guessed Google profile, API integration or default external destination. Without a valid link, omit the review request sentence, button, destination and preview-version controls. Clearing an existing link removes that request from the preview and saved definition. The assistant must not require a link or imply that SalesMora hosts or tracks reviews. This release saves the optional destination in the reviewed workflow definition; it does not add a shared company review-profile setting. Company phone/email setup continues to require existing business-settings authority. Changing contact settings cannot silently retarget the workflow’s external review link.

When a link is provided, limit review requests to one per customer/workspace every 90 days, independent of workflow recreation. A subsequent eligible Job inside that window sends a thank-you without the review request/button. Preview both variants and state this briefly in the workflow review when an external link is present. Without a link, show only the thank-you preview and do not claim a review request will be sent. This does not detect whether the customer actually wrote a review, and no follow-up review-request chase is included.

Use an explicit thank-you/review email opt-out purpose, distinct from visit reminder and repeat-service preferences. Honor any genuinely applicable global suppression; never reinterpret an unrelated unsubscribe as a newly granted preference. Include a token-confirmed public opt-out with existing no-referrer/noncacheable/token-log-suppression patterns.

## Setup, lifecycle and staff feedback

The canonical review should expose name, delay, send time, customer audience and optional external review link, with an expandable branded preview. Default-name/time/recipient/message behavior must be explicit and idempotent across planner, tool and data validation. Preparing a review saves only a draft. Missing sender/company contact configuration should be actionable through the current shared contact setup; absence must not cause the assistant to merely offer to prepare a card.

Reuse Edit/Save, Pause/Resume and typed-confirm Delete. No creation Test step or Run now. One active/paused workspace-wide post-job follow-up rule avoids overlapping customer messages and counts toward the existing Free 2 / Standard 10 / Premium 25 capacity. Changes apply only to eligible unsent work; do not relabel or replay a completed receipt.

At send time, recheck active workflow/version, publisher authority, current finished-work state and ready timestamp, customer relationship/archive/address/preferences, sender/contact readiness and any reviewed external link. Missing/unavailable customer data or exhausted delivery retries skip sending and notify the publisher once with an Open job action. Respect current Job access and omit private contact/notes from staff notification payloads. A changed customer/contact/message during a transport retry must not reuse a key with a different payload.

## Efficient architecture

Extend the existing Job completion and Work Order state/membership adapters with indexed, scoped projections and transactional PostgreSQL outbox/BullMQ tickets. Persist the ready period and per-Job/customer receipt; claim the customer-level review-request cooldown under workspace serialization so simultaneous completed Jobs cannot both include the request. Reuse the existing configured sender, branded rendering, persisted retries and stable provider idempotency boundary. Do not claim exactly-once SMTP delivery.

Use React Query for current setup, local fields until explicit save and one shared request authorization. No per-field authentication/queries, workspace-wide scans on a timer, per-workflow polling or runtime model calls. Publisher setup must require the established customer-email authority and workspace-wide Jobs, Work Orders and Customers read access, in addition to workflow publication. Customer emails must never reuse staff-only notification renderers or record links.

## Delivery checkpoints

1. Review the delay/time default, finished-work boundary, 90-day request cooldown and exact review-link setup.
2. Build one canonical review/settings card and both branded message-preview variants, plus current NotificationMenu skip-alert stories. Verify missing setup/contact, absent or invalid optional links, cooldown, paused editing, permissions, expiry, errors and mobile. Review this UX before runtime coding.
3. Connect typed contracts, additive persistence, scoped source adapters, deduplicated delivery/cooldown/preferences and current-authority checks. Integrate the approved card/edit path, then Workflows-only assistant preparation and the shared automation guide.
4. Verify completion/reopen/cancel/re-complete, linked work readiness, no historical backfill, current customer changes, concurrent cooldown claims, stale review/link/version, preferences, tenant isolation, quota/lifecycle, retries and queue recovery. Use disposable synthetic records, fake email, a real Redis rehearsal and authenticated/public browser checks. Do not publish a real workflow, change a real Job or contact customers for diagnostics.

## Prototype checkpoint — November 25, 2026

Canonical UI lives in `apps/web/src/features/workflows/workflow-post-job-review/`:

- `workflow-post-job-review-card.tsx`: explicit default/custom choice, retained custom draft, delay/time/optional external-link controls, pause-preserving editing, read-only/expired/saving/error states and publication callback carrying resolved wording.
- `post-job-review-email.tsx`: branded plain-text preview, separate review request and thank-you-only variants, company phone/email and purpose-specific opt-out label. It renders no internal Job details.
- `workflow-post-job-review-card.stories.tsx`: 27 stories including assistant composition and mobile. The assistant story demonstrates the wording question; it does not connect a planner or invoke a model.
- `post-job-notification.stories.tsx`: three stories using the existing NotificationMenu, including Open job and removal after reading.

Review: http://127.0.0.1:6006/?path=/story/workflows-post-job-thank-you--choose-message

Custom preview: http://127.0.0.1:6006/?path=/story/workflows-post-job-thank-you--mobile

Verification: 30 Storybook interaction/accessibility checks, web type check, scoped ESLint and whitespace checks. Desktop and 390px phone layouts visually reviewed, with no horizontal overflow. Synthetic sample contacts/links only; no customer sends or real Job changes.

This prototype checkpoint was approved for runtime integration. Its canonical card is reused by live assistant drafts and workflow editing; the additional connected stories mock the actual API orchestration rather than copying markup.

## Connected implementation — November 25, 2026

- `post_job_thank_you` is a typed email-only recipe. Preparation persists a 15-minute review, proposes wording and asks the user to select default/custom; publication requires the resolved explicit choice. Timing, custom plain text and optional HTTPS destination are validated again on save. Partial assistant edits preserve unchanged settings.
- PostgreSQL source adapters track the finished-work period for the affected Job. New qualifying completion transitions schedule a `post_job` step; open/reopened work cancels it. Existing fully finished Jobs are not initialized on publication or resume. Calendar-day due times use the workspace timezone and the established DST-safe local-time conversion.
- `postJobPeriods`, `postJobDeliveries`, `postJobPreferences` and `postJobNotifications` persist period identity, Job/customer dedupe, retries, review cooldown, opt-out and actionable staff feedback. Preference/cooldown claims and delivery share the existing workspace lock. Review requests are limited across Jobs and workflow recreation; a pending attempted request reserves that choice while its occurrence remains pending. Retries keep a stable Job/customer idempotency key and reject changed payloads or linked customers.
- The existing transactional step outbox/BullMQ worker dispatches each due occurrence. No new periodic workflow scan, runtime AI call, per-field query or authentication loop is added. Settings edits visit only pending Job occurrences. React Query caches one authorized setup read; publication/edits invalidate the workflow list.
- Publisher checks require current workflow publication, assistant use, customer-email authority and workspace-wide Customers/Jobs/Work Orders visibility. One active/paused rule per workspace and current plan capacity are enforced. Pause, resume, typed-confirm delete and edit reuse existing lifecycle controls; no Run now.
- Missing customer/company setup, changed retry payload or exhausted retries produce one current-authorized Open job notification per occurrence. Read notifications disappear from the list. No customer contact details or private Job notes are included in the notification.
- Branded emails use the existing embedded logo and company phone/email. `/thank-you-emails/unsubscribe` is public and informational on GET; its form POST confirms the token-bound purpose-specific opt-out. Pending and future thank-you emails are suppressed. Visit/service preferences remain separate. Routes are noncacheable, no-referrer, noindex and excluded from request-URL logging.
- The Workflows-only assistant and the shared automation guide advertise the recipe. The application does not host, collect or track submitted external reviews.

Validation: 11 isolated post-job database groups; 11 customer-visit and 13 completion-handoff regression groups; real Redis dispatch with a fake sender; synthetic live planner → double-validated persisted review with no publication; authenticated chat/API/public browser delivery, confirmation and paused edit; 33 canonical/connected post-job stories and five guide stories with interaction/accessibility checks. Focused contract/domain/agent/handler/email unit tests, web/data/worker type checks, scoped lint and whitespace checks pass.

Re-run the database scenarios with `pnpm --filter @salesmora/data test:post-job`. Use a disposable test database and fake transport; do not accelerate real customer sends for diagnostics.

Try in Workflows: “Automatically email customers a thank-you at 9 AM two days after the job and linked work are finished. Help me choose the message.” Choose default/custom wording, optionally supply your external review URL and publish. Only subsequent finished-work transitions qualify. All nonarchived linked Work Orders must first be Completed or Canceled. Reopening work cancels a pending send. The default delay is two calendar dates after readiness, not exactly 48 elapsed hours.
