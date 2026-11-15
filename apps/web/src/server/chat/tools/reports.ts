import 'server-only';
import { readReportSnapshotForAssistant, ReportAssistantClarificationError, ReportAssistantLimitError } from '@salesmora/data';
import { reportAssistantTicket } from '@salesmora/contracts';
import { rememberReportRead } from '../store';
import { reportResultResponse } from '../report-result';
import type { ChatToolHandler } from './types';

/** Persist private evidence before releasing any native facts to the model. */
export const reportsQuery: ChatToolHandler = async (context, args) => {
  try {
    const snapshot = await readReportSnapshotForAssistant(context.db, context.identity, context.enabledPermissions, args,
      context.pageContext.reportContext, context.signal);
    reportResultResponse(snapshot);
    await rememberReportRead(context.identity, context.turnId, snapshot, context.db);
    return { reportResult: reportAssistantTicket(snapshot.binding),
      evidence: { type: 'report-native-read', untrusted: true, native: snapshot.native,
      instruction: 'Bound historical native read. Preserve native totals, section scopes, timestamps and coverage; evidence rows are a bounded sample, never population totals. No template, page filter, export or CRM record was changed.' } };
  } catch (error) {
    if (!(error instanceof ReportAssistantClarificationError || error instanceof ReportAssistantLimitError)) throw error;
    return { evidence: { type: 'report-clarification', message: error.message } };
  }
};
