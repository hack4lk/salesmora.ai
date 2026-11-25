import { createHash } from 'node:crypto';
import type { Knex } from 'knex';
import { saveTeamMemberSchema, teamSettingsMemberSchema, teamSettingsQuerySchema, teamSettingsSnapshotSchema,
  type AuthorizationContext, type CalendarAvailability, type PermissionId } from '@salesmora/contracts';
import { authorize, CalendarRevisionError } from '@salesmora/domain';
import { AuthorizationAccessError, withCurrentWorkspaceMutation, withWorkspaceAuthorization, type WorkspaceIdentity } from '../authorization/store';
import { calendarAvailabilityRevision, saveCalendarAvailabilityInTransaction } from '../calendar/availability';

export class TeamSettingsInvalid extends Error {}
export class TeamSettingsConflict extends Error {}
function permit(context: AuthorizationContext, write = false) {
  if (!authorize(context, { permission: 'settings.business.read' }).allowed || write && !authorize(context, { permission: 'settings.business.update' }).allowed) throw new AuthorizationAccessError();
}
function coverageRevision(personId: string, version = 0) { return createHash('sha256').update(JSON.stringify([personId, version])).digest('hex'); }
function members(trx: Knex.Transaction, workspaceId: string) {
  return trx('workspaceMemberships as m').join('users as u', 'u.id', 'm.userId').where('m.workspaceId', workspaceId)
    .whereNull('u.suspendedAt').whereNull('u.deletionRequestedAt');
}
async function projection(trx: Knex.Transaction, workspaceId: string, timezone: string, options: { personId?: string; page?: number; pageSize?: number }) {
  const rows = await members(trx, workspaceId)
    .leftJoin('calendarPersonAvailability as a', join => join.on('a.workspaceId', 'm.workspaceId').andOn('a.personId', 'm.userId'))
    .leftJoin('workspaceMemberCoverage as c', join => join.on('c.workspaceId', 'm.workspaceId').andOn('c.personId', 'm.userId'))
    .modify(query => { if (options.personId) query.where('m.userId', options.personId); })
    .select('u.id', 'u.name', 'm.role', 'a.version as availabilityVersion', 'a.timezone', 'a.availability', 'c.version as coverageVersion',
      trx.raw(`ARRAY(SELECT p."postalCode" FROM "workspaceMemberPostalCodes" p WHERE p."workspaceId"=m."workspaceId" AND p."personId"=m."userId" AND p."countryCode"='US' ORDER BY p."postalCode") AS "workZipCodes"`))
    .orderBy('u.name').orderBy('u.id').limit(options.pageSize ?? 1).offset(((options.page ?? 1) - 1) * (options.pageSize ?? 1));
  return rows.map((row: { id: string; name: string; role: string; availabilityVersion: number | null; timezone: string | null; availability: CalendarAvailability | null; coverageVersion: number | null; workZipCodes: string[] }) => teamSettingsMemberSchema.parse({ id: row.id, name: row.name, role: row.role,
    revision: calendarAvailabilityRevision(row.id, timezone, row.availabilityVersion ? { version: row.availabilityVersion, timezone: row.timezone!, availability: row.availability! } : undefined),
    coverageRevision: coverageRevision(row.id, row.coverageVersion ?? 0), timezone: row.timezone ?? timezone,
    availability: row.availability ?? { weeklyHours: null, unavailableDates: [] }, workZipCodes: row.workZipCodes,
  }));
}
export async function readTeamSettingsInTransaction(trx: Knex.Transaction, context: AuthorizationContext, raw: unknown = {}) {
  permit(context);
  const query = teamSettingsQuerySchema.safeParse(raw); if (!query.success) throw new TeamSettingsInvalid('Choose a valid team page.');
  const workspace = await trx('workspaces').where({ id: context.workspaceId }).first('timezone');
  const total = Number((await members(trx, context.workspaceId).count('* as total').first())!.total);
  const page = Math.min(query.data.page, Math.max(1, Math.ceil(total / query.data.pageSize)));
  const rows = await projection(trx, context.workspaceId, workspace.timezone, { page, pageSize: query.data.pageSize });
  return teamSettingsSnapshotSchema.parse({ workspaceId: context.workspaceId, members: rows, total, page, pageSize: query.data.pageSize,
    canManage: authorize(context, { permission: 'settings.business.update' }).allowed });
}
export function readTeamSettings(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown = {}) {
  return withWorkspaceAuthorization(db, identity, enabled, false, (trx, context) => readTeamSettingsInTransaction(trx, context, raw));
}
export async function saveTeamMember(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown) {
  const parsed = saveTeamMemberSchema.safeParse(raw); if (!parsed.success) throw new TeamSettingsInvalid('Check the member changes and ZIP codes.');
  const input = parsed.data; if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withCurrentWorkspaceMutation(db, identity, enabled, async (trx, context) => {
    permit(context, true);
    const { command } = input, workspace = await trx('workspaces').where({ id: context.workspaceId }).first('timezone');
    const [before] = await projection(trx, context.workspaceId, workspace.timezone, { personId: command.personId });
    if (!before) throw new AuthorizationAccessError();
    const inputHash = createHash('sha256').update(JSON.stringify(input)).digest('hex');
    const receipt = await trx('teamSettingsOperations').where({ workspaceId: context.workspaceId, requestId: input.requestId }).first();
    if (receipt) {
      if (receipt.actorId !== context.userId || receipt.inputHash !== inputHash || receipt.personId !== command.personId
        || receipt.result.revision !== before.revision || receipt.result.coverageRevision !== before.coverageRevision) throw new TeamSettingsConflict();
      return before;
    }
    if (command.coverage && command.coverage.revision !== before.coverageRevision || command.availability && command.availability.revision !== before.revision) throw new TeamSettingsConflict();
    if (command.availability) {
      try { await saveCalendarAvailabilityInTransaction(trx, context, { workspaceId: context.workspaceId, submissionId: input.requestId, personId: command.personId,
        revision: command.availability.revision, timezone: command.availability.timezone, availability: command.availability.value }, true); }
      catch (error) { if (error instanceof CalendarRevisionError) throw new TeamSettingsConflict(); throw error; }
    }
    if (command.coverage) {
      await trx('workspaceMemberCoverage').insert({ workspaceId: context.workspaceId, personId: command.personId, version: 1 })
        .onConflict(['workspaceId', 'personId']).merge({ version: trx.raw('"workspaceMemberCoverage".version + 1'), updatedAt: trx.fn.now() });
      await trx('workspaceMemberPostalCodes').where({ workspaceId: context.workspaceId, personId: command.personId }).delete();
      if (command.coverage.postalCodes.length) await trx('workspaceMemberPostalCodes').insert(command.coverage.postalCodes.map(postalCode => ({ workspaceId: context.workspaceId, personId: command.personId, countryCode: 'US', postalCode })));
    }
    const [result] = await projection(trx, context.workspaceId, workspace.timezone, { personId: command.personId });
    await trx('teamSettingsOperations').insert({ workspaceId: context.workspaceId, requestId: input.requestId, actorId: context.userId,
      personId: command.personId, inputHash, before: JSON.stringify(before), result: JSON.stringify(result) });
    return result;
  });
}
