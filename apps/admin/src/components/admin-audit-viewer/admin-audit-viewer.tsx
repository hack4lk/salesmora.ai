'use client';

import { useRef, useState, type ReactNode } from 'react';
import { auditCategorySchema, type AuditFilters, type StaffRoleId } from '@salesmora/contracts';
import { BrandProvider, FilterBar, FormFeedback, SideDrawer, TextField } from '@salesmora/ui';
import { adminAuditViewerData as copy, type AuditChainPreview, type AuditEventPreview } from './admin-audit-viewer.data';

export interface AdminAuditViewerViewProps {
  events: readonly AuditEventPreview[];
  reviewerRole?: StaffRoleId;
  now: string;
  initialQuery?: string;
  initialChain?: AuditChainPreview;
  loading?: boolean;
  error?: string;
  onRetry?: () => Promise<void>;
  onVerify: () => Promise<AuditChainPreview>;
  preview?: boolean;
  onExport?: (filters: AuditFilters) => void;
  exportLoading?: boolean;
  archiveHealth?: ReactNode;
  remote?: {
    filters: AuditFilters;
    total: number;
    page: number;
    actors: readonly { id: string; name: string }[];
    onChange: (filters: AuditFilters) => void;
    onRefresh: () => void;
  };
}

const button = 'min-h-11 cursor-pointer rounded-xl border border-line px-4 py-2 text-sm font-semibold focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';
const select = 'min-h-11 min-w-0 max-w-full rounded-xl border border-line bg-paper px-3 text-ink focus-visible:focus-ring';
const cell = 'border-b border-line p-4 text-left align-top text-sm';
const date = (value: string) => new Date(value).toISOString().replace('T', ' ').replace('.000Z', ' UTC');

