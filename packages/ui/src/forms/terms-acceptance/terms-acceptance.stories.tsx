import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { TermsAcceptance } from './terms-acceptance';
import { termsAcceptanceData as copy } from './terms-acceptance.data';

const meta = {
  title: 'Forms/TermsAcceptance',
  component: TermsAcceptance,
  decorators: [(Story) => <main aria-label={copy.stories.previewLabel} className="w-full max-w-form p-6"><Story /></main>],
  args: {
    checked: false, onChange: fn(), termsHref: copy.stories.termsHref, privacyHref: copy.stories.privacyHref,
    onTermsClick: fn((event) => event.preventDefault()), onPrivacyClick: fn((event) => event.preventDefault()),
  },
  render: function ControlledAcceptance(args) {
    const [checked, setChecked] = useState(args.checked);
    return <TermsAcceptance {...args} checked={checked} onChange={(value) => { setChecked(value); args.onChange(value); }} />;
  },
} satisfies Meta<typeof TermsAcceptance>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const checkbox = within(canvasElement).getByRole('checkbox');
    await expect(checkbox).not.toBeChecked();
    await expect(checkbox).toBeRequired();
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
    await expect(args.onChange).toHaveBeenLastCalledWith(true);
    await userEvent.click(checkbox);
    await expect(checkbox).not.toBeChecked();
  },
};
export const Checked: Story = { args: { checked: true } };
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const checkbox = within(canvasElement).getByRole('checkbox');
    await expect(checkbox).toBeDisabled();
    await userEvent.click(checkbox);
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
export const ValidationError: Story = {
  args: { error: true },
  play: async ({ canvasElement }) => {
    const checkbox = within(canvasElement).getByRole('checkbox');
    await expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    await expect(checkbox).toHaveAccessibleDescription(copy.error);
  },
};
export const HelperText: Story = { args: { helperText: copy.stories.helper } };
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox');
    checkbox.focus();
    await userEvent.keyboard(' ');
    await expect(checkbox).toBeChecked();
    await userEvent.keyboard(' ');
    await expect(checkbox).not.toBeChecked();
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: copy.terms })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: copy.privacy })).toHaveFocus();
  },
};
export const DocumentLinks: Story = {
  args: { helperText: copy.stories.helper },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const terms = canvas.getByRole('link', { name: copy.terms });
    const privacy = canvas.getByRole('link', { name: copy.privacy });
    await expect(terms).toHaveAttribute('href', args.termsHref);
    await expect(privacy).toHaveAttribute('href', args.privacyHref);
    await userEvent.click(terms);
    await userEvent.click(privacy);
    await expect(args.onTermsClick).toHaveBeenCalledTimes(1);
    await expect(args.onPrivacyClick).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole('checkbox')).not.toBeChecked();
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
