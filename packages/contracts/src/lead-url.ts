import { leadListQuerySchema, leadStages, leadSources, type LeadListQuery } from './lead-read';
/** Browser URLs ignore invalid filters; repository inputs still use the strict schema. */
export function leadQueryFromURL(workspaceId: string, params: URLSearchParams): LeadListQuery {
  const one = (key: string, choices: readonly string[], fallback: string) => choices.includes(params.get(key) ?? '') ? params.get(key)! : fallback;
  const bounded = (key: string, fallback: number) => { const v = params.get(key); return v && /^\d{1,6}$/.test(v) && Number(v) > 0 && Number(v) <= 100000 ? Number(v) : fallback; };
  const created = one('created', ['any', '7days', '30days', 'custom'], 'any'), from = params.get('from'), to = params.get('to');
  const date = (v: string | null) => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;
  const range = created === 'custom' && date(from) && date(to) && from! <= to!;
  return leadListQuerySchema.parse({ workspaceId, view: one('view', ['list', 'pipeline'], 'pipeline'), q: (params.get('q') ?? '').trim().slice(0, 200),
    stages: [...new Set(params.getAll('stage').filter(v => (leadStages as readonly string[]).includes(v)))], sources: [...new Set(params.getAll('source').filter(v => (leadSources as readonly string[]).includes(v)))],
    ownerIds: [...new Set(params.getAll('owner').filter(v => v.length > 0 && v.length <= 200))].slice(0, 50),
    created: created === 'custom' && !range ? 'any' : created, ...(range ? { from, to } : {}), attention: params.get('attention') === 'true', archived: params.get('archived') === 'true',
    sort: one('sort', ['name', 'service', 'stage', 'source', 'owner', 'created'], 'created'), direction: one('dir', ['asc', 'desc'], 'desc'), page: bounded('page', 1),
    pageSize: [25, 50, 100].includes(Number(params.get('rows'))) ? Number(params.get('rows')) : 25,
    column: (leadStages as readonly string[]).includes(params.get('column') ?? '') ? params.get('column') : undefined, columnPage: bounded('columnPage', 1),
  });
}
export function leadQueryToURL(query: LeadListQuery) {
  const p = new URLSearchParams({ workspace: query.workspaceId });
  if (query.view !== 'pipeline') p.set('view', query.view); if (query.q) p.set('q', query.q);
  for (const v of query.stages) p.append('stage', v); for (const v of query.sources) p.append('source', v); for (const v of query.ownerIds) p.append('owner', v);
  if (query.created !== 'any') p.set('created', query.created); if (query.created === 'custom' && query.from && query.to) { p.set('from', query.from); p.set('to', query.to); }
  if (query.attention) p.set('attention', 'true'); if (query.archived) p.set('archived', 'true'); if (query.sort !== 'created') p.set('sort', query.sort); if (query.direction !== 'desc') p.set('dir', query.direction);
  if (query.page !== 1) p.set('page', String(query.page)); if (query.pageSize !== 25) p.set('rows', String(query.pageSize)); if (query.column) { p.set('column', query.column); p.set('columnPage', String(query.columnPage)); }
  return p;
}