export function AdminAuditViewerView({ events, reviewerRole = 'super_admin', now, initialQuery = '', initialChain = { state: 'unchecked' },
  loading = false, error, onRetry, onVerify, preview = true, remote, onExport, exportLoading = false, archiveHealth }: AdminAuditViewerViewProps) {
  const [localFilters, setLocalFilters] = useState<AuditFilters>({ query: initialQuery, actor: '', category: 'all', range: 'week', page: 0 });
  const { query, actor, category, range, page } = remote?.filters ?? localFilters;
  function change(patch: Partial<AuditFilters>) {
    const next = { ...(remote?.filters ?? localFilters), page: 0, ...patch };
    if (remote) remote.onChange(next);
    else setLocalFilters(next);
  }
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chain, setChain] = useState(initialChain);
  const [verifying, setVerifying] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState('');
  const verificationInFlight = useRef(false);
  const retryInFlight = useRef(false);

  if (reviewerRole !== 'super_admin') return <BrandProvider>
    <h1 id="admin-title">{copy.deniedTitle}</h1><FormFeedback kind="error" message={preview ? copy.denied : copy.liveDenied} />
  </BrandProvider>;

  const nowMs = Date.parse(now);
  const start = range === 'today' ? Date.parse(`${now.slice(0, 10)}T00:00:00Z`)
    : nowMs - (range === 'week' ? 7 : range === 'month' ? 30 : 365) * 86400000;
  const needle = query.trim().toLowerCase();
  const filtered = events.filter(event => {
    const timestamp = Date.parse(event.occurredAt);
    return timestamp >= start && timestamp <= nowMs && (!actor || (event.actorId ?? 'system') === actor) &&
      (category === 'all' || event.category === category) &&
      (!needle || [event.id, event.action, event.actorId, event.actorName, event.targetId, event.targetType, event.workspaceId, event.requestId, event.reason]
        .some(value => value?.toLowerCase().includes(needle)));
  }).sort((left, right) => Date.parse(right.occurredAt) - Date.parse(left.occurredAt));
  const actors = remote ? remote.actors.map(actor => [actor.id, actor.name] as const)
    : [...new Map(events.map(event => [event.actorId ?? 'system', event.actorName])).entries()];
  const pageSize = 5;
  const total = remote?.total ?? filtered.length;
  const currentPage = remote?.page ?? Math.min(page, Math.max(0, Math.ceil(total / pageSize) - 1));
  const visible = remote ? events : filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const selected = loading || error ? undefined : events.find(event => event.id === selectedId);
  const filters = [
    ...(query ? [{ id: 'query', label: `${copy.search}: ${query}` }] : []),
    ...(actor ? [{ id: 'actor', label: `${copy.actor}: ${actors.find(([id]) => id === actor)?.[1]}` }] : []),
    ...(category !== 'all' ? [{ id: 'category', label: `${copy.category}: ${copy.categories[category]}` }] : []),
    ...(range !== 'week' ? [{ id: 'range', label: copy.ranges[range] }] : []),
  ];
  const details = (event: AuditEventPreview) => [
    [copy.eventId, event.id], [copy.sequence, event.sequence], [copy.columns.time, date(event.occurredAt)],
    [copy.columns.actor, `${event.actorName}${event.actorId ? ` (${event.actorId})` : ''}`],
    [copy.role, copy.actorRoles[event.actorRole]], [copy.target, `${event.targetType}: ${event.targetId}`],
    [copy.workspace, event.workspaceId ?? copy.notRecorded], [copy.requestId, event.requestId],
    [copy.ip, event.ipAddress ?? copy.notRecorded], [copy.userAgent, event.userAgent ?? copy.notRecorded],
    [copy.columns.reason, event.reason ?? copy.noReason],
  ];

  return <BrandProvider><div className="grid min-w-0 gap-5 text-ink">
    <header><p className="text-sm font-semibold text-muted">{copy.eyebrow}</p>
      <h1 id="admin-title">{copy.title}</h1><p>{copy.description}</p></header>
    <p role="note" className="m-0 rounded-xl border border-line bg-canvas p-4 text-sm leading-6">{preview ? copy.previewNotice : copy.liveNotice}</p>
    {remote && <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="m-0 text-sm">{copy.snapshot}: {date(now)}</p>
      <button type="button" className={button} disabled={loading} onClick={remote.onRefresh}>{copy.refresh}</button>
    </div>}
    <section aria-label={copy.chainTitle} className="grid min-w-0 gap-3 rounded-xl border border-line p-4">
      <h2 className="m-0 text-lg font-semibold">{copy.chainTitle}</h2>
      <div role={chain.state === 'broken' || chain.state === 'error' ? 'alert' : 'status'} aria-live="polite">
        {verifying ? preview ? copy.verifying : copy.liveVerifying : chain.state === 'unchecked' ? preview ? copy.unchecked : copy.liveUnchecked : chain.state === 'error' ? chain.message : <>
          <strong>{chain.state === 'intact' ? preview ? copy.intact : copy.liveIntact : preview ? copy.broken : copy.liveBroken}</strong>
          <p className="mb-0 mt-2 text-sm">{copy.checked}: {chain.checked} · {chain.state === 'intact'
            ? `${copy.checkedAt}: ${date(chain.checkedAt)}` : `${copy.brokenSequence}: ${chain.sequence}`}</p>
          {chain.throughSequence && <p className="text-sm">{copy.throughSequence}: {chain.throughSequence}</p>}
          {chain.state === 'broken' && <p className="text-sm">{preview ? copy.brokenHint : copy.liveBrokenHint}</p>}
        </>}
      </div>
      <p className="m-0 text-sm leading-6 text-muted">{preview ? copy.chainScope : copy.liveChainScope}</p>
      <button type="button" className={`${button} justify-self-start`} disabled={verifying} onClick={async () => {
        if (verificationInFlight.current) return;
        verificationInFlight.current = true;
        setVerifying(true);
        try { setChain(await onVerify()); }
        catch (failure) { setChain({ state: 'error', message: failure instanceof Error ? failure.message : copy.verificationFailed }); }
        finally { verificationInFlight.current = false; setVerifying(false); }
      }}>{verifying ? preview ? copy.verifying : copy.liveVerifying : preview ? copy.verify : copy.liveVerify}</button>
    </section>
    {archiveHealth}
    <FilterBar title={copy.filters} disabled={loading && !remote} activeFilters={filters} onClearAll={() => {
      change({ query: '', actor: '', category: 'all', range: 'week' });
    }} onRemove={id => {
      if (id === 'query') change({ query: '' });
      if (id === 'actor') change({ actor: '' });
      if (id === 'category') change({ category: 'all' });
      if (id === 'range') change({ range: 'week' });
    }}>
      <div className="min-w-0 flex-1 basis-full"><TextField label={copy.search} placeholder={copy.searchHint} value={query}
        onChange={event => change({ query: event.target.value })} /></div>
      <label className="grid min-w-0 gap-2 text-sm font-semibold">{copy.actor}<select className={select} value={actor} onChange={event => change({ actor: event.target.value })}>
        <option value="">{copy.allActors}</option>{actors.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
      </select></label>
      <label className="grid min-w-0 gap-2 text-sm font-semibold">{copy.category}<select className={select} value={category} onChange={event => change({ category: auditCategorySchema.parse(event.target.value) })}>
        {Object.entries(copy.categories).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
      </select></label>
      <label className="grid min-w-0 gap-2 text-sm font-semibold">{copy.range}<select className={select} value={range} onChange={event => {
        const value = event.target.value;
        if (value === 'today' || value === 'week' || value === 'month' || value === 'year') change({ range: value });
      }}>{Object.entries(copy.ranges).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
    </FilterBar>
    <p className="m-0 text-sm text-muted">{copy.dateHint}</p>
    <div><button type="button" className={button} disabled={!onExport || loading || Boolean(error) || !total || exportLoading}
      onClick={() => onExport?.(remote?.filters ?? localFilters)} aria-describedby="audit-export-hint">{copy.export}</button>
      <p id="audit-export-hint" className="mb-0 mt-2 text-sm leading-6 text-muted">{onExport ? copy.liveExportHint : copy.exportHint}</p></div>
    {loading ? <p role="status">{copy.loading}</p> : error ? <div className="grid gap-3">
      <FormFeedback kind="error" message={retryError || error} />
      {onRetry && <button type="button" className={`${button} justify-self-start`} disabled={retrying} onClick={async () => {
        if (retryInFlight.current) return;
        retryInFlight.current = true; setRetrying(true); setRetryError('');
        try { await onRetry(); } catch (failure) { setRetryError(failure instanceof Error ? failure.message : copy.loadFailed); }
        finally { retryInFlight.current = false; setRetrying(false); }
      }}>{preview ? copy.retry : copy.liveRetry}</button>}
    </div> : <>
      <div className="relative min-w-0 overflow-x-auto rounded-xl border border-line" role="region" aria-label={copy.table} tabIndex={0}>
        <table className="w-full min-w-3xl table-fixed border-collapse">
          <caption className="sr-only">{copy.table}</caption>
          <thead><tr>{Object.entries(copy.columns).map(([id, label]) => <th key={id} scope="col" className={`${cell} bg-canvas font-semibold`}>{label}</th>)}</tr></thead>
          <tbody>{visible.map(event => <tr key={event.id}>
              <td className={cell}><time dateTime={event.occurredAt}>{date(event.occurredAt)}</time></td>
              <td className={cell}>{event.actorName}<span className="block text-muted">{copy.actorRoles[event.actorRole]}</span></td>
              <td className={`${cell} wrap-anywhere`}><strong>{event.action}</strong><span className="block text-muted">{event.targetId}</span></td>
              <td className={cell}>{event.reason ?? copy.noReason}</td>
              <td className={cell}><button type="button" className={button} aria-haspopup="dialog"
                aria-label={`${copy.show}: ${event.id}`} onClick={() => setSelectedId(event.id)}>{copy.show}</button></td>
            </tr>)}
          {!visible.length && <tr><td colSpan={5} className="p-6 text-sm">{copy.empty}</td></tr>}</tbody>
        </table>
      </div>
      <nav aria-label={copy.pagination} className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="m-0 text-sm">{copy.results(total ? currentPage * pageSize + 1 : 0, Math.min((currentPage + 1) * pageSize, total), total)}</p>
        <div className="flex gap-3"><button type="button" className={button} disabled={currentPage === 0} onClick={() => change({ page: currentPage - 1 })}>{copy.previous}</button>
          <button type="button" className={button} disabled={(currentPage + 1) * pageSize >= total} onClick={() => change({ page: currentPage + 1 })}>{copy.next}</button></div>
      </nav>
    </>}
    {selected && <SideDrawer open title={copy.detail} description={selected.action} onClose={() => setSelectedId(null)}>
      <section aria-label={`${copy.detail}: ${selected.id}`} className="grid min-w-0 gap-5">
        <dl className="m-0 grid gap-3">{details(selected).map(([label, value]) => <div key={label} className="min-w-0">
          <dt className="text-sm font-semibold">{label}</dt><dd className="m-0 text-sm wrap-anywhere">{value}</dd></div>)}</dl>
        <button type="button" className={`${button} justify-self-start`} onClick={() => { change({ query: selected.targetId }); setSelectedId(null); }}>{copy.onlyTarget}</button>
        {([[copy.before, selected.before], [copy.after, selected.after]] as const).map(([label, value]) => value && <div key={label}>
          <h3 className="text-base font-semibold">{label}</h3><pre className="m-0 whitespace-pre-wrap text-sm wrap-anywhere">{JSON.stringify(value, null, 2)}</pre></div>)}
        <dl className="m-0 grid gap-3">{[[copy.prevHash, selected.prevHash ?? copy.genesis], [copy.hash, selected.hash]].map(([label, value]) => <div key={label}>
          <dt className="text-sm font-semibold">{label}</dt><dd className="m-0 font-mono text-sm break-all">{value}</dd></div>)}</dl>
        <p className="m-0 text-sm text-muted">{copy.hashHint}</p>
      </section>
    </SideDrawer>}
  </div></BrandProvider>;
}
