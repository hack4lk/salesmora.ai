import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { CalendarReportFilters, calendarReportFilterHelp, type CalendarReportFiltersValue, type CalendarReportFilterContext } from './calendar-report-filters';

const empty: CalendarReportFiltersValue = { participants: [], recordTypes: [] };
const options = {
  participants: [{ value: 'alex', label: 'Alex' }, { value: 'blair', label: 'Blair' }],
  recordTypes: [{ value: 'job', label: 'Job' }, { value: 'work_order', label: 'Work Order' }],
};
const meta = {
  title: 'Reports/CalendarReportFilters', component: CalendarReportFilters, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Canonical Calendar participant/record-type filters composing the shared searchable multi-select controls. OR within facets, AND across; empty means all currently authorized values. Hosts match authorized active records by type before matching participants, keep canonical visits distinct and withhold unrelated record/crew context. Selected people bound person/busy/overlap projections. Own scope exposes Me only; Work Order access never grants parent-Job access. No unassigned sentinel or status facet. Scheduled/review views share a dated draft; unscheduled current queues have an independent draft and no date predicate. These stories exercise configuration only; aggregation and workspace integration follow review.' } } },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="mx-auto max-w-6xl"><Story /></div></main>],
  args: { value: empty, options, context: 'dated', scope: { kind: 'workspace' }, canRead: true, onChange: fn(), onRetry: fn() },
} satisfies Meta<typeof CalendarReportFilters>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: function Host(args) {
    const [value, setValue] = useState<CalendarReportFiltersValue>(args.value);
    return <CalendarReportFilters {...args} value={value} onChange={next => { args.onChange(next); setValue(next); }} />;
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    await expect(c.queryByRole('combobox', { name: /status/i })).not.toBeInTheDocument();
    for (const [facet, choices] of [['Current participant', ['Alex', 'Blair']], ['Record type', ['Job', 'Work Order']]] as const) {
      await userEvent.click(c.getByRole('combobox', { name: facet }));
      await userEvent.keyboard('{ArrowDown}');
      for (const label of choices) {
        const option = await body.findByRole('option', { name: label });
        await waitFor(() => expect(option).toBeVisible());
        await userEvent.click(option);
      }
      await expect(body.queryByRole('option', { name: 'Unassigned' })).not.toBeInTheDocument();
      await userEvent.keyboard('{Escape}');
    }
    await expect(args.onChange).toHaveBeenLastCalledWith({ participants: ['alex', 'blair'], recordTypes: ['job', 'work_order'] });
    await userEvent.click(c.getByRole('button', { name: 'Remove filter: Record type: Job' }));
    await expect(args.onChange).toHaveBeenLastCalledWith({ participants: ['alex', 'blair'], recordTypes: ['work_order'] });
    await userEvent.click(c.getByRole('button', { name: 'Clear all' }));
    await expect(args.onChange).toHaveBeenLastCalledWith(empty);
  },
};
export const Unscheduled: Story = { args: { context: 'unscheduled' }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText('Unscheduled current queue / independent filters, no visit-date filter')).toBeVisible();
} };
export const SeparateDrafts: Story = {
  render: function Host(args) {
    const [view, setView] = useState<'scheduled' | 'review' | 'unscheduled'>('scheduled');
    const context: CalendarReportFilterContext = view === 'unscheduled' ? 'unscheduled' : 'dated';
    const [drafts, setDrafts] = useState<Record<CalendarReportFilterContext, CalendarReportFiltersValue>>({
      dated: { participants: ['alex'], recordTypes: ['job'] }, unscheduled: { participants: ['blair'], recordTypes: ['work_order'] },
    });
    return <div className="grid gap-4">
      <label>Preview Calendar view <select aria-label="Preview Calendar view" value={view}
        className="min-h-11 rounded-xl border border-line bg-paper px-3 text-ink"
        onChange={event => {
          const next = event.target.value;
          if (next === 'scheduled' || next === 'review' || next === 'unscheduled') setView(next);
        }}>
        <option value="scheduled">Scheduled visits</option><option value="review">Schedule review</option><option value="unscheduled">Unscheduled queues</option>
      </select></label>
      <CalendarReportFilters {...args} context={context} value={drafts[context]}
        onChange={value => { args.onChange(value); setDrafts(current => ({ ...current, [context]: value })); }} />
    </div>;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement), select = c.getByRole('combobox', { name: 'Preview Calendar view' });
    await expect(c.getByRole('button', { name: 'Remove filter: Current participant: Alex' })).toBeVisible();
    await userEvent.selectOptions(select, 'review');
    await expect(c.getByRole('button', { name: 'Remove filter: Current participant: Alex' })).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Remove filter: Record type: Job' }));
    await userEvent.selectOptions(select, 'unscheduled');
    await expect(c.getByRole('button', { name: 'Remove filter: Current participant: Blair' })).toBeVisible();
    await expect(c.getByRole('button', { name: 'Remove filter: Record type: Work Order' })).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Clear all' }));
    await userEvent.selectOptions(select, 'scheduled');
    await expect(c.getByRole('button', { name: 'Remove filter: Current participant: Alex' })).toBeVisible();
    await expect(c.queryByRole('button', { name: 'Remove filter: Record type: Job' })).not.toBeInTheDocument();
    await userEvent.selectOptions(select, 'unscheduled');
    await expect(c.queryByRole('button', { name: 'Clear all' })).not.toBeInTheDocument();
  },
};
export const SearchAndKeyboard: Story = { render: Default.render, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.type(c.getByRole('combobox', { name: 'Current participant' }), 'Blai');
  const option = await body.findByRole('option', { name: 'Blair' });
  await waitFor(() => expect(option).toBeVisible());
  await expect(body.queryByRole('option', { name: 'Alex' })).not.toBeInTheDocument();
  await userEvent.keyboard('{ArrowDown}{Enter}{Escape}');
  await expect(args.onChange).toHaveBeenLastCalledWith({ ...empty, participants: ['blair'] });
} };
export const OwnScope: Story = { render: Default.render, args: {
  scope: { kind: 'own', viewerId: 'alex' }, options: { ...options, participants: [options.participants[0]!] },
}, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('combobox', { name: 'Current participant' }));
  await userEvent.keyboard('{ArrowDown}');
  const me = await body.findByRole('option', { name: 'Me' });
  await waitFor(() => expect(me).toBeVisible());
  await expect(body.queryByRole('option', { name: /Alex|Blair/ })).not.toBeInTheDocument();
  await userEvent.click(me); await userEvent.keyboard('{Escape}');
  await expect(args.onChange).toHaveBeenLastCalledWith({ ...empty, participants: ['alex'] });
  await expect(c.getByRole('button', { name: 'Remove filter: Current participant: Me' })).toBeVisible();
} };
export const WorkOrderOnly: Story = { args: { options: { ...options, recordTypes: [options.recordTypes[1]!] } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    await userEvent.click(c.getByRole('combobox', { name: 'Record type' }));
    await userEvent.keyboard('{ArrowDown}');
    const order = await body.findByRole('option', { name: 'Work Order' });
    await waitFor(() => expect(order).toBeVisible());
    await expect(body.queryByRole('option', { name: 'Job' })).not.toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
  } };
