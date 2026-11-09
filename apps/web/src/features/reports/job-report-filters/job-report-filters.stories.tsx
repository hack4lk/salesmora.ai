import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { jobStatuses } from '@salesmora/contracts';
import { jobStatusBadgeData } from '../../jobs/job-status-badge/job-status-badge.data';
import { JobReportFilters, type JobReportFilterContext, type JobReportFiltersValue } from './job-report-filters';

const empty: JobReportFiltersValue = { statuses: [], owners: [], services: [] };
const options = {
  statuses: jobStatuses.map(value => ({ value, label: jobStatusBadgeData[value].label })),
  owners: [{ value: 'member:me', label: 'Me' }, { value: 'unassigned', label: 'No current primary owner' }, { value: 'member:a', label: 'Teammate A' }],
  services: [{ value: 'repair', label: 'Repair' }, { value: 'installation', label: 'Installation' }, { value: 'none', label: 'No recorded service' }],
};
const currentOptions = { ...options, statuses: options.statuses.slice(0, 4) };
const meta = {
  title: 'Reports/JobReportFilters', component: JobReportFilters, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Canonical Jobs dropdown filters sharing the approved Leads dropdown/chip UI. Searchable multiple status, primary-owner and service selections; OR within facets, AND across facets. Empty arrays mean all currently authorized values. Period results use current surviving facet values, not historical attribution or event inference. Current workload accepts only the four active Job statuses. Hosts keep separate drafts, supply authorized applicable options, and block runs until invalid saved selections are explicitly corrected. Owner/service keys are opaque host keys; no new arbitrary selection cap. No production queries or workspace yet.' } } },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="mx-auto max-w-6xl"><Story /></div></main>],
  args: { value: empty, options, context: 'period', canRead: true, onChange: fn(), onRetry: fn() },
} satisfies Meta<typeof JobReportFilters>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: function Render(args) {
    const [value, setValue] = useState<JobReportFiltersValue>(args.value);
    return <JobReportFilters {...args} value={value} onChange={next => { args.onChange(next); setValue(next); }} />;
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    for (const [facet, selections] of [['Current status', ['Waiting', 'Completed']], ['Current primary owner', ['Me', 'No current primary owner']],
      ['Current service', ['Repair', 'Installation']]] as const) {
      await userEvent.click(c.getByRole('combobox', { name: facet }));
      await userEvent.keyboard('{ArrowDown}');
      for (const label of selections) await userEvent.click(await body.findByRole('option', { name: label }));
      await userEvent.keyboard('{Escape}');
    }
    await expect(args.onChange).toHaveBeenLastCalledWith({ statuses: ['waiting', 'completed'], owners: ['member:me', 'unassigned'], services: ['repair', 'installation'] });
    await userEvent.click(c.getByRole('button', { name: 'Remove filter: Current status: Completed' }));
    await expect(args.onChange).toHaveBeenLastCalledWith({ statuses: ['waiting'], owners: ['member:me', 'unassigned'], services: ['repair', 'installation'] });
    await userEvent.click(c.getByRole('button', { name: 'Clear all' }));
    await expect(args.onChange).toHaveBeenLastCalledWith(empty);
  },
};
export const CurrentView: Story = { args: { context: 'current', options: currentOptions }, play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await expect(c.getByText('Current-view filters / independent of period results')).toBeVisible();
  await userEvent.click(c.getByRole('combobox', { name: 'Current status' }));
  await userEvent.keyboard('{ArrowDown}');
  await expect(await body.findByRole('option', { name: 'Waiting' })).toBeVisible();
  await expect(body.queryByRole('option', { name: 'Completed' })).not.toBeInTheDocument();
  await expect(body.queryByRole('option', { name: 'Canceled' })).not.toBeInTheDocument();
  await userEvent.keyboard('{Escape}');
} };
export const SeparateDrafts: Story = {
  render: function Render(args) {
    const [context, setContext] = useState<JobReportFilterContext>('period');
    const [drafts, setDrafts] = useState<Record<JobReportFilterContext, JobReportFiltersValue>>({
      period: { statuses: ['completed'], owners: [], services: ['repair'] },
      current: { statuses: ['waiting'], owners: ['unassigned'], services: [] },
    });
    return <div className="grid gap-4">
      <label>Preview filter context <select aria-label="Preview filter context" value={context}
        onChange={event => { if (event.target.value === 'period' || event.target.value === 'current') setContext(event.target.value); }}
        className="min-h-11 rounded-xl border border-line bg-paper px-3 text-ink">
        <option value="period">Period results</option><option value="current">Current workload</option>
      </select></label>
      <JobReportFilters {...args} context={context} options={context === 'period' ? options : currentOptions} value={drafts[context]}
        onChange={value => { args.onChange(value); setDrafts(current => ({ ...current, [context]: value })); }} />
    </div>;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('button', { name: 'Remove filter: Current status: Completed' })).toBeVisible();
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Preview filter context' }), 'current');
    await expect(c.queryByRole('button', { name: 'Remove filter: Current status: Completed' })).not.toBeInTheDocument();
    await expect(c.getByRole('button', { name: 'Remove filter: Current status: Waiting' })).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Clear all' }));
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Preview filter context' }), 'period');
    await expect(c.getByRole('button', { name: 'Remove filter: Current status: Completed' })).toBeVisible();
    await expect(c.getByRole('button', { name: 'Remove filter: Current service: Repair' })).toBeVisible();
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Preview filter context' }), 'current');
    await expect(c.queryByRole('button', { name: 'Clear all' })).not.toBeInTheDocument();
  },
};
export const SearchAndKeyboard: Story = {
  render: Default.render,
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    await userEvent.type(c.getByRole('combobox', { name: 'Current service' }), 'Install');
    await expect(await body.findByRole('option', { name: 'Installation' })).toBeVisible();
    await expect(body.queryByRole('option', { name: 'Repair' })).not.toBeInTheDocument();
    await userEvent.keyboard('{ArrowDown}{Enter}{Escape}');
    await expect(args.onChange).toHaveBeenLastCalledWith({ ...empty, services: ['installation'] });
  },
};
export const UnavailableSavedSelection: Story = {
  args: { value: { statuses: ['completed'], owners: ['private-owner-id'], services: ['private-service-id'] }, context: 'current', options: currentOptions },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('alert')).toBeVisible();
    await expect(c.queryByText(/private-owner-id|private-service-id/)).not.toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'Remove filter: Current primary owner: Unavailable saved selection' }));
    await expect(args.onChange).toHaveBeenLastCalledWith({ statuses: ['completed'], owners: [], services: ['private-service-id'] });
  },
};
export const InapplicableFacet: Story = { args: { options: { statuses: options.statuses }, value: { ...empty, services: ['repair'] } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toBeVisible();
  await expect(c.queryByRole('combobox', { name: 'Current service' })).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('button', { name: 'Remove filter: Current service: Unavailable saved selection' }));
  await expect(args.onChange).toHaveBeenLastCalledWith(empty);
} };
export const DuplicateSelections: Story = { args: { value: { ...empty, statuses: ['waiting', 'waiting'] } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: 'Remove filter: Current status: Waiting' }));
  await expect(args.onChange).toHaveBeenLastCalledWith(empty);
} };
export const Loading: Story = { args: { state: 'loading', value: { ...empty, owners: ['member:a'] } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('combobox')).not.toBeInTheDocument();
  await expect(within(canvasElement).queryByText('Teammate A')).not.toBeInTheDocument();
} };
export const Error: Story = { args: { state: 'error' }, play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Retry filters' }));
  await expect(args.onRetry).toHaveBeenCalledTimes(1);
} };
export const PermissionDenied: Story = { args: { canRead: false, value: { ...empty, owners: ['member:a'] } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.queryByRole('combobox')).not.toBeInTheDocument();
  await expect(c.queryByText('Teammate A')).not.toBeInTheDocument();
} };
export const Pending: Story = { args: { pending: true, value: { ...empty, statuses: ['waiting'] } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  for (const box of c.getAllByRole('combobox')) await expect(box).toBeDisabled();
  await expect(c.getByRole('button', { name: 'Clear all' })).toBeDisabled();
  await expect(c.getByRole('button', { name: 'Remove filter: Current status: Waiting' })).toBeDisabled();
  await expect(args.onChange).not.toHaveBeenCalled();
} };
export const DuplicateOptions: Story = { args: { options: { services: [options.services[0]!, options.services[0]!] } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
  await expect(within(canvasElement).queryByRole('combobox')).not.toBeInTheDocument();
} };
export const InvalidStatusOption: Story = { args: { options: { statuses: [{ value: 'in_progress', label: 'Invalid status token' }] } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
} };
export const ClosedCurrentOption: Story = { args: { context: 'current' }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
} };
export const NoAuthorizedOptions: Story = { args: { options: { statuses: [], owners: [], services: [] } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await expect(c.queryByRole('alert')).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('combobox', { name: 'Current service' }));
  await userEvent.keyboard('{ArrowDown}');
  await expect(await body.findByText('No authorized options available.')).toBeVisible();
  await userEvent.keyboard('{Escape}');
} };
export const Help: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  const trigger = c.getByRole('button', { name: 'About Jobs report filters' });
  trigger.focus(); await userEvent.keyboard('{Enter}');
  const dialog = await body.findByRole('dialog', { name: 'About Jobs report filters' });
  await waitFor(() => expect(dialog).toBeVisible());
  await expect(within(dialog).getByText(/Different facets combine with AND/)).toBeVisible();
  await expect(within(dialog).getByText(/Current status does not infer or replace period lifecycle events/)).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
} };
