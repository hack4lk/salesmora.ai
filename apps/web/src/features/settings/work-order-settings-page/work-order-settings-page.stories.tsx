import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { WorkOrderSettingsPage, type WorkOrderSettingsPageProps } from './work-order-settings-page';
import { workOrderSettingsPageData as copy } from './work-order-settings-page.data';

function Preview(args: WorkOrderSettingsPageProps) {
  const [values, setValues] = useState(args.values), [saved, setSaved] = useState(args.savedValues), [saveState, setSaveState] = useState(args.saveState);
  return <WorkOrderSettingsPage {...args} values={values} savedValues={saved} saveState={saveState}
    onChange={next => { args.onChange(next); setValues(next); setSaveState('idle'); }}
    onSave={next => { args.onSave(next); setSaved(next); setSaveState('saved'); }}
    onDiscard={() => { args.onDiscard(); setValues(saved); setSaveState('idle'); }}/>;
}
const base = { signoffRequired: false, businessPhone: '' };
const meta = {
  title: 'Settings/WorkOrderSettingsPage', component: WorkOrderSettingsPage, parameters: { layout: 'fullscreen' },
  args: { settingsHref: copy.stories.settingsHref, canEdit: true, values: base, savedValues: base, saveState: 'idle', onChange: fn(), onSave: fn(), onDiscard: fn() },
  render: args => <Preview {...args}/>,
  decorators: [Story => <main className="mx-auto min-h-screen w-full max-w-6xl p-4 sm:p-8"><p className="mb-6 mt-0 text-sm leading-6 text-muted">{copy.stories.notice}</p><Story/></main>],
} satisfies Meta<typeof WorkOrderSettingsPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('switch', { name: copy.signoffLabel })).not.toBeChecked();
  await expect(c.getByRole('button', { name: copy.save })).toBeDisabled();
} };
export const EditAndSave: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('switch', { name: copy.signoffLabel }));
  await userEvent.type(c.getByLabelText(copy.phoneLabel), '555 010 2000');
  await userEvent.click(c.getByRole('button', { name: copy.save }));
  await expect(args.onSave).toHaveBeenCalledWith({ signoffRequired: true, businessPhone: '555 010 2000' });
} };
export const ReadOnly: Story = { args: { canEdit: false, values: { signoffRequired: true, businessPhone: '(555) 010-2000' }, savedValues: { signoffRequired: true, businessPhone: '(555) 010-2000' } } };
export const SaveError: Story = { args: { saveState: 'error' } };
