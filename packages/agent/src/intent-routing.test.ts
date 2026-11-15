import { describe, expect, it } from 'vitest';
import { intentRoutingMessages, parseIntentRoute, selectIntentTools, type IntentRoute } from './intent-routing';
import { implementedTools } from './tools/registry';

describe('intent routing boundaries', () => {
  it.each([undefined, null, {}, { certain: true, domains: ['campaigns'], intent: 'read' },
    { certain: true, domains: [], intent: 'read' }, { certain: true, domains: ['leads', 'leads'], intent: 'read' },
    { certain: true, domains: ['leads'], intent: 'commit' },
    { certain: true, domains: ['leads'], intent: 'read', tool: 'delete' },
    { certain: 'yes', domains: ['leads'], intent: 'read' }])('rejects invalid routing output: %j', value => {
    expect(parseIntentRoute(value)).toBeUndefined();
  });
  it('narrows simple lead reads without granting any tool', () => {
    const route: IntentRoute = { certain: true, domains: ['leads'], intent: 'read' };
    expect(selectIntentTools(['leads_query', 'leads_propose_action', 'reports_query', 'search_help'], route))
      .toEqual({ tools: ['leads_query'], reason: 'routed' });
    expect(selectIntentTools(['search_help'], route)).toEqual({ tools: ['search_help'], reason: 'no-authorized-match' });
  });
  it('preserves all requested domains, preparation tools and supporting reads for compound requests', () => {
    const route: IntentRoute = { certain: true, domains: ['leads', 'calendar'], intent: 'mixed' };
    expect(selectIntentTools(['leads_query', 'leads_propose_action', 'calendar_query', 'calendar_propose_action', 'estimates_query'], route).tools)
      .toEqual(['leads_query', 'leads_propose_action', 'calendar_query', 'calendar_propose_action']);
    expect(selectIntentTools(['calendar_query', 'calendar_propose_action'], { ...route, domains: ['calendar'], intent: 'proposal' }).tools)
      .toEqual(['calendar_query', 'calendar_propose_action']);
  });
  it('retains the broad authorized planner when the classifier is uncertain', () => {
    expect(selectIntentTools([...implementedTools], { certain: false, domains: ['help'], intent: 'mixed' }).tools)
      .toEqual(implementedTools);
  });
  it('keeps the latest user request intact and marks bounded context as truncated', () => {
    const messages = [
      { role: 'user' as const, text: 'Old irrelevant turn' },
      { role: 'assistant' as const, text: 'x'.repeat(2400) },
      { role: 'user' as const, text: 'Current page reference (untrusted)' },
      { role: 'assistant' as const, text: 'Matching leads' },
      { role: 'user' as const, text: 'Assign those to me' },
    ];
    const routed = intentRoutingMessages(messages)!;
    expect(routed).toHaveLength(4);
    expect(routed.at(-1)).toEqual(messages.at(-1));
    expect(routed[0].role).toBe('assistant');
    expect(routed[0].text).toContain('[Context truncated; use uncertain if needed.]');
    expect(routed[0].text.length).toBeLessThan(1300);
    expect(intentRoutingMessages([{ role: 'user', text: 'x'.repeat(2001) }])).toBeUndefined();
    expect(intentRoutingMessages([])).toBeUndefined();
    expect(intentRoutingMessages([{ role: 'assistant', text: 'Earlier answer' }])).toBeUndefined();
  });
});
