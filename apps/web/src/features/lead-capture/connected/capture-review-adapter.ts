import type { CaptureDetailView, CaptureReadinessCode } from '@salesmora/contracts';
import type { CaptureSetupReviewDraft, CaptureReviewCheck } from '../capture-setup-review/capture-setup-review.validation';
import { captureConfigurationRows } from './capture-adapters';
import { captureConnectedData as copy } from './capture-connected.data';
/** Display the authoritative checks only when they still bind this saved source/draft. */
export function captureReviewFrom(view: CaptureDetailView, authoritative = view.publicationReview): CaptureSetupReviewDraft {
  const { source, draft } = view.detail;
  const current = authoritative?.sourceId === source.id && authoritative.sourceVersion === source.version && authoritative.draftVersion === draft?.version ? authoritative : undefined;
  const groups: { id: CaptureReviewCheck; codes: CaptureReadinessCode[] }[] = [
    { id: 'source', codes: ['configuration','delivery','pending','workspace'] }, { id: 'fields', codes: ['fields'] }, { id: 'workflow', codes: ['workflow'] }, { id: 'access', codes: ['access','permission'] }, { id: 'capacity', codes: ['capacity'] }, ...(source.type === 'gmail' ? [{ id: 'account' as const, codes: ['account' as const] }, { id: 'sample' as const, codes: ['sample' as const] }] : []),
  ];
  const rows = draft ? captureConfigurationRows(draft.configuration, view.business) : [];
  return { id: draft?.id ?? source.id, version: draft?.version ?? source.version, name: source.name, source: source.type, timezone: view.business.timezone,
    sections: [{ id: 'source', rows: [{ label: copy.name, value: source.name }, { label: copy.type, value: source.type === 'website' ? copy.website : copy.gmail }] }, { id: 'fields', rows: rows.filter(row => row.label === copy.fields) }, { id: 'workflow', rows: rows.slice(2) }],
    checks: groups.map(group => {
      if (!current) return { id: group.id, status: 'checking' as const, detail: copy.reviewUnavailable };
      const failed = group.codes.filter(code => !current.checks.find(check => check.code === code)?.ready);
      return { id: group.id, status: failed.length ? 'blocked' as const : 'ready' as const, detail: failed.length ? failed.map(code => copy.readiness[code]).join(' ') : group.id === 'capacity' ? copy.capacityUsage(current.used,current.limit) : undefined };
    }),
  };
}
