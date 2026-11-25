import { createHash } from 'node:crypto';
import type { Knex } from 'knex';
import { calendarAvailabilityCommandSchema, calendarPersonAvailabilityResultSchema, CalendarContractError,
  type CalendarAvailability, type CalendarPersonAvailabilityResult, type PermissionId, type AuthorizationContext } from '@salesmora/contracts';
import { authorize, CalendarRevisionError } from '@salesmora/domain';
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from '../authorization/store';
import { calendarMembersQuery } from './read';

type Saved = { version: number; timezone: string; availability: CalendarAvailability };
export function calendarAvailabilityRevision(personId: string, currentTimezone: string, saved?: Saved) {
  return createHash('sha256').update(JSON.stringify([personId, currentTimezone, saved?.version ?? 0, saved?.timezone ?? null])).digest('hex');
}
async function current(trx: Knex.Transaction, context: AuthorizationContext, personId: string, fromTeamSettings = false) {
  // Team settings has explicit workspace-wide member-setting visibility; Calendar retains its own scope.
  if (fromTeamSettings && !authorize(context, { permission: 'settings.business.read' }).allowed) throw new AuthorizationAccessError();
  const person = fromTeamSettings ? await trx('workspaceMemberships as m').join('users as u', 'u.id', 'm.userId')
    .where({ 'm.workspaceId': context.workspaceId, 'u.id': personId }).whereNull('u.suspendedAt').whereNull('u.deletionRequestedAt').first('u.id', 'u.name')
    : (await calendarMembersQuery(trx, context, personId)).find(member => member.id === personId);
  if (!person) throw new AuthorizationAccessError();
  const workspace = await trx('workspaces').where({ id: context.workspaceId }).first('timezone');
  const saved: Saved | undefined = await trx('calendarPersonAvailability').where({ workspaceId: context.workspaceId, personId }).first('version', 'timezone', 'availability');
  const result = calendarPersonAvailabilityResultSchema.parse({ person, revision: calendarAvailabilityRevision(personId, workspace.timezone, saved),
    timezone: saved?.timezone ?? workspace.timezone, availability: saved?.availability ?? { weeklyHours: null, unavailableDates: [] },
    canEdit: authorize(context, { permission: 'settings.business.update' }).allowed });
  return { result, currentTimezone: workspace.timezone as string };
}
export async function readCalendarAvailability(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], personId: string) {
  if (!personId || personId.length > 200) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => (await current(trx, context, personId)).result);
}
export async function saveCalendarAvailability(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown) {
  return withWorkspaceAuthorization(db, identity, enabled, true, (trx, context) => saveCalendarAvailabilityInTransaction(trx, context, raw));
}
/** Shared persistence; callers already hold current workspace mutation authority. */
export async function saveCalendarAvailabilityInTransaction(trx: Knex.Transaction, context: AuthorizationContext, raw: unknown, fromTeamSettings = false) {
  const parsed = calendarAvailabilityCommandSchema.safeParse(raw);
  if (!parsed.success) throw new CalendarContractError(parsed.error.issues);
  const input = parsed.data;
  const identity = { workspaceId: context.workspaceId, userId: context.userId };
  if (identity.workspaceId !== input.workspaceId) throw new AuthorizationAccessError();
  // Current member visibility and permission are checked even for an otherwise valid receipt replay.
  const { result: before, currentTimezone } = await current(trx, context, input.personId, fromTeamSettings);
  if (!before.canEdit) throw new AuthorizationAccessError();
  const hash = createHash('sha256').update(JSON.stringify(input)).digest('hex');
  const previous = await trx('calendarAvailabilityOperations').where({ workspaceId: identity.workspaceId, submissionId: input.submissionId }).first();
  if (previous) {
    if (previous.actorId !== identity.userId || previous.payloadHash !== hash || previous.personId !== input.personId) throw new CalendarRevisionError();
    return calendarPersonAvailabilityResultSchema.parse(previous.result);
  }
  if (before.revision !== input.revision || before.timezone !== input.timezone) throw new CalendarRevisionError();
  const [saved] = await trx('calendarPersonAvailability').insert({ workspaceId: identity.workspaceId, personId: input.personId,
    version: 1, timezone: input.timezone, availability: JSON.stringify(input.availability) })
    .onConflict(['workspaceId', 'personId']).merge({ version: trx.raw('"calendarPersonAvailability".version + 1'),
      availability: JSON.stringify(input.availability), updatedAt: trx.fn.now() }).returning(['version', 'timezone', 'availability']);
  const result: CalendarPersonAvailabilityResult = { ...before, revision: calendarAvailabilityRevision(input.personId, currentTimezone, saved), availability: saved.availability };
  await trx('calendarAvailabilityOperations').insert({ workspaceId: identity.workspaceId, submissionId: input.submissionId,
    actorId: identity.userId, personId: input.personId, payloadHash: hash, before: JSON.stringify(before), result: JSON.stringify(result) });
  return result;
}
