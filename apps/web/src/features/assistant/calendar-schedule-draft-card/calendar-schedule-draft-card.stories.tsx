import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { CalendarScheduleDraftCard, type CalendarScheduleDraftCardProps } from './calendar-schedule-draft-card';
import { calendarScheduleDraftCardData as copy, calendarClearProposalFixture, calendarScheduleProposalFixture, calendarScheduleContextFixture } from './calendar-schedule-draft-card.data';
import { jobStatusBadgeData } from '../../jobs/job-status-badge/job-status-badge.data';
import { calendarEventCardData as eventCopy } from '../../calendar/calendar-event-card/calendar-event-card.data';
const draft = calendarScheduleProposalFixture(), context = calendarScheduleContextFixture(draft);
function Preview(args: CalendarScheduleDraftCardProps) {
  const [current,setCurrent] = useState(args.draft);
  return <main className="mx-auto w-full max-w-2xl p-4 sm:p-8"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.heading}</h1><p className="mb-4 mt-2 text-sm leading-6 text-muted">{copy.stories.notice}</p>
    <CalendarScheduleDraftCard {...args} draft={current} onDecide={args.onDecide ? async request => {
      const result = await args.onDecide!(request);
      if (result.ok) setCurrent(value => ({ ...value,state:request.decision === 'confirm' ? 'confirmed' : 'cancelled',
        records:value.intent === 'clear' && request.decision === 'confirm' ? value.records.map(record => record.type === 'job' && record.status === 'scheduled' ? { ...record,status:'needs-scheduling' as const } : record) : value.records,
      }));
      return result;
    } : undefined}/>
  </main>;
}
const meta = { title:'Assistant/CalendarScheduleDraftCard',component:CalendarScheduleDraftCard,parameters:{ layout:'fullscreen' },
  args:{ draft,context,onDecide:fn(async () => ({ ok:true as const })) },render:args => <Preview {...args}/>,
} satisfies Meta<typeof CalendarScheduleDraftCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play:async ({ canvasElement,args }) => {
  const canvas = within(canvasElement); await expect(canvas.getByText(copy.sharedHelp)).toBeVisible(); await expect(canvas.getByRole('button',{ name:copy.confirm })).toBeEnabled(); await expect(args.onDecide).not.toHaveBeenCalled();
} };
export const ConfirmSchedule: Story = { play:async ({ canvasElement,args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getAllByRole('listitem')).toHaveLength(2); await expect(canvas.getByText(copy.sharedHelp)).toBeVisible();
  await expect(canvas.getByText(`${eventCopy.stories.sam}, ${eventCopy.stories.alex}`)).toBeVisible();
  await userEvent.click(canvas.getByRole('button',{ name:copy.confirm }));
  await expect(args.onDecide).toHaveBeenCalledWith({ proposalId:draft.id,inputHash:draft.inputHash,visitId:draft.visitId,revision:draft.revision,decision:'confirm' });
  await expect(canvas.getByRole('status')).toHaveTextContent(copy.states.confirmed); await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
} };
const unscheduled = { ...draft,from:{ scheduledDate:null,arrivalWindow:null },records:[{ ...draft.records[0],type:'job' as const,status:'needs-scheduling' as const }] };
export const ScheduleNew: Story = { args:{ draft:unscheduled,context:calendarScheduleContextFixture(unscheduled) } };
const workOrder = { ...draft,records:[draft.records[1]] };
export const WorkOrderOnly: Story = { args:{ draft:workOrder,context:calendarScheduleContextFixture(workOrder) } };
export const ArrivalWindowOnly: Story = { args:{ draft:{ ...draft,to:{ ...draft.to,scheduledDate:draft.from.scheduledDate! } } } };
export const NoArrivalWindow: Story = { args:{ draft:{ ...draft,to:{ ...draft.to,arrivalWindow:null } } } };
export const Warnings: Story = { args:{ draft:{ ...draft,warnings:[copy.stories.overlap,copy.stories.busy,copy.stories.unknown,copy.stories.past,copy.stories.after] } },play:async ({ canvasElement }) => {
  const canvas = within(canvasElement); await expect(canvas.getByRole('complementary',{ name:copy.warningTitle })).toBeVisible(); await expect(canvas.getByRole('button',{ name:copy.confirm })).toBeEnabled();
} };
export const Unassigned: Story = { args:{ draft:{ ...draft,crew:[] } } };
const many = { ...draft,records:[draft.records[0],...Array.from({ length:8 },(_,i) => ({ ...draft.records[1],id:`00000000-0000-4000-8000-${String(i + 10).padStart(12,'0')}`,number:`WO-${1010+i}`,title:i % 2 ? eventCopy.stories.workOrderTitle : eventCopy.stories.secondWorkOrderTitle }))] };
export const ManyRecords: Story = { args:{ draft:many,context:calendarScheduleContextFixture(many) },play:async ({ canvasElement }) => {
  const canvas = within(canvasElement); await expect(within(canvas.getByRole('list',{ name:copy.affected })).getAllByRole('listitem')).toHaveLength(9); await expect(canvas.getByText('WO-1017')).toBeInTheDocument();
} };
const long = { ...draft,records:draft.records.map(r => ({ ...r,title:eventCopy.stories.longTitle.repeat(2).slice(0,200) })),crew:[{ id:'alex',name:eventCopy.stories.longName.repeat(3) }],warnings:[copy.stories.longWarning] };
export const LongContent: Story = { args:{ draft:long,context:calendarScheduleContextFixture(long) } };
export const CancelProposal: Story = { play:async ({ canvasElement,args }) => {
  const canvas = within(canvasElement); await userEvent.click(canvas.getByRole('button',{ name:copy.cancel }));
  await expect(args.onDecide).toHaveBeenCalledWith(expect.objectContaining({ decision:'cancel' })); await expect(canvas.getByRole('status')).toHaveTextContent(copy.states.cancelled);
} };
export const Keyboard: Story = { play:async ({ canvasElement,args }) => {
  const canvas = within(canvasElement); canvas.getByRole('button',{ name:copy.confirm }).focus(); await userEvent.keyboard('{Tab}'); await expect(canvas.getByRole('button',{ name:copy.cancel })).toHaveFocus();
  await userEvent.keyboard('{Shift>}{Tab}{/Shift}'); await expect(canvas.getByRole('button',{ name:copy.confirm })).toHaveFocus(); await expect(args.onDecide).not.toHaveBeenCalled();
} };
export const Saving: Story = { args:{ onDecide:fn<NonNullable<CalendarScheduleDraftCardProps['onDecide']>>(() => new Promise(() => {})) },play:async ({ canvasElement,args }) => {
  const canvas = within(canvasElement); await userEvent.dblClick(canvas.getByRole('button',{ name:copy.confirm })); await expect(args.onDecide).toHaveBeenCalledTimes(1);
  await expect(canvas.getByRole('status')).toHaveTextContent(copy.saving); await expect(canvas.getByRole('button',{ name:copy.cancel })).toBeDisabled();
} };
export const FailedDecision: Story = { args:{ onDecide:fn<NonNullable<CalendarScheduleDraftCardProps['onDecide']>>(async () => ({ ok:false,message:copy.stories.error })) },play:async ({ canvasElement }) => {
  const canvas = within(canvasElement); await userEvent.click(canvas.getByRole('button',{ name:copy.confirm })); await expect(canvas.getByRole('alert')).toHaveTextContent(copy.stories.error); await expect(canvas.getByRole('button',{ name:copy.confirm })).toBeEnabled();
} };
export const AwaitingAuthoritativeState: Story = { render:args => <main className="mx-auto w-full max-w-2xl p-4"><h1 className="text-heading font-semibold">{copy.stories.heading}</h1><CalendarScheduleDraftCard {...args}/></main>,play:async ({ canvasElement,args }) => {
  const canvas = within(canvasElement); await userEvent.dblClick(canvas.getByRole('button',{ name:copy.confirm })); await expect(args.onDecide).toHaveBeenCalledTimes(1);
  await expect(canvas.getByRole('status')).toHaveTextContent(copy.awaiting); await expect(canvas.getByRole('button',{ name:copy.confirm })).toBeDisabled();
  await expect(canvas.queryByText(copy.states.confirmed)).not.toBeInTheDocument();
} };
export const Disabled: Story = { args:{ disabled:true },play:async ({ canvasElement,args }) => {
  const canvas = within(canvasElement); for (const button of canvas.getAllByRole('button')) await expect(button).toBeDisabled(); await userEvent.click(canvas.getByRole('button',{ name:copy.confirm })); await expect(args.onDecide).not.toHaveBeenCalled();
} };
export const NoChange: Story = { args:{ draft:{ ...draft,to:{ scheduledDate:draft.from.scheduledDate!,arrivalWindow:draft.from.arrivalWindow } } },play:async ({ canvasElement }) => {
  const canvas = within(canvasElement); await expect(canvas.getByText(copy.noChange)).toBeVisible(); await expect(canvas.getByRole('button',{ name:copy.confirm })).toBeDisabled(); await expect(canvas.getByRole('button',{ name:copy.cancel })).toBeEnabled();
} };
export const Confirmed: Story = { args:{ draft:{ ...draft,state:'confirmed' } } };
export const Cancelled: Story = { args:{ draft:{ ...draft,state:'cancelled' } } };
export const Expired: Story = { args:{ draft:calendarScheduleProposalFixture(Date.now() - 3600000) },play:async ({ canvasElement,args }) => {
  const canvas = within(canvasElement); await expect(canvas.getByRole('status')).toHaveTextContent(copy.states.expired); await expect(canvas.queryByRole('button')).not.toBeInTheDocument(); await expect(args.onDecide).not.toHaveBeenCalled();
} };
export const ExpiresWhileReviewing: Story = { render:args => <Preview {...args} draft={{ ...args.draft,expiresAt:new Date(Date.now() + 1500).toISOString() }}/>,play:async ({ canvasElement,args }) => {
  const canvas = within(canvasElement); await expect(canvas.getByRole('button',{ name:copy.confirm })).toBeEnabled(); await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent(copy.states.expired),{ timeout:5000 }); await expect(args.onDecide).not.toHaveBeenCalled();
} };
async function hidden(canvasElement: HTMLElement) {
  const canvas = within(canvasElement); await expect(canvas.queryByText(draft.records[0].title)).not.toBeInTheDocument(); await expect(canvas.queryByText(draft.timezone)).not.toBeInTheDocument(); await expect(canvas.queryByRole('list')).not.toBeInTheDocument(); await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
}
export const Loading: Story = { args:{ state:'loading' },play:async ({ canvasElement }) => { await hidden(canvasElement); } };
export const Error: Story = { args:{ state:'error' },play:async ({ canvasElement }) => { await hidden(canvasElement); } };
function AccessPreview(args: CalendarScheduleDraftCardProps) {
  const [allowed,setAllowed] = useState(true);
  return <main className="mx-auto w-full max-w-2xl p-4"><h1 className="text-heading font-semibold">{copy.stories.heading}</h1><button type="button" className="min-h-11 rounded-lg border border-line px-3 text-sm focus-visible:focus-ring" onClick={() => setAllowed(false)}>{copy.stories.revoke}</button><CalendarScheduleDraftCard {...args} context={{ ...context,canSchedule:allowed }}/></main>;
}
export const AccessChanged: Story = { render:args => <AccessPreview {...args}/>,play:async ({ canvasElement }) => {
  const canvas = within(canvasElement); await expect(canvas.getByText(draft.records[0].title)).toBeVisible(); await userEvent.click(canvas.getByRole('button',{ name:copy.stories.revoke }));
  const region = canvas.getByRole('region',{ name:copy.title }); await hidden(region); await expect(within(region).getByRole('status')).toHaveTextContent(copy.states.unavailable);
} };
export const MissingContext: Story = { args:{ context:null },play:async ({ canvasElement }) => { await hidden(canvasElement); } };
export const Conflict: Story = { args:{ draft:{ ...draft,state:'conflict' } },play:async ({ canvasElement }) => { await hidden(canvasElement); } };
export const Superseded: Story = { args:{ draft:{ ...draft,state:'superseded' } },play:async ({ canvasElement }) => { await hidden(canvasElement); } };
export const IncompleteAffectedSet: Story = { args:{ context:{ ...context,records:context.records.slice(0,1) } },play:async ({ canvasElement }) => { await hidden(canvasElement); await expect(within(canvasElement).getByRole('status')).toHaveTextContent(copy.states.conflict); } };
export const ClosedRecord: Story = { args:{ draft:{ ...draft,records:[{ ...draft.records[0],type:'job',status:'completed' }] } },play:async ({ canvasElement }) => { await hidden(canvasElement); } };
export const InvalidDate: Story = { args:{ draft:{ ...draft,to:{ ...draft.to,scheduledDate:'2026-02-30' } } },play:async ({ canvasElement }) => { await hidden(canvasElement); } };

