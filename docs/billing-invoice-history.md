# Complete invoice history

Status: connected locally, October 14, 2026. No migration, new environment variable, payment mutation or staging deployment.

Billing initially loads the newest 12 invoices. **Load older invoices** appends up to 12 older records at a time until Stripe reports the end of the workspace customer's history. Existing invoice rows/details remain available during loading or failure; a failed page offers a retry. Invoice count and an end-of-history notice announce progress. Owners and authorized Admins can browse; Office/Field cannot. A workspace's Free plan does not hide previous paid invoices.

## Boundaries and files

- `packages/contracts/src/billing.ts`: strict workspace/cursor request and bounded, browser-safe invoice page DTO. Browsers cannot select a customer, subscription, role or page size.
- `packages/data/src/billing/access.ts`: shared billing-read decision, used inside the locked authorization boundary.
- `packages/data/src/billing/invoices.ts`: rechecks current role/grants on every page, validates sandbox customer metadata against the workspace mapping, verifies the cursor invoice belongs to that customer, then lists older invoices. No provider objects, customer IDs, payment secrets or hosted payment URLs are returned. A shared mapper keeps initial and older invoice totals/statuses consistent; Amount due uses the remaining balance.
- `packages/data/src/billing/summary.ts`: initial page and Billing snapshot use the shared invoice summary mapper.
- `apps/web/src/app/api/billing/invoices/route.ts`: authenticated, uncached GET with strict query validation, duplicate-parameter rejection and generic provider errors.
- `billing-route.tsx`: append/deduplicate results, prevent overlapping requests, abort/ignore stale responses during refresh or unmount, and reset component state when the selected workspace changes. A revoked permission hides the page and refreshes authorization.
- `billing-page.tsx` and its copy/stories: older-page control, count, busy/error/retry/end states. Existing invoice details remain inline. Loading the final page moves focus to the progress notice if removing the button would otherwise strand focus on the document body.

Refreshing Billing discards previously appended pages and fetches the newest snapshot. It does not let an older response restore stale rows. The initial and paged list retain all invoice statuses supported by the existing Billing DTO; no subscription-only filter excludes older invoices from prior plans. This section adds browsing, rather than invoice export or billing-contact editing.

Pagination follows Stripe's customer filter and `starting_after` cursor: [official invoice-list API](https://docs.stripe.com/api/invoices/list).

## Storybook review

Under `Settings/BillingPage`: OlderInvoices, OlderInvoicesLoading, OlderInvoicesError, CompleteInvoiceHistory and AdminInvoiceHistory. Existing default/connected previews remain available.

## Local verification

The isolated sandbox/browser test creates 26 fictional $0 draft invoices and a second customer's foreign cursor. It checks 12/12/2 paging, uniqueness, no-store output, Owner/Admin reads, Field/signed-out/cross-workspace denial, strict query validation and foreign-cursor rejection. Browser checks cover mobile load/retry, final-page exhaustion, older invoice selection and refresh racing a delayed page. Admin revocation is rechecked on the next request. Draft invoices/customers are cleaned up without finalizing, emailing or charging them.

397 unit tests, workspace type checks, lint and production app/worker/Storybook builds passed. Ten desktop/mobile story reviews passed interaction/accessibility/overflow checks; the mobile error/retry screenshot was reviewed. The final real Stripe sandbox/browser test passed, including all 26 invoices, mobile retry/end states, older detail selection, delayed-response refresh protection and revoked Admin access. No test invoice was finalized or charged.


## Staging release — October 14, 2026

This section was included in the approved combined staging release. Web and worker reached SUCCESS; migrations and HTTPS fictional-account verification completed. Stripe remains sandbox-only. Historical local-only notes above describe the earlier review checkpoints. See [release evidence](railway-staging.md#billing-and-account-follow-up-release--october-14-2026).
