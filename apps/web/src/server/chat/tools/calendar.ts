import 'server-only';
import type { readToolRegistry } from '@salesmora/agent';
import { readCalendarForChat,proposeCalendarSchedule,CalendarProposalValidationError } from '@salesmora/data';
import { rememberCalendarRead } from '../store';
import type { ChatToolHandler } from './types';
export const calendarQuery: ChatToolHandler = async (context, args) => {
  const input = args as ReturnType<typeof readToolRegistry.calendar_query.inputSchema.parse>;
  const snapshot = await readCalendarForChat(context.db, context.identity, context.enabledPermissions, input, context.pageContext.calendarFilters);
  if ('clarification' in snapshot) return { evidence: { type: 'calendar-clarification', instruction: snapshot.clarification } };
  await rememberCalendarRead(context.identity, context.turnId, snapshot.stamp, { result: snapshot.result, query: snapshot.query }, context.db);
  return { calendarResult: snapshot.result, evidence: { type: 'calendar-result', untrusted: true, result: snapshot.result, instruction: 'Historical read snapshot only. Shared visits count once. No availability guarantee, reservation or mutation.' } };
};

export const calendarPropose: ChatToolHandler = async (context,args) => {
  try {
    const ticket = await proposeCalendarSchedule(context.db,context.identity,context.enabledPermissions,context.turnId,args,context.signal);
    if ('clarification' in ticket) {
      await rememberCalendarRead(context.identity,context.turnId,ticket.stamp,undefined,context.db);
      return { evidence:{ type:'calendar-proposal-clarification',saved:false,message:ticket.clarification } };
    }
    return { calendarProposal:ticket,evidence:{ type:'calendar-schedule-proposal',untrusted:true,saved:false,instruction:'The complete proposal is available in the browser card. Only explicit browser confirmation can save it. No schedule has changed. Never claim it was saved from chat yes.' } };
  } catch (error) { if (error instanceof CalendarProposalValidationError) return { evidence:{ type:'calendar-proposal-clarification',saved:false,message:error.message } };throw error; }
};
