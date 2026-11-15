'use client';

import { useId } from 'react';
import { reportAssistantResultSchema, type ReportAssistantResult } from '@salesmora/contracts';
import { formatReportDate } from '../../reports/report-date-controls/report-date-controls.validation';
import { reportAreaDefinitions } from '../../reports/report-area-catalog/report-area-catalog.definitions';
import { reportResultData as copy } from './report-result.data';

export type ReportResultProps = {
  result?: ReportAssistantResult;
  state?: 'ready' | keyof typeof copy.states;
  disabled?: boolean;
  /** The host resolves a bound result ID; model text and display labels never become URLs. */
  onOpenReport?: (resultId: string) => void;
};

/** Read-only presentation shared by standalone stories and the existing assistant panel. */
export function ReportResult({ result, state = 'ready', disabled = false, onOpenReport }: ReportResultProps) {
  const id = useId();
  const parsed = state === 'ready' ? reportAssistantResultSchema.safeParse(result) : undefined;
  const ready = parsed?.success ? parsed.data : undefined;
  const unavailable = state === 'ready' ? 'error' : state;
  const title = ready ? reportAreaDefinitions.find(area => area.id === ready.area)!.label : copy.title;
  return <section aria-labelledby={`${id}-title`} aria-busy={state === 'loading'}
    className="mt-4 min-w-0 rounded-xl border border-assistant-border bg-assistant-surface p-4 text-assistant-foreground">
    <h3 id={`${id}-title`} className="m-0 text-base font-semibold wrap-anywhere">{title}</h3>
    {!ready ? <p role="status" className="mb-0 mt-3 text-sm leading-6 text-assistant-muted">{copy.states[unavailable]}</p> : <>
      <p className="mb-0 mt-2 text-sm leading-6">
        {ready.period ? `${copy.period}: ${formatReportDate(ready.period.from)} to ${formatReportDate(ready.period.to)}` : copy.current}
      </p>
      <p className="mb-0 mt-1 text-xs leading-5 text-assistant-muted wrap-anywhere">{copy.timezone}: {ready.timezone}</p>
      {ready.filterLabels.length > 0 && <ul aria-label={copy.filters} className="mb-0 mt-3 flex list-none flex-wrap gap-2 p-0">
        {ready.filterLabels.map((label, index) => <li key={index} className="max-w-full rounded-lg border border-assistant-border px-2 py-1 text-xs wrap-anywhere">{label}</li>)}
      </ul>}
      <div className="mt-3 grid min-w-0 gap-3">
        {ready.sections.map((section, index) => <section key={section.id} role="group" aria-labelledby={`${id}-section-${index}`}
          className="min-w-0 rounded-lg border border-assistant-border bg-assistant-message p-3">
          <h4 id={`${id}-section-${index}`} className="m-0 text-sm font-semibold wrap-anywhere">{section.label}</h4>
          <p className="mb-0 mt-1 text-xs leading-5 text-assistant-muted wrap-anywhere">{section.scopeLabel}</p>
          <p className="m-0 text-xs leading-5 text-assistant-muted wrap-anywhere">{section.basisLabel}</p>
          <dl className="mb-0 mt-2 grid min-w-0 gap-2">
            {section.metrics.map(metric => <div key={metric.id} className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
              <dt className="min-w-0 flex-1 basis-40 text-sm wrap-anywhere">{metric.label}</dt>
              <dd className="m-0 min-w-0 max-w-full text-sm font-semibold wrap-anywhere">
                {metric.value.kind === 'count' ? metric.value.value.toLocaleString('en-GB') :
                  metric.value.kind === 'unavailable' ? 'Unavailable' : metric.value.displayValue}
              </dd>
              {(metric.value.kind === 'unavailable' || metric.value.kind === 'incomplete') &&
                <dd className="m-0 w-full text-xs leading-5 text-assistant-muted wrap-anywhere">
                  {metric.value.kind === 'unavailable' ? metric.value.reason : metric.value.coverageLabel}
                </dd>}
            </div>)}
          </dl>
          <p className="mb-0 mt-2 text-xs leading-5 text-assistant-muted wrap-anywhere">
            {copy.captured}: <time dateTime={section.asOf}>{new Intl.DateTimeFormat('en-GB', {
              timeZone: ready.timezone, dateStyle: 'medium', timeStyle: 'short',
            }).format(new Date(section.asOf))}</time>
          </p>
        </section>)}
      </div>
      <ul aria-label={copy.coverage} className="mb-0 mt-3 grid list-disc gap-1 pl-4 text-xs leading-5 text-assistant-muted">
        {ready.coverage.map((line, index) => <li key={index} className="wrap-anywhere">{line}</li>)}
      </ul>
      {onOpenReport && <button type="button" disabled={disabled}
        onClick={() => { if (!disabled) onOpenReport(ready.id); }}
        className="mt-3 min-h-11 cursor-pointer rounded-lg border border-assistant-border px-3 py-2 text-sm font-semibold text-assistant-foreground hover:bg-assistant-header focus-visible:focus-ring focus-visible:outline-assistant-accent disabled:cursor-not-allowed disabled:text-assistant-muted">
        {copy.open}
      </button>}
      <p className="mb-0 mt-2 text-xs leading-5 text-assistant-muted">{copy.historical}</p>
    </>}
  </section>;
}
