import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { SeafoamButton } from './seafoam-button';

const meta = {
  title: 'Forms/SeafoamButton',
  component: SeafoamButton,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Reusable compact, borderless seafoam action with dark text, darker enabled hover and a visible keyboard focus ring. Styling uses Tailwind classes and shared brand tokens only; inline style props are not supported. Defaults to type="button" so placing it in a form does not submit accidentally. Supports native button attributes, disabled state and layout classes. The host owns pending state and authorization.' } } },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 text-ink"><Story /></main>],
  args: { label: 'Run report', onClick: fn() },
} satisfies Meta<typeof SeafoamButton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: async ({ canvasElement, args }) => {
  const button = within(canvasElement).getByRole('button', { name: args.label });
  await expect(button).toHaveAttribute('type', 'button');
  await expect(button).not.toHaveAttribute('style');
  const styles = canvasElement.ownerDocument.defaultView!.getComputedStyle(button);
  await expect(styles.backgroundColor).toBe('rgb(178, 233, 219)');
  await expect(styles.backgroundImage).toContain('linear-gradient(110deg');
  await expect(styles.boxShadow).not.toBe('none');
  const rem = canvasElement.ownerDocument.defaultView!.getComputedStyle(canvasElement.ownerDocument.documentElement).fontSize;
  for (const padding of [styles.paddingTop, styles.paddingRight, styles.paddingBottom, styles.paddingLeft]) {
    await expect(padding).toBe(rem);
  }
  await userEvent.click(button);
  await expect(args.onClick).toHaveBeenCalledTimes(1);
} };
export const Disabled: Story = { args: { disabled: true }, play: async ({ canvasElement, args }) => {
  const button = within(canvasElement).getByRole('button', { name: args.label });
  await expect(button).toBeDisabled();
  await userEvent.click(button);
  await expect(args.onClick).not.toHaveBeenCalled();
} };
export const Keyboard: Story = { play: async ({ canvasElement, args }) => {
  const button = within(canvasElement).getByRole('button', { name: args.label });
  button.focus();
  await expect(button).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  await userEvent.keyboard(' ');
  await expect(args.onClick).toHaveBeenCalledTimes(2);
} };
export const InsideForm: Story = {
  render: args => <form aria-label="Example form" onSubmit={event => event.preventDefault()}><SeafoamButton {...args} /></form>,
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement), submitted = fn();
    const form = c.getByRole('form');
    form.addEventListener('submit', submitted);
    try {
      await userEvent.click(c.getByRole('button'));
      await expect(args.onClick).toHaveBeenCalledTimes(1);
      await expect(submitted).not.toHaveBeenCalled();
    } finally { form.removeEventListener('submit', submitted); }
  },
};
export const Submit: Story = {
  args: { type: 'submit', label: 'Save changes' },
  render: InsideForm.render,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement), submitted = fn();
    const form = c.getByRole('form');
    form.addEventListener('submit', submitted);
    try {
      await userEvent.click(c.getByRole('button'));
      await expect(submitted).toHaveBeenCalledTimes(1);
    } finally { form.removeEventListener('submit', submitted); }
  },
};
export const LongLabel: Story = { args: { label: 'Run the report for the entire selected reporting period and authorized team' } };
export const MediumText: Story = { args: { size: 14 } };
export const StandardText: Story = { args: { size: 16 } };
