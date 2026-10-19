# Sign-up, login, and onboarding build tracker

**Current authorization (October 12, 2026):** Owner/Admin/Office/Field are live permission roles. Work profiles are retired; new invitations default to Field. Existing Home/lead/invitation flows enforce saved policies. Older role/profile decisions below are historical; see [live cutover](authorization-live-cutover.md).

**Updated:** October 11, 2026
**Current step:** InvitationAcceptance approved; real local invitation delivery and acceptance connected for review
**Current repository:** Approved registration UI, PostgreSQL/Knex migrations, Better Auth account/session flow, protected setup handoff, independent worker scaffold, and mocked Storybook previews.

This is our working document for the first implementation milestone. We will update it as we install dependencies, build each screen, and verify the complete journey. It narrows the [implementation start plan](implementation-start-plan.md): authentication and onboarding come before lead management and the assistant.

## What we are building first

**New owner:** Register → organization setup → review and create workspace → Home.

**Returning user:** Log in → Home, or resume setup if the owner has not completed it.

**Invited teammate:** Accept invitation → join the existing workspace → Home. Do not send invitees through owner setup.

“Sign up” and “Register” are the same account-creation flow. “Log in” and “Sign in” are the same returning-user flow. Use one route for each: `/register` and `/login`.

Build one component and one screen at a time, then connect each approved feature end to end before expanding to the next feature. Registration now establishes the minimum account/session database foundation; later features add only the models and backend behavior they require. A screen is not marked functionally complete just because its layout works. Home is a minimal destination in this milestone; CRM, campaigns, billing, and AI behavior follow later.

## Progress board

| Step | Work | Status | Visible result / completion check |
|---|---|---|---|
| 1 | Workspace setup and package installation | Done — approved | Web and worker build independently; Storybook runs/builds; lint/typecheck pass; installed versions recorded |
| 2 | Shared branding and account-screen layout | Done — approved | MUI theme, logo, Source Sans 3, reusable fields/buttons, responsive layout |
| 3 | Registration screen | Done — approved | Real local account creation, stored acceptance, session, protected `/setup`, sign-out |
| 4 | Login screen | Done — awaiting approval | Email/password, pending/error states, link to registration and recovery |
| 5 | Organization onboarding screens | Done — approved locally | Business → services/area → optional team → review; back/next preserve input |
| 6 | Real authentication and workspace storage | Done — approved locally | Account/session and transactional workspace creation implemented locally |
| 7 | Verification, recovery, and invitation flows | Done — awaiting local flow review | Local test emails, usable tokens, verification restrictions, correct invitee routing |
| 8 | End-to-end review | In progress — automated checks pass | New owner, returning user, invitee, and unauthorized-access checks pass |

Use **Not started**, **In progress**, **Blocked**, **Done — awaiting approval**, or **Done — approved**. A blocked row names the dependency and the next action. Update the current step, progress board, and activity log after each meaningful work session.

## Working agreement: one component, then one screen

Build and verify one component at a time. Compose and verify one screen at a time. **Pause after each completed setup step, component, or screen for the user to test locally and explicitly approve before starting the next item.** Do not batch-build the registration, login, and onboarding UI before checking the first screen. Shared setup and package installation come first; Storybook must be ready before component delivery begins.

For each component:

1. Record its purpose, current screen need, and expected states in the work queue below.
2. Implement the smallest useful component using MUI behavior, Tailwind classes, and colocated copy data (see [component conventions](component-conventions.md)). Reuse MUI behavior; add a wrapper only for a concrete shared branding or interaction need.
3. Add colocated stories using fictional data and mocked callbacks. Cover applicable default, focus, disabled, loading, empty, validation/error, and permission states; do not invent irrelevant variants.
4. Run Storybook interaction checks for the behavior we own, such as password visibility, form validation, or preventing a second submit. Check keyboard access, accessible labels, focus, contrast, and mobile/desktop layout.
5. Run relevant lint/type checks and Storybook build/checks. Record what passed and any limitations before moving to the next component.

For each screen:

1. Compose the verified components into the actual Next.js route, keeping business logic in the approved server/domain boundaries.
2. Use a screen-level story with mocked dependencies where it helps check form or step states. Stories supplement the real route.
3. Open the actual route and check validation, loading, failure, success, links, back navigation, and responsive behavior. When backend wiring exists, verify persistence, authorization, and redirects in the running app.
4. Add meaningful Playwright journey coverage as routes become functional; do not postpone every browser check to the milestone's last step.
5. Record a concise review handoff with the route/story, checks run, and next item. Mark **UI verified** separately from **Backend verified**. After applicable checks pass, stop for user testing and explicit approval before starting the next item. If the user requests a change, apply it to the current item before expanding scope.

Storybook uses the same theme, font, and providers as the application and no live credentials or production services. Component interactions are checked in Storybook; real authentication, database effects, email tokens, and tenant boundaries require integration/browser checks. A visual pass alone does not satisfy those checks.

### Sequential work queue

This is an initial order, refined only when the current screen reveals a real dependency. Onboarding items are steps within the accepted Screen 02 flow, not extra onboarding pages.

| Order | Component or screen | Status | UI verified | Backend verified |
|---|---|---|---|---|
| 1 | Shared theme/font/logo foundation (included with AccountLayout) | Done — approved | Passed | N/A |
| 2 | AccountLayout | Done — approved | Passed | N/A |
| 3 | Shared TextField (text/email) | Done — approved | Passed | N/A |
| 4 | PasswordField with visibility control | Done — approved | Passed | N/A |
| 5 | SubmitButton with pending/disabled state | Done — approved | Passed | N/A |
| 6 | TermsAcceptance | Done — approved | Passed | N/A |
| 6a | FormFeedback | Done — approved | Passed | N/A |
| 7 | RegistrationForm and `/register` screen | Done — approved | Passed | Passed for local registration; verification deferred |
| 8 | Login form, then `/login` screen | Form approved; screen awaiting approval | Passed | Real sign-in verified |
| 9 | OnboardingStepFrame | Done — approved | Passed | N/A |
| 10 | BusinessProfileStep | Done — approved | Passed | Saved in workspace |
| 11 | ServicesAreaStep | Done — approved | Passed | Saved in workspace |
| 12 | TeamStep with invitation entries | Done — approved | Passed | Invitations queued; delivery pending |
| 13 | ReviewStep summary and explicit confirmation | Done — approved | Passed | Real creation connected |
| 14 | Complete `/setup` screen and minimal Home handoff | Done — approved locally | Checks recorded below | Workspace transaction and protected Home |
| 15 | Verification, recovery/reset, invitation acceptance screens, one at a time | Local recovery/reset implemented; awaiting approval; verification notice awaiting approval; invitation delivery pending | Recovery/reset passed | Local reset flow passed |

Use the work queue for UI order and the progress board for milestone/backend dependencies. Backend foundations begin with registration, then each approved feature is connected individually; update each row’s backend verification as it passes. Record actual component names/story links when files exist. Do not create a generic component library beyond the current screen's needs.

## Package installation checklist

Use **pnpm** to install npm-registry packages, as approved in the architecture. Keep one root `pnpm-lock.yaml`; do not mix npm/yarn lockfiles or globally install application dependencies. Resolve a compatible set of versions before installation, pin runtime/package-manager versions, and record actual installed versions below. Installed versions are recorded at the end of this document.

| Packages / tooling | Location | Why we need them | Timing / status |
|---|---|---|---|
| `next`, `react`, `react-dom` | `apps/web` | App Router, routes, layouts, rendering | Step 1; installed |
| `typescript`, `@types/node`, `@types/react`, `@types/react-dom` | Relevant workspace dev dependencies | Type checking | Step 1; installed |
| `eslint`, `eslint-config-next` | Root/web dev tooling as configured | Code checks | Step 1; installed |
| `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled` | Shared UI; web where directly imported | Components, icons, default styling engine | Installed; theme wiring follows approval |
| `@mui/material-nextjs`, `@emotion/cache` | `apps/web` | MUI App Router style/cache integration | Installed; theme wiring follows approval |
| `zod` | `packages/contracts` | Shared input validation at server boundaries | Installed; schemas follow with forms |
| `tsx` | Worker/dev tooling | Run TypeScript worker during development | Step 1; installed |
| `knex`, `pg`, `@types/pg`, `tsx` | `packages/data` | PostgreSQL queries and migrations | Installed: Knex 3.3.0, pg/@types 8.23.1, tsx 4.23.15 |
| `better-auth`, `server-only` | `apps/web/src/server/auth` | Account/session lifecycle and server-only boundary | Installed: Better Auth 1.7.7, server-only 0.0.1 |
| Selected unit-test runner | Workspace dev tooling | Auth/domain validation and policy checks | Select in Step 1; installed |
| `@playwright/test` | Web dev tooling | Browser journey verification | Installed; journeys follow functional routes |
| Storybook, compatible Next.js integration, and interaction/accessibility test tooling | UI/web dev tooling | Component states, interactions, accessibility checks, screen mocks | Install/configure in Step 1; installed |
| `resend` | Server-side mail adapter | App email in deployed environments | Step 7 when adapter is wired; not installed |
| Local SMTP adapter package, if required | Server-side mail adapter | Deliver verification/recovery/invitation mail to Mailpit | Select before Step 7; not installed |

Source Sans 3 is a locally bundled font asset with its license; it does not require a font npm package. Workspace packages are linked locally and declare their own direct imports. PostgreSQL, Redis, Mailpit, and optional MinIO are infrastructure services, not npm modules.

BullMQ/Redis clients, OpenAI/LangChain/checkpointer packages, embeddings support, Stripe, Gmail, and object-storage SDKs remain part of the broader architecture. Install them when their implementation begins rather than treating them as required to render registration. This milestone must still be compatible with the separate worker and PostgreSQL/Knex boundaries.

Installation verification: frozen-lockfile reinstall, dependency/peer compatibility check, lint, typecheck, and production builds. Record commands that actually work in README after the scripts exist; proposed commands are not evidence of successful setup.

