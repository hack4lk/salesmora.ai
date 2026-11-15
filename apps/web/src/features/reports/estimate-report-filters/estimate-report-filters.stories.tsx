import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { EstimateReportFilters, type EstimateReportFiltersValue, type EstimateReportFilterContext } from './estimate-report-filters';

const empty: EstimateReportFiltersValue = { owners: [], parents: [] };
const options = { owners: [{ value: 'member:a', label: 'Alex' }, { value: 'member:b', label: 'Blair' }, { value: 'unassigned', label: 'No current owner' }],
  parents: [{ value: 'lead', label: 'Lead' }, { value: 'job', label: 'Job' }] };
const meta = {
  title: 'Reports/EstimateReportFilters', component: EstimateReportFilters, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Canonical Estimates owner/parent multi-select composing ReportFacetFilters. OR within facets and AND across them; empty means all authorized values. Current attribution uses the selected issued revision, not a newer draft. Assigned estimate access follows authorized Job relationships, not owner selection. No conflicting status filter. Hosts supply applicable authorized options, maintain separate period/current drafts and query matching family counts/money/evidence. Unavailable saved values need explicit correction. Fictional options only; no API or workspace integration.' } } },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="mx-auto max-w-6xl"><Story /></div></main>],
  args: { value: empty, options, context: 'period', canRead: true, onChange: fn(), onRetry: fn() },
} satisfies Meta<typeof EstimateReportFilters>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: function Render(args) {
    const [value, setValue] = useState<EstimateReportFiltersValue>(args.value);
    return <EstimateReportFilters {...args} value={value} onChange={next => { args.onChange(next); setValue(next); }} />;
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    await expect(c.queryByRole('combobox', { name: /status/i })).not.toBeInTheDocument();
    for (const [facet, choices] of [['Current owner', ['Alex', 'No current owner']], ['Parent type', ['Lead', 'Job']]] as const) {
      await userEvent.click(c.getByRole('combobox', { name: facet }));
      await userEvent.keyboard('{ArrowDown}');
      for (const label of choices) {
        const option = await body.findByRole('option', { name: label });
        await waitFor(() => expect(option).toBeVisible());
        await userEvent.click(option);
      }
      await userEvent.keyboard('{Escape}');
    }
    await expect(args.onChange).toHaveBeenLastCalledWith({ owners: ['member:a', 'unassigned'], parents: ['lead', 'job'] });
    await userEvent.click(c.getByRole('button', { name: 'Remove filter: Parent type: Job' }));
    await expect(args.onChange).toHaveBeenLastCalledWith({ owners: ['member:a', 'unassigned'], parents: ['lead'] });
    await userEvent.click(c.getByRole('button', { name: 'Clear all' }));
    await expect(args.onChange).toHaveBeenLastCalledWith(empty);
  },
};
export const CurrentView: Story = { args: { context: 'current' }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText('Current-view filters / independent of period results')).toBeVisible();
} };
export const SeparateDrafts: Story = {
  render: function Render(args) {
    const [context, setContext] = useState<EstimateReportFilterContext>('period');
    const [drafts, setDrafts] = useState<Record<EstimateReportFilterContext, EstimateReportFiltersValue>>({
      period: { owners: ['member:a'], parents: ['lead'] }, current: { owners: ['member:b'], parents: ['job'] },
    });
    return <div className="grid gap-4">
      <label>Preview filter context <select aria-label="Preview filter context" value={context}
        className="min-h-11 rounded-xl border border-line bg-paper px-3 text-ink"
        onChange={event => { if (event.target.value === 'period' || event.target.value === 'current') setContext(event.target.value); }}>
        <option value="period">Period results</option><option value="current">Current results</option>
      </select></label>
      <EstimateReportFilters {...args} context={context} value={drafts[context]}
        onChange={value => { args.onChange(value); setDrafts(current => ({ ...current, [context]: value })); }} />
    </div>;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement), select = c.getByRole('combobox', { name: 'Preview filter context' });
    await expect(c.getByRole('button', { name: 'Remove filter: Current owner: Alex' })).toBeVisible();
    await userEvent.selectOptions(select, 'current');
    await expect(c.getByRole('button', { name: 'Remove filter: Current owner: Blair' })).toBeVisible();
    await expect(c.queryByRole('button', { name: 'Remove filter: Parent type: Lead' })).not.toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'Clear all' }));
    await userEvent.selectOptions(select, 'period');
    await expect(c.getByRole('button', { name: 'Remove filter: Parent type: Lead' })).toBeVisible();
    await userEvent.selectOptions(select, 'current');
    await expect(c.queryByRole('button', { name: 'Clear all' })).not.toBeInTheDocument();
  },
};
export const SearchAndKeyboard: Story = { render: Default.render, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.type(c.getByRole('combobox', { name: 'Current owner' }), 'Blai');
  const option = await body.findByRole('option', { name: 'Blair' });
  await waitFor(() => expect(option).toBeVisible());
  await expect(body.queryByRole('option', { name: 'Alex' })).not.toBeInTheDocument();
  await userEvent.keyboard('{ArrowDown}{Enter}{Escape}');
  await expect(args.onChange).toHaveBeenLastCalledWith({ ...empty, owners: ['member:b'] });
} };
export const RemovedSelection: Story = { render: Default.render, args: { value: { owners: ['hidden-owner-id'], parents: ['lead'] } },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('alert')).toBeVisible();
    await expect(c.queryByText(/hidden-owner-id/)).not.toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'Remove filter: Current owner: Unavailable saved selection' }));
    await expect(args.onChange).toHaveBeenLastCalledWith({ owners: [], parents: ['lead'] });
    await expect(c.queryByRole('alert')).not.toBeInTheDocument();
  } };
