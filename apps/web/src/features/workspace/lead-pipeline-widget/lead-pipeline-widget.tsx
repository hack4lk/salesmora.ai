'use client';
import { useId } from 'react';
import { ArrowForwardOutlined } from '@salesmora/ui';
import type { LeadInput } from '@salesmora/contracts';
import { leadPipelineWidgetData as copy } from './lead-pipeline-widget.data';
export type LeadPipelineCounts = Record<LeadInput['stage'], number>;
export interface LeadPipelineWidgetProps {
  counts: LeadPipelineCounts;
  /** Supply only when the real pipeline destination is available. */
  onViewPipeline?: () => void;
  pipelineHref?: string;
}
/** The owning page supplies authorized counts; bars show each stage's share of the total. */
export function LeadPipelineWidget({ counts, onViewPipeline, pipelineHref }: LeadPipelineWidgetProps) {
  const id = useId();
  const total = copy.stages.reduce((sum, stage) => sum + counts[stage.id], 0);
  return <section aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} className="grid min-w-0 gap-6 rounded-2xl border border-line bg-paper p-6 sm:p-8">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0"><h2 id={`${id}-title`} className="m-0 text-lg font-semibold text-ink">{copy.title}</h2><p id={`${id}-description`} className="mb-0 mt-1 text-sm leading-6 text-muted">{copy.description}</p></div>
      {pipelineHref ? <a href={pipelineHref} className="inline-flex min-h-11 items-center gap-2 rounded-xl text-sm font-semibold text-primary hover:text-primary-dark focus-visible:focus-ring">{copy.action}<ArrowForwardOutlined aria-hidden="true" className="size-4"/></a> : <button type="button" disabled={!onViewPipeline} onClick={onViewPipeline} className="inline-flex min-h-11 flex-wrap items-center gap-2 rounded-xl text-sm font-semibold text-primary hover:text-primary-dark focus-visible:focus-ring disabled:cursor-not-allowed disabled:text-muted">
        <span>{copy.action}</span>{onViewPipeline ? <ArrowForwardOutlined aria-hidden="true" className="size-4" /> : <span className="text-xs font-normal">{copy.unavailable}</span>}
      </button>}
    </header>
    <p className="m-0 text-sm font-semibold text-ink">{copy.total(total)}</p>
    {total === 0 && <p className="m-0 text-sm leading-6 text-muted">{copy.empty}</p>}
    <ul className="m-0 grid list-none gap-4 p-0">
      {copy.stages.map(stage => <li key={stage.id} className="grid min-w-0 grid-cols-2 items-center gap-2 sm:flex sm:gap-4">
        <span className="order-1 text-sm text-ink sm:w-28 sm:shrink-0">{stage.label}</span>
        <svg role="meter" aria-label={stage.label} aria-valuemin={0} aria-valuemax={Math.max(total, 1)} aria-valuenow={counts[stage.id]} aria-valuetext={copy.stageValue(counts[stage.id], total)} viewBox="0 0 100 1" preserveAspectRatio="none" className="order-3 col-span-2 block h-2 w-full min-w-0 overflow-hidden rounded-full bg-line sm:order-2 sm:flex-1">
          {/* SVG width represents the data ratio, rather than a CSS sizing override. */}
          <rect width={total ? counts[stage.id] / total * 100 : 0} height={1} className="fill-primary" />
        </svg>
        <span aria-hidden="true" className="order-2 text-right text-sm text-muted tabular-nums sm:order-3 sm:min-w-16 sm:shrink-0">{copy.count(counts[stage.id])}</span>
      </li>)}
    </ul>
  </section>;
}
