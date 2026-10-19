# Lead creation

The approved manual form follows `prototype/prototype-screen-06-lead-form.html`. The assistant is a separate upcoming component. The local page is `/leads/new?workspace=<workspace ID>`; Home links to the current workspace automatically.

## Saved fields

`leads` stores name, email, phone, requested service, service address, request details, source, pipeline stage, assigned owner, and internal notes. It also records the workspace, authenticated creator, creation time, and submission identity. Name and service are required. The other text fields can be blank. Website, New, and Unassigned are the defaults. Email is trimmed and lowercased. Other text is trimmed; no contact is automatically created or merged.

The shared contract in `packages/contracts/src/lead.ts` independently validates API input, enums, length limits, and unknown fields. The database also constrains stage/source and ties assigned owners to workspace membership. UI validation helps the user; server validation is authoritative.

## Access and retries

- `POST /api/leads` requires a session and the configured same-origin header (`127.0.0.1` locally). Current membership, policy and create/assignment permissions are checked under a workspace lock in the save transaction. Owner/Admin/Office can create by default; Field cannot.
- Owner choices come from current members of the selected workspace, rather than Storybook fixtures. Assigning an outsider or a removed member is rejected. The server sets the creator and never accepts a client-supplied role.
- The page checks current create permission before fetching the minimal assignee list, which independently rechecks authority. An explicit inaccessible workspace shows the branded 404; signed-out visitors go to login. No workspace defaults to the account's first membership, matching Home.
- A submission ID remains stable across failed or lost-response retries. A unique workspace/creator/submission key prevents duplicate records, including concurrent requests. Reusing a saved submission with different details returns a conflict; it does not overwrite the existing lead.
- Pending disables the form; errors preserve entered values. Success confirms persistence and offers Back to Home or Create another lead. Another lead starts a blank form with a fresh submission ID.
- Home aggregates pipeline stages after applying current workspace/read scopes (Field only directly assigned leads, including counts), showing the pipeline widget when leads exist. Its empty welcome disappears once a lead is saved, while a Create lead link remains available only with current create permission. Campaign/activity existence stays false until those modules have storage.

## Local testing

Development and test databases both receive the additive migration `202610110003_leads.ts`. No development accounts, workspaces, or existing records are reset.

Sign in at http://127.0.0.1:3000/login, open Home, and choose Create lead. Fill the form, submit, and confirm the saved message. In Postico, inspect `leads` in the development `salesmora` database to review all saved values. Back to Home should hide the empty welcome. Create another lead should reset the form; Cancel should return Home without saving.

Storybook at http://127.0.0.1:6006/?path=/story/leads-createleadform--default remains a mocked preview. It does not write records.

Run `corepack pnpm test:e2e leads.spec.ts` for real-page and API checks against the isolated `salesmora_test` database. These tests clear only the disposable test database.

The leads list, detail/edit pages, remaining dashboard widgets, campaign creation, and lead assistant are not included in this step. The navigation's Leads list entry remains Coming soon until that destination is built and reviewed.
