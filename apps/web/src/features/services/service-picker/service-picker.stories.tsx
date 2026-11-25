import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ServicePicker, type ServicePickerProps } from './service-picker';
import { servicePickerData as copy } from './service-picker.data';
function Preview(args: ServicePickerProps) {
  const [value, setValue] = useState(args.value);
  return <ServicePicker {...args} value={value} legacyValue={value ? undefined : args.legacyValue} onChange={next => { args.onChange(next); setValue(next); }} />;
}
const meta = {
  title: 'Services/ServicePicker', component: ServicePicker,
  args: { services: [{ id: 'installation', name: 'Installation', status: 'active' }, { id: 'repairs', name: 'Repairs', status: 'active' }, { id: 'inspection', name: 'Inspection', status: 'archived' }], value: null, onChange: fn() },
  render: args => <Preview {...args} />,
  decorators: [Story => <main className="mx-auto max-w-lg p-6"><h1 className="mb-6 mt-0 text-heading font-semibold text-ink">Job service</h1><Story /></main>],
} satisfies Meta<typeof ServicePicker>;
export default meta; type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const SearchAndSelect: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), input = c.getByRole('combobox', { name: copy.label });
  await userEvent.type(input, 'rep');
  await userEvent.click(await c.findByRole('option', { name: 'Repairs' }));
  await expect(args.onChange).toHaveBeenCalledWith('repairs');
  await expect(input).toHaveValue('Repairs');
} };
export const NoFreeText: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.type(c.getByRole('combobox', { name: copy.label }), 'Custom spelling');
  await expect(c.getByText(copy.empty)).toBeVisible();
  await userEvent.keyboard('{Enter}');
  await expect(args.onChange).not.toHaveBeenCalled();
} };
export const RetainedArchived: Story = { args: { value: 'inspection', allowRetainedValue: true }, play: async ({ canvasElement }) => {
  const c = within(canvasElement), input = c.getByRole('combobox', { name: copy.label });
  await expect(input).toHaveValue('Inspection (archived)');
  await userEvent.click(input); await userEvent.clear(input);
  await expect(c.queryByRole('option', { name: /Inspection/ })).not.toBeInTheDocument();
} };
export const LegacyValue: Story = { args: { legacyValue: 'A/C tune-up' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('combobox', { name: copy.label })).toHaveValue('A/C tune-up');
  await expect(c.getByText(copy.legacyHelp)).toBeVisible();
} };
export const Empty: Story = { args: { services: [] } };
export const Disabled: Story = { args: { value: 'installation', disabled: true } };
export const Required: Story = { args: { required: true } };
