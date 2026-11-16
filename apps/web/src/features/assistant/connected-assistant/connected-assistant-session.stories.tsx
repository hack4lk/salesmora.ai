import { StrictMode } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { chatStreamEventSchema, type ChatStreamEvent } from '@salesmora/contracts';
import { ConnectedAssistant } from './connected-assistant';
import { WorkspaceAssistantProvider, useWorkspaceAssistant } from '../workspace-assistant/workspace-assistant';
import { ApiViewerProvider } from '../../api/api-query-provider';
import { connectedAssistantData as copy } from './connected-assistant.data';
import { assistantHistoryFixture, assistantNoteFixture, assistantScope, assistantThreadId, assistantTurnId } from '../assistant-queries.fixtures';

const reads = fn(), commands = fn();
let history = structuredClone(assistantHistoryFixture), historyStatus = 200, commandStatus = 200;
let wrongReceipt = false, deferHistory = false, releaseHistory: (() => void) | undefined;
let stream: ReadableStreamDefaultController<Uint8Array> | undefined, streamClosed = false, sequence = 0;
const streamingText = 'Fictional new streaming answer.';
function emit(event: ChatStreamEvent) {
  stream?.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(chatStreamEventSchema.parse(event))}\n\n`));
}
function OpenAssistant() {
  const assistant = useWorkspaceAssistant();
  return <button type="button" onClick={() => assistant?.setOpen(true)}>Open session preview</button>;
}
const meta = {
  title: 'Assistant/ConnectedAssistantSession', component: ConnectedAssistant,
  args: { workspaceId: assistantScope.workspaceId, surfaceKey: 'home' },
  parameters: { layout: 'fullscreen', nextjs: { appDirectory: true } },
  decorators: [Story => <StrictMode><ApiViewerProvider viewerId={assistantScope.viewerId}>
    <WorkspaceAssistantProvider enabled><main className="p-4 sm:p-8"><OpenAssistant/><Story/></main></WorkspaceAssistantProvider>
  </ApiViewerProvider></StrictMode>],
  beforeEach: () => {
    const key = `salesmora-chat:${assistantScope.workspaceId}`, original = globalThis.fetch;
    sessionStorage.setItem(key, assistantThreadId);
    reads.mockClear(); commands.mockClear();
    history = structuredClone(assistantHistoryFixture); historyStatus = commandStatus = 200;
    wrongReceipt = deferHistory = false; releaseHistory = undefined; stream = undefined; streamClosed = false; sequence = 0;
    globalThis.fetch = async (input, init) => {
      const path = new URL(String(input), 'http://localhost').pathname;
      if (path === '/api/chat/threads') {
        reads();
        const snapshot = structuredClone(history), status = historyStatus;
        if (deferHistory) await new Promise<void>(resolve => { releaseHistory = resolve; });
        return Response.json(status === 200 ? snapshot : { error: 'access_denied' }, { status });
      }
      if (path === '/api/chat/actions') {
        const body: unknown = JSON.parse(String(init?.body));
        commands({ path, body });
        if (commandStatus !== 200) return Response.json({ error: 'draft_changed_or_expired' }, { status: commandStatus });
        const action = { ...assistantNoteFixture, id: wrongReceipt ? assistantTurnId : assistantNoteFixture.id, state: 'confirmed' as const };
        history.turns[0].action = action;
        return Response.json({ action });
      }
      if (path === '/api/chat/cancel') {
        commands({ path, body: JSON.parse(String(init?.body)) });
        history = { ...history, turns: [{ ...history.turns[0], state: 'cancelled', action: undefined }],
          messages: [{ ...history.messages[0], text: streamingText }] };
        emit({ version: 1, runId: assistantTurnId, turnId: assistantTurnId, messageId: assistantTurnId, sequence: ++sequence, type: 'turn.cancelled' });
        stream?.close(); streamClosed = true;
        return Response.json({ cancelled: true });
      }
      if (path === '/api/chat/turns') {
        const body = new ReadableStream<Uint8Array>({ start(controller) {
          stream = controller;
          const envelope = { version: 1 as const, runId: assistantTurnId, turnId: assistantTurnId, messageId: assistantTurnId };
          emit({ ...envelope, sequence: ++sequence, type: 'turn.accepted', threadId: assistantThreadId });
          emit({ ...envelope, sequence: ++sequence, type: 'message.delta', text: streamingText });
        } });
        return new Response(body, { headers: { 'Content-Type': 'text/event-stream' } });
      }
      return original(input, init);
    };
    return () => {
      releaseHistory?.();
      if (stream && !streamClosed) stream.close();
      globalThis.fetch = original;
      sessionStorage.removeItem(key);
    };
  },
} satisfies Meta<typeof ConnectedAssistant>;
export default meta;
type Story = StoryObj<typeof meta>;

async function open(canvasElement: HTMLElement) {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open session preview' }));
  const body = within(canvasElement.ownerDocument.body);
  await expect(await body.findByText(assistantHistoryFixture.messages[0].text)).toBeVisible();
  await waitFor(() => expect(body.getByRole('textbox', { name: 'Ask the SalesMora assistant' })).toBeEnabled());
  await waitFor(() => expect(reads.mock.calls.length).toBeGreaterThanOrEqual(2));
  return body;
}
export const RestoreAndReauthorize: Story = { play: async ({ canvasElement }) => {
  const body = await open(canvasElement), count = reads.mock.calls.length;
  canvasElement.ownerDocument.defaultView?.dispatchEvent(new Event('focus'));
  await waitFor(() => expect(reads).toHaveBeenCalledTimes(count + 1));
  await expect(body.getByText(assistantNoteFixture.body)).toBeVisible();
  await expect(commands).not.toHaveBeenCalled();
} };
export const HistoryDeniedOnFocus: Story = { play: async ({ canvasElement }) => {
  const body = await open(canvasElement);
  historyStatus = 403;
  canvasElement.ownerDocument.defaultView?.dispatchEvent(new Event('focus'));
  await waitFor(() => expect(body.queryByText(assistantHistoryFixture.messages[0].text)).not.toBeInTheDocument());
  await expect(body.queryByText(assistantNoteFixture.body)).not.toBeInTheDocument();
  await expect(body.getByText(copy.denied)).toBeVisible();
  fireEvent.change(body.getByRole('textbox', { name: 'Ask the SalesMora assistant' }), { target: { value: 'Try a new request' } });
  await expect(body.getByRole('button', { name: 'Ask assistant' })).toBeDisabled();
} };
export const HistoryUnavailableOnFocus: Story = { play: async ({ canvasElement }) => {
  const body = await open(canvasElement);
  historyStatus = 503;
  const count = reads.mock.calls.length;
  canvasElement.ownerDocument.defaultView?.dispatchEvent(new Event('focus'));
  await expect(await body.findByText(copy.historyUnavailable)).toBeVisible();
  await expect(body.queryByText(assistantHistoryFixture.messages[0].text)).not.toBeInTheDocument();
  await expect(reads).toHaveBeenCalledTimes(count + 1);
} };
export const NewConversationDiscardsLateHistory: Story = { play: async ({ canvasElement }) => {
  const body = await open(canvasElement);
  deferHistory = true;
  canvasElement.ownerDocument.defaultView?.dispatchEvent(new Event('focus'));
  await waitFor(() => expect(releaseHistory).toBeDefined());
  await userEvent.click(body.getByRole('button', { name: 'New conversation' }));
  releaseHistory?.();
  await waitFor(() => expect(body.queryByText(assistantHistoryFixture.messages[0].text)).not.toBeInTheDocument());
  await expect(body.getByRole('textbox', { name: 'Ask the SalesMora assistant' })).toBeEnabled();
  await expect(sessionStorage.getItem(`salesmora-chat:${assistantScope.workspaceId}`)).toBeNull();
} };
export const ExactDecisionRetry: Story = { play: async ({ canvasElement }) => {
  const body = await open(canvasElement);
  commandStatus = 503;
  await userEvent.click(body.getByRole('button', { name: 'Confirm and add note' }));
  await expect(await body.findByText(copy.interrupted)).toBeVisible();
  await expect(commands).toHaveBeenCalledTimes(1);
  commandStatus = 200;
  await userEvent.click(body.getByRole('button', { name: 'Confirm and add note' }));
  await expect(await body.findByText('Team note added')).toBeVisible();
  await expect(commands.mock.calls[0]).toEqual(commands.mock.calls[1]);
} };
export const DecisionDenied: Story = { play: async ({ canvasElement }) => {
  const body = await open(canvasElement);
  commandStatus = 403;
  await userEvent.click(body.getByRole('button', { name: 'Confirm and add note' }));
  await waitFor(() => expect(body.queryByText(assistantNoteFixture.body)).not.toBeInTheDocument());
  await expect(body.getByText(copy.denied)).toBeVisible();
  fireEvent.change(body.getByRole('textbox', { name: 'Ask the SalesMora assistant' }), { target: { value: 'Try a new request' } });
  await expect(body.getByRole('button', { name: 'Ask assistant' })).toBeDisabled();
  await expect(commands).toHaveBeenCalledTimes(1);
} };
export const MismatchedDecisionReceipt: Story = { play: async ({ canvasElement }) => {
  const body = await open(canvasElement);
  wrongReceipt = true;
  await userEvent.click(body.getByRole('button', { name: 'Confirm and add note' }));
  await expect(await body.findByText(copy.decisionInterrupted)).toBeVisible();
  await expect(body.queryByText('Team note added')).not.toBeInTheDocument();
  await expect(body.getByRole('button', { name: 'Confirm and add note' })).toBeEnabled();
} };
export const StreamingCancelsHistoryAndStops: Story = { play: async ({ canvasElement }) => {
  const body = await open(canvasElement);
  deferHistory = true;
  canvasElement.ownerDocument.defaultView?.dispatchEvent(new Event('focus'));
  await waitFor(() => expect(releaseHistory).toBeDefined());
  fireEvent.change(body.getByRole('textbox', { name: 'Ask the SalesMora assistant' }), { target: { value: 'Start work' } });
  await waitFor(() => expect(body.getByRole('button', { name: 'Ask assistant' })).toBeEnabled());
  await userEvent.click(body.getByRole('button', { name: 'Ask assistant' }));
  await expect(await body.findByText(streamingText)).toBeVisible();
  releaseHistory?.(); deferHistory = false;
  await expect(body.getByRole('button', { name: 'Stop response' })).toBeEnabled();
  await userEvent.click(body.getByRole('button', { name: 'Stop response' }));
  await expect(await body.findByText('Response stopped. You can retry when ready.')).toBeVisible();
  await expect(commands).toHaveBeenCalledTimes(1);
  await expect(commands.mock.calls[0][0]).toEqual({ path: '/api/chat/cancel', body: { workspaceId: assistantScope.workspaceId, turnId: assistantTurnId } });
} };
