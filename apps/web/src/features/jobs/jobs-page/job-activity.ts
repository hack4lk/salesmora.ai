import type { JobActivityRecord } from '@salesmora/contracts';
import type { JobActivityEntry } from '../job-preview.types';
import { jobStatusBadgeData } from '../job-status-badge/job-status-badge.data';
import { jobsRouteData as copy } from './jobs-route.data';
/** Display saved events as text. No HTML or execution of model/user content. */
export function jobActivityView(entry: JobActivityRecord): JobActivityEntry {
  const c = entry.changes;
  const label = (value: unknown): string => typeof value === 'string'
    ? jobStatusBadgeData[value as keyof typeof jobStatusBadgeData]?.label ?? value : value == null ? 'Not set' : '';
  const dateSummary = (value: unknown) => {
    const data = value && typeof value === 'object' ? value as Record<string, unknown> : {};
    return [label(data.scheduledDate), typeof data.arrivalWindow === 'string' ? data.arrivalWindow : ''].filter(Boolean).join(' · ');
  };
  let body = '';
  if (entry.type === 'note') body = typeof c.body === 'string' ? c.body : '';
  if (entry.type === 'status') body = [label(c.from) + ' → ' + label(c.to), c.waitingReason && `Waiting: ${label(c.waitingReason)}`, c.cancellationReason && `Cancellation: ${label(c.cancellationReason)}`, c.note].filter(v => typeof v === 'string' && v).join('\n');
  if (entry.type === 'schedule') body = `${dateSummary(c.from)} → ${dateSummary(c.to)}`;
  if (entry.type === 'deadline') body = `${label(c.from)} → ${label(c.to)}`;
  const type = entry.type as keyof typeof copy.activity;
  return { id: entry.id, actor: entry.actorName, at: entry.createdAt, title: copy.activity[type] ?? 'Job updated', body,
    kind: entry.type === 'assign' ? 'assignment' : entry.type === 'deadline' || entry.type === 'schedule' ? 'schedule' : entry.type === 'note' ? 'note' : entry.type === 'created' ? 'created' : 'status' };
}