const clearDraft = calendarClearProposalFixture();
export const ClearSharedVisit: Story = { args:{ draft:clearDraft,context:calendarScheduleContextFixture(clearDraft) },play:async ({ canvasElement,args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByText(copy.clear.sharedHelp)).toBeVisible();
  await expect(canvas.getByText(copy.clear.impact)).toBeVisible();
  await expect(within(canvas.getByRole('list',{ name:copy.affected })).getAllByRole('listitem')).toHaveLength(2);
  await expect(canvas.getByRole('button',{ name:copy.clear.confirm })).toBeEnabled();
  await expect(args.onDecide).not.toHaveBeenCalled();
} };
export const ConfirmClearSchedule: Story = { args:ClearSharedVisit.args,play:async ({ canvasElement,args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button',{ name:copy.clear.confirm }));
  await expect(args.onDecide).toHaveBeenCalledWith({ proposalId:clearDraft.id,inputHash:clearDraft.inputHash,visitId:clearDraft.visitId,revision:clearDraft.revision,decision:'confirm' });
  await expect(canvas.getByRole('status')).toHaveTextContent(copy.clear.confirmed);
  await expect(canvas.getByText(jobStatusBadgeData['needs-scheduling'].label,{ exact:true })).toBeVisible();
  await expect(canvas.getByText(copy.previous)).toBeVisible();
  await expect(canvas.getByText(copy.saved)).toBeVisible();
} };
const clearWorkOrder = { ...clearDraft,records:[clearDraft.records[1]] };
export const ClearWorkOrder: Story = { args:{ draft:clearWorkOrder,context:calendarScheduleContextFixture(clearWorkOrder) } };
const clearJob = { ...clearDraft,records:[{ ...clearDraft.records[0],type:'job' as const,status:'in-progress' as const }] };
export const ClearInProgressJob: Story = { args:{ draft:clearJob,context:calendarScheduleContextFixture(clearJob) } };
export const CancelClearSchedule: Story = { args:ClearSharedVisit.args,play:async ({ canvasElement,args }) => {
  const canvas = within(canvasElement); await userEvent.click(canvas.getByRole('button',{ name:copy.cancel }));
  await expect(args.onDecide).toHaveBeenCalledWith(expect.objectContaining({ decision:'cancel' }));
  await expect(canvas.getByRole('status')).toHaveTextContent(copy.states.cancelled);
} };
export const ClearExpired: Story = { args:{ draft:calendarClearProposalFixture(Date.now() - 3600000),context:calendarScheduleContextFixture(clearDraft) },play:async ({ canvasElement }) => {
  const canvas = within(canvasElement); await expect(canvas.getByRole('status')).toHaveTextContent(copy.states.expired); await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
} };
export const ClearIncompleteAffectedSet: Story = { args:{ draft:clearDraft,context:{ ...calendarScheduleContextFixture(clearDraft),records:calendarScheduleContextFixture(clearDraft).records.slice(0,1) } },play:async ({ canvasElement }) => { await hidden(canvasElement); } };
export const ClearAccessRemoved: Story = { args:{ draft:clearDraft,context:{ ...calendarScheduleContextFixture(clearDraft),canSchedule:false } },play:async ({ canvasElement }) => { await hidden(canvasElement); } };
export const ClearAwaitingAuthoritativeState: Story = { ...AwaitingAuthoritativeState,args:ClearSharedVisit.args,play:async ({ canvasElement,args }) => {
  const canvas = within(canvasElement); await userEvent.dblClick(canvas.getByRole('button',{ name:copy.clear.confirm }));
  await expect(args.onDecide).toHaveBeenCalledTimes(1); await expect(canvas.getByRole('status')).toHaveTextContent(copy.awaiting);
  await expect(canvas.getByRole('button',{ name:copy.clear.confirm })).toBeDisabled(); await expect(canvas.queryByText(copy.clear.confirmed)).not.toBeInTheDocument();
} };
