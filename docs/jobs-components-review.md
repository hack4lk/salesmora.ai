# Jobs component review — October 19, 2026

The user approved JobStatusBadge and requested all remaining Jobs components together before integration. This batch review replaces the earlier one-component approval cadence for these previews. Calendar UI remains the next module after reviewed Jobs integration.

Start with the [review gallery](http://127.0.0.1:6006/?path=/story/jobs-reviewgallery--default). It groups the complete screens, record components, dialogs and assistant cards. Each Storybook entry has alternate states in its sidebar.

## Complete walkthroughs

- [Board](http://127.0.0.1:6006/?path=/story/jobs-jobspage--default), [table](http://127.0.0.1:6006/?path=/story/jobs-jobspage--table), [detail](http://127.0.0.1:6006/?path=/story/jobs-jobspage--detail).
- [Shared assistant creation review](http://127.0.0.1:6006/?path=/story/jobs-jobspage--assistant-create) and [direct entry/review](http://127.0.0.1:6006/?path=/story/jobs-jobspage--create). No embedded assistant is added to the create dialog.
- [Field list](http://127.0.0.1:6006/?path=/story/jobs-jobspage--field), [Field detail](http://127.0.0.1:6006/?path=/story/jobs-jobspage--field-detail), [read-only detail](http://127.0.0.1:6006/?path=/story/jobs-jobspage--read-only-detail), [closed detail](http://127.0.0.1:6006/?path=/story/jobs-jobspage--closed-detail).
- [Schedule](http://127.0.0.1:6006/?path=/story/jobs-jobspage--schedule), [team](http://127.0.0.1:6006/?path=/story/jobs-jobspage--team), [files](http://127.0.0.1:6006/?path=/story/jobs-jobspage--files), [assistant change proposal](http://127.0.0.1:6006/?path=/story/jobs-jobspage--assistant-review).

## Local app integration

Core board/table/detail/create/action components now also have a real authenticated app controller at `/jobs`. See [current integration status](jobs.md) for the connected feature list. The gallery remains a fictional preview and still includes advanced components whose services are pending.

## Preview boundaries

All records, members, messages, counts and proposals are fictional. Full-page actions update local React state only and reset on refresh; notes/files/team messages are kept separate per selected job. Browser file selection reads metadata for preview only; no uploads, scanning, deletion, AI calls, email, CSV downloads or API requests are performed. Attachment previews are labeled document placeholders. No live Jobs route, menu, model capability, database change or staging deployment is added by this UI batch.

The shared floating AssistantPanel remains the private assistant. JobTeamChat is a separate presentation contract for a future team-visible conversation, with immutable messages, unread divider, text-only composer, Thinking, failed-send preservation, and closed/read-only states. No private assistant transcript is exposed to the team.

Job creation shows the existing/new customer choice, duplicate review reusing DuplicateMatchBanner, explicit primary-owner/Unassigned choice, optional team/work/dates, then a final review. The global assistant creation story uses a fixed labeled fictional proposal, not a natural-language parser. The direct entry flow is also available for review; it is not a second embedded chat.

Board drag and the keyboard/mobile Move control request the same status dialog. Scheduling a date-less job routes to scheduling first. Waiting/cancellation reasons, completion/cancellation confirmation and reopening/deadline review are explicit. Scheduling/deadline dialogs keep their distinct meanings. Conflict stories disable saving until latest values are reloaded; failures retain entered values. Closed jobs retain history and chat read access; authorized file removal remains available independently of job closure.

UI role/capability flags are preview inputs, not authorization. Field primary-owner scheduling assumes an explicit current grant; the stored-template cutover remains pending. Ordinary job editing still needs its reviewed `jobs.update` contract. Job export needs an explicit reviewed export authorization boundary. Attachments need private storage/validation/scanning/quota and uploader/admin checks; team chat needs separate membership-aware persistence. These are not represented as completed backend integrations.

## Component index

| Storybook entry | States |
|---|---:|
| [JobActivityTimeline](http://127.0.0.1:6006/?path=/story/jobs-jobactivitytimeline--default) | 5 |
| [JobAttachmentDialog](http://127.0.0.1:6006/?path=/story/jobs-jobattachmentdialog--default) | 5 |
| [JobCard](http://127.0.0.1:6006/?path=/story/jobs-jobcard--default) | 7 |
| [JobCreateDialog](http://127.0.0.1:6006/?path=/story/jobs-jobcreatedialog--default) | 8 |
| [JobDatesCard](http://127.0.0.1:6006/?path=/story/jobs-jobdatescard--default) | 4 |
| [JobDeadlineDialog](http://127.0.0.1:6006/?path=/story/jobs-jobdeadlinedialog--default) | 6 |
| [JobDetailHeader](http://127.0.0.1:6006/?path=/story/jobs-jobdetailheader--default) | 4 |
| [JobDetailPage](http://127.0.0.1:6006/?path=/story/jobs-jobdetailpage--default) | 4 |
| [JobDetailsCard](http://127.0.0.1:6006/?path=/story/jobs-jobdetailscard--default) | 3 |
| [JobDialog](http://127.0.0.1:6006/?path=/story/jobs-jobdialog--default) | 3 |
| [JobDraftCard](http://127.0.0.1:6006/?path=/story/jobs-jobdraftcard--default) | 11 |
| [JobEditDialog](http://127.0.0.1:6006/?path=/story/jobs-jobeditdialog--default) | 4 |
| [JobExportDialog](http://127.0.0.1:6006/?path=/story/jobs-jobexportdialog--default) | 4 |
| [JobFileDeleteDialog](http://127.0.0.1:6006/?path=/story/jobs-jobfiledeletedialog--default) | 4 |
| [JobFileDescriptionDialog](http://127.0.0.1:6006/?path=/story/jobs-jobfiledescriptiondialog--default) | 3 |
| [JobFiles](http://127.0.0.1:6006/?path=/story/jobs-jobfiles--default) | 7 |
| [JobNoteComposer](http://127.0.0.1:6006/?path=/story/jobs-jobnotecomposer--default) | 7 |
| [JobPeekDrawer](http://127.0.0.1:6006/?path=/story/jobs-jobpeekdrawer--default) | 2 |
| [JobRelatedRecords](http://127.0.0.1:6006/?path=/story/jobs-jobrelatedrecords--default) | 3 |
| [JobResultsCard](http://127.0.0.1:6006/?path=/story/jobs-jobresultscard--default) | 6 |
| [JobRowMenu](http://127.0.0.1:6006/?path=/story/jobs-jobrowmenu--default) | 4 |
| [JobScheduleDialog](http://127.0.0.1:6006/?path=/story/jobs-jobscheduledialog--default) | 7 |
| [JobStatusBadge](http://127.0.0.1:6006/?path=/story/jobs-jobstatusbadge--default) | 8 |
| [JobStatusDialog](http://127.0.0.1:6006/?path=/story/jobs-jobstatusdialog--default) | 9 |
| [JobTeamCard](http://127.0.0.1:6006/?path=/story/jobs-jobteamcard--default) | 3 |
| [JobTeamChat](http://127.0.0.1:6006/?path=/story/jobs-jobteamchat--default) | 6 |
| [JobTeamDialog](http://127.0.0.1:6006/?path=/story/jobs-jobteamdialog--default) | 5 |
| [JobsBoard](http://127.0.0.1:6006/?path=/story/jobs-jobsboard--default) | 6 |
| [JobsEmptyState](http://127.0.0.1:6006/?path=/story/jobs-jobsemptystate--default) | 6 |
| [JobsMetrics](http://127.0.0.1:6006/?path=/story/jobs-jobsmetrics--default) | 4 |
| [JobsPage](http://127.0.0.1:6006/?path=/story/jobs-jobspage--default) | 28 |
| [JobsTable](http://127.0.0.1:6006/?path=/story/jobs-jobstable--default) | 5 |
| [JobsToolbar](http://127.0.0.1:6006/?path=/story/jobs-jobstoolbar--default) | 4 |
| [ReviewGallery](http://127.0.0.1:6006/?path=/story/jobs-reviewgallery--default) | 1 |

Inventory: 34 Storybook entries, 196 states. Sources live in `apps/web/src/features/jobs/`, with colocated copy and fictional stories. Shared StatusBadge, DataTable, MetricCard, FilterBar, Pagination, SideDrawer, ConfirmDialog, Toast, AssistantPanel and CandidatePicker are reused, along with the existing Customers duplicate banner.

## Validation checkpoint

All 588 distinct story/viewport combinations have passing interaction, Axe accessibility, runtime and horizontal-overflow checks across 1440/768/320 px. The final affected-component pass covered 240 combinations; additional results/choice/gallery/phone validation covered 24. Earlier selected-view contrast and board overflow failures were corrected and rechecked. Actual desktop/tablet dragging uses the card grip and routes through review; mobile uses the explicit Move alternative. The movement check verifies no save before confirmation, the required date step, the correct destination card and two-second toast dismissal before final accessibility measurement.

Workspace typecheck, affected ESLint, all 487 unit tests, workspace production builds and Storybook production build passed. Wide board and narrow detail screenshots were visually reviewed. These checks validate the fictional UI batch, not new backend/API/worker integration. No new migration, environment value, provider call or deployment occurred.
