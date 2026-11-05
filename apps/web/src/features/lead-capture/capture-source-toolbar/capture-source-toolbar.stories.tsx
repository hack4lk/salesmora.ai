import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CaptureSourceToolbar, defaultCaptureSourceFilters, type CaptureSourceToolbarProps } from './capture-source-toolbar';
import { captureSourceToolbarData as copy } from './capture-source-toolbar.data';
import { filterBarData } from '../../../../../../packages/ui/src/forms/filter-bar/filter-bar.data';
import { filterChipData } from '../../../../../../packages/ui/src/forms/filter-chip/filter-chip.data';

function Preview(args: CaptureSourceToolbarProps) {
  const [value, setValue] = useState(args.value);
  return <main className="min-h-screen bg-canvas p-4 text-ink sm:p-8">
    <h1 className="m-0 text-heading font-semibold">{copy.stories.title}</h1>
    <p className="mb-6 mt-2 text-sm text-muted">{copy.stories.description}</p>
    <CaptureSourceToolbar {...args} value={value} onChange={next => { args.onChange(next); setValue(next); }} />
  </main>;
}
const filtered = { ...defaultCaptureSourceFilters, search: copy.stories.query, source: 'gmail' as const, status: 'paused' as const };
const meta = {
  title: 'Lead Capture/CaptureSourceToolbar', component: CaptureSourceToolbar,
  parameters: { layout: 'fullscreen' }, render: args => <Preview {...args} />,
  args: { value: defaultCaptureSourceFilters, onChange: fn() },
} satisfies Meta<typeof CaptureSourceToolbar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Filtered: Story = { args: { value: filtered } };
export const Archived: Story = { args: { value: { ...defaultCaptureSourceFilters, view: 'archived' } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('button', { name: copy.archived })).toHaveAttribute('aria-pressed', 'true');
  await expect(c.getByLabelText(copy.status)).toBeDisabled();
  await expect(c.getByLabelText(copy.status)).toHaveValue('archived');
  await expect(c.getByText(copy.archivedHelp)).toBeVisible();
} };
export const SearchAndFilter: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.type(c.getByRole('searchbox', { name: copy.search }), copy.stories.query);
  await userEvent.selectOptions(c.getByLabelText(copy.source), 'gmail');
  await userEvent.selectOptions(c.getByLabelText(copy.status), 'paused');
  await expect(args.onChange).toHaveBeenLastCalledWith(filtered);
  await expect(c.getByRole('status')).toHaveTextContent(filterBarData.count(3));
  await userEvent.click(c.getByRole('button', { name: filterChipData.remove(copy.chip(copy.source, copy.sources.gmail)) }));
  await expect(args.onChange).toHaveBeenLastCalledWith({ ...filtered, source: 'all' });
  await expect(c.getByLabelText(copy.status)).toHaveValue('paused');
} };
export const SwitchViews: Story = { args: { value: filtered }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.archived }));
  await expect(args.onChange).toHaveBeenLastCalledWith({ ...filtered, view: 'archived', status: 'all' });
  await expect(c.getByRole('status')).toHaveTextContent(filterBarData.count(2));
  await userEvent.click(c.getByRole('button', { name: copy.current }));
  await expect(args.onChange).toHaveBeenLastCalledWith({ ...filtered, status: 'all' });
  await expect(c.getByLabelText(copy.status)).toBeEnabled();
} };
export const ClearArchivedFilters: Story = { args: { value: { ...filtered, view: 'archived', status: 'all' } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: filterBarData.clear }));
  await expect(args.onChange).toHaveBeenLastCalledWith({ ...defaultCaptureSourceFilters, view: 'archived' });
  await expect(c.getByRole('button', { name: copy.archived })).toHaveAttribute('aria-pressed', 'true');
  await expect(c.getByRole('status')).toHaveTextContent(filterBarData.count(0));
} };
export const Disabled: Story = { args: { disabled: true, value: filtered }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('searchbox')).toBeDisabled();
  for (const select of c.getAllByRole('combobox')) await expect(select).toBeDisabled();
  for (const button of c.getAllByRole('button')) await expect(button).toBeDisabled();
  await userEvent.click(c.getByRole('button', { name: copy.archived }));
  await userEvent.click(c.getByRole('button', { name: filterBarData.clear }));
  await expect(args.onChange).not.toHaveBeenCalled();
} };
export const Keyboard: Story = { args: { value: filtered }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  c.getByRole('button', { name: filterChipData.remove(copy.chip(copy.search, copy.stories.query)) }).focus();
  await userEvent.keyboard('{Enter}');
  await expect(c.getByRole('button', { name: filterChipData.remove(copy.chip(copy.source, copy.sources.gmail)) })).toHaveFocus();
  c.getByRole('button', { name: filterBarData.clear }).focus();
  await userEvent.keyboard('{Enter}');
  await expect(c.getByRole('searchbox')).toHaveFocus();
  c.getByRole('button', { name: copy.archived }).focus();
  await userEvent.keyboard(' ');
  await expect(c.getByRole('button', { name: copy.archived })).toHaveAttribute('aria-pressed', 'true');
} };
export const LongSearch: Story = { args: { value: { ...filtered, search: copy.stories.longQuery } } };
export const Narrow: Story = { args: { value: filtered }, globals: { viewport: { value: 'phone', isRotated: false } } };
