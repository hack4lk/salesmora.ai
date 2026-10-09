# SalesMora

SalesMora is a planned all-in-one CRM and operations platform for small and midsize service businesses. It is intended to help teams capture and manage leads, automate follow-up, coordinate estimates and jobs, and connect the tools they already use.

The initial audience includes construction, plumbing, HVAC, electrical, and similar home-service businesses. The product is planned as a subscription-based SaaS application with configurable workflows and carefully controlled AI assistance.

## Project status

This workspace currently contains planning documentation. Application implementation has not started.

## Planned technology

- **Web application:** Next.js App Router with TypeScript
- **UI framework and icons:** Material UI where appropriate, with `@mui/icons-material` as the standard UI icon library; no favicons are used in the application
- **Brand typeface:** Source Sans 3; see the [brand guide](docs/branding.md) for selected colors, logo assets, and font implementation details
- **Runtime:** Node.js
- **Database and migrations:** PostgreSQL with Knex
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

Application scripts and working Docker Compose configuration will be added when the application codebase is established. The local environment design and Knex migration policy are documented in [Local Development Setup](docs/local-development.md).
