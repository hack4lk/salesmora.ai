import { describe, expect, it } from 'vitest';
import { calendarChatQuerySchema, calendarChatResultSchema } from './calendar-chat';
import { chatTurnRequestSchema } from './chat';
const id = '00000000-0000-4000-8000-000000000001';
const base = { workspaceId: id, clientTurnId: id, message: 'What is scheduled?', surfaceKey: 'calendar' };
describe('Calendar assistant contracts', () => {
  it('accepts strict read operations and no model authority, SQL or mutation', () => {
    const query = { operation: 'schedule', date: null, usePageFilters: true };
    expect(calendarChatQuerySchema.safeParse(query).success).toBe(true);
    for (const patch of [{ operation: 'reschedule' }, { role: 'owner' }, { workspaceId: id }, { sql: 'select *' }, { date: '2026-02-30' }]) expect(calendarChatQuerySchema.safeParse({ ...query, ...patch }).success).toBe(false);
  });
  it('restricts visible filters to Calendar, without labels or scope claims', () => {
    const calendarFilters = { date: '2026-10-19', person: 'me', recordType: 'all', status: 'all', customerQuery: '' };
    expect(chatTurnRequestSchema.safeParse({ ...base, calendarFilters }).success).toBe(true);
    for (const surfaceKey of ['home','leads.list']) expect(chatTurnRequestSchema.safeParse({ ...base, surfaceKey, calendarFilters }).success).toBe(false);
    for (const patch of [{ scope: 'workspace' }, { label: 'Owner' }, { date: '2026-02-30' }, { recordType: 'job', status: 'work_order:issued' }]) expect(chatTurnRequestSchema.safeParse({ ...base, calendarFilters: { ...calendarFilters, ...patch } }).success).toBe(false);
  });
  it('rejects invalid result ranges, extra fields and impossible empty totals', () => {
    const result = { id, mode: 'schedule', scope: 'own', timezone: 'America/New_York', checkedAt: '2026-10-21T14:30:00Z', from: '2026-10-19', to: '2026-10-25', filterLabels: [], total: 0, visits: [] };
    expect(calendarChatResultSchema.safeParse(result).success).toBe(true);
    for (const patch of [{ total: 1 }, { from: '2026-10-26' }, { timezone: 'Mars/Olympus' }, { rawSql: 'forged' }, { mode: 'unscheduled' }]) expect(calendarChatResultSchema.safeParse({ ...result, ...patch }).success).toBe(false);
  });
});

describe('Calendar advice contracts', () => {
  const person = { id:'viewer', name:'Fictional Viewer' };
  const result = { id, mode:'availability', scope:'own', viewerId:person.id, timezone:'America/New_York', checkedAt:'2026-10-21T14:30:00Z', from:'2026-10-19', to:'2026-10-25', people:[person], arrivalWindow:null, total:1,
    suggestions:[{ id, date:'2026-10-20', person, visitCount:0, unknownWindowCount:0, timing:'not-checked' }] };
  it('accepts advice with a bounded explicit range and rejects broad or executable input', () => {
    const query = { operation:'availability', date:'2026-10-19', to:'2026-10-25', person:'me', arrivalWindow:null, includeWeekends:false, usePageFilters:true };
    expect(calendarChatQuerySchema.safeParse(query).success).toBe(true);
    for (const patch of [{ to:'2027-01-01' },{ to:'2026-10-18' },{ date:null },{ sql:'select *' },{ role:'owner' },{ arrivalWindow:'all day' }]) expect(calendarChatQuerySchema.safeParse({ ...query,...patch }).success).toBe(false);
  });
  it('binds people, dates and timing claims to the checked set', () => {
    expect(calendarChatResultSchema.safeParse(result).success).toBe(true);
    for (const patch of [{ total:0 },{ people:[{ ...person,id:'other' }] },{ from:'2026-10-21' },{ viewerId:'someone' },{ suggestions:[{ ...result.suggestions[0],timing:'no-known-overlap' }] },{ suggestions:[{ ...result.suggestions[0],unknownWindowCount:1 }] }]) expect(calendarChatResultSchema.safeParse({ ...result,...patch }).success).toBe(false);
    expect(calendarChatResultSchema.safeParse({ ...result, arrivalWindow:'09:00-11:00', suggestions:[{ ...result.suggestions[0],visitCount:2,unknownWindowCount:2,timing:'no-known-overlap' }] }).success).toBe(false);
  });
});
