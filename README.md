# SalesMora

SalesMora is a planned all-in-one CRM and operations platform for small and midsize service businesses. It is intended to help teams capture and manage leads, automate follow-up, coordinate estimates and jobs, and connect the tools they already use.

The initial audience includes construction, plumbing, HVAC, electrical, and similar home-service businesses. The product is planned as a subscription-based SaaS application with configurable workflows and carefully controlled AI assistance.

## Project status

This workspace currently contains planning documentation. Application implementation has not started.

## Planned technology

- **Web application:** Next.js App Router with TypeScript
- **Runtime:** Node.js
- **Database and migrations:** PostgreSQL with Knex
- **Background work:** Separate Node.js worker backed by a durable Redis queue
- **Hosting:** Railway
- **AI workflows:** LangChain for bounded tasks such as lead extraction, classification, drafting, and workflow recommendations

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
