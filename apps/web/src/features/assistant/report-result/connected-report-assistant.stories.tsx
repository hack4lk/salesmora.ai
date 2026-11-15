import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { chatHistoryResponseSchema, chatStreamEventSchema, chatTurnRequestSchema,
  reportAssistantResultResponseSchema, type ChatStreamEvent, type ReportAssistantTicket } from '@salesmora/contracts';
import { ConnectedAssistant } from '../connected-assistant/connected-assistant';
import { WorkspaceAssistantProvider, useWorkspaceAssistant } from '../workspace-assistant/workspace-assistant';
import { reportAssistantExamples } from './report-result.fixtures';
import { reportSelectionExamples } from '../../../../../../packages/contracts/src/reports/assistant-query.fixtures';
import { reportHref } from '../../reports/report-navigation';
import { reportResultData as copy } from './report-result.data';
import { connectedAssistantData } from '../connected-assistant/connected-assistant.data';
import { getRouter } from '@storybook/nextjs-vite/navigation.mock';

const selection = reportSelectionExamples[1]!;
const workspaceId = selection.query.workspaceId;
const threadId = '00000000-0000-4000-8000-000000000022';
const turnId = '00000000-0000-4000-8000-000000000023';
const resultId = '00000000-0000-4000-8000-000000000024';
const userId = '00000000-0000-4000-8000-000000000025';
const messageId = '00000000-0000-4000-8000-000000000026';
const clientTurnId = '00000000-0000-4000-8000-000000000027';
const retrievedAt = '2026-11-09T15:00:00.000Z';
const answer = 'There are 12 authorized Leads in the selected creation period.';
const ticket: ReportAssistantTicket = { id: resultId, area: 'leads', retrievedAt };
const context = { selection, period: { preset: 'last30days' as const } };
const payload = reportAssistantResultResponseSchema.parse({ retrievedAt,
  snapshot: { selection, result: { ...reportAssistantExamples.leads.result, id: resultId } } });
const clarification = 'Do you mean currently overdue Jobs, or Jobs completed during a selected period? Which period should I use?';
type Mode = 'stream' | 'restore' | 'replay' | 'cancel' | 'revoked' | 'revoke-restored' | 'clarify';
let submitted: unknown;
let historyReads = 0;
let release: (() => void) | undefined;
let releaseCancel: (() => void) | undefined;
let revokeAccess: (() => void) | undefined;

