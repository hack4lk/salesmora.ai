import { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { AssistantPanel, type AssistantMessage, type AssistantPanelProps } from './assistant-panel';
import { leadActivityCardData as historyCopy } from '../lead-activity-card/lead-activity-card.data';
import { leadDetailsCardData as detailsCopy } from '../lead-details-card/lead-details-card.data';
import { leadSearchResultsCardData as searchCopy } from '../lead-search-results-card/lead-search-results-card.data';
import { contextChipData } from '../context-chip/context-chip.data';
import { assistantPanelData as copy } from './assistant-panel.data';

function ConversationPreview(args: AssistantPanelProps) {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  return <AssistantPanel {...args} messages={messages} onSend={async text => {
    const result = await args.onSend(text);
    if (result.ok) setMessages(previous => [...previous, { id: `${previous.length}-user`, role: 'user', text }, { id: `${previous.length}-assistant`, role: 'assistant', text: copy.stories.response }]);
    return result;
  }} />;
}

const meta = {
  title: 'Assistant/AssistantPanel', component: AssistantPanel,
  decorators: [(Story) => <main className="mx-auto w-full max-w-4xl p-4 sm:p-8"><h1 className="mb-2 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-6 text-sm leading-6 text-muted">{copy.stories.preview}</p><Story /></main>],
  args: { badge: copy.stories.badge, onSend: fn<AssistantPanelProps['onSend']>(async () => ({ ok: true })) },
} satisfies Meta<typeof AssistantPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
  await expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
  const launcher = canvas.getByRole('button', { name: copy.open });
  launcher.focus();
  await userEvent.keyboard('{Enter}');
  await expect(canvas.getByRole('button', { name: copy.submit })).toBeDisabled();
  await userEvent.type(canvas.getByRole('textbox', { name: copy.composer }), '   ');
  await expect(canvas.getByRole('button', { name: copy.submit })).toBeDisabled();
  await expect(args.onSend).not.toHaveBeenCalled();
} };
export const Conversation: Story = { render: args => <ConversationPreview {...args} />, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: copy.open }));
  const composer = canvas.getByRole('textbox', { name: copy.composer });
  await userEvent.type(composer, ` ${copy.stories.question} `);
  // Enter creates a new line; sending is an explicit button action.
  await userEvent.keyboard('{Enter}');
  await expect(args.onSend).not.toHaveBeenCalled();
  await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
  await expect(args.onSend).toHaveBeenCalledWith(copy.stories.question);
  await expect(canvas.getByRole('log', { name: copy.conversation })).toHaveTextContent(copy.stories.response);
  await expect(composer).toHaveValue('');
  await expect(composer).toHaveFocus();
} };
export const Pending: Story = { args: { onSend: fn<AssistantPanelProps['onSend']>(() => new Promise(() => {})) }, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: copy.open }));
  await userEvent.type(canvas.getByRole('textbox', { name: copy.composer }), copy.stories.question);
  await userEvent.dblClick(canvas.getByRole('button', { name: copy.submit }));
  await expect(canvas.getByRole('form', { name: copy.composer })).toHaveAttribute('aria-busy', 'true');
  await expect(canvas.getByRole('textbox', { name: copy.composer })).toBeDisabled();
  await expect(args.onSend).toHaveBeenCalledTimes(1);
} };
export const Retry: Story = { play: async ({ canvasElement, args }) => {
  args.onSend.mockResolvedValueOnce({ ok: false, message: copy.stories.error });
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: copy.open }));
  const composer = canvas.getByRole('textbox', { name: copy.composer });
  await userEvent.type(composer, copy.stories.question);
  await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
  await expect(canvas.getByRole('alert')).toHaveTextContent(copy.stories.error);
  await expect(composer).toHaveValue(copy.stories.question);
  await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
  await expect(args.onSend).toHaveBeenCalledTimes(2);
  await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  await expect(composer).toHaveValue('');
} };
export const ThrownError: Story = { args: { onSend: fn<AssistantPanelProps['onSend']>(async () => { throw Error('Mock failure'); }) }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: copy.open }));
  await userEvent.type(canvas.getByRole('textbox', { name: copy.composer }), copy.stories.question);
  await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
  await expect(canvas.getByRole('alert')).toHaveTextContent(copy.failure);
  await expect(canvas.getByRole('textbox', { name: copy.composer })).toHaveValue(copy.stories.question);
} };
export const MessageLimit: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: copy.open }));
  const composer = canvas.getByRole('textbox', { name: copy.composer });
  await userEvent.click(composer);
  await userEvent.paste('x'.repeat(copy.maxLength + 1));
  await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
  await expect(canvas.getByRole('alert')).toHaveTextContent(copy.tooLong);
  await expect(args.onSend).not.toHaveBeenCalled();
} };
export const MonthlyAllowance: Story = { args: { runStatus: 'failed', onRetry: fn(async () => ({ ok: false as const, message: copy.stories.budgetExceeded })), onSend: fn<AssistantPanelProps['onSend']>(async () => ({ ok: false, message: copy.stories.budgetExceeded })) }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: copy.open }));
  await userEvent.type(canvas.getByRole('textbox', { name: copy.composer }), copy.stories.question);
  await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
  await expect(canvas.getByRole('alert')).toHaveTextContent(copy.stories.budgetExceeded);
  await expect(canvas.getByRole('textbox', { name: copy.composer })).toBeEnabled();
  await userEvent.click(canvas.getByRole('button', { name: copy.retry }));
  await expect(canvas.getByRole('alert')).toHaveTextContent(copy.stories.budgetExceeded);
} };
export const RecordContext: Story = { args: { contextLabel: copy.stories.record, onClearContext: fn() }, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: copy.open }));
  await expect(canvas.getByText(copy.context(copy.stories.record))).toBeVisible();
  const clear = canvas.getByRole('button', { name: contextChipData.clear(copy.stories.record) });
  clear.focus(); await userEvent.keyboard('{Enter}');
  await expect(args.onClearContext).toHaveBeenCalledTimes(1);
} };
export const Disabled: Story = { args: { disabled: true }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: copy.open }));
  await expect(canvas.getByRole('textbox', { name: copy.composer })).toBeDisabled();
  await expect(canvas.getByRole('button', { name: copy.submit })).toBeDisabled();
  await expect(canvas.getByRole('button', { name: copy.collapse })).toBeEnabled();
} };
export const Mobile: Story = { globals: { viewport: { value: 'phone', isRotated: false } } };
export const Expansion: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: copy.open }));
  const composer = canvas.getByRole('textbox', { name: copy.composer });
  await userEvent.type(composer, copy.stories.question);
  await expect(canvas.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  await expect(composer).toHaveFocus();
  await userEvent.click(canvas.getByRole('button', { name: copy.collapse }));
  await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
  await expect(canvas.getByRole('button', { name: copy.open })).toHaveFocus();
  await userEvent.click(canvas.getByRole('button', { name: copy.open }));
  await expect(canvas.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  await expect(composer).toHaveValue(copy.stories.question);
  await expect(args.onSend).not.toHaveBeenCalled();
} };
export const DraftOnly: Story = { args: { sendDisabled: true }, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: copy.open }));
  await userEvent.type(canvas.getByRole('textbox', { name: copy.composer }), copy.stories.question);
  await expect(canvas.getByRole('dialog')).toBeVisible();
  await expect(canvas.getByRole('button', { name: copy.submit })).toBeDisabled();
  await expect(args.onSend).not.toHaveBeenCalled();
} };

