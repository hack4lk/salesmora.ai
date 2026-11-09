import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { TeamReportFilters, type TeamReportFiltersValue } from './team-report-filters';

const options = [{ value: 'b', label: 'Blair' }, { value: 'a', label: 'Alex' }, { value: 'c', label: 'Casey' }];
const meta = {
  title: 'Reports/TeamReportFilters', component: TeamReportFilters, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Canonical searchable current-member multi-select using ReportFacetFilters. OR across members; empty means all currently authorized members. Hosts query Leads by primary owner and distinct Jobs by either primary/supporting participation, preserve separate responsibility cards and the separate unassigned queue, and replace matching aggregates/evidence atomically. Assigned scope exposes Me only. Invalid saved members require explicit correction. Fictional authorized options; workspace/API integration follows separately.' } } },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="mx-auto max-w-6xl"><Story /></div></main>],
  args: { value: { members: [] }, options, scope: { kind: 'workspace' }, canRead: true, onChange: fn(), onRetry: fn() },
} satisfies Meta<typeof TeamReportFilters>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: function Render(args) {
    const [value, setValue] = useState<TeamReportFiltersValue>(args.value);
    return <TeamReportFilters {...args} value={value} onChange={next => { args.onChange(next); setValue(next); }} />;
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    expect(c.getByRole('region', { name: 'Team report filters' }).getBoundingClientRect().height).toBeLessThan(160);
    expect(c.queryByText('Current-view filters / independent of period results')).not.toBeInTheDocument();
    expect(c.queryByText('No selections: all authorized values.')).not.toBeInTheDocument();
    await userEvent.click(c.getByRole('combobox', { name: 'Current member' }));
    await userEvent.keyboard('{ArrowDown}');
    await body.findByRole('option', { name: 'Alex' });
    await expect(body.getAllByRole('option').map(option => option.textContent)).toEqual(['Alex', 'Blair', 'Casey']);
    await expect(body.queryByRole('option', { name: /No current primary owner/ })).not.toBeInTheDocument();
    for (const label of ['Alex', 'Blair']) await userEvent.click(body.getByRole('option', { name: label }));
    await userEvent.keyboard('{Escape}');
    await expect(args.onChange).toHaveBeenLastCalledWith({ members: ['a', 'b'] });
    const region = c.getByRole('region', { name: 'Team report filters' }).getBoundingClientRect();
    const picker = c.getByRole('combobox', { name: 'Current member' }).getBoundingClientRect();
    const pills = c.getByRole('group', { name: 'Active filters' }).getBoundingClientRect();
    if (region.width >= 800) {
      expect(pills.left).toBeGreaterThan(picker.right);
      expect(Math.abs(pills.top + pills.height / 2 - picker.top - picker.height / 2)).toBeLessThan(3);
    } else {
      expect(pills.top).toBeGreaterThanOrEqual(picker.bottom);
    }
    await userEvent.click(c.getByRole('button', { name: 'Remove filter: Current member: Alex' }));
    await expect(args.onChange).toHaveBeenLastCalledWith({ members: ['b'] });
    await userEvent.click(c.getByRole('button', { name: 'Clear all' }));
    await expect(args.onChange).toHaveBeenLastCalledWith({ members: [] });
    await expect(c.getByRole('combobox', { name: 'Current member' })).toHaveFocus();
  },
};
export const SearchAndKeyboard: Story = { render: Default.render, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.type(c.getByRole('combobox', { name: 'Current member' }), 'Case');
  await expect(await body.findByRole('option', { name: 'Casey' })).toBeVisible();
  await expect(body.queryByRole('option', { name: 'Alex' })).not.toBeInTheDocument();
  await userEvent.keyboard('{ArrowDown}{Enter}{Escape}');
  await expect(args.onChange).toHaveBeenLastCalledWith({ members: ['c'] });
} };
export const MyWorkload: Story = { args: { scope: { kind: 'assigned', currentMemberId: 'a' }, options: [options[1]!], value: { members: ['a'] } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    await expect(c.getByRole('button', { name: 'Remove filter: Current member: Me' })).toBeVisible();
    await expect(c.queryByText('Alex')).not.toBeInTheDocument();
    await userEvent.click(c.getByRole('combobox', { name: 'Current member' }));
    await userEvent.keyboard('{ArrowDown}');
    await expect(await body.findByRole('option', { name: 'Me' })).toBeVisible();
    await expect(body.getAllByRole('option')).toHaveLength(1);
    await userEvent.keyboard('{Escape}');
  } };
