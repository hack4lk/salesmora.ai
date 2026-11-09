'use client';

import { useEffect, useRef, useState } from 'react';
import { fieldClasses, FormFeedback, SeafoamOutlineButton } from '@salesmora/ui';
import type { TeamReportExportInput, TeamReportExportPreview, TeamReportQuery, TeamReportReadResult } from '@salesmora/contracts';
import { ReportCsvReviewDialog, type ReportCsvReviewState } from '../report-csv-review-dialog/report-csv-review-dialog';
import { teamExportDatasetsForView, teamExportFilename, teamExportInput, teamExportLabels, TeamCSVChangedError,
  TeamCSVDeniedError, loadTeamCSVPreview, receiveTeamCSV, saveTeamCSV } from './team-export.client';

export function TeamExport({ request, authority, onClose, onReload }: {
  request: TeamReportQuery; authority: TeamReportReadResult; onClose: () => void; onReload: () => void;
}) {
  const [dataset, setDataset] = useState<TeamReportExportInput['dataset']>('summary');
  const [retry, setRetry] = useState(0), [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [resolved, setResolved] = useState<{ key: string; state: ReportCsvReviewState; denied: boolean; metadata?: TeamReportExportPreview }>({
    key: '', state: { kind: 'loading' }, denied: false,
  });
  const review = useRef<{ id: string; preview: TeamReportExportPreview } | undefined>(undefined);
  const operation = useRef<AbortController | undefined>(undefined), active = useRef(true);
  const scope = authority.exportScopes[request.view === 'team-leads' ? 'leads' : 'jobs'];
  const datasets = teamExportDatasetsForView(request.view, scope?.kind === 'assigned');
  const key = JSON.stringify([request, dataset, retry]);
  const current = resolved.key === key ? resolved : { state: { kind: 'loading' as const }, denied: false, metadata: undefined };
  useEffect(() => {
    active.current = true;
    return () => { active.current = false; operation.current?.abort(); };
  }, []);
  useEffect(() => {
    const abort = new AbortController(); operation.current = abort; review.current = undefined;
    void (async () => {
      try {
        const preview = await loadTeamCSVPreview(teamExportInput(request, dataset), authority,
          AbortSignal.any([abort.signal, AbortSignal.timeout(30000)]));
        if (abort.signal.aborted) return;
        const id = crypto.randomUUID(); review.current = { id, preview };
        setResolved({ key, denied: false, metadata: preview,
          state: preview.count > preview.limits.rows ? { kind: 'limit' } : { kind: 'ready', preview: {
            id, reportLabel: 'Team', viewLabel: teamExportLabels[dataset], periodLabel: 'As of now',
            dateBasisLabel: 'Current workload', timezone: preview.timezone,
            filtersLabel: `Members: ${request.filters.members.length || 'all authorized'}`,
            scopeLabel: `${preview.scope.kind}; archived records ${preview.archiveVisibility}`,
            filename: teamExportFilename(preview.input, preview.today), expectedRows: preview.count,
          } } });
      } catch (failure) {
        if (abort.signal.aborted) return;
        setResolved({ key, denied: failure instanceof TeamCSVDeniedError,
          state: { kind: failure instanceof TeamCSVChangedError ? 'changed' : 'error' } });
        setError(failure instanceof Error ? failure.message : 'Team CSV preview could not be loaded.');
      }
    })();
    return () => abort.abort();
  }, [request, authority, dataset, key]);
  const download = async (id: string) => {
    const selected = review.current;
    if (pending || current.denied || !selected || selected.id !== id) throw new Error('Refresh the Team CSV review.');
    const abort = new AbortController(); operation.current = abort;
    const signal = AbortSignal.any([abort.signal, AbortSignal.timeout(selected.preview.limits.durationMs)]);
    setPending(true); setError(undefined);
    try {
      const blob = await receiveTeamCSV(selected.preview, signal);
      if (!active.current || signal.aborted || review.current !== selected) throw new Error('CSV download cancelled.');
      saveTeamCSV(blob, teamExportFilename(selected.preview.input, selected.preview.today)); onClose();
    } catch (failure) {
      if (active.current) {
        if (failure instanceof TeamCSVChangedError || failure instanceof TeamCSVDeniedError) {
          review.current = undefined;
          setResolved({ key, denied: failure instanceof TeamCSVDeniedError,
            state: { kind: failure instanceof TeamCSVChangedError ? 'changed' : 'error' } });
        }
        setError(abort.signal.aborted ? 'CSV download cancelled. No file was saved.'
          : failure instanceof Error ? failure.message : 'Team CSV could not be completed.');
      }
      throw failure;
    } finally { if (active.current) setPending(false); }
  };
  return <ReportCsvReviewDialog open canExport={!!scope && !current.denied} state={current.state}
    pending={pending} allowEmpty rowLimit={current.metadata?.limits.rows} technicalLimits={current.metadata?.limits}
    onClose={onClose} onDownload={download} onRefresh={() => {
      review.current = undefined; setError(undefined); setRetry(value => value + 1);
    }}>
    <label className="grid min-w-0 gap-2 text-sm font-semibold">CSV dataset
      <select className={`${fieldClasses} min-h-11 w-full min-w-0 rounded-xl border border-line bg-paper px-3 text-base`}
        value={dataset} disabled={pending} onChange={event => {
          const next = datasets.find(value => value === event.target.value);
          if (!next) throw new Error('Invalid Team CSV dataset.');
          if (next === dataset) return;
          review.current = undefined; setError(undefined); setDataset(next);
        }}>
        {datasets.map(value => <option key={value} value={value}>{teamExportLabels[value]}</option>)}
      </select>
    </label>
    {error && <FormFeedback kind="error" message={error} />}
    {(current.denied || current.state.kind === 'changed') && <SeafoamOutlineButton label="Reload report access"
      disabled={pending} onClick={() => { onClose(); onReload(); }} />}
    <p className="m-0 text-sm text-muted">Team workload is a current snapshot. Primary and supporting participation
      overlap and are not hours or performance scores. Export access may cover fewer records than this report.</p>
    {current.metadata && <p className="m-0 text-sm text-muted">Snapshot: {current.metadata.asOf}.
      {current.metadata.inactivityCutoff && ` Inactivity cutoff: ${current.metadata.inactivityCutoff}.`} {current.metadata.coverage}</p>}
    {pending && <SeafoamOutlineButton label="Cancel download" onClick={() => operation.current?.abort()} />}
  </ReportCsvReviewDialog>;
}