/** Fictional incremental transport for component review; never connected to the app/provider. */
function StreamingPreview({ mode = 'complete', ...args }: AssistantPanelProps & { mode?: 'complete' | 'interrupt' }) {
  const [messages, setMessages] = useState<AssistantMessage[]>([...(args.messages ?? [])]);
  const [runStatus, setRunStatus] = useState<AssistantPanelProps['runStatus']>();
  const controller = useRef<AbortController | null>(null);
  const lastMessage = useRef('');
  const attempt = useRef(0);
  useEffect(() => () => { controller.current?.abort(); }, []);
  async function run(text: string): ReturnType<AssistantPanelProps['onSend']> {
    if (controller.current) return { ok: false, message: copy.stories.error };
    const abort = new AbortController();
    controller.current = abort;
    lastMessage.current = text;
    const turn = ++attempt.current;
    const answerId = `stream-${turn}-assistant`;
    setMessages(previous => [...previous, { id: `stream-${turn}-user`, role: 'user', text }]);
    setRunStatus('thinking');
    const pause = (ms: number) => new Promise<void>((resolve, reject) => {
      const stopped = () => { clearTimeout(timer); reject(new Error('Stopped fixture')); };
      const timer = setTimeout(() => { abort.signal.removeEventListener('abort', stopped); resolve(); }, ms);
      abort.signal.addEventListener('abort', stopped, { once: true });
      if (abort.signal.aborted) stopped();
    });
    let answer = '';
    try {
      await args.onSend(text);
      await pause(900);
      for (const chunk of [copy.stories.response.slice(0, 30), copy.stories.response.slice(30, 65), copy.stories.response.slice(65)]) {
        if (abort.signal.aborted) throw new Error('Stopped fixture');
        answer += chunk;
        const current = answer;
        setRunStatus('streaming');
        setMessages(previous => [...previous.filter(message => message.id !== answerId), { id: answerId, role: 'assistant', text: current }]);
        await pause(500);
        if (mode === 'interrupt' && turn === 1) throw new Error('Interrupted fixture');
      }
      setRunStatus('completed');
      return { ok: true };
    } catch {
      if (answer) setMessages(previous => previous.map(message => message.id === answerId ? { ...message, interrupted: true } : message));
      setRunStatus(abort.signal.aborted ? 'cancelled' : 'failed');
      return { ok: false, message: copy.stories.error };
    } finally { controller.current = null; }
  }
  return <AssistantPanel {...args} messages={messages} runStatus={runStatus} onSend={run}
    onStop={() => controller.current?.abort()} onRetry={() => run(lastMessage.current)} />;
}
async function startStreaming(canvasElement: HTMLElement) {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.open }));
  await userEvent.type(c.getByRole('textbox', { name: copy.composer }), copy.stories.question);
  await userEvent.click(c.getByRole('button', { name: copy.submit }));
  await expect(c.getByRole('status')).toHaveTextContent(copy.thinking);
  await expect(c.getByRole('log')).toHaveTextContent(copy.stories.question);
  return c;
}
export const Streaming: Story = {
  render: args => <StreamingPreview {...args} />,
  play: async ({ canvasElement, args }) => {
    const c = await startStreaming(canvasElement);
    await expect(c.getByRole('textbox', { name: copy.composer })).toBeDisabled();
    await waitFor(() => expect(c.getByRole('log')).toHaveTextContent(copy.stories.response.slice(0, 30)));
    await expect(c.getByRole('log')).not.toHaveTextContent(copy.stories.response);
    await expect(c.getByRole('log')).toHaveAttribute('aria-live', 'off');
    await waitFor(() => expect(c.getByRole('status')).toHaveTextContent(copy.completed), { timeout: 6000 });
    await expect(c.getByRole('log')).toHaveTextContent(copy.stories.response);
    await expect(c.getByRole('textbox', { name: copy.composer })).toHaveValue('');
    await expect(args.onSend).toHaveBeenCalledTimes(1);
  },
};
export const InterruptedStream: Story = {
  render: args => <StreamingPreview {...args} mode="interrupt" />,
  play: async ({ canvasElement, args }) => {
    const c = await startStreaming(canvasElement);
    await waitFor(() => expect(c.getByRole('status')).toHaveTextContent(copy.streamFailure), { timeout: 6000 });
    await expect(c.getByText(copy.interrupted)).toBeVisible();
    await expect(c.getByRole('log')).not.toHaveTextContent(copy.stories.response);
    await userEvent.click(c.getByRole('button', { name: copy.retry }));
    await waitFor(() => expect(c.getByRole('status')).toHaveTextContent(copy.completed), { timeout: 6000 });
    await expect(args.onSend).toHaveBeenCalledTimes(2);
    await expect(c.queryByRole('alert')).not.toBeInTheDocument();
    await expect(c.getByRole('textbox', { name: copy.composer })).toHaveValue('');
  },
};
export const StopStream: Story = {
  render: args => <StreamingPreview {...args} />,
  play: async ({ canvasElement }) => {
    const c = await startStreaming(canvasElement);
    await waitFor(() => expect(c.getByRole('status')).toHaveTextContent(copy.streaming));
    await userEvent.click(c.getByRole('button', { name: copy.stop }));
    await waitFor(() => expect(c.getByRole('status')).toHaveTextContent(copy.cancelled));
    await expect(c.queryByRole('alert')).not.toBeInTheDocument();
    await expect(c.getByText(copy.interrupted)).toBeVisible();
    await expect(c.getByRole('textbox', { name: copy.composer })).toBeEnabled();
    await expect(c.getByRole('button', { name: copy.retry })).toBeEnabled();
  },
};
export const CloseDuringStream: Story = {
  render: args => <StreamingPreview {...args} />,
  play: async ({ canvasElement, args }) => {
    const c = await startStreaming(canvasElement);
    await userEvent.click(c.getByRole('button', { name: copy.collapse }));
    await expect(c.queryByRole('dialog')).not.toBeInTheDocument();
    await expect(c.getByRole('button', { name: copy.open })).toHaveFocus();
    await userEvent.click(c.getByRole('button', { name: copy.open }));
    await waitFor(() => expect(c.getByRole('status')).toHaveTextContent(copy.completed), { timeout: 6000 });
    await expect(c.getByRole('log')).toHaveTextContent(copy.stories.response);
    await expect(args.onSend).toHaveBeenCalledTimes(1);
  },
};
export const Thinking: Story = { args: { messages: [{ id: 'thinking-user', role: 'user', text: copy.stories.question }], runStatus: 'thinking', onStop: fn() }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.open }));
  await expect(c.getByRole('status')).toHaveTextContent(copy.thinking);
  await expect(c.getByRole('button', { name: copy.stop })).toBeEnabled();
} };

