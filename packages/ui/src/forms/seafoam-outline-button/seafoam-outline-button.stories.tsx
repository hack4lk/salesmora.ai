import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { SeafoamOutlineButton } from './seafoam-outline-button';

const meta = {
  title: 'Forms/SeafoamOutlineButton',
  component: SeafoamOutlineButton,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Reusable white button with light-gray enabled hover and a 2px 110-degree pale-to-light seafoam gradient border. Matches SeafoamButton padding, typography, shadow and native button behavior. Tailwind-only, no inline styles; defaults to type="button".' } } },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 text-ink"><Story /></main>],
  args: { label: 'View supporting evidence', onClick: fn() },
} satisfies Meta<typeof SeafoamOutlineButton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: async ({ canvasElement, args }) => {
  const button = within(canvasElement).getByRole('button');
  await expect(button).toHaveAttribute('type', 'button');
  await expect(button).not.toHaveAttribute('style');
  const styles = canvasElement.ownerDocument.defaultView!.getComputedStyle(button);
  await expect(styles.borderTopWidth).toBe('2px');
  await expect(styles.backgroundImage).toContain('110deg');
  await userEvent.click(button);
  await expect(args.onClick).toHaveBeenCalledTimes(1);
} };
export const Disabled: Story = { args: { disabled: true }, play: async ({ canvasElement, args }) => {
  const button = within(canvasElement).getByRole('button');
  await expect(button).toBeDisabled();
  await userEvent.click(button);
  await expect(args.onClick).not.toHaveBeenCalled();
} };
export const Keyboard: Story = { play: async ({ canvasElement, args }) => {
  within(canvasElement).getByRole('button').focus();
  await userEvent.keyboard('{Enter}');
  await userEvent.keyboard(' ');
  await expect(args.onClick).toHaveBeenCalledTimes(2);
} };
export const InsideForm: Story = {
  render: args => <form aria-label="Example form" onSubmit={event => event.preventDefault()}><SeafoamOutlineButton {...args} /></form>,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement), submitted = fn(), form = c.getByRole('form');
    form.addEventListener('submit', submitted);
    try {
      await userEvent.click(c.getByRole('button'));
      await expect(submitted).not.toHaveBeenCalled();
    } finally { form.removeEventListener('submit', submitted); }
  },
};
export const Submit: Story = {
  args: { type: 'submit', label: 'Save changes' },
  render: InsideForm.render,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement), submitted = fn(), form = c.getByRole('form');
    form.addEventListener('submit', submitted);
    try {
      await userEvent.click(c.getByRole('button'));
      await expect(submitted).toHaveBeenCalledTimes(1);
    } finally { form.removeEventListener('submit', submitted); }
  },
};
export const LongLabel: Story = { args: { label: 'View supporting evidence for the entire selected reporting period and authorized team' } };
export const MediumText: Story = { args: { size: 14 } };
export const StandardText: Story = { args: { size: 16 } };
