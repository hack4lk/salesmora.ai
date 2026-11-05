'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { auditFiltersSchema, auditPageSchema, auditVerificationSchema, type AuditExportSnapshot, type AuditFilters, type AuditPage } from '@salesmora/contracts';
import { BrandProvider, FormFeedback } from '@salesmora/ui';
import { AdminAuditViewerView } from './admin-audit-viewer';
import { adminAuditViewerData as copy } from './admin-audit-viewer-copy.data';
import { AdminAuditExport, auditExportMethodsSchema, auditExportRequest, AuditExportRequestError } from '../admin-audit-export-review/admin-audit-export';
import { adminAuditExportData as exportCopy } from '../admin-audit-export-review/admin-audit-export-copy.data';

class AuditRequestError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function request(url: string, options: RequestInit = {}) {
  let response: Response;
  try { response = await fetch(url, { credentials: 'same-origin', cache: 'no-store', ...options }); }
  catch (error) {
    if (options.signal?.aborted) throw error;
    throw new AuditRequestError(copy.failed, 0);
  }
  let result: unknown;
  try { result = await response.json(); } catch { throw new AuditRequestError(copy.invalid, response.status); }
  if (!response.ok) {
    const message = result && typeof result === 'object' && 'error' in result && typeof result.error === 'string' ? result.error : copy.failed;
    throw new AuditRequestError(message, response.status);
  }
  return result;
}

