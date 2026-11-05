# Google setup for the Gmail Lead Capture pilot

Updated November 4, 2026. The [OAuth/account controls checkpoint](lead-capture-gmail-connections.md) is implemented and tested with fictional provider grants and an intercepted Google redirect. Its two owned migrations and a private encryption keyring are prepared in the main local development environment. The one-time Google app registration is complete; the first real-account consent and local persistence checks passed. Message ingestion remains unavailable.

This is one-time Salesmora operator setup, not a customer onboarding requirement. Customers click **Connect Gmail account**, choose their account on Google's consent page, allow read-only access and return to their saved Salesmora draft. They never create Google Cloud projects, provide client secrets, edit environment files or share their Gmail password. The local pilot uses this same button/consent/callback flow once the Salesmora OAuth application is configured.

## Local Google project

Current pilot selection: `salesmora-admin-access` was inspected and found to use an Internal audience with two existing Cloudflare Access clients. The user approved a separate project, `salesmora-gmail-development`, which was created without changing the admin project. Gmail API is enabled. The user approved the Google API Services User Data Policy and the creation/private local storage of the new web client, **SalesMora Gmail Local Development**. Its callback is `http://127.0.0.1:3000/api/lead-capture/gmail/oauth/callback`, matching the actual app origin. The app uses an External/Testing audience; `lkarpuk@karpukcreative.com` is a saved test user. Declared scopes are only `openid`, email identity and `gmail.readonly`. The generated client credential is stored in ignored `.env.local`; no secret belongs in this guide or release artifacts. The local web server runs under Node 22, the user is signed in, and the connection pilot is enabled only for workspace `ef692d28-7b89-4a23-8a53-8b7436d89bd2` (DRIZL LLP). The existing Gmail draft's Connect Gmail button reached Google successfully. The user completed Google consent on November 4, 2026. The callback returned to the saved draft with `lkarpuk@karpukcreative.com` selected and Connected. A read-only database check verified matching credential generation, successful decryption of the stored encrypted grant, a refresh token, and the Gmail read-only scope. The source remains a draft with no approved version, message jobs, samples, receipts or open eligibility windows. This verifies real account connection only; it does not establish live ingestion acceptance. The examples below use the actual `127.0.0.1` app origin.

