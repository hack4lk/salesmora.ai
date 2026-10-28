import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CalendarTeamWorkload, type CalendarTeamWorkloadProps } from './calendar-team-workload';
import { calendarTeamWorkloadData as copy, calendarWorkloadMembers as members, calendarWorkloadVisits as visits } from './calendar-team-workload.data';

function Preview(args: CalendarTeamWorkloadProps) {
  const [selected, setSelected] = useState(args.selectedPerson);
  return <main className="min-h-screen bg-canvas p-4 text-ink sm:p-6"><h1 className="m-0 text-heading font-semibold">{copy.stories.title}</h1>
    <p className="mb-6 mt-2 text-sm text-muted">{copy.stories.description}</p><div className="w-full max-w-2xl">
      <CalendarTeamWorkload {...args} selectedPerson={selected} onSelect={person => { args.onSelect(person); setSelected(person); }}/>
    </div></main>;
}
const meta = {
  title: 'Calendar/CalendarTeamWorkload', component: CalendarTeamWorkload, parameters: { layout: 'fullscreen' }, render: args => <Preview {...args}/>,
  args: { weekDate: copy.stories.weekDate, visits, members, viewerId: copy.stories.viewerId, scope: 'workspace', selectedPerson: 'all', onSelect: fn(), onRetry: fn() },
} satisfies Meta<typeof CalendarTeamWorkload>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByRole('status')).toHaveTextContent(copy.weekCount(4));
  await userEvent.click(c.getByRole('button', { name: copy.filter(copy.stories.alex) }));
  await expect(args.onSelect).toHaveBeenLastCalledWith('member:alex');
  await expect(c.getByRole('button', { name: copy.filter(copy.stories.alex) })).toHaveAttribute('aria-pressed', 'true');
  await userEvent.click(c.getByRole('button', { name: copy.everyone })); await expect(args.onSelect).toHaveBeenLastCalledWith('all');
} };
export const SharedVisit: Story = { args: { visits: [visits[0], visits[0]] }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('status')).toHaveTextContent(copy.weekCount(1));
  await expect(c.getByRole('button', { name: copy.filter(copy.stories.sam) })).toHaveTextContent(copy.count(1));
  await expect(c.getByRole('button', { name: copy.filter(copy.stories.alex) })).toHaveTextContent(copy.count(1));
} };
export const BusyDay: Story = { args: { visits: Array.from({ length: 4 }, (_, index) => ({ ...visits[1], id: `busy-${index}` })) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText(copy.busy)).toBeVisible(); await expect(c.getByText(copy.busyDay('Oct 20', 4))).toBeVisible();
} };
export const SpreadAcrossWeek: Story = { args: { visits: ['2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22'].map((scheduledDate, index) => ({ ...visits[1], id: `spread-${index}`, scheduledDate })) }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByText(copy.busy)).toBeNull();
} };
export const SelectedPerson: Story = { args: { selectedPerson: 'me' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), me = c.getByRole('button', { name: copy.filter(copy.stories.sam) });
  await expect(me).toHaveAttribute('aria-pressed', 'true'); await userEvent.click(me); await expect(args.onSelect).toHaveBeenLastCalledWith('all');
} };
export const Unassigned: Story = { args: { selectedPerson: 'unassigned' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), unassigned = c.getByRole('button', { name: copy.filter(copy.unassigned) });
  await expect(unassigned).toHaveAttribute('aria-pressed', 'true'); await expect(unassigned).toHaveTextContent(copy.count(1));
  await userEvent.click(c.getByRole('button', { name: copy.everyone })); await userEvent.click(unassigned); await expect(args.onSelect).toHaveBeenLastCalledWith('unassigned');
} };
export const FieldScoped: Story = { args: { scope: 'own' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByRole('status')).toHaveTextContent(copy.weekCount(2));
  await expect(c.queryByText(copy.stories.alex)).toBeNull(); await expect(c.queryByText(copy.unassigned)).toBeNull();
  const me = c.getByRole('button', { name: copy.filter(copy.stories.sam) }); await expect(me).toBeDisabled(); await expect(me).toHaveAttribute('aria-pressed', 'true');
  await expect(args.onSelect).not.toHaveBeenCalled();
} };
export const ZeroVisits: Story = { args: { visits: [] }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText(copy.empty)).toBeVisible(); await expect(c.getByRole('button', { name: copy.filter(copy.stories.sam) })).toHaveTextContent(copy.count(0));
} };
export const NoTeam: Story = { args: { visits: [], members: [] } };
export const LongContent: Story = { args: { members: [{ id: 'sam', name: copy.stories.longName }, members[1], members[2]] } };
export const Disabled: Story = { args: { disabled: true, selectedPerson: 'member:alex' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); for (const button of c.getAllByRole('button')) await expect(button).toBeDisabled(); await expect(args.onSelect).not.toHaveBeenCalled();
} };
export const Loading: Story = { args: { state: 'loading' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('status')).toHaveTextContent(copy.loading); await expect(c.queryByText(copy.stories.sam)).toBeNull();
} };
export const Error: Story = { args: { state: 'error' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.queryByText(copy.stories.sam)).toBeNull(); await userEvent.click(c.getByRole('button', { name: copy.retry })); await expect(args.onRetry).toHaveBeenCalledTimes(1);
} };
export const OutsideWeek: Story = { args: { visits: [...visits, { ...visits[1], id: 'outside', scheduledDate: '2026-10-26' }] }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('status')).toHaveTextContent(copy.weekCount(4));
} };
export const YearBoundary: Story = { args: { weekDate: '2027-01-01', visits: [{ ...visits[1], scheduledDate: '2026-12-31' }] } };
export const Keyboard: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), user = userEvent.setup({ document: canvasElement.ownerDocument }), person = c.getByRole('button', { name: copy.filter(copy.stories.sam) });
  person.focus(); await user.keyboard('{Enter}'); await expect(args.onSelect).toHaveBeenLastCalledWith('me');
  await user.keyboard(' '); await expect(args.onSelect).toHaveBeenLastCalledWith('all'); await expect(person).toHaveFocus();
} };
