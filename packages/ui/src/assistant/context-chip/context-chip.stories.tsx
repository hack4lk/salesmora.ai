import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ContextChip, type ContextChipProps } from './context-chip';
import { contextChipData as copy } from './context-chip.data';

function Preview(args: ContextChipProps) {
  const [visible, setVisible] = useState(true);
  const composer = useRef<HTMLTextAreaElement>(null);
  return <section aria-label={copy.stories.title} className="grid min-w-0 gap-4 rounded-2xl border border-assistant-border bg-assistant-surface p-6 text-assistant-foreground">
    <h2 className="m-0 text-lg font-semibold">{copy.stories.heading}</h2>
    <p className="m-0 text-sm leading-6 text-assistant-muted">{copy.stories.helper}</p>
    <div className="min-w-0">
      {visible && <ContextChip {...args} onClear={args.onClear ? () => { args.onClear?.(); setVisible(false); composer.current?.focus(); } : undefined}/>}
      {!visible && <p role="status" className="m-0 text-sm text-assistant-muted">{copy.stories.cleared}</p>}
    </div>
    <label className="grid min-w-0 gap-2 text-sm font-semibold">{copy.stories.composer}
      <textarea ref={composer} rows={3} placeholder={copy.stories.placeholder} className="min-h-24 w-full min-w-0 resize-y rounded-xl border border-assistant-border bg-assistant-surface px-4 py-3 text-base font-normal text-assistant-foreground placeholder:text-assistant-muted focus-visible:focus-ring focus-visible:outline-assistant-accent"/>
    </label>
  </section>;
}
const meta = {
  title: 'Assistant/ContextChip', component: ContextChip, parameters: { layout: 'fullscreen' },
  args: { label: copy.stories.record, onClear: fn() }, render: args => <Preview {...args}/>,
  decorators: [Story => <main className="mx-auto min-h-screen w-full max-w-4xl bg-canvas p-4 sm:p-8">
    <h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1>
    <p className="mb-6 mt-3 text-base leading-6 text-muted">{copy.stories.description}</p><Story/>
  </main>],
} satisfies Meta<typeof ContextChip>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const CurrentFilters: Story = { args: { label: copy.stories.filters } };
export const LongLabel: Story = { args: { label: copy.stories.longRecord } };
export const Narrow: Story = { ...LongLabel, parameters: { viewport: { value: 'mobile1' } } };
export const PlainText: Story = { args: { label: copy.stories.escapedRecord }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText(copy.using(copy.stories.escapedRecord))).toBeVisible();
} };
export const Disabled: Story = { args: { disabled: true }, play: async ({ canvasElement, args }) => {
  const button = within(canvasElement).getByRole('button', { name: copy.clear(copy.stories.record) });
  await expect(button).toBeDisabled(); await userEvent.click(button); await expect(args.onClear).not.toHaveBeenCalled();
} };
export const ReadOnly: Story = { args: { onClear: undefined }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('button')).not.toBeInTheDocument();
  await expect(within(canvasElement).getByText(copy.using(copy.stories.record))).toBeVisible();
} };
export const ClearContext: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.clear(copy.stories.record) }));
  await expect(args.onClear).toHaveBeenCalledTimes(1); await expect(c.getByRole('status')).toHaveTextContent(copy.stories.cleared);
  await expect(c.getByRole('textbox', { name: copy.stories.composer })).toHaveFocus();
} };
export const KeyboardClear: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); c.getByRole('button', { name: copy.clear(copy.stories.record) }).focus();
  await userEvent.keyboard('{Enter}'); await expect(args.onClear).toHaveBeenCalledTimes(1);
  await expect(c.getByRole('textbox', { name: copy.stories.composer })).toHaveFocus();
} };
