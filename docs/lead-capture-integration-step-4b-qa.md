# Lead Capture integration step 4b — persisted default assignment

Implemented October 31, 2026 after approval of the 4a components and the [step 4 plan](lead-capture-integration-step-4-plan.md). User approved this checkpoint October 31, 2026. Continue with 4c public rendering.

## Connected behavior

Settings → Leads now reads and saves the business-default assignment through `/api/settings/leads`. Settings overview and workspace navigation expose the route under the existing `settings.business.read` permission. Updating additionally requires `settings.business.update`; configurable permissions remain authoritative rather than imposing a separate role restriction.

The approved Default assignment component is composed into a page with the established settings header/back link. Saves bind the workspace, current revision and request UUID. Lost-response retries reuse the same identity, current actor authorization is checked before receipt replay, and different payloads/actors or stale revisions conflict. Failed saves preserve corrections. Reloading over unsaved changes requires an explicit confirmation; Keep editing preserves them. API responses are private/no-store and vary by cookie; writes require the configured application origin and bounded strict JSON.

## Initialization, audit and resolution

Forward migration `202610310003_lead_assignment_settings.ts` adds the versioned rule and immutable change audit. Existing workspaces receive the explicit **unassigned** rule at version one. An insert trigger initializes all new workspace creation paths in the same transaction. Initialization uses conflict-safe inserts and does not overwrite an existing rule. Changes record actor, request fingerprint, before/after rule and version atomically.

The server resolver supports either the current business rule or the source's explicit teammate override. It returns readiness, resolved assignee, setting version and resolution basis for future admission evidence. Missing/invalid rules and removed, suspended or deleting teammates fail closed. An explicit unassigned rule is ready and resolves no assignee. Existing leads and approved capture configuration history are not rewritten.

Publication review/approval and due scheduled activation now call this resolver. A scheduler failure restores the blocked work for review; restoring membership does not silently activate it. Real website/Gmail delivery remains unavailable in this checkpoint. Persisting admission evidence, creating public submissions and delivering their notifications remain subsequent integration work.

## Verification

- Assignment rehearsal passed ten grouped checks against a newly allocated disposable database, using web, worker and staff runtime roles. It covers migration backfill/new initialization and rollback, tenant/default role denial, forged/cross-workspace writes, concurrent stale saves, actor-bound and reauthorized retries, read-only settings access, audit rollback/immutability, default-versus-source resolution, unavailable teammates, missing-rule denial, staff write denial, publication/scheduler rechecks and suspension.
- Existing publication rehearsal passed all 18 groups after updating its expected default-assignment readiness.
- Full unit suite passed: 3,397 tests across 199 files, including two new strict contract tests.
- Connected Chromium application rehearsal passed in 1.3 minutes: real account/workspace initialization, Settings overview navigation, persisted save and reload, lost save acknowledgement producing one audit record, actor/version-bound retry, two-tab conflict preserving corrections, Keep editing and confirmed reload, private cache headers, invalid-origin/forged-input/foreign-workspace rejection, then the existing capture wizard persistence/navigation/publication-blocking flow. The initial run used an overly strict teammate-label locator; it was corrected to include the required-field marker, and action timeouts were bounded before the passing rerun.
- Nine composed-page/overview/navigation stories passed at 1440px, 768px and 320px: 27 interaction/accessibility/overflow/browser-error cases. Desktop and mobile page screenshots were visually inspected.
- All workspace typechecks passed. Focused lint passed with only the existing React-version detection notice. `git diff --check` passed.
- The final assignment rehearsal was rerun through `pnpm test:lead-assignment:db` after adding an explicit affected-row check to the versioned update; all ten groups passed again.

Reproduce with Node 22 and pnpm:

```sh
pnpm test:lead-assignment:db
pnpm test:lead-capture-publication:db
pnpm test:lead-capture-drafts:e2e
pnpm test
pnpm -r typecheck
```

Database rehearsals allocate/remove their own local database; the established browser harness also uses a separate disposable database. The configured development/test databases were not migrated, and nothing was deployed. Apply the reviewed migration chain before running the updated settings route against a persistent environment. No DNS, OAuth or live outbound-message action was performed.

Local component/page review: [Lead settings page](http://127.0.0.1:6010/?path=/story/settings-leadsettingspage--default). The Storybook page uses fixtures; the real connection is verified separately by the application browser harness.
