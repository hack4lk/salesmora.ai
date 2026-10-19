import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { RegistrationPricingConcept } from './registration-pricing-concept';
import type { RegistrationFormProps } from '../registration-form/registration-form';
import { registrationFormData as formCopy } from '../registration-form/registration-form.data';
import { registrationPricingConceptData as copy } from './registration-pricing-concept.data';
const meta = {
  title: 'Auth/RegistrationPricingConcept', component: RegistrationPricingConcept,
  parameters: { layout: 'fullscreen' },
  args: { variant: 'split-view', onSubmit: fn<RegistrationFormProps['onSubmit']>(async () => ({ ok: true })), onPlanChange: fn() },
} satisfies Meta<typeof RegistrationPricingConcept>;
export default meta;
type Story = StoryObj<typeof meta>;
export const CompareFirst: Story = { args: { variant: 'compare-first' } };
export const CompareFirstSelection: Story = {
  args: { variant: 'compare-first' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: 'Premium' }));
    await expect(args.onPlanChange).toHaveBeenCalledWith('premium');
    await userEvent.click(canvas.getByRole('button', { name: `${copy.continue} Premium` }));
    await expect(canvas.getByRole('heading', { name: copy.accountTitle })).toBeVisible();
    await expect(canvas.getByRole('button', { name: copy.createPaid })).toBeVisible();
  },
};
export const SplitView: Story = {};
export const SplitViewSelection: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: 'Standard' }));
    await expect(canvas.getByRole('radio', { name: 'Standard' })).toBeChecked();
    await expect(canvas.getByRole('button', { name: copy.createPaid })).toBeVisible();
  },
};
export const Guided: Story = { args: { variant: 'guided' } };
export const SplitViewMobile: Story = { globals: { viewport: { value: 'phone', isRotated: false } } };
export const CompareFirstMobile: Story = { args: { variant: 'compare-first' }, globals: { viewport: { value: 'phone', isRotated: false } } };
export const GuidedMobile: Story = { args: { variant: 'guided' }, globals: { viewport: { value: 'phone', isRotated: false } } };

export const GuidedJourney: Story = {
  args: { variant: 'guided' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox', { name: /Your name/ }), formCopy.stories.name);
    await userEvent.type(canvas.getByRole('textbox', { name: /Work email/ }), formCopy.stories.email);
    await userEvent.type(canvas.getByLabelText(formCopy.labels.password, { exact: false, selector: 'input' }), formCopy.stories.password);
    await userEvent.type(canvas.getByLabelText(formCopy.labels.confirmPassword, { exact: false, selector: 'input' }), formCopy.stories.password);
    await userEvent.click(canvas.getByRole('checkbox'));
    await userEvent.click(canvas.getByRole('button', { name: copy.accountNext }));
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole('radio', { name: 'Premium' }));
    await userEvent.click(canvas.getByRole('button', { name: copy.review }));
    await expect(canvas.getByText('Premium · $49 / month')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: copy.reviewButton }));
    await expect(canvas.getByRole('status')).toHaveTextContent(copy.reviewDone);
  },
};
