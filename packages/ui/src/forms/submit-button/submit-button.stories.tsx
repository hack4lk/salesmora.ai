import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { SubmitButton } from './submit-button';
import { submitButtonData as copy } from './submit-button.data';

const meta = {
  title: 'Forms/SubmitButton',
  component: SubmitButton,
  decorators: [(Story) => <main aria-label={copy.stories.previewLabel} className="w-full max-w-form p-6"><Story /></main>],
  args: { label: copy.stories.label, pendingLabel: copy.stories.pendingLabel, onClick: fn() },
} satisfies Meta<typeof SubmitButton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', { name: args.label });
    await expect(button).toHaveAttribute('type', 'submit');
    await expect(button).toBeEnabled();
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const Pending: Story = {
  args: { pending: true },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', { name: args.pendingLabel });
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', { name: args.label });
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute('aria-busy', 'false');
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const Keyboard: Story = {
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', { name: args.label });
    button.focus();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const SubmitOnce: Story = {
  render: function ExampleForm(args) {
    const [pending, setPending] = useState(false);
    return (
      <form aria-label={copy.stories.formLabel} onSubmit={(event) => { event.preventDefault(); setPending(true); }}>
        <SubmitButton {...args} pending={pending} />
      </form>
    );
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: args.label });
    await userEvent.dblClick(button);
    await expect(button).toBeDisabled();
    await expect(button).toHaveAccessibleName(args.pendingLabel);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const LongLabel: Story = { args: { label: copy.stories.longLabel } };
