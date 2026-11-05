# Active staging form browser checkpoint — November 1, 2026

The user approved the bounded active-form check after the restricted-role checkpoint. The real staging gateway, renderer and submission endpoint passed mobile hosted-page, direct-iframe and JavaScript-loader submission checks. The new fictional canary was archived afterward; submission transport is disabled again. General publication/delivery authority was not enabled.

## Bounded setup

The existing fictional workspace `5d7342e2-f48e-4d5b-a9de-944851aac28d` and its account/session-free synthetic owner were reused. A new source, `d3c1ef5c-e5ac-4eec-b84f-eddf878f4410`, was created and published through the existing authorized data services with a one-shot, workspace-bound delivery authority lasting at most 60 seconds. No deployed self-service publication authority changed.

The reviewed configuration explicitly sets `notifyAssigned: false`, uses fictional `@example.test` contact information and identifies the form as staging verification. Before transport was enabled, a live check confirmed this was the **only active or scheduled source** and that its approved workflow disabled notifications. Temporary transport used the existing real ingress/Turnstile configuration and operating limits. Exactly three requests were submitted, below the existing per-client challenge threshold. No CAPTCHA was completed in this checkpoint; real Turnstile completion was verified earlier.

Configuration-only web redeployments used the existing frozen lifecycle source, manifest SHA-256 `44715c227cf13b86ee6bc1b756a1cd515694f4d974c9232da172d864baa9059b`:

- Temporary transport-enabled deployment: `4b7d80ef-1efe-4602-9f26-ce6a2af12335`, Railway `SUCCESS`.
- Final transport-disabled deployment: `4fc92907-c4db-418c-92fb-dd04615c8e08`, Railway `SUCCESS`.

The browser runner's cleanup path archives the canary and disables transport even if a browser assertion fails. All browser assertions passed on this run.

## Live browser results

An isolated Chromium context loaded a temporary localhost customer-site fixture containing one direct iframe and two real loader embeds. CDP explicitly enabled third-party cookie restriction and disabled the metadata/heuristic exemptions for the embedding page.

- All three embedded forms rendered and their submit controls were usable without forms credentials. Loader height handshakes worked.
- Wrong-origin, wrong-window/channel, invalid-height and extra-field resize messages did not change the checked frame height. Native messages contained only type/version/channel/height metadata.
- Host and frame documents fit at 1440, 768 and 320 pixels. Keyboard navigation traversed the active forms and reached the following host control.
- A standalone hosted form accepted one fictional request at a 320-pixel viewport.
- The direct iframe accepted one fictional request while third-party cookies were restricted.
- The first loader embed accepted one fictional request and shrank after showing `Request received`. The second loader retained its empty inputs and usable submit control.
- Embedded forms requests carried neither Cookie nor Authorization; forms responses set no session cookie. A fictional application-host cookie was retained on an app-origin request. This is a cookie-isolation probe, not an interactive real-user authentication test.
- No page errors occurred. The mobile loader success/untouched-second-embed screenshot was visually inspected.

The three request contacts were `active-embed-hosted@example.test`, `active-embed-direct@example.test` and `active-embed-loader@example.test`. No real contact information was entered.

## Durable evidence and shutdown

The new source has exactly **three durable receipts**, with accepted consent and receipt-processing assignment to the fictional owner. For automatically admitted receipts, linked leads and their owner/new-stage assignment were checked. No assignment notifications or associated email-outbox rows exist for the fictional workspace; no emails were sent by this test.

Archiving used the deployed confirmed lifecycle service with current source version and the synthetic owner's actual workspace permissions. The source ended archived at version 3. There are now **12 retained receipts** across the three archived synthetic sources. The original nine receipts, processing, pending intake, captured lead data, approved configurations and two source versions/statuses retain their earlier hashes/counts. No retained evidence was deleted or reset. The migration ledger remains the same exact 112 names.

After the final deployment, remote verification confirmed `CAPTURE_SUBMISSIONS_ENABLED=false` and `DATABASE_ROLE_ENFORCED=true`. The canary projection returned unavailable with no active definition or submission context; its submission endpoint returned 503 with `state: retry`. No active or scheduled source remains. The final outbox diagnostic was corrected to follow its notification foreign key, then passed; the outbox has no workspace column.

All ten existing app/public smoke assertions and four gateway smoke groups passed again. Web migrations/startup completed without an owner-role warning. Worker, PostgreSQL, Redis and gateway deployment IDs were unchanged; production remained empty. The maintained Railway plan reported configuration already up to date.

Temporary SSH registration was revoked; the account list showed no registered keys. Its isolated agent and local private key files were removed. Safe state, JSON results, browser script and screenshot are retained in `.local/releases/capture-active-embed-20261101/`.

## Next review boundary

This closes the active hosted/embedded cookie-blocked browser gap from the [runtime-role checkpoint](lead-capture-runtime-cutover-20261101.md). General publication authority, delivery/scheduler activation and any production rollout remain subsequent review steps. Real-user login/workspace/assistant readiness is not established by the fictional cookie marker or this canary.
