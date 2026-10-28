import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CalendarFilters, emptyCalendarFilters, type CalendarFiltersProps, type CalendarFiltersValue } from './calendar-filters';
import { calendarFiltersData as copy, calendarFilterMembers as members } from './calendar-filters.data';
import { filterBarData } from '../../../../../../packages/ui/src/forms/filter-bar/filter-bar.data';
import { filterChipData } from '../../../../../../packages/ui/src/forms/filter-chip/filter-chip.data';

const active: CalendarFiltersValue = { person: 'member:alex', recordType: 'job', status: 'job:scheduled', customerQuery: copy.stories.customer };
function Preview(args: CalendarFiltersProps) {
  const [value, setValue] = useState(args.value);
  return <main className="min-h-screen bg-canvas p-4 text-ink sm:p-6"><h1 className="m-0 text-heading font-semibold">{copy.stories.title}</h1>
    <p className="mb-6 mt-2 text-sm text-muted">{copy.stories.description}</p>
    <CalendarFilters {...args} value={value} onChange={next => { args.onChange(next); setValue(next); }}/>
  </main>;
}
const meta = {
  title: 'Calendar/CalendarFilters', component: CalendarFilters, parameters: { layout: 'fullscreen' }, render: args => <Preview {...args}/>,
  args: { value: emptyCalendarFilters, members, viewerId: copy.stories.viewerId, scope: 'workspace', onChange: fn() },
} satisfies Meta<typeof CalendarFilters>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const ActiveFilters: Story = { args: { value: active }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('status')).toHaveTextContent(filterBarData.count(4));
  await expect(c.getByRole('button', { name: filterChipData.remove(copy.chip(copy.person, copy.stories.alex)) })).toBeVisible();
} };
export const OnlyMine: Story = { args: { value: { ...emptyCalendarFilters, person: 'me' } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('switch', { name: copy.mine })).toBeChecked(); await expect(c.getByLabelText(copy.person)).toHaveValue('me');
  await userEvent.selectOptions(c.getByLabelText(copy.person), 'member:alex');
  await expect(c.getByRole('switch', { name: copy.mine })).not.toBeChecked();
  await userEvent.click(c.getByRole('switch', { name: copy.mine }));
  await expect(c.getByLabelText(copy.person)).toHaveValue('me');
  await expect(args.onChange).toHaveBeenLastCalledWith({ ...emptyCalendarFilters, person: 'me' });
} };
export const Unassigned: Story = { args: { value: { ...emptyCalendarFilters, person: 'unassigned' } } };
export const FieldScoped: Story = { args: { scope: 'own', value: active }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), toggle = c.getByRole('switch', { name: copy.mine });
  await expect(toggle).toBeChecked(); await expect(toggle).toBeDisabled(); await expect(c.getByLabelText(copy.person)).toHaveValue('me');
  await expect(c.queryByRole('option', { name: copy.stories.alex })).toBeNull();
  await userEvent.click(c.getByRole('button', { name: filterBarData.clear }));
  await expect(toggle).toBeChecked(); await expect(c.getByRole('status')).toHaveTextContent(filterBarData.count(0));
  await expect(args.onChange).toHaveBeenLastCalledWith({ ...emptyCalendarFilters, person: 'me' });
} };
export const Disabled: Story = { args: { disabled: true, value: active }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  for (const select of c.getAllByRole('combobox')) await expect(select).toBeDisabled();
  await expect(c.getByRole('switch', { name: copy.mine })).toBeDisabled();
  await userEvent.click(c.getByRole('button', { name: filterBarData.clear })); await expect(args.onChange).not.toHaveBeenCalled();
} };
export const LongContent: Story = { args: { value: { ...active, customerQuery: copy.stories.longCustomer }, members: [{ id: 'alex', name: copy.stories.longName }] } };
export const ManyMembers: Story = { args: { members: Array.from({ length: 40 }, (_, index) => ({ id: `preview-${index}`, name: copy.stories.memberName(index) })) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.selectOptions(c.getByLabelText(copy.person), 'member:preview-39');
  await expect(args.onChange).toHaveBeenLastCalledWith({ ...emptyCalendarFilters, person: 'member:preview-39' });
} };
export const StatusTransition: Story = { args: { value: { ...emptyCalendarFilters, status: 'job:waiting' } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.selectOptions(c.getByLabelText(copy.type), 'work_order');
  await expect(c.getByLabelText(copy.status)).toHaveValue('all');
  await expect(c.queryByRole('option', { name: 'Job: Waiting' })).toBeNull();
  await userEvent.selectOptions(c.getByLabelText(copy.status), 'work_order:issued');
  await expect(args.onChange).toHaveBeenLastCalledWith({ ...emptyCalendarFilters, recordType: 'work_order', status: 'work_order:issued' });
} };
export const StaleOptions: Story = { args: { value: { ...emptyCalendarFilters, person: 'member:removed', recordType: 'job', status: 'work_order:issued' } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByLabelText(copy.person)).toHaveValue('all'); await expect(c.getByLabelText(copy.status)).toHaveValue('all');
  await expect(c.getByRole('status')).toHaveTextContent(filterBarData.count(1));
} };
export const CustomerSearch: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.type(c.getByRole('searchbox', { name: copy.search }), copy.stories.customer);
  await expect(args.onChange).toHaveBeenLastCalledWith({ ...emptyCalendarFilters, customerQuery: copy.stories.customer });
  await userEvent.click(c.getByRole('button', { name: filterChipData.remove(copy.chip(copy.search, copy.stories.customer)) }));
  await expect(c.getByRole('searchbox')).toHaveValue('');
} };
export const EmptyTeam: Story = { args: { members: [] } };
export const Keyboard: Story = { args: { value: active }, play: async ({ canvasElement }) => {
  const c = within(canvasElement), user = userEvent.setup({ document: canvasElement.ownerDocument });
  const statusChip = c.getByRole('button', { name: filterChipData.remove(copy.chip(copy.status, 'Job: Scheduled')) });
  statusChip.focus(); await user.keyboard('{Enter}');
  const queryChip = c.getByRole('button', { name: filterChipData.remove(copy.chip(copy.search, copy.stories.customer)) });
  await expect(queryChip).toHaveFocus(); await user.keyboard(' ');
  await expect(c.getByRole('button', { name: filterChipData.remove(copy.chip(copy.type, copy.types.job)) })).toHaveFocus();
  c.getByRole('button', { name: filterBarData.clear }).focus(); await user.keyboard('{Enter}'); await expect(c.getByLabelText(copy.person)).toHaveFocus();
} };
