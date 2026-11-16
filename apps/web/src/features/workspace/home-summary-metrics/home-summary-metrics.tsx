'use client';

import { useId } from 'react';
import { HelpTooltip, MetricCard } from '@salesmora/ui';
import { homeSummaryMetricsData as copy } from './home-summary-metrics.data';

export type HomeSummaryMetric = {
  id: keyof typeof copy.labels;
  /** Authorized scope and metric date basis, formatted by the caller. */
  description: string;
} & (
  | { state: 'ready'; value: number; href?: string }
  | { state: 'loading' }
  | { state: 'error'; onRetry: () => void; retrying?: boolean }
);

export interface HomeSummaryMetricsProps {
  /** Only readable metrics; counts represent the complete authorized set. */
  metrics: readonly HomeSummaryMetric[];
}

export function HomeSummaryMetrics({ metrics }: HomeSummaryMetricsProps) {
  const id = useId();
  if (metrics.length === 0) return null;
  const columns = metrics.length === 1 ? '' : metrics.length === 2 ? 'sm:grid-cols-2' : metrics.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4';
  return (
    <section aria-labelledby={`${id}-title`} className="min-w-0">
      <h2 id={`${id}-title`} className="sr-only">{copy.title}</h2>
      <div className={`grid min-w-0 gap-4 ${columns}`}>
        {metrics.map(metric => {
          const label = copy.labels[metric.id];
          return (
            <MetricCard
              key={metric.id}
              label={label}
              labelPosition="beside"
              labelAdornment={<HelpTooltip label={copy.about(label)} paragraphs={[metric.description]} />}
              value={metric.state === 'ready' ? metric.value : undefined}
              state={metric.state === 'error' && metric.retrying ? 'loading' : metric.state}
              headerAction={
                metric.state === 'ready' && metric.href ? (
                  <a href={metric.href} aria-label={copy.view(label)} className="inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring">
                    {copy.viewLabel}
                  </a>
                ) : metric.state === 'error' ? (
                  <button type="button" onClick={metric.onRetry} disabled={metric.retrying} aria-label={copy.retry(label)} className="inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:text-muted">
                    {copy.retryLabel}
                  </button>
                ) : undefined
              }
            />
          );
        })}
      </div>
    </section>
  );
}
