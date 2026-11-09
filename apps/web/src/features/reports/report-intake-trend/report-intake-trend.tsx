'use client';

import { FormFeedback } from '@salesmora/ui';
import { ReportBreakdown } from '../report-breakdown/report-breakdown';
import { formatReportDate } from '../report-date-controls/report-date-controls.validation';
import { intakeTrendSpans, validIntakeTrend, type IntakeTrendBucket, type IntakeTrendRange } from './report-intake-trend.validation';

export type ReportIntakeTrendProps = {
  range: IntakeTrendRange;
  buckets: readonly IntakeTrendBucket[];
  total: number;
  canRead: boolean;
  pending?: boolean;
  onEvidence: (evidenceId: string) => void;
};
export function ReportIntakeTrend({ range, buckets, total, canRead, pending = false, onEvidence }: ReportIntakeTrendProps) {
  if (!canRead) return <FormFeedback kind="error" message="Your current access does not allow this intake trend." />;
  const expected = intakeTrendSpans(range);
  if (!expected || !validIntakeTrend(range, total, buckets)) return <FormFeedback kind="error" message="Intake trend dates or counts are inconsistent. Retry the report." />;
  const intervalLabel = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' }[expected.interval];
  return <ReportBreakdown groupLabel={`Intake trend / ${intervalLabel}`} total={total} canRead pending={pending} onEvidence={onEvidence}
    contextLabel="Lead creation dates in the reporting timezone. Chronological buckets include zeros; weekly buckets run Monday-Sunday. First and last buckets are clipped to the selected dates."
    groups={buckets.map(bucket => ({
      id: bucket.from, count: bucket.count, evidenceId: bucket.evidenceId,
      label: `${formatReportDate(bucket.from)}${bucket.to === bucket.from ? '' : ` to ${formatReportDate(bucket.to)}`}`,
    }))} />;
}
