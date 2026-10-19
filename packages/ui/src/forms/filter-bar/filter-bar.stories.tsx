import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { FilterBar, type FilterBarProps } from './filter-bar';
import { filterBarData as data } from './filter-bar.data';
import { filterChipData } from '../filter-chip/filter-chip.data';

const copy = data.stories;
const many = [...copy.stageOptions, ...copy.sourceOptions, ...copy.otherFilters];
function Preview(args: Omit<FilterBarProps, 'children'>) {
  const [filters, setFilters] = useState(args.activeFilters);
  return <FilterBar {...args} activeFilters={filters} onRemove={id => {
    args.onRemove(id); setFilters(current => current.filter(filter => filter.id !== id));
  }} onClearAll={() => { args.onClearAll(); setFilters([]); }}>
    {[{ label: copy.stage, placeholder: copy.chooseStage, options: copy.stageOptions }, { label: copy.source, placeholder: copy.chooseSource, options: copy.sourceOptions }].map(control =>
      <label key={control.label} className="grid min-w-0 flex-1 basis-48 gap-2 text-sm font-semibold text-ink">{control.label}
        <select disabled={args.disabled} value="" onChange={event => {
          const selected = control.options.find(option => option.id === event.target.value);
          if (selected) setFilters(current => current.some(filter => filter.id === selected.id) ? current : [...current, selected]);
        }} className="min-h-11 w-full min-w-0 cursor-pointer rounded-xl border border-line bg-paper px-3 py-2 text-base font-normal text-ink focus-visible:focus-ring disabled:cursor-not-allowed disabled:bg-canvas disabled:text-muted">
          <option value="">{control.placeholder}</option>
          {control.options.map(option => <option key={option.id} value={option.id} disabled={filters.some(filter => filter.id === option.id)}>{option.option}</option>)}
        </select>
      </label>)}
  </FilterBar>;
}
const meta = { title: 'Forms/FilterBar', component: Preview, parameters: { layout: 'fullscreen' },
  args: { activeFilters: [], onRemove: fn(), onClearAll: fn() },
  decorators: [Story => <main className="min-h-screen bg-canvas p-6 sm:p-8"><h1 className="m-0 text-heading font-semibold text-ink">{copy.title}</h1><p className="mb-6 mt-3 text-muted">{copy.description}</p><Story/></main>],
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Active: Story = { args: { activeFilters: [copy.stageOptions[0], copy.sourceOptions[0]] } };
export const ManyActive: Story = { args: { activeFilters: many } };
export const Disabled: Story = { args: { activeFilters: many, disabled: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  for (const button of c.getAllByRole('button')) await expect(button).toBeDisabled();
  for (const select of c.getAllByRole('combobox')) await expect(select).toBeDisabled();
  await userEvent.click(c.getByRole('button', { name: data.clear }));
  await expect(args.onClearAll).not.toHaveBeenCalled();
  await expect(args.onRemove).not.toHaveBeenCalled();
} };
export const LongLabel: Story = { args: { activeFilters: [{ id: 'owner', label: copy.longLabel }] } };
export const Narrow: Story = { ...ManyActive, parameters: { viewport: { value: 'mobile1' } } };
export const RemoveOne: Story = { ...Active, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  const first = c.getByRole('button', { name: filterChipData.remove(copy.stageOptions[0].label) });
  first.focus();
  await userEvent.keyboard('{Enter}');
  await expect(args.onRemove).toHaveBeenCalledWith(copy.stageOptions[0].id);
  await expect(c.getByRole('button', { name: filterChipData.remove(copy.sourceOptions[0].label) })).toHaveFocus();
  await expect(c.getByRole('status')).toHaveTextContent(data.count(1));
} };
export const ClearAll: Story = { ...ManyActive, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: data.clear }));
  await expect(args.onClearAll).toHaveBeenCalledTimes(1);
  await expect(c.getByRole('status')).toHaveTextContent(data.count(0));
  await expect(c.getByRole('combobox', { name: copy.stage })).toHaveFocus();
} };
export const AddFilters: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.selectOptions(c.getByRole('combobox', { name: copy.stage }), copy.stageOptions[0].id);
  await userEvent.selectOptions(c.getByRole('combobox', { name: copy.stage }), copy.stageOptions[1].id);
  await expect(c.getByRole('status')).toHaveTextContent(data.count(2));
  await expect(c.getByRole('button', { name: filterChipData.remove(copy.stageOptions[0].label) })).toBeVisible();
  await expect(c.getByRole('button', { name: filterChipData.remove(copy.stageOptions[1].label) })).toBeVisible();
} };
