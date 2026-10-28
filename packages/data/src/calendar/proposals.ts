import { createHash,randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { calendarProposeSchema,calendarProposalDraftSchema,calendarProposalBindingSchema,calendarProposalStoredSchema,calendarProposalViewSchema,calendarProposalEvidenceSchema,chatPageContextSchema,
  type CalendarProposalTicket,type CalendarProposalStored,type CalendarProposalBinding,type AuthorizationContext,type PermissionId,type CalendarVisit } from '@salesmora/contracts';
import { authorize,resolveAuthorizedCollectionScope,CalendarRevisionError,scheduledJobStatus } from '@salesmora/domain';
import { withWorkspaceAuthorization,AuthorizationAccessError,type WorkspaceIdentity } from '../authorization/store';
import { readCalendar,readCalendarVisit,readCalendarAdvisories } from './read';
import { scheduleCalendarVisit } from './commands';
import { calendarChatStamp,readCalendarFocusForChat } from './chat';
import { calendarProposalData as copy } from './proposals.data';
export class CalendarProposalConflictError extends Error { constructor() { super(copy.conflict); } }
export class CalendarProposalValidationError extends Error {}
type Row = WorkspaceIdentity & { id:string;turnId:string;threadId:string;state:'pending'|'confirmed'|'cancelled'|'superseded';payload:CalendarProposalStored };
const identityFor = (c:AuthorizationContext) => ({ userId:c.userId,workspaceId:c.workspaceId });
function canonical(value:unknown):unknown {
  return Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).sort(([a],[b]) => a.localeCompare(b)).map(([k,v]) => [k,canonical(v)])) : value;
}
const refsDigest = (refs: readonly { type:string;id:string;expectedVersion:number }[]) => digest(refs.map(r => `${r.type}:${r.id}:${r.expectedVersion}`).sort());
const digest = (value:unknown) => createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
async function authority(trx:Knex.Transaction,c:AuthorizationContext) {
  const scope = resolveAuthorizedCollectionScope(c,'calendar.read');
  if (!authorize(c,{ permission:'assistant.use' }).allowed || !scope.allowed || !['workspace','own_assigned'].includes(scope.scope)) throw new AuthorizationAccessError();
  const membership = await trx('workspaceMemberships').where(identityFor(c)).select(trx.raw('xmin::text AS version')).first();
  if (!membership) throw new AuthorizationAccessError();
  // Bind every permission relevant to this domain; unrelated implemented modules are not scheduling authority.
  return digest([{ ...c,policy:{ ...c.policy,grants:[...c.policy.grants].sort((a,b) => JSON.stringify(a).localeCompare(JSON.stringify(b))) },enabledPermissions:c.enabledPermissions.filter(p => ['assistant.use','calendar.read','jobs.read','workorders.read','jobs.schedule.update','workorders.schedule.update'].includes(p)).sort() },membership.version]);
}
async function sourceTurn(trx:Knex.Transaction,c:AuthorizationContext,row:{ turnId:string;threadId:string },activeId?:string) {
  const turn = await trx('chatTurns').where({ ...identityFor(c),id:row.turnId,threadId:row.threadId }).first();
  if (!turn || !await trx('chatThreads').where({ ...identityFor(c),id:row.threadId }).first('id')) throw new AuthorizationAccessError();
  if (turn.state !== 'completed' && !(activeId === turn.id && ['accepted','running'].includes(turn.state) && new Date(turn.leaseUntil).getTime() > Date.now())) throw new AuthorizationAccessError();
  return turn;
}
export function calendarProposalBinding(draft:CalendarProposalStored['draft']):CalendarProposalBinding {
  return { proposalId:draft.id,inputHash:draft.inputHash,visitId:draft.visitId,revision:draft.revision };
}
function inputHash(payload:CalendarProposalStored) {
  const draft = Object.fromEntries(Object.entries(payload.draft).filter(([key]) => key !== 'inputHash' && key !== 'state'));
  return digest({ draft,command:payload.command,authority:payload.authority,stamp:payload.stamp });
}
function view(payload:CalendarProposalStored,state:CalendarProposalStored['draft']['state'] = payload.draft.state) {
  const draft = { ...payload.draft,state,records:payload.draft.records.map(r => state === 'confirmed' && r.type === 'job' ? { ...r,status:scheduledJobStatus(r.status,payload.draft.to.scheduledDate) } : r) };
  return calendarProposalViewSchema.parse({ draft,context:{ ...calendarProposalBinding(payload.draft),records:payload.command.records,read:true,canSchedule:true } });
}
async function fullVisit(trx:Knex.Transaction,c:AuthorizationContext,id:string,enabled:readonly PermissionId[]) {
  const visit = await readCalendarVisit(trx,identityFor(c),enabled,id);
  if (!visit.canReschedule || !visit.review) throw new AuthorizationAccessError();
  return visit as CalendarVisit & { review:NonNullable<CalendarVisit['review']> };
}
async function checked(trx:Knex.Transaction,c:AuthorizationContext,row:Row,enabled:readonly PermissionId[],activeId?:string) {
  await sourceTurn(trx,c,row,activeId);
  const payload = calendarProposalStoredSchema.parse(row.payload);
  if (payload.command.workspaceId !== c.workspaceId || payload.draft.id !== row.id || payload.draft.state !== row.state || payload.draft.inputHash !== inputHash(payload) || payload.authority !== await authority(trx,c)) throw new AuthorizationAccessError();
  const current = await fullVisit(trx,c,payload.draft.visitId,enabled);
  const stamp = await calendarChatStamp(trx,c);
  if (row.state === 'confirmed') {
    if (!payload.receipt || payload.resultStamp !== stamp || current.revision !== payload.receipt.revision || current.scheduledDate !== payload.draft.to.scheduledDate || current.arrivalWindow !== payload.draft.to.arrivalWindow || refsDigest(current.review.records) !== refsDigest(payload.receipt.records)) throw new CalendarProposalConflictError();
  } else if (payload.stamp !== stamp || current.revision !== payload.draft.revision || refsDigest(current.review.records) !== refsDigest(payload.command.records)) throw new CalendarProposalConflictError();
  return payload;
}
async function audit(trx:Knex.Transaction,row:Row,action:string) {
  await trx('chatCalendarProposalAudit').insert({ id:randomUUID(),workspaceId:row.workspaceId,actorId:row.userId,proposalId:row.id,action,inputHash:row.payload.draft.inputHash });
}
export async function proposeCalendarSchedule(db:Knex,identity:WorkspaceIdentity,enabled:readonly PermissionId[],turnId:string,raw:unknown,signal:AbortSignal):Promise<CalendarProposalTicket | { clarification:string;stamp:string }> {
  const input = calendarProposeSchema.parse(raw);
  return withWorkspaceAuthorization(db,identity,enabled,true,async (trx,c) => {
    signal.throwIfAborted(); const authorization = await authority(trx,c);
    const turn = await trx('chatTurns').where({ ...identity,id:turnId }).first();
    if (!turn || !['accepted','running'].includes(turn.state) || new Date(turn.leaseUntil).getTime() <= Date.now()) throw new AuthorizationAccessError();
    let ref = input.recordRef;
    if (!ref && turn.surfaceKey === 'calendar') {
      const page = chatPageContextSchema.parse(turn.pageContext);
      if (page.calendarVisit) ref = (await readCalendarFocusForChat(trx,identity,enabled,page.calendarVisit)).visit.id;
    }
    if (!ref && turn.surfaceKey === 'work_order.detail') {
      const page = chatPageContextSchema.parse(turn.pageContext), record = page.recordRefs?.find(r => r.type === 'work_order');
      if (record) ref = (await trx('calendarVisitRecords').where({ workspaceId:identity.workspaceId,workOrderId:record.id }).whereNull('endedAt').first('visitId'))?.visitId;
    }
    if (!ref) throw new CalendarProposalValidationError(copy.reference);
    let visitId = ref;
    if (/^(J|WO)-/i.test(ref)) {
      const job = /^J-/i.test(ref), number = Number(ref.slice(job ? 2 : 3));
      if (!Number.isSafeInteger(number) || number < 1 || number > 2147483647) throw new CalendarProposalValidationError(copy.reference);
      const record = await trx(job ? 'jobs' : 'workOrders').where({ workspaceId:identity.workspaceId,[job ? 'jobNumber' : 'workOrderNumber']:number }).first('id');
      const link = record && await trx('calendarVisitRecords').where({ workspaceId:identity.workspaceId,[job ? 'jobId' : 'workOrderId']:record.id }).whereNull('endedAt').first('visitId');
      if (!link) throw new AuthorizationAccessError(); visitId = link.visitId;
    }
    const current = await fullVisit(trx,c,visitId,enabled);
    const clearing = input.operation === 'clear';
    const arrivalWindow = clearing ? null : input.windowMode === 'keep' || (!input.windowMode && input.arrivalWindow === null) ? current.arrivalWindow : input.arrivalWindow;
    if (current.scheduledDate === input.scheduledDate && current.arrivalWindow === arrivalWindow) return { clarification:clearing ? copy.alreadyUnscheduled : copy.unchanged,stamp:await calendarChatStamp(trx,c) };
    const schedule = { scheduledDate:input.scheduledDate,arrivalWindow };
    // Clearing has no proposed day: overlap/workload/past-date advisories do not apply.
    const warnings:string[] = [];
    if (!clearing) {
      const advisories = await readCalendarAdvisories(trx,identity,enabled,{ workspaceId:identity.workspaceId,visitId,revision:current.revision,schedule });
      const calendar = await readCalendar(trx,identity,enabled,{ workspaceId:identity.workspaceId,date:input.scheduledDate });
      warnings.push(...(input.scheduledDate < calendar.today ? [copy.past] : []),...(current.completionDeadline && input.scheduledDate > current.completionDeadline.date ? [copy.after] : []),...advisories.messages,
        ...(calendar.entries.some(v => v.id !== current.id && v.scheduledDate === input.scheduledDate && !v.arrivalWindow && v.crew.some(p => current.crew.some(q => q.id === p.id))) ? [copy.unknown] : []));
    }
    const id = randomUUID(),now = new Date();
    const draft = calendarProposalDraftSchema.parse({ ...(clearing ? { intent:'clear' } : {}),id,inputHash:'0'.repeat(64),visitId,revision:current.revision,createdAt:now.toISOString(),expiresAt:new Date(now.getTime()+900000).toISOString(),state:'pending' as const,
      timezone:current.timezone,from:{ scheduledDate:current.scheduledDate,arrivalWindow:current.arrivalWindow },to:schedule,
      records:current.records.map(r => ({ ...r,expectedVersion:current.review.records.find(ref => ref.id === r.id && ref.type === r.type)!.expectedVersion })),crew:current.crew,warnings });
    const payload:CalendarProposalStored = { draft,command:{ workspaceId:identity.workspaceId,visitId,submissionId:id,expectedVisitVersion:current.review.expectedVisitVersion,records:current.review.records,schedule },authority:authorization,stamp:await calendarChatStamp(trx,c),receipt:null,resultStamp:null };
    draft.inputHash = inputHash(payload); calendarProposalStoredSchema.parse(payload);
    if (JSON.stringify(payload).length > 45000) return { clarification:copy.tooLarge,stamp:await calendarChatStamp(trx,c) };
    const replaced:Row[] = await trx('chatCalendarProposals').where({ ...identity,threadId:turn.threadId,state:'pending' }).forUpdate();
    for (const prior of replaced) {
      prior.payload.draft.state = 'superseded'; prior.state = 'superseded';
      await trx('chatCalendarProposals').where({ id:prior.id }).update({ state:prior.state,payload:JSON.stringify(prior.payload),resolvedAt:trx.fn.now() });await audit(trx,prior,'superseded');
    }
    const [row] = await trx('chatCalendarProposals').insert({ ...identity,id,turnId,threadId:turn.threadId,payload:JSON.stringify(payload) }).returning('*');
    await audit(trx,row,'proposed');
    const old = calendarProposalEvidenceSchema.parse(turn.calendarProposalEvidence ?? []).filter(id => !replaced.some(p => p.id === id));
    await trx('chatTurns').where({ ...identity,id:turnId }).update({ calendarProposalEvidence:JSON.stringify(calendarProposalEvidenceSchema.parse([...new Set([...old,id])])) });
    signal.throwIfAborted(); return { ...calendarProposalBinding(draft),state:'pending' as const };
  });
}
export async function readCalendarScheduleProposal(db:Knex,identity:WorkspaceIdentity,enabled:readonly PermissionId[],raw:unknown) {
  const binding = calendarProposalBindingSchema.parse(raw);
  return withWorkspaceAuthorization(db,identity,enabled,false,async (trx,c) => {
    const row:Row|undefined = await trx('chatCalendarProposals').where({ ...identity,id:binding.proposalId }).first();
    if (!row) throw new AuthorizationAccessError();
    if (digest(binding) !== digest(calendarProposalBinding(row.payload.draft))) throw new CalendarProposalConflictError();
    const payload = await checked(trx,c,row,enabled);
    return view(payload,row.state === 'pending' && Date.parse(payload.draft.expiresAt) <= Date.now() ? 'expired' : row.state);
  });
}
export async function operateCalendarScheduleProposal(db:Knex,identity:WorkspaceIdentity,enabled:readonly PermissionId[],raw:unknown,decision:'confirm'|'cancel') {
  const binding = calendarProposalBindingSchema.parse(raw);
  if (!['confirm','cancel'].includes(decision)) throw new CalendarProposalValidationError(copy.reference);
  return withWorkspaceAuthorization(db,identity,enabled,true,async (trx,c) => {
    const row:Row|undefined = await trx('chatCalendarProposals').where({ ...identity,id:binding.proposalId }).forUpdate().first();
    if (!row) throw new AuthorizationAccessError();
    if (digest(binding) !== digest(calendarProposalBinding(row.payload.draft))) throw new CalendarProposalConflictError();
    const payload = await checked(trx,c,row,enabled);
    if (row.state === 'confirmed' || row.state === 'cancelled') {
      if (decision !== (row.state === 'confirmed' ? 'confirm' : 'cancel')) throw new CalendarProposalConflictError();
      return view(payload);
    }
    if (row.state !== 'pending' || Date.parse(payload.draft.expiresAt) <= Date.now()) throw new CalendarProposalConflictError();
    if (decision === 'confirm') {
      try {
        const result = await scheduleCalendarVisit(trx,identity,enabled,payload.command,'assistant-confirmed');
        const current = await fullVisit(trx,c,payload.draft.visitId,enabled);
        payload.receipt = { ...result,revision:current.revision };payload.resultStamp = await calendarChatStamp(trx,c);
      } catch (error) { if (error instanceof CalendarRevisionError) throw new CalendarProposalConflictError();throw error; }
    }
    row.state = decision === 'confirm' ? 'confirmed' : 'cancelled';payload.draft.state = row.state;
    calendarProposalStoredSchema.parse(payload);row.payload = payload;
    await trx('chatCalendarProposals').where({ id:row.id }).update({ state:row.state,payload:JSON.stringify(payload),resolvedAt:trx.fn.now() });await audit(trx,row,row.state);
    await checked(trx,c,row,enabled);return view(payload);
  });
}
export async function calendarProposalEvidenceAllowed(trx:Knex.Transaction,c:AuthorizationContext,enabled:readonly PermissionId[],turn:{ id:string;threadId:string;calendarProposalEvidence?:unknown }) {
  for (const id of calendarProposalEvidenceSchema.parse(turn.calendarProposalEvidence ?? [])) {
    const row:Row|undefined = await trx('chatCalendarProposals').where({ ...identityFor(c),threadId:turn.threadId,id }).first();
    if (!row) return false;
    try { const payload = await checked(trx,c,row,enabled,turn.id);
      if (row.state === 'superseded' || (row.state === 'pending' && Date.parse(payload.draft.expiresAt) <= Date.now())) return false;
    } catch (error) { if (error instanceof AuthorizationAccessError || error instanceof CalendarProposalConflictError) return false;throw error; }
  }
  return true;
}
export async function visibleCalendarScheduleProposal(trx:Knex.Transaction,c:AuthorizationContext,enabled:readonly PermissionId[],turnId:string) {
  const row:Row|undefined = await trx('chatCalendarProposals').where({ ...identityFor(c),turnId }).orderBy('createdAt','desc').orderBy('id','desc').first();
  if (!row) return undefined;
  try { const payload = await checked(trx,c,row,enabled);return { ...calendarProposalBinding(payload.draft),state:row.state === 'pending' && Date.parse(payload.draft.expiresAt) <= Date.now() ? 'expired' as const : row.state }; }
  catch (error) { if (error instanceof AuthorizationAccessError || error instanceof CalendarProposalConflictError) return undefined;throw error; }
}
