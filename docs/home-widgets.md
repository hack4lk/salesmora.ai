# Home widgets

The lead assistant is deferred while the populated Home dashboard is built. Follow `prototype/prototype-screen-03-home-owner.html` and `prototype/prototype-screen-04-home-team.html`, retaining the approved brand and the user's removal of redundant Home title/subtitle and workspace-details actions.

Continue one component at a time: Storybook review, user approval, connection to authorized server data, and local testing. Keep the initial welcome for an empty workspace; replace that welcome with useful dashboard widgets once records exist. Keep Create lead available.

## Build order

1. **Leads by pipeline stage** — approved and connected to Home with real workspace counts. Four existing stages, counts, total, and proportional bars. Desktop follows the prototype's horizontal rows; narrow screens stack bars under stage labels/counts. View pipeline remains unavailable until the destination exists.
2. **Recent activity** — show actual recent lead creations with creator and timestamp. Distinguish this initial lead-creation feed from a future comprehensive activity log.
3. **Needs your attention** — start with real unassigned leads. Follow-up deadlines and stale-record policies need product decisions and tracking data before adding them.
4. **Team workload** — derive assigned lead counts from current workspace memberships. Job workload requires the jobs module.
5. **Summary metrics** — derive lead totals/new-lead counts and unassigned counts. Confirm date-window and attention definitions before adding comparisons; no fabricated growth percentages, conversions, or job totals.

The prototype also includes an assistant, active jobs, job conversion, follow-up queues, and personal job schedules. Those depend on later modules. A user question is pending about hiding unsupported widgets versus showing explicit unavailable states. The first pipeline widget does not depend on that answer. Team-profile prioritization must use the saved office/field profile; it must not invent permission roles or widen record access.

All real queries must be scoped to the authorized current workspace. Member/Owner/Admin visibility must be applied at the server boundary. The prototype uses fictional values; only Storybook fixtures may reuse them.

## First component review

Open http://127.0.0.1:6006/?path=/story/workspace-leadpipelinewidget--default. Review Default, First Lead, Empty, Pipeline Unavailable, Keyboard, Large Counts, Mobile, and Mobile Large Counts.

The bars represent each stage's share of all four stage counts. An accessible meter exposes the stage name and actual count out of the total. Empty data shows zero counts and an explanation. All copy and fixtures live beside the component; Tailwind handles styling, and the SVG bar width is calculated from data.

Storybook remains a mocked component preview. The live Home page now supplies real stage counts after checking workspace membership. The aggregate query also restricts results to the authenticated user’s current membership and selected workspace. Owner, Admin, and Member accounts see their workspace’s counts. Empty workspaces retain the initial welcome; populated workspaces show the widget below Create lead. View pipeline remains unavailable until its destination is built.

## Home content width — October 11, 2026

Home uses the shared shell's full-width option so the assistant and dashboard occupy the available main area instead of being capped at `max-w-4xl`. Responsive edge padding remains 24px on small screens and 40px from the small breakpoint. Form pages retain the standard content width.

Validation: workspace lint/typecheck and all seven shell Storybook interaction/accessibility checks passed; desktop/320px previews have no horizontal overflow. Restored the chat textarea's accessible name after its visible label was removed.
