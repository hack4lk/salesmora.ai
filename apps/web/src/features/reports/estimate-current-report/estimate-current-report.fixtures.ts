import { estimateCurrentMatchesQueue, type EstimateCurrentQueue, type EstimateCurrentResult, type EstimateCurrentRow } from './estimate-current-report.validation';

type FixtureRevision = {
  revision: number;
  issuedDate: string | null;
  status: 'draft' | 'sent' | 'published' | 'accepted' | 'declined' | 'void';
  validUntil: string | null;
  archived: boolean;
  money: EstimateCurrentRow['money'];
  resendDate?: string;
  decisionDate?: string;
};
export type EstimateCurrentFixtureFamily = {
  id: string;
  number: string;
  parentType: 'lead' | 'job';
  leadArchived: boolean;
  /** Full host linkage results, including Jobs not present in a scoped UI list. */
  linkage: 'confirmed-absent' | 'accepted-estimate-job' | 'source-lead-job' | 'unavailable';
  revisions: readonly FixtureRevision[];
};
const revision: FixtureRevision = { revision: 1, issuedDate: '2026-10-03', status: 'published', validUntil: '2026-11-20',
  archived: false, money: { kind: 'available', preTaxCents: 20000, taxCents: 2000, customerTotalCents: 22000 } };
const family: EstimateCurrentFixtureFamily = { id: 'fixture:E4', number: 'E4', parentType: 'lead', leadArchived: false,
  linkage: 'confirmed-absent', revisions: [revision] };
export const estimateCurrentFamilies: readonly EstimateCurrentFixtureFamily[] = [
  { ...family, id: 'fixture:E1', number: 'E1', revisions: [
    { ...revision, issuedDate: '2026-09-25', status: 'sent', resendDate: '2026-10-05',
      money: { kind: 'available', preTaxCents: 5000, taxCents: 500, customerTotalCents: 5500 } },
    { ...revision, revision: 2, issuedDate: null, status: 'draft' },
  ] },
  family,
  { ...family, id: 'fixture:TODAY', number: 'TODAY', revisions: [{ ...revision, validUntil: '2026-11-05' }] },
  { ...family, id: 'fixture:YESTERDAY', number: 'YESTERDAY', revisions: [{ ...revision, validUntil: '2026-11-04' }] },
  { ...family, id: 'fixture:NO-EXPIRY', number: 'NO-EXPIRY', revisions: [{ ...revision, validUntil: null }] },
  { ...family, id: 'fixture:HANDOFF', number: 'HANDOFF', revisions: [{ ...revision, status: 'accepted', decisionDate: '2026-10-25' }] },
  { ...family, id: 'fixture:CONVERTED', number: 'CONVERTED', linkage: 'accepted-estimate-job',
    revisions: [{ ...revision, status: 'accepted', decisionDate: '2026-10-25' }] },
  { ...family, id: 'fixture:OTHER-JOB', number: 'OTHER-JOB', linkage: 'source-lead-job',
    revisions: [{ ...revision, status: 'accepted', decisionDate: '2026-10-25' }] },
  { ...family, id: 'fixture:JOB-PARENT', number: 'JOB-PARENT', parentType: 'job',
    revisions: [{ ...revision, status: 'accepted', decisionDate: '2026-10-25' }] },
  { ...family, id: 'fixture:ARCHIVED-LEAD', number: 'ARCHIVED-LEAD', leadArchived: true,
    revisions: [{ ...revision, status: 'accepted', decisionDate: '2026-10-25' }] },
  { ...family, id: 'fixture:ARCHIVED', number: 'ARCHIVED', revisions: [{ ...revision, archived: true }] },
  { ...family, id: 'fixture:VOID', number: 'VOID', revisions: [{ ...revision, status: 'void' }] },
  { ...family, id: 'fixture:DRAFT', number: 'DRAFT', revisions: [{ ...revision, issuedDate: null, status: 'draft' }] },
];

/** Mock host selects latest issued revisions and proves linkage before constructing count/evidence projections. */
export function estimateCurrentResponse(families: readonly EstimateCurrentFixtureFamily[] = estimateCurrentFamilies,
  selected: EstimateCurrentQueue = 'awaiting', page = 1, pageSize = 25, today = '2026-11-05'): EstimateCurrentResult {
  const rows: EstimateCurrentRow[] = [];
  let handoffAvailable = true;
  for (const family of families) {
    const issued = family.revisions.filter(revision => revision.issuedDate !== null).sort((a, b) => b.revision - a.revision)[0];
    if (!issued || issued.issuedDate === null || issued.archived) continue;
    const base = { familyId: family.id, estimateNumber: family.number, revision: issued.revision, issuedDate: issued.issuedDate,
      label: `${family.number} / issued revision ${issued.revision}`, recordId: `${family.id}:r${issued.revision}`,
      validUntil: issued.validUntil, archived: issued.archived, money: issued.money };
    if (issued.status === 'sent' || issued.status === 'published') rows.push({ ...base, status: issued.status });
    if (issued.status === 'accepted' && family.parentType === 'lead' && !family.leadArchived) {
      if (family.linkage === 'unavailable') handoffAvailable = false;
      if (family.linkage === 'confirmed-absent') {
        if (!issued.decisionDate) throw new Error('Accepted mock quote is missing its effective decision date.');
        rows.push({ ...base, status: 'accepted', decisionDate: issued.decisionDate, parentType: 'lead',
          leadArchived: false, linkage: 'confirmed-absent' });
      }
    }
  }
  const matching = (queue: EstimateCurrentQueue) => rows.filter(row => estimateCurrentMatchesQueue(row, queue, today));
  const awaiting = matching('awaiting');
  const amounts = awaiting.flatMap(row => row.money.kind === 'available' ? [row.money] : []);
  const awaitingMoney: EstimateCurrentResult['awaitingMoney'] = amounts.length !== awaiting.length
    ? { kind: 'unavailable', explanation: 'An awaiting issued snapshot failed host validation. No current-price substitution; count remains valid.' }
    : { kind: 'available', preTaxCents: amounts.reduce((sum, money) => sum + money.preTaxCents, 0),
      customerTotalCents: amounts.reduce((sum, money) => sum + money.customerTotalCents, 0) };
  const evidence = selected === 'handoff' && !handoffAvailable ? [] : matching(selected);
  return { today, snapshotLabel: 'Nov 5, 2026 at 10:00 / Europe/Warsaw', scopeLabel: 'Authorized current issued families and complete linkage fixtures.',
    counts: { awaiting: awaiting.length, expired: matching('expired').length }, awaitingMoney,
    handoff: handoffAvailable ? { kind: 'available', count: matching('handoff').length, evidenceId: 'handoff' }
      : { kind: 'unavailable', explanation: 'Lead/Job linkage visibility is incomplete; no not-converted inference.' },
    evidenceIds: { awaiting: 'awaiting', expired: 'expired' }, selected, rows: evidence.slice((page - 1) * pageSize, page * pageSize), page, pageSize };
}
export const unavailableHandoffFamilies = estimateCurrentFamilies.map(family => family.number === 'HANDOFF'
  ? { ...family, linkage: 'unavailable' as const } : family);
export const invalidCurrentSnapshotFamilies = estimateCurrentFamilies.map(family => family.number === 'E1'
  ? { ...family, revisions: family.revisions.map(revision => ({ ...revision,
    money: { kind: 'unavailable' as const, explanation: 'Issued snapshot failed host validation.' } })) } : family);
