import { leadSources } from '@salesmora/contracts';
import type {
  LeadSource,
  LeadSourceCohortRow,
  LeadSourceConvertedRow,
  LeadSourceEstimateRow,
  LeadSourceResult,
} from './lead-source-report.validation';

export const leadSourceCohort: readonly (LeadSourceCohortRow & { converted: boolean })[] = [
  { id: 'L1', label: 'Website inquiry', recordId: 'lead-L1', createdDate: '2026-10-01', source: 'website', converted: true },
  { id: 'L2', label: 'Referral inquiry', recordId: 'lead-L2', createdDate: '2026-10-15', source: 'referral', converted: false },
  { id: 'L3', label: 'Archived phone inquiry', recordId: 'lead-L3', createdDate: '2026-10-20', source: 'phone', converted: true },
  { id: 'L4', label: 'Gmail inquiry', recordId: 'lead-L4', createdDate: '2026-10-31', source: 'gmail', converted: false },
];
const jobs: Readonly<Record<string, string>> = {
  L1: 'J-001 / created after period / canceled; still proves creation',
  L3: 'J-003 / surviving linked Job',
};
export type LeadSourceEstimateFixture = {
  familyId: string;
  estimateNumber: string;
  revision: number;
  decisionVersion: number;
  label: string;
  acceptedDate: string;
  preTaxCents: number;
  cohortLeadIds: readonly string[];
  linkage: 'direct-lead' | 'proven-job' | 'ambiguous';
  leadRecordId?: string;
  leadLabel?: string;
};
export const leadSourceEstimateFixtures: readonly LeadSourceEstimateFixture[] = [
  { familyId: 'EF-001', estimateNumber: 'E-001', revision: 2, decisionVersion: 4, label: 'Website project estimate',
    acceptedDate: '2026-11-02', preTaxCents: 125000, cohortLeadIds: ['L1'], linkage: 'direct-lead',
    leadRecordId: 'lead-L1', leadLabel: 'Website inquiry' },
  { familyId: 'EF-002', estimateNumber: 'E-002', revision: 1, decisionVersion: 2, label: 'Phone project estimate',
    acceptedDate: '2026-10-25', preTaxCents: 75000, cohortLeadIds: ['L3'], linkage: 'proven-job',
    leadRecordId: 'lead-L3', leadLabel: 'Archived phone inquiry' },
  { familyId: 'EF-003', estimateNumber: 'E-003', revision: 3, decisionVersion: 1, label: 'Multiple-lead estimate',
    acceptedDate: '2026-10-28', preTaxCents: 40000, cohortLeadIds: ['L2', 'L3'], linkage: 'ambiguous' },
  { familyId: 'EF-004', estimateNumber: 'E-004', revision: 1, decisionVersion: 1, label: 'Website change-order estimate',
    acceptedDate: '2026-11-03', preTaxCents: 25000, cohortLeadIds: ['L1'], linkage: 'direct-lead',
    leadRecordId: 'lead-L1', leadLabel: 'Website inquiry' },
];

