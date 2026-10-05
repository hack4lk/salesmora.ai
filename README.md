# SalesMora

SalesMora is a planned all-in-one CRM and operations platform for small and midsize service businesses. It is intended to help teams capture and manage leads, automate follow-up, coordinate estimates and jobs, and connect the tools they already use.

The initial audience includes construction, plumbing, HVAC, electrical, and similar home-service businesses. The product is planned as a subscription-based SaaS application with configurable workflows and carefully controlled AI assistance.

## Project status

This workspace currently contains planning documentation. Application implementation has not started.

## Planned technology

- **Web application:** Next.js App Router with TypeScript
- **Runtime:** Node.js
- **Database:** PostgreSQL
- **Background work:** Separate Node.js worker backed by a durable Redis queue
- **Hosting:** Railway
- **AI workflows:** LangChain for bounded tasks such as lead extraction, classification, drafting, and workflow recommendations

## Planned capabilities

- Lead capture through embeddable forms and widgets, with future authenticated email intake
- Lead and customer management, configurable pipelines, and follow-up automation
- Estimates, scheduling, jobs, team assignments, deadlines, and progress tracking
- Integrations with Google, Stripe, Salesforce, and other business systems through modular connectors
- Subscription tiers with free and paid plans
- AI-assisted workflows with approval controls and audit history

## Documentation

- [Product and delivery roadmap](docs/salesmora-product-roadmap.md) — requirements, architecture, integrations, phases, subscription tiers, and acceptance criteria

## Domain

The intended product domain is [salesmora.ai](https://salesmora.ai). Domain ownership and product-name clearance should be confirmed before launch.

## Development

Development setup, environment variables, database migrations, deployment steps, and contribution instructions will be added when the application codebase is established.
