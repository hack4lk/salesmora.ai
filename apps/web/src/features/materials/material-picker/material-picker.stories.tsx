import { useState, type ComponentProps } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MaterialPicker, type MaterialPickerOption } from './material-picker';
import { pickerOptions, searchFixtures } from './material-picker.data';

const Stateful = (args: ComponentProps<typeof MaterialPicker>) => {
  const [selected, setSelected] = useState(args.selected);
  return <MaterialPicker {...args} selected={selected} onSelect={o => { args.onSelect(o); setSelected({ id: o.id, name: o.name }); }} onClear={() => { args.onClear(); setSelected(null); }} />;
};

const meta = {
  title: 'Materials/MaterialPicker',
  component: MaterialPicker,
  render: args => <Stateful {...args} />,
  args: { search: searchFixtures, selected: null, onSelect: fn(), onClear: fn(), showPrices: true },
  decorators: [Story => <div className="min-h-80 max-w-md p-4"><Story /></div>],
} satisfies Meta<typeof MaterialPicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const SelectsAnItem: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.type(c.getByRole('combobox', { name: 'From catalog' }), 'tank');
    await userEvent.click(await c.findByRole('option', { name: /Expansion tank/ }));
    await expect(args.onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'c4' }));
    await expect(c.getByText('Linked to catalog: Expansion tank')).toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'Remove catalog link' }));
    await expect(args.onClear).toHaveBeenCalled();
  },
};
export const WithoutPrices: Story = {
  args: { showPrices: false },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('combobox'));
    await c.findByRole('option', { name: /Pipe strap/ });
    await expect(c.queryByText('$2.50')).toBeNull();
  },
};
export const NoResults: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.type(c.getByRole('combobox'), 'zzzz');
    await waitFor(() => expect(c.getByText(/No matching catalog items/)).toBeInTheDocument());
  },
};
export const Loading: Story = {
  args: { search: () => new Promise<MaterialPickerOption[]>(() => undefined) },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('combobox'));
    await waitFor(() => expect(c.getByRole('status')).toBeInTheDocument());
  },
};
export const SearchFails: Story = {
  args: { search: () => Promise.reject(new Error('offline')) },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('combobox'));
    await waitFor(() => expect(c.getByRole('alert')).toBeInTheDocument());
  },
};
export const Linked: Story = { args: { selected: { id: pickerOptions[0].id, name: pickerOptions[0].name } } };
export const Disabled: Story = { args: { disabled: true } };
