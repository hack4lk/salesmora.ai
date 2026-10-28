import 'server-only';
import { readToolRegistry } from '@salesmora/agent';
import { readCalendarForChat,proposeCalendarSchedule,CalendarProposalValidationError } from '@salesmora/data';
import { database } from '../../workspaces/store';
import { enabledPermissions } from '../../authorization/permissions';
import { rememberCalendarRead } from '../store';
import type { ChatToolHandler } from './types';
export const calendarQuery: ChatToolHandler = async (context, args) => {
  const input = readToolRegistry.calendar_query.inputSchema.parse(args);
  await context.authorize('calendar_query'); context.signal.throwIfAborted();
  const snapshot = await readCalendarForChat(database(), context.identity, enabledPermissions, input, context.pageContext.calendarFilters);
  context.signal.throwIfAborted();
  if ('clarification' in snapshot) return { evidence: { type: 'calendar-clarification', instruction: snapshot.clarification } };
  await rememberCalendarRead(context.identity, context.turnId, snapshot.stamp, { result: snapshot.result, query: snapshot.query });
  await context.authorize('calendar_query');
  return { calendarResult: snapshot.result, evidence: { type: 'calendar-result', untrusted: true, result: snapshot.result, instruction: 'Historical read snapshot only. Shared visits count once. No availability guarantee, reservation or mutation.' } };
};

export const calendarPropose: ChatToolHandler = async (context,args) => {
  await context.authorize('calendar_propose_action');context.signal.throwIfAborted();
  try {
    const ticket = await proposeCalendarSchedule(database(),context.identity,enabledPermissions,context.turnId,args,context.signal);
    if ('clarification' in ticket) {
      await rememberCalendarRead(context.identity,context.turnId,ticket.stamp);
      await context.authorize('calendar_propose_action');
      return { evidence:{ type:'calendar-proposal-clarification',saved:false,message:ticket.clarification } };
    }
    await context.authorize('calendar_propose_action');
    return { calendarProposal:ticket,evidence:{ type:'calendar-schedule-proposal',untrusted:true,saved:false,instruction:'The complete proposal is available in the browser card. Only explicit browser confirmation can save it. No schedule has changed. Never claim it was saved from chat yes.' } };
  } catch (error) { if (error instanceof CalendarProposalValidationError) return { evidence:{ type:'calendar-proposal-clarification',saved:false,message:error.message } };throw error; }
};
