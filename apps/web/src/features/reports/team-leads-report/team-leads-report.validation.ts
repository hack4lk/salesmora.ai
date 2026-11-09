import type { leadStages } from '@salesmora/contracts';
import { validReportBreakdown } from '../report-breakdown/report-breakdown.validation';
import type { ReportEvidenceRow } from '../report-evidence-table/report-evidence-table';

export const teamOpenLeadStages = ['new', 'contacted', 'estimate-sent'] as const;
export type TeamOpenLeadStage = typeof teamOpenLeadStages[number];
export type TeamLeadQueue = 'open' | 'inactive' | 'unassigned';
export type TeamLeadOwner = {
  /** member:<current ID> or unassigned; labels contain only authorized surviving identity. */
  id: string;
  label: string;
  count: number;
  inactive: number;
  stages: Readonly<Record<TeamOpenLeadStage, number>>;
  evidenceId?: string;
  inactiveEvidenceId?: string;
  stageEvidenceIds?: Readonly<Partial<Record<TeamOpenLeadStage, string>>>;
};
export type TeamLeadRow = ReportEvidenceRow & {
  stage: typeof leadStages[number];
  archived: boolean;
  /** Current surviving membership only. A removed member resolves to null. */
  currentOwnerId: string | null;
  /** Host applies the exact database cutoff against the same snapshot. */
  inactive: boolean;
};
export type TeamLeadSelection = { kind: 'queue'; queue: TeamLeadQueue }
  | { kind: 'owner'; id: string; stage?: TeamOpenLeadStage; inactiveOnly?: boolean };
export type TeamLeadsResult = {
  scope: { kind: 'workspace' } | { kind: 'assigned'; currentMemberId: string };
  snapshotLabel: string;
  scopeLabel: string;
  inactivityCutoffLabel: string;
  counts: Readonly<Record<TeamLeadQueue, number>>;
  owners: readonly TeamLeadOwner[];
  evidenceIds: Readonly<Partial<Record<TeamLeadQueue, string>>>;
  selected: TeamLeadSelection;
  rows: readonly TeamLeadRow[];
  page: number;
  pageSize: number;
};
export const teamLeadOwnerKey = (row: TeamLeadRow) => row.currentOwnerId === null ? 'unassigned' : `member:${row.currentOwnerId}`;

export function teamLeadSelectionTotal(result: TeamLeadsResult): number | undefined {
  const selected = result.selected;
  if (selected.kind === 'queue') return result.counts[selected.queue];
  const owner = result.owners.find(owner => owner.id === selected.id);
  if (!owner || (selected.stage !== undefined && selected.inactiveOnly)) return undefined;
  return selected.stage !== undefined ? owner.stages[selected.stage] : selected.inactiveOnly ? owner.inactive : owner.count;
}

export function validTeamLeadsResult(result: TeamLeadsResult): boolean {
  const { counts, owners, scope, selected } = result;
  if (!result.inactivityCutoffLabel.trim() ||
    !(['open', 'inactive', 'unassigned'] as const).every(key => Number.isSafeInteger(counts[key]) && counts[key] >= 0 && counts[key] <= counts.open) ||
    !validReportBreakdown(counts.open, owners) ||
    !validReportBreakdown(counts.inactive, owners.map(owner => ({ id: owner.id, count: owner.inactive }))) ||
    (owners.find(owner => owner.id === 'unassigned')?.count ?? 0) !== counts.unassigned ||
    !owners.every(owner => owner.label.trim() && (owner.id === 'unassigned' || owner.id.startsWith('member:') && owner.id.slice(7).trim()) &&
      owner.inactive <= owner.count &&
      validReportBreakdown(owner.count, teamOpenLeadStages.map(stage => ({ id: stage, count: owner.stages[stage] }))))) return false;
  if (scope.kind === 'assigned' && (!scope.currentMemberId.trim() || counts.unassigned !== 0 ||
    owners.some(owner => owner.id !== `member:${scope.currentMemberId}`) ||
    selected.kind === 'queue' && selected.queue === 'unassigned')) return false;
  const total = teamLeadSelectionTotal(result);
  if (total === undefined || !Number.isSafeInteger(result.page) || result.page < 1 ||
    !Number.isSafeInteger(result.pageSize) || result.pageSize < 1 ||
    result.page > Math.max(1, Math.ceil(total / result.pageSize)) ||
    result.rows.length !== Math.min(result.pageSize, Math.max(0, total - (result.page - 1) * result.pageSize)) ||
    new Set(result.rows.map(row => row.id)).size !== result.rows.length) return false;
  if (!result.rows.every(row => {
    const owner = owners.find(owner => owner.id === teamLeadOwnerKey(row));
    if (!row.id.trim() || row.archived || !teamOpenLeadStages.some(stage => stage === row.stage) ||
      (row.currentOwnerId !== null && !row.currentOwnerId.trim()) || !owner ||
      !['created', 'activity'].every(column => Object.hasOwn(row.cells, column)) ||
      (scope.kind === 'assigned' && row.currentOwnerId !== scope.currentMemberId)) return false;
    return selected.kind === 'queue' ? selected.queue === 'open' || (selected.queue === 'inactive' ? row.inactive : row.currentOwnerId === null)
      : teamLeadOwnerKey(row) === selected.id && (selected.stage === undefined || row.stage === selected.stage) && (!selected.inactiveOnly || row.inactive);
  })) return false;
  const unseen = counts.open - result.rows.length;
  const consistent = (observed: number, total: number) => observed <= total && total - observed <= unseen;
  return consistent(result.rows.filter(row => row.inactive).length, counts.inactive) &&
    consistent(result.rows.filter(row => row.currentOwnerId === null).length, counts.unassigned) &&
    owners.every(owner => {
      const rows = result.rows.filter(row => teamLeadOwnerKey(row) === owner.id);
      return consistent(rows.length, owner.count) && consistent(rows.filter(row => row.inactive).length, owner.inactive) &&
        teamOpenLeadStages.every(stage => consistent(rows.filter(row => row.stage === stage).length, owner.stages[stage]));
    });
}
