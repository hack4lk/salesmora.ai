# SalesMora

SalesMora is a planned all-in-one CRM and operations platform for small and midsize service businesses. It is intended to help teams capture and manage leads, automate follow-up, coordinate estimates and jobs, and connect the tools they already use.

The initial audience includes construction, plumbing, HVAC, electrical, and similar home-service businesses. The product is planned as a subscription-based SaaS application with configurable workflows and carefully controlled AI assistance.

## Project status

The pnpm workspace, Next.js app, separate worker scaffold, and Storybook are bootstrapped. `/register` creates real local accounts using PostgreSQL, Knex migrations, and Better Auth. Registration starts a database-backed session and opens a protected `/setup` handoff. Storybook remains mocked. `/login` now signs in existing local accounts and resumes setup. Password recovery now works locally through Mailpit. Business onboarding, email verification, and CRM behavior follow through individual approval checkpoints.

## Planned technology

- **Web application:** Next.js App Router with TypeScript
- **UI framework and icons:** Tailwind CSS for styling, Material UI for controls and behavior, with `@mui/icons-material` as the standard UI icon library; no favicons are used in the application
- **Brand typeface:** Source Sans 3; see the [brand guide](docs/branding.md) for selected colors, logo assets, and font implementation details
- **Runtime:** Node.js
- **Database and migrations:** PostgreSQL with Knex
- **Authentication:** Better Auth, with server-side validation and database-backed sessions
- **Background work:** Separate Node.js worker using BullMQ on durable Redis
- **Hosting:** Railway
- **AI workflows:** LangChain for bounded tasks such as lead extraction, classification, drafting, and workflow recommendations
- **UI component workbench:** Storybook for developing and documenting shared React components once the Next.js application is established; it is a development tool, not part of the production runtime

## Planned capabilities

- Lead capture through embeddable forms and widgets, with future authenticated email intake
- Lead and customer management, configurable pipelines, and follow-up automation
- Estimates, scheduling, jobs, team assignments, deadlines, and progress tracking
- Integrations with Google, Stripe, Salesforce, and other business systems through modular connectors
- Future email marketing plugins, such as Mailchimp, for consent-aware audience sync and campaign engagement tracking
- Three subscription tiers: Free, Standard, and Premium
- AI-assisted workflows with approval controls and audit history

## Documentation

- [Component conventions](docs/component-conventions.md) — per-component copy data, Tailwind styling, and review rules

- [Auth and onboarding build tracker](docs/auth-onboarding-build-tracker.md) — current implementation step, package checklist, registration/login/onboarding screens, and verification results
- [Implementation start plan](docs/implementation-start-plan.md) — verified repository baseline, staged implementation sequence, first vertical slice, validation gates, and recommended first task
- [Product and delivery roadmap](docs/salesmora-product-roadmap.md) — requirements, architecture, integrations, phases, subscription tiers, and acceptance criteria
- [Interactive prototype plan](docs/interactive-prototype-plan.md) — screen-by-screen prototype order, interactions, review gates, and open decisions
- [User journeys](docs/user-journeys.md) — current decisions and open questions for login, lead-source setup, website capture, and Gmail intake
- [First-login onboarding](docs/first-login-onboarding.md) — working step-by-step plan for new account owners and invited teammates
- [Context-aware agent architecture](docs/context-aware-agent-architecture.md) — proposed screen context, scoped tools, data retrieval, vector-search options, and rollout plan
- [U.S.-first privacy and messaging baseline](docs/privacy-and-messaging-baseline.md) — MVP data-handling rules and legal/security review gates for website intake, Gmail, outbound email, and future SMS
- [Application structure plan](docs/application-structure-plan.md) — approved Next.js routes, workspace/package boundaries, feature modules, shared UI/branding foundation, and component guidance
- [Brand guide](docs/branding.md) — selected Mosaic logo, Blue & Seafoam palette, asset rules, and typography review links
- [Campaign dashboard](docs/campaign-dashboard.md) — confirmed campaign metrics and a proposed layout for monitoring campaign activity
- [Reporting and data export](docs/reporting-and-data-export.md) — proposed reporting surfaces, Phase 1 reports and CSV exports, access controls, and later-phase options
- [Job module plan](docs/job-module-plan.md) — proposed job creation, monitoring, assignment, status, deadline, and notification workflows
- [Diagram plan](docs/diagram-plan.md) — ordered inventory for the user-flow, workflow, architecture, and data diagrams
- [End-to-end user flow diagram](docs/diagrams/01-end-to-end-user-flow.md) — first high-level map from campaign setup through lead and job outcomes
- [Local development setup](docs/local-development.md) — proposed Docker Compose services, local environment variables, testing approach, and Knex migration/rollback workflow

## Domain

The intended product domain is [salesmora.ai](https://salesmora.ai). Domain ownership and product-name clearance should be confirmed before launch.

## Development

Use Node 22.23.3 (`nvm use`) and the pinned pnpm through Corepack.

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm db:setup
corepack pnpm dev
```

In a second terminal, run `corepack pnpm storybook`. The app runs at http://127.0.0.1:3000 and Storybook at http://127.0.0.1:6006. See [Local testing and approval](docs/local-testing.md) for the review checklist and restart/check commands. Docker must be running for registration. `db:setup` creates an ignored `.env.local` with random credentials and an isolated PostgreSQL service on port 55432 plus Mailpit on SMTP 11025/inbox 18025. It does not change other projects’ databases. No email/provider credentials are required yet.

Quality checks: `corepack pnpm lint`, `corepack pnpm typecheck`, `corepack pnpm build`, and `corepack pnpm storybook:build`. `corepack pnpm worker:dev` runs the worker scaffold; queues are not configured yet.

See [Registration backend](docs/registration-backend.md) for the implemented schema, commands, test isolation, and remaining launch requirements. This local milestone is not ready for public launch; legal documents and email verification are still pending.

Password recovery is available locally: [test the complete reset flow](docs/password-recovery.md), including the Mailpit inbox at http://127.0.0.1:18025.