export const StopWhileThinking: Story = {
  render: args => <StreamingPreview {...args} />,
  play: async ({ canvasElement, args }) => {
    const c = await startStreaming(canvasElement);
    await userEvent.click(c.getByRole('button', { name: copy.stop }));
    await waitFor(() => expect(c.getByRole('status')).toHaveTextContent(copy.cancelled));
    await expect(c.queryByRole('alert')).not.toBeInTheDocument();
    await expect(c.getByRole('log')).not.toHaveTextContent(copy.stories.response.slice(0, 30));
    await expect(args.onSend).toHaveBeenCalledTimes(1);
  },
};
export const ReadingEarlierMessages: Story = {
  args: { messages: Array.from({ length: 18 }, (_, index) => ({ id: `history-${index}`, role: index % 2 ? 'assistant' as const : 'user' as const, text: index % 2 ? copy.stories.response : copy.stories.question })) },
  render: args => <StreamingPreview {...args} />,
  play: async ({ canvasElement }) => {
    const c = await startStreaming(canvasElement);
    const dialog = c.getByRole('dialog');
    dialog.scrollTop = 0;
    await waitFor(() => expect(c.getByRole('status')).toHaveTextContent(copy.completed), { timeout: 6000 });
    await expect(dialog.scrollTop).toBeLessThan(80);
    await expect(c.getByRole('textbox', { name: copy.composer })).toHaveFocus();
  },
};