function Prompt() {
  const assistant = useWorkspaceAssistant();
  return <button type="button" disabled={assistant?.status !== 'ready'}
    onClick={event => assistant?.prepare('Explain this applied report', event.currentTarget)}>Ask about this report</button>;
}
function history(mode: Mode) {
  const restricted = mode === 'revoked';
  return chatHistoryResponseSchema.parse({ threadId,
    turns: [{ id: turnId, state: 'completed', clientTurnId, createdAt: retrievedAt, sources: [],
      ...(mode === 'clarify' ? {} : { reportStatus: restricted ? 'restricted' : 'ready', reportSources: restricted ? [] : [resultId],
        ...(restricted ? {} : { reportResult: ticket }) }) }],
    messages: [{ id: userId, turnId, role: 'user', text: 'Explain this applied report' },
      { id: messageId, turnId, role: 'assistant', text: restricted ? connectedAssistantData.reportChanged : mode === 'clarify' ? clarification : answer }],
  });
}
function mock(mode: Mode = 'stream') {
  const original = globalThis.fetch;
  const key = `salesmora-chat:${workspaceId}`;
  if (mode === 'restore' || mode === 'revoked' || mode === 'revoke-restored') sessionStorage.setItem(key, threadId);
  else sessionStorage.removeItem(key);
  submitted = undefined; historyReads = 0; release = undefined; releaseCancel = undefined;
  let active: ReadableStreamDefaultController<Uint8Array> | undefined;
  let closed = false;
  let revoked = false;
  revokeAccess = () => { revoked = true; };
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (url.startsWith('/api/chat/threads')) {
      historyReads++;
      return Response.json(mode === 'cancel'
        ? { threadId, turns: [{ id: turnId, state: 'cancelled', clientTurnId, createdAt: retrievedAt, sources: [],
          reportStatus: 'restricted', reportSources: [] }], messages: [
          { id: messageId, turnId, role: 'assistant', text: connectedAssistantData.reportChanged }] }
        : history(revoked ? 'revoked' : mode));
    }
    if (url.startsWith('/api/chat/reports')) {
      if (revoked) return Response.json({ error: 'access_denied' }, { status: 403 });
      if (init?.method === 'POST') return Response.json({ href: reportHref(selection) });
      return Response.json(payload);
    }
    if (url === '/api/chat/cancel') {
      releaseCancel?.();
      return Response.json({ ok: true });
    }
    if (url !== '/api/chat/turns' || init?.method !== 'POST') throw new Error('Unexpected mocked Reports chat request.');
    submitted = chatTurnRequestSchema.parse(JSON.parse(String(init.body)));
    if (mode === 'replay') return Response.json({ replay: true, turnId, threadId, state: 'completed' });
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        active = controller;
        const envelope = { version: 1 as const, runId: turnId, turnId, messageId };
        const send = (event: ChatStreamEvent) => controller.enqueue(new TextEncoder().encode(
          `data: ${JSON.stringify(chatStreamEventSchema.parse(event))}\n\n`));
        send({ ...envelope, sequence: 1, type: 'turn.accepted', threadId });
        send({ ...envelope, sequence: 2, type: 'message.delta', text: mode === 'clarify' ? clarification : answer });
        release = () => {
          if (mode !== 'clarify') send({ ...envelope, sequence: 3, type: 'report.result', result: ticket });
          send({ ...envelope, sequence: mode === 'clarify' ? 3 : 4, type: 'turn.completed' });
          controller.close(); closed = true;
        };
        releaseCancel = () => {
          send({ ...envelope, sequence: 3, type: 'turn.cancelled' });
          controller.close(); closed = true;
        };
      },
    });
    return new Response(body, { headers: { 'Content-Type': 'text/event-stream' } });
  };
  return () => {
    if (!closed) active?.close();
    globalThis.fetch = original;
    sessionStorage.removeItem(key);
    release = undefined; releaseCancel = undefined; revokeAccess = undefined;
  };
}
const meta = {
  title: 'Assistant/ConnectedReportConversation', component: ConnectedAssistant,
  args: { workspaceId, surfaceKey: 'reports' },
  parameters: { layout: 'fullscreen', nextjs: { appDirectory: true } },
  decorators: [Story => <WorkspaceAssistantProvider enabled initialPageContext={{
    reportContext: context, key: 'story-applied-report', label: 'Applied Leads report',
  }}><main className="p-4 sm:p-8">
    <h1 className="text-xl font-semibold">Connected Reports conversation</h1>
    <p>Canonical assistant and report card, fictional transport only. No provider or live workspace access.</p>
    <Prompt /><Story />
  </main></WorkspaceAssistantProvider>],
  beforeEach: () => mock(),
} satisfies Meta<typeof ConnectedAssistant>;
export default meta;
type Story = StoryObj<typeof meta>;
async function open(canvasElement: HTMLElement) {
  const button = await within(canvasElement).findByRole('button', { name: 'Ask about this report' });
  await waitFor(() => expect(button).toBeEnabled());
  await userEvent.click(button);
  return within(canvasElement.ownerDocument.body);
}
async function send(canvasElement: HTMLElement) {
  const page = await open(canvasElement);
  const button = page.getByRole('button', { name: 'Ask assistant' });
  await waitFor(() => expect(button).toBeEnabled());
  await userEvent.click(button);
  return page;
}
export const StreamingThenRestore: Story = { play: async ({ canvasElement }) => {
  const page = await send(canvasElement);
  expect(await page.findByText(answer)).toBeVisible();
  expect(submitted).toMatchObject({ reportContext: context });
  expect(page.queryByRole('button', { name: copy.open })).not.toBeInTheDocument();
  if (!release) throw new Error('Report stream was not started.');
  release();
  expect(await page.findByRole('button', { name: copy.open })).toBeVisible();
  await waitFor(() => expect(historyReads).toBeGreaterThan(0));
} };
export const RestoredHistory: Story = { beforeEach: () => mock('restore'), play: async ({ canvasElement }) => {
  const page = await open(canvasElement);
  expect(await page.findByText(answer)).toBeVisible();
  expect(await page.findByRole('button', { name: copy.open })).toBeVisible();
  expect(submitted).toBeUndefined();
} };
export const IdempotentReplay: Story = { beforeEach: () => mock('replay'), play: async ({ canvasElement }) => {
  const page = await send(canvasElement);
  expect(await page.findByRole('button', { name: copy.open })).toBeVisible();
  expect(await page.findByText(answer)).toBeVisible();
} };
export const RevokedHistory: Story = { beforeEach: () => mock('revoked'), play: async ({ canvasElement }) => {
  const page = await open(canvasElement);
  expect(await page.findByText(copy.states.stale)).toBeVisible();
  expect(page.queryByText(answer)).not.toBeInTheDocument();
  expect(page.queryByRole('button', { name: copy.open })).not.toBeInTheDocument();
} };
export const AccessRevokedAfterRestore: Story = { beforeEach: () => mock('revoke-restored'), play: async ({ canvasElement }) => {
  const page = await open(canvasElement);
  expect(await page.findByText(answer)).toBeVisible();
  await page.findByRole('button', { name: copy.open });
  if (!revokeAccess) throw new Error('Revocation fixture not initialized.');
  revokeAccess();
  window.dispatchEvent(new Event('focus'));
  await waitFor(() => expect(page.queryByText(answer)).not.toBeInTheDocument());
  await waitFor(() => expect(page.queryByRole('button', { name: copy.open })).not.toBeInTheDocument());
  expect(await page.findByText(connectedAssistantData.reportChanged)).toBeVisible();
} };
export const OpenMatchingReport: Story = { beforeEach: () => mock('restore'), play: async ({ canvasElement }) => {
  const page = await open(canvasElement);
  await userEvent.click(await page.findByRole('button', { name: copy.open }));
  expect(getRouter().push).toHaveBeenCalledWith(reportHref(selection));
  await waitFor(() => expect(page.queryByRole('dialog')).not.toBeInTheDocument());
} };
export const Clarification: Story = { beforeEach: () => mock('clarify'), play: async ({ canvasElement }) => {
  const page = await send(canvasElement);
  expect(await page.findByText(clarification)).toBeVisible();
  if (!release) throw new Error('Clarification stream was not started.');
  release();
  await waitFor(() => expect(historyReads).toBeGreaterThan(0));
  expect(page.queryByRole('button', { name: copy.open })).not.toBeInTheDocument();
} };
export const CancelPendingReport: Story = { beforeEach: () => mock('cancel'), play: async ({ canvasElement }) => {
  const page = await send(canvasElement);
  expect(await page.findByText(answer)).toBeVisible();
  await userEvent.click(page.getByRole('button', { name: 'Stop response' }));
  await waitFor(() => expect(page.queryByText(answer)).not.toBeInTheDocument());
  expect(await page.findByText(copy.states.stale)).toBeVisible();
  expect(page.queryByRole('button', { name: copy.open })).not.toBeInTheDocument();
} };
export const Phone: Story = { ...StreamingThenRestore, globals: { viewport: { value: 'mobile1' } } };
