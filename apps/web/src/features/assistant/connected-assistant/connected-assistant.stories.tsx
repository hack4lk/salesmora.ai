import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { chatStreamEventSchema, type ChatStreamEvent } from '@salesmora/contracts';
import { ConnectedAssistant } from './connected-assistant';
import { connectedAssistantData as copy } from './connected-assistant.data';
import { WorkspaceAssistantProvider, useWorkspaceAssistant } from '../workspace-assistant/workspace-assistant';

const workspaceId = '00000000-0000-4000-8000-000000000075';
const turnId = '00000000-0000-4000-8000-000000000076';
const messageId = '00000000-0000-4000-8000-000000000077';
const privateAnswer = 'Fictional saved report: known recorded costs are $2,400.';
let revoke: (() => void) | undefined;
let historyRequests = 0;

function ReviewPrompt() {
  const assistant = useWorkspaceAssistant();
  return <button type="button" disabled={assistant?.status !== 'ready'}
    onClick={event => assistant?.prepare('Summarize my report', event.currentTarget)}>
    Ask about the fictional report
  </button>;
}

const meta = {
  title: 'Assistant/ConnectedAssistant',
  component: ConnectedAssistant,
  args: { workspaceId, surfaceKey: 'home' },
  parameters: { layout: 'fullscreen', nextjs: { appDirectory: true } },
  decorators: [Story => <WorkspaceAssistantProvider enabled><main className="p-4 sm:p-8">
    <h1 className="text-xl font-semibold">Connected assistant evidence protection</h1>
    <p>Fictional transport only. No provider, workspace read or live report tool is called.</p>
    <ReviewPrompt />
    <Story />
  </main></WorkspaceAssistantProvider>],
  beforeEach: () => {
    const original = globalThis.fetch;
    const key = `salesmora-chat:${workspaceId}`;
    sessionStorage.removeItem(key);
    historyRequests = 0;
    let active: ReadableStreamDefaultController<Uint8Array> | undefined;
    let closed = false;
    globalThis.fetch = async (input, init) => {
      const url = String(input);
      if (url.startsWith('/api/chat/threads')) {
        historyRequests++;
        return Response.json({ error: 'access_denied' }, { status: 403 });
      }
      if (url !== '/api/chat/turns' || init?.method !== 'POST') throw new Error('Unexpected mocked assistant request.');
      const body = new ReadableStream<Uint8Array>({
        start(controller) {
          active = controller;
          const send = (event: ChatStreamEvent) => controller.enqueue(new TextEncoder().encode(
            `data: ${JSON.stringify(chatStreamEventSchema.parse(event))}\n\n`));
          const envelope = { version: 1 as const, runId: turnId, turnId, messageId };
          send({ ...envelope, sequence: 1, type: 'turn.accepted', threadId: turnId });
          send({ ...envelope, sequence: 2, type: 'message.delta', text: privateAnswer });
          revoke = () => {
            send({ ...envelope, sequence: 3, type: 'turn.failed', code: 'access_denied' });
            controller.close();
            closed = true;
          };
        },
      });
      return new Response(body, { headers: { 'Content-Type': 'text/event-stream' } });
    };
    return () => {
      if (!closed) active?.close();
      revoke = undefined;
      globalThis.fetch = original;
      sessionStorage.removeItem(key);
    };
  },
} satisfies Meta<typeof ConnectedAssistant>;
export default meta;
type Story = StoryObj<typeof meta>;

export const AccessRevokedMidStream: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const open = await canvas.findByRole('button', { name: 'Ask about the fictional report' });
    await waitFor(() => expect(open).toBeEnabled());
    await userEvent.click(open);
    const page = within(canvasElement.ownerDocument.body);
    expect(page.getByRole('textbox', { name: 'Ask the SalesMora assistant' })).toHaveValue('Summarize my report');
    const send = page.getByRole('button', { name: 'Ask assistant' });
    await waitFor(() => expect(send).toBeEnabled());
    await userEvent.click(send);
    expect(await page.findByText(privateAnswer)).toBeVisible();
    if (!revoke) throw new Error('Mock report stream was not started.');
    revoke();
    await waitFor(() => expect(page.queryByText(privateAnswer)).not.toBeInTheDocument());
    expect(await page.findByText(copy.denied)).toBeVisible();
    expect(page.getByRole('button', { name: 'Ask assistant' })).toBeDisabled();
    expect(page.queryByRole('button', { name: 'Retry response' })).not.toBeInTheDocument();
    expect(historyRequests).toBe(0);
  },
};

export const AccessRevokedMidStreamPhone: Story = {
  ...AccessRevokedMidStream,
  globals: { viewport: { value: 'mobile1' } },
};
