import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { LeadReportFilters, type LeadReportFiltersValue } from './lead-report-filters';

const options = {
  stages: [{ value: 'new', label: 'New' }, { value: 'contacted', label: 'Contacted' }, { value: 'estimate-sent', label: 'Estimate sent' }, { value: 'won', label: 'Won' }, { value: 'lost', label: 'Lost' }],
  owners: [{ value: 'me', label: 'Me' }, { value: 'unassigned', label: 'No current primary owner' }, { value: 'member-a', label: 'Teammate A' }],
  sources: [{ value: 'website', label: 'Website' }, { value: 'referral', label: 'Referral' }, { value: 'phone', label: 'Phone' }, { value: 'gmail', label: 'Gmail' }, { value: 'other', label: 'Other' }],
};
const meta = {
  title: 'Reports/LeadReportFilters', component: LeadReportFilters, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Canonical authorized multi-select facets using shared FilterBar/FilterChip, separate from the existing scope/view selector. OR within a facet, AND across facets; an empty array means all authorized values. Hosts keep period and current configurations separate, supply applicable facets and authorized options, and block report runs when saved selections need correction. No queries, roles or silent defaults. Stage/source values use contract enums; owner selection limit is 50.' } } },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="max-w-6xl"><Story /></div></main>],
  args: { value: { stages: [], owners: [], sources: [] }, options, context: 'period', canRead: true, onChange: fn(), onRetry: fn() },
} satisfies Meta<typeof LeadReportFilters>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: function Render(args) {
    const [value, setValue] = useState<LeadReportFiltersValue>(args.value);
    return <LeadReportFilters {...args} value={value} onChange={next => { args.onChange(next); setValue(next); }} />;
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    for (const [facet, selections] of [['Current stage', ['New', 'Contacted']], ['Current primary owner', ['Me']], ['Current source', ['Referral']]] as const) {
      await userEvent.click(c.getByRole('combobox', { name: facet }));
      await userEvent.keyboard('{ArrowDown}');
      for (const label of selections) await userEvent.click(await body.findByRole('option', { name: label }));
      await userEvent.keyboard('{Escape}');
    }
    await expect(args.onChange).toHaveBeenLastCalledWith({ stages: ['new', 'contacted'], owners: ['me'], sources: ['referral'] });
    await userEvent.click(c.getByRole('button', { name: 'Remove filter: Current stage: New' }));
    await expect(args.onChange).toHaveBeenLastCalledWith({ stages: ['contacted'], owners: ['me'], sources: ['referral'] });
    await userEvent.click(c.getByRole('button', { name: 'Clear all' }));
    await expect(args.onChange).toHaveBeenLastCalledWith({ stages: [], owners: [], sources: [] });
  },
};
export const CurrentView: Story = { args: { context: 'current', options: { ...options, stages: options.stages.slice(0, 3) } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByText('Current-view filters / independent of period results')).toBeVisible();
  await userEvent.click(c.getByRole('combobox', { name: 'Current stage' }));
  await userEvent.keyboard('{ArrowDown}');
  await expect(within(canvasElement.ownerDocument.body).queryByRole('option', { name: 'Won' })).not.toBeInTheDocument();
  await userEvent.keyboard('{Escape}');
} };
export const UnavailableSavedSelection: Story = {
  args: { value: { stages: ['lost'], owners: ['hidden-member'], sources: [] }, options: { ...options, stages: options.stages.slice(0, 3) } },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('alert')).toBeVisible();
    await expect(c.queryByText(/hidden-member/)).not.toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'Remove filter: Current primary owner: Unavailable saved selection' }));
    await expect(args.onChange).toHaveBeenLastCalledWith({ stages: ['lost'], owners: [], sources: [] });
  },
};
export const InapplicableFacetWithSavedValue: Story = { args: { options: { stages: options.stages }, value: { stages: [], owners: [], sources: ['phone'] } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
  await expect(within(canvasElement).queryByRole('combobox', { name: 'Current source' })).not.toBeInTheDocument();
} };
export const Loading: Story = { args: { state: 'loading' }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('combobox')).not.toBeInTheDocument();
} };
export const Error: Story = { args: { state: 'error' }, play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Retry filters' }));
  await expect(args.onRetry).toHaveBeenCalledTimes(1);
} };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByText('Teammate A')).not.toBeInTheDocument();
  await expect(within(canvasElement).queryByRole('combobox')).not.toBeInTheDocument();
} };
export const Pending: Story = { args: { pending: true, value: { stages: ['new'], owners: [], sources: [] } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  for (const box of c.getAllByRole('combobox')) await expect(box).toBeDisabled();
  await expect(c.getByRole('button', { name: 'Clear all' })).toBeDisabled();
  await expect(c.getByRole('button', { name: 'Remove filter: Current stage: New' })).toBeDisabled();
  await expect(args.onChange).not.toHaveBeenCalled();
} };
export const OwnerSelectionLimit: Story = { args: {
  options: { owners: Array.from({ length: 51 }, (_, i) => ({ value: `member-${i}`, label: `Member ${i}` })) },
  value: { stages: [], owners: Array.from({ length: 50 }, (_, i) => `member-${i}`), sources: [] },
}, play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('combobox', { name: 'Current primary owner' }));
  await userEvent.keyboard('{ArrowDown}');
  await expect(await body.findByRole('option', { name: 'Member 50' })).toHaveAttribute('aria-disabled', 'true');
  await expect(body.getByRole('option', { name: 'Member 0' })).toHaveAttribute('aria-disabled', 'false');
  await userEvent.keyboard('{Escape}');
} };
export const DuplicateOptions: Story = { args: { options: { owners: [options.owners[0]!, options.owners[0]!] } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
} };
export const InvalidStageOption: Story = { args: { options: { stages: [{ value: 'estimate_sent', label: 'Invalid stage token' }] } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
} };
export const Help: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  const trigger = c.getByRole('button', { name: 'About Leads report filters' });
  trigger.focus(); await userEvent.keyboard('{Enter}');
  const dialog = await body.findByRole('dialog', { name: 'About Leads report filters' });
  await waitFor(() => expect(dialog).toBeVisible());
  await expect(within(dialog).getByText(/Different facets combine with AND/)).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
} };
