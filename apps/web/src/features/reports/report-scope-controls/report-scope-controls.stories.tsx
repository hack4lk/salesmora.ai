import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ReportScopeControls, type ReportScopeControlsProps, type ReportScopeView } from './report-scope-controls';
import { reportScopeControlsData as copy } from './report-scope-controls.data';

const views: readonly ReportScopeView[] = [
  { id: 'intake', label: 'New leads', dateBasis: 'Lead creation date in the workspace timezone.', current: false,
    assignments: [{ value: 'all', label: 'Everyone in my authorized scope' }, { value: 'me', label: 'Me' }, { value: 'teammate-a', label: 'Teammate A' }],
    groupLabel: 'Source filter', groups: [{ value: 'all', label: 'All authorized values' }, { value: 'website', label: 'Website' }, { value: 'referral', label: 'Referral' }] },
  { id: 'pipeline', label: 'Current pipeline', dateBasis: 'Currently open leads, regardless of creation date.', current: true,
    assignments: [{ value: 'all', label: 'Everyone in my authorized scope' }, { value: 'me', label: 'Me' }],
    groupLabel: 'Stage filter', groups: [{ value: 'all', label: 'All authorized values' }, { value: 'new', label: 'New' }, { value: 'contacted', label: 'Contacted' }] },
];
function Preview(args: ReportScopeControlsProps) {
  const [value, setValue] = useState(args.value);
  return <main className="min-h-screen bg-canvas p-4 text-ink sm:p-8"><ReportScopeControls {...args} value={value}
    onViewChange={viewId => { args.onViewChange(viewId); setValue({ viewId, assignment: 'all', group: 'all' }); }}
    onFilterChange={(filter, next) => { args.onFilterChange(filter, next); setValue(current => ({ ...current, [filter]: next })); }} /></main>;
}
const meta = {
  title: 'Reports/ReportScopeControls', component: ReportScopeControls, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Supporting-view and assignment/group filters for one selected report area. Controlled host options reflect current authorized scope. The host explicitly resets filters on a user-requested view change, validates selections before running, and composes period controls only for period-based views. Unavailable saved filters are shown with an error, never silently narrowed. No report execution, persistence or page integration is included.' } } },
  render: args => <Preview {...args} />,
  args: { reportLabel: 'Leads', value: { viewId: 'intake', assignment: 'all', group: 'all' }, views, canRead: true, onViewChange: fn(), onFilterChange: fn(), onRetry: fn() },
} satisfies Meta<typeof ReportScopeControls>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('combobox', { name: copy.view })).toHaveValue('intake');
  await expect(c.getByText(`${views[0].dateBasis} ${copy.period}`)).toBeVisible();
} };
export const ChangeFilters: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.selectOptions(c.getByRole('combobox', { name: copy.assignment }), 'me');
  await expect(args.onFilterChange).toHaveBeenLastCalledWith('assignment', 'me');
  await userEvent.selectOptions(c.getByRole('combobox', { name: 'Source filter' }), 'website');
  await expect(args.onFilterChange).toHaveBeenLastCalledWith('group', 'website');
  await userEvent.selectOptions(c.getByRole('combobox', { name: copy.view }), 'pipeline');
  await expect(args.onViewChange).toHaveBeenCalledWith('pipeline');
  await expect(c.getByRole('combobox', { name: 'Stage filter' })).toHaveValue('all');
  await expect(c.getByRole('combobox', { name: copy.assignment })).toHaveValue('all');
} };
export const CurrentView: Story = { args: { value: { viewId: 'pipeline', assignment: 'all', group: 'all' } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText(`${views[1].dateBasis} ${copy.current}`)).toBeVisible();
} };
export const AssignedScope: Story = { args: {
  views: [{ ...views[0], assignments: [{ value: 'me', label: 'Me' }] }],
  value: { viewId: 'intake', assignment: 'me', group: 'all' },
}, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('combobox', { name: copy.assignment })).toBeDisabled();
  await expect(c.queryByRole('option', { name: 'Everyone in my authorized scope' })).not.toBeInTheDocument();
} };
export const UnavailableSavedFilter: Story = { args: { value: { viewId: 'intake', assignment: 'former-teammate', group: 'all' } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.invalid);
  await expect(c.getByRole('combobox', { name: copy.assignment })).toHaveValue('former-teammate');
  await expect(args.onFilterChange).not.toHaveBeenCalled();
  await userEvent.selectOptions(c.getByRole('combobox', { name: copy.assignment }), 'me');
  await expect(c.queryByRole('alert')).not.toBeInTheDocument();
} };
export const UnavailableView: Story = { args: { value: { viewId: 'removed', assignment: 'all', group: 'all' } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.invalid);
  await expect(c.queryByRole('combobox', { name: copy.assignment })).not.toBeInTheDocument();
  await expect(args.onViewChange).not.toHaveBeenCalled();
  await userEvent.selectOptions(c.getByRole('combobox', { name: copy.view }), 'intake');
  await expect(c.queryByRole('alert')).not.toBeInTheDocument();
} };
export const Loading: Story = { args: { state: 'loading' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('status')).toHaveTextContent(copy.loading);
  await expect(c.queryByRole('combobox')).not.toBeInTheDocument();
} };
export const Error: Story = { args: { state: 'error' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.failed);
  await userEvent.click(c.getByRole('button', { name: copy.retry }));
  await expect(args.onRetry).toHaveBeenCalledTimes(1);
} };
export const Empty: Story = { args: { views: [] }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByText(copy.empty)).toBeVisible();
  await expect(c.queryByRole('combobox')).not.toBeInTheDocument();
} };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.denied);
  await expect(c.queryByRole('combobox')).not.toBeInTheDocument();
  await expect(c.queryByText('Leads')).not.toBeInTheDocument();
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  for (const select of within(canvasElement).getAllByRole('combobox')) await expect(select).toBeDisabled();
  await expect(args.onViewChange).not.toHaveBeenCalled();
  await expect(args.onFilterChange).not.toHaveBeenCalled();
} };
export const LongContent: Story = { args: { reportLabel: 'LongReportNameWithoutSpaces'.repeat(6) } };
