import { useRef, useState } from 'react';
import { AssistantPanel } from '@salesmora/ui';
import { assistantPanelData as assistantCopy } from '../../../../../../packages/ui/src/assistant/assistant-panel/assistant-panel.data';
import { contextChipData as chipCopy } from '../../../../../../packages/ui/src/assistant/context-chip/context-chip.data';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { CalendarVisitPeekDrawer, type CalendarVisitPeekDrawerProps } from './calendar-visit-peek-drawer';
import { calendarVisitPeekDrawerData as copy, calendarVisitPeekFixtures as fixtures } from './calendar-visit-peek-drawer.data';
import { calendarEventCardData } from '../calendar-event-card/calendar-event-card.data';

function Preview(args: CalendarVisitPeekDrawerProps) {
  const [open, setOpen] = useState(args.open);
  return <main className="min-h-screen bg-canvas p-4 text-ink sm:p-6">
    <h1 className="m-0 text-heading font-semibold">{copy.stories.title}</h1>
    <button type="button" onClick={() => setOpen(true)} className="mt-6 min-h-11 cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 font-semibold text-primary focus-visible:focus-ring">{copy.stories.launch}</button>
    <CalendarVisitPeekDrawer {...args} open={open} onClose={() => { args.onClose(); setOpen(false); }}/>
  </main>;
}
const meta = {
  title: 'Calendar/CalendarVisitPeekDrawer', component: CalendarVisitPeekDrawer, render: args => <Preview {...args}/>, parameters: { layout: 'fullscreen' },
  args: { open: true, visit: fixtures.shared, onClose: fn(), onOpenRecord: fn(), onSchedule: fn(), onRetry: fn() },
} satisfies Meta<typeof CalendarVisitPeekDrawer>;
export default meta;
type Story = StoryObj<typeof meta>;
const dialogFor = async (canvas: HTMLElement) => {
  const dialog = within(canvas.ownerDocument.body).getByRole('dialog');
  await waitFor(() => expect(dialog).toBeVisible());
  return within(dialog);
};
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const d = await dialogFor(canvasElement);
  await expect(d.getByText(copy.shared)).toBeVisible();
  await expect(d.getByText(fixtures.shared.location!)).toBeVisible();
  await expect(d.getByText('9 AM – 11 AM')).toBeVisible();
  await userEvent.click(d.getByRole('button', { name: copy.openRecord('job', 'J-1042') }));
  await expect(args.onOpenRecord).toHaveBeenCalledWith({ type: 'job', id: fixtures.shared.records[0].id });
  await userEvent.click(d.getByRole('button', { name: copy.reschedule }));
  await expect(args.onSchedule).toHaveBeenCalledWith(fixtures.shared.id);
} };
export const JobOnly: Story = { args: { visit: fixtures.job } };
export const WorkOrderOnly: Story = { args: { visit: fixtures.workOrder }, play: async ({ canvasElement, args }) => {
  const d = await dialogFor(canvasElement);
  await expect(d.queryByText(copy.shared)).toBeNull();
  await userEvent.click(d.getByRole('button', { name: copy.openRecord('work_order', 'WO-1007') }));
  await expect(args.onOpenRecord).toHaveBeenCalledWith({ type: 'work_order', id: fixtures.workOrder.records[0].id });
} };
export const FieldScoped: Story = { args: { visit: fixtures.field }, play: async ({ canvasElement }) => {
  const d = await dialogFor(canvasElement);
  await expect(d.queryByText(/J-1042/)).toBeNull();
  await expect(d.queryByText(calendarEventCardData.stories.alex)).toBeNull();
  await expect(d.getByRole('button', { name: copy.reschedule })).toBeDisabled();
  await expect(d.getByText(copy.noLocation)).toBeVisible();
} };
export const ReadOnly: Story = { args: { visit: { ...fixtures.shared, canReschedule: false } }, play: async ({ canvasElement, args }) => {
  const d = await dialogFor(canvasElement);
  await expect(d.getByText(copy.readOnly)).toBeVisible();
  await userEvent.click(d.getByRole('button', { name: copy.reschedule }));
  await expect(args.onSchedule).not.toHaveBeenCalled();
} };
export const Unscheduled: Story = { args: { visit: { ...fixtures.job, scheduledDate: null, arrivalWindow: null, crew: [], completionDeadline: null, nextStep: null } } };
export const Waiting: Story = { args: { visit: { ...fixtures.job, waiting: true, records: [{ ...fixtures.job.records[0], type: 'job', status: 'waiting' }] } } };
export const Overdue: Story = { args: { visit: { ...fixtures.shared, completionDeadline: { date: '2026-10-19', overdue: true } } } };
export const LongContent: Story = { args: { visit: fixtures.long } };
export const Loading: Story = { args: { state: 'loading' }, play: async ({ canvasElement }) => {
  const d = await dialogFor(canvasElement);
  await expect(d.getByRole('status')).toHaveTextContent(copy.loading);
  await expect(d.queryByText(fixtures.shared.customerName)).toBeNull();
  await expect(d.queryByRole('button', { name: copy.reschedule })).toBeNull();
} };
export const Error: Story = { args: { state: 'error' }, play: async ({ canvasElement, args }) => {
  const d = await dialogFor(canvasElement);
  await expect(d.queryByText(fixtures.shared.customerName)).toBeNull();
  await userEvent.click(d.getByRole('button', { name: copy.retry }));
  await expect(args.onRetry).toHaveBeenCalledTimes(1);
} };
export const Keyboard: Story = { args: { open: false }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), user = userEvent.setup({ document: canvasElement.ownerDocument });
  const launch = c.getByRole('button', { name: copy.stories.launch });
  launch.focus(); await user.keyboard('{Enter}');
  await dialogFor(canvasElement);
  await user.keyboard('{Escape}');
  await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole('dialog')).toBeNull());
  await expect(args.onClose).toHaveBeenCalledTimes(1);
  await expect(launch).toHaveFocus();
} };


