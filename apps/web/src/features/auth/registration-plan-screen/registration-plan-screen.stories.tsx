import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { RegistrationPlanScreen } from './registration-plan-screen';
import { registrationPlanScreenData as copy } from './registration-plan-screen.data';
import { registrationFormData as form } from '../registration-form/registration-form.data';
const meta = {
  title: 'Auth/RegistrationPlanScreen', component: RegistrationPlanScreen, parameters: { layout: 'fullscreen' },
  args: { notice: copy.preview, onSubmit: fn(async () => ({ ok: true as const })) },
} satisfies Meta<typeof RegistrationPlanScreen>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Standard: Story = { args: { initialPlan: 'standard' } };
export const Premium: Story = { args: { initialPlan: 'premium' } };
export const PaidRegistration: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('radio', { name: copy.names.standard }));
  await userEvent.click(c.getByRole('button', { name: copy.continue(copy.names.standard) }));
  await expect(c.getByRole('heading', { name: copy.accountTitle })).toHaveFocus();
  await userEvent.type(c.getByRole('textbox', { name: /Your name/ }), form.stories.name);
  await userEvent.type(c.getByRole('textbox', { name: /Work email/ }), form.stories.email);
  await userEvent.type(c.getByLabelText(form.labels.password, { exact: false, selector: 'input' }), form.stories.password);
  await userEvent.type(c.getByLabelText(form.labels.confirmPassword, { exact: false, selector: 'input' }), form.stories.password);
  await userEvent.click(c.getByRole('checkbox'));
  await userEvent.click(c.getByRole('button', { name: copy.createPaid }));
  await expect(args.onSubmit).toHaveBeenCalledWith(expect.objectContaining({ email: form.stories.email }), 'standard');
} };
