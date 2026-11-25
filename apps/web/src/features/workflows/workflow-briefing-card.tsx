"use client";

const sections = [
  { key: "inactiveLeads", label: "Leads with no activity for 7 days" },
  { key: "awaitingEstimates", label: "Estimates awaiting a decision" },
  { key: "unscheduledJobs", label: "Jobs needing a visit" },
  { key: "dueSoonJobs", label: "Jobs due today through the next 7 days" },
] as const;
export type WorkflowBriefingSection = typeof sections[number]["key"];
export type WorkflowBriefingCardProps = {
  generatedAt: string;
  timezone: string;
  /** Counts and links must be independently authorized before reaching this component. */
  counts: Record<WorkflowBriefingSection, number>;
  links?: Partial<Record<WorkflowBriefingSection, string>>;
  canRead?: boolean;
};

/** Canonical delivery presentation; design stories use fictional counts and no live workflow execution. */
export function WorkflowBriefingCard({ generatedAt, timezone, counts, links, canRead = false }: WorkflowBriefingCardProps) {
  let timestamp: string | undefined;
  try {
    if (Number.isFinite(Date.parse(generatedAt))) timestamp = new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium", timeStyle: "short", timeZone: timezone,
    }).format(new Date(generatedAt));
  } catch { /* Hide invalid snapshots instead of showing misleading dates or counts. */ }
  const available = canRead && timestamp && sections.every(({ key }) => Number.isSafeInteger(counts[key]) && counts[key] >= 0);
  return <section aria-label="Monday briefing" className="grid min-w-0 gap-4 rounded-2xl border border-line bg-paper p-5 text-ink">
    <header className="grid min-w-0 gap-1">
      <h2 className="m-0 text-lg font-semibold">Your Monday briefing</h2>
      {available && <p className="m-0 text-xs text-muted wrap-anywhere">Snapshot: <time dateTime={generatedAt}>{timestamp}</time> · {timezone}</p>}
    </header>
    {available ? <>
      <ul className="m-0 min-w-0 list-none divide-y divide-line p-0">
        {sections.map(({ key, label }) => <li key={key} className="flex min-w-0 items-center justify-between gap-4 py-2">
          <span className="min-w-0 text-sm wrap-anywhere">{label}</span>
          <span className="flex shrink-0 items-center gap-3">
            <strong className="text-lg tabular-nums">{counts[key]}</strong>
            {links?.[key] && <a href={links[key]} aria-label={`View ${label.toLowerCase()}`} className="inline-flex min-h-11 cursor-pointer items-center rounded px-2 text-sm font-semibold text-primary hover:underline focus-visible:focus-ring">View</a>}
          </span>
        </li>)}
      </ul>
      {sections.every(({ key }) => counts[key] === 0) && <p className="m-0 text-sm text-muted">No items in these four categories.</p>}
      <p className="m-0 text-xs leading-5 text-muted">Counts reflect this snapshot. Open a report for current details.</p>
    </> : <p role="status" className="m-0 text-sm text-muted">This briefing is unavailable. Your access may have changed.</p>}
  </section>;
}