export const RemovedMember: Story = { render: Default.render, args: { value: { members: ['hidden-member-id', 'a'] } },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('alert')).toBeVisible();
    await expect(c.queryByText(/hidden-member-id/)).not.toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'Remove filter: Current member: Unavailable saved selection' }));
    await expect(args.onChange).toHaveBeenLastCalledWith({ members: ['a'] });
    await expect(c.queryByRole('alert')).not.toBeInTheDocument();
  } };
export const DuplicateSelection: Story = { render: Default.render, args: { value: { members: ['a', 'a'] } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: 'Remove filter: Current member: Alex' }));
  await expect(c.queryByRole('alert')).not.toBeInTheDocument();
} };
export const NoAuthorizedMembers: Story = { args: { options: [] }, play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await expect(c.queryByRole('alert')).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('combobox', { name: 'Current member' }));
  await userEvent.keyboard('{ArrowDown}');
  await expect(await body.findByText('No authorized options available.')).toBeVisible();
  await userEvent.keyboard('{Escape}');
} };
export const InvalidOptions: Story = { args: { options: [options[0]!, options[0]!] }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
  await expect(within(canvasElement).queryByRole('combobox')).not.toBeInTheDocument();
} };
export const UnassignedIsNotAMember: Story = { ...InvalidOptions, args: { options: [{ value: 'unassigned', label: 'No current primary owner' }] } };
export const AssignedRosterLeak: Story = { ...InvalidOptions, args: { scope: { kind: 'assigned', currentMemberId: 'a' } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toBeVisible();
  await expect(c.queryByRole('combobox')).not.toBeInTheDocument();
  await expect(c.queryByText(/Alex|Blair|Casey/)).not.toBeInTheDocument();
} };
export const Loading: Story = { args: { state: 'loading' }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('status')).toBeVisible();
  await expect(within(canvasElement).queryByRole('combobox')).not.toBeInTheDocument();
} };
export const Error: Story = { args: { state: 'error' }, play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Retry filters' }));
  await expect(args.onRetry).toHaveBeenCalledTimes(1);
} };
export const PermissionDenied: Story = { args: { canRead: false, value: { members: ['b'] } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toBeVisible();
  await expect(c.queryByRole('combobox')).not.toBeInTheDocument();
  await expect(c.queryByText('Blair')).not.toBeInTheDocument();
} };
export const Pending: Story = { args: { pending: true, value: { members: ['a'] } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  for (const name of ['Clear all', 'Remove filter: Current member: Alex']) await expect(c.getByRole('button', { name })).toBeDisabled();
  await expect(c.getByRole('combobox', { name: 'Current member' })).toBeDisabled();
  await expect(args.onChange).not.toHaveBeenCalled();
} };
export const Help: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  const trigger = c.getByRole('button', { name: 'About Team report filters' });
  expect(trigger.parentElement).toBe(c.getByRole('heading', { name: 'Team report filters' }).parentElement);
  trigger.focus(); await userEvent.keyboard('{Enter}');
  const dialog = await body.findByRole('dialog', { name: 'About Team report filters' });
  await waitFor(() => expect(dialog).toBeVisible());
  await expect(within(dialog).getByText('Current-view filters / independent of period results')).toBeVisible();
  await expect(within(dialog).getByText(/each Job counts once overall/)).toBeVisible();
  await expect(within(dialog).getByText(/unassigned queue stays separate/)).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
} };
