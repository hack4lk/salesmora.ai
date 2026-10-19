import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { textFieldData as copy } from './text-field.data';
import { TextField } from './text-field';

const meta = {
  title: 'Forms/TextField',
  component: TextField,
  decorators: [(Story) => <main aria-label={copy.stories.previewLabel} className="w-full max-w-form p-6"><Story /></main>],
  args: {
    label: copy.stories.nameLabel,
    name: 'name',
    autoComplete: 'name',
    required: true,
    onChange: fn(),
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const field = within(canvasElement).getByRole('textbox', { name: copy.stories.nameLabel + ' *' });
    await expect(field).toBeRequired();
    await userEvent.type(field, copy.stories.name);
    await expect(field).toHaveValue(copy.stories.name);
    await expect(args.onChange).toHaveBeenCalled();
    await userEvent.clear(field);
    await userEvent.tab();
  },
};

export const Focused: Story = {
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox', { name: copy.stories.nameLabel + ' *' });
    await userEvent.click(field);
    await expect(field).toHaveFocus();
  },
};

export const Filled: Story = { args: { defaultValue: copy.stories.name } };

export const Optional: Story = {
  args: { label: copy.stories.websiteLabel, required: false, name: 'website', autoComplete: 'url', helperText: copy.stories.websiteHelp },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox', { name: copy.optionalLabel(copy.stories.websiteLabel) });
    await expect(field).not.toBeRequired();
    await expect(field).toHaveAccessibleDescription(copy.stories.websiteHelp);
  },
};

export const HelperText: Story = { args: { helperText: copy.stories.nameHelp } };

export const ValidationError: Story = {
  args: { label: copy.stories.emailLabel, name: 'email', type: 'email', autoComplete: 'email', defaultValue: copy.stories.invalidEmail, error: true, helperText: copy.stories.emailError },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox', { name: copy.stories.emailLabel + ' *' });
    await expect(field).toBeInvalid();
    await expect(field).toHaveAccessibleDescription(copy.stories.emailError);
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: copy.stories.name },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('textbox', { name: copy.stories.nameLabel + ' *' })).toBeDisabled();
  },
};

export const Email: Story = {
  args: { label: copy.stories.emailLabel, name: 'email', type: 'email', autoComplete: 'email', helperText: copy.stories.emailHelp },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox', { name: copy.stories.emailLabel + ' *' });
    await expect(field).toHaveAttribute('type', 'email');
    await expect(field).toHaveAttribute('autocomplete', 'email');
    await userEvent.type(field, copy.stories.email);
    await expect(field).toHaveValue(copy.stories.email);
    await userEvent.clear(field);
    await userEvent.tab();
  },
};

export const Controlled: Story = {
  render: function ControlledField(args) {
    const [value, setValue] = useState('');
    return <TextField {...args} value={value} onChange={(event) => { setValue(event.target.value); args.onChange?.(event); }} />;
  },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox', { name: copy.stories.nameLabel + ' *' });
    await userEvent.type(field, copy.stories.name);
    await expect(field).toHaveValue(copy.stories.name);
    await userEvent.clear(field);
    await userEvent.tab();
  },
};
