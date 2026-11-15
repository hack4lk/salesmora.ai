import type { Knex } from 'knex';
import { z } from 'zod';
import { jobDateSchema, leadSources, type LeadSourceResult } from '@salesmora/contracts';
import { estimateReportFrozenMoney } from './estimate-context';

export function sourceAcceptedEstimatesQuery(trx: Knex.Transaction, scoped: Knex.QueryBuilder, timezone: string) {
  return scoped.clone().where('e.status', 'accepted')
    .joinRaw(`LEFT JOIN LATERAL (
      SELECT * FROM estimate_decisions d WHERE d."workspaceId" = e."workspaceId" AND d."estimateId" = e.id
      ORDER BY d."estimateVersion" DESC, d.id DESC LIMIT 1
    ) d ON TRUE`)
    .leftJoin('estimate_snapshots as s', q => q.on('s.workspaceId', 'e.workspaceId').andOn('s.estimateId', 'e.id'))
    .joinRaw(`JOIN LATERAL (
      SELECT count(*)::int AS "pathCount", min(link.id::text) AS "leadId",
        bool_or(link.id IN (SELECT id FROM cohort)) AS reachable FROM (
      SELECT DISTINCT candidate.id FROM (
        SELECT family."leadId" AS id FROM estimates family
          WHERE family."workspaceId" = e."workspaceId" AND family."estimateNumber" = e."estimateNumber" AND family."parentType" = 'lead'
        UNION ALL
        SELECT parent."sourceLeadId" FROM estimates family JOIN jobs parent
          ON parent."workspaceId" = family."workspaceId" AND parent.id = family."jobId"
          WHERE family."workspaceId" = e."workspaceId" AND family."estimateNumber" = e."estimateNumber" AND family."parentType" = 'job'
        UNION ALL
        SELECT converted."sourceLeadId" FROM jobs converted
          JOIN estimates family ON family."workspaceId" = converted."workspaceId" AND family.id = converted."acceptedEstimateId"
          WHERE family."workspaceId" = e."workspaceId" AND family."estimateNumber" = e."estimateNumber"
      ) candidate JOIN leads surviving ON surviving."workspaceId" = e."workspaceId" AND surviving.id = candidate.id
      ) link
    ) paths ON paths.reachable
    LEFT JOIN cohort attributed ON paths."pathCount" = 1 AND attributed.id::text = paths."leadId"`)
    .select('e.id', 'e.estimateNumber', 'e.revision', 'e.version', 'e.name', 'd.outcome', 's.content', 's.contentHash',
      trx.raw(`d.id AS "decisionId", d."estimateVersion" AS "decisionVersion",
        s.id AS "snapshotId", d."snapshotId" AS "decisionSnapshotId",
        d."snapshotTotalCents"::text AS "snapshotTotalCents", e."acceptedTotalCents"::text AS "acceptedTotalCents",
        to_char(d."decisionDate",'YYYY-MM-DD') AS "acceptedDate",
        to_char(LEAST(s."createdAt", e."sentAt", e."publishedAt") AT TIME ZONE ?, 'YYYY-MM-DD') AS "issuedDate",
        paths."pathCount", paths."leadId", attributed.source, attributed.name AS "leadName"`, [timezone]));
}

const rowSchema = z.object({
  id: z.uuid(), estimateNumber: z.number().int().positive(), revision: z.number().int().positive(),
  version: z.number().int().positive(), name: z.string().trim().min(1),
  decisionId: z.uuid(), decisionVersion: z.number().int().positive(), outcome: z.literal('accepted'),
  snapshotId: z.uuid(), decisionSnapshotId: z.uuid(), content: z.unknown(), contentHash: z.string().nullable(),
  snapshotTotalCents: z.string(), acceptedTotalCents: z.string().nullable(),
  acceptedDate: jobDateSchema, issuedDate: jobDateSchema,
  pathCount: z.number().int().positive(), leadId: z.uuid(), source: z.enum(leadSources).nullable(), leadName: z.string().nullable(),
});
export function sourceEstimateEvidence(raw: unknown, workspaceId: string, today: string) {
  const row = rowSchema.parse(raw);
  if (row.decisionVersion > row.version || row.snapshotId !== row.decisionSnapshotId ||
    row.acceptedDate > today || row.acceptedDate < row.issuedDate ||
    row.pathCount === 1 && (row.source === null || !row.leadName?.trim())) {
    throw new Error('Source-cohort accepted Estimate decision or linkage is inconsistent.');
  }
  const number = `EST-${String(row.estimateNumber).padStart(4, '0')}`;
  const money = estimateReportFrozenMoney(row.content, row.contentHash, number, row.revision, {
    total: row.snapshotTotalCents, acceptedTotal: row.acceptedTotalCents,
  });
  if (money.kind === 'unavailable') return { money };
  const source = row.pathCount === 1 ? row.source : null;
  const evidence = {
    familyId: `${workspaceId}:${number}`, recordId: row.id, estimateNumber: number,
    revision: row.revision, decisionVersion: row.decisionVersion, label: row.name,
    acceptedDate: row.acceptedDate, preTaxCents: money.preTaxCents, source,
    ...(source === null ? {} : { linkedLead: { recordId: row.leadId, label: row.leadName! } }),
  };
  return { money, evidence };
}

export type SourceEstimateRows = Extract<LeadSourceResult['evidence'], { kind: 'accepted-estimates' }>['rows'];
