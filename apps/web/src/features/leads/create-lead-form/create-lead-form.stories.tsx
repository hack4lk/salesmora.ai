import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CreateLeadForm, type CreateLeadFormProps } from './create-lead-form';
import { createLeadFormData as copy } from './create-lead-form.data';
import { emptyLead } from './create-lead-form.validation';

const meta = {
  title: 'Leads/CreateLeadForm', component: CreateLeadForm,
  decorators: [(Story) => <main className="mx-auto w-full max-w-4xl p-4 sm:p-8"><h1 className="mb-2 text-heading font-semibold text-ink">{copy.formLabel}</h1><p className="mb-6 text-sm text-muted">{copy.stories.preview}</p><Story /></main>],
  args: { owners: copy.stories.owners, onSubmit: fn<CreateLeadFormProps['onSubmit']>(async () => ({ ok: true })), onCancel: fn(), successMessage: copy.stories.success },
} satisfies Meta<typeof CreateLeadForm>;
export default meta;
type Story = StoryObj<typeof meta>;
const label = (key: keyof typeof copy.labels) => new RegExp(copy.labels[key]);

export const Default: Story = {};
export const Filled: Story = { args: { initialValues: copy.stories.filled } };
export const NoOwners: Story = { args: { owners: [] }, play: async ({ canvasElement }) => {
  const owner = within(canvasElement).getByRole('combobox', { name: copy.labels.ownerId });
  await expect(within(owner).getAllByRole('option')).toHaveLength(1);
  await expect(owner).toHaveValue('');
} };
export const RequiredValidation: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
  await expect(canvas.getByRole('textbox', { name: label('name') })).toHaveFocus();
  await expect(canvas.getByText(copy.errors.name)).toBeVisible();
  await expect(canvas.getByText(copy.errors.service)).toBeVisible();
  await expect(args.onSubmit).not.toHaveBeenCalled();
} };
export const InvalidEmail: Story = { args: { initialValues: { ...copy.stories.filled, email: copy.stories.invalidEmail } }, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
  await expect(canvas.getByRole('textbox', { name: label('email') })).toHaveFocus();
  await expect(canvas.getByRole('textbox', { name: label('email') })).toHaveAccessibleDescription(copy.errors.email);
  await expect(args.onSubmit).not.toHaveBeenCalled();
} };
export const MinimalSubmission: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.type(canvas.getByRole('textbox', { name: label('name') }), ` ${copy.stories.filled.name} `);
  await userEvent.type(canvas.getByRole('textbox', { name: label('service') }), ` ${copy.stories.filled.service} `);
  await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
  await expect(canvas.getByRole('status')).toHaveAccessibleDescription(copy.stories.success);
  await expect(args.onSubmit).toHaveBeenCalledWith({ ...emptyLead, name: copy.stories.filled.name, service: copy.stories.filled.service });
} };
export const FullSubmission: Story = { args: { initialValues: copy.stories.filled }, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.selectOptions(canvas.getByRole('combobox', { name: copy.labels.source }), 'phone');
  await userEvent.selectOptions(canvas.getByRole('combobox', { name: copy.labels.stage }), 'estimate-sent');
  await userEvent.selectOptions(canvas.getByRole('combobox', { name: copy.labels.ownerId }), 'ava');
  await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
  await expect(canvas.getByRole('status')).toBeVisible();
  await expect(args.onSubmit).toHaveBeenCalledWith({ ...copy.stories.filled, source: 'phone', stage: 'estimate-sent', ownerId: 'ava' });
} };
export const Pending: Story = { args: { initialValues: copy.stories.filled, onSubmit: fn<CreateLeadFormProps['onSubmit']>(() => new Promise(() => {})) }, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.dblClick(canvas.getByRole('button', { name: copy.submit }));
  await expect(canvas.getByRole('form')).toHaveAttribute('aria-busy', 'true');
  for (const control of [...canvas.getAllByRole('textbox'), ...canvas.getAllByRole('combobox'), ...canvas.getAllByRole('button')]) await expect(control).toBeDisabled();
  await expect(args.onSubmit).toHaveBeenCalledTimes(1);
} };
export const ServerError: Story = { args: { initialValues: copy.stories.filled, onSubmit: fn<CreateLeadFormProps['onSubmit']>(async () => ({ ok: false, message: copy.stories.serverError })) }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
  await expect(canvas.getByRole('alert')).toHaveAccessibleDescription(copy.stories.serverError);
  await expect(canvas.getByRole('textbox', { name: label('details') })).toHaveValue(copy.stories.filled.details);
  await expect(canvas.getByRole('button', { name: copy.submit })).toBeEnabled();
} };
export const Retry: Story = { args: { initialValues: copy.stories.filled }, play: async ({ canvasElement, args }) => {
  args.onSubmit.mockResolvedValueOnce({ ok: false, message: copy.stories.serverError });
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
  await expect(canvas.getByRole('alert')).toBeVisible();
  await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
  await expect(canvas.getByRole('status')).toBeVisible();
  await expect(args.onSubmit).toHaveBeenCalledTimes(2);
} };
export const ThrownError: Story = { args: { initialValues: copy.stories.filled, onSubmit: fn<CreateLeadFormProps['onSubmit']>(async () => { throw new Error('Mock failure'); }) }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
  await expect(canvas.getByRole('alert')).toHaveAccessibleDescription(copy.errors.submission);
} };
export const ValidationRecoveryAndKeyboard: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
  await userEvent.type(canvas.getByRole('textbox', { name: label('name') }), copy.stories.filled.name);
  await userEvent.type(canvas.getByRole('textbox', { name: label('service') }), copy.stories.filled.service);
  await expect(canvas.queryByText(copy.errors.name)).not.toBeInTheDocument();
  await expect(canvas.queryByText(copy.errors.service)).not.toBeInTheDocument();
  await userEvent.keyboard('{Enter}');
  await expect(canvas.getByRole('status')).toBeVisible();
  await expect(args.onSubmit).toHaveBeenCalledTimes(1);
} };
export const Cancel: Story = { play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: copy.cancel }));
  await expect(args.onCancel).toHaveBeenCalledTimes(1);
  await expect(args.onSubmit).not.toHaveBeenCalled();
} };
export const Mobile: Story = { args: { initialValues: copy.stories.filled }, globals: { viewport: { value: 'mobile1', isRotated: false } } };
