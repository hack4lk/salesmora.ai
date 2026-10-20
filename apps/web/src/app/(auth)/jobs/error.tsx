'use client';
import { JobsEmptyState } from '../../../features/jobs/jobs-empty-state/jobs-empty-state';
export default function JobsError({ reset }: { reset: () => void }) {
  return <div className="p-8"><JobsEmptyState kind="error" onRetry={reset}/></div>;
}