export const Sources: Story = {
  args: { runStatus: 'completed', onNewConversation: fn(), messages: [{ id: 'source-example', role: 'assistant', text: copy.stories.response,
    sources: [{ slug: 'pipeline', anchor: 'pipeline-stages', title: copy.stories.sourceTitle, heading: copy.stories.sourceHeading, href: '/help/pipeline?workspace=00000000-0000-4000-8000-000000000001&version=0000000000000000000000000000000000000000000000000000000000000000#pipeline-stages' }] }] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: copy.open }));
    await expect(canvas.getByRole('navigation', { name: copy.sources })).toBeVisible();
    await expect(canvas.getByRole('link')).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(canvas.getByRole('button', { name: copy.newConversation })).toBeEnabled();
  },
};

const searchFixture = { id: 'search-preview', scope: 'assigned' as const, filterLabels: searchCopy.stories.filters, includeArchived: false, total: 1,
  rows: [{ id: 'lead-preview', number: searchCopy.stories.number, name: searchCopy.stories.name, service: searchCopy.stories.service, stage: 'new' as const, ownerName: searchCopy.stories.owner, archived: false }] };
export const SearchResults: Story = {
  args: { messages: [{ id: 'search', role: 'assistant', text: '', searchResult: searchFixture }], runStatus: 'completed', onOpenSearchResult: fn(async () => ({ ok: true as const })) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement); await userEvent.click(canvas.getByRole('button', { name: copy.open }));
    const card = canvas.getByRole('region', { name: searchCopy.title });
    const lead = within(card).getByRole('button', { name: searchCopy.openLead(searchFixture.rows[0].number, searchFixture.rows[0].name) });
    lead.focus(); await userEvent.keyboard('{Enter}'); await expect(args.onOpenSearchResult).toHaveBeenCalledWith(searchFixture.id, searchFixture.rows[0].id);
    await userEvent.click(within(card).getByRole('button', { name: searchCopy.openList })); await expect(args.onOpenSearchResult).toHaveBeenCalledWith(searchFixture.id, undefined);
    await expect(args.onSend).not.toHaveBeenCalled();
  },
};
export const SearchNavigationFailed: Story = {
  args: { ...SearchResults.args, onOpenSearchResult: fn(async () => ({ ok: false as const, message: searchCopy.states.stale })) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement); await userEvent.click(canvas.getByRole('button', { name: copy.open }));
    await userEvent.click(canvas.getByRole('button', { name: searchCopy.openList }));
    await expect(canvas.getByRole('alert')).toHaveTextContent(searchCopy.states.stale);
  },
};