/** Presentation handoff only: no route context, tool scope or server call is added by this preview. */
function AssistantPreview(args: CalendarVisitPeekDrawerProps) {
  const [peekOpen,setPeekOpen] = useState(args.open),[assistantOpen,setAssistantOpen] = useState(false),[selected,setSelected] = useState(false);
  const returnFocus = useRef<HTMLButtonElement>(null);
  const label = copy.assistantContext(args.visit?.records.map(record => record.number) ?? []);
  return <main className="min-h-screen bg-canvas p-4 text-ink sm:p-6">
    <h1 className="m-0 text-heading font-semibold">{copy.stories.title}</h1><p className="mt-3 text-sm leading-6 text-muted">{copy.stories.assistantNotice}</p>
    <button ref={returnFocus} type="button" onClick={() => setPeekOpen(true)} className="mt-6 min-h-11 cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 font-semibold text-primary focus-visible:focus-ring">{copy.stories.launch}</button>
    {peekOpen && <CalendarVisitPeekDrawer {...args} open onClose={() => { args.onClose();setPeekOpen(false); }} onAskAssistant={args.onAskAssistant ? visitId => {
      args.onAskAssistant!(visitId);setPeekOpen(false);setSelected(true);setAssistantOpen(true);
    } : undefined}/>}
    <AssistantPanel open={assistantOpen} onOpenChange={setAssistantOpen} returnFocusRef={returnFocus} description={copy.stories.assistantDescription}
      contextLabel={selected ? label : undefined} onClearContext={() => setSelected(false)} sendDisabled onSend={async () => ({ ok:true })}/>
  </main>;
}
export const AssistantReady: Story = { args:{ onAskAssistant:fn() },render:args => <AssistantPreview {...args}/>,play:async ({ canvasElement }) => {
  const d = await dialogFor(canvasElement);await expect(d.getByRole('button',{ name:copy.askAssistant })).toBeEnabled();await expect(d.getByText(copy.assistantHelp)).toBeVisible();
} };
export const AskAssistant: Story = { ...AssistantReady,play:async ({ canvasElement,args }) => {
  const d = await dialogFor(canvasElement);await userEvent.click(d.getByRole('button',{ name:copy.askAssistant }));
  const body = within(canvasElement.ownerDocument.body),dialog = await body.findByRole('dialog',{ name:assistantCopy.title });
  await expect(body.getAllByRole('dialog')).toHaveLength(1);await expect(args.onAskAssistant).toHaveBeenCalledWith(fixtures.shared.id);await expect(args.onSchedule).not.toHaveBeenCalled();
  const chat = within(dialog),label = copy.assistantContext(fixtures.shared.records.map(record => record.number));
  await expect(chat.getByRole('button',{ name:chipCopy.clear(label) })).toBeVisible();await expect(chat.getByRole('textbox',{ name:assistantCopy.composer })).toHaveFocus();
  await expect(chat.getByRole('button',{ name:assistantCopy.submit })).toBeDisabled();
} };
export const ClearVisitContext: Story = { ...AssistantReady,play:async ({ canvasElement }) => {
  const d = await dialogFor(canvasElement);await userEvent.click(d.getByRole('button',{ name:copy.askAssistant }));
  const body = within(canvasElement.ownerDocument.body),chat = within(await body.findByRole('dialog',{ name:assistantCopy.title }));
  const clear = chat.getByRole('button',{ name:chipCopy.clear(copy.assistantContext(fixtures.shared.records.map(record => record.number))) });
  await userEvent.click(clear);await expect(chat.queryByRole('button',{ name:/Clear assistant context/ })).not.toBeInTheDocument();
  await expect(chat.getByRole('textbox',{ name:assistantCopy.composer })).toHaveFocus();
} };
export const ReadOnlyWithAssistant: Story = { ...AssistantReady,args:{ ...AssistantReady.args,visit:{ ...fixtures.shared,canReschedule:false } },play:async ({ canvasElement }) => {
  const d = await dialogFor(canvasElement);await expect(d.getByRole('button',{ name:copy.reschedule })).toBeDisabled();await expect(d.getByRole('button',{ name:copy.askAssistant })).toBeEnabled();
} };
export const AssistantBusy: Story = { ...AssistantReady,args:{ ...AssistantReady.args,assistantDisabled:true },play:async ({ canvasElement,args }) => {
  const d = await dialogFor(canvasElement);const button = d.getByRole('button',{ name:copy.askAssistant });await expect(button).toBeDisabled();await userEvent.click(button);await expect(args.onAskAssistant).not.toHaveBeenCalled();await expect(d.getByText(copy.assistantBusy)).toBeVisible();
} };
export const NoAssistantAccess: Story = { ...AssistantReady,args:{ onAskAssistant:undefined },play:async ({ canvasElement }) => {
  const d = await dialogFor(canvasElement);await expect(d.queryByRole('button',{ name:copy.askAssistant })).not.toBeInTheDocument();
} };
export const LoadingWithAssistant: Story = { ...AssistantReady,args:{ ...AssistantReady.args,state:'loading' },play:async ({ canvasElement,args }) => {
  const d = await dialogFor(canvasElement);await expect(d.queryByRole('button',{ name:copy.askAssistant })).not.toBeInTheDocument();await expect(d.queryByText(fixtures.shared.customerName)).not.toBeInTheDocument();await expect(args.onAskAssistant).not.toHaveBeenCalled();
} };
export const UnscheduledWithAssistant: Story = { ...AssistantReady,args:{ ...AssistantReady.args,visit:{ ...fixtures.job,scheduledDate:null,arrivalWindow:null } } };
export const LongContentWithAssistant: Story = { ...AssistantReady,args:{ ...AssistantReady.args,visit:fixtures.long } };
export const KeyboardAssistant: Story = { ...AssistantReady,args:{ ...AssistantReady.args,open:false },play:async ({ canvasElement }) => {
  const canvas = within(canvasElement),body = within(canvasElement.ownerDocument.body),user = userEvent.setup({ document:canvasElement.ownerDocument });
  const launch = canvas.getByRole('button',{ name:copy.stories.launch });launch.focus();await user.keyboard('{Enter}');
  const d = await dialogFor(canvasElement);d.getByRole('button',{ name:copy.askAssistant }).focus();await user.keyboard('{Enter}');
  const chat = within(await body.findByRole('dialog',{ name:assistantCopy.title }));await expect(chat.getByRole('textbox',{ name:assistantCopy.composer })).toHaveFocus();
  chat.getByRole('button',{ name:assistantCopy.collapse }).focus();await user.keyboard('{Enter}');await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());await expect(launch).toHaveFocus();
} };
