import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Toast } from '@salesmora/ui';
import { AddLeadDrawer, type AddLeadDrawerProps, type AddLeadResult } from './add-lead-drawer';
import { addLeadDrawerData as copy } from './add-lead-drawer.data';
import { createLeadFormData as form } from '../create-lead-form/create-lead-form.data';
import { leadOwnerSelectData as owner } from '../lead-owner-select/lead-owner-select.data';

type Created = Extract<AddLeadResult, { ok: true }>;
function Preview(args: AddLeadDrawerProps) {
  const [open, setOpen] = useState(args.open), [created, setCreated] = useState<Created>(), [toast, setToast] = useState(false);
  return <>
    <button type="button" onClick={() => setOpen(true)} className="min-h-11 cursor-pointer rounded-xl bg-primary px-5 py-3 font-semibold text-white focus-visible:focus-ring">{copy.stories.open}</button>
    {created && <div className="mt-6 grid gap-3"><a href={created.lead.href} className="w-fit rounded-lg text-primary underline focus-visible:focus-ring">{copy.stories.created}: {created.lead.name}</a>{created.hiddenByFilters && <><p className="m-0 text-muted">{copy.stories.hidden}</p><button type="button" onClick={() => setCreated({ ...created, hiddenByFilters: false })} className="min-h-11 w-fit cursor-pointer rounded-xl border border-line px-4 text-primary focus-visible:focus-ring">{copy.stories.clear}</button></>}</div>}
    <AddLeadDrawer {...args} open={open} onClose={() => { args.onClose(); setOpen(false); }} onCreated={result => { args.onCreated(result); setCreated(result); setToast(true); }}/>
    <Toast open={toast} kind="success" message={copy.stories.success} onClose={() => setToast(false)}/>
  </>;
}
const success: Created = { ok: true, lead: { id: 'preview-created', name: copy.stories.filled.name, href: copy.stories.href } };
const meta = { title: 'Leads/AddLeadDrawer', component: Preview, parameters: { layout: 'fullscreen' },
  args: { open: true, canCreate: true, canAssign: true, viewerId: 'sam', members: copy.stories.members, canManageBilling: true, billingHref: copy.stories.billingHref,
    onClose: fn(), onCreated: fn(), onRetryOwners: fn(), onSubmit: fn<AddLeadDrawerProps['onSubmit']>(async () => success) },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-6 mt-3 text-muted">{copy.stories.description}</p><Story/></main>],
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Filled: Story = { args: { initialValues: copy.stories.filled } };
export const RequiredValidation: Story = { play: async ({ canvasElement, args }) => {
  const body = within(canvasElement.ownerDocument.body);
  await userEvent.click(body.getByRole('button', { name: form.submit }));
  await expect(body.getByRole('textbox', { name: /Lead name/ })).toHaveFocus();
  await expect(body.getByText(form.errors.name)).toBeVisible();
  await expect(args.onSubmit).not.toHaveBeenCalled();
} };
export const InvalidEmail: Story = { args: { initialValues: { ...copy.stories.filled, email: form.stories.invalidEmail } }, play: async ({ canvasElement, args }) => {
  const body = within(canvasElement.ownerDocument.body);
  await userEvent.click(body.getByRole('button', { name: form.submit }));
  await expect(body.getByRole('textbox', { name: /Email address/ })).toHaveFocus();
  await expect(args.onSubmit).not.toHaveBeenCalled();
} };
export const Pending: Story = { args: { ...Filled.args, onSubmit: fn<AddLeadDrawerProps['onSubmit']>(() => new Promise(() => {})) }, play: async ({ canvasElement, args }) => {
  const body = within(canvasElement.ownerDocument.body);
  await userEvent.dblClick(body.getByRole('button', { name: form.submit }));
  await expect(body.getByRole('button', { name: 'Close panel' })).toBeDisabled();
  await userEvent.keyboard('{Escape}');
  await expect(body.getByRole('dialog')).toBeInTheDocument();
  await expect(args.onSubmit).toHaveBeenCalledTimes(1);
} };
export const ServerError: Story = { args: { ...Filled.args, onSubmit: fn<AddLeadDrawerProps['onSubmit']>(async () => ({ ok: false, message: copy.stories.failure })) }, play: async ({ canvasElement }) => {
  const body = within(canvasElement.ownerDocument.body);
  await userEvent.click(body.getByRole('button', { name: form.submit }));
  await waitFor(() => expect(body.getByText(copy.stories.failure)).toBeVisible());
  await expect(body.getByRole('textbox', { name: /Lead name/ })).toHaveValue(copy.stories.filled.name);
} };
export const Retry: Story = { args: Filled.args, play: async ({ canvasElement, args }) => {
  args.onSubmit.mockResolvedValueOnce({ ok: false, message: copy.stories.failure });
  const body = within(canvasElement.ownerDocument.body);
  await userEvent.click(body.getByRole('button', { name: form.submit }));
  await waitFor(() => expect(body.getByText(copy.stories.failure)).toBeVisible());
  await userEvent.click(body.getByRole('button', { name: form.submit }));
  await waitFor(() => expect(args.onSubmit).toHaveBeenCalledTimes(2));
  await expect(args.onSubmit.mock.calls[0][0].submissionId).toEqual(args.onSubmit.mock.calls[1][0].submissionId);
} };
export const PlanLimitOwner: Story = { args: { limitReached: true }, play: async ({ canvasElement }) => {
  const body = within(canvasElement.ownerDocument.body);
  await expect(body.getByRole('button', { name: form.submit })).toBeDisabled();
  await expect(body.getByRole('link', { name: copy.billing })).toBeInTheDocument();
} };
export const PlanLimitMember: Story = { args: { limitReached: true, canManageBilling: false } };
export const LimitFromServer: Story = { args: { ...Filled.args, onSubmit: fn<AddLeadDrawerProps['onSubmit']>(async () => ({ ok: false, kind: 'limit_reached' })) }, play: async ({ canvasElement }) => {
  const body = within(canvasElement.ownerDocument.body);
  await userEvent.click(body.getByRole('button', { name: form.submit }));
  await waitFor(() => expect(body.getByRole('button', { name: form.submit })).toBeDisabled());
  await expect(body.getByRole('textbox', { name: /Lead name/ })).toHaveValue(copy.stories.filled.name);
} };
export const NoAssignmentPermission: Story = { args: { canAssign: false }, play: async ({ canvasElement }) => {
  const body = within(canvasElement.ownerDocument.body);
  await expect(body.queryByRole('combobox', { name: owner.label })).not.toBeInTheDocument();
  await expect(body.queryByRole('button', { name: owner.assignMe })).not.toBeInTheDocument();
} };
export const NotAllowed: Story = { args: { canCreate: false }, play: async ({ canvasElement, args }) => {
  await expect(within(canvasElement.ownerDocument.body).queryByRole('form')).not.toBeInTheDocument();
  await expect(args.onSubmit).not.toHaveBeenCalled();
} };
export const DuplicateWarning: Story = { args: { ...Filled.args, duplicate: { name: copy.stories.filled.name, href: copy.stories.duplicateHref } } };
export const FilteredSuccess: Story = { args: { ...Filled.args, onSubmit: fn<AddLeadDrawerProps['onSubmit']>(async () => ({ ...success, hiddenByFilters: true })) }, play: async ({ canvasElement }) => {
  const body = within(canvasElement.ownerDocument.body);
  await userEvent.click(body.getByRole('button', { name: form.submit }));
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(body.getByRole('link', { name: new RegExp(copy.stories.created) })).toBeVisible();
  await expect(body.getByRole('button', { name: copy.stories.clear })).toBeVisible();
} };
export const OwnersLoading: Story = { args: { ownersLoading: true, members: [] } };
export const OwnersError: Story = { args: { ownersError: copy.stories.failure } };
export const Narrow: Story = { args: Filled.args, parameters: { viewport: { value: 'phone' } } };

export const ContractLimits: Story = { args: { initialValues: { ...copy.stories.filled, name: copy.stories.oversizedName } }, play: async ({ canvasElement, args }) => {
  const body = within(canvasElement.ownerDocument.body);
  await userEvent.click(body.getByRole('button', { name: form.submit }));
  await waitFor(() => expect(body.getByText(copy.invalid)).toBeVisible());
  await expect(args.onSubmit).not.toHaveBeenCalled();
} };
export const UnassignedSubmission: Story = { args: { ...Filled.args, canAssign: false }, play: async ({ canvasElement, args }) => {
  const body = within(canvasElement.ownerDocument.body);
  await userEvent.click(body.getByRole('button', { name: form.submit }));
  await waitFor(() => expect(args.onSubmit).toHaveBeenCalledTimes(1));
  await expect(args.onSubmit.mock.calls[0][0].lead.ownerId).toBe('');
  await expect(args.onSubmit.mock.calls[0][0].lead.stage).toBe('new');
} };
