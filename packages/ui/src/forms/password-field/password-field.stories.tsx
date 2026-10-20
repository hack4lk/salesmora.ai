import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { passwordFieldData as copy } from './password-field.data';
import { PasswordField } from './password-field';

const meta = {
  title: 'Forms/PasswordField',
  component: PasswordField,
  decorators: [(Story) => <main aria-label={copy.stories.previewLabel} className="w-full max-w-form p-6"><Story /></main>],
  args: { label: copy.stories.label, name: 'password', autoComplete: 'current-password', required: true, onChange: fn() },
} satisfies Meta<typeof PasswordField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByLabelText(copy.stories.label, { exact: false, selector: 'input' });
    await expect(field).toHaveAttribute('type', 'password');
    await expect(field).toHaveAttribute('autocomplete', 'current-password');
  },
};

export const Filled: Story = { args: { defaultValue: copy.stories.example } };

export const ShowAndHide: Story = {
  args: { defaultValue: copy.stories.example },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByLabelText(copy.stories.label, { exact: false, selector: 'input' });
    await userEvent.click(canvas.getByRole('button', { name: copy.toggleLabel(false, copy.stories.label) }));
    await expect(field).toHaveAttribute('type', 'text');
    await expect(field).toHaveValue(copy.stories.example);
    await expect(canvas.getByRole('button', { name: copy.toggleLabel(true, copy.stories.label) })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(canvas.getByRole('button', { name: copy.toggleLabel(true, copy.stories.label) }));
    await expect(field).toHaveAttribute('type', 'password');
    await expect(field).toHaveValue(copy.stories.example);
  },
};

export const NewPassword: Story = {
  args: { label: copy.stories.newLabel, autoComplete: 'new-password', helperText: copy.stories.help },
};

export const ValidationError: Story = {
  args: { error: true, helperText: copy.stories.error },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByLabelText(copy.stories.label, { exact: false, selector: 'input' });
    await expect(field).toBeInvalid();
    await expect(field).toHaveAccessibleDescription(copy.stories.error);
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: copy.stories.example },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText(copy.stories.label, { exact: false, selector: 'input' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: copy.toggleLabel(false, copy.stories.label) })).toBeDisabled();
  },
};

export const KeyboardToggle: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByLabelText(copy.stories.label, { exact: false, selector: 'input' });
    field.focus();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: copy.toggleLabel(false, copy.stories.label) })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(field).toHaveAttribute('type', 'text');
    await userEvent.keyboard(' ');
    await expect(field).toHaveAttribute('type', 'password');
  },
};

export const Controlled: Story = {
  render: function ControlledPassword(args) {
    const [value, setValue] = useState('');
    return <PasswordField {...args} value={value} onChange={(event) => { setValue(event.target.value); args.onChange?.(event); }} />;
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByLabelText(copy.stories.label, { exact: false, selector: 'input' });
    await userEvent.type(field, copy.stories.example);
    await expect(args.onChange).toHaveBeenCalled();
    await userEvent.click(canvas.getByRole('button', { name: copy.toggleLabel(false, copy.stories.label) }));
    await expect(field).toHaveValue(copy.stories.example);
    await userEvent.click(canvas.getByRole('button', { name: copy.toggleLabel(true, copy.stories.label) }));
    await userEvent.clear(field);
  },
};
