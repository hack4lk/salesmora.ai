import type { CalendarSchedule, CalendarVisit } from '@salesmora/contracts';
type CalendarScheduleProposalBase = {
  id: string; inputHash: string; visitId: string; revision: string;
  createdAt: string; expiresAt: string;
  state: 'pending' | 'confirmed' | 'cancelled' | 'expired' | 'superseded' | 'conflict' | 'forbidden';
  timezone: string;
  from: CalendarSchedule;
  records: readonly (CalendarVisit['records'][number] & { expectedVersion: number })[];
  crew: readonly { id: string; name: string }[];
  /** Server advisories frozen to this exact proposal, never inferred from a truncated chat result. */
  warnings: readonly string[];
};
/** Clear intent is explicit; a missing target date never implicitly means clearing. */
export type CalendarScheduleProposal = CalendarScheduleProposalBase & (
  | { intent?: 'schedule'; to: CalendarSchedule & { scheduledDate: string } }
  | { intent: 'clear'; to: { scheduledDate: null; arrivalWindow: null } }
);
/** Independently loaded by the host. Presentation metadata is never mutation authority. */
export type CalendarScheduleReviewContext = {
  proposalId: string; inputHash: string; visitId: string; revision: string;
  records: readonly { type: 'job' | 'work_order'; id: string; expectedVersion: number }[];
  read: boolean; canSchedule: boolean;
};
/** No browser-authored schedule, record set or assignment can be executed by a decision. */
export type CalendarScheduleDecision = {
  proposalId: string; inputHash: string; visitId: string; revision: string; decision: 'confirm' | 'cancel';
};
export type CalendarScheduleDraftCardProps = {
  draft: CalendarScheduleProposal;
  context: CalendarScheduleReviewContext | null;
  state?: 'ready' | 'loading' | 'error' | 'unavailable';
  disabled?: boolean;
  /** Host persists and reloads authoritative state; a successful callback is not proof of saving. */
  onDecide?: (request: CalendarScheduleDecision) => Promise<{ ok: true } | { ok: false; message: string }>;
};
