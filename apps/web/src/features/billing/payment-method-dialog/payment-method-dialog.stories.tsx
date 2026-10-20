import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { PaymentMethodDialog, type PaymentMethodDialogProps, type PaymentMethodState } from './payment-method-dialog';
import { paymentMethodDialogData as copy } from './payment-method-dialog.data';

function Preview(args: PaymentMethodDialogProps) {
  const [state, setState] = useState<PaymentMethodState>(args.state ?? 'editing');
  const [open, setOpen] = useState(args.open);
  return <PaymentMethodDialog {...args} open={open} state={state} card={['saved','recovering','recovered','payment-failed'].includes(state) ? copy.replacement : args.card}
    cardForm={<div className="rounded-xl border border-line bg-paper p-5 text-sm leading-6 text-muted">{copy.previewFields}</div>}
    verificationForm={<div className="rounded-xl border border-line bg-canvas p-5 text-sm leading-6 text-muted">{copy.previewVerification}</div>}
    onClose={() => { args.onClose(); setOpen(false); }} onSave={() => { args.onSave(); setState('saved'); }} onPay={() => { args.onPay?.(); setState('recovered'); }} onChangeCard={() => setState('editing')}/>;
}
const meta = {
  title: 'Billing/PaymentMethodDialog', component: PaymentMethodDialog, render: args => <Preview {...args}/>,
  parameters: { layout: 'fullscreen' }, args: { open: true, viewerRole: 'owner', card: copy.fixture, canSave: true, onClose: fn(), onSave: fn(), onPay: fn() },
  decorators: [Story => <main className="min-h-screen bg-canvas p-6"><p className="m-0 text-sm text-muted">{copy.preview}</p><Story/></main>],
} satisfies Meta<typeof PaymentMethodDialog>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement.ownerDocument.body);
  const save = c.getByRole('button', { name: copy.save });
  await expect(save).toBeDisabled(); await userEvent.click(c.getByRole('checkbox')); await userEvent.click(save);
  await expect(args.onSave).toHaveBeenCalledTimes(1); await expect(c.getByRole('status')).toHaveAccessibleDescription(copy.saved);
} };
export const Editing: Story = {};
export const Saving: Story = { args: { state: 'saving' } };
export const Verification: Story = { args: { state: 'authenticating' } };
export const SaveFailed: Story = { args: { state: 'error' } };
export const Saved: Story = { args: { state: 'saved' } };
export const RenewalRecovery: Story = { args: { recovery: copy.recovery }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement.ownerDocument.body);
  await expect(c.queryByRole('button', { name: copy.pay('$29.00') })).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('checkbox')); await userEvent.click(c.getByRole('button', { name: copy.save }));
  await expect(args.onPay).not.toHaveBeenCalled(); await userEvent.click(c.getByRole('button', { name: copy.pay('$29.00') }));
  await expect(args.onPay).toHaveBeenCalledTimes(1); await expect(c.getByRole('status')).toHaveAccessibleDescription(copy.recovered);
} };
export const RecoveryReview: Story = { args: { state: 'saved', recovery: copy.recovery } };
export const ProcessingPayment: Story = { args: { state: 'recovering', recovery: copy.recovery } };
export const PaymentFailed: Story = { args: { state: 'payment-failed', recovery: copy.recovery } };
export const PaymentReceived: Story = { args: { state: 'recovered' } };
export const AdminReadOnly: Story = { args: { viewerRole: 'admin' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement.ownerDocument.body);
  await expect(c.getByText(copy.readOnly)).toBeVisible(); await expect(c.queryByRole('button', { name: copy.save })).not.toBeInTheDocument();
} };
