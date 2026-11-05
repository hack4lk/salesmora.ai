# Website activation implementation — local checkpoint

**November 2, 2026 update:** The verified candidate is now deployed to staging web and worker with publication, submissions and scheduling disabled. See the [deployment and runtime verification](lead-capture-activation-staging-20261102.md). The local results below remain the implementation evidence; the scoped pilot is still pending.

Status: **implemented and verified locally; ready for implementation review**. This implements the approved [activation design](lead-capture-activation-plan.md). No hosted flag, credential, deployment, source or receipt was changed by this implementation checkpoint.

## Behavior

Web publication, resume, both detail-review projections and installation selection now share the explicit website policy. Publication is disabled by default and requires a nonempty, bounded UUID allowlist plus the complete existing submission/ingress/provider/budget policy. Production test settings cannot enable it. Schema prerequisites are checked in the caller's transaction. Gmail remains unavailable. Permissions, configuration versions, capacity, assignment, actor-bound retries and audited lifecycle behavior remain server-authoritative.

The private readiness endpoint authenticates a dedicated independent canonical 32-byte base64 token before parsing a body of at most 1 KiB. Its body deadline is two seconds. It accepts only workspace/request UUIDs and returns only the matching identifiers, canonical origin and website readiness, with no-store/no-session responses. It performs no database reads, preventing lock inversion with the worker's transaction.

The worker has a separate scheduler opt-in and explicit workspace scope. It retains the configured knowledge-task mode, filters candidates before reconciliation/transition processing and checks the same schema prerequisites. Each website readiness decision requires a fresh private web response with matching request ID, workspace and canonical origin. Only the approved private service URL is accepted in production. Redirects, bad credentials, non-200/malformed/oversized responses and stalled connections/bodies fail closed; the full network deadline is three seconds. No positive response cache or Gmail fallback is used.

A failed due-transition readiness check keeps the existing blocked-transition behavior: recovery does not automatically relaunch it. Graceful shutdown waits for the current tick. Startup/status output identifies whether capture scheduling is configured and its scope size; this is configuration reporting, not a continuous delivery-health proof. Other worker loops and task settings are preserved.

Actual production-mode installation projection is workspace-gated and still requires the persisted approved publication key. Existing explicitly configured local preview behavior is retained when activation configuration is absent. The draft notice now says to review the setup checks before launch, so an eligible draft does not incorrectly claim that publishing is universally unavailable. Existing approved layouts/components are reused.

## Controls and examples

All new activation controls default off or empty. The dedicated readiness token goes only to web and worker; the worker does not need context, abuse, ingress or Turnstile secrets. The gateway receives none of these new controls.

- Root local example: `.env.example`.
- Web staging fragment: `infra/forms-gateway/web-staging.env.example`.
- Worker staging fragment: `infra/forms-gateway/worker-staging.env.example`; it preserves retention mode and shows the private Railway reference literally, never as a shell command.

No schema migration, package version or lockfile change is required for this slice. A narrow data-policy package export keeps the request proxy/private probe from importing the entire data barrel. The browser harness resolves Next through the web package's module resolver rather than assuming a dependency-directory layout.

## Validation

The release candidate is assembled over the last frozen lifecycle source, excluding concurrent unrelated admin changes in the shared workspace. Its local validation settings contain only local database/auth configuration and are excluded from release artifacts. Database/browser harnesses allocate and drop new random local databases; no configured application/test database is migrated, reset or truncated.

Completed:

- Full isolated unit suite: 3,431 tests across 214 files.
- All workspace typechecks and focused lint passed on the isolated candidate.
- Publication runtime-role rehearsal: 19 groups, including empty/excluded scheduler scope and supplied-authority read projections.
- Lifecycle runtime-role rehearsal: nine groups, including the existing default-unavailable behavior.
- Five native gateway groups passed, including rejection of the private readiness route.
- Three authenticated Chromium journeys passed: real confirmed launch/installation/resume, excluded-workspace rejection and a scheduled launch through the actual private endpoint followed by credential loss and no automatic relaunch. Review-page overflow checks passed at 1440, 768 and 320 pixels.
- Focused security tests cover production policy/scope, schema absence, authenticated API dependency wiring, probe token independence, strict bound responses, malformed/oversized bodies and responses, total deadlines, single in-flight tick and shutdown waiting.

The mobile launch review and footer-focused ready-resume dialog screenshots were visually inspected.

The passing browser rehearsal covers an actual authenticated launch and persisted installation projection, an approved-only resume, denial for an ineligible workspace, and a scheduled launch through the actual private web endpoint followed by credential/readiness loss. It also checks the existing review layout at desktop/tablet/phone widths.

### Local framework validation issue

The isolated pnpm layout produced Next request-context errors in both changed and unrelated notification routes under both development bundlers. These symptoms match the module-identity failure described by the [Next singleton fix](https://github.com/vercel/next.js/pull/97255) and [Node realpath report](https://github.com/nodejs/node/pull/65113); this is an inference from the observed errors, not a demonstrated root-cause proof. A clean physical hoisted dependency layout using the same frozen package versions passed all three real browser journeys. The first layout conversion retained stale per-workspace links; these were removed only in the disposable directory before its clean reinstall. No changes were made to the user’s dependency tree. The activation harness clears only its own temporary build directory and resolves Next through the web package so it supports either layout. No framework patch, dependency upgrade, application-auth bypass or webpack-specific application configuration is retained.

## Review boundary

After local verification, freeze the exact reviewed overlay and deploy it with publication, scheduler and submission switches off. Any hosted activation is a subsequent checkpoint with a dedicated server token, matching private origin/scope, negative readiness verification and a bounded no-email pilot. General publication, Gmail and production activation are not part of this local implementation.

The candidate manifest/archive are recorded under `.local/releases/capture-activation-20261101/`. Release artifacts exclude validation settings, dependencies, generated builds and concurrent unrelated admin edits. The 112 migration files and dependency lockfiles are unchanged from the deployed parent.
