import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { FilterChip, type FilterChipProps } from './filter-chip';
import { filterChipData as data } from './filter-chip.data';

const copy = data.stories;
const labels = [copy.stage, copy.source, copy.owner, copy.date, copy.archived];
function Preview({ many = false, ...args }: FilterChipProps & { many?: boolean }) {
  const [active, setActive] = useState(many ? labels : [args.label]);
  const [removed, setRemoved] = useState('');
  const group = useRef<HTMLDivElement>(null);
  return <div className="grid min-w-0 gap-4">
    <div ref={group} role="group" aria-label={copy.filtersLabel} tabIndex={-1} className="flex min-w-0 flex-wrap gap-3 focus-visible:focus-ring">
      {active.map(label => <FilterChip key={label} {...args} label={label} onRemove={() => {
        args.onRemove();
        const buttons = group.current?.querySelectorAll('button');
        const index = active.indexOf(label);
        (buttons?.[index + 1] ?? buttons?.[index - 1] ?? group.current)?.focus();
        setActive(current => current.filter(value => value !== label));
        setRemoved(copy.removed(label));
      }}/>) }
    </div>
    {active.length === 0 && <p className="m-0 text-muted">{copy.empty}</p>}
    <p role="status" className="m-0 text-sm text-muted">{removed}</p>
  </div>;
}
const meta = { title: 'Forms/FilterChip', component: Preview, parameters: { layout: 'fullscreen' },
  args: { label: copy.stage, onRemove: fn() },
  decorators: [Story => <main className="min-h-screen bg-canvas p-6 sm:p-8"><h1 className="m-0 text-heading font-semibold text-ink">{copy.title}</h1><p className="mb-6 mt-3 text-muted">{copy.description}</p><div className="min-w-0 rounded-2xl border border-line bg-paper p-6"><Story/></div></main>],
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const ManyActive: Story = { args: { many: true } };
export const LongLabel: Story = { args: { label: copy.longLabel } };
export const Disabled: Story = { args: { disabled: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  const chip = c.getByRole('button', { name: data.remove(copy.stage) });
  await expect(chip).toBeDisabled();
  await userEvent.click(chip);
  await expect(args.onRemove).not.toHaveBeenCalled();
} };
export const RemoveOne: Story = { args: { many: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: data.remove(copy.source) }));
  await expect(c.queryByRole('button', { name: data.remove(copy.source) })).not.toBeInTheDocument();
  await expect(c.getAllByRole('button')).toHaveLength(4);
  await expect(args.onRemove).toHaveBeenCalledTimes(1);
  await expect(c.getByRole('status')).toHaveTextContent(copy.removed(copy.source));
} };
export const KeyboardRemove: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  c.getByRole('button', { name: data.remove(copy.stage) }).focus();
  await userEvent.keyboard('{Enter}');
  await expect(args.onRemove).toHaveBeenCalledTimes(1);
  await expect(c.getByText(copy.empty)).toBeVisible();
} };
export const Narrow: Story = { args: { many: true }, parameters: { viewport: { value: 'mobile1' } } };
