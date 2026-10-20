import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { FormFeedback } from './form-feedback';
import { formFeedbackData as copy } from './form-feedback.data';

const meta = {
  title: 'Forms/FormFeedback',
  component: FormFeedback,
  decorators: [(Story) => <main aria-label={copy.stories.previewLabel} className="w-full max-w-form p-6"><Story /></main>],
  args: { kind: 'error', message: copy.stories.errorMessage },
} satisfies Meta<typeof FormFeedback>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Error: Story = {
  play: async ({ canvasElement, args }) => {
    const feedback = within(canvasElement).getByRole('alert');
    await expect(feedback).toHaveAccessibleName(copy.titles.error);
    await expect(feedback).toHaveAccessibleDescription(args.message);
    await expect(feedback).toHaveAttribute('aria-live', 'assertive');
    await expect(feedback).toHaveAttribute('aria-atomic', 'true');
  },
};
export const Success: Story = {
  args: { kind: 'success', title: copy.stories.successTitle, message: copy.stories.successMessage },
  play: async ({ canvasElement, args }) => {
    const feedback = within(canvasElement).getByRole('status');
    await expect(feedback).toHaveAccessibleName(args.title);
    await expect(feedback).toHaveAccessibleDescription(args.message);
    await expect(feedback).toHaveAttribute('aria-live', 'polite');
  },
};
export const DefaultSuccessTitle: Story = {
  args: { kind: 'success', message: copy.stories.successMessage },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('status')).toHaveAccessibleName(copy.titles.success);
  },
};
export const CustomError: Story = { args: { title: copy.stories.customTitle, message: copy.stories.customMessage } };
export const LongMessage: Story = { args: { message: copy.stories.longMessage } };
