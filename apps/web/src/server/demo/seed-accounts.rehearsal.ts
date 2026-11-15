import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { verifyPassword } from 'better-auth/crypto';
import { createDatabase, readEstimateDecisionsReportInTransaction, withWorkspaceAuthorization } from '@salesmora/data';
import { migrateFreshBaseline } from '@salesmora/data/baseline-runner';
import { seedDemoCrm } from '@salesmora/data/demo/seed-crm';
import { permissionIds } from '@salesmora/contracts';
import { effectiveWorkspacePlan } from '@salesmora/domain';
import { readCalendar } from '../../../../../packages/data/src/calendar/read';
import { demoAccounts, seedDemoAccounts, type DemoCredentials } from './seed-accounts';

const envFile = fileURLToPath(new URL('../../../../../.env.local', import.meta.url));
if (existsSync(envFile)) process.loadEnvFile(envFile);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL ||
    !new URL(connection).pathname.endsWith('_test') ||
    !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)) {
  throw new Error('A separate local TEST_DATABASE_URL ending in _test is required.');
}
const name = `demo_accounts_${randomUUID().replaceAll('-', '')}_test`;
const secondName = `demo_accounts_${randomUUID().replaceAll('-', '')}_test`;
const url = new URL(connection);
url.pathname = `/${name}`;
const owner = createDatabase(connection);
const db = createDatabase(url.toString());
url.pathname = `/${secondName}`;
const secondDb = createDatabase(url.toString());
let created = false;
let secondCreated = false;
try {
  await owner.raw('CREATE DATABASE ??', [name]);
  created = true;
  await migrateFreshBaseline(db);
  const credentials: DemoCredentials = {
    DEMO_OWNER_PASSWORD: 'owner-test-password',
    DEMO_ADMIN_PASSWORD: 'admin-test-password',
    DEMO_OFFICE_PASSWORD: 'office-test-password',
    DEMO_FIELD_PASSWORD: 'field-test-password',
    DEMO_FREE_OWNER_PASSWORD: 'free-test-password',
    DEMO_STANDARD_OWNER_PASSWORD: 'standard-test-password',
  };
  const now = new Date('2025-12-31T12:00:00Z');
  const seeded = await seedDemoAccounts(db, credentials, now, 'UTC');
  await seedDemoCrm(db, seeded, now);
  const rows = await db('users').join('accounts', 'users.id', 'accounts.userId')
    .select('users.email', 'users.emailVerified', 'accounts.providerId', 'accounts.password');
  assert.equal(rows.length, 6);
  for (const account of demoAccounts) {
    const row = rows.find(candidate => candidate.email === account.email);
    assert.ok(row);
    assert.equal(row.emailVerified, true);
    assert.equal(row.providerId, 'credential');
    assert.equal(await verifyPassword({ hash: row.password, password: credentials[account.key] }), true);
  }
  const members = await db('workspaceMemberships').where({ workspaceId: seeded.workspaces.main }).select('role');
  assert.deepEqual(members.map(row => row.role).sort(), ['admin', 'field', 'office', 'owner']);
  const subscriptions = await db('workspaceSubscriptions').select('workspaceId', 'plan', 'status', 'paidThrough');
  assert.equal(subscriptions.length, 3);
  for (const row of subscriptions) {
    assert.equal(effectiveWorkspacePlan(row, null, now).plan, row.plan);
    assert.ok(await db('workspacePolicies').where({ workspaceId: row.workspaceId }).first());
  }
  assert.equal((await db('workspaceMemberships').where({ workspaceId: seeded.workspaces.free })).length, 1);
  assert.equal((await db('workspaceMemberships').where({ workspaceId: seeded.workspaces.standard })).length, 1);
  for (const [table, expected] of [['customers', 16], ['leads', 25], ['jobs', 16], ['workOrders', 16],
    ['calendarVisits', 16], ['estimates', 16], ['estimate_decisions', 6], ['materialCatalog', 9]] as const) {
    const [{ count }] = await db(table).count<{ count: string }[]>('* as count');
    assert.equal(Number(count), expected, table);
  }
  const today = await db('calendarVisits').where({ workspaceId: seeded.workspaces.main, scheduledDate: '2025-12-31' });
  assert.equal(today.length, 1);
  assert.ok(await db('leads').where({ workspaceId: seeded.workspaces.main, stage: 'new' }).whereNull('ownerId').first());
  assert.ok(await db('jobs').where({ workspaceId: seeded.workspaces.main, status: 'in-progress' })
    .where('completionDeadline', '<', '2025-12-31').first());
  const future = await db('calendarVisits').where({ workspaceId: seeded.workspaces.main, scheduledDate: '2026-01-01' });
  assert.equal(future.length, 1);
  const identity = { workspaceId: seeded.workspaces.main, userId: seeded.users.DEMO_OWNER_PASSWORD };
  const calendar = await readCalendar(db, identity, permissionIds, { workspaceId: identity.workspaceId, date: '2025-12-31' });
  assert.ok(calendar.entries.some(entry => entry.scheduledDate === '2025-12-31'));
  const field = await readCalendar(db, { ...identity, userId: seeded.users.DEMO_FIELD_PASSWORD }, permissionIds,
    { workspaceId: identity.workspaceId, date: '2025-12-31' });
  assert.ok(field.entries.some(entry => entry.scheduledDate === '2025-12-31'));
  const report = await withWorkspaceAuthorization(db, identity, permissionIds, false, (trx, authority) =>
    readEstimateDecisionsReportInTransaction(trx, authority, {
      workspaceId: identity.workspaceId, view: 'estimate-decisions',
      period: { from: '2025-12-01', to: '2025-12-31' }, selected: 'accepted', page: 1, pageSize: 25,
    }));
  assert.equal(report.counts.accepted, 2);
  assert.deepEqual(report.money, { kind: 'available', preTaxCents: 55000, customerTotalCents: 55000 });
  const totals = await db('estimate_decisions').sum<{ total: string }[]>('snapshotTotalCents as total').first();
  assert.equal(Number(totals?.total), 165000);
  const secondTime = new Date('2026-03-01T01:00:00Z');
  await owner.raw('CREATE DATABASE ??', [secondName]);
  secondCreated = true;
  await migrateFreshBaseline(secondDb);
  const secondContext = await seedDemoAccounts(secondDb, credentials, secondTime, 'America/New_York');
  await seedDemoCrm(secondDb, secondContext, secondTime);
  const secondIdentity = { workspaceId: secondContext.workspaces.main, userId: secondContext.users.DEMO_OWNER_PASSWORD };
  const localToday = await readCalendar(secondDb, secondIdentity, permissionIds,
    { workspaceId: secondIdentity.workspaceId, date: '2026-02-28' });
  assert.ok(localToday.entries.some(entry => entry.scheduledDate === '2026-02-28'));
  const localTomorrow = await readCalendar(secondDb, secondIdentity, permissionIds,
    { workspaceId: secondIdentity.workspaceId, date: '2026-03-01' });
  assert.ok(localTomorrow.entries.some(entry => entry.scheduledDate === '2026-03-01'));
  console.log('Demo CRM: connected records, material costs, accepted estimates and year-boundary visits verified.');
  console.log('Demo accounts: six valid credentials, four roles, three policies and three effective plans verified.');
} finally {
  await Promise.all([db.destroy(), secondDb.destroy()]);
  try {
    if (created) await owner.raw('DROP DATABASE ??', [name]);
    if (secondCreated) await owner.raw('DROP DATABASE ??', [secondName]);
  } finally {
    await owner.destroy();
  }
}
