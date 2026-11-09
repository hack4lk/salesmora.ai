import type { Knex } from 'knex';
import { projectEstimateActivity, type EstimateActivityRow } from '../estimates/history';
import type { ActivityReportEvent } from '@salesmora/contracts';

const actions = {
  created: 'created', 'draft.saved': 'updated', sent: 'sent', published: 'updated',
  'revision-created': 'created', superseded: 'updated', expired: 'updated',
  archived: 'archived', restored: 'updated', resent: 'sent', 'email-sent': 'sent',
  'delivery-failed': 'updated', viewed: 'updated',
  'decision-recorded': 'decision-recorded', 'decision-corrected': 'decision-recorded',
  converted: 'updated', voided: 'updated',
} satisfies Record<string, ActivityReportEvent['action']>;

/** Generic action labels never expose staff-only decision, delivery or conversion details. */
export function estimateActivityReportActionSQL(trx: Knex.Transaction) {
  const entries = Object.entries(actions);
  return trx.raw(`CASE h.type ${entries.map(() => 'WHEN ? THEN ?').join(' ')} END AS action`, entries.flat());
}

/** Reuse the native history validator, discarding all detailed projected fields. */
export function validateEstimateReportActivity(row: EstimateActivityRow): void {
  projectEstimateActivity(row);
}
