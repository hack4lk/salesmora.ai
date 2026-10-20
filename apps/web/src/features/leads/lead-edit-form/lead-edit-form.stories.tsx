import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { Toast } from '@salesmora/ui';
import { LeadEditForm, type LeadEditFormProps, type LeadEditValues } from './lead-edit-form';
import { leadEditFormData as copy } from './lead-edit-form.data';

type PreviewProps = Omit<LeadEditFormProps, 'onChange' | 'onSaved' | 'onCancel' | 'onDirtyChange'>;
function Preview(args: PreviewProps) {
  const [lead, setLead] = useState(args.lead), [value, setValue] = useState(args.value), [editing, setEditing] = useState(true);
  const [error, setError] = useState(args.error);
  const [saved, setSaved] = useState(false), [, setDirty] = useState(false);
  return <>
    {editing ? <LeadEditForm {...args} lead={lead} value={value} error={error} onChange={setValue}
      onSubmit={async request => { const result = await args.onSubmit(request); return result.ok ? { ...result, lead: { ...result.lead, origin: lead.origin, values: { ...result.lead.values, source: lead.origin === 'manual' ? result.lead.values.source : lead.values.source } } } : result; }} onDirtyChange={setDirty}
      onCancel={() => { setValue(lead.values); setEditing(false); }}
      onSaved={record => { setLead(record); setValue(record.values); setSaved(true); }}
      onReload={args.onReload ? async () => { await args.onReload?.(); const values = { ...lead.values, service: copy.stories.changedService, notes: copy.stories.changedNotes }; setLead({ ...lead, version: lead.version + 1, values }); setValue(values); setError(undefined); } : undefined}/>
      : <div><p>{copy.stories.canceled}</p><button type="button" onClick={() => setEditing(true)} className="min-h-11 cursor-pointer rounded-xl bg-primary px-5 text-white focus-visible:focus-ring">{copy.stories.edit}</button></div>}
    <Toast open={saved} kind="success" message={copy.stories.saved} autoHideMs={2000} onClose={() => setSaved(false)}/>
  </>;
}
const base = copy.stories.record;
const draft: LeadEditValues = { ...base.values, service: copy.stories.changedService };
const meta = { title: 'Leads/LeadEditForm', component: Preview, parameters: { layout: 'fullscreen' },
  args: { lead: base, value: base.values, onSubmit: fn<LeadEditFormProps['onSubmit']>(async request => ({ ok: true, lead: { ...base, version: request.expectedVersion + 1, values: { ...base.values, ...request.values } } })), onReload: fn(async () => {}) },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="mx-auto w-full max-w-3xl"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-6 mt-3 text-muted">{copy.stories.description}</p><Story/></div></main>],
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement }) => { await expect(within(canvasElement).getByRole('button', { name: copy.save })).toBeDisabled(); } };
export const Dirty: Story = { args: { value: draft } };
export const GmailSource: Story = { args: { lead: { ...base, origin: 'gmail', values: { ...base.values, source: 'gmail' } }, value: { ...draft, source: 'gmail' } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('combobox', { name: copy.labels.source })).toBeDisabled();
} };
export const CampaignSource: Story = { args: { lead: { ...base, origin: 'campaign' }, value: draft } };
export const ReadOnly: Story = { args: { lead: { ...base, canEdit: false } }, play: async ({ canvasElement }) => { await expect(within(canvasElement).queryByRole('button', { name: copy.save })).not.toBeInTheDocument(); } };
export const InvalidEmail: Story = { args: { value: { ...base.values, email: copy.stories.invalidEmail } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.save }));
  await expect(c.getByRole('textbox', { name: /Email address/ })).toHaveFocus();
  await expect(args.onSubmit).not.toHaveBeenCalled();
} };
export const Pending: Story = { args: { value: draft, onSubmit: fn<LeadEditFormProps['onSubmit']>(() => new Promise(() => {})) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.save }));
  fireEvent.submit(c.getByRole('form')); await expect(args.onSubmit).toHaveBeenCalledTimes(1);
  await expect(c.getByRole('button', { name: copy.cancel })).toBeDisabled();
  await expect(c.getByRole('textbox', { name: /Lead name/ })).toBeDisabled();
} };
export const ServerError: Story = { args: { value: draft, onSubmit: fn<LeadEditFormProps['onSubmit']>(async () => ({ ok: false, error: { kind: 'error', message: copy.failed } })) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.save }));
  await waitFor(() => expect(c.getByText(copy.failed)).toBeVisible());
  await expect(c.getByRole('textbox', { name: /Service requested/ })).toHaveValue(draft.service);
} };
export const Conflict: Story = { args: { value: draft, error: { kind: 'conflict', message: copy.stories.conflict, changedFields: ['service', 'notes'] } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('button', { name: copy.save })).toBeDisabled();
  await expect(c.getByRole('textbox', { name: /Service requested/ })).toHaveAttribute('readonly');
  await expect(c.getAllByText(copy.changed)).toHaveLength(2);
} };
export const ConfirmDiscard: Story = { args: Dirty.args, play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('button', { name: copy.cancel }));
  await waitFor(() => expect(body.getByRole('alertdialog')).toBeVisible());
} };
export const ReloadConflict: Story = { args: { value: draft, onSubmit: fn<LeadEditFormProps['onSubmit']>(async () => ({ ok: false, error: { kind: 'conflict', message: copy.stories.conflict, changedFields: ['service', 'notes'] } })) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('button', { name: copy.save }));
  await waitFor(() => expect(c.getByRole('button', { name: copy.reload })).toBeVisible());
  await userEvent.click(c.getByRole('button', { name: copy.reload }));
  await waitFor(() => expect(body.getByRole('alertdialog')).toBeVisible());
  await userEvent.click(body.getByRole('button', { name: copy.reloadConfirm }));
  await waitFor(() => expect(args.onReload).toHaveBeenCalledTimes(1));
  await waitFor(() => expect(c.getByRole('textbox', { name: /Notes/ })).toHaveValue(copy.stories.changedNotes));
} };
export const Save: Story = { args: Dirty.args, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.save }));
  await waitFor(() => expect(args.onSubmit).toHaveBeenCalledWith({ leadId: base.id, expectedVersion: base.version, values: draft }));
  await waitFor(() => expect(c.getByRole('button', { name: copy.save })).toBeDisabled());
} };
export const ProtectedSourceSubmission: Story = { args: GmailSource.args, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.save }));
  await waitFor(() => expect(args.onSubmit).toHaveBeenCalledTimes(1));
  await expect(args.onSubmit.mock.calls[0][0].values).not.toHaveProperty('source');
  await expect(args.onSubmit.mock.calls[0][0].values).not.toHaveProperty('stage');
  await expect(args.onSubmit.mock.calls[0][0].values).not.toHaveProperty('ownerId');
} };
export const Narrow: Story = { args: Dirty.args, parameters: { viewport: { value: 'phone' } } };
