import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AssistantPanel } from '@salesmora/ui';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { WorkflowRoutineBookingCard, type WorkflowRoutineBookingCardProps } from './workflow-routine-booking-card';
import { workflowRoutineBookingCardData as copy, workflowRoutineBookingExample as example } from './workflow-routine-booking-card.data';

type Submit = (input: Parameters<WorkflowRoutineBookingCardProps['onSubmit']>[0]) => Promise<void>;
function Preview(args: WorkflowRoutineBookingCardProps) {
  const [state, setState] = useState(args.state);
  return <main className="min-h-screen bg-canvas p-4 text-ink sm:p-6"><h1 className="m-0 text-heading font-semibold">{copy.stories.heading}</h1>
    <h2 className="sr-only">{copy.stories.conversation}</h2>
    <div className="mx-auto mt-5 w-full max-w-xl"><WorkflowRoutineBookingCard {...args} state={state}
      workerSelection={args.workerSelection?{...args.workerSelection,onSubmit:async input=>{await args.workerSelection!.onSubmit(input);setState('confirmed');}}:undefined}
      onSubmit={async input => { await args.onSubmit(input); setState('confirmed'); }} onCancel={async () => { await args.onCancel(); setState('cancelled'); }}/></div>
  </main>;
}
const meta = { title: 'Workflows/Routine Booking', component: WorkflowRoutineBookingCard,
  parameters: { layout: 'fullscreen' }, render: args => <Preview {...args}/>,
  args: { value: example, revision: copy.stories.revision, timezone: copy.stories.timezone, services: copy.stories.services, recipients: copy.stories.recipients,
    state: 'pending', expiresAt: null, canSubmit: true, availabilityReady: true,
    onSubmit: fn<Submit>(async () => {}), onCancel: fn(), onManageAvailability: fn() },
} satisfies Meta<typeof WorkflowRoutineBookingCard>;
export default meta;
type Story = StoryObj<typeof meta>;
const edit = async (canvasElement: HTMLElement) => { const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.edit })); return c; };
export const Review: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByText('Book new unscheduled Maintenance jobs for their assigned people.')).toBeVisible();
  for (const text of ['1 hour', 'Monday–Friday', '8 AM–12 PM', '30 minutes', '14 calendar days', 'Morgan Ellis']) await expect(c.getByText(text, { exact: true })).toBeVisible();
  await expect(c.getByRole('checkbox', { name: 'In-app' })).toBeChecked(); await expect(c.getByRole('checkbox', { name: 'Email' })).toBeChecked();
  await expect(c.queryByLabelText('Send at')).not.toBeInTheDocument(); await expect(c.queryByRole('button', { name: /test|details/i })).not.toBeInTheDocument();
  await expect(args.onSubmit).not.toHaveBeenCalled(); await expect(args.onManageAvailability).not.toHaveBeenCalled();
} };
const workerSelection={mode:'qualified_if_unassigned' as const,qualifiedWorkerCounts:{Maintenance:2,Repairs:0},onManageWorkers:fn(),onSubmit:fn(async()=>{})};
export const QualifiedWorkerReview:Story={args:{workerSelection},play:async({canvasElement})=>{const c=within(canvasElement);await expect(c.getByText(copy.qualifiedSummary('Maintenance'))).toBeVisible();await expect(c.getByText(copy.qualifiedHelp)).toBeVisible();await expect(c.getByText(copy.keep)).toBeVisible();await expect(c.getByRole('button',{name:copy.publish})).toBeEnabled();}};
export const QualifiedWorkerPublish:Story={args:{workerSelection},play:async({canvasElement,args})=>{const c=within(canvasElement);await userEvent.click(c.getByRole('button',{name:copy.publish}));await expect(args.workerSelection!.onSubmit).toHaveBeenCalledWith({revision:args.revision,timezone:args.timezone,values:example,assignmentMode:'qualified_if_unassigned'});await expect(args.onSubmit).not.toHaveBeenCalled();await expect(await c.findByText(copy.labels.confirmed)).toBeVisible();}};
export const ChooseQualifiedWorker:Story={args:{workerSelection:{...workerSelection,mode:'assigned'}},play:async({canvasElement,args})=>{const c=await edit(canvasElement);await userEvent.selectOptions(c.getByLabelText(copy.assignment),'qualified_if_unassigned');await userEvent.click(c.getByRole('button',{name:copy.done}));await expect(c.getByText(copy.qualifiedSummary('Maintenance'))).toBeVisible();await userEvent.click(c.getByRole('button',{name:copy.publish}));await expect(args.workerSelection!.onSubmit).toHaveBeenCalledWith(expect.objectContaining({assignmentMode:'qualified_if_unassigned'}));await expect(args.onSubmit).not.toHaveBeenCalled();}};
export const MissingQualifiedWorkers:Story={args:{workerSelection:{...workerSelection,qualifiedWorkerCounts:{}}},play:async({canvasElement,args})=>{const c=within(canvasElement);await expect(c.getByRole('button',{name:copy.publish})).toBeDisabled();await expect(c.getByText(copy.noWorkers)).toBeVisible();await userEvent.click(c.getByRole('button',{name:copy.manageWorkers}));await expect(args.workerSelection!.onManageWorkers).toHaveBeenCalledOnce();await expect(args.workerSelection!.onSubmit).not.toHaveBeenCalled();}};
export const ChangeToServiceWithoutWorkers:Story={args:{workerSelection},play:async({canvasElement})=>{const c=await edit(canvasElement);await userEvent.selectOptions(c.getByLabelText(copy.service),'Repairs');await expect(c.getByText(copy.noWorkers)).toBeVisible();await expect(c.getByRole('button',{name:copy.publish})).toBeDisabled();}};
export const KeepAssignedPeople:Story={args:{workerSelection:{...workerSelection,qualifiedWorkerCounts:{}}},play:async({canvasElement,args})=>{const c=await edit(canvasElement);await userEvent.selectOptions(c.getByLabelText(copy.assignment),'assigned');await userEvent.click(c.getByRole('button',{name:copy.done}));await expect(c.queryByText(copy.noWorkers)).not.toBeInTheDocument();await userEvent.click(c.getByRole('button',{name:copy.publish}));await expect(args.onSubmit).toHaveBeenCalledWith({revision:args.revision,timezone:args.timezone,values:example});await expect(args.workerSelection!.onSubmit).not.toHaveBeenCalled();}};
export const QualifiedWorkerMobile:Story={args:{workerSelection},globals:{viewport:{value:'phone',isRotated:false}}};
export const ChangeSettings: Story = { play: async ({ canvasElement, args }) => {
  const c = await edit(canvasElement); const user = userEvent.setup({ document: canvasElement.ownerDocument });
  await user.selectOptions(c.getByLabelText(copy.service), 'Repairs'); await user.selectOptions(c.getByLabelText(copy.recipient), 'alex');
  const duration = c.getByLabelText(copy.duration); await user.clear(duration); await user.type(duration, '90');
  await user.click(c.getByRole('button', { name: copy.done }));
  await expect(c.getByText('Book new unscheduled Repairs jobs for their assigned people.')).toBeVisible(); await expect(c.getByText('1 hour 30 min')).toBeVisible();
  await expect(c.getByText('Alex Parker', { exact: true })).toBeVisible(); await expect(args.onSubmit).not.toHaveBeenCalled();
  await user.click(c.getByRole('button', { name: copy.publish }));
  await expect(args.onSubmit).toHaveBeenCalledWith({ revision: args.revision, timezone: args.timezone, values: { ...example, service: 'Repairs', recipientId: 'alex', rules: { ...example.rules, durationMinutes: 90 } } });
} };
export const Publish: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.publish }));
  await expect(args.onSubmit).toHaveBeenCalledWith({ revision: args.revision, timezone: args.timezone, values: example });
  await expect(await c.findByText(copy.labels.confirmed)).toBeVisible(); await expect(c.queryByRole('button', { name: copy.publish })).not.toBeInTheDocument();
} };
export const Cancel: Story = { play: async ({ canvasElement, args }) => {
  const c = await edit(canvasElement); await userEvent.selectOptions(c.getByLabelText(copy.service), 'Repairs');
  await userEvent.click(c.getByRole('button', { name: copy.cancel })); await expect(args.onCancel).toHaveBeenCalledOnce();
  await expect(args.onSubmit).not.toHaveBeenCalled(); await expect(await c.findByText(copy.labels.cancelled)).toBeVisible();
} };
export const MissingWorkingHours: Story = { args: { availabilityReady: false }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByText(copy.missingAvailability)).toBeVisible(); await expect(c.getByRole('button', { name: copy.publish })).toBeDisabled();
  await userEvent.click(c.getByRole('button', { name: copy.manageAvailability })); await expect(args.onManageAvailability).toHaveBeenCalledOnce(); await expect(args.onSubmit).not.toHaveBeenCalled();
} };
export const Incomplete: Story = { args: { value: { ...example, service: '', recipientId: '', rules: { ...example.rules, durationMinutes: null, gapMinutes: null, horizonDays: null, weekdays: [], hours: { startTime: '', endTime: '' } } } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByLabelText(copy.duration)).toHaveValue(null); await expect(c.getByLabelText(copy.start)).toHaveValue('');
  await expect(c.getByRole('button', { name: copy.publish })).toBeDisabled();
} };
export const InvalidWorkPeriod: Story = { play: async ({ canvasElement }) => {
  const c = await edit(canvasElement), input = c.getByLabelText(copy.duration); await userEvent.clear(input); await userEvent.type(input, '240');
  await expect(c.getByText(copy.invalidHours)).toBeVisible(); await expect(c.getByRole('button', { name: copy.publish })).toBeDisabled();
} };
export const NotificationChoices: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('checkbox', { name: 'In-app' })); await userEvent.click(c.getByRole('checkbox', { name: 'Email' }));
  await expect(c.getByRole('button', { name: copy.publish })).toBeDisabled(); await expect(c.getAllByRole('alert')).toHaveLength(1);
  await expect(c.getByText('1 hour', { exact: true })).toBeVisible();
  await userEvent.click(c.getByRole('checkbox', { name: 'Email' })); await userEvent.click(c.getByRole('button', { name: copy.publish }));
  await expect(args.onSubmit).toHaveBeenCalledWith(expect.objectContaining({ values: { ...example, notifications: { inApp: false, email: true } } }));
} };
export const UnavailableRecipient: Story = { args: { recipients: [copy.stories.recipients[1]] }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('button', { name: copy.publish })).toBeDisabled(); await expect(c.queryByText('Morgan Ellis', { exact: true })).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('button', { name: copy.edit })); await userEvent.selectOptions(c.getByLabelText(copy.recipient), 'alex');
  await expect(c.getByRole('button', { name: copy.publish })).toBeEnabled();
} };
export const UnavailableService: Story = { args: { services: [copy.stories.services[1]] }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('button', { name: copy.publish })).toBeDisabled();
  await userEvent.click(c.getByRole('button', { name: copy.edit })); await expect(c.getByLabelText(copy.service)).toHaveValue('');
  await userEvent.selectOptions(c.getByLabelText(copy.service), 'Repairs'); await expect(c.getByRole('button', { name: copy.publish })).toBeEnabled();
} };
export const EditPaused: Story = { args: { editing: { status: 'paused' } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByText(copy.paused)).toBeVisible(); await expect(c.getByRole('button', { name: copy.save })).toBeDisabled();
  await userEvent.click(c.getByRole('button', { name: copy.edit })); await userEvent.selectOptions(c.getByLabelText(copy.recipient), 'alex');
  await userEvent.click(c.getByRole('button', { name: copy.save }));
  await expect(args.onSubmit).toHaveBeenCalledWith(expect.objectContaining({ values: { ...example, recipientId: 'alex' } })); await expect(await c.findByText(copy.updated)).toBeVisible();
} };
export const NoChange: Story = { args: { editing: { status: 'active' } }, play: async ({ canvasElement }) => {
  const c = await edit(canvasElement); await userEvent.click(c.getByRole('checkbox', { name: 'Monday' })); await userEvent.click(c.getByRole('checkbox', { name: 'Monday' }));
  await expect(c.getByRole('button', { name: copy.save })).toBeDisabled();
} };
let finishSave: () => void;
export const SingleSubmission: Story = { args: { onSubmit: fn<Submit>(async () => new Promise<void>(resolve => { finishSave = resolve; })) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.publish }));
  await expect(c.getByRole('button', { name: copy.publish })).toBeDisabled(); await expect(c.getByRole('button', { name: copy.cancel })).toBeDisabled();
  await userEvent.click(c.getByRole('button', { name: copy.publish })); await expect(args.onSubmit).toHaveBeenCalledOnce();
  finishSave(); await expect(await c.findByText(copy.labels.confirmed)).toBeVisible();
} };
export const SaveFailure: Story = { args: { onSubmit: fn<Submit>(async () => { throw Error('Fixture save failure'); }) }, play: async ({ canvasElement, args }) => {
  const c = await edit(canvasElement); await userEvent.selectOptions(c.getByLabelText(copy.recipient), 'alex');
  await userEvent.click(c.getByRole('button', { name: copy.publish })); await expect(await c.findByText(copy.error)).toBeVisible();
  await expect(c.getByLabelText(copy.recipient)).toHaveValue('alex'); await expect(c.getByRole('button', { name: copy.publish })).toBeEnabled();
  await expect(args.onSubmit).toHaveBeenCalledOnce();
} };
export const Expired: Story = { args: { expiresAt: '2020-01-01T00:00:00Z' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(await c.findByText(copy.labels.expired)).toBeVisible(); await expect(c.queryByRole('button', { name: copy.publish })).not.toBeInTheDocument(); await expect(args.onSubmit).not.toHaveBeenCalled();
} };
export const ReadOnly: Story = { args: { canSubmit: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText(copy.readOnly)).toBeVisible(); await expect(c.getByRole('button', { name: copy.publish })).toBeDisabled(); await expect(c.getByRole('checkbox', { name: 'Email' })).toBeDisabled();
} };
export const Mobile: Story = { globals: { viewport: { value: 'phone', isRotated: false } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); const card = c.getByRole('region', { name: example.name }); await expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth + 1);
} };
export const MobileSettings: Story = { globals: { viewport: { value: 'phone', isRotated: false } }, play: async ({ canvasElement }) => {
  const c = await edit(canvasElement); await expect(c.getByLabelText(copy.duration)).toBeVisible();
  const card = c.getByRole('region', { name: example.name }); await expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth + 1);
} };
export const AssistantComposition: Story = { render: function Render(args) {
  const [open, setOpen] = useState(true);
  return <AssistantPanel title="Create a workflow" description="Describe what you’d like to automate." open={open} onOpenChange={setOpen} onNewConversation={fn()}
    composerPlaceholder="Describe a workflow…" onSend={async () => ({ ok: true })}
    messages={[{ id: 'routine-booking-review', role: 'assistant', text: 'Review your booking rules, then publish when you’re ready.' }]}
    renderMessageSupplement={() => <WorkflowRoutineBookingCard {...args}/>}/>;
} };

export const KeyboardSettings: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), user = userEvent.setup({ document: canvasElement.ownerDocument });
  c.getByRole('button', { name: copy.edit }).focus(); await user.keyboard('{Enter}');
  await waitFor(() => expect(c.getByLabelText(copy.name)).toHaveFocus());
  c.getByRole('button', { name: copy.done }).focus(); await user.keyboard('{Enter}');
  await waitFor(() => expect(c.getByRole('heading', { name: example.name })).toHaveFocus());
  await expect(args.onSubmit).not.toHaveBeenCalled();
} };