1. Select or create a development project in [Google Cloud Console](https://console.cloud.google.com/). Enable the Gmail API for that project.
2. Configure Google Auth platform branding and contact details. For a personal Gmail account or users outside a single Workspace organization, use an External audience in Testing mode. Add the existing Gmail account you will connect under test users. A second sending account needs no API grant unless we also connect it.
3. Configure Data Access for `https://www.googleapis.com/auth/gmail.readonly`, with `openid` and `email` for verified account identity. Do not request mail modification or sending scopes. [Google consent configuration](https://developers.google.com/workspace/guides/configure-oauth-consent), [Gmail scope reference](https://developers.google.com/workspace/gmail/api/auth/scopes).
4. Create an OAuth client of type **Web application**. Register this exact planned authorized redirect URI:

   ```text
   http://127.0.0.1:3000/api/lead-capture/gmail/oauth/callback
   ```

   Use `127.0.0.1` consistently for the app and callback during the pilot. If your actual local app port differs, register that exact port and use it in the application configuration. This is a server redirect flow; a JavaScript origin entry does not replace the redirect URI. [Google web-server OAuth guide](https://developers.google.com/identity/protocols/oauth2/web-server).
5. Keep the client ID and client secret in your ignored local configuration, never in chat, source code, a screenshot or a `NEXT_PUBLIC_` variable. We do not need your Gmail password, an app password or domain-wide delegation.

## Local application configuration

Configure the following in the existing ignored `.env.local`, replacing the Google client/workspace placeholders and preserving the generated encryption keyring. These server settings enable the scoped connection flow; they do not enable Gmail intake.

```dotenv
CAPTURE_GMAIL_CLIENT_ID=your-local-web-client-id
CAPTURE_GMAIL_CLIENT_SECRET=your-local-web-client-secret
CAPTURE_GMAIL_REDIRECT_URI=http://127.0.0.1:3000/api/lead-capture/gmail/oauth/callback
CAPTURE_GMAIL_CONNECTIONS_ENABLED=true
CAPTURE_GMAIL_ENVIRONMENT=local
CAPTURE_GMAIL_WORKSPACE_IDS=your-test-workspace-uuid
CAPTURE_GMAIL_ACTIVE_KEY_ID=local-v1
CAPTURE_GMAIL_CREDENTIAL_KEYS='{"local-v1":"YOUR_BASE64_32_BYTE_KEY"}'
```

The local keyring has already been generated privately; preserve its existing value. Only generate a keyring when setting up a new environment, using Node 22:

```sh
node -e 'const {randomBytes}=require("node:crypto"); process.stdout.write(JSON.stringify({"local-v1":randomBytes(32).toString("base64")})+"\n")'
```

Copy the generated JSON as the quoted keyring value. Keep it in your secret storage; do not send it back in chat. This key is independent of file encryption, application login/session secrets and Google client credentials. Generating a new key on each restart would make stored grants unreadable.

Copy the test workspace UUID from its Salesmora page URL's `workspace` query parameter. The Gmail connection pilot is limited to explicitly listed workspaces. The callback origin must exactly match `BETTER_AUTH_URL`, including hostname and port. After changing configuration, restart the development server. Open that workspace's Gmail capture setup, click **Connect Gmail account**, choose your existing account on Google, approve read-only access and verify that Salesmora returns with the account selected. This does not publish the source or read its messages; the callback verifies Google identity and Gmail profile access only.

## Existing-account test procedure

- Use a dedicated Salesmora test workspace with an eligible Gmail plan, while connecting your chosen existing Gmail account.
- Start with a unique phrase such as `SALESMORA-GMAIL-TEST-<run-id>` in the subject and subject-only matching. Use fictional contact data and a second sender when possible. This keeps unrelated mail out of test intake; Google's read-only grant itself still covers the mailbox.
- Retrieve only the explicitly selected sample in the first sample test. Sample testing creates neither an intake item nor a lead. No historical mailbox import is planned.
- Once the later ingestion checkpoint is ready, explicitly launch the source and send a new matching message. Verify receipt, Intake Review and an explicit decision. Keep application follow-up/notification delivery disabled during these tests.
- Test cancellation, grant revocation and reconnect deliberately. A Workspace administrator may restrict third-party applications; surface that provider denial without claiming the account is connected.
- Google's External Testing refresh tokens expire after seven days for Gmail scopes. Use reconnect when that happens; simulate expiry/revocation in automated tests rather than waiting seven days for every run. [Google token expiration](https://developers.google.com/identity/protocols/oauth2#expiration).

## Staging after local acceptance

Create a separate staging Google project/client and encryption keyring. Add the exact authenticated staging web callback URI, using the same `/api/lead-capture/gmail/oauth/callback` path under its HTTPS origin. Do not use `forms-staging.salesmora.ai`, which serves the forms gateway. Confirm the live authenticated web hostname before registering the URI.

Set `CAPTURE_GMAIL_ENVIRONMENT=staging` and the explicit staging test workspace scope. A local environment configuration is restricted to a development loopback origin and cannot be reused as a hosted staging configuration.

Keep staging credentials in Railway server-side variables; never copy local refresh-token records into staging. Connection credentials are encrypted with environment, workspace and record identity as authenticated context. Web and the eventual Gmail worker need the same staging credential keyring; a worker consuming the refresh service also needs its staging Google client credentials. No Gmail worker task is enabled in this checkpoint. OAuth attempt records remain web-only.

Freeze the reviewed release and complete the migration/backup/restore checks in the [integration plan](lead-capture-gmail-integration-plan.md) before enabling a scoped staging pilot. The main local database now has the two owned Gmail migrations. Staging and hosted configuration have not changed.

## Rotation, restore and disconnect

To rotate keys, add a new key ID while retaining old keys, change the active key ID, and re-encrypt each record under its existing environment/workspace/record binding. Verify all records before retiring the old key. Keep required old keys securely with the backup recovery process. Restoring a database without its original keys cannot recover its Gmail grants; reconnect is then necessary.

The reviewed **Disconnect account** action removes Salesmora's usable local credentials and stops capture that uses that account, including cancelling its pending launch and closing its eligibility window. A draft using another account does not stop an unrelated running mailbox configuration. Reconnecting preserves the stable provider identity and never resumes intake automatically. To revoke the provider grant across Google applications, also remove Salesmora from your Google Account's third-party access settings; the app does not silently perform provider-wide revocation. Retained samples/receipts follow the application's evidence-retention rules. Disabling a worker task alone does not revoke a Gmail grant.

## Local authentication check (November 4, 2026)

The browser shows the user signed in to DRIZL LLP after restarting the web server under the required Node 22. The earlier sign-in failure is no longer reproduced; its original cause was not established. The local reset endpoint returned HTTP 200 for the signed-in app account, and Mailpit recorded one matching “Reset your SalesMora.ai password” message. Local email goes to [Mailpit](http://127.0.0.1:18025), not the external Gmail inbox. Password entry and reset completion remain user actions; reset tokens and message bodies were not opened or included in evidence.

## Live selected-message check (November 4, 2026)

The canonical picker is now connected to authenticated, versioned Gmail search/preview endpoints. The user supplied a fictional test email; the app found it by its unique subject, previewed its text, and copied it into the editable example only after an explicit Use action. This used the current Gmail Demo Intake draft; the earlier archived test source was left intact. See [retrieval implementation and evidence](lead-capture-gmail-samples.md). The live check creates no receipt, intake or lead, and does not enable capture. Durable approval/publication binding subsequently passed locally; see [approval checkpoint](lead-capture-gmail-sample-approval.md). Staging and ingestion remain pending.
