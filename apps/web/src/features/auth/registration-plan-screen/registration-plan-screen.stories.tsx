import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { RegistrationPlanScreen } from './registration-plan-screen';
import { registrationPlanScreenData as copy } from './registration-plan-screen.data';
import { registrationFormData as form } from '../registration-form/registration-form.data';
import { registrationScreenData as legal } from '../registration-screen/registration-screen.data';
import { planOverviewData as plans } from '../../public-site/plan-overview/plan-overview.data';
const meta = {
  title: 'Auth/RegistrationPlanScreen', component: RegistrationPlanScreen, parameters: { layout: 'fullscreen' },
  args: { notice: copy.preview, onSubmit: fn(async () => ({ ok: true as const })) },
} satisfies Meta<typeof RegistrationPlanScreen>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Standard: Story = { args: { initialPlan: 'standard' } };
export const Premium: Story = { args: { initialPlan: 'premium' } };
export const PlanSelection: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  const free = c.getByRole('radio', { name: 'Free' });
  await expect(free).toBeChecked();
  await expect(free).toHaveAccessibleDescription(/\$0 \/ month.*1 user/s);
  for (const price of ['$0', '$29', '$49']) await expect(c.getByText(price, { exact: true })).toBeVisible();
  await expect(c.queryByText(/Draft monthly prices in USD; final pricing is not yet approved/)).not.toBeInTheDocument();
  for (const [name, count] of [['Free', 2], ['Standard', 10], ['Premium', 25]] as const) {
    await expect(c.getByRole('radio', { name })).toHaveAccessibleDescription(new RegExp(`${count} AI-assisted workflows \\(limit planned\\)`));
  }
  await expect(c.getAllByText(plans.limitPlanned)).toHaveLength(3);
  await userEvent.click(free);
  await userEvent.keyboard('{ArrowRight}');
  await expect(c.getByRole('radio', { name: 'Standard' })).toBeChecked();
  await userEvent.click(c.getByRole('button', { name: copy.continue('Standard') }));
  await expect(c.getByText('Standard · $29 / month')).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: copy.change }));
  await expect(c.getByRole('radio', { name: 'Standard' })).toBeChecked();
  await userEvent.click(c.getByRole('radio', { name: 'Premium' }));
  await expect(c.getByRole('button', { name: copy.continue('Premium') })).toBeVisible();
} };
export const PaidRegistration: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('radio', { name: copy.names.standard }));
  await userEvent.click(c.getByRole('button', { name: copy.continue(copy.names.standard) }));
  await expect(c.getByRole('heading', { name: copy.accountTitle })).toHaveFocus();
  await expect(c.getByText(legal.legal.notice)).toBeVisible();
  await expect(c.getByRole('link', { name: /Terms of Service.*opens in a new tab/ })).toHaveAttribute('href', legal.termsHref);
  await expect(c.getByRole('link', { name: /Privacy Policy.*opens in a new tab/ })).toHaveAttribute('href', legal.privacyHref);
  await userEvent.type(c.getByRole('textbox', { name: /Your name/ }), form.stories.name);
  await userEvent.type(c.getByRole('textbox', { name: /Work email/ }), form.stories.email);
  await userEvent.type(c.getByLabelText(form.labels.password, { exact: false, selector: 'input' }), form.stories.password);
  await userEvent.type(c.getByLabelText(form.labels.confirmPassword, { exact: false, selector: 'input' }), form.stories.password);
  await userEvent.click(c.getByRole('checkbox'));
  await userEvent.click(c.getByRole('button', { name: copy.createPaid }));
  await expect(args.onSubmit).toHaveBeenCalledWith(expect.objectContaining({ email: form.stories.email }), 'standard');
} };
