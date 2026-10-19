import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { NotificationPreferencesPage, type NotificationPreferencesPageProps } from './notification-preferences-page';
import { notificationPreferencesPageData as copy } from './notification-preferences-page.data';

function Preview(args: NotificationPreferencesPageProps) {
  const [values, setValues] = useState(args.values);
  const [saved, setSaved] = useState(args.savedValues);
  const [state, setState] = useState(args.state);
  const [saveState, setSaveState] = useState(args.saveState);
  return <NotificationPreferencesPage {...args} state={state} values={values} savedValues={saved} saveState={saveState}
    onChange={next => { args.onChange(next); setValues(next); setSaveState('idle'); }}
    onSave={next => { args.onSave(next); setSaved(next); setSaveState('saved'); }}
    onDiscard={() => { args.onDiscard(); setValues(saved); setSaveState('idle'); }}
    onRetry={() => { args.onRetry(); setState('ready'); }}/>;
}
const meta = {
  title: 'Settings/NotificationPreferencesPage', component: NotificationPreferencesPage, parameters: { layout: 'fullscreen' },
  args: { settingsHref: copy.stories.settingsHref, state: 'ready', values: { leadAssignedEmail: true }, savedValues: { leadAssignedEmail: true }, saveState: 'idle', onChange: fn(), onSave: fn(), onDiscard: fn(), onRetry: fn() },
  render: args => <Preview {...args}/>,
  decorators: [Story => <main className="mx-auto min-h-screen w-full max-w-6xl p-4 sm:p-8"><p className="mb-6 mt-0 text-sm leading-6 text-muted">{copy.stories.notice}</p><Story/></main>],
} satisfies Meta<typeof NotificationPreferencesPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('switch', { name: copy.leadAssigned })).toBeChecked();
  await expect(c.getByRole('button', { name: copy.save })).toBeDisabled();
  await expect(c.getByRole('button', { name: copy.discard })).toBeDisabled();
  await expect(c.getByRole('link', { name: copy.back })).toHaveAttribute('href', copy.stories.settingsHref);
} };
export const EmailOff: Story = { args: { values: { leadAssignedEmail: false }, savedValues: { leadAssignedEmail: false } } };
export const UnsavedChanges: Story = { args: { values: { leadAssignedEmail: false } } };
export const Saving: Story = { args: { values: { leadAssignedEmail: false }, saveState: 'pending' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('switch')).toBeDisabled();
  await expect(c.getByRole('button', { name: copy.saving })).toBeDisabled();
  await expect(c.getByRole('button', { name: copy.discard })).toBeDisabled();
  await expect(args.onSave).not.toHaveBeenCalled();
} };
export const SaveError: Story = { args: { values: { leadAssignedEmail: false }, saveState: 'error' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.saveErrorTitle);
  await expect(c.getByRole('switch')).not.toBeChecked();
  await userEvent.click(c.getByRole('button', { name: copy.save }));
  await expect(c.getByRole('status', { name: copy.successTitle })).toBeVisible();
} };
export const Saved: Story = { args: { saveState: 'saved' } };
export const Loading: Story = { args: { state: 'loading' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('status')).toHaveTextContent(copy.loading);
  await expect(c.queryByRole('switch')).not.toBeInTheDocument();
  await expect(c.queryByRole('button', { name: copy.save })).not.toBeInTheDocument();
} };
export const LoadError: Story = { args: { state: 'error' } };
export const RetryLoading: Story = { args: { state: 'error' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.loadErrorTitle);
  await userEvent.click(c.getByRole('button', { name: copy.retry }));
  await expect(args.onRetry).toHaveBeenCalledOnce();
  await expect(c.getByRole('switch')).toBeVisible();
} };
export const ToggleAndSave: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  const toggle = c.getByRole('switch', { name: copy.leadAssigned });
  toggle.focus(); await expect(toggle).toHaveFocus();
  await userEvent.keyboard(' ');
  await expect(toggle).not.toBeChecked();
  await expect(args.onChange).toHaveBeenCalledWith({ leadAssignedEmail: false });
  await expect(args.onSave).not.toHaveBeenCalled();
  await expect(c.getByText(copy.appDescription)).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: copy.save }));
  await expect(args.onSave).toHaveBeenCalledOnce();
  await expect(args.onSave).toHaveBeenCalledWith({ leadAssignedEmail: false });
  await expect(c.getByRole('status', { name: copy.successTitle })).toBeVisible();
  await expect(c.getByRole('button', { name: copy.save })).toBeDisabled();
} };
export const DiscardChanges: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('switch'));
  await userEvent.click(c.getByRole('button', { name: copy.discard }));
  await expect(c.getByRole('switch')).toBeChecked();
  await expect(args.onDiscard).toHaveBeenCalledOnce();
  await expect(args.onSave).not.toHaveBeenCalled();
  await expect(c.getByRole('button', { name: copy.save })).toBeDisabled();
} };
export const Narrow: Story = { globals: { viewport: { value: 'mobile1', isRotated: false } } };