export const RemovedSelection: Story = { render: Default.render, args: { value: { participants: ['hidden-person-id'], recordTypes: ['job'] } },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('alert')).toBeVisible();
    await expect(c.queryByText(/hidden-person-id/)).not.toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'Remove filter: Current participant: Unavailable saved selection' }));
    await expect(args.onChange).toHaveBeenLastCalledWith({ participants: [], recordTypes: ['job'] });
    await expect(c.queryByRole('alert')).not.toBeInTheDocument();
  } };
export const DuplicateSelection: Story = { render: Default.render, args: { value: { ...empty, recordTypes: ['job', 'job'] } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('alert')).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Remove filter: Record type: Job' }));
    await expect(c.queryByRole('alert')).not.toBeInTheDocument();
  } };
export const InapplicableFacet: Story = { args: { options: { recordTypes: options.recordTypes }, value: { ...empty, participants: ['alex'] } },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole('combobox', { name: 'Current participant' })).not.toBeInTheDocument();
    await expect(c.getByRole('alert')).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Remove filter: Current participant: Unavailable saved selection' }));
    await expect(args.onChange).toHaveBeenLastCalledWith(empty);
  } };
const invalid: Story['play'] = async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
  await expect(within(canvasElement).queryByRole('combobox')).not.toBeInTheDocument();
};
export const InvalidOptions: Story = { args: { options: { recordTypes: [{ value: 'customer', label: 'Customer' }] } }, play: invalid };
export const DuplicateOptions: Story = { args: { options: { participants: [options.participants[0]!, options.participants[0]!] } }, play: invalid };
export const LeakedOwnRoster: Story = { args: { scope: { kind: 'own', viewerId: 'alex' } }, play: invalid };
export const NoAuthorizedOptions: Story = { args: { options: { participants: [], recordTypes: [] } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await expect(c.queryByRole('alert')).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('combobox', { name: 'Current participant' }));
  await userEvent.keyboard('{ArrowDown}');
  await expect(await body.findByText('No authorized options available.')).toBeVisible();
  await userEvent.keyboard('{Escape}');
} };
export const Loading: Story = { args: { state: 'loading' }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('status')).toBeVisible();
  await expect(within(canvasElement).queryByRole('combobox')).not.toBeInTheDocument();
} };
export const Error: Story = { args: { state: 'error' }, play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Retry filters' }));
  await expect(args.onRetry).toHaveBeenCalledTimes(1);
} };
export const PermissionDenied: Story = { args: { canRead: false, value: { ...empty, participants: ['alex'] } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('alert')).toBeVisible();
    await expect(c.queryByRole('combobox')).not.toBeInTheDocument();
    await expect(c.queryByText(/Alex|Blair/)).not.toBeInTheDocument();
  } };
export const Pending: Story = { args: { pending: true, value: { participants: ['alex'], recordTypes: ['job'] } },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    for (const combobox of c.getAllByRole('combobox')) await expect(combobox).toBeDisabled();
    for (const button of c.getAllByRole('button', { name: /Clear all|Remove filter:/ })) await expect(button).toBeDisabled();
    await expect(args.onChange).not.toHaveBeenCalled();
  } };
export const Help: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  const trigger = c.getByRole('button', { name: 'About Calendar report filters' });
  trigger.focus(); await userEvent.keyboard('{Enter}');
  const dialog = await body.findByRole('dialog', { name: 'About Calendar report filters' });
  await waitFor(() => expect(dialog).toBeVisible());
  for (const text of [calendarReportFilterHelp.attribution, calendarReportFilterHelp.drafts]) await expect(within(dialog).getByText(text)).toBeVisible();
  await expect(within(dialog).getByText(/Different facets combine with AND/)).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
} };
