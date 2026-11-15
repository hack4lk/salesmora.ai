import { describe, expect, it, vi } from 'vitest';
import { createConversationModel, chatModelId } from './openai-model';
import { implementedTools } from './tools/registry';
import type { AIUsageRecorder } from '@salesmora/contracts';

const response = { id: 'resp_fictional', object: 'response', created_at: 1, model: chatModelId,
  status: 'completed', output: [], usage: { input_tokens: 100, output_tokens: 20, total_tokens: 120 } };
const functionResponse = (name: string, args: unknown) => Response.json({
  ...response, output: [{ type: 'function_call', id: 'fc_fictional', call_id: 'call_fictional',
    name, arguments: JSON.stringify(args), status: 'completed' }],
});
const messages = [{ role: 'user' as const, text: 'what are the current open leads?' }];
const signal = () => new AbortController().signal;
const route = { certain: true, domains: ['leads'], intent: 'read' };

describe('opt-in routed planner', () => {
  it('routes before planning with only an allowed domain schema and preserves full off-page question context', async () => {
    const request = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(functionResponse('route_intent', route))
      .mockResolvedValueOnce(Response.json(response));
    await createConversationModel('fictional', request, undefined, { intentRouting: true })
      .plan(messages, implementedTools, signal(), ['search', 'create'], ['search'], ['create_source']);
    const bodies = request.mock.calls.map(([, options]) => JSON.parse(options!.body as string));
    expect(bodies[0].tools.map((tool: { name: string }) => tool.name)).toEqual(['route_intent']);
    expect(bodies[0].tool_choice).toEqual({ type: 'function', name: 'route_intent' });
    expect(bodies[0]).toMatchObject({ max_output_tokens: 256, store: false });
    expect(bodies[1].tools.map((tool: { name: string }) => tool.name)).toEqual(['leads_query']);
    expect(JSON.stringify(bodies[1].input)).toContain('what are the current open leads?');
    expect(JSON.stringify(bodies[1].input)).not.toContain('ESTIMATE PROPOSALS');
  });
  it.each([
    { ...route, certain: false }, { ...route, domains: ['campaigns'] },
    { ...route, intent: 'commit' }, { ...route, domains: [] },
    { ...route, domains: ['capture'] },
  ])('explicitly falls back to authorized broad planning for uncertain/invalid/unavailable routes: %j', async value => {
    const request = vi.fn<typeof fetch>().mockResolvedValueOnce(functionResponse('route_intent', value))
      .mockResolvedValueOnce(Response.json(response));
    await createConversationModel('fictional', request, undefined, { intentRouting: true })
      .plan(messages, ['leads_query', 'search_help'], signal(), ['search']);
    const body = JSON.parse(request.mock.calls[1][1]!.body as string);
    expect(body.tools.map((tool: { name: string }) => tool.name)).toEqual(['leads_query', 'search_help']);
  });
  it('skips classification for oversized requests and absent effective tools', async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(Response.json(response));
    const model = createConversationModel('fictional', request, undefined, { intentRouting: true });
    expect(await model.plan(messages, [], signal())).toEqual([]);
    await model.plan([{ role: 'user', text: 'x'.repeat(2001) }], ['search_help'], signal());
    expect(request).toHaveBeenCalledTimes(1);
    const body = JSON.parse(request.mock.calls[0][1]!.body as string);
    expect(body.tools[0].name).toBe('search_help');
  });
  it('accounts for and reserves both routing and planning as distinct planning calls', async () => {
    const finish = vi.fn().mockResolvedValue(undefined);
    const start = vi.fn<AIUsageRecorder['start']>().mockResolvedValue(finish);
    const count = () => Response.json({ object: 'response.input_tokens', input_tokens: 100 });
    const request = vi.fn<typeof fetch>().mockResolvedValueOnce(count())
      .mockResolvedValueOnce(functionResponse('route_intent', route)).mockResolvedValueOnce(count())
      .mockResolvedValueOnce(Response.json(response));
    await createConversationModel('fictional', request, { start, requiresReservation: true }, { intentRouting: true })
      .plan(messages, ['leads_query', 'search_help'], signal(), ['search']);
    expect(request.mock.calls.map(([url]) => new URL(String(url)).pathname))
      .toEqual(['/v1/responses/input_tokens', '/v1/responses', '/v1/responses/input_tokens', '/v1/responses']);
    expect(start.mock.calls.map(args => args.slice(0, 2))).toEqual([[chatModelId, 'planning'], [chatModelId, 'planning']]);
    expect(start.mock.calls[0][2]).toBe(356);
    expect(finish).toHaveBeenCalledTimes(2);
    expect(finish.mock.calls.every(([result]) => result.outcome === 'completed')).toBe(true);
  });
  it('surfaces provider and reservation failures rather than silently making unbudgeted fallback calls', async () => {
    const request = vi.fn<typeof fetch>().mockRejectedValue(new Error('Private provider error'));
    await expect(createConversationModel('fictional', request, undefined, { intentRouting: true })
      .plan(messages, ['search_help'], signal())).rejects.toThrow('Conversation provider unavailable');
    expect(request).toHaveBeenCalledTimes(1);
    const start = vi.fn<AIUsageRecorder['start']>().mockRejectedValue(new Error('Reservation failed'));
    const budgeted = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ object: 'response.input_tokens', input_tokens: 100 }));
    await expect(createConversationModel('fictional', budgeted, { start, requiresReservation: true }, { intentRouting: true })
      .plan(messages, ['search_help'], signal())).rejects.toThrow('Conversation provider unavailable');
    expect(budgeted).toHaveBeenCalledTimes(1);
  });
  it('rejects a planner call outside its routed tool subset before execution', async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValueOnce(functionResponse('route_intent', route))
      .mockResolvedValueOnce(functionResponse('leads_propose_action', {}));
    await expect(createConversationModel('fictional', request, undefined, { intentRouting: true })
      .plan(messages, ['leads_query', 'leads_propose_action'], signal(), ['search', 'create']))
      .rejects.toThrow('Conversation provider unavailable');
  });
  it('falls back with a content-free diagnostic when no valid classification call is returned', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});
    try {
      const request = vi.fn<typeof fetch>().mockResolvedValueOnce(Response.json(response)).mockResolvedValueOnce(Response.json(response));
      await createConversationModel('fictional', request, undefined, { intentRouting: true })
        .plan(messages, ['search_help', 'leads_query'], signal(), ['search']);
      expect(info).toHaveBeenCalledWith('chat_intent_route', expect.objectContaining({
        reason: 'invalid-route', availableTools: 2, selectedTools: 2,
      }));
      expect(JSON.stringify(info.mock.calls)).not.toContain('what are the current open leads?');
    } finally { info.mockRestore(); }
  });
  it('records router cancellation and never starts the main planner after it', async () => {
    const finish = vi.fn().mockResolvedValue(undefined);
    const start = vi.fn<AIUsageRecorder['start']>().mockResolvedValue(finish);
    const controller = new AbortController();
    const request = vi.fn<typeof fetch>().mockImplementation(async () => {
      controller.abort();
      throw new Error('Private cancellation');
    });
    await expect(createConversationModel('fictional', request, { start }, { intentRouting: true })
      .plan(messages, ['search_help'], controller.signal)).rejects.toThrow('Conversation provider unavailable');
    expect(request).toHaveBeenCalledTimes(1);
    expect(finish).toHaveBeenCalledWith({ outcome: 'cancelled', tokens: undefined });
  });
});
