import { leadSources } from '@salesmora/contracts';
import { validLeadConversionCounts } from '../lead-conversion-report/lead-conversion-report.validation';

export type LeadSource = typeof leadSources[number];
export const leadSourceLabels: Record<LeadSource, string> = {
  website: 'Website', referral: 'Referral', phone: 'Phone', gmail: 'Gmail', other: 'Other',
};
export type LeadSourceCohortRow = { id: string; label: string; recordId?: string; createdDate: string; source: LeadSource };
export type LeadSourceConvertedRow = LeadSourceCohortRow & { linkedJobs: string };
export type LeadSourceEstimateRow = {
  /** Opaque workspace-qualified identity; revisions of one family share this key. */
  familyId: string;
  estimateNumber: string;
  revision: number;
  decisionVersion: number;
  label: string;
  acceptedDate: string;
  preTaxCents: number;
  source: LeadSource | null;
  linkedLead?: { recordId: string; label: string };
};
export type LeadSourceGroup = {
  source: LeadSource;
  cohort: number;
  converted: number | null;
  acceptedEstimateCount: number | null;
  acceptedValueCents: number | null;
};
export type LeadSourceResult = {
  from: string;
  to: string;
  today: string;
  periodLabel: string;
  snapshotLabel: string;
  scopeLabel: string;
  cohort: number;
  cohortEvidenceId?: string;
  conversion: { kind: 'unavailable' } | {
    kind: 'available';
    converted: number;
    evidenceId?: string;
  };
  acceptedValue: { kind: 'unavailable'; explanation: string } | {
    kind: 'available';
    preTaxCents: number;
    estimateCount: number;
    unattributedPreTaxCents: number;
    unattributedCount: number;
    evidenceId?: string;
  };
  groups: readonly LeadSourceGroup[];
  evidence: { kind: 'cohort'; rows: readonly LeadSourceCohortRow[] }
    | { kind: 'converted'; rows: readonly LeadSourceConvertedRow[] }
    | { kind: 'accepted-estimates'; rows: readonly LeadSourceEstimateRow[] };
  page: number;
  pageSize: number;
};
const nonnegative = (value: number) => Number.isSafeInteger(value) && value >= 0;
const positive = (value: number) => Number.isSafeInteger(value) && value > 0;
const validCents = nonnegative;
const date = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T12:00:00Z`)) &&
  new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;
const knownSource = (value: string): value is LeadSource => leadSources.some(source => source === value);
const validCohortRow = (row: LeadSourceCohortRow, result: Pick<LeadSourceResult, 'from' | 'to'>) =>
  row.id.trim() !== '' && row.label.trim() !== '' && (row.recordId === undefined || row.recordId.trim() !== '') &&
  date(row.createdDate) && row.createdDate >= result.from && row.createdDate <= result.to && knownSource(row.source);

/** Reconciles each cohort and distinct linked-Job numerator to the same current-source grouping. */
export function validLeadSourceResult(
  result: LeadSourceResult,
  canReadConversion: boolean,
  canReadAcceptedValue: boolean,
): boolean {
  const conversion = canReadConversion && result.conversion.kind === 'available' ? result.conversion : undefined;
  if (!date(result.today) || !date(result.from) || !date(result.to) || result.to < result.from ||
    result.to > result.today || ![result.periodLabel, result.snapshotLabel, result.scopeLabel].every(value => value.trim() !== '') ||
    !nonnegative(result.cohort) || !positive(result.page) || !positive(result.pageSize) ||
    !Array.isArray(result.groups) || result.groups.length !== leadSources.length ||
    new Set(result.groups.map(group => group.source)).size !== leadSources.length ||
    !leadSources.every(source => result.groups.some(group => group.source === source)) ||
    result.groups.some(group => !knownSource(group.source) || !nonnegative(group.cohort) ||
      conversion && (group.converted === null || !validLeadConversionCounts(group.cohort, group.converted)))) return false;
  const cohortTotal = result.groups.reduce((sum, group) => sum + group.cohort, 0);
  if (!nonnegative(cohortTotal) || cohortTotal !== result.cohort) return false;
  if (!conversion) {
    if (canReadConversion && (result.conversion.kind !== 'unavailable' ||
      result.groups.some(group => group.converted !== null))) return false;
    if (!canReadConversion && result.evidence.kind === 'converted') return false;
  } else {
    const converted = result.groups.reduce((sum, group) => sum + group.converted!, 0);
    if (!nonnegative(converted) || !validLeadConversionCounts(result.cohort, conversion.converted) ||
      converted !== conversion.converted) return false;
  }
  const acceptedValue = canReadAcceptedValue && result.acceptedValue.kind === 'available'
    ? result.acceptedValue : undefined;
  if (canReadAcceptedValue) {
    if (acceptedValue) {
      if (![acceptedValue.preTaxCents, acceptedValue.unattributedPreTaxCents].every(validCents) ||
        ![acceptedValue.estimateCount, acceptedValue.unattributedCount].every(nonnegative) ||
        result.groups.some(group => group.acceptedValueCents === null || !validCents(group.acceptedValueCents) ||
          group.acceptedEstimateCount === null || !nonnegative(group.acceptedEstimateCount))) return false;
      const sourceValue = result.groups.reduce((sum, group) => sum + group.acceptedValueCents!, 0);
      const sourceCount = result.groups.reduce((sum, group) => sum + group.acceptedEstimateCount!, 0);
      const totalValue = sourceValue + acceptedValue.unattributedPreTaxCents;
      const totalCount = sourceCount + acceptedValue.unattributedCount;
      if (![sourceValue, sourceCount, totalValue, totalCount].every(nonnegative) ||
        totalValue !== acceptedValue.preTaxCents || totalCount !== acceptedValue.estimateCount ||
        (acceptedValue.estimateCount > 0 && !acceptedValue.evidenceId?.trim())) return false;
    } else if (result.acceptedValue.kind !== 'unavailable' || !result.acceptedValue.explanation.trim() ||
      result.groups.some(group => group.acceptedValueCents !== null || group.acceptedEstimateCount !== null) ||
      result.evidence.kind === 'accepted-estimates') return false;
  } else if (result.evidence.kind === 'accepted-estimates') return false;
  const evidence = result.evidence;
  if (!['cohort', 'converted', 'accepted-estimates'].includes(evidence.kind) || !Array.isArray(evidence.rows)) return false;
  const isConvertedEvidence = (row: LeadSourceCohortRow | LeadSourceConvertedRow):
    row is LeadSourceConvertedRow => 'linkedJobs' in row &&
      typeof row.linkedJobs === 'string' && row.linkedJobs.trim() !== '';
  const total = evidence.kind === 'cohort' ? result.cohort
    : evidence.kind === 'converted' ? conversion?.converted ?? -1
      : acceptedValue?.estimateCount ?? -1;
  const evidenceIds = evidence.kind === 'accepted-estimates'
    ? evidence.rows.map(row => row.familyId)
    : evidence.rows.map(row => row.id);
  if (total < 0 ||
    result.page > Math.max(1, Math.ceil(total / result.pageSize)) ||
    evidence.rows.length !== Math.min(result.pageSize, Math.max(0, total - (result.page - 1) * result.pageSize)) ||
    new Set(evidenceIds).size !== evidence.rows.length) return false;
  if (evidence.kind === 'cohort') {
    if (!evidence.rows.every(row => validCohortRow(row, result))) return false;
    const observed = new Map<LeadSource, number>(leadSources.map(source => [source, 0]));
    evidence.rows.forEach(row => observed.set(row.source, observed.get(row.source)! + 1));
    if (leadSources.some(source => observed.get(source)! > result.groups.find(group => group.source === source)!.cohort)) return false;
    if (result.cohort === evidence.rows.length && leadSources.some(source => observed.get(source) !== result.groups.find(group => group.source === source)!.cohort)) return false;
  } else if (evidence.kind === 'converted') {
    if (!evidence.rows.every(row => validCohortRow(row, result) && isConvertedEvidence(row))) return false;
    const observed = new Map<LeadSource, number>(leadSources.map(source => [source, 0]));
    evidence.rows.forEach(row => observed.set(row.source, observed.get(row.source)! + 1));
    if (leadSources.some(source => observed.get(source)! > result.groups.find(group => group.source === source)!.converted!)) return false;
    if (conversion?.converted === evidence.rows.length &&
      leadSources.some(source => observed.get(source) !== result.groups.find(group => group.source === source)!.converted)) return false;
  }
  if (evidence.kind === 'accepted-estimates') {
    const observedValue = new Map<LeadSource, number>(leadSources.map(source => [source, 0]));
    const observedCount = new Map<LeadSource, number>(leadSources.map(source => [source, 0]));
    let unattributedValue = 0;
    let unattributedCount = 0;
    for (const row of evidence.rows) {
      const source = row.source;
      if (!row.familyId.trim() || !row.estimateNumber.trim() || !row.label.trim() ||
        !positive(row.revision) || !positive(row.decisionVersion) || !date(row.acceptedDate) || row.acceptedDate > result.today ||
        !validCents(row.preTaxCents) || (source !== null && !knownSource(source)) ||
        (source === null ? row.linkedLead !== undefined
          : !row.linkedLead || !row.linkedLead.recordId.trim() || !row.linkedLead.label.trim())) return false;
      if (source === null) {
        unattributedValue += row.preTaxCents;
        unattributedCount += 1;
      } else {
        observedValue.set(source, observedValue.get(source)! + row.preTaxCents);
        observedCount.set(source, observedCount.get(source)! + 1);
      }
    }
    if (![...observedValue.values(), unattributedValue].every(nonnegative) ||
      leadSources.some(source => observedValue.get(source)! > result.groups.find(group => group.source === source)!.acceptedValueCents! ||
        observedCount.get(source)! > result.groups.find(group => group.source === source)!.acceptedEstimateCount!) ||
      unattributedValue > acceptedValue!.unattributedPreTaxCents ||
      unattributedCount > acceptedValue!.unattributedCount) return false;
    if (acceptedValue!.estimateCount === evidence.rows.length &&
      (leadSources.some(source =>
        observedValue.get(source) !== result.groups.find(group => group.source === source)!.acceptedValueCents ||
        observedCount.get(source) !== result.groups.find(group => group.source === source)!.acceptedEstimateCount) ||
        unattributedValue !== acceptedValue!.unattributedPreTaxCents ||
        unattributedCount !== acceptedValue!.unattributedCount)) return false;
  }
  return true;
}

export function formatLeadSourceRate(cohort: number, converted: number): string {
  if (!validLeadConversionCounts(cohort, converted) || cohort === 0)
    throw new RangeError('A source conversion rate requires valid counts and a nonempty cohort.');
  return new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 }).format(converted / cohort);
}
