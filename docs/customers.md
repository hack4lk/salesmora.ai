# Customers — local manual integration

Implemented locally October 18, 2026. See [the Customers plan](customers-page-plan.md#manual-app-integration-checkpoint--october-18-2026) for the detailed status and remaining assistant work.

Open `/customers` after signing in at `http://127.0.0.1:3000`. The workspace menu shows Customers only with full customer-read permission. Owner/Admin/Office receive default grants; saved policy still governs. Field sees only minimal contact information inside currently assigned leads and never gains collection access from customer ownership.

The approved list, drawer and profile support real search/filter/sort/paging, create/edit, soft duplicate review, member assignment, team notes, link/unlink, archive/restore, typed deletion and CSV. Exact IDs, current membership and policy, versions and workspace scoping are enforced in the repository. Customer edits preserve lead contact snapshots. Related work is reauthorized independently; counts and history expose only permitted lead data. Jobs and Estimates stay hidden/unavailable.

Deletion removes customer content and unlinks retained leads after explicit consent; it does not refund lead creation allowance. It requires current customer delete and linked-lead read/update grants. Audit/replay receipts are content-free. Counters do not reuse customer numbers.

The shared assistant now supports customer search/details/history, linked-lead and teammate choices, and proposals for create/edit/assign/notes/linking/lifecycle/export. It is available globally with current app permissions; Field receives only minimal related contact through assigned leads. Exact changes require button confirmation; deletion adds typed-number/unlink consent. Add/Edit dialogs contain only the contact form; customer assistance is provided by the shared global assistant. No new environment variables or staging deployment are included. See the final plan checkpoint for provenance, retention and migration details.

Validation commands:

```sh
corepack pnpm test packages/contracts/src/customer.test.ts packages/domain/src/authorization/authorize.test.ts packages/data/src/leads/csv.test.ts
corepack pnpm --filter @salesmora/web test:e2e customer-chat.spec.ts customers.spec.ts chat-page-context.spec.ts chat-stage-actions.spec.ts
corepack pnpm typecheck
corepack pnpm --filter @salesmora/web build
corepack pnpm storybook:build
```

E2E uses generated accounts in `TEST_DATABASE_URL` only. Never substitute the development or staging database for the disposable test database. Local migration was preceded by `node scripts/backup-local-db.mjs --rehearse`; staging remains a separate approved release.