const detailsFixture = { id: 'details-preview', scope: 'assigned' as const, retrievedAt: detailsCopy.stories.retrievedAt,
  lead: { id: 'lead-preview', number: detailsCopy.stories.number, name: detailsCopy.stories.name, service: detailsCopy.stories.service,
    stage: 'contacted' as const, source: 'website' as const, ownerName: detailsCopy.stories.owner, archived: false,
    email: detailsCopy.stories.email, phone: detailsCopy.stories.phone, address: detailsCopy.stories.address, details: detailsCopy.stories.details, notes: detailsCopy.stories.notes } };
export const LeadDetails: Story = {
  args: { messages: [{ id: 'details', role: 'assistant', text: '', detailsResult: detailsFixture }], runStatus: 'completed', onOpenDetailsResult: fn(async () => ({ ok: true as const })), onOpenSearchResult: fn(async () => ({ ok: true as const })) },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.open }));
    const card = within(c.getByRole('region', { name: detailsCopy.title })); await expect(card.getByText(detailsCopy.stories.email)).toBeVisible();
    card.getByRole('button', { name: detailsCopy.openLabel(detailsCopy.stories.number) }).focus(); await userEvent.keyboard('{Enter}');
    await expect(args.onOpenDetailsResult).toHaveBeenCalledWith(detailsFixture.id, detailsFixture.lead.id); await expect(args.onOpenSearchResult).not.toHaveBeenCalled(); await expect(args.onSend).not.toHaveBeenCalled();
  },
};
export const DetailsNavigationFailed: Story = { args: { ...LeadDetails.args, onOpenDetailsResult: fn(async () => ({ ok: false as const, message: detailsCopy.states.stale })) },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.open }));
    await userEvent.click(c.getByRole('button', { name: detailsCopy.openLabel(detailsCopy.stories.number) })); await expect(c.getByRole('alert')).toHaveTextContent(detailsCopy.states.stale);
  },
};

const historyFixture = { id: 'history-preview', mode: 'notes' as const, scope: 'assigned' as const, retrievedAt: historyCopy.stories.now,
  lead: { id: 'lead-preview', number: historyCopy.stories.number, name: historyCopy.stories.name, archived: false }, total: 1,
  entries: [{ id: 'note-preview', kind: 'note' as const, createdAt: historyCopy.stories.now, actorName: historyCopy.stories.actor, viaAssistant: true, body: historyCopy.stories.note }],
};
export const LeadHistory: Story = { args: { messages: [{ id: 'history', role: 'assistant', text: '', historyResult: historyFixture }], runStatus: 'completed', onOpenHistoryResult: fn(async () => ({ ok: true as const })), onOpenDetailsResult: fn(async () => ({ ok: true as const })), onOpenSearchResult: fn(async () => ({ ok: true as const })) },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.open }));
    const card = within(c.getByRole('region', { name: historyCopy.titles.notes }));
    await expect(card.getByText(historyCopy.stories.note, { normalizer: value => value })).toBeVisible();
    const button = card.getByRole('button', { name: historyCopy.openLabel(historyCopy.stories.number) }); button.focus(); await userEvent.keyboard('{Enter}');
    await expect(args.onOpenHistoryResult).toHaveBeenCalledWith(historyFixture.id, historyFixture.lead.id); await expect(args.onOpenDetailsResult).not.toHaveBeenCalled(); await expect(args.onOpenSearchResult).not.toHaveBeenCalled(); await expect(args.onSend).not.toHaveBeenCalled();
  },
};
export const HistoryNavigationFailed: Story = { args: { ...LeadHistory.args, onOpenHistoryResult: fn(async () => ({ ok: false as const, message: historyCopy.states.stale })) },
  play: async ({ canvasElement }) => { const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.open })); await userEvent.click(c.getByRole('button', { name: historyCopy.openLabel(historyCopy.stories.number) })); await expect(c.getByRole('alert')).toHaveTextContent(historyCopy.states.stale); },
};