export const DuplicateSelection: Story = { render: Default.render, args: { value: { ...empty, parents: ['lead', 'lead'] } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('alert')).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Remove filter: Parent type: Lead' }));
    await expect(c.queryByRole('alert')).not.toBeInTheDocument();
  } };
export const InapplicableFacet: Story = { args: { options: { owners: options.owners }, value: { ...empty, parents: ['job'] } },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole('combobox', { name: 'Parent type' })).not.toBeInTheDocument();
    await expect(c.getByRole('alert')).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Remove filter: Parent type: Unavailable saved selection' }));
    await expect(args.onChange).toHaveBeenLastCalledWith(empty);
  } };
export const InvalidOptions: Story = { args: { options: { parents: [{ value: 'customer', label: 'Customer' }] } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('alert')).toBeVisible();
    await expect(within(canvasElement).queryByRole('combobox')).not.toBeInTheDocument();
  } };
export const DuplicateOptions: Story = { ...InvalidOptions, args: { options: { owners: [options.owners[0]!, options.owners[0]!] } } };
export const NoAuthorizedOptions: Story = { args: { options: { owners: [], parents: [] } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await expect(c.queryByRole('alert')).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('combobox', { name: 'Current owner' }));
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
export const PermissionDenied: Story = { args: { canRead: false, value: { ...empty, owners: ['member:a'] } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('alert')).toBeVisible();
    await expect(c.queryByRole('combobox')).not.toBeInTheDocument();
    await expect(c.queryByText('Alex')).not.toBeInTheDocument();
  } };
export const Pending: Story = { args: { pending: true, value: { owners: ['member:a'], parents: ['lead'] } },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    for (const combobox of c.getAllByRole('combobox')) await expect(combobox).toBeDisabled();
    for (const button of c.getAllByRole('button', { name: /Clear all|Remove filter:/ })) await expect(button).toBeDisabled();
    await expect(args.onChange).not.toHaveBeenCalled();
  } };
export const Help: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  const trigger = c.getByRole('button', { name: 'About Estimates report filters' });
  trigger.focus(); await userEvent.keyboard('{Enter}');
  const dialog = await body.findByRole('dialog', { name: 'About Estimates report filters' });
  await waitFor(() => expect(dialog).toBeVisible());
  await expect(within(dialog).getByText(/Different facets combine with AND/)).toBeVisible();
  await expect(within(dialog).getByText(/Assigned estimate access follows authorized Job relationships/)).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
} };
