import type { ReactNode } from 'react';

export type ReportDashboardLayoutProps = {
  dashboard?: boolean;
  summary: ReactNode;
  children: ReactNode;
};

/** Opt-in layout only; standalone slices retain their original summary-first order. */
export function ReportDashboardLayout({ dashboard = false, summary, children }: ReportDashboardLayoutProps) {
  if (!dashboard) return <>{summary}{children}</>;
  return <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
    <div className="grid min-w-0 gap-6">{children}</div>
    <div className="grid min-w-0 gap-4">{summary}</div>
  </div>;
}
