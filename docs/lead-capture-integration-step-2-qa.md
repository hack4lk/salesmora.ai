# Lead Capture integration step 2 — persisted drafts and connected pages

Verified October 31, 2026. Implementation and the follow-up layout corrections were user approved October 31, 2026. Step 1 was user approved and this slice authorized. Routing choice: **one wizard URL per capture source**, with the current step and panel in query parameters.

## Implemented scope

- `/lead-capture?workspace=…` reads a scoped, filtered, paginated source list with real metrics and current capabilities. `/campaigns` redirects existing links to this canonical route.
- `/lead-capture/new?workspace=…` collects source identity before creating a persisted draft. Opening a page never writes a source. Creation retries reuse a frozen payload and request UUID after uncertain responses.
- `/lead-capture/[sourceId]` connects the approved source dashboard and settings to saved data. Beginning a revision clones the immutable approved configuration into a draft, without consuming another source or modifying the approved snapshot.
- `/lead-capture/[sourceId]/setup?workspace=…&step=source|intake|review&panel=…` connects the approved website/Gmail setup and review pages. Step changes retain the controlled draft. Explicit saves advance source and draft versions. Conflicts preserve corrections until confirmed reload. Dirty setup guards browser Back, sidebar navigation, and reload/close.
- Workspace navigation preserves the selected workspace. Only `leadCapture.read/create/update` are enabled; publication, activation, pause/archive/duplicate, intake writes, provider authorization and assistant tools remain later slices.

Server-owned business context and active workspace teammate options replace prototype fixtures. Public email stays empty because the workspace model has no business-email field; the owner's private login email is never substituted. Defaults are editable draft content. Existing hidden privacy, consent, submit label and thank-you content survive round trips. Website field suggestions and Gmail connection/sample extraction controls explicitly remain unavailable. No fake account, sample approval, publication link, launch success or incoming lead is produced.

## Boundaries and concurrency

Every service operation reloads current session identity membership and policy under the workspace authorization lock. Write operations use its exclusive lock before checking optimistic source/draft versions. Cross-workspace source IDs are concealed. Office's create/update grants remain independent; Field cannot access capture sources. Suspension and revocation are checked before replaying a previous successful request.

Strict commands reject unknown keys, client identity, forged Gmail references and inactive or foreign teammates. A new Gmail source/type requires current effective paid-plan entitlement. Existing Gmail configuration can be retained after a plan downgrade without treating the draft as launch approval. Published source type cannot change. Archived sources remain readable but uneditable.

Authenticated API routes return private/no-store responses, validate same-origin writes, reject duplicate/unknown query input and enforce a streamed 2 MB body limit. Server-generated source/draft identities, payload fingerprints, actor-bound durable receipts and redacted events commit in one transaction. Audit failure rolls back the draft change. Retrying a request with different content or a different actor conflicts.

## Verification

- Unit suite: **3,389 tests across 195 files passed**, including adapter coverage for valid defaults, hidden content retention, Gmail references and source-type handoff.
- Disposable database rehearsal: **12 groups passed** using the actual web runtime role after full migration replay. Includes create/save idempotency, stale concurrent writes, scopes, validation, entitlement/provider guards, roster checks, literal search/paging, archive protection, published revisions, audit rollback, Office/Field boundaries and suspension/revocation.
- Chromium browser rehearsal passed: real session/workspace creation, lost creation acknowledgement with one resulting source, save/reload persistence, two-tab conflict and confirmed reload, cache/origin/tenant boundaries, 320px layout, source dashboard to setup navigation, cancelled sidebar and browser Back navigation preserving corrections, and disabled Gmail connection/sample controls. The final run passed in 55.7 seconds.
- Eight connected Storybook variants rendered successfully and fit at 320px: website, Gmail, Gmail fields unavailable, saved review, new source, dashboard, source list and read-only. The website preview was visually inspected.
- All workspace typechecks passed. Focused lint passed (only the repository tooling’s React-version detection notice). Final focused capture/contracts suite: 140 tests across 27 files passed. `git diff --check` passed.

Run `pnpm test:lead-capture-drafts:db` and `pnpm test:lead-capture-drafts:e2e`. Both allocate their own temporary local databases and drop them afterward. The browser harness uses port 3014 and `.next-e2e-capture`, leaving the default test server and development server alone. Optional E2E origin/build-directory settings preserve existing defaults.

## Local rollout

No configured development or shared test database has been migrated or truncated by these checks. The local development ledger was read only: it currently ends at `202610280002_suspension.ts` and does not contain the capture foundation migrations. The connected application pages require the repository's pending migrations and runtime grants before local rollout. That pending chain also contains unrelated admin work; this slice deliberately does not apply that chain to the user's existing database. Storybook review and isolated browser verification do not depend on changing it.

Review the connected screens in Storybook under **Lead Capture / ConnectedDrafts**. Publication, real Gmail OAuth/mapping, public intake and decision workflows still require their separately planned integration checkpoints.

Preview layout correction after review: connected Storybook variants now include the workspace navigation and the same responsive content padding as the application shell. Browser geometry checks passed at 1440px (40px horizontal/top padding) and 320px (24px horizontal, 32px top), without horizontal overflow. The application layout itself already supplied this spacing.

Setup action placement correction after review: the shared setup layout now renders its heading first, step contents second and action footer last. Website and Gmail source/intake panels, final review and new-source creation all use this content slot. Back, Save draft and Continue remain below the content with their existing validation, save locks and discard confirmation. Added a Storybook geometry regression for content before actions. Browser geometry checks passed for 17 page/panel variants at both 1440px and 320px (34 checks), including header/content/footer order and no horizontal overflow. Web typecheck and 120 capture tests across 26 files passed.
