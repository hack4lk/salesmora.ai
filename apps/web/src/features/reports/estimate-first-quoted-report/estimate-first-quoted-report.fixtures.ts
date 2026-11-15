import { estimateDecisionFamilies, type EstimateDecisionFixtureFamily } from '../estimate-decisions-report/estimate-decisions-report.fixtures';
import type { EstimateFirstQuotedResult, EstimateFirstQuotedRow } from './estimate-first-quoted-report.validation';

export type EstimateIssuanceFixtureFamily = EstimateDecisionFixtureFamily & {
  /** Persisted fixture issuance events; a resend is never an initial issuance. */
  events: readonly { revision: number; date: string; via: 'send' | 'publish'; initial: boolean }[];
};
export const estimateIssuanceFamilies: readonly EstimateIssuanceFixtureFamily[] = estimateDecisionFamilies.map(family => ({
  ...family, events: [
    ...family.revisions.flatMap(revision => revision.issuedDate === undefined ? [] : [{
      revision: revision.revision, date: revision.issuedDate, via: family.number === 'E4' ? 'publish' as const : 'send' as const, initial: true,
    }]),
    ...(family.number === 'E1' ? [{ revision: 1, date: '2026-10-05', via: 'send' as const, initial: false }] : []),
  ],
}));

/** Mock authorized host history only; select earliest initial event before applying the period. */
export function estimateFirstQuotedResponse(families: readonly EstimateIssuanceFixtureFamily[] = estimateIssuanceFamilies,
  page = 1, pageSize = 25, from = '2026-10-01', to = '2026-10-31'): EstimateFirstQuotedResult {
  const rows: EstimateFirstQuotedRow[] = [];
  for (const family of families) {
    const first = family.events.filter(event => event.initial).sort((a, b) => a.date.localeCompare(b.date) || a.revision - b.revision)[0];
    if (!first || first.date < from || first.date > to) continue;
    const issued = family.revisions.filter(revision => revision.issuedDate !== undefined).sort((a, b) => b.revision - a.revision)[0];
    if (!issued || !issued.issuedDate) throw new Error('Mock first issuance has no surviving issued revision context.');
    const decision = [...issued.decisions].sort((a, b) => b.version - a.version)[0];
    rows.push({ familyId: family.id, estimateNumber: family.number, label: `${family.number} / first quoted family`,
      recordId: `${family.id}:r${issued.revision}`, firstIssuedDate: first.date, firstIssuedRevision: first.revision, firstIssuedVia: first.via,
      currentIssuedDate: issued.issuedDate, currentIssuedRevision: issued.revision,
      currentStatus: issued.voided ? 'void' : decision ? decision.outcome : family.number === 'E4' ? 'published' : 'sent',
      archived: issued.archived ?? false });
  }
  return { from, to, today: '2026-11-05', periodLabel: `${from} to ${to}, both dates included`,
    snapshotLabel: 'Nov 5, 2026 at 10:00 / Europe/Warsaw', scopeLabel: 'Currently authorized workspace-qualified families and persisted initial issuance history.',
    total: rows.length, coverage: { kind: 'complete' }, evidenceId: 'first-quoted',
    rows: rows.slice((page - 1) * pageSize, page * pageSize), page, pageSize };
}
