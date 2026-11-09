import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import knex from 'knex';
import { activityReportReadResultSchema, permissionIds } from '@salesmora/contracts';
import { addCalendarDays } from '@salesmora/domain';
import { AuthorizationAccessError, initializeWorkspacePolicy, withWorkspaceAuthorization } from '../authorization/store';
import { replayMigrations } from '../migration-replay';
import { down as rollbackTemplates } from '../migrations/202611120005_report_templates';
import { createReportTemplateInTransaction, deleteReportTemplateInTransaction, listReportTemplatesInTransaction,
  ReportTemplateConflictError, runReportTemplateConfigurationInTransaction, runReportTemplateInTransaction,
  updateReportTemplateInTransaction } from './template';

process.loadEnvFile(fileURLToPath(new URL('../../../../.env.local', import.meta.url)));
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith('_test') ||
  !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) throw new Error('Use a separate local _test database.');
const name = `report_template_${randomUUID().replaceAll('-', '')}_test`;
const admin = knex({ client: 'pg', connection });
const url = new URL(connection); url.pathname = `/${name}`;
const db = knex({ client: 'pg', connection: url.toString() });
const workspaceId = randomUUID(), otherWorkspace = randomUUID(), owner = randomUUID(), other = randomUUID();
const identity = { workspaceId, userId: owner }, otherIdentity = { workspaceId: otherWorkspace, userId: other };
const enabled = [...permissionIds];
let created = false;
try {
  await admin.raw('CREATE DATABASE ??', [name]); created = true;
  await replayMigrations(db);
  await db.transaction(async trx => {
    await trx('users').insert([owner, other].map(id => ({ id, name: 'Template fixture', email: `${id}@example.test`,
      termsVersion: 'fixture', termsAcceptedAt: new Date(), createdAt: new Date(), updatedAt: new Date() })));
    await trx('workspaces').insert([
      { id: workspaceId, ownerId: owner, businessName: 'First', businessType: 'test',
        postalCode: '', serviceRange: '', timezone: 'Pacific/Auckland' },
      { id: otherWorkspace, ownerId: other, businessName: 'Second', businessType: 'test',
        postalCode: '', serviceRange: '', timezone: 'UTC' },
    ]);
    await trx('workspaceMemberships').insert([
      { workspaceId, userId: owner, role: 'owner' }, { workspaceId, userId: other, role: 'field' },
      { workspaceId: otherWorkspace, userId: other, role: 'owner' },
    ]);
    await initializeWorkspacePolicy(trx, identity);
    await initializeWorkspacePolicy(trx, otherIdentity);
  });
  const withIdentity = <T>(who: typeof identity, write: boolean,
    callback: Parameters<typeof withWorkspaceAuthorization<T>>[4], permissions = enabled) =>
    withWorkspaceAuthorization(db, who, permissions, write, callback);
  const configuration = { area: 'activity', query: { view: 'activity', filters: { domains: [], actions: [], actors: [] } },
    period: { preset: 'last30days' } } as const;
  const saved = await withIdentity(identity, true, (trx, context) =>
    createReportTemplateInTransaction(trx, context, { workspaceId, name: 'Activity', configuration }));
  assert.equal((await withIdentity(identity, false, (trx, context) => listReportTemplatesInTransaction(trx, context, 'activity'))).length, 1);
  assert.deepEqual(await withIdentity({ workspaceId, userId: other }, false,
    (trx, context) => listReportTemplatesInTransaction(trx, context, 'activity')), []);
  await assert.rejects(withIdentity(otherIdentity, false, (trx, context) => runReportTemplateInTransaction(trx, context, saved.id)), AuthorizationAccessError);
  await assert.rejects(withIdentity({ workspaceId, userId: other }, false,
    (trx, context) => runReportTemplateInTransaction(trx, context, saved.id)), AuthorizationAccessError);
  await assert.rejects(withIdentity(identity, true, (trx, context) =>
    createReportTemplateInTransaction(trx, context, { workspaceId, name: ' activity ', configuration })), ReportTemplateConflictError);
  const run = await withIdentity(identity, false, (trx, context) => runReportTemplateInTransaction(trx, context, saved.id));
  const activity = activityReportReadResultSchema.parse(run.result);
  assert.equal(activity.query.period.to, activity.report.today);
  assert.equal(activity.query.period.from, addCalendarDays(activity.report.today, -29));
  await assert.rejects(withIdentity(identity, false, (trx, context) => runReportTemplateInTransaction(trx, context, saved.id),
    enabled.filter(permission => permission !== 'reports.read')), AuthorizationAccessError);
  const estimate = { area: 'estimates', query: { view: 'estimate-current', selected: 'awaiting',
    filters: { owners: [], parents: [] } }, period: null } as const;
  await withIdentity({ workspaceId, userId: other }, false, (trx, context) =>
    runReportTemplateConfigurationInTransaction(trx, context, estimate));
  await assert.rejects(withIdentity({ workspaceId, userId: other }, false, (trx, context) =>
    runReportTemplateConfigurationInTransaction(trx, context, { ...estimate, query: { ...estimate.query, selected: 'handoff' } })),
  AuthorizationAccessError);
  const renamed = await withIdentity(identity, true, (trx, context) =>
    updateReportTemplateInTransaction(trx, context, saved.id, { workspaceId, version: saved.version, name: 'Renamed' }));
  assert.equal(renamed.version, saved.version + 1);
  const fixed = { ...configuration, period: { preset: 'custom', from: activity.report.today, to: activity.report.today } };
  const updated = await withIdentity(identity, true, (trx, context) =>
    updateReportTemplateInTransaction(trx, context, saved.id, { workspaceId, version: renamed.version, configuration: fixed }));
  const fixedRun = await withIdentity(identity, false, (trx, context) => runReportTemplateInTransaction(trx, context, saved.id));
  assert.deepEqual(activityReportReadResultSchema.parse(fixedRun.result).query.period,
    { from: activity.report.today, to: activity.report.today });
  await assert.rejects(withIdentity(identity, true, (trx, context) =>
    deleteReportTemplateInTransaction(trx, context, saved.id, { workspaceId, version: saved.version })), ReportTemplateConflictError);
  await assert.rejects(rollbackTemplates(db), /saved templates exist/);
  await withIdentity(identity, true, (trx, context) =>
    deleteReportTemplateInTransaction(trx, context, saved.id, { workspaceId, version: updated.version }));
  assert.deepEqual(await withIdentity(identity, false, (trx, context) => listReportTemplatesInTransaction(trx, context, 'activity')), []);
  console.log('Personal template isolation, rolling periods, authorization and CRUD rehearsal passed.');
} finally {
  await db.destroy();
  if (created) await admin.raw('DROP DATABASE ??', [name]);
  await admin.destroy();
}
