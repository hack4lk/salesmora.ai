# Local testing and approval

This is the local review guide for the [auth/onboarding tracker](auth-onboarding-build-tracker.md). Setup, components, and screens are delivered individually. After each item, test it locally and approve it or request changes before the next item begins.

## Start the tools

Open a terminal in the repository:

```bash
cd /Users/lukasz/dev/salesmora.ai
nvm use
corepack pnpm install --frozen-lockfile
corepack pnpm db:setup
corepack pnpm dev
```

The `.nvmrc` selects the locally available Node 22.23.3. If your terminal does not load nvm, use your normal nvm initialization first. The root package manifest pins pnpm through Corepack; plain `pnpm` also works when its Corepack shim is enabled.

Open [the local app](http://127.0.0.1:3000). In a second terminal:

```bash
cd /Users/lukasz/dev/salesmora.ai
nvm use
corepack pnpm storybook
```

Open [local Storybook](http://127.0.0.1:6006). Keep both terminals running while reviewing. Stop each with Ctrl+C. Both servers bind to the local machine. Registration requires Docker running. `db:setup` starts SalesMora’s PostgreSQL on port 55432 and Mailpit on SMTP 11025/inbox 18025, creates random credentials in ignored `.env.local`, and migrates development and test databases. Storybook alone does not require the database. Email/provider credentials are not needed yet.

## Setup approval checklist

- [ ] The app opens and displays “SalesMora.ai local setup.”
- [ ] Storybook opens; **Setup → Workbench check → Ready** displays “SalesMora.ai Storybook is running.”
- [ ] The setup story renders without an interaction error (it runs a heading-visibility assertion).
- [ ] The Accessibility panel is available; inspect its result for the setup story.
- [ ] Stopping and restarting the commands works locally.

These are setup checks. The setup page/story are temporary infrastructure checks; branding and auth screens are the next items.

## Repeatable developer checks

```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm build
corepack pnpm storybook:build
```

`corepack pnpm worker:dev` starts the independent worker scaffold. It logs that no queues or handlers exist yet; Ctrl+C stops it. Real registration journeys run with `corepack pnpm test:e2e`; see the registration checklist below. Other business tests follow their corresponding implementation. An empty unit suite is not feature validation.

## Each component or screen review

The handoff will identify the exact story/route, the implemented states, checks run, and known limitations. Test the listed interactions, keyboard navigation, and narrow/wide layouts. Screen stories use mocks; actual route tests verify real backend behavior once wired.

Reply **“Approved, next step”** to continue, or describe changes. Approval applies to the current item; it does not skip the approval checkpoint for later components/screens.


## AccountLayout review

Open [Account → AccountLayout → Registration](http://127.0.0.1:6006/?path=/story/account-accountlayout--registration), then compare Login, Mobile, and Long Content in the sidebar. Check wide/narrow spacing, the logo/font, and scrolling. Press Tab in the story canvas to reveal the skip link, then Enter to move to the main account content. The form panels are placeholders; no accounts are created.

AccountLayout and its Tailwind/copy refactor are approved.


## TextField review

Open [Forms → TextField → Default](http://127.0.0.1:6006/?path=/story/forms-textfield--default). Compare Focused, Filled, Optional, Helper Text, Validation Error, Disabled, Email, and Controlled in the sidebar. Type into enabled examples, Tab to the field, and inspect the helper/error text and mobile fit. Error messages are supplied examples; the field does not implement account validation or submit data.

TextField and its Tailwind/copy refactor are approved.


## PasswordField review

Open [Forms → PasswordField → Default](http://127.0.0.1:6006/?path=/story/forms-passwordfield--default). Type a fictional password, reveal and mask it, and confirm the value remains. Tab from the input to the eye button and activate it with Enter/Space. Compare Filled, Show And Hide, New Password, Validation Error, Disabled, Keyboard Toggle, and Controlled.

PasswordField and the copy/Tailwind refactor are approved. See [component conventions](component-conventions.md).


## SubmitButton review

The existing layout/refactor updates are approved. Open [Forms → SubmitButton → Default](http://127.0.0.1:6006/?path=/story/forms-submitbutton--default). Compare Pending, Disabled, Keyboard, Submit Once, and Long Label. Inspect the 48px standard single-line height, brand colors, keyboard focus, and narrow-screen text wrapping. Pending/disabled examples cannot be activated. Submit Once automatically enters pending during its story check; remount the story to try it yourself. It simulates local form state and sends no request.

SubmitButton is approved.


## TermsAcceptance review

Open [Forms → TermsAcceptance → Default](http://127.0.0.1:6006/?path=/story/forms-termsacceptance--default). Toggle the checkbox with the mouse or Space; Tab to the terms and privacy links. Clicking either link must leave acceptance unchanged. Navigation is mocked in these previews. Compare Checked, Disabled, Validation Error, Helper Text, Keyboard, and Document Links, including at mobile widths. Disabled prevents checkbox changes while leaving the documents accessible.

TermsAcceptance is approved.

## FormFeedback review

TermsAcceptance and its alignment are approved. Open [Forms → FormFeedback → Error](http://127.0.0.1:6006/?path=/story/forms-formfeedback--error). Compare Success, Default Success Title, Custom Error, and Long Message. Check title/message spacing, icon alignment, semantic colors, and mobile wrapping. Error uses an assertive alert; success uses a polite status region. These are static fictional examples; a real form will control when feedback appears or changes.

FormFeedback is approved.


## RegistrationForm review

Open [Auth → RegistrationForm → Default](http://127.0.0.1:6006/?path=/story/auth-registrationform--default). Submit empty fields, then correct them. Check email validation, the shared 8–128 character password rule, matching passwords, required terms, and first-error focus. Use fictional credentials; successful submissions are mocked. Document links are mocked too.

Inspect Pending (fields and submit disabled), Server Error (inputs retained and retry available), Thrown Error (generic feedback), Success (passwords cleared), Retry, Keyboard Submit, Validation Recovery, and Normalized Submission. Stories with interaction checks may already show their completed state; remount the story to try it manually. Test at 320px and desktop widths.

RegistrationForm and the registration layout are approved. The real registration backend is the current review checkpoint.

## Registration backend review — `/register`

Open [registration](http://127.0.0.1:3000/register). This now creates a real account in the local database. Use a fictional name/email and a test password. Terms/privacy disclosures are development drafts; the recorded version is explicitly a development draft.

1. Submit empty fields and check focus/validation. Correct the fields, use matching passwords, and accept the terms.
2. Submit once. You should arrive at `/setup`, see your normalized email, and see workspace setup marked pending.
3. Refresh `/setup`; you should remain signed in. Opening `/register` while signed in should return you to `/setup`.
4. Click **Sign out**. Opening `/setup` should now return you to login.
5. Try the same email again. You should see a safe error with your inputs preserved. Change the email and retry.
6. Check desktop and narrow layouts. Storybook’s [RegistrationScreen](http://127.0.0.1:6006/?path=/story/auth-registrationscreen--default) still uses mocks and never creates accounts.

The login link opens the implemented `/login` screen. The `/setup` destination is a small protected handoff, not the business onboarding screen. Verification emails, workspace creation, and final legal pages remain future steps. Password recovery is implemented locally; see the reset checklist below.

Repeatable checks:

```bash
corepack pnpm --filter @salesmora/web exec playwright install chromium
corepack pnpm test:e2e
```

The browser installation is needed on a fresh machine or after a Playwright upgrade. Tests start a separate Next.js instance on port 3002 and use `salesmora_test`. They clear only that disposable test database; your manually created development accounts remain in `salesmora`. Port 3002 must be free. Keep your normal app on 3000 and Storybook on 6006 while running tests.

See [Registration backend](registration-backend.md) for migrations, infrastructure shutdown/restart, and implementation boundaries. Registration is approved; LoginForm is the current review checkpoint below.


## LoginForm review

Open [Auth → LoginForm → Default](http://127.0.0.1:6006/?path=/story/auth-loginform--default). Submit empty fields, correct the email/password, toggle password visibility, and use Tab/Enter. Password autocomplete uses `current-password`; email uses `username` for password managers.

Compare Pending (disabled controls, one submission), Server Error and Thrown Error (safe feedback and retained inputs), Retry, Success (cleared password), Normalized Submission (normalized email with unchanged password), Existing Password (no registration-length rule imposed), Validation Recovery, and Recovery Link (mocked navigation). Check narrow and desktop widths. Stories with play functions may already show their completed state; remount them to test manually.

This review creates no sessions and sends no sign-in requests. LoginForm is approved; the `/login` screen and backend are now available for review below. Password recovery is implemented locally; see the reset checklist below.


## Login screen review — `/login`

1. Open [login](http://127.0.0.1:3000/login) using `127.0.0.1`, matching the configured auth origin. If already signed in, `/setup` opens instead; sign out first to review login.
2. Use an account you created through local registration. Submit empty fields, then try a wrong password. Check the generic error and retained inputs. An unknown email receives the same error.
3. Enter the correct credentials. Successful sign-in opens `/setup`. Refresh should keep you signed in. Visiting `/login` or `/register` while signed in returns to setup.
4. Sign out. You should return to `/login`, and `/setup` should require sign-in again.
5. Follow **Create an account** to registration and **Sign in** back to login. **Forgot password?** opens the active `/forgot-password` request form. Reset emails appear in local Mailpit.
6. Check narrow/desktop layouts and keyboard navigation. [LoginScreen stories](http://127.0.0.1:6006/?path=/story/auth-loginscreen--default) cover additional mocked states and create no sessions.

`corepack pnpm test:e2e` checks real login and registration on port 3002 with the disposable test database. It preserves accounts you manually create on port 3000. Local sign-in is rate limited to three attempts per ten seconds; wait briefly if you reach the limit.

Login screen awaits approval before the next onboarding component starts.


## PasswordRecoveryForm review

Open [Auth → PasswordRecoveryForm → Default](http://127.0.0.1:6006/?path=/story/auth-passwordrecoveryform--default). Submit an empty/invalid email and check focus and validation. Correct it and submit. Successful mocked requests show a conditional acknowledgment without confirming whether the account exists.

Compare Pending (disabled controls and one callback), Server Error and Thrown Error (same safe error, address retained), Retry, Keyboard Submit, Normalized Submission, Validation Recovery, and Success. Check desktop and 320px widths. Remount stories whose play functions have already completed to try them yourself.

Storybook sends no emails, creates no tokens, and changes no passwords. The real `/forgot-password` route is now connected to Better Auth and Mailpit. Follow [the complete password recovery checklist](password-recovery.md) to review the email, reset screen, and real backend flow.


## Complete password reset review

Follow [Password recovery — local implementation](password-recovery.md). Request a link through `/forgot-password`, open it in [Mailpit](http://127.0.0.1:18025), set a new password, and sign in. Review [ResetPasswordForm stories](http://127.0.0.1:6006/?path=/story/auth-resetpasswordform--default) separately for validation, pending, failure, invalid-link, and success states. This is the current approval checkpoint before onboarding.


## OnboardingStepFrame review

Open [Onboarding → OnboardingStepFrame → Business](http://127.0.0.1:6006/?path=/story/onboarding-onboardingstepframe--business). Compare Services, Team, Review, Pending, Creating, Continue Disabled, Keyboard Submit, Interactive Navigation, and Mobile.

1. Check the four visible progress labels, current step, completed styling, and optional Team label at desktop and 320px widths.
2. Business has Continue and no Back. Team includes Skip for now. Review uses Create workspace.
3. Use Interactive Navigation to move forward/back and skip Team. Focus should move to each new step heading. Its play check finishes on Team; remount to start again.
4. Pending disables inputs and all navigation. Continue Disabled still allows Back. Keyboard Submit demonstrates Enter submitting through a fictional field.

This is only the reusable step frame. Placeholder content and callbacks are mocked; it creates no workspace or invitations and does not change `/setup`. Approve the frame before BusinessProfileStep is built.


## BusinessProfileStep review

Open [Onboarding → BusinessProfileStep → Default](http://127.0.0.1:6006/?path=/story/onboarding-businessprofilestep--default).

1. Click Continue with empty fields. Both errors should appear and Business name should receive focus. A whitespace-only name is invalid too.
2. Enter a business name and choose a fixed business type. Errors should clear as you correct the values. Continue passes the name with surrounding whitespace removed.
3. Try Back And Continue: enter details, continue to the actual Services step, and return with Back. Both values should remain. This story's play check already completes that journey; remount to try it manually.
4. Compare Filled, Type Required, Validation Recovery, Whitespace Name, Business Types, Pending, Keyboard Submit, and Mobile. Pending disables both fields and the action. Tab through name → type → Continue; use arrow keys in the native select.
5. Check desktop and 320px widths, including the longer business-type labels.

The component uses local preview state and mocked callbacks. It creates no workspace, sends no invitations, and does not update `/setup` yet. Approval checkpoint: BusinessProfileStep; Services comes next.


## ServicesAreaStep review — searchable multi-select

Open [Onboarding → ServicesAreaStep → Default](http://127.0.0.1:6006/?path=/story/onboarding-servicesareastep--default), or continue from the [Business preview](http://127.0.0.1:6006/?path=/story/onboarding-businessprofilestep--default).

1. Search for a service (e.g. Drain cleaning), choose a result, then search for another (e.g. Pet grooming). Both should appear as selected-service pills with an X to remove each service. Pills wrap onto another line as needed.
2. Search a category such as Pet care or Electrical. Results are grouped and filtered by service/category. An unmatched query shows guidance; typing alone does not create or select a service.
3. Use Arrow Down/Enter to select, Escape to close, and Tab to reach selected-service Remove buttons. Removing returns focus to search. Clear all selected services clears the list.
4. Continue without a selection to check the required-service message and search focus. Other alone is accepted. Postal code and service range remain optional; international postal codes preserve internal spaces.
5. Compare Search And Select Multiple, Search By Category, No Matches, Remove And Clear, No Duplicate Selection, Pending, Keyboard, Back And Continue, and Mobile. Duplicate selection toggles an existing choice rather than adding it twice.
6. Check desktop and 320px widths, including grouped dropdown results and long selected service names. Business → Services → Back preserves both steps' values.

The fixed catalog has 159 services across 21 categories, kept in `services-area-step/service-catalog.data.ts`. This local preview creates no workspace and does not update `/setup`; Team remains the next component after approval.


## TeamStep review

Open [Onboarding → TeamStep → Default](http://127.0.0.1:6006/?path=/story/onboarding-teamstep--default). This preview collects drafts only; no emails are sent, no workspace is saved, and navigation callbacks are mocked until the Review component is approved.

1. Add teammate. Email receives focus; role defaults to Member and work profile to Office. Add another teammate and independently choose Admin or Field.
2. Continue with an empty/invalid email, your owner email, or a duplicate address (case/whitespace insensitive). The first invalid field receives focus; fixing it clears the error.
3. Remove a teammate; focus returns to Add teammate and other values stay intact. Continue without teammates is valid.
4. Skip for now and Back bypass validation. The parent will retain drafts; Skip omits invitations from submission.
5. Compare Filled, Add And Continue, Validation Recovery, Invalid Email, Duplicate Email, Owner Email, Remove Teammate, Skip And Back, Keyboard Submit, Pending, and Mobile. Confirm no horizontal overflow at 320px.

Invitations must be sent only after workspace creation and email verification. That backend work follows component approval.


### Services → Team navigation preview

Services Default, Filled, and Mobile now move to the real TeamStep when you select at least one service and Continue. The same navigation is available after Business Continue. Team Back returns to Services; returning to Team retains its invitation draft. Team Continue/Skip shows a preview notice for the upcoming Review component; no workspace is created or email sent. Isolated validation stories still use mocked callbacks.


### Preview owner identity

Team Default and connected Business → Services → Team previews read the signed-in account from the local app session. Keep Next running on `127.0.0.1:3000` and Storybook on `127.0.0.1:6006`; sign in using `127.0.0.1`, then refresh the preview. Storybook proxies only the session-read endpoint; authentication origins stay unchanged. If signed out or the local app is unavailable, the preview shows a sign-in prompt instead of a fabricated owner. Filled/validation stories deliberately retain sample accounts for repeatable testing. Invitation validation uses the displayed session email.


## ReviewStep review

Open [ReviewStep → Default](http://127.0.0.1:6006/?path=/story/onboarding-reviewstep--default) while signed into the local app, or use [Filled](http://127.0.0.1:6006/?path=/story/onboarding-reviewstep--filled) for sample data. Connected Business/Services/Team previews now reach Review; no workspace is created and no emails are sent.

1. Confirm business name/type, service pills, postal/range, Owner email, and invitation emails, roles, and work profiles. Blank optional area fields say Not provided; solo setup has a no-invitations message.
2. In Edit Round Trip, use Edit business/services/team to change each section. Continue returns to Review and preserves all other draft values. Back returns to Team.
3. Skip Team: Review must omit invitations, while Back/Edit Team retains its original draft. Continue from Team includes the draft again.
4. Compare Explicit Create, Incomplete Business, Incomplete Services, Invalid Invitation, Pending, Create Error, and Mobile. Invalid drafts block creation and focus the corresponding Edit action. Pending disables actions; errors keep the summary available for retry.
5. Create workspace only confirms this local preview and shows a notice. Backend persistence follows approval. No side effects occur just by viewing Review or editing a section.


## Real workspace creation

Use [the local app setup](http://127.0.0.1:3000/setup) to create a real workspace. Complete the four steps, review/edit, then Create workspace. `/home` confirms saved business/services/area and queued invitations. Reload and sign in again to verify persistence. Team Skip omits invitation drafts from creation. Storybook remains a preview; its Create button does not write records. Unfinished drafts reset on page reload.

Read [Workspace creation](workspace-creation.md) for tables, API and test details. Invitation delivery and the full Home screen remain subsequent steps.


## EmailVerificationNotice review

Open [Auth → EmailVerificationNotice → Default](http://127.0.0.1:6006/?path=/story/auth-emailverificationnotice--default). The supplied email is read-only, and all delivery callbacks are mocked; no verification emails are sent.

1. Click Resend email. Check the Sending state, then Check your inbox feedback and the resend countdown. Success means the link was sent, not that the email is verified.
2. Compare Pending (double click invokes one request), Server Error, Network Error, Retry, and Rate Limited. Delivery failures allow retry; rate limits disable resending while the countdown runs.
3. Cooldown Expires uses a one-second mock delay to test re-enabling and resending. The normal default is 60 seconds.
4. Use keyboard Enter to submit. Feedback receives focus; the counter is not a per-second live announcement. Disabled does not submit; Verified displays confirmation without a resend action.
5. Compare Mobile at 320px and desktop widths with the long sample email. Confirm wrapping and no horizontal overflow.

After notice approval, build the verification email template for Mailpit, then connect token verification and the real authenticated owner notice. Workspace invitation queues remain unchanged in this UI step.


## Verification email template review

Open [Email → EmailVerification → Default](http://127.0.0.1:6006/?path=/story/email-emailverification--default) and [Mailpit](http://127.0.0.1:18025/). The Mailpit message is “Verify your SalesMora.ai email” for `verification-preview@salesmora.test`.

1. Review the approved logo, copy, branded Verify email button, expiry message, and fallback link. The preview link is fictional and cannot verify an account.
2. Compare Long Link and Mobile for wrapping, and Plain Text for the non-HTML alternative. Escaped Link checks safe URL rendering.
3. In Mailpit, inspect HTML/text and the inline PNG attachment. This is local capture only; no external email is delivered.

The template lives in `apps/web/src/server/email/templates/email-verification/`. Shared email colors/font/size tokens live in `email-brand.data.ts`. Regenerate the PNG from the approved SVG/font with `node scripts/export-email-logo.mjs` using the project Node version and installed Chromium. Email markup follows the existing inline CSS/table convention for email clients.

Pause for template approval. Next, connect authenticated resend and verification tokens, with backend expiry matching the one-hour email copy; invitation delivery remains a separate step.


## Real email verification review

The template is approved and the real flow is connected. Follow [Email verification](email-verification.md): open Home (or `/verify-email` during unfinished setup), resend to your signed-in account, then use the newest real link in Mailpit. Home must show Email verified after returning/reloading. Existing accounts can resend without registering again. Verification remains optional for workspace access; invitations are not sent yet.


## Team invitation email review and fresh registration

The single existing development account and its owned workspace were removed at the user's request. Open [Register](http://127.0.0.1:3000/register) to start again with the same email. Use the newest real verification message in Mailpit when testing verification.

Review [Email → TeamInvitation](http://127.0.0.1:6006/?path=/story/email-teaminvitation--default). Compare Default (Member/Office), Admin Field, Long Names And Link, Escaped Names, Plain Text, and Mobile. Confirm inviter/business names, permission role/work profile, approved logo, Accept invitation button, fallback link, and seven-day expiry copy. Mailpit contains a fictional preview for `invitation-preview@salesmora.test` with subject “Join Northstar Plumbing on SalesMora.ai”.

Only the email template is implemented in this step. Team members do not receive real invitation emails yet; the acceptance component, server token lifecycle, verified-owner queue release, and delivery will follow component approval. The preview link intentionally cannot join a workspace.


## InvitationAcceptance component review

Open [Auth → InvitationAcceptance → Default](http://127.0.0.1:6006/?path=/story/auth-invitationacceptance--default). This is an isolated component preview with mock callbacks; real invitation delivery/acceptance will follow approval.

1. Confirm the business, inviter, invited email, permission role, work profile, and expiry. Default is Member/Office; Admin Field shows the alternative combination.
2. Accept invitation, then Go to workspace. Preview success does not create membership or navigate to a real workspace. Pending demonstrates duplicate-click protection.
3. Signed Out offers an inline invited-account password form and Sign in to accept for existing users; Wrong Account only offers Switch account. Acceptance is unavailable until the displayed account matches the invited email. No account or membership is created by those mocked actions.
4. Compare Server Error, Network Error, Retry, Rate Limited, Already Accepted, Expired, Invalid, Revoked, Expires During Acceptance, and Account Changed On Server. Terminal failures hide invitation details and acceptance actions. Retryable failures preserve the details.
5. Keyboard uses Enter to accept, then focuses feedback. Disabled prevents submission. Compare Mobile at 320px with a long business name and email; confirm wrapping and focus visibility.

The backend step will validate token expiry/revocation, authenticated recipient, roles/profiles, and membership atomically. Viewing a link will not itself accept it. Invitee registration must return to the invitation without entering owner setup. Saved invitations will send only when their owner is verified. These behaviors are still planned, not implemented by this component.


## Real team invitation review

Follow [Team invitations](team-invitations.md) for the full checklist. Register a fresh local test owner, complete onboarding with two invitation emails, and create the workspace. Verify the owner using Mailpit: both teammate emails should then appear. Open each real invitation in a signed-out browser (or use Switch account), set a password directly on the invitation (or sign in with an existing account) using its addressed email, explicitly accept, and continue into the existing workspace. No owner setup should appear for the invitee.

Home displays invitation status for the owner. Failed local delivery stays queued; restore Mailpit and use Send pending invitations after the one-minute attempt interval. Storybook callbacks remain mocked. Adding teammates after onboarding and reissuing expired invitations are later UI steps.

## Workspace navigation component review

Open [Workspace → WorkspaceNavigation](http://127.0.0.1:6006/?path=/story/workspace-workspacenavigation--owner). This is an isolated component preview; Home continues to use the existing account layout until this navigation is approved and integrated.

- Owner/Admin: review Home, Intake Review, Leads, Customers, Jobs, Calendar, Estimates, and the Reports/Campaigns/Settings management group. Member hides the management group. These are proposed navigation visibility rules; server routes must enforce permissions independently.
- Active links expose `aria-current="page"`. Link destinations are planned routes; Storybook callbacks intercept them and perform no real navigation.
- Account options expands personal account settings and sign out. Both actions are mocked. Tab through options; Escape closes them and returns focus to the account button.
- Mobile starts collapsed. Open navigation to access links/account actions; Escape closes it and returns focus to the toggle. The expanded panel stays in normal document flow.
- Review Long Content and Long Content Mobile for long workspace names and email addresses. Check at 320px and desktop widths.

No workspace switching, notifications, dashboard data, or backend changes are part of this component. Review before connecting it to the authenticated application.

## Connected workspace shell

The approved navigation is now connected to [Home](http://127.0.0.1:3000/home). Sign in with an account that owns or has joined a workspace. The sidebar shows the real workspace, user name/email, and saved membership role. On mobile, open navigation first to reach account actions.

Home is the only available destination. Other visible entries, including Calendar and Estimates, show Coming soon and are disabled; personal Account settings is also disabled until its screen is built. Home/logo links retain the selected workspace through the `workspace` query parameter. Open Account options → Sign out to end the real session and return to login. If sign out fails, the shell shows retry guidance and re-enables the action.

Existing business details, owner invitation status/retry, and email verification remain in the main area. Owner-only invitation details stay hidden for Admins and Members. Workspace access still requires server-resolved membership; navigation visibility is not a substitute for authorization.

For isolated review, open [Workspace → WorkspaceShell](http://127.0.0.1:6006/?path=/story/workspace-workspaceshell--owner). Its Owner/Admin/Member, mobile, pending and failed-sign-out stories use mocked callbacks.

## Home overview component review

Open [Workspace → HomeOverview](http://127.0.0.1:6006/?path=/story/workspace-homeoverview--owner). This is a component preview; it is not connected to Home yet.

Review Owner (newly created workspace), Admin and Member (joined workspace), keyboard activation, missing name, mobile, and long-content states. The parent explicitly supplies whether the workspace was created or joined; the component does not infer that an existing workspace has no records. It shows a personal greeting, workspace name, role, and introductory guidance. It has no fabricated record totals or customer/job data.

View workspace details calls a mock callback. In the next integration step it will reveal/focus the existing saved business details after approval. No account, membership, or workspace is changed by this preview.

## Connected Home overview

The Home overview is now connected at [Home](http://127.0.0.1:3000/home). It uses the authenticated user's name and selected workspace membership role. Workspace owners see the created-workspace introduction; other members see joined-workspace guidance. This describes how they entered the workspace and does not infer that the workspace has no records.

Click View workspace details: the saved business information expands and focus moves to its summary. The summary can also expand/collapse the panel directly by keyboard. Team invitation details remain owner-only. Unverified accounts see email verification below the overview; verified accounts see no verification callout. Owner invitation retry remains available; Account options still handles sign out. No new database tables, record totals, or product modules are part of this integration.

## Home empty-state and creation callouts

The introductory card now appears only when all three supplied flags are false: hasLeads, hasCampaigns, and hasActivity. A true flag for any of them hides the card; the greeting and workspace-details access remain. Storybook Has Leads, Has Campaigns, and Has Activity each exercise this rule independently.

Owners/Admins see Create lead and Create campaign callouts. Members see Create lead only. Enabled Storybook actions are mocked. Local Home currently marks creation Coming soon because lead/campaign creation routes and their storage have not been implemented. Home explicitly supplies empty CRM state for this current implementation; this is not a database existence check. When those modules are built, replace these flags with workspace-scoped existence checks and connect callbacks to working creation flows. Record-access filtering must not accidentally present a populated workspace as empty.

Home now starts with the personal greeting; the redundant Home heading and “Your workspace, at a glance” subheading are removed. The greeting is the page's level-one heading, and introductory/callout headings follow it in order. The browser tab still identifies Home.

## Workspace details removed from Home

The View workspace details button and expandable business-details panel have been removed. HomeOverview no longer accepts a details slot or callback, and its stories no longer expose the removed interaction. The greeting, role-aware lead/campaign callouts, owner invitation retry, and unverified-account email prompt remain. Earlier workspace-details review steps above describe previous iterations and no longer apply.

## Create lead manual form review

Open http://127.0.0.1:6006/?path=/story/leads-createleadform--default with Storybook running (`corepack pnpm storybook`). This follows the full lead-form prototype; the assistant will be reviewed separately.

1. Submit empty: name and service errors appear; focus returns to name.
2. Fill only name and service: mocked submission succeeds without requiring email, phone, address, details, or notes. No lead is saved.
3. Review **Filled** to inspect all fields, dropdown choices, and fictional owners. Source defaults to Website, stage to New, owner to Unassigned in **Default**.
4. Review **Invalid Email**, **Pending**, **Server Error**, **Retry**, and **Validation Recovery And Keyboard** for error handling and keyboard submission.
5. Review **Mobile**, or resize the browser, to check the stacked fields and full-width actions. **No Owners** leaves Unassigned as the only owner option.

The form has injected callbacks only. Home creation buttons and real database persistence are still pending subsequent approval and implementation.

## Real Create lead flow

The manual form is now connected at http://127.0.0.1:3000/leads/new. Sign in and use Home's Create lead link to preserve the selected workspace.

- Select a real workspace member as owner, or leave Unassigned. Add the contact, requested service, source, stage, and notes; submit to save into `leads`.
- Confirm the saved message, then use Back to Home. The empty welcome should disappear for that workspace; Create lead remains available.
- Create another lead resets the form with a fresh submission identity. Cancel returns to Home without saving.
- Inspect `leads` in Postico to verify saved data. The Storybook preview continues to mock submission.
- `corepack pnpm test:e2e leads.spec.ts` uses only the isolated test database. Full details are in [lead creation](lead-creation.md).

## Home pipeline widget preview

Review http://127.0.0.1:6006/?path=/story/workspace-leadpipelinewidget--default and its First Lead, Empty, Pipeline Unavailable, Keyboard, and mobile stories. Counts are fictional preview data. Bar lengths represent each stage's share of total leads; the count is also accessible as a meter value. No database writes occur.

Home connection is pending component approval. The remaining Home widget sequence is in [Home widgets](home-widgets.md).


## Home pipeline widget connection

Open Home in a workspace with saved leads. The pipeline widget shows the total and all four stage counts below Create lead. Create a lead in a different stage, return Home, and confirm the total and stage count increase. View pipeline stays Coming soon until its destination exists. An empty workspace keeps the initial welcome instead of the widget.

`corepack pnpm test:e2e leads.spec.ts` checks the first-lead transition, mixed stage counts, member access, isolation between workspaces, and 1440px/320px layouts using only the isolated test database.

## Shared assistant panel review

Open http://127.0.0.1:6006/?path=/story/assistant-assistantpanel--default. This is the first shared component for the main assistant that will sit at the top of every page. It is not connected to the app or an LLM yet; no records are saved.

Review **Default** for the initial panel and **Conversation** for a fictional reply. **Pending**, **Retry**, **Thrown Error**, and **Message Limit** cover request states. **Record Context** demonstrates the optional selected record and clear callback; the default panel omits the page label and suggested-action buttons. **Mobile** checks narrow layout. Enter inserts a newline; use Ask assistant to send.

Design approval precedes connecting the panel above page content. See `docs/assistant-build-tracker.md` for the agreed placement and implementation sequence.

## Main assistant page placement

Open Home or Create lead while signed in. A floating SalesMora assistant callout appears at the bottom right; the page heading and content no longer have a chat form above them. The page label and suggested-action buttons remain removed. Chat is marked “Chat coming soon” until the runtime is connected. Open the callout to type a local draft; Ask assistant remains disabled. Existing manual lead creation remains available below it.

The panel now uses the approved dark-blue conversation design with an expanded modal and blurred/dimmed backdrop. WorkspaceShell stories include the panel for Owner/Admin/Member and desktop/mobile previews.


## Expanded chat review

On Home or Create lead, click the floating assistant callout or activate it with the keyboard. Confirm that the blue-header/navy-body chat expands, the page behind it dims/blurs, and background controls cannot take focus. Type a draft, then close with Escape, Close chat, or the visible backdrop. Reopen and confirm the draft remains. Tab and Shift+Tab stay within the expanded panel; closing returns focus to the callout and restores page scrolling. On narrow screens the panel uses the available width and scrolls if necessary. Sending remains unavailable until the runtime is connected.

Storybook **Expansion** and **Draft Only** cover the new states. Real-page behavior is covered by the chat scenario in `leads.spec.ts`, using only the isolated test database.


## Authenticated chat transport

Run `pnpm --filter @salesmora/web test:e2e chat.spec.ts` against the isolated test database. Its test server explicitly enables the fictional provider only when running against a `_test` database in non-production mode. Do not enable fixture flags on the normal app. The regular app retains the approved disabled assistant composer until live generation is integrated.

The suite verifies durable acceptance, visible incremental delivery before completion, exact-submission replay without regeneration, conflicting payload rejection, private workspace/user history, Stop and disconnect cancellation, partial-response persistence, safe provider failure, stale-lease recovery, rate/concurrency bounds, permission revocation and session revocation. The unit suite covers fragmented UTF-8/CRLF SSE frames, replay, invalid events and missing terminal states. No model requests or spend are required.

Routes: POST `/api/chat/turns`, GET/DELETE `/api/chat/threads`, POST `/api/chat/cancel`. All mutations require the configured Origin and session; all access reloads current app permissions. A repeated accepted submission returns JSON with its existing state instead of a new stream. History is bounded to 50 recent turns; the eventual client adapter must reconcile before starting another attempt and mark non-completed partial answers incomplete.

## Live Leads reads

Apply `pnpm db:migrate` to local Docker without resetting records. The October 15 lead read-model migration maps In progress to Estimate sent, adds stable workspace lead numbers/version/archive/activity fields and defaults the workspace timezone to UTC. Its backfill is forward-only after a successful commit.

Run `pnpm test:leads:db` for isolated-schema migration/read tests and `pnpm test:authorization:db` for the permission regressions. Both require a separate `TEST_DATABASE_URL` ending in `_test`. Run `pnpm --filter @salesmora/web test:e2e leads-read.spec.ts` for real browser/API reads on port 3002; it creates and removes its own fictional accounts while preserving immutable non-content authorization audit evidence. The older `leads.spec.ts` uses a disposable test-database reset between cases, so do not run these suites concurrently against the same test database.

Review `/leads` and `/leads/[leadId]` locally with Owner/Admin/Office and Field accounts. Check assigned-only rows/counts, search (including formatted phone digits), filtering, sorting, numbered pages, per-column Load more, archived visibility, quick view, native record/back links, mobile overflow and permission revocation on the next request. All GET responses are private/no-store. Add lead opens the existing full create page; new drawer/domain mutations and CSV export remain a later integration section. No staging deployment or model calls are needed for these checks.

### Live lead stage moves

`pnpm test:leads:db` also checks atomic stage/history updates, assigned-role authority, current revocation, concurrent versions, replay and transaction rollback in an isolated schema. `pnpm --filter @salesmora/web test:e2e e2e/leads-read.spec.ts` exercises stage API validation and real card-menu/drag/quick-view/detail confirmations using generated disposable accounts. No development lead is changed by these tests. Stage controls are now live; edit, assignment, notes, archive, delete and export mutations remain future slices.

### Live team notes

The same Leads database/browser commands now cover team-note saves, plain-text rendering, read/assigned scope, forged actors, current revocation, idempotent lost-response retries, and independent note/activity pagination. Generated test notes live only in the isolated schema or disposable test workspace. No migration or new dependency is needed. Edit/assignment/archive/delete/export remain separate implementation slices.

### Live lead editing

The Leads database/browser commands also exercise ordinary-field editing and activity history. Protected/unknown request fields return 400; invalid editable content returns 422. Tests cover source provenance, assigned scope, current edit permission, frozen versions, changed-field conflict highlighting, explicit reload/discard, lost-response retry, concurrent saves and transaction rollback. These use isolated schemas or generated test workspaces; development records are preserved. No schema migration is required for this slice.

## Live assignment and personal notifications

After applying local migrations, use the full lead record or quick view's **Change owner** action. Assign another current teammate, then sign in as that teammate to check the notification bell and lead link. Mark it read and open **Settings → Notifications** to save the email toggle; this preference applies to that user across workspaces. Self-assignment, unchanged ownership and unassignment do not notify.

Run `corepack pnpm worker:dev` alongside the web app for queued email delivery. Locally the worker reads the ignored `.env.local`; `BETTER_AUTH_URL` must match the local app origin and `EMAIL_PROVIDER=mailpit` (or its default) sends only to the local Mailpit inbox at `http://127.0.0.1:18025`. Outbox work runs every five seconds. An email requires the recipient's verified email, current membership/read access and enabled email preference. Email failure does not undo the assignment; retries stop after five attempts, email jobs older than 23 hours are skipped, and delivery states remain inspectable in the outbox and `worker:status` summary. Development accounts and records are preserved by migration.

Assignment checks: `corepack pnpm test:leads:db` rehearses the migration and authorization/delivery cases in an isolated schema. `corepack pnpm --filter @salesmora/web test:e2e leads-read.spec.ts` uses generated accounts in the separate test database for live owner-picker, notification, preference and existing Leads regressions. No external email is sent by these tests.

## Live lead archive and restore

As an Owner or Admin with `leads.archive`, open a lead record and select Archive. Confirm that its details/history remain, editing/stage/assignment controls disappear, and the default list/pipeline no longer includes it. Use Show archived to find it again; restore from the record header or the list row's Restore action. Confirm that filters remain and the history records both actions. Won leads can also be archived/restored. Office and Field cannot perform either action. Archiving does not free plan allowance and neither action sends notifications/emails.

The local archive/restore implementation uses the existing archive metadata and history tables: no migration or environment update is needed. The Leads database rehearsal covers role/tenant boundaries, stale and concurrent versions, replay, atomic rollback and retained fields. The live browser/API suite also verifies a lost archive response can be safely retried, list visibility, current permission revocation, restored history, and unchanged lead admission counts. The existing form-readiness guard keeps toolbar controls disabled until their client handlers are ready, including when returning from a record to clear filters.


## Live lead deletion review — October 15, 2026

Using a fictional disposable local lead, open its full record as Owner/Admin and choose **Delete**. Cancel is safe; the confirm button requires the exact displayed lead number. A confirmed deletion immediately returns to the originating Leads list with its filters preserved. Refreshing the old record URL shows unavailable. Notes/history and linked proposal/assignment records are removed; a content-free immutable audit remains. Won leads offer the archive alternative. Office/Field cannot delete, and API calls independently enforce that restriction. Archived non-Won records remain deletable.

Monthly creation usage currently remains counted after deletion, matching the approved billing ledger. No staging release is included. The additive audit migration is already applied locally after a backup/restore rehearsal; no new environment variables are needed.


## Live Leads CSV export review — October 15, 2026

As Owner/Admin, open Leads, apply filters and choose **Export**. The approved dialog checks the current count, scope and technical cap before enabling **Export CSV**. The file includes all matching leads across pages, in stable ID order; list/pipeline view and pagination do not limit it. Archived records appear only with Show archived enabled and current archive visibility. Try a failed request and retry: no partial file is offered, and the dialog stays open until a complete CSV is downloaded. Compare accents, commas, quotes, multiline notes and formula-like text in a spreadsheet. Dates use ISO UTC; team timeline notes are not part of this dataset.

The default technical cap is 50,000 rows on every plan. Optional `LEAD_EXPORT_ROW_LIMIT` can lower it for testing; no environment variable is required. Over-cap exports ask for narrower filters and omit no rows silently. The live regression suite was also run with a 40-row cap to exercise that HTTP boundary. The export-audit migration is already applied locally after a backup/restore rehearsal. Staging remains unchanged.


## Assistant context chip review

Open [Assistant → ContextChip](http://127.0.0.1:6006/?path=/story/assistant-contextchip--default). Compare Current filters, Long label/Narrow, Disabled and Read only. Clear with the pointer or Enter/Space: the preview removes the chip and returns focus to its composer. The approved dark blue palette is shown on an assistant surface. These are fictional, presentation-only stories; no records are read or sent to chat. Review this component before live context/read-tool integration.


## Live assistant page context review

Open a lead record locally, open the assistant and check **Using LD-… · name**. Ask “Summarize this lead”: the automatically supplied summary contains its name, service, stage and archive status. Contact/request details and Internal notes are available through the explicit details operation. On the Leads list, the chip says **Using current filters**; these are filter intent. The existing pipeline-count tool applies them when asked for counts; search/result lists use the explicit search operation. Clear the chip, check focus returns to the composer, and submit another message without automatic page context. Navigate list → record and check the next turn uses the correct surface/context while the private thread restores. Clearing does not delete prior conversation messages.

Field context is limited to assigned leads. Source changes/reassignment/deletion can stop a stream and hide source-dependent saved answers/proposals. A proposal cannot confirm using a changed source. Retrying reconciles the original context instead of replacing it with the new page's intent. The additive migration is already applied locally; there are no new environment variables. Tests used fictional fixtures without paid-provider calls; review actual model wording locally. Staging remains unchanged.

## Assistant lead stage proposal review

Open [Assistant → LeadStageDraftCard → Review](http://127.0.0.1:6006/?path=/story/assistant-leadstagedraftcard--review). Confirm and Cancel update the fictional preview only. Compare Lost With Reason, Saving, Failed Decision, Expired, Conflict, Forbidden and Long Content. Check keyboard confirmation, before/after clarity and narrow layouts. The component cannot change real leads yet; approve this card before the field-update review component and subsequent shared tool/confirmation wiring. The full current-user lead parity scope is recorded in the Leads page plan. Bulk and job handoff remain deferred; staging unchanged.

## Live assistant stage changes

The approved stage review card is now connected locally. Open a lead you can move, open the floating assistant and ask “change status of this lead to estimate sent.” Review the current/proposed stages and click Confirm stage change. The lead page refreshes, and history shows an assistant-confirmed stage event. No estimate is sent. Cancel leaves the lead unchanged; a plain “yes” never saves. Changing the lead elsewhere, reassigning it outside your scope, revoking permission or waiting fifteen minutes prevents stale confirmation. Try an explicit LD-number from Home as well. Phone/other field edits remain the next component/tool slice. No new environment variables or staging deployment.

## Assistant lead field-update review

Open [Assistant → LeadUpdateDraftCard → Review](http://127.0.0.1:6006/?path=/story/assistant-leadupdatedraftcard--review). Review the phone change, then compare Multiple Fields, All Editable Fields, Clear Value, Add Missing Value, Long Content, Conflict and Forbidden. Confirm/Cancel update fictional preview state only. Keyboard Confirm and Saving exercise explicit decisions and duplicate blocking; Unchanged prevents confirmation. Approve this component before wiring phone/other field edits into live chat. The shared assistant currently continues to support counts, creation and stage changes; remaining actions are being delivered through individual review checkpoints. Staging is unchanged.

## Live assistant field changes

Open an accessible lead and ask “Change this lead's phone number to (212) 555-0188.” Check the current and proposed phone values, then click Confirm lead changes. The page refreshes and history records assistant-confirmed edits. On Home or the Leads list, include the explicit LD-number. Try changing email and phone together, clearing an optional phone, or cancelling. Invalid required values and source changes on imported leads cannot confirm. Stage and ownership are separate operations; append-only team notes are not the original Internal notes field. Changed records, reassignment and revoked permissions invalidate pending reviews. The field-update operation is connected locally; staging unchanged. Assignment/unassignment remains the next review component.

## Assistant lead assignment

Preview `http://127.0.0.1:6006/?path=/story/assistant-leadassignmentdraftcard--review` and its Unassign story. The card is now connected locally on Home, Leads list and lead details, subject to current read/assign grants. On a detail page try “Assign this lead to me”, “Assign this lead to [exact teammate name]” or “Unassign this lead”, then explicitly confirm the card. Home/list require an explicit lead number. Ambiguous names ask for the teammate's workspace email. Assignment with stage/field edits currently requires separate proposals.

Use `corepack pnpm --filter @salesmora/web test:e2e chat-assignment-actions.spec.ts` for isolated fixture-model API/browser coverage. These tests queue notifications only in the isolated test database and send no external email. Use `node scripts/check-assistant-stories.mjs 'assistant-(leadassignmentdraftcard|assistantpanel)'` for desktop/mobile interaction, Axe and layout checks. No new environment values. Migration 202610160003 is applied locally; staging remains unchanged.

## Assistant team notes

The approved review is at `http://127.0.0.1:6006/?path=/story/assistant-leadnotedraftcard--review`. On a lead detail page, try “Add a note to this lead: Called the customer and left a voicemail.”, review the exact body, and choose Confirm and add note. It appends to Notes for the team. Home/list require an explicit lead number. App read scope governs notes, including assigned-only Field scope and readable archived leads. Notes are separate from the editable Internal notes field.

Use `corepack pnpm --filter @salesmora/web test:e2e chat-note-actions.spec.ts` for isolated fixture-model coverage and `node scripts/check-assistant-stories.mjs 'assistant-(leadnotedraftcard|assistantpanel)'` for desktop/mobile interaction, accessibility and layout checks. Migration 202610160004 is applied locally after a backup rehearsal. No new environment values or external email; staging remains unchanged.

## Assistant archive and restore

With an Owner/Admin grant, try “Archive this lead” on lead details and explicitly choose Confirm archive. Then “Restore this lead” and Confirm restore. Home/list use an explicit lead number. Archive/restore preserves the pipeline stage, assignment, content/history and monthly creation usage. Already matching states need no confirmation. Office/Field cannot acquire archive privileges through chat.

Use `corepack pnpm --filter @salesmora/web test:e2e chat-archive-actions.spec.ts` for isolated fixture-model coverage. Preview `http://127.0.0.1:6006/?path=/story/assistant-leadarchivedraftcard--review` or its Restore story; `node scripts/check-assistant-stories.mjs 'assistant-(leadarchivedraftcard|assistantpanel)'` checks narrow/wide keyboard/accessibility/layout behavior. Migration 202610160005 is applied locally following a private backup rehearsal; no new environment values or staging release.

### Assistant CSV export

As Owner/Admin, ask “Export all my leads as CSV” from Home or lead details. On the Leads list apply filters and ask “Export these filtered leads.” Review the scope, filter labels, count and archived inclusion, then choose Confirm and download CSV. Cancellation does not prepare a file. Zero/over-cap results cannot confirm. Changes to matching count, grants, membership or reviewed owner labels require a fresh proposal. Existing CSV columns include Internal notes and exclude team timeline notes. Export does not refund or consume lead creation allowance.

Use `LEAD_EXPORT_ROW_LIMIT=40 corepack pnpm --filter @salesmora/web test:e2e chat-export-actions.spec.ts` against the isolated local test database to exercise permission intersection, count/cap changes, safe CSV, cancellation/expiry, rollback and browser lost-response retry. `node scripts/check-assistant-stories.mjs 'assistant-(leadexportdraftcard|assistantpanel)'` covers review presentation. Local migration 202610160006 follows the backup rehearsal; no required environment changes or staging release.

### Assistant permanent lead deletion

As Owner/Admin, ask “Permanently delete this lead” on a non-Won lead detail page, or name an explicit UUID/LD-number from Home/list. Review the lead and consequences, type the exact displayed lead number and activate Confirm permanent deletion. Chat replies such as “yes” do not approve deletion. Won leads are blocked; archived non-Won leads can be deleted. Cancel never deletes. Monthly lead creation admissions stay counted.

After confirmation the detail route leaves for Leads, cached assistant lead content is cleared, and reload can show only the deletion receipt without the customer's name, stage or visibility. Old assistant content based on that deleted lead remains restricted. A lost response can be retried safely with the same typed number; current authorization and audit provenance are checked again.

Use `corepack pnpm --filter @salesmora/web test:e2e chat-delete-actions.spec.ts` with the isolated fixture database for typed confirmation, scope/role denial, stale/Won/expiry guards, nonzero usage preservation, cleanup, rollback, concurrent retries, receipt redaction and browser navigation. `node scripts/check-assistant-stories.mjs 'assistant-(leaddeletedraftcard|assistantpanel)'` covers the shared UI. Additive migration 202610170001 follows the local backup rehearsal. No required environment values, paid model calls, external email or staging deployment.

### Live assistant lead search

On Home ask “Find leads for drain cleaning” or “Show my contacted leads.” On the Leads list apply filters and ask “Show these filtered leads.” The assistant shows up to ten newest matches and the matching total within your current read scope. Open a result or Open matching Leads list; navigation closes the assistant and applies the stored filters. Field results are assigned-only. Owner/Admin can explicitly include archived leads when their archive grant permits it. Named owner filters currently require an explicit workspace member ID or “me”/“unassigned”; text search does not look up LD-numbers.

Reload to check saved card restoration. Change a matching record, its assignment, owner name or the matching count, then try opening the old result: it must be unavailable and require a fresh search. Old answers and follow-ups derived from that search must also hide stale result content. No leads are created or changed by searching. Contact fields/internal notes/team notes are not returned in this slice.

Use `corepack pnpm --filter @salesmora/web test:e2e chat-search.spec.ts` with the isolated fixture database and `node scripts/check-assistant-stories.mjs 'assistant-(leadsearchresultscard|assistantpanel)'` for shared-panel/card desktop/mobile interaction, keyboard, Axe and overflow checks. Migration 202610170002 is additive and applied locally after backup/restore rehearsal. No required environment changes, paid test API requests, external email or staging release. Detailed lead and activity queries remain next.

Other-teammate filter labels require the same leads.assign permission used by the manual owner picker. Without it, ordinary scoped search and self filters remain available, but chat cannot resolve arbitrary workspace member names, including on zero-match searches.

### Assistant lead details card review

Open [Assistant → LeadDetailsCard → Review](http://127.0.0.1:6006/?path=/story/assistant-leaddetailscard--review). Compare Assigned Scope, Archived, Missing Contact, Long Content, Plain Text and Revoked While Open. The card displays contact/request/Internal notes snapshots as plain text; Open lead record uses a mock callback. Check keyboard navigation, narrow layouts, explicit missing values and that unavailable states hide prior content. All 29 stories / 58 desktop/mobile checks pass with `node scripts/check-assistant-stories.mjs 'assistant-leaddetailscard'`. UI types, lint and UI/Storybook production builds pass. The approved card is now connected locally through the shared details operation. Staging remains unchanged.


### Live assistant lead details

From a lead detail page, ask “Show details for this lead.” On Home or the Leads list use “Show details of LD-0001” with a lead number available to your role. Verify contact/request/Internal notes, scope, archive status and Open lead record. Reload and reopen the assistant to check restoration. Field can read only assigned leads, including their archived records. A name without an exact reference requires clarification. Team timeline notes and activity are not part of this read.

Change the source record, assignment, owner name/membership or read grant, then check saved cards and derived answers become restricted, and old navigation cannot disclose cached details. Review-only data does not consume lead creation allowance or mutate records. Local API/browser checks use fixture providers; no paid model call is required. Staging is unchanged.


### Assistant lead activity card review

Open [Assistant → LeadActivityCard → Review](http://127.0.0.1:6006/?path=/story/assistant-leadactivitycard--review) and Team Notes. Compare More History (ten shown of 46), empty results, assigned/archived scope, Lost Reason, Former And Unassigned, field clearing, plain/long content and Revoked While Open. Verify exact UTC dates, newest-first ordering, confirmed-assistant attribution, before/after values and keyboard record navigation. All results and callbacks are fictional; no live history tool is connected at this checkpoint. Await design approval before integration. Staging unchanged.


### Live assistant activity and team notes

On a lead detail page, ask “Show activity for this lead” or “Show team notes for this lead.” On Home/Leads use “Show activity of LD-0001” with a permitted lead number. Verify the newest ten entries, matching total, actor/date and confirmed-assistant attribution. Use Open lead record for older history. “Internal notes” belongs to details, while team notes are append-only timeline entries.

Reload and reopen the assistant to verify restoration. Add a note or change the source lead, then check earlier cards and derived answers are restricted. Field can read only assigned records, including readable archived records. Permission revocation, owner-label/membership changes and reassignment must restrict history and old navigation immediately. Historical names are saved labels, not a current roster. Tests use an isolated fixture provider with no paid requests or external emails. Staging unchanged.


## Customers manual integration — October 18, 2026

The approved customer UI is connected locally. See [Customers](customers.md) for routes, authorization boundaries, commands and remaining customer assistant work. Open `http://127.0.0.1:3000/customers` after signing in. Create a contact, search their phone without punctuation, open drawer/profile, edit, add a team note, link a permitted lead, archive/restore, review CSV and test exact-number deletion with unlink consent. Confirm Field has no Customers menu and sees only minimal related contact in assigned leads. Jobs/Estimates and bulk remain unavailable. The embedded contact-drafting mock is omitted from live forms.

Migration 202610180001 was applied to local Docker after a private backup/restore rehearsal and isolated test validation. The standalone test server disables its filesystem cache to avoid unbounded disposable build-cache growth. No required environment variables, paid LLM calls, external email or staging release.

Customer assistant acceptance (October 18): `pnpm --filter @salesmora/web test:e2e customer-chat.spec.ts customers.spec.ts chat-page-context.spec.ts chat-stage-actions.spec.ts` uses the isolated database/provider fixture. It exercises all customer reads/proposals plus explicit UI confirmation, reload and deletion redirect. No paid model calls are made. The migration `202610180002_customer_chat` is applied locally after a native PostgreSQL backup/restore rehearsal. If Docker CLI queries stall while loopback PostgreSQL is healthy, use the installed PostgreSQL client for private backup/rehearsal; never switch the test URL to development. Cold Next route compilation can exceed the default 30-second UI test timeout when production builds run concurrently; run browser checks without competing builds. Manual customer mutations await an authoritative post-save reload before accepting the next action, preventing a new action from using the previous version.


Jobs foundation (October 19): run `corepack pnpm db:migrate:test`, then `corepack pnpm --filter @salesmora/data test:jobs`. The rehearsal is guarded to a separate local `_test` database, uses its own fictional records, checks concurrent writes/tenant/role/version/retry/lifecycle/source relationships and removes its fixtures without resetting existing data. `node scripts/check-jobs-stories.mjs` checks the Jobs stories at desktop/tablet/mobile widths. Customer regressions: `corepack pnpm --filter @salesmora/web test:e2e customers.spec.ts customer-chat.spec.ts`. Run browser checks before production builds. Development migration 202610190001 followed a private backup/restore/migration rehearsal; no new environment values or staging deployment. Jobs routes/tools stay disabled until their reviewed integration. See [foundation details](jobs.md).


Jobs UI batch (October 19): the user explicitly requested the remaining components together. Start with `http://127.0.0.1:6006/?path=/story/jobs-reviewgallery--default`. `node scripts/check-jobs-stories.mjs` checks all Jobs stories at 1440/768/320 px using three isolated browser pages; an optional regex restricts affected entries. There are 196 states/588 checked combinations. The drag-review scenario uses actual desktop/tablet grip dragging and the mobile Move alternative, confirms no premature save, collects a required work date, checks the moved record and waits for the success toast to auto-dismiss before Axe checks. All interactions are fictional local state. See [review boundaries and state index](jobs-components-review.md). No API keys, local DB changes or staging deployment are needed for this UI review.
