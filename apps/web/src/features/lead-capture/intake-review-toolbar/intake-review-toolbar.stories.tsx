import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { IntakeReviewToolbar, defaultIntakeReviewFilters, emptyIntakeReviewFilters, type IntakeReviewToolbarProps } from './intake-review-toolbar';
import { intakeReviewToolbarData as copy } from './intake-review-toolbar.data';
import { filterBarData } from '../../../../../../packages/ui/src/forms/filter-bar/filter-bar.data';
import { filterChipData } from '../../../../../../packages/ui/src/forms/filter-chip/filter-chip.data';

function Preview(args: IntakeReviewToolbarProps) {
  const [value, setValue] = useState(args.value);
  return <main className="min-h-screen bg-canvas p-4 text-ink sm:p-8"><h1 className="m-0 text-heading font-semibold">{copy.stories.title}</h1><p className="mb-6 mt-2 text-sm text-muted">{copy.stories.description}</p><IntakeReviewToolbar {...args} value={value} onChange={next => { args.onChange(next); setValue(next); }} /></main>;
}
const filtered = { search: copy.stories.query, sourceId: 'gmail', status: 'awaiting' as const, flag: 'duplicate' as const };
const meta = {
  title: 'Lead Capture/IntakeReviewToolbar', component: IntakeReviewToolbar, parameters: { layout: 'fullscreen' }, render: args => <Preview {...args} />,
  args: { value: defaultIntakeReviewFilters, sources: copy.stories.sources, canRead: true, onChange: fn(), onRetrySources: fn() },
} satisfies Meta<typeof IntakeReviewToolbar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByLabelText(copy.status)).toHaveValue('awaiting'); await expect(c.getByRole('status')).toHaveTextContent(filterBarData.count(1));
} };
export const Filtered: Story = { args: { value: filtered } };
export const SearchAndFilter: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.type(c.getByRole('searchbox'), copy.stories.query); await userEvent.selectOptions(c.getByLabelText(copy.source), 'gmail'); await userEvent.selectOptions(c.getByLabelText(copy.flag), 'duplicate');
  await expect(args.onChange).toHaveBeenLastCalledWith(filtered); await expect(c.getByRole('status')).toHaveTextContent(filterBarData.count(4));
  await userEvent.selectOptions(c.getByLabelText(copy.status), 'dismissed'); await expect(args.onChange).toHaveBeenLastCalledWith({ ...filtered, status: 'dismissed' });
} };
export const RemoveAndClear: Story = { args: { value: filtered }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: filterChipData.remove(copy.chip(copy.source, copy.stories.sources[1].name)) }));
  await expect(args.onChange).toHaveBeenLastCalledWith({ ...filtered, sourceId: '' }); await expect(c.getByLabelText(copy.flag)).toHaveValue('duplicate');
  await userEvent.click(c.getByRole('button', { name: filterBarData.clear })); await expect(args.onChange).toHaveBeenLastCalledWith(emptyIntakeReviewFilters); await expect(c.getByRole('status')).toHaveTextContent(filterBarData.count(0)); await expect(c.getByLabelText(copy.status)).toHaveValue('all');
} };
export const ApprovedHistory: Story = { args: { value: { ...emptyIntakeReviewFilters, status: 'approved', sourceId: 'archived' } } };
export const MissingDetails: Story = { args: { value: { ...defaultIntakeReviewFilters, flag: 'missing' } } };
export const EmptySources: Story = { args: { sources: [] }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByLabelText(copy.source)).toHaveValue(''); await expect(within(c.getByLabelText(copy.source)).getAllByRole('option')).toHaveLength(1);
} };
export const SourceUnavailable: Story = { args: { sources: [], value: filtered }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByLabelText(copy.source)).toHaveValue('gmail'); await expect(c.getByText(copy.unavailableHelp)).toBeVisible();
  await userEvent.type(c.getByRole('searchbox'), '!'); await expect(args.onChange).toHaveBeenLastCalledWith({ ...filtered, search: `${filtered.search}!` });
  await userEvent.click(c.getByRole('button', { name: filterChipData.remove(copy.chip(copy.source, copy.unavailableSource)) })); await expect(c.getByLabelText(copy.source)).toHaveValue('');
} };
export const LoadingSources: Story = { args: { sourcesState: 'loading', sources: [] }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByLabelText(copy.source)).toBeDisabled(); await expect(c.getByRole('searchbox')).toBeEnabled(); await expect(c.getByLabelText(copy.status)).toBeEnabled();
} };
export const SourcesError: Story = { args: { sourcesState: 'error', value: filtered }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.sourcesError); await expect(c.getByLabelText(copy.source)).toBeDisabled(); await userEvent.click(c.getByRole('button', { name: copy.retry })); await expect(args.onRetrySources).toHaveBeenCalledTimes(1); await expect(c.getByLabelText(copy.source)).toHaveValue('gmail');
} };
export const Disabled: Story = { args: { disabled: true, value: filtered, sourcesState: 'error' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); for (const element of [...c.getAllByRole('button'), ...c.getAllByRole('combobox'), c.getByRole('searchbox')]) await expect(element).toBeDisabled();
  await userEvent.click(c.getByRole('button', { name: copy.retry })); await expect(args.onChange).not.toHaveBeenCalled(); await expect(args.onRetrySources).not.toHaveBeenCalled();
} };
export const PermissionDenied: Story = { args: { canRead: false, value: filtered }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.denied); await expect(c.queryByRole('searchbox')).not.toBeInTheDocument(); await expect(c.queryByRole('combobox')).not.toBeInTheDocument(); await expect(c.queryByText(copy.stories.sources[1].name)).not.toBeInTheDocument();
} };
export const Keyboard: Story = { args: { value: filtered }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); c.getByRole('button', { name: filterChipData.remove(copy.chip(copy.search, copy.stories.query)) }).focus(); await userEvent.keyboard('{Enter}');
  await expect(c.getByRole('button', { name: filterChipData.remove(copy.chip(copy.source, copy.stories.sources[1].name)) })).toHaveFocus();
  c.getByRole('button', { name: filterBarData.clear }).focus(); await userEvent.keyboard('{Enter}'); await expect(c.getByRole('searchbox')).toHaveFocus();
} };
export const SearchLimit: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement); const search = c.getByRole('searchbox'); await userEvent.type(search, 'x'.repeat(205), { delay: 0 }); await expect(search).toHaveValue('x'.repeat(200));
} };
export const LongContent: Story = { args: { sources: [{ id: 'long', name: copy.stories.longSource }], value: { ...filtered, sourceId: 'long', search: copy.stories.longSource.repeat(2).slice(0, 200) } } };
