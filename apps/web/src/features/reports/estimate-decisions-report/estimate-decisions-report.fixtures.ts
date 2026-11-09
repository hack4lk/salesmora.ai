import type { EstimateDecisionOutcome, EstimateDecisionRow, EstimateDecisionsResult } from './estimate-decisions-report.validation';

type FixtureDecision = { version: number; outcome: EstimateDecisionOutcome; date: string; recordedDate: string };
type FixtureRevision = {
  revision: number;
  issuedDate?: string;
  archived?: boolean;
  voided?: boolean;
  /** Fictional host snapshot-validation outcome, not a real cryptographic hash check. */
  validSnapshot: boolean;
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  customerTotalCents: number;
  decisions: readonly FixtureDecision[];
};
export type EstimateDecisionFixtureFamily = { id: string; number: string; revisions: readonly FixtureRevision[] };
const amounts = { validSnapshot: true, subtotalCents: 10000, discountCents: 1000, taxCents: 900, customerTotalCents: 9900 };
export const estimateDecisionFamilies: readonly EstimateDecisionFixtureFamily[] = [
  { id: 'workspace-fixture:E1', number: 'E1', revisions: [
    { ...amounts, revision: 1, issuedDate: '2026-09-25', decisions: [] },
    { ...amounts, revision: 2, decisions: [] },
  ] },
  { id: 'workspace-fixture:E2', number: 'E2', revisions: [
    { ...amounts, revision: 1, issuedDate: '2026-10-02', decisions: [{ version: 1, outcome: 'declined', date: '2026-10-10', recordedDate: '2026-10-10' }] },
    { ...amounts, revision: 2, issuedDate: '2026-10-20', decisions: [{ version: 1, outcome: 'accepted', date: '2026-10-25', recordedDate: '2026-10-25' }] },
  ] },
  { id: 'workspace-fixture:E3', number: 'E3', revisions: [
    { ...amounts, revision: 1, issuedDate: '2026-10-05', archived: true, decisions: [
      { version: 1, outcome: 'accepted', date: '2026-10-12', recordedDate: '2026-10-12' },
      { version: 2, outcome: 'declined', date: '2026-10-13', recordedDate: '2026-11-02' },
    ] },
  ] },
  { id: 'workspace-fixture:E4', number: 'E4', revisions: [{ ...amounts, revision: 1, issuedDate: '2026-10-03', decisions: [] }] },
  { id: 'workspace-fixture:E5', number: 'E5', revisions: [{ ...amounts, revision: 1, issuedDate: '2026-10-04', voided: true,
    decisions: [{ version: 1, outcome: 'accepted', date: '2026-10-08', recordedDate: '2026-10-08' }] }] },
];

/** Mock host selects one currently effective issued decision per authorized family before period filtering/pagination. */
export function estimateDecisionsResponse(families: readonly EstimateDecisionFixtureFamily[] = estimateDecisionFamilies,
  selected: EstimateDecisionsResult['selected'] = 'decided', page = 1, pageSize = 25,
  from = '2026-10-01', to = '2026-10-31'): EstimateDecisionsResult {
  const rows: EstimateDecisionRow[] = [];
  for (const family of families) {
    const issued = family.revisions.filter(revision => revision.issuedDate !== undefined)
      .sort((a, b) => b.revision - a.revision)[0];
    if (!issued || issued.voided) continue;
    const decision = [...issued.decisions].sort((a, b) => b.version - a.version)[0];
    if (!decision || decision.date < from || decision.date > to) continue;
    rows.push({ familyId: family.id, estimateNumber: family.number, revision: issued.revision, decisionVersion: decision.version,
      recordId: `${family.id}:r${issued.revision}`, label: `${family.number} / effective revision ${issued.revision}`,
      outcome: decision.outcome, decisionDate: decision.date, recordedDate: decision.recordedDate, archived: issued.archived ?? false,
      money: issued.validSnapshot ? { kind: 'available', preTaxCents: issued.subtotalCents - issued.discountCents,
        taxCents: issued.taxCents, customerTotalCents: issued.customerTotalCents }
        : { kind: 'unavailable', explanation: 'The issued snapshot failed host validation; no current-price fallback.' },
    });
  }
  const accepted = rows.filter(row => row.outcome === 'accepted');
  const knownAmounts = accepted.flatMap(row => row.money.kind === 'available' ? [row.money] : []);
  const money: EstimateDecisionsResult['money'] = knownAmounts.length !== accepted.length
    ? { kind: 'unavailable', explanation: 'At least one accepted frozen snapshot is invalid. The accepted total is unavailable, not zero; decision counts remain valid.' }
    : { kind: 'available',
      preTaxCents: knownAmounts.reduce((sum, money) => sum + money.preTaxCents, 0),
      customerTotalCents: knownAmounts.reduce((sum, money) => sum + money.customerTotalCents, 0) };
  const evidence = rows.filter(row => selected === 'decided' || row.outcome === selected);
  return { from, to, periodLabel: `${from} to ${to}, both dates included`, snapshotLabel: 'Nov 5, 2026 at 10:00 / Europe/Warsaw',
    scopeLabel: 'Authorized estimate families and effective issued decisions. Fictional frozen snapshot fixtures.',
    counts: { accepted: accepted.length, declined: rows.filter(row => row.outcome === 'declined').length }, money,
    evidenceIds: { accepted: 'accepted', declined: 'declined', decided: 'decided' }, selected,
    rows: evidence.slice((page - 1) * pageSize, page * pageSize), page, pageSize };
}
export const revisedWithoutDecisionFamilies = estimateDecisionFamilies.map(family => family.number === 'E3'
  ? { ...family, revisions: [...family.revisions, { ...amounts, revision: 2, issuedDate: '2026-11-03', decisions: [] }] } : family);
export const invalidSnapshotFamilies = estimateDecisionFamilies.map(family => family.number === 'E2'
  ? { ...family, revisions: family.revisions.map(revision => revision.revision === 2 ? { ...revision, validSnapshot: false } : revision) } : family);
