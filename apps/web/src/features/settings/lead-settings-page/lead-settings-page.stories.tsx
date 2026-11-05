import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { LeadSettingsPage, type LeadSettingsPageProps } from './lead-settings-page';
import { leadSettingsPageData as copy } from './lead-settings-page.data';
import { defaultLeadAssignmentData as assignmentCopy } from '../default-lead-assignment/default-lead-assignment.data';
function Preview(args: LeadSettingsPageProps) {
  const [value, setValue] = useState(args.assignment.value), [savedValue, setSaved] = useState(args.assignment.savedValue);
  return <LeadSettingsPage {...args} assignment={{ ...args.assignment, value, savedValue, onChange: next => { args.assignment.onChange(next); setValue(next); }, onDiscard: () => { args.assignment.onDiscard(); setValue(savedValue); }, onSave: async request => { await args.assignment.onSave(request); setSaved(request.value); } }} />;
}
const assignment = { value: { kind: 'unassigned' as const }, savedValue: { kind: 'unassigned' as const }, revision: 1, canRead: true, canManage: true, teammates: [{ id: 'alex', name: assignmentCopy.stories.alex }], onChange: fn(), onDiscard: fn(), onReload: fn(), onRetryTeammates: fn(), onSave: fn(async () => {}) };
const meta = { title: 'Settings/LeadSettingsPage', component: LeadSettingsPage, render: args => <Preview {...args} />, parameters: { layout: 'fullscreen' },
  decorators: [Story => <main className="mx-auto grid min-h-screen max-w-4xl content-start gap-6 bg-canvas p-4 sm:p-8"><p className="m-0 text-sm leading-6 text-muted">{copy.stories.notice}</p><Story /></main>],
  args: { settingsHref: '/settings?workspace=fictional-workspace', assignment },
} satisfies Meta<typeof LeadSettingsPage>;
export default meta; type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.getByRole('heading', { name: copy.title, level: 1 })).toBeVisible(); await expect(c.getByRole('link', { name: copy.back })).toHaveAttribute('href', '/settings?workspace=fictional-workspace'); } };
export const Save: Story = { play: async ({ canvasElement, args }) => { const c = within(canvasElement); await userEvent.click(c.getByRole('radio', { name: assignmentCopy.teammate })); await userEvent.selectOptions(c.getByRole('combobox'), 'alex'); await userEvent.click(c.getByRole('button', { name: assignmentCopy.save })); await expect(args.assignment.onSave).toHaveBeenCalledWith({ value: { kind: 'teammate', teammateId: 'alex' }, expectedVersion: 1 }); } };
export const ReadOnly: Story = { args: { assignment: { ...assignment, canManage: false } } };
export const Loading: Story = { args: { assignment: { ...assignment, state: 'loading' } } };
export const Failed: Story = { args: { assignment: { ...assignment, state: 'error' } } };
export const Conflict: Story = { args: { assignment: { ...assignment, value: { kind: 'teammate', teammateId: 'alex' }, conflict: true } } };
export const Denied: Story = { args: { assignment: { ...assignment, canRead: false } } };
