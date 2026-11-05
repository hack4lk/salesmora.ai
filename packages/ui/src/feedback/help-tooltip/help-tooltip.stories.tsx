import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { HelpTooltip } from './help-tooltip';

const meta = {
  title: 'Feedback/HelpTooltip',
  component: HelpTooltip,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Place the information button next to a label or heading. Use it for optional context that may need several paragraphs. It opens on click, tap, or keyboard activation.' } } },
  args: {
    label: 'About assigning a lead',
    paragraphs: [
      'Choose the teammate who should follow up with this lead.',
      'If nobody is assigned, your team can pick an owner after the lead is created.',
    ],
  },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 text-ink">
    <div className="flex items-center gap-1"><h1 className="m-0 text-xl font-semibold">Lead owner</h1><Story /></div>
  </main>],
} satisfies Meta<typeof HelpTooltip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const KeyboardHelp: Story = { play: async ({ canvasElement, args }) => {
  const trigger = within(canvasElement).getByRole('button', { name: args.label });
  const body = within(canvasElement.ownerDocument.body);
  trigger.focus();
  await userEvent.keyboard('{Enter}');
  const dialog = await body.findByRole('dialog', { name: args.label });
  await expect(dialog).toHaveTextContent(args.paragraphs[1]);
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
} };
