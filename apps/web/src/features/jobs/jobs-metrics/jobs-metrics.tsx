import { MetricCard } from '@salesmora/ui';
import { copy } from './jobs-metrics.data';

const metricKeys = ['active', 'overdue', 'waiting', 'unassigned'] as const;

type JobsMetricsProps = Record<(typeof metricKeys)[number], number> & {
  state?: 'ready' | 'loading' | 'error';
};

export function JobsMetrics({ state = 'ready', ...counts }: JobsMetricsProps) {
  return (
    <div className="@container min-w-0">
      <div className="grid min-w-0 gap-3 @lg:grid-cols-2 @5xl:grid-cols-4">
        {metricKeys.map((key, index) => (
          <MetricCard
            key={key}
            labelPosition="left"
            state={state}
            label={copy[key]}
            value={counts[key]}
            description={copy.descriptions[index]}
          />
        ))}
      </div>
    </div>
  );
}
