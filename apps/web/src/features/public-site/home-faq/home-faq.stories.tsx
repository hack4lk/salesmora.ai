import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { HomeFaq } from './home-faq';
import { homeFaqData as copy } from './home-faq.data';

const meta = {
  title: 'Public Site/HomeFaq',
  component: HomeFaq,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof HomeFaq>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('region', { name: copy.title })).toHaveAttribute('id', 'faq');
    const first = copy.questions[0];
    const second = copy.questions[1];
    await expect(canvas.getByText(first.answer)).not.toBeVisible();
    await userEvent.click(canvas.getByText(first.question));
    await expect(canvas.getByText(first.answer)).toBeVisible();
    const summary = canvas.getByText(second.question);
    await userEvent.click(summary);
    await expect(canvas.getByText(second.answer)).toBeVisible();
    await expect(canvas.getByText(first.answer)).toBeVisible();
    await userEvent.click(canvas.getByText(first.question));
    await userEvent.click(summary);
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: 'phone', isRotated: false } },
  play: Default.play,
};