Official references for package setup: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation), [MUI Next.js integration](https://mui.com/material-ui/integrations/nextjs/), and [Knex installation](https://knexjs.org/guide/). Recheck compatible versions when installing, including MUI's version-specific App Router import path.

## Screen-by-screen checklist

### Shared account layout

- [ ] Shared auth layout and onboarding layout use approved Mosaic assets, Blue & Seafoam, and Source Sans 3.
- [ ] Use MUI components and `@mui/icons-material`; no favicon assets, routes, or metadata.
- [ ] Labels, keyboard focus, password visibility controls, error messages, and mobile layout work.
- [ ] Loading/submitting states prevent accidental double submission and preserve useful input after errors.

### Registration — `/register`

Reference: [registration prototype](../prototype/prototype-screen-01-register.html).

- [x] Name, work email, password, confirmation, and terms acceptance.
- [x] Field validation, password mismatch, server error, submitting and success states.
- [x] Return link to `/login`.
- [x] Successful owner registration enters `/setup`; show verification notice without blocking setup.
- [x] Server validates inputs and handles repeated requests safely; never persist/log plaintext passwords.
- [x] Record accepted terms version/time. Draft legal copy must not be represented as launch-approved terms.

### Login — `/login`

Reference: [sign-in prototype](../prototype/prototype-screen-01.html).

- [ ] Email/password fields, registration link, recovery entry, submitting/error states.
- [ ] Real session creation, logout, expiry/revocation, protected-route checks, and safe redirect handling.
- [ ] Completed owner → `/home`; unfinished owner → `/setup`; invitee → invitation acceptance/existing workspace.
- [ ] Invalid credentials produce a safe error; enforce rate limiting and server-side authorization.

### Organization onboarding — `/setup`

Reference: [Screen 02](../prototype/prototype-screen-02.html) and [accepted onboarding decisions](first-login-onboarding.md).

- [ ] Business: require name and trade/business type.
- [ ] Services/area: require at least one fixed service; ZIP/postal code and typical service range are optional.
- [ ] Team: optional invitations with skip; default role Member and profile Office; allow explicit Admin and optional Field.
- [ ] Review: show submitted information, allow corrections, require explicit workspace creation.
- [ ] Preserve steps on back/next and persist resumable non-sensitive setup data once backend wiring is complete.
- [ ] Create organization, Owner membership, profile/services, and queued invitations consistently; retries cannot duplicate the workspace.
- [ ] Queue invitations until both workspace creation and email verification are complete.
- [ ] Continue to role-aware `/home`. Do not add a welcome screen, source setup, or a separate onboarding checklist.
- [ ] Completed users cannot accidentally create a second workspace by revisiting setup.

### Supporting auth flows and Home handoff

- [ ] Verification notice, resend, expired/used-token states, and verified success state.
- [ ] Password recovery/request and reset screens; generic request acknowledgment, expiring single-use tokens, secure session handling.
- [ ] Invitation acceptance validates recipient, organization, assigned role/profile, expiry, and replay behavior.
- [ ] Invitees enter the existing workspace without owner onboarding.
- [ ] Minimal authenticated Home shows the correct business/user context and verification status.
- [ ] Gmail connection and invitation sending are blocked server-side until verification; Gmail itself is not built in this milestone.
- [ ] Local verification/recovery/invitation mail goes to Mailpit; Resend production overages remain disabled when configured.

## Backend decisions to record before real account wiring

| Decision | Current state | Needed by |
|---|---|---|
| Node/pnpm/framework/UI version set | Installed and checked; versions recorded below | Step 1 |
| Unit-test runner | Vitest 5.0.3; real auth journeys currently use Playwright | Step 1 |
| Auth/session implementation and PostgreSQL adapter fit | Better Auth 1.7.7 with pg pool; Knex owns migrations | Registration |
| Password policy, account enumeration controls, session/token lifetimes | 8–128 characters, seven-day sessions, safe UI errors and database rate limits; immediate sign-in means duplicate HTTP responses remain distinguishable; revisit with verification before launch | Registration / launch |
| Account, organization, membership, setup-draft, token, invitation and audit schema | Account/session/verification/rate-limit tables implemented in Knex; acceptance stored on user. Organization/membership/drafts/invitations follow their features | Incremental |
| Local mail adapter and deployed sender configuration | Mailpit/Resend selected; adapter details pending | Step 7 |
| Final terms/privacy wording | Legal review pending; development copy may be labeled draft | Customer-facing launch |

Choose routine implementation details within the approved stack, document the rationale, and raise a user decision only when a material product trade-off requires it. Keep infrastructure recovery and launch gates in the broader plan; they do not prevent initial screen review.

## What counts as complete

- [ ] Clean checkout installs and builds using documented commands.
- [ ] Each delivered component has relevant Storybook states and completed interaction/accessibility review; Storybook builds successfully.
- [ ] Screens were assembled and verified sequentially in actual routes; UI and backend verification are recorded separately.
- [ ] New owner registers, completes the accepted setup, confirms creation, and reaches their workspace.
- [ ] Returning users log in and reach the correct destination; unfinished setup resumes.
- [ ] Verification, recovery, logout, expired tokens, duplicate submits, and invitations behave correctly.
- [ ] Two fictional organizations prove tenant isolation; clients cannot select their own privileged role or verification state.
- [ ] Invitees avoid owner onboarding, and invitations are sent only after verification/workspace creation.
- [ ] Browser review covers desktop/mobile, keyboard navigation, validation, and server-error recovery.
- [ ] Automated checks exercise account/session boundaries and end-to-end owner/invitee journeys, using local/test data.
- [ ] Tracker records installed versions, checks run, remaining limitations, and the next step.

## Activity log

| Date | Completed | Evidence / next action |
|---|---|---|
| 2026-10-09 | Created the milestone tracker and package inventory; made auth/onboarding the first product increment | Documentation only. Next: verify local Node/pnpm tooling, choose compatible versions, create workspace manifests, install Step 1 packages. |
| 2026-10-09 | Added one-component/one-screen delivery order, Storybook checks, and separate UI/backend verification | Storybook setup moves into Step 1; component delivery begins only after it runs. |
| 2026-10-09 | Installed the workspace and local app/Storybook tooling; added setup-only page/story and worker scaffold | Local checks recorded below; user proceeded to approve AccountLayout implementation. |
| 2026-10-09 | Built AccountLayout and its required shared brand provider/theme/font; registration, login, mobile, and long-content stories | Browser responsiveness, local font loading, keyboard skip navigation, and axe checks passed. User approved AccountLayout. |
| 2026-10-09 | Built shared TextField with nine Storybook examples | Story interactions, axe, keyboard, typing and narrow layout checks passed. User approved TextField. |
| 2026-10-09 | Built PasswordField with eight Storybook examples | Reveal/remask, preserved values, keyboard, disabled controls, autocomplete, mobile and axe checks passed. Awaiting approval before SubmitButton. |

## Installed versions and verification results

Installed for local setup:

| Dependency | Pinned version |
|---|---|
| Node / pnpm | 22.23.3 / 10.34.6 |
| Next.js / eslint-config-next | 16.2.6 |
| React / React DOM | 19.3.0 |
| TypeScript / ESLint | 5.9.3 / 9.39.1 |
| MUI / icons / Next.js integration | 9.5.0 |
| Emotion React / cache / styled | 11.14.0 / 11.14.0 / 11.14.1 |
| Zod / tsx | 4.6.5 / 4.23.15 |
| Storybook / Next.js Vite framework / docs / accessibility addon | 10.6.1 |
| Tailwind CSS / Tailwind PostCSS plugin / PostCSS | 4.3.3 / 4.3.3 / 8.5.29 |
| Vite / Vitest / Playwright | 8.3.4 / 5.0.3 / 1.64.0 |

The manifests and root lockfile contain the full version inventory. Backend/auth/queue/provider modules remain uninstalled until their stages.

Verification: frozen-lockfile offline reinstall, lint, all-workspace typecheck, production web/worker/shared-package builds, and Storybook build. Chromium smoke checks loaded both local routes with no browser runtime/console errors. The worker scaffold started and stopped cleanly. No business tests exist yet; empty suites are not counted as validation.

Compatibility notes: Next.js 16.4 built but failed with Storybook's App Router mocks in the browser; 16.2.6 passes that browser check. ESLint 10 conflicts with declared Next.js plugin peers, so ESLint 9.39.1 is retained despite its deprecation warning; revisit with the integration's next compatible upgrade. Storybook emits nonfatal bundle-size/directive warnings and reports no shared UI stories yet because those components are the next item. pnpm leaves the optional unrs-resolver install script disabled; lint passes using the packaged resolver.

Local review: [app](http://127.0.0.1:3000), [setup story](http://127.0.0.1:6006/?path=/story/setup-workbench-check--ready), and [restart/check instructions](local-testing.md). **Setup approval: received** through the subsequent component discussion. AccountLayout is the current review item; see below.


## Approved component — AccountLayout

**Approved implementation scope:** One reusable account frame, with its necessary theme/font/provider foundation. Form content is supplied through `children`, with configurable title/description and optional footer. No registration/login functionality or routes have been implemented.

- [Registration layout](http://127.0.0.1:6006/?path=/story/account-accountlayout--registration)
- [Login layout](http://127.0.0.1:6006/?path=/story/account-accountlayout--login)
- [Mobile layout](http://127.0.0.1:6006/?path=/story/account-accountlayout--mobile)
- [Long-content layout](http://127.0.0.1:6006/?path=/story/account-accountlayout--long-content)

The app and Storybook use the same brand provider and self-hosted Source Sans 3. AccountLayout loads the approved full logo file from `/branding/salesmora-logo.svg`, served as an unchanged copy of `branding/assets/salesmora-logo.svg`. Font source/license/checksum are bundled under `apps/web/public/fonts/source-sans-3`.

Checks: all-workspace typecheck (including colocated UI stories), lint, production build, and Storybook build. Chromium checks cover 1440px, 768px, 390px, and 320px; local font faces are confirmed loaded; no horizontal overflow; long content scrolls. Skip-link Tab/Enter focuses the main account content. Axe found no violations in the tested registration/login/mobile/long-content previews. These are automated checks plus visual screenshot review, not a claim of exhaustive accessibility certification.

**Local review:** Check desktop split-panel spacing, mobile logo/header spacing, headings, placeholder form area, and long-content scrolling. Placeholder panels are story fixtures, not part of AccountLayout or finished forms. Use Storybook's Accessibility panel for additional inspection.

**User approval:** Received. The user approved AccountLayout and authorized the shared text/email field next.


## Approved component — TextField

**Scope:** One branded MUI outlined input for `text` or `email`, reusable across registration, login, and onboarding. Required fields show MUI’s required marker; optional fields explicitly say “(optional)”. It supports helper text, form-supplied errors, disabled state, autocomplete, and controlled/uncontrolled values. Generated IDs connect the label and helper/error description to the input.

**Validation ownership:** The component displays `error` and `helperText` supplied by its form. It does not invent password/email policies or call account APIs. Native email semantics remain available when `type="email"` is used. Password input is the next separate component, not part of this change.

- [Default text field](http://127.0.0.1:6006/?path=/story/forms-textfield--default)
- [Focused](http://127.0.0.1:6006/?path=/story/forms-textfield--focused), [Filled](http://127.0.0.1:6006/?path=/story/forms-textfield--filled)
- [Optional](http://127.0.0.1:6006/?path=/story/forms-textfield--optional), [Helper text](http://127.0.0.1:6006/?path=/story/forms-textfield--helper-text)
- [Validation error](http://127.0.0.1:6006/?path=/story/forms-textfield--validation-error), [Disabled](http://127.0.0.1:6006/?path=/story/forms-textfield--disabled)
- [Email](http://127.0.0.1:6006/?path=/story/forms-textfield--email), [Controlled](http://127.0.0.1:6006/?path=/story/forms-textfield--controlled)

Checks: all nine stories finished their interaction play functions without browser errors; independent Chromium checks verified typing, controlled values, focus, helper/error descriptions, invalid state, disabled state, optional state, and email autocomplete. Axe found no violations in those previews. Actual Tab navigation passed, and the error example fits at 320px with no horizontal overflow. Lint, typecheck, UI/web/worker builds, and Storybook build pass. Story type-check configuration disables declaration generation; published UI declaration output still builds separately and excludes stories.

**User approval:** Received. PasswordField is the next authorized component.


## Approved component — PasswordField

**Scope:** One branded MUI password input with a 44px show/hide icon button from the approved MUI icon map. Defaults to masked input and preserves the value when visibility changes. The toggle is a non-submit button, supports keyboard activation, exposes its accessible name/state, and is disabled with the input. Both fields share their presentation rules; TextField's text/email API is unchanged.

The caller supplies a label, `current-password` or `new-password` autocomplete intent, and any value/validation/helper text. No password policy, strength meter, password storage, or authentication behavior is introduced.

- [Default](http://127.0.0.1:6006/?path=/story/forms-passwordfield--default), [Filled](http://127.0.0.1:6006/?path=/story/forms-passwordfield--filled)
- [Show and hide](http://127.0.0.1:6006/?path=/story/forms-passwordfield--show-and-hide)
- [New password](http://127.0.0.1:6006/?path=/story/forms-passwordfield--new-password)
- [Validation error](http://127.0.0.1:6006/?path=/story/forms-passwordfield--validation-error), [Disabled](http://127.0.0.1:6006/?path=/story/forms-passwordfield--disabled)
- [Keyboard toggle](http://127.0.0.1:6006/?path=/story/forms-passwordfield--keyboard-toggle), [Controlled](http://127.0.0.1:6006/?path=/story/forms-passwordfield--controlled)

Checks: all eight story play functions completed without browser errors; independent Chromium tests verified show/hide with value preservation, controlled typing, autocomplete, disabled input/toggle, error description, and actual Tab → Enter/Space toggle behavior. Axe found no violations in the tested states. Narrow 320px layout has no horizontal overflow; screenshot reviewed. Typecheck, lint, production workspace builds, and Storybook build pass.

**Local review:** Type a fictional password and toggle the eye icon. Test Tab navigation and Enter/Space on the toggle, then inspect new-password, error, and disabled states. Stories are UI previews and do not create accounts or send passwords to a server.

**User approval:** Received. New component work is paused for the copy/Tailwind refactor below.


## Current review — Copy and Tailwind refactor

**Requested scope:** Pause new component work and update AccountLayout, TextField, PasswordField, and setup previews. Display/accessibility copy and story fixtures now live in colocated data files. Tailwind classes replace component `sx`/inline styling, with shared brand tokens, fonts, breakpoints, and focus styles. Both local runtimes use the same stylesheet and MUI CSS layer integration. See [component conventions](component-conventions.md).

**Review:** Revisit the existing stories above, including mobile, optional, error, disabled, and password keyboard-toggle states. All three components retain their prior approval; this refactor awaits local review. SubmitButton has not started and remains paused until approval.

**Verification:** Lint and all-workspace typecheck pass. Production workspace builds and the final Storybook build pass. All 22 existing stories complete their interaction checks; Axe reports no violations in those previews. Chromium checks confirm field outlines and minimum height, unchanged field geometry, loaded local font, responsive layouts at 1440/768/390/320px without horizontal overflow, skip-link focus, and password keyboard visibility/value preservation. Desktop/mobile screenshots reviewed. The local app responds successfully at port 3000 with shared Tailwind styles and no browser runtime errors; Storybook remains available at port 6006.

**User approval:** Awaiting local review of this refactor. Next component remains paused.


## AccountLayout correction — Approved logo asset

Replaced the embedded SVG reconstruction with an image referencing the approved full logo file. The public asset is byte-for-byte identical to `branding/assets/salesmora-logo.svg`; Tailwind controls only its size and spacing. The image path and accessible name live in `account-layout.data.ts`. New components remain paused.

Verification: lint, workspace typecheck, and Storybook build pass. All four AccountLayout stories complete their interaction checks; the external image loads, matches the approved source byte-for-byte, and appears without horizontal overflow at desktop/mobile widths. Mobile screenshot reviewed; built Storybook includes the identical asset.

## Current review — Standard sizing and typography

Added the sizing/typography standard to the brand guide and shared Tailwind theme. AccountLayout uses named heading/form/brand/reading/logo tokens and the default spacing scale. Removed its arbitrary numeric classes, negative logo offset, and bespoke panel ratio. Desktop panels now use equal columns; form width is 448px, page headings 30/36px, display headings 48/60px, and the logo image box 224px wide. Decorative placement uses standard half transforms. Field preview widths use the same form token. The long-content story uses viewport height to exercise scrolling. This intentionally adjusts the layout to a repeatable scale and awaits local review; new components remain paused.

Verification: lint, all-workspace typecheck, and Storybook build pass. All 22 stories complete interactions and Axe checks with no reported violations. Browser checks verify actual heading sizes/line heights, 224px logo width with zero negative margin, equal desktop panels, responsive form widths, and no horizontal overflow at 1440/1024/900/768/390/320px. Skip-link focus and password keyboard/value behavior pass. Desktop/mobile screenshots reviewed. Awaiting user approval of the standardized layout.


## Current component review — SubmitButton

**Prior approval:** The user authorized the next component, approving the copy/Tailwind, approved-logo, and standardized-layout updates.

**Scope:** One shared MUI submit button using Tailwind's standard spacing and brand colors. Label and pending wording are configurable; default pending text and fictional story copy live in `submit-button.data.ts`. Defaults to full width, uses a native submit button, and disables activation while pending or explicitly disabled. Pending state is owned by the form; no network/authentication behavior is included. The spinner respects reduced motion.

Stories: Default, Pending, Disabled, Keyboard, Submit Once, and Long Label. Submit Once is a local example of a form setting pending after submission, preventing another button activation. The eventual form/server must still handle request state and duplicate requests.

**User approval:** Awaiting local testing. Next item remains terms acceptance/form feedback, one component at a time.

**Verification:** Lint, all-workspace typecheck, UI declaration build, and Storybook build pass. All 28 existing/new stories complete their play functions, and Axe reports no violations in the tested previews. SubmitButton checks cover disabled/pending activation, native submit type, Enter/Space activation, one activation on double click when the example form enters pending, 320px long-label wrapping without overflow, and standard 48px single-line height. Browser keyboard focus and reduced-motion spinner behavior verified. Default/pending/disabled/mobile screenshots reviewed. No backend submission behavior is claimed.

**Local review:** [Default](http://127.0.0.1:6006/?path=/story/forms-submitbutton--default), [Pending](http://127.0.0.1:6006/?path=/story/forms-submitbutton--pending), [Disabled](http://127.0.0.1:6006/?path=/story/forms-submitbutton--disabled), [Keyboard](http://127.0.0.1:6006/?path=/story/forms-submitbutton--keyboard), [Submit Once](http://127.0.0.1:6006/?path=/story/forms-submitbutton--submit-once), [Long Label](http://127.0.0.1:6006/?path=/story/forms-submitbutton--long-label). Awaiting explicit approval before starting another component.


## Current component review — TermsAcceptance

**Prior approval:** SubmitButton approved by the user.

**Scope:** One controlled, required MUI checkbox with linked terms/privacy wording, form-supplied helper/error state, disabled state, and a 44px checkbox target. The parent owns acceptance state and validation. Document URLs are required props; links remain available when the checkbox is disabled. Visible/accessibility copy lives in `terms-acceptance.data.ts`; styling uses Tailwind brand tokens, standard spacing, and the shared focus ring. Checkbox acceptance is never preselected by the component.

Stories: Default, Checked, Disabled, Validation Error, Helper Text, Keyboard, and Document Links. Story callbacks mock document navigation; this step does not implement legal pages or persist agreement/version timestamps.

**User approval:** Awaiting local review. After approval, form feedback is the next separate component.

**Verification:** Lint, all-workspace typecheck, shared UI declaration build, and Storybook build pass. All seven TermsAcceptance stories complete their interaction checks; Axe reports no violations in those previews. Chromium verifies the complete accessible name, required/error descriptions, unchecked/checked/disabled states, primary-blue checked color, 44px target, visible checkbox/link focus rings, Space/Tab navigation, links that do not toggle acceptance, and no horizontal overflow at 320px. Desktop and mobile screenshots reviewed. Existing account layout/field sizing, skip-link focus, and password keyboard checks also pass.

**Local review:** [Default](http://127.0.0.1:6006/?path=/story/forms-termsacceptance--default), [Validation Error](http://127.0.0.1:6006/?path=/story/forms-termsacceptance--validation-error), and [Document Links](http://127.0.0.1:6006/?path=/story/forms-termsacceptance--document-links). Awaiting explicit approval before another component starts.

**TermsAcceptance alignment correction:** Label uses Tailwind's standard 24px line height and 10px vertical padding, aligning the first line's center with the checkbox icon inside its 44px target. Wrapped lines continue below the first line. Chromium confirms matching centers and no overflow at 800px and 320px; mobile screenshot reviewed. No arbitrary pixel offsets were added. Awaiting component approval.


## Current component review — FormFeedback

**Prior approval:** TermsAcceptance and its label alignment approved.

**Scope:** One MUI feedback panel for form-level error and success messages, using shared Tailwind tokens/spacing and icons from the approved icon map. Copy and story fixtures live in `form-feedback.data.ts`. Caller supplies the message and may override the default title. Errors use `alert`/assertive announcements; success uses `status`/polite announcements. Both connect the accessible title/description and use atomic announcements. The form decides when feedback is rendered and owns request state and recovery. No dismiss/retry actions or account logic are added.

Stories: Error, Success, Default Success Title, Custom Error, and Long Message. All messages are fictional previews.

**User approval:** Awaiting local review. Registration form composition is the next item after approval.


**FormFeedback verification:** Lint, all-workspace typecheck, UI declaration build, and Storybook build pass. All five feedback stories complete their interaction checks; Axe reports no violations in those previews. Checks verify alert/status roles, assertive/polite and atomic announcements, connected accessible titles/descriptions, custom/default titles, semantic red/green borders, white surfaces, and mobile wrapping with no overflow at 320px. Desktop/mobile screenshots reviewed. Existing layout, skip-link, and password keyboard checks also pass. Live-region configuration is verified; actual assistive-technology announcements have not been manually tested.

**Local review:** [Error](http://127.0.0.1:6006/?path=/story/forms-formfeedback--error), [Success](http://127.0.0.1:6006/?path=/story/forms-formfeedback--success), [Long Message](http://127.0.0.1:6006/?path=/story/forms-formfeedback--long-message). Awaiting user approval before registration form work.


## Component folder organization

Moved AccountLayout, TextField, PasswordField, SubmitButton, TermsAcceptance, and FormFeedback into individual folders containing each component's source, data, and stories. Updated relative imports and package exports; shared field classes remain at the forms level. Public `@salesmora/ui` imports and Storybook titles/URLs are unchanged. No new component or screen work is included. FormFeedback still awaits approval.

Folder-refactor verification: lint, all-workspace typecheck, UI declaration build, and Storybook build pass. All 40 stories load from the new paths and complete their existing interaction checks. Responsive layout, field geometry, skip-link focus, and password keyboard checks pass. Restarted Storybook to clear its stale file-move index; it is running locally at port 6006 with the original story URLs.


## Current component review — RegistrationForm

**Prior approval:** FormFeedback approved.

**Location:** `apps/web/src/features/auth/registration-form/`, with source, copy data, stories, and UI validation colocated. Product-specific form logic stays out of the generic UI package. Existing controls are composed with standard Tailwind spacing; no new npm packages were needed.

**Scope:** Required name/work email/password/confirmation/terms, prototype email checks and eight-character password minimum, matching passwords, first-invalid-field focus, errors that update as corrected, pending/duplicate-activation guard, failure and retry, and success feedback. Terms/privacy URLs and an async submission callback are injected. Name/email are trimmed; passwords are preserved exactly; confirmation is excluded from the callback payload. Failed submissions retain inputs. Success clears password/confirmation and keeps the completed form disabled. Returned server messages render as plain text; thrown exceptions show a generic message.

**UI only:** Storybook submissions and legal links are mocked and explicitly labeled. No account APIs, sessions, persistence, redirects, or legal pages are added. The eight-character rule comes from the existing registration prototype and needs authoritative server validation when authentication is wired. The form does not assert any final legal/version policy. The `/register` screen and `/setup` redirect are later items.

Stories: Default, Required Validation, Invalid Email, Short Password, Password Mismatch, Terms Required, Pending, Server Error, Thrown Error, Success, Retry, Keyboard Submit, Validation Recovery, and Normalized Submission.

**Shared correction:** Disabled field helper text uses the muted text token to retain readable contrast while pending/success.

**User approval:** Awaiting local review of the form. After approval, compose only the `/register` screen.


**RegistrationForm verification:** Lint, all-workspace typecheck, and Storybook build pass. All fourteen registration story play functions complete; Axe reports no violations in those previews, including pending and success with disabled fields. Tests verify empty/invalid/short/mismatched/unaccepted submissions do not invoke the callback, first-error focus, correction/revalidation, single callback during pending, retained inputs after failure, returned and thrown failures, successful retry, Enter submission, normalized name/email with unchanged password characters, excluded confirmation, and cleared passwords after success. Independent Chromium checks verify autocomplete, initially unchecked terms, retained name/email/terms after failure, and no horizontal overflow in default/error/pending/success previews at desktop/320px. Screenshots reviewed. Existing layout/field/skip-link/password keyboard checks pass. These are UI and mocked-callback checks; backend remains unimplemented.

**Local review:** [Default](http://127.0.0.1:6006/?path=/story/auth-registrationform--default), [Validation](http://127.0.0.1:6006/?path=/story/auth-registrationform--required-validation), [Pending](http://127.0.0.1:6006/?path=/story/auth-registrationform--pending), [Server Error](http://127.0.0.1:6006/?path=/story/auth-registrationform--server-error), [Retry](http://127.0.0.1:6006/?path=/story/auth-registrationform--retry), [Success](http://127.0.0.1:6006/?path=/story/auth-registrationform--success). Awaiting explicit user approval before composing the `/register` screen.


## Current screen review — `/register`

**Prior approval:** RegistrationForm approved.

**Scope:** Added `(auth)/register/page.tsx`, page metadata, and the colocated RegistrationScreen source/data/stories under `features/auth/registration-screen/`. Composes AccountLayout and RegistrationForm with the approved logo, shared tokens, sign-in link, preview notice, and local terms/privacy document-availability disclosures. Form success title is configurable so simulated submissions say “Preview completed,” with no false account-creation claim. No new product component or extra auth route is built.

**Preview behavior:** The live route discards submission data and simulates an 800ms pending state before success. Credentials are not sent, logged, or persisted; passwords clear after success. Terms and privacy links target local disclosures, not final legal documents. Sign-in targets `/login`, which is not implemented until the next approved screen. No real accounts/sessions, backend persistence, or `/setup` redirect exist yet.

**Review states:** Default, Mobile, Validation, Pending, Server Error, and Success in Storybook. The actual route exposes validation/pending/simulated success; server failure remains a mocked Storybook state. Repeatable Playwright route tests cover validation, simulated submission, no credential requests, refresh reset, responsive controls, skip-link focus, and document-preview navigation.

**User approval:** Awaiting local review. Next item is the LoginForm, followed separately by the `/login` screen.


**Registration screen verification:** Lint, all-workspace typecheck, production builds (including statically prerendered `/register`), and Storybook build pass. All six screen stories complete their interaction checks; Axe reports no violations in those previews. Four checked-in Playwright tests pass using the project's matching Chromium installation: route validation and simulated submission with no credential mutations, password clearing and refresh reset, 1440px/320px branded controls without overflow, and skip-link/document-preview navigation without accepting terms. The actual Next.js route returns 200 with correct metadata, approved logo, loaded local font, MUI outlines, and Tailwind tokens. Axe finds no violations in main content at desktop/320px. Screenshots reviewed. Live app remains at port 3000; Storybook remains at port 6006.

**Local review:** [Actual `/register` route](http://127.0.0.1:3000/register) and [RegistrationScreen stories](http://127.0.0.1:6006/?path=/story/auth-registrationscreen--default). Awaiting explicit user approval before LoginForm begins.


## Current review — registration connected end to end

**Approval and sequence:** Registration UI approved. User accepted implementing registration end to end before LoginForm. The earlier UI-only registration notes above are historical; the actual route now creates local accounts.

**Implemented:** Isolated PostgreSQL 17 Compose service on 55432; Knex up/down migration; users, credential accounts, sessions, verifications, database-backed rate limits; shared Zod registration contract; Better Auth password/session handling; server-owned acceptance version/time and pending onboarding state; real `/register` POST; authenticated `/setup` handoff; sign-out and server session checks. Unverified users can access only this handoff in the current implementation; no business workspace exists yet.

**Scope:** No LoginForm, business onboarding, organization models, email delivery, recovery, invitations, or public deployment added. Storybook submissions remain injected mocks. Visible component copy remains in data files and CSS uses Tailwind/shared brand tokens.

**Verification:** See [Registration backend](registration-backend.md) for the final checks and local commands. The migration was tested latest → rollback → latest on `salesmora_test`. Browser/backend tests use a separate app on 3002 and never clear development accounts. Registration form/screen Storybook checks remain mocked.

**Review:** [Create a local account](http://127.0.0.1:3000/register) and follow [the local checklist](local-testing.md#registration-backend-review--register). Awaiting local approval of this slice. Next: LoginForm in Storybook, then the login route, each reviewed separately and connected to the existing auth foundation.


## Current component review — LoginForm

**Prior approval:** User proceeded from the registration backend to LoginForm. Registration uses the configured `127.0.0.1` origin for local testing.

**Location:** `apps/web/src/features/auth/login-form/`, containing source, copy data, stories, and UI validation. Reuses TextField, PasswordField, SubmitButton, and FormFeedback. No packages were added. Styling uses Tailwind and existing brand tokens.

**Scope:** Required email/password, first-invalid-field focus, correction/revalidation, current-password/username autocomplete, pending controls and duplicate-submit guard, generic error fallback, retained inputs after failure, retry, and success with password cleared. Email is trimmed/lowercased; password characters are preserved exactly. Sign-in checks password presence, not the registration length rule. The parent supplies submission and recovery navigation; Storybook mocks both.

**Stories:** Default, Required Validation, Invalid Email, Password Required, Pending, Server Error, Thrown Error, Success, Retry, Keyboard Submit, Normalized Submission, Existing Password, Validation Recovery, and Recovery Link.

**Review:** [LoginForm](http://127.0.0.1:6006/?path=/story/auth-loginform--default). No `/login` route, real sign-in request, recovery page, or new session is added in this component step. Next, after approval, compose the login screen and connect its submission to the existing auth foundation.


**LoginForm verification:** Lint, all-workspace typecheck, and Storybook build pass. All fourteen login story play functions and Axe checks pass. Independent Chromium checks verify 1440px/320px default/pending/error/success layouts without overflow, username/current-password autocomplete, keyboard order and recovery-link focus/44px target. Desktop/mobile screenshots reviewed. Restarted Storybook so its Tailwind stylesheet includes the new component classes. Storybook is running on port 6006. Awaiting user approval before `/login` screen work.


## Current screen review — `/login`

**Prior approval:** LoginForm approved by the user.

**Scope:** LoginScreen composes the approved form and account layout. Its source, copy, route adapter, and mocked stories live in `features/auth/login-screen/`. The `/login` page checks existing sessions on the server. A same-origin POST to Better Auth starts a real session, then opens the fixed `/setup` destination. Signed-in visits to `/login` or `/register` resume setup. Sign-out and unauthenticated/expired setup visits now lead to `/login`.

Unknown email and wrong password receive the same UI error. Network/service failures show a safe availability message, and 429 responses show a rate-limit message. Failed submissions retain inputs. Password characters are preserved. No redirect URL is accepted from the browser. Recovery links to a local disclosure explaining that reset/email delivery are not implemented yet; account-creation links now work in both directions.

**Stories:** Default, Mobile, Validation, Pending, Server Error, Success. Submissions remain mocked in Storybook. No new npm packages or database migration were needed.

**Review:** [Actual login](http://127.0.0.1:3000/login), [LoginScreen stories](http://127.0.0.1:6006/?path=/story/auth-loginscreen--default). Use an account registered in the local app. Awaiting screen approval before beginning the next onboarding component.


**Login screen verification:** Lint, all-workspace typecheck, production build (including dynamic `/login`), and Storybook build pass. All six LoginScreen story interactions and Axe checks pass. The eighteen-test Playwright suite passes against the isolated test database: seven login journeys plus eleven registration regressions with updated sign-out/protected-page redirects. Login checks include local validation, equal UI errors for wrong password/unknown email, normalized email and unchanged password, real session creation/persistence, signed-in routing, sign-out, pending duplicate prevention, rate limits, safe network/service errors and retry, recovery disclosure, registration navigation, responsive controls, and skip-link focus. The live route on port 3000 returns 200; desktop/320px Axe, loaded logo, no-overflow, and browser-error checks pass. Screenshots reviewed. Awaiting user approval before onboarding work.


## Requested addition — branded 404 page

Added Next.js `app/not-found.tsx` and colocated NotFoundScreen source/copy/stories. Uses the approved logo file, Source Sans 3, named brand typography/width tokens, and Tailwind classes. Provides links to sign in and create an account; no new package or backend behavior is required. The login screen remains at its existing review checkpoint.

Verified actual HTTP 404 status and page title on an unknown URL, loaded logo, desktop/320px layout without overflow, Axe accessibility, visible keyboard focus, and both navigation destinations. Two Storybook previews pass interaction/accessibility checks. Lint, workspace typecheck, and production build pass. Desktop/mobile screenshots reviewed.

Review: [404 page](http://127.0.0.1:3000/this-page-does-not-exist), [Storybook](http://127.0.0.1:6006/?path=/story/pages-notfoundscreen--default).


## Earlier component review — PasswordRecoveryForm

**Direction:** User prioritized password recovery before onboarding. Continue the existing one-component/one-screen approval workflow. The prior login/404 screens remain available locally.

**Location:** `apps/web/src/features/auth/password-recovery-form/`, with source, copy, stories, and UI email validation. Reuses TextField, SubmitButton, and FormFeedback; no new package is needed. Tailwind classes and existing brand tokens handle styling.

**Scope:** Required email, validation/focus, correction/revalidation, normalized submission, pending/duplicate prevention, generic errors with retained email and retry, and generic acknowledgment. Successful requests always say “If an account exists for that email…”; the callback does not expose account-existence fields or arbitrary server messages. The backend must later implement the same policy; this UI check does not establish backend enumeration protection.

**Stories:** Default, Required Validation, Invalid Email, Pending, Server Error, Thrown Error, Success, Retry, Keyboard Submit, Normalized Submission, Validation Recovery.

**Boundary:** Storybook uses mocked callbacks. No recovery route, SMTP package, email, token, or password mutation is added in this component step. Next pieces are the reset-password form and recovery/reset screens, reviewed individually, followed by the complete local Mailpit/token flow using the existing auth library. Do not label the full recovery feature complete until a received link can change the password and expiry/replay/session-revocation checks pass.

**Review:** [PasswordRecoveryForm](http://127.0.0.1:6006/?path=/story/auth-passwordrecoveryform--default). Awaiting form approval before the next component or screen.


**PasswordRecoveryForm verification:** Lint, all-workspace typecheck, and Storybook build pass. All eleven story play functions and Axe checks pass. Independent Chromium checks verify username autocomplete and default/pending/error/success layouts at 1440px and 320px without overflow. Desktop/mobile screenshots reviewed. These checks cover mocked component behavior only; real email delivery, token safety, and password changes remain unimplemented. Storybook remains running on port 6006; awaiting local approval.


## Recovery navigation correction

User reported that the login recovery link did not open the new form. Replaced the temporary `#password-recovery` disclosure link with `/forgot-password`, added a branded recovery page and Back to sign in link, and removed the old login disclosure. Email delivery/reset tokens remain unimplemented, so the actual page clearly says so and disables submission instead of claiming an email was sent. Storybook form examples remain interactive with mocks. Added a caller-controlled disabled state/guard and its story; the dedicated screen has Default/Mobile stories. Updated the existing navigation test to verify the route, notice, disabled submission, and return navigation. The recovery form still awaits approval; this correction does not complete password recovery.


**Recovery navigation verification:** The updated Playwright navigation test passes against the isolated test app. The normal app on port 3000 also passes login → forgot-password → login navigation, mobile layout, and Axe checks. Lint, workspace typecheck, production build, and Storybook build pass. Mobile screenshot reviewed. Email delivery remains pending, with no false success state on the actual route.


## Current review — complete local password reset flow

- User requested the complete reset flow and a dedicated email-template directory. Added `server/email/templates/password-reset/` with copy and HTML/plain-text renderer, plus a local-only SMTP delivery boundary.
- Added Mailpit to Compose and local setup; inbox `http://127.0.0.1:18025`, SMTP `127.0.0.1:11025`. Existing PostgreSQL credentials and accounts remain intact.
- Connected `/forgot-password`, added ResetPasswordForm stories and `/reset-password`, and configured Better Auth for hashed token identifiers, 30-minute expiry, atomic single use, and session revocation. No new migration required.
- Review instructions and verification results: [Password recovery](password-recovery.md). Pause for user review of this flow before building onboarding. Production email delivery remains separate.

Verified: all 25 registration/login/reset end-to-end tests pass, including real SMTP email links, hashed identifiers, expiry, replay, concurrent token consumption, password limits, origin checks, request rate limiting, and session revocation. All 25 recovery/reset Storybook stories pass interactions and Axe checks. Desktop/mobile email and live reset screenshots were reviewed; live reset Axe checks pass. Lint and workspace typecheck pass. Nodemailer 10.0.16 and @types/nodemailer 8.0.2 are pinned. Mailpit v1.27.4 is pinned by digest. Recovery/reset forms remain disabled until hydration so early input cannot be lost.


## Current component review — OnboardingStepFrame

User requested building and reviewing onboarding components one at a time. Implemented only the controlled frame in `apps/web/src/features/onboarding/onboarding-step-frame/`, with source, copy/data, and stories. The real `/setup` handoff remains as-is until its step content is approved.

- Accepted sequence: Business → Services → optional Team → Review.
- Displays current, completed, and upcoming steps with semantic ordered progress; labels remain visible at mobile widths.
- Back is hidden on Business; Team can expose Skip for now; Review requires explicit Create workspace activation.
- Reuses SubmitButton and MUI buttons, brand colors, Tailwind standard spacing/widths, and colocated copy. No new dependency or custom sizing token was needed.
- Parent owns validation, saved values, step state, pending state, and persistence. Children are fields/content, not nested forms. The frame owns the submit form and focuses the new step heading after navigation. Pending disables fields and all navigation; ContinueDisabled leaves Back available.
- Stories use fictional placeholders and callbacks. No business-profile fields, invitation sending, workspace creation, new route, or database mutation is implemented in this component step.

Review: [OnboardingStepFrame — Business](http://127.0.0.1:6006/?path=/story/onboarding-onboardingstepframe--business). Compare Services, Team, Review, Pending, Creating, Continue Disabled, Keyboard Submit, Interactive Navigation, and Mobile. Next component after approval: BusinessProfileStep.

**OnboardingStepFrame verification:** All 10 Storybook stories pass interaction and Axe checks. Lint, all-workspace typecheck, and Storybook build pass. Independent Chromium checks verify 1440px/320px layouts without overflow, standard responsive padding, visible progress labels, and keyboard order. Desktop/mobile screenshots reviewed. Storybook remains running on port 6006. Awaiting frame approval before BusinessProfileStep.


## Current component review — BusinessProfileStep (October 11, 2026)

User proceeded from the onboarding frame and authorized one component at a time. Added `apps/web/src/features/onboarding/business-profile-step/` with source, copy/data, validation helper, and stories.

- Required business name and business type, using the seven existing prototype choices. No extra profile fields or new packages.
- Reuses the approved OnboardingStepFrame and TextField. The native MUI select uses the same exported `fieldClasses` styling utility as existing inputs, avoiding a separate shared select component before it is needed.
- Continue validates both fields, focuses the first invalid field, and passes a trimmed business name. Errors clear as values are corrected. Parent-controlled draft values survive unmounting/remounting between steps; pending disables fields and submission.
- Eleven stories cover Default, Filled, Required Validation, Type Required, Validation Recovery, Whitespace Name, Business Types, Pending, Keyboard Submit, Back And Continue, and Mobile. All callbacks are mocked. The Services content is only a placeholder in the preservation demo.
- Review [BusinessProfileStep](http://127.0.0.1:6006/?path=/story/onboarding-businessprofilestep--default). This component does not change `/setup` or persist data. Backend validation/persistence follows the approved screen composition. Stop here for approval before the Services component.

**BusinessProfileStep verification:** All 11 component stories plus the 10 existing frame stories pass interactions and Axe checks. Lint, all-workspace typecheck, and Storybook build pass. Independent Chromium checks verify 1440px/320px layouts without overflow, required labels and organization autocomplete, native-select typeahead and keyboard order, and validation/fill states. Desktop/mobile screenshots reviewed. No backend behavior changed. Awaiting approval before Services.

### Business type expansion — October 11, 2026

User requested broader business coverage. Expanded BusinessProfileStep from seven to 34 choices, ordered alphabetically with Other service business last. Includes additional home/commercial trades plus automotive, beauty, fitness/wellness, event, pet, IT, and professional services. Existing choice identifiers are preserved. The existing Business Types story exercises every option; validation derives its allowed values from the same data file. Services-step choices remain a separate upcoming review.

### BusinessProfileStep approved — October 11, 2026

User approved the component after expanding business types to 34 choices. Next component: Services and Service Area, using the accepted fixed service options, at least one required service, and optional postal code/service range. Continue one component at a time with Storybook review.


## Current component review — ServicesAreaStep (October 11, 2026)

User authorized the next single component after approving BusinessProfileStep. Added `apps/web/src/features/onboarding/services-area-step/` with source, data/copy, validation, and stories.

- Uses the accepted six fixed service choices: Repairs, Installation, Maintenance, Replacement, Inspection, Other. At least one is required; Other alone is valid. Native checkboxes support multiple selections, keyboard Space, and visible selected/focus styling.
- Optional primary ZIP/postal code uses postal-code autocomplete and accepts international text. Continue trims outer whitespace. Optional range uses the four existing choices: within 10/25/50 miles or multiple regions. Both area fields can remain blank.
- Reuses OnboardingStepFrame, TextField, MUI native select, shared field classes, and brand/Tailwind tokens. No new dependency or custom sizing.
- Parent-controlled values survive step remounting. Continue validates and focuses the first service when empty; errors clear on correction. Back bypasses validation. Pending disables selections, area inputs, and navigation.
- Twelve stories cover defaults, populated values, required validation/correction, Other only, all options/toggling, optional international area, pending, Back, keyboard, preservation, and mobile. Team in the preservation example is a placeholder, not another implemented component.
- Review [ServicesAreaStep](http://127.0.0.1:6006/?path=/story/onboarding-servicesareastep--default). No `/setup` route or database changes in this component step. Stop for approval before Team.

**ServicesAreaStep verification:** All 12 Storybook stories pass interactions and Axe checks, including after refreshing generated Tailwind styles. Lint, all-workspace typecheck, and Storybook build pass. Independent Chromium checks verify 1440px/320px layouts without overflow, optional inputs and postal-code autocomplete, 44px service targets, branded selected state, and visible keyboard focus rings. Desktop/mobile screenshots reviewed. Storybook remains running on port 6006; awaiting approval before Team.

### Business → Services preview navigation corrected — October 11, 2026

User reported that Business Continue stayed on the same component. The Default story previously invoked only a mocked callback. Default, Filled, and Mobile now use a connected local preview with the real ServicesAreaStep. Back And Continue also uses the actual Services component and verifies values on both sides of a round trip. Heading focus follows navigation. Completing Services shows an explicit preview notice that Team is not built and no workspace is saved. Isolated validation/pending stories continue to mock their callbacks.

Verified: all 11 Business stories pass interactions and Axe checks; independent tests of Default validate empty fields, move Business → Services → Back, preserve both steps, and check layout at 1440px/320px. Lint and workspace typecheck pass. This is Storybook composition only; `/setup` remains the protected handoff. ServicesAreaStep still awaits approval.


### ServicesAreaStep revision — searchable multiple selection (October 11, 2026)

User replaced the pill-selection requirement with typeahead, multiple values, and a long available-service list. Added a fixed catalog of 159 services in 21 categories in the component's `service-catalog.data.ts`; existing general-service identifiers remain valid. This supersedes the six-choice pill design above.

MUI Autocomplete searches service names and categories, groups results, permits multiple catalog selections, and prevents duplicate/custom values. Selected services render as a plain list with individual Remove actions; Clear all and a live selection count are available. Keyboard removal returns focus to search. All displayed copy remains in the component's data files, with Tailwind/shared brand styling and no new dependency. Grouped result markup explicitly supplies accessible listbox groups.

Updated Business → Services preview and preservation checks for the new typeahead. Services stories now cover search, cross-category selection, no matches, individual removal/clear-all, no duplicates, keyboard, required validation, optional area, pending and back/forward preservation. ServicesAreaStep remains awaiting approval; no Team, route, or database implementation was added.

**Revision verification:** All 16 Services stories and all 11 Business stories pass interactions and Axe checks. Lint, workspace typecheck, and Storybook production build pass. Independent Chromium checks at 1440px and 320px verify search by name/category, multiple selections, selection preservation, no chips, and no horizontal overflow. Desktop/mobile screenshots reviewed. Storybook remains available on port 6006 for approval.


### Selected-service pills — October 11, 2026

User requested that selected values use wrapping pills with an X instead of separate rows. Updated the selected-service list to branded rounded pills with accessible Remove labels, 44px removal targets, keyboard focus, and wrapping for long labels on mobile. The searchable catalog and multi-select behavior remain in place.

Verified: all 16 Services stories pass interaction and Axe checks; lint and workspace typecheck pass. Desktop/320px checks confirm wrapping pills, 44px X targets, and no horizontal overflow. Mobile screenshot reviewed. Awaiting component approval.


### Services approved; TeamStep review — October 11, 2026

User approved ServicesAreaStep including selected-service pills, then authorized the next component. Added `apps/web/src/features/onboarding/team-step/` with source, copy/data, validation, and Storybook stories. TeamStep is controlled by its parent and collects invitation drafts only.

- Shows the account creator as Owner. Add/remove teammate entries with email, Member/Admin permission role, and separate Office/Field work profile. Defaults are Member and Office.
- No teammates is valid. Added rows require a valid email; Continue normalizes case/whitespace and rejects duplicate addresses and the owner's address. First invalid input receives focus; correction clears errors. Remove returns focus to Add teammate.
- Back and Skip bypass validation; Skip calls a separate parent callback without submitting draft invitations. Pending disables fields and actions. Parent retains drafts during navigation.
- Explains that invitations send only after workspace creation and owner email verification. No invitations, persistence, routes, or Review component implemented in this step; no new dependencies.
- Review [TeamStep](http://127.0.0.1:6006/?path=/story/onboarding-teamstep--default). Stop for approval before Review.

**TeamStep verification:** All 13 stories pass interactions and Axe checks, including the final focus implementation. Lint, workspace typecheck, and Storybook production build pass. Desktop/320px layouts have no horizontal overflow; mobile screenshot reviewed. Storybook remains running on port 6006. Awaiting approval before Review.


### Services → Team preview connected — October 11, 2026

User reported Services Continue did not move forward. Services Default/Filled/Mobile used mocked callbacks, and the Business preview still stopped after Services. Added shared local ServicesTeamPreview composition: valid Continue renders the actual TeamStep, Team Back returns to Services, both drafts survive the round trip, and navigation focuses the new heading. Business preview uses this same composition. Team Continue/Skip reports that Review is next; no workspace is saved or invitations sent. Isolated interaction stories retain callback mocks. Services preservation story now tests the real Team component and invitation draft restoration.

Verified: all 16 Services and 11 Business stories pass interaction and Axe checks, including real Team navigation and draft restoration. Lint, workspace typecheck, and whitespace checks pass. Ready for local review; Team remains awaiting approval.


### Team preview uses signed-in owner — October 11, 2026

User reported seeing `owner@example.com` instead of their registration account. Connected Services/Business previews previously supplied a fixture owner. Added a Storybook-only session bridge and narrow Vite session endpoint proxy to the local Next app. Team Default and connected previews now use `session.user.email`; missing/unavailable sessions show a sign-in prompt without a fixture fallback. Isolated validation stories retain explicit sample identities. The production TeamStep remains controlled by its ownerEmail prop; auth trusted origins and backend permissions are unchanged. No credentials or account records are read from environment files or databases for this preview.

Verified: real unauthenticated session reads through the proxy return null; signed-out UI shows no invented owner. Browser checks with a controlled authenticated session response verify Team Default, Services → Team, heading focus, and owner-email invitation rejection. All 40 Team/Services/Business stories pass interactions and Axe checks. Lint, workspace typecheck, and Storybook build pass. The user's own signed-in browser session remains available for manual review after refreshing.


### Team approved; ReviewStep built — October 11, 2026

User approved Team and requested the next component. Added ReviewStep with its own source, copy/data, and stories. It summarizes business name/type, selected services, optional postal/range, workspace Owner, and teammate emails with separate roles/profiles. Empty area fields and solo setup have explicit summaries. Final Create workspace is an explicit parent callback; pending disables all navigation/edit actions and uses the existing creating state. Creation errors retain the summary for retry. Before creation, existing validators check each draft section and focus the first relevant Edit button if incomplete.

Connected Storybook previews now navigate Business → Services → Team → Review, including Team Continue/Skip. Edit actions open the corresponding real component and return to Review with updated values. All drafts live in the shared preview parent, so editing Business no longer unmounts and loses Services/Team state. Skip excludes invitations from Review but retains the Team draft for Back/Edit. Team/Review use the signed-in owner in connected previews; isolated stories use fixture identities.

No workspace database writes, invitation delivery, Home screen, or `/setup` route changes in this component review. Create workspace confirms the preview and displays an explicit no-write notice. Stop for approval before connecting persistence.


**ReviewStep verification:** All 13 Review stories plus 40 Business/Services/Team stories pass interactions and Axe checks. Lint, workspace typecheck, Storybook production build, and whitespace checks pass. Independent 1440px/320px layout checks confirm no horizontal overflow; mobile screenshot reviewed. Session-driven browser checks verify the Owner email and validated invitation draft reach Review, with heading focus and signed-out prompting. Storybook remains running on port 6006. Awaiting approval before workspace persistence.


### Review approved; workspace creation connected — October 11, 2026

User authorized Create workspace to persist all selected options. Added shared workspace validation/catalogs, an additive migration for workspaces, memberships, services, and queued invitations, a session/origin-protected creation API, and the real controlled `/setup` flow. Owner identity comes only from the authenticated account. The final transaction also marks onboarding complete. Concurrent retries return the same workspace without overwriting it; failures leave no partial workspace. Applied migrations to local development and isolated test databases.

After creation, `/home` displays saved details. Setup/login/registration resume to this protected handoff for completed owners. The full Home product screen is not built. Invitations are saved but not sent: pending verification or queued based on the Owner's verification state. Unfinished drafts remain in memory until final confirmation; refreshing before creation resets the draft. Storybook continues to use isolated previews; real creation is at `http://127.0.0.1:3000/setup`.

See [Workspace creation](workspace-creation.md) for tables, API behavior, local testing, limits, and remaining invitation work. No dependency installation was needed.


**Workspace verification:** The 25 existing auth/recovery tests and nine workspace tests pass across the initial suite and targeted follow-ups. One new retry-test selector was narrowed to the named application alert (excluding Next's route announcer); the final real-creation test allows first-request Home compilation time and passes after the API adapter separation. Workspace tests verify full UI persistence, Owner membership, roles/profiles, skip exclusion, retry, concurrent idempotency, transaction rollback, origin/session/forged-input rejection, canonical values and queue states, membership scoping, and 1440px/320px layouts. All 55 onboarding/flow Storybook stories pass interactions and Axe checks. Lint, workspace typecheck, production app/package build, Storybook build, and whitespace checks pass. Desktop/mobile screenshots reviewed. Port 3000 setup responds normally; local development accounts were preserved. Ready for the user's local app review.

### Standalone Review preview no-op corrected — October 11, 2026

User reported Create workspace appeared to do nothing. Inspection found the standalone Storybook Review Default used a mocked callback without visible feedback; the real app tab was at login. Review Default now uses the connected local preview, so Create displays an explicit preview confirmation and Edit actions navigate to the actual editable steps. The preview still performs no database writes; real creation is available through signed-in `/setup` on port 3000. Browser checks with a controlled session verify confirmation, edit/return navigation, and no workspace API writes; lint/typecheck pass. Awaiting clarification if the reported click occurred in the real app rather than Storybook.


### Workspace creation confirmed; email verification notice — October 11, 2026

User confirmed real workspace creation worked, then authorized email verification one component at a time. Added `apps/web/src/features/auth/email-verification-notice/` with source, data/copy, and stories. The notice shows the supplied account email without an editable recipient and explains that the owner can keep using the workspace while verification is pending, but invitations require verification.

Resend uses an injected no-argument callback. Hydration/pending guards and a synchronous lock prevent duplicate requests; feedback covers sent, service/network errors, rate limits, and already verified. Successful/rate-limited requests start a resend countdown (60 seconds by default, with an optional callback retry-after value). Failed delivery permits retry. Feedback receives focus and uses the approved accessible FormFeedback component; countdown text avoids per-second live announcements. Verified state removes the resend action. Styling uses standard Tailwind/brand tokens; no new package or inline sizing.

Twelve Storybook stories cover default, pending/double click, sent, service/network errors, retry, rate limits, cooldown expiration, keyboard, disabled, verified, and mobile with a long email. This is an isolated preview; no emails, auth endpoint, template, or live route integration were added. Stop for approval before building the branded verification email template and then connecting the backend.

**EmailVerificationNotice verification:** All 12 stories pass interactions and Axe checks after the default mock fix. Lint, workspace typecheck, Storybook production build, and whitespace checks pass. Independent Chromium checks at 1440px and 320px confirm long-email wrapping without overflow, visible keyboard focus, Enter submission, focused feedback, and disabled resend during cooldown. Mobile screenshots reviewed. Manual preview callbacks retain their implementation after Storybook cleanup, so the button remains usable for review. Storybook is available on port 6006; awaiting notice approval before the email template/backend steps.


### Verification notice approved; branded email template — October 11, 2026

User approved EmailVerificationNotice and authorized the next component. Added the verification email renderer, separate copy/data, shared email brand tokens, and five Storybook previews (Default, Long Link, Escaped Link, Plain Text, Mobile). HTML and plain text include a Verify email action, fallback URL, one-hour expiry copy, and the invitation verification requirement. HTTP/HTTPS URLs are validated and escaped.

The email uses the established email-only inline CSS/presentation-table convention for client compatibility; app components continue using Tailwind. The approved SVG logo and local Source Sans 3 font are exported to a transparent PNG with `scripts/export-email-logo.mjs`. Actual mail uses a CID attachment; Storybook uses the public PNG. No new dependencies were installed.

A preview was sent through local SMTP to Mailpit only, addressed to `verification-preview@salesmora.test` (message `MfoovueJPAD6fcY4AmTQQq`). Its link is fictional and cannot verify an account. No authentication hook, token configuration, real resend endpoint, or invitation queue changes are connected in this step. The one-hour text must match the backend expiry when that step is implemented.

**Template verification:** All five stories pass interaction and Axe checks. Separate rendered-email Axe checks and 1440px/320px layout checks pass, with the approved logo loaded, matching action/fallback links, and no horizontal overflow. Mobile screenshot reviewed. Mailpit confirms HTML, plain text, and the embedded PNG. Lint, workspace typecheck, and Storybook production build pass. Review the template before connecting verification to authentication.


### Verification template approved; authentication connected — October 11, 2026

User approved the branded template and authorized continuation. Better Auth now sends verification mail after registration, with one-hour signed links and the approved CID logo attachment. Registration remains usable if local mail is unavailable; explicit resend reports delivery failure. No database migration or new npm package was needed.

Home includes the approved notice with the signed-in email, real resend, and persisted verification status. A `/verify-email` result route handles pending, verified, invalid/expired, and signed-out states using existing branded components. Session/origin guards prevent arbitrary recipient sends; database rate limiting backs the UI cooldown. Verification never signs someone in or changes the active account. Token URLs are excluded from incoming request logs and use no-referrer/no-store response policies.

Invitation delivery and queue release remain for the next step. See [Email verification](email-verification.md) for backend details, limits, and the local review checklist. Pause for local flow review before building invitations.


**Verification backend validation:** Seven verification tests and 25 existing authentication/recovery tests pass in the full regression run. All nine workspace tests pass in the follow-up run after correcting the test to await the sign-out redirect before signing in again. The initial full run passed 40/41; the failure was that test's navigation race. Lint, workspace typecheck, production app/package build, and whitespace checks pass. Corrupted generated Next development type files were regenerated before the final typecheck; the local development server was restarted on port 3000. Desktop/320px result screenshots reviewed. Development accounts and Mailpit messages were preserved; verification tests clean up only their own mail. Ready for local flow approval before invitations.


### Team invitation email template and local account reset — October 11, 2026

User requested the next invitation step and removal of the current account for fresh registration. Identified the single development account and deleted only that account by exact ID/email in a transaction. Foreign-key cascades removed its owned workspace, membership, services, invitation drafts, credentials, and sessions. Removed any password-reset records tied to that user ID. Confirmed zero remaining development accounts, owned workspaces, and sessions for the deleted user. No test database, schema, auth secrets, or Mailpit inbox reset was performed.

Added `apps/web/src/server/email/templates/team-invitation/` with renderer, separate copy/data, and six Storybook stories. The approved logo, palette, and shared email brand tokens match verification mail. HTML/plain text include inviter/business, Member/Admin permission role, Office/Field work profile, Accept invitation, fallback URL, and seven-day expiry copy. Names and links are escaped; only HTTP/HTTPS links are accepted. Email-client inline CSS/table conventions remain in use. No dependency was added.

All six stories pass interactions/Axe checks. Rendered email Axe checks, loaded-logo/matching-link checks, and 1440px/320px layout checks pass without horizontal overflow; mobile screenshot reviewed. Lint, workspace typecheck, and Storybook production build pass. A fictional preview is captured only in Mailpit for `invitation-preview@salesmora.test`, message `oKbESfRiMpMJJwZ6scmQof`. The preview link cannot accept an invitation. Backend delivery/tokens and acceptance UI are still subsequent steps; seven-day expiry must match the future token configuration.

Review [Email → TeamInvitation](http://127.0.0.1:6006/?path=/story/email-teaminvitation--default) before continuing to the invitation acceptance component. Fresh registration is available at `http://127.0.0.1:3000/register`.


### Invitation acceptance component — October 11, 2026

User authorized building invitation acceptance and delivery. Continuing the agreed component-by-component review, added `apps/web/src/features/auth/invitation-acceptance/` with source, separate data/copy, and 19 stories. No new dependency was needed; styling uses Tailwind and existing brand tokens/controls.

The component displays business, inviter, invited email, permission role, work profile, and expiry. Signed-out users get injected sign-in/register actions; mismatched accounts get Switch account and cannot accept. Matching signed-in users explicitly accept through a no-argument callback. Pending/hydration/synchronous guards prevent duplicate submission. Successful acceptance provides a workspace continuation action; retryable service/network and rate-limit feedback preserve details. Invalid/expired/revoked invitations show generic guidance without private invitation details. The parent must supply authoritative invitation/session status and valid timestamps; the UI does not establish permission or membership.

Feedback receives keyboard focus after submission. Invitation/account identity changes remount the request state to prevent stale acceptance feedback being shown for another identity. Already-accepted state is supplied only after the server confirms membership. Stories exercise signed-out/mismatched actions, duplicate-click pending, success/continue, existing acceptance, Admin/Field, failure/retry, unavailable states, expiry/account changes during acceptance, keyboard, disabled, and long mobile content.

Review [Auth → InvitationAcceptance](http://127.0.0.1:6006/?path=/story/auth-invitationacceptance--default). Preview callbacks are mocked and create no account, membership, or workspace; no real `/accept-invitation` route, invitation tokens, delivery, or queue changes are included yet. Pause for component review before wiring verified-owner delivery and acceptance persistence end to end. This is why the two saved team invitations still have no outgoing emails.


**InvitationAcceptance verification:** All 19 Storybook stories pass interactions and Axe checks. Lint, workspace typecheck, Storybook production build, and whitespace checks pass. Independent Chromium checks at 1440px/320px confirm no horizontal overflow, visible button focus, Enter acceptance, and focused success feedback; mobile screenshot reviewed. Storybook remains available on port 6006. Awaiting component review before backend delivery and acceptance integration.


### InvitationAcceptance approved; delivery and membership connected — October 11, 2026

User approved the component and authorized the backend integration. Applied additive invitation delivery migration to development/test databases. The verified-owner dispatcher sends branded seven-day invitations through Mailpit after verification or workspace creation; pending failures can be retried from Home. Invitation status is visible to the owner. Stored hashes, row locking, recipient checks, strict input, and database acceptance limits protect the token lifecycle.

The real `/accept-invitation` route uses the approved component. New/existing users retain invitation context through registration/login and return directly to acceptance. Explicit acceptance atomically saves the server-assigned membership, verifies the addressed account, and completes onboarding; it creates no owner workspace. Repeated acceptance is safe, existing membership permissions remain intact, and Home continuation is scoped to the accepted workspace. Wrong-account switching and leaving expired context are wired. No dependency was added.

Current development owner is verified but had no invitation rows. User explained they truncated tables; left their data intact and did not invent recipients. See [Team invitations](team-invitations.md) for review steps, storage/API behavior, SMTP crash-window limits, and future invitation-management scope.


**Invitation backend verification:** All 53 authentication/recovery/verification/workspace/invitation end-to-end tests pass. All 12 invitation tests pass again after the final API side-effect adjustment and explicit branded-button visual check. This includes injected SMTP failures and concurrent retry checks, without stopping the user's mail service. Lint, workspace typecheck, production app/package build, and whitespace checks pass. Real invitation screenshots reviewed at 1440px/320px. The Next development server was restarted after production build checks to restore responsive local review. User confirmed that invitation rows were missing because they had truncated tables; no account/workspace reset or recipient reconstruction was performed in this step. Ready for local review with fresh test data.

### Invitation acceptance action update — October 11, 2026

Removed Create an account from invitation acceptance, including its callback and copy. Signed-out invitees now see only Sign in to accept. Registration remains available from the login page, and invitation context survives that route. Updated review instructions and existing Storybook/end-to-end coverage.

Verification: lint and workspace typecheck pass; all 19 invitation acceptance stories pass interactions and Axe checks. The isolated end-to-end new-invitee journey passes through sign-in → login registration link → registration → invitation acceptance → existing workspace.

### Invitee password setup — October 11, 2026

Corrected the sign-in-only invitation flow: signed-out new teammates can now enter their name, set/confirm a password, and agree to terms directly on the invitation. The existing registration form supports a prefilled read-only invited email and invitation-specific button copy. There is no Create an account link on the invitation; existing teammates retain Sign in to accept. Account creation uses the existing authentication endpoint, then re-resolves the invitation/session before explicit membership acceptance. Server acceptance still enforces recipient, expiry, and stored role/profile; no owner workspace is created.

Verification: lint and workspace typecheck pass. All 22 invitation Storybook stories pass interactions and Axe checks, including password submission and account-creation error. End-to-end tests pass for direct new-invitee password setup, existing-user sign-in, and wrong-account switching. Layout checks pass at 1440px and 320px with no horizontal overflow; mobile screenshot reviewed. Local development data was not reset.

### Disabled invited email — October 11, 2026

Changed the prefilled invited email from read-only to disabled, using the existing field's disabled styling. Its value remains in React form state and the route uses the server-resolved invitation email for account creation. Membership still requires the separate Accept invitation action after account creation. Updated existing Storybook/end-to-end assertions and invitation instructions.

Verification: lint, workspace typecheck, all 22 invitation Storybook interaction/Axe checks, and the isolated new-invitee end-to-end flow pass.

### Workspace navigation component — October 11, 2026

Built the next component for review in `packages/ui/src/layout/workspace-navigation/`, with separate copy and nine Storybook stories. Uses the approved full SVG, Source Sans 3, existing brand colors and Tailwind scale, and installed Material UI icons. No dependency installation was needed.

Desktop follows the prototype's left sidebar; mobile uses a collapsible panel in normal document flow. Includes workspace name, membership role, active-page indication, core links, an Owner/Admin management group, personal account options and sign out. Navigation visibility is a proposed presentation rule, not authorization. Parent-supplied callbacks support isolated previews and later integration; route permissions remain a server responsibility.

Current scope is Storybook review only. The existing Home route and account/workspace data remain unchanged. Await approval before connecting the sidebar and composing the dashboard shell. See local-testing.md for review instructions.

**WorkspaceNavigation verification:** all nine stories pass interactions and Axe checks. Lint, workspace typecheck, Storybook production build, and whitespace checks pass. Desktop (1440px) and mobile (320px) layout checks pass with no horizontal overflow, correct collapsed navigation, Escape dismissal, restored keyboard focus and visible outlines. Long-content screenshots reviewed. Ready for component review; application integration remains the next approved step.

### Calendar and Estimates navigation — October 11, 2026

Added Calendar and Estimates after Jobs in the core workspace group for Owner, Admin, and Member previews, using installed Material UI icons. Added active-state/callback stories and Member visibility checks; existing story lookups now use item IDs rather than positions. Destinations remain mocked for component review.

Verification: all 11 navigation stories pass interactions and Axe checks. Lint, workspace typecheck, whitespace, and 1440px/320px layout/focus checks pass. Awaiting component approval before application integration.

### Workspace shell connected — October 11, 2026

User approved WorkspaceNavigation and authorized Home integration. Added the WorkspaceShell component with source, separate copy, and six stories. Home now renders the approved sidebar beside existing saved workspace content. Workspace lookup selects the signed-in user's stored membership role along with the selected business; no role is inferred from the browser or fabricated for invitees.

Home/logo links retain the current workspace ID. Unbuilt navigation destinations and personal Account settings are disabled with Coming soon labels. Sign out calls the existing server action, disables duplicate submissions while pending, and shows retry feedback for failures. Existing owner-only invitation details/delivery retry and email verification remain available. No database migration, new dependency, dashboard data, or additional product screen was introduced.

**Workspace shell verification:** all 21 workspace/invitation end-to-end tests pass, including member role visibility, membership scoping, real sign out, invitation retry, and 1440px/320px Home layouts. Two enhanced Owner/Admin checks pass on rerun after a transient database startup connection timeout; PostgreSQL health/connection counts were checked and no database reset or service restart was needed. All 17 navigation/shell Storybook interactions and Axe checks, lint, workspace typecheck, Storybook production build, and whitespace checks pass. Real Home screenshots reviewed. The local Home route responds and directs unauthenticated visitors to login. Ready for local shell review before building dashboard content.

### Home overview component — October 11, 2026

Added `apps/web/src/features/workspace/home-overview/` with source, separate copy, and eight Storybook states. Includes a personalized greeting with a safe blank-name fallback, workspace name, membership role, and introductory created/joined guidance. Explicit entry context avoids presenting an existing teammate workspace as empty. Owner/Admin/Member guidance is presentation only; no totals, access decisions, or database calls are invented.

The only action, View workspace details, is callback-driven and mocked for review. Styling uses the existing Tailwind brand tokens and standard spacing; no dependency was added. Home integration remains pending component approval. Review Owner/Admin/Member, keyboard, missing name, mobile, and long-content states in Storybook.

**HomeOverview verification:** all eight stories pass interactions and Axe checks, including a final rerun after refreshing stale development Tailwind styles. Lint, workspace typecheck, Storybook production build, and whitespace checks pass. Long-content screenshots reviewed at 1440px and 320px; no horizontal overflow and visible keyboard focus confirmed. The refreshed preview correctly applies responsive header, content width, badge and action sizing. Awaiting component approval before Home integration.

### Home overview connected — October 11, 2026

User approved implementation of HomeOverview. Connected it to `/home` using the server-resolved session name, selected workspace name, membership role, and creator/joiner context. Replaced the old workspace-ready header with Home. View workspace details now expands a native details disclosure and focuses/scrolls its summary; the summary also works directly by keyboard. Saved business content remains rendered on the server and is passed into the client overview as a React slot.

Owner invitation details stay owner-only. Invitation retry and email verification remain visible outside the collapsed details panel, and existing sign out behavior is retained. No migration, new dependency, fabricated metrics, or additional product screen was introduced. Added a connected-details Storybook state and end-to-end checks for real greeting, focus and member privacy.

**Home overview integration verification:** 27 of 28 workspace/invitation/verification scenarios passed in the initial run; the remaining scenario timed out while opening Setup and passed on rerun. Enhanced expanded-details checks also pass at 1440px/320px, including focus and no horizontal overflow. All nine HomeOverview stories pass interactions and Axe checks. Lint, workspace typecheck, Storybook production build, and whitespace checks pass. Live collapsed/expanded Home screenshots reviewed; no development account or workspace was reset. Ready for local review.

### Hide completed email verification on Home — October 11, 2026

Home now renders the verification prompt only while the server-resolved account remains unverified. Verified accounts no longer show the completed verification callout. The verification-result page and reusable notice states remain available for their existing purposes. Updated the Home verification integration test to check both prompt removal and continuing invitation delivery.

Verification: targeted Home resend/verification end-to-end test, lint, workspace typecheck, and whitespace checks pass.

### Home empty-state rules and creation callouts — October 11, 2026

User requested the overview only for a workspace with no activity/leads/campaigns and callouts to create leads/campaigns. The introductory card now requires all three explicit presence flags to be false. Any lead, campaign, or CRM activity flag hides it, while greeting and workspace-details access remain. Added lead/campaign callout cards, role-based campaign visibility (Owner/Admin), callback-driven actions, and disabled Coming soon states when no creation callback exists.

Current repository has no lead/campaign/activity storage or creation routes. Local Home therefore explicitly supplies empty CRM state and leaves creation disabled; no fake successful actions or unimplemented links were introduced. Real workspace-scoped existence queries and creation flows must replace this temporary state when those modules are implemented. Storybook supports enabled callbacks and independent Has Leads/Has Campaigns/Has Activity suppression checks.

**Empty-state verification:** all 13 HomeOverview Storybook interaction/Axe checks pass. Four targeted real owner/member and responsive Home integration tests pass. Lint, workspace typecheck, Storybook production build, and whitespace checks pass. Mobile live screenshot reviewed. Creation remains explicitly unavailable until the corresponding modules are built; persistence-backed presence checks are not yet implemented.

### Remove redundant Home header — October 11, 2026

Removed the visible Home title and subheading at the user's request. The shell header is optional; Home now starts with the personal greeting as its level-one heading, with subsequent overview headings adjusted to preserve hierarchy. Browser metadata remains Home. Lint, workspace typecheck, whitespace checks, and the real owner Home/details/sign-out flow pass after correcting heading markup during implementation.

### Remove workspace-details action — October 11, 2026

Removed View workspace details and its disclosure, focus/scroll behavior, callback, React content slot, copy, and connected-details Storybook state. Home no longer constructs the saved business-details display. Updated existing stories and owner/member integration checks around the remaining creation callouts and greeting. Owner invitation retry and unverified-account email actions remain.

Verification: all 12 HomeOverview stories pass interactions and Axe checks; real owner and invited-member integration tests pass. Lint, workspace typecheck, and whitespace checks pass.

## Create lead manual form — October 11, 2026

- User selected the full form from `prototype/prototype-screen-06-lead-form.html`; the lead assistant is the next separate component.
- Added `apps/web/src/features/leads/create-lead-form/` with source, copy/fixtures, UI validation, and Storybook stories. Uses shared branded controls and Tailwind spacing.
- Contact details: required name, optional email and phone. Service request: required service, optional address and request details. Lead management: source, pipeline stage, owner. Internal notes remain optional.
- Defaults match the prototype: Website, New, Unassigned. The parent supplies owner IDs/names; fictional owners are confined to Storybook data. No owner permissions or persistence are implied by these options.
- Injected submit/cancel callbacks support component review. Optional email is validated when supplied; invalid fields receive focus. Submission trims text, locks duplicate submissions, disables controls while pending, preserves details on errors, and supports retry.
- Storybook success explicitly says no lead was saved. No database migration, API, route, or Home action was connected in this step.
- Validation: 14 interaction stories and Axe checks passed; desktop/mobile reviewed, no mobile horizontal overflow. Lint, workspace typecheck, whitespace checks, and Storybook production build passed (existing dependency directive warnings).
- Review: http://127.0.0.1:6006/?path=/story/leads-createleadform--default
- Await user approval before building the assistant component or connecting the form.

## Connect approved Create lead form — October 11, 2026

- Added protected `/leads/new` page, real owner choices, and injected API submission adapter. Linked Home to lead creation for its current workspace.
- Added strict shared lead contract, authenticated/same-origin `/api/leads`, membership checks, workspace-scoped assignment, transaction, and stable submission IDs for duplicate-safe retries.
- Applied additive leads migration to development; test runner applies it to the isolated test database. Existing development accounts/workspaces were preserved.
- Success confirms the save, with Home and another-lead actions. Cancel does not create a record.
- Home now uses a scoped lead-existence query to suppress empty welcome content, retaining Create lead after records exist. No dashboard/list/assistant has been added.
- Validation: 14 lead form and 14 Home Storybook interaction/Axe checks; lint, typecheck, Storybook build, desktop/320px screenshots. Real browser/API coverage includes all fields, real membership choices, retry, another lead, Cancel, authentication/origin, validation limits, tenant isolation, and duplicate submissions. See final run results below.
- See `docs/lead-creation.md` for architecture and local testing. Pause for local user review before the next component.
- Final results: all seven new E2E scenarios passed across the full run and a targeted rerun. One full-run concurrency case timed out during workspace setup while Storybook was building; after the build finished, its targeted rerun passed. 28 Storybook interaction/Axe checks passed.
- Development observation: a cold Home-to-form navigation emitted an Emotion `css`/`mui` class hydration warning from the shared MUI provider. Direct-page layouts and save/retry checks passed; provider hydration remains a follow-up rather than a resolved check.

## Home dashboard widgets — October 11, 2026

- User deferred the lead assistant and requested the prototype's dashboard widgets after the first lead exists.
- Reviewed owner/team Home prototypes. Documented widget build order and missing-data decisions in `docs/home-widgets.md`.
- Built the first component, LeadPipelineWidget, with colocated copy/fixtures and eight Storybook states. Uses the four existing stages, accessible proportional bars, and shared brand spacing/colors. No inline CSS or arbitrary numeric Tailwind sizing.
- Pipeline navigation is an injected callback for previews; the unavailable state disables the action. No dead destination was wired.
- Eight interaction/Axe checks passed; desktop and 320px layouts compared visually with the prototype. Lint, workspace typecheck, whitespace checks, and Storybook production build passed.
- Live Home and database queries are unchanged in this review step. Await approval before connecting this widget and advancing to recent activity.

## Connect Home pipeline widget — October 11, 2026

- User approved adding the existing pipeline widget to Home. It now appears below Create lead once the selected workspace has leads; empty workspaces retain their welcome screen.
- Replaced the lead-existence query with grouped stage counts, initialized to zero for missing stages. The database query restricts both workspace and authenticated membership; Home also checks workspace access before querying. Existing Owner/Admin/Member workspace access is preserved.
- Kept the approved widget layout and unavailable View pipeline action. No other widgets or assistant were added.
- Validation: lint and workspace typecheck passed; all eight lead E2E scenarios passed, including first-lead transition, mixed stage totals, member access, workspace isolation, and 1440px/320px layouts. Desktop/mobile screenshots were visually reviewed without horizontal overflow.
- Production workspace build passed. Browser tests and the build required execution outside the sandbox for local server/CSS-worker ports; no production data or schema changes were needed.

## Start main shared assistant — October 11, 2026

- User shifted focus to the cross-page chat agent and specified that the main assistant always appears at the top of every page. Embedded modal assistants are deferred.
- Read the architecture/structure plans and Home/lead-form prototypes. Updated placement guidance to match this decision.
- Built the first shared AssistantPanel for Storybook review, with page context, conversation, suggestions, composer, pending/error/retry handling, and bounded input. No LLM endpoint or live page integration yet.
- All ten Storybook interaction/Axe checks, lint, typecheck, and Storybook production build passed. Wide/320px screenshots reviewed; fixed mobile heading wrapping.
- Continue from `docs/assistant-build-tracker.md`. Next is user review of the first panel design before shared page placement.