export function AdminAuditViewerPage({ initialPage, archiveHealth }: { initialPage: AuditPage; archiveHealth?: ReactNode }) {
  const [data, setData] = useState(initialPage);
  const [filters, setFilters] = useState<AuditFilters>(auditFiltersSchema.parse({}));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [linkError, setLinkError] = useState('');
  const [denied, setDenied] = useState(false);
  const [revision, setRevision] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const snapshot = useRef<{ asOf?: string; throughSequence?: string }>({ asOf: initialPage.asOf, throughSequence: initialPage.throughSequence });
  const firstRead = useRef(true);
  const accessInvalidated = useRef(false);
  const [exportReview, setExportReview] = useState<{ snapshot: AuditExportSnapshot; methods: ('passkey' | 'totp')[] } | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<{ message: string; success: boolean } | null>(null);
  const exportRequestInFlight = useRef(false);
  const readVersion = useRef(0);

  useEffect(() => {
    const readHash = () => {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const queries = params.getAll('q');
      const parsed = auditFiltersSchema.safeParse({ query: queries[0] ?? '' });
      readVersion.current++;
      setInitialized(true);
      if (queries.length > 1 || !parsed.success) { setLinkError(copy.invalidLink); return; }
      setLinkError('');
      if (parsed.data.query || !firstRead.current) setLoading(true);
      setFilters(current => ({ ...current, query: parsed.data.query, page: 0 }));
    };
    const timer = setTimeout(readHash, 0);
    window.addEventListener('hashchange', readHash);
    return () => { clearTimeout(timer); window.removeEventListener('hashchange', readHash); };
  }, []);

  useEffect(() => {
    if (!initialized) return;
    if (firstRead.current && filters.query === '' && filters.actor === '' && filters.category === 'all' && filters.range === 'week' && filters.page === 0 && revision === 0) {
      firstRead.current = false;
      return;
    }
    firstRead.current = false;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const params = new URLSearchParams({ ...filters, page: String(filters.page) });
      if (snapshot.current.asOf) params.set('asOf', snapshot.current.asOf);
      if (snapshot.current.throughSequence) params.set('throughSequence', snapshot.current.throughSequence);
      try {
        const parsed = auditPageSchema.safeParse(await request(`/api/admin/audit?${params}`, { signal: controller.signal }));
        if (!parsed.success) throw new AuditRequestError(copy.invalid, 502);
        if (!controller.signal.aborted && !accessInvalidated.current) {
          setData(parsed.data); setError(''); setDenied(false); setLoading(false);
          snapshot.current = { asOf: parsed.data.asOf, throughSequence: parsed.data.throughSequence };
        }
      } catch (failure) {
        if (controller.signal.aborted || accessInvalidated.current) return;
        if (failure instanceof AuditRequestError && [401, 403].includes(failure.status)) accessInvalidated.current = true;
        setError(failure instanceof Error ? failure.message : copy.failed);
        setDenied(failure instanceof AuditRequestError && failure.status === 403);
        setLoading(false);
      }
    }, 250);
    return () => { controller.abort(); clearTimeout(timer); };
  }, [filters, initialized, revision]);

  function change(next: AuditFilters) {
    readVersion.current++;
    setLoading(true); setError(''); setLinkError(''); setFilters(next);
    const params = new URLSearchParams(window.location.hash.slice(1));
    if (next.query) params.set('q', next.query); else params.delete('q');
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${params.size ? `#${params}` : ''}`);
  }
  function refresh() {
    readVersion.current++;
    // Omit both anchors so the server captures a new, authoritative snapshot.
    snapshot.current = {};
    accessInvalidated.current = false;
    setLoading(true); setError(''); setFilters(current => ({ ...current, page: 0 })); setRevision(current => current + 1);
  }
  return <BrandProvider>
    {linkError && <FormFeedback kind="error" message={linkError} />}
    {exportLoading && <p role="status">{exportCopy.loading}</p>}
    {exportFeedback && <FormFeedback kind={exportFeedback.success ? 'success' : 'error'} message={exportFeedback.message} />}
    <AdminAuditViewerView preview={false} reviewerRole={denied ? 'support' : 'super_admin'}
      events={data.events} now={data.asOf} loading={loading} error={linkError || error} onRetry={async () => refresh()}
      remote={{ filters, total: data.total, page: data.page, actors: data.actors, onChange: change, onRefresh: refresh }}
      exportLoading={exportLoading} onExport={async currentFilters => {
        if (exportRequestInFlight.current || loading || error || linkError || accessInvalidated.current) return;
        exportRequestInFlight.current = true;
        setExportLoading(true); setExportFeedback(null);
        const version = readVersion.current;
        const { query, actor, category, range } = currentFilters;
        const exportFilters = { query, actor, category, range };
        const exportSnapshot = { filters: exportFilters, count: data.total, asOf: data.asOf, throughSequence: data.throughSequence };
        try {
          const parsed = auditExportMethodsSchema.safeParse(await (await auditExportRequest()).json());
          if (!parsed.success) throw new AuditExportRequestError(exportCopy.invalid, 502);
          if (!accessInvalidated.current && version === readVersion.current) setExportReview({ snapshot: exportSnapshot, methods: parsed.data.methods });
        } catch (failure) {
          if (version === readVersion.current) setExportFeedback({ message: failure instanceof Error ? failure.message : exportCopy.failed, success: false });
          if (failure instanceof AuditExportRequestError && [401, 403].includes(failure.status)) {
            accessInvalidated.current = true; setDenied(failure.status === 403); setError(failure.message); setLoading(false);
          }
        } finally { exportRequestInFlight.current = false; setExportLoading(false); }
      }}
      onVerify={async () => {
        try {
          const parsed = auditVerificationSchema.safeParse(await request('/api/admin/audit', { method: 'POST' }));
          if (!parsed.success) throw new AuditRequestError(copy.invalid, 502);
          return parsed.data;
        } catch (failure) {
          if (failure instanceof AuditRequestError && [401, 403].includes(failure.status)) {
            accessInvalidated.current = true;
            setDenied(failure.status === 403); setError(failure.message);
            setLoading(false);
          }
          throw failure;
        }
      }} archiveHealth={archiveHealth} />
    {exportReview && !denied && <AdminAuditExport snapshot={exportReview.snapshot} methods={exportReview.methods}
      onClose={() => setExportReview(null)} onFeedback={(message, success) => setExportFeedback({ message, success })}
      onAccessError={(status, message) => {
        accessInvalidated.current = true; setDenied(status === 403); setError(message); setLoading(false); setExportReview(null);
      }} />}
  </BrandProvider>;
}
