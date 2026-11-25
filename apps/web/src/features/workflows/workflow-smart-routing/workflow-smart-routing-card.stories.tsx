import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { SmartRoutingCard } from './workflow-smart-routing-card';
const value = { name: 'Website lead routing', sourceId: 'website', strategy: 'round_robin' as const,
  memberIds: ['alex', 'morgan'], matchWorkZipCodes: true, notifications: { inApp: true, email: true } };
const meta = { title: 'Workflows/Smart lead routing', component: SmartRoutingCard, parameters: { layout: 'fullscreen' },
  render: function RoutingStory(args) {
    const [state, setState] = useState(args.state ?? 'draft');
    return <SmartRoutingCard {...args} state={state} onPublish={async value => { await args.onPublish(value); setState('published'); }}
      onCancel={() => { args.onCancel(); setState('cancelled'); }}/>;
  },
  decorators: [Story => <main className="min-h-screen bg-assistant-panel p-4 text-assistant-foreground sm:p-8"><div className="mx-auto max-w-2xl"><Story/></div></main>],
  args: { value, sources: [{ id: 'website', name: 'Website quote form', collectsPostalCode: true }],
    members: [{ id: 'alex', name: 'Alex Parker', workZipCodes: ['10001', '10002'] }, { id: 'morgan', name: 'Morgan Ellis', workZipCodes: ['10001'] }],
    teamSettingsHref: '/settings/team?workspace=example', canPublish: true, onPublish: fn(async () => {}), onCancel: fn(), onReload: fn() },
} satisfies Meta<typeof SmartRoutingCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Review: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText(/taking turns, matching each lead/)).toBeVisible();
  await expect(c.getByLabelText('In-app')).toBeChecked(); await expect(c.getByLabelText('Email')).toBeChecked();
} };
export const Settings: Story = { play: async ({ canvasElement }) => { await userEvent.click(within(canvasElement).getByRole('button', { name: 'Change settings' })); } };
export const FewestOpenLeads: Story = { args: { value: { ...value, strategy: 'fewest_open_leads' } } };
export const ChangeMethod: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: 'Change settings' }));
  await userEvent.selectOptions(c.getByLabelText('Assign using'), 'fewest_open_leads');
  await expect(c.getByText(/Counts New, Contacted/)).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: 'Publish workflow' }));
  await expect(args.onPublish).toHaveBeenCalledWith({ ...value, strategy: 'fewest_open_leads' });
} };
export const NotificationsOff: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByLabelText('In-app')); await userEvent.click(c.getByLabelText('Email'));
  await userEvent.click(c.getByRole('button', { name: 'Publish workflow' }));
  await expect(args.onPublish).toHaveBeenCalledWith({ ...value, notifications: { inApp: false, email: false } });
} };
export const MissingCoverage: Story = { args: { members: [{ id: 'alex', name: 'Alex Parker', workZipCodes: [] }, { id: 'morgan', name: 'Morgan Ellis', workZipCodes: ['10001'] }] }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: 'Publish workflow' })).toBeDisabled();
} };
export const SourceNeedsZip: Story = { args: { sources: [{ id: 'website', name: 'Website quote form', collectsPostalCode: false }] }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText(/This source needs a ZIP code field/)).toBeVisible();
  await expect(within(canvasElement).getByRole('button', { name: 'Publish workflow' })).toBeDisabled();
} };
export const Edit: Story = { args: { editing: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  await userEvent.click(c.getByRole('button', { name: 'Change settings' })); await userEvent.click(c.getByLabelText('Morgan Ellis', { exact: false }));
  await userEvent.click(c.getByRole('button', { name: 'Save changes' })); await expect(args.onPublish).toHaveBeenCalledWith({ ...value, memberIds: ['alex'] });
} };
export const SingleTeammate: Story = { args: { value: { ...value, strategy: 'one_teammate', memberIds: ['alex'], matchWorkZipCodes: false } } };
export const ReadOnly: Story = { args: { canPublish: false } };
export const Published: Story = { args: { state: 'published' } };
export const Expired: Story = { args: { state: 'expired' } };
export const Conflict: Story = { args: { conflict: true } };
export const SaveFailure: Story = { args: { onPublish: fn(async () => { throw Error('offline'); }) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: 'Publish workflow' }));
  await expect(await c.findByRole('alert')).toHaveTextContent('The workflow could not be saved. Your choices are still here.');
} };
export const Pending: Story = { args: { pending: true } };
export const Cancel: Story = { play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Cancel' }));
  await expect(args.onCancel).toHaveBeenCalledOnce(); await expect(args.onPublish).not.toHaveBeenCalled();
} };
export const Mobile: Story = { globals: { viewport: { value: 'phone', isRotated: false } } };
