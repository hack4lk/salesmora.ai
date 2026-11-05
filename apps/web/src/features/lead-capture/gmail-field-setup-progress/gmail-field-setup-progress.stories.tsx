import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { GmailFieldSetupProgress } from './gmail-field-setup-progress';
import { gmailFieldSetupProgressData as copy } from './gmail-field-setup-progress.data';

const meta = {
  title: 'Lead Capture/GmailFieldSetupProgress', component: GmailFieldSetupProgress,
  parameters: { layout: 'fullscreen' },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 text-ink sm:p-8"><Story /></main>],
  args: { step: 'example', onBack: fn(), pending: false },
  play: async ({ canvasElement, args }) => {
    const progress = within(within(canvasElement).getByRole('navigation', { name: copy.label }));
    const steps = progress.getAllByRole('listitem');
    const current = args.step === 'example' ? 0 : 1;
    await expect(steps).toHaveLength(2);
    await expect(steps[current]).toHaveAttribute('aria-current', 'step');
    await expect(steps[1 - current]).not.toHaveAttribute('aria-current');
    await expect(steps[1 - current]).toHaveTextContent(current === 0 ? copy.upcoming : copy.completed);
  },
} satisfies Meta<typeof GmailFieldSetupProgress>;
export default meta;
type Story = StoryObj<typeof meta>;
export const PasteExample: Story = {};
export const ReviewFindings: Story = { args: { step: 'findings' } };
export const ReturnToExample: Story = { args: { step: 'findings' }, play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: copy.steps[0] }));
  await expect(args.onBack).toHaveBeenCalledTimes(1);
} };
export const Pending: Story = { args: { step: 'findings', pending: true }, play: async ({ canvasElement, args }) => {
  await expect(within(canvasElement).getByRole('button', { name: copy.steps[0] })).toBeDisabled();
  await expect(args.onBack).not.toHaveBeenCalled();
} };
