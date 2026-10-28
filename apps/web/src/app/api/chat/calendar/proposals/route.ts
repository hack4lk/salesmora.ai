import { calendarProposalBindingSchema,calendarProposalDecisionSchema,calendarProposalViewSchema,CalendarContractError } from '@salesmora/contracts';
import { readCalendarScheduleProposal,operateCalendarScheduleProposal,CalendarProposalConflictError,CalendarProposalValidationError } from '@salesmora/data';
import { getSession } from '../../../../../server/auth/session';
import { database } from '../../../../../server/workspaces/store';
import { enabledPermissions } from '../../../../../server/authorization/permissions';
import { chatBody,chatError,chatReply,validChatOrigin } from '../../../../../server/chat/http';
const failure = (error:unknown) => error instanceof CalendarProposalConflictError ? chatReply({ error:'conflict' },409) : error instanceof CalendarProposalValidationError || error instanceof CalendarContractError ? chatReply({ error:'invalid_request' },422) : chatError(error);
export async function GET(request:Request) {
  const session = await getSession();if (!session) return chatReply({ error:'authentication_required' },401);
  const params = Object.fromEntries(new URL(request.url).searchParams),workspaceId = params.workspaceId;
  const parsed = calendarProposalDecisionSchema.shape.workspaceId.safeParse(workspaceId);
  const binding = calendarProposalBindingSchema.safeParse(Object.fromEntries(Object.entries(params).filter(([k]) => k !== 'workspaceId')));
  if (!parsed.success || !binding.success) return chatReply({ error:'invalid_request' },422);
  try { return chatReply({ view:calendarProposalViewSchema.parse(await readCalendarScheduleProposal(database(),{ userId:session.user.id,workspaceId:parsed.data },enabledPermissions,binding.data)) }); } catch (error) { return failure(error); }
}
export async function POST(request:Request) {
  if (!validChatOrigin(request)) return chatReply({ error:'invalid_origin' },403);
  const session = await getSession();if (!session) return chatReply({ error:'authentication_required' },401);
  try {
    const parsed = calendarProposalDecisionSchema.safeParse(await chatBody(request));if (!parsed.success) return chatReply({ error:'invalid_request' },422);
    const { workspaceId,decision,...binding } = parsed.data;
    return chatReply({ view:calendarProposalViewSchema.parse(await operateCalendarScheduleProposal(database(),{ userId:session.user.id,workspaceId },enabledPermissions,binding,decision)) });
  } catch (error) { return failure(error); }
}
