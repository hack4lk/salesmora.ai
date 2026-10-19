import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { AssistantPanel, type AssistantMessage, type AssistantPanelProps } from '@salesmora/ui';
import { assistantPanelData as assistant } from '../../../../../../packages/ui/src/assistant/assistant-panel/assistant-panel.data';
import { LeadNextStepCard, type LeadNextStepCardProps } from './lead-next-step-card';
import { leadNextStepCardData as copy } from './lead-next-step-card.data';

type PreviewProps = Omit<LeadNextStepCardProps, 'prepareButtonRef'> & { onSend: AssistantPanelProps['onSend'] };
function Preview(args: PreviewProps) {
  const [open, setOpen] = useState(false), [draft, setDraft] = useState(''), [messages, setMessages] = useState<AssistantMessage[]>([]);
  const trigger = useRef<HTMLButtonElement>(null);
  return <><LeadNextStepCard {...args} prepareButtonRef={trigger} onPrepare={args.onPrepare ? request => {
    args.onPrepare?.(request); if (!draft.trim()) setDraft(request.prompt); setOpen(true);
  } : undefined}/>
    <AssistantPanel open={open} onOpenChange={setOpen} draft={draft} onDraftChange={setDraft} returnFocusRef={trigger}
      description={copy.stories.assistantDescription} contextLabel={`${args.lead.leadNumber} · ${args.lead.name}`} messages={messages}
      sendDisabled={args.assistantStatus !== undefined && args.assistantStatus !== 'ready'} runStatus={args.assistantStatus === 'busy' ? 'thinking' : undefined}
      onSend={async text => { const result = await args.onSend(text); if (result.ok) setMessages(current => [...current, { id: `${current.length}-user`, role: 'user', text }, { id: `${current.length}-assistant`, role: 'assistant', text: copy.stories.response }]); return result; }}/>
  </>;
}
const meta = { title: 'Leads/LeadNextStepCard', component: Preview, parameters: { layout: 'fullscreen' },
  args: { lead: copy.stories.lead, suggestion: copy.stories.suggestion, assistantStatus: 'ready', onPrepare: fn(), onSend: fn<AssistantPanelProps['onSend']>(async () => ({ ok: true })) },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-6 mt-3 max-w-form leading-6 text-muted">{copy.stories.description}</p><div className="w-full max-w-sm"><Story/></div></main>],
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const None: Story = { args: { suggestion: null } };
export const AssistantUnavailable: Story = { args: { assistantStatus: 'unavailable' }, play: async ({ canvasElement, args }) => {
  await expect(within(canvasElement).getByRole('button', { name: copy.prepare })).toBeDisabled();await expect(args.onPrepare).not.toHaveBeenCalled();
} };
export const AssistantBusy: Story = { args: { assistantStatus: 'busy' } };
export const MissingHandler: Story = { args: { onPrepare: undefined } };
export const LongContent: Story = { args: { suggestion: { title: copy.stories.longTitle, body: copy.stories.longBody } } };
export const Narrow: Story = { ...LongContent, parameters: { viewport: { value: 'phone' } } };
export const PlainText: Story = { args: { suggestion: { title: copy.stories.suggestion.title, body: copy.stories.plainText } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('link')).not.toBeInTheDocument();await expect(canvasElement.querySelector('script')).toBeNull();
} };
export const OpenAssistant: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);await userEvent.click(c.getByRole('button', { name: copy.prepare }));
  await waitFor(() => expect(c.getByRole('dialog')).toBeVisible());
  await expect(c.getByRole('textbox', { name: assistant.composer })).toHaveValue(copy.prompt(args.lead.leadNumber));
  await expect(args.onPrepare).toHaveBeenCalledWith({ lead: args.lead, prompt: copy.prompt(args.lead.leadNumber) });
  await expect(args.onSend).not.toHaveBeenCalled();
} };
export const CloseRestoresFocus: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);await userEvent.click(c.getByRole('button', { name: copy.prepare }));await waitFor(() => expect(c.getByRole('dialog')).toBeVisible());
  await userEvent.click(c.getByRole('button', { name: assistant.collapse }));
  await waitFor(() => expect(c.queryByRole('dialog')).not.toBeInTheDocument());await expect(c.getByRole('button', { name: copy.prepare })).toHaveFocus();
} };
export const PreserveDraft: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);await userEvent.click(c.getByRole('button', { name: copy.prepare }));await waitFor(() => expect(c.getByRole('dialog')).toBeVisible());
  await userEvent.clear(c.getByRole('textbox', { name: assistant.composer }));await userEvent.type(c.getByRole('textbox', { name: assistant.composer }), copy.stories.longTitle);
  await userEvent.click(c.getByRole('button', { name: assistant.collapse }));await userEvent.click(c.getByRole('button', { name: copy.prepare }));
  await expect(c.getByRole('textbox', { name: assistant.composer })).toHaveValue(copy.stories.longTitle);await expect(args.onSend).not.toHaveBeenCalled();
} };
export const MockReply: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);await userEvent.click(c.getByRole('button', { name: copy.prepare }));await waitFor(() => expect(c.getByRole('dialog')).toBeVisible());
  await userEvent.click(c.getByRole('button', { name: assistant.submit }));await waitFor(() => expect(c.getByRole('log', { name: assistant.conversation })).toHaveTextContent(copy.stories.response));await expect(args.onSend).toHaveBeenCalledTimes(1);
} };

export const LauncherStillWorks: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);await userEvent.click(c.getByRole('button', { name: assistant.open }));await waitFor(() => expect(c.getByRole('dialog')).toBeVisible());
  await userEvent.click(c.getByRole('button', { name: assistant.collapse }));await waitFor(() => expect(c.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(c.getByRole('button', { name: assistant.open })).toHaveFocus();await expect(args.onPrepare).not.toHaveBeenCalled();
} };