/** Fictional host projection matching L01/L02/L07/L10; no source query or permission proof. */
export function leadSourceResponse(source = leadSourceCohort, options: {
  kind?: 'cohort' | 'converted' | 'accepted-estimates'; page?: number; pageSize?: number;
  from?: string; to?: string; canReadConversion?: boolean; canReadAcceptedValue?: boolean;
  linkedJobs?: Readonly<Record<string, string>>;
  acceptedEstimates?: readonly LeadSourceEstimateFixture[];
} = {}): LeadSourceResult {
  const { kind = 'cohort', page = 1, pageSize = 25, from = '2026-10-01', to = '2026-10-31',
    canReadConversion = true, canReadAcceptedValue = true } = options;
  const cohort = source.filter(row => row.createdDate >= from && row.createdDate <= to);
  const cohortIds = new Set(cohort.map(row => row.id));
  const grouped = leadSources.map(currentSource => {
    const leads = cohort.filter(row => row.source === currentSource);
    return { source: currentSource, cohort: leads.length,
      converted: canReadConversion ? leads.filter(row => row.converted).length : null,
      acceptedEstimateCount: null as number | null, acceptedValueCents: null as number | null };
  });
  const toCohortRow = ({ id, label, recordId, createdDate, source: currentSource }: typeof cohort[number]): LeadSourceCohortRow =>
    ({ id, label, recordId, createdDate, source: currentSource });
  const convertedRows: LeadSourceConvertedRow[] = cohort.filter(row => row.converted).map(row => {
    const linkedJobs = options.linkedJobs?.[row.id] ?? jobs[row.id];
    if (!linkedJobs) throw new Error(`Missing linked-Job fixture for converted lead ${row.id}.`);
    return { ...toCohortRow(row), linkedJobs };
  });
  const estimateFixtures = (options.acceptedEstimates ?? leadSourceEstimateFixtures)
    .filter(estimate => estimate.acceptedDate <= '2026-11-06' &&
      estimate.cohortLeadIds.some(leadId => cohortIds.has(leadId)));
  const estimateRows: LeadSourceEstimateRow[] = estimateFixtures.map(estimate => {
    if (estimate.linkage === 'ambiguous') return {
      familyId: estimate.familyId, estimateNumber: estimate.estimateNumber,
      revision: estimate.revision, decisionVersion: estimate.decisionVersion, label: estimate.label, acceptedDate: estimate.acceptedDate,
      preTaxCents: estimate.preTaxCents, source: null,
    };
    const linkedLead = cohort.find(lead => estimate.cohortLeadIds.includes(lead.id));
    if (!linkedLead || !estimate.leadRecordId || !estimate.leadLabel)
      throw new Error(`Missing proven cohort lead for accepted estimate family ${estimate.familyId}.`);
    return { familyId: estimate.familyId, estimateNumber: estimate.estimateNumber,
    revision: estimate.revision, decisionVersion: estimate.decisionVersion, label: estimate.label, acceptedDate: estimate.acceptedDate,
      preTaxCents: estimate.preTaxCents, source: linkedLead.source,
      linkedLead: { recordId: estimate.leadRecordId, label: estimate.leadLabel } };
  });
  const acceptedValue = canReadAcceptedValue
    ? {
      kind: 'available' as const,
      preTaxCents: estimateRows.reduce((sum, estimate) => sum + estimate.preTaxCents, 0),
      estimateCount: estimateRows.length,
      unattributedPreTaxCents: estimateRows.filter(estimate => estimate.source === null)
        .reduce((sum, estimate) => sum + estimate.preTaxCents, 0),
      unattributedCount: estimateRows.filter(estimate => estimate.source === null).length,
      evidenceId: estimateRows.length > 0 ? 'source-accepted-value' : undefined,
    }
    : { kind: 'unavailable' as const, explanation: 'Accepted estimate value requires complete workspace Lead, Job and Estimate read access, including Lead and Estimate archives.' };
  if (canReadAcceptedValue) {
    grouped.forEach(group => {
      const sourceEstimates = estimateRows.filter(estimate => estimate.source === group.source);
      group.acceptedEstimateCount = sourceEstimates.length;
      group.acceptedValueCents = sourceEstimates.reduce((sum, estimate) => sum + estimate.preTaxCents, 0);
    });
  }
  const cohortRows = cohort.map(toCohortRow);
  const start = (page - 1) * pageSize;
  const selectedKind = kind === 'accepted-estimates' && !canReadAcceptedValue ? 'cohort' : kind;
  return {
    from, to, today: '2026-11-06', periodLabel: `${from} to ${to}, both dates included`,
    snapshotLabel: 'November 6, 2026 at 09:00 / Europe-Warsaw business date',
    scopeLabel: 'Authorized creation cohort, including permitted archived leads',
    cohort: cohort.length, cohortEvidenceId: 'source-cohort',
    conversion: canReadConversion ? { kind: 'available', converted: convertedRows.length, evidenceId: 'source-converted' } : { kind: 'unavailable' },
    acceptedValue,
    groups: grouped,
    evidence: selectedKind === 'cohort' ? { kind: selectedKind, rows: cohortRows.slice(start, page * pageSize) }
      : selectedKind === 'converted' ? { kind: selectedKind, rows: convertedRows.slice(start, page * pageSize) }
        : { kind: selectedKind, rows: estimateRows.slice(start, page * pageSize) },
    page, pageSize,
  };
}

export function relabelLeadSource(leadId: string, source: LeadSource) {
  return leadSourceCohort.map(row => row.id === leadId ? { ...row, source } : row);
}
