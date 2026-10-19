/** Opt-in PostgreSQL rehearsal. Never runs against development or changes existing test tables. */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import knex from 'knex';
import { createDefaultWorkspacePolicy } from '@salesmora/domain';
import type { PermissionId, WorkspacePolicy } from '@salesmora/contracts';
import { up as auth } from '../migrations/202610090001_auth';
import { up as workspaces } from '../migrations/202610110001_workspaces';
import { up as invitations } from '../migrations/202610110002_invitation_delivery';
import { up as leads } from '../migrations/202610110003_leads';
import { up as authorization } from '../migrations/202610120001_authorization';
import { up as deletion } from '../migrations/202610140001_account_deletion';
import { up as leadReadModel } from '../migrations/202610150001_leads_read_model';
import { initializeWorkspacePolicy, saveWorkspacePolicy, listAuthorizedLeads, authorizedLeadPipelineCounts, AuthorizationAccessError, AuthorizationConflictError } from './store';

const envFile = fileURLToPath(new URL('../../../../.env.local', import.meta.url));
if (existsSync(envFile)) process.loadEnvFile(envFile);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith('_test')) throw new Error('Authorization rehearsal requires TEST_DATABASE_URL ending in _test.');
const schema = `authorization_rehearsal_${randomUUID().replaceAll('-', '')}`;
const admin = knex({ client: 'pg', connection });
const db = knex({ client: 'pg', connection: { connectionString: connection, options: `-c search_path=${schema}` }, pool: { min: 0, max: 5 } });
let checks = 0;
async function check(name: string, run: () => Promise<void>) { await run(); checks++; console.log(`PASS ${name}`); }
const a = randomUUID(), b = randomUUID();
const features: PermissionId[] = ['leads.read', 'leads.update', 'leads.stage.update', 'permissions.read', 'permissions.manage'];
const identity = (userId: string, workspaceId = a) => ({ userId, workspaceId });
const nextPolicy = (revision: number): WorkspacePolicy => createDefaultWorkspacePolicy(a, revision);
try {
  await admin.raw('CREATE SCHEMA ??', [schema]);
  await db.transaction(async trx => { await auth(trx); await workspaces(trx); await invitations(trx); await leads(trx); });
  const now = new Date();
  await db('users').insert(['owner', 'admin', 'office', 'field', 'outsider', 'second-owner'].map(id => ({ id, name: id, email: `${id}@example.test`, createdAt: now, updatedAt: now, termsVersion: 'test', termsAcceptedAt: now })));
  await db('workspaces').insert([{ id: a, ownerId: 'owner' }, { id: b, ownerId: 'second-owner' }].map(row => ({ ...row, businessName: 'Fictional workspace', businessType: 'test', postalCode: '', serviceRange: '' })));
  await db('workspaceMemberships').insert([
    { workspaceId: a, userId: 'owner', role: 'owner', profile: 'office' },
    { workspaceId: a, userId: 'admin', role: 'admin', profile: 'field' },
    { workspaceId: a, userId: 'office', role: 'member', profile: 'office' },
    { workspaceId: a, userId: 'field', role: 'member', profile: 'field' },
    { workspaceId: b, userId: 'second-owner', role: 'owner', profile: 'office' },
    { workspaceId: b, userId: 'field', role: 'member', profile: 'office' },
  ]);
  await db('workspaceInvitations').insert(['office', 'field'].map(profile => ({ id: randomUUID(), workspaceId: a, email: `${profile}-invite@example.test`, role: 'member', profile, status: 'queued' })));
  await db('leads').insert([
    { workspaceId: a, ownerId: 'field', stage: 'new' },
    { workspaceId: a, ownerId: 'office', stage: 'contacted' },
    { workspaceId: a, ownerId: null, stage: 'new' },
    { workspaceId: b, ownerId: null, stage: 'new' },
  ].map((row, i) => ({ ...row, id: randomUUID(), createdBy: null, submissionId: randomUUID(), submissionHash: `test-${i}`, name: `Fictional lead ${i}`, email: '', phone: '', service: '', address: '', details: '', notes: '', source: 'other' })));
  const original = await db('workspaceMemberships').orderBy(['workspaceId', 'userId']);
  await check('migration transaction rollback restores legacy memberships and removes new tables', async () => {
    const rollback = new Error('rehearsed rollback');
    await assert.rejects(db.transaction(async trx => { await authorization(trx); throw rollback; }), error => error === rollback);
    assert.deepEqual(await db('workspaceMemberships').orderBy(['workspaceId', 'userId']), original);
    assert.equal(await db.schema.hasTable('workspacePolicies'), false);
  });
  await db.transaction(authorization);
  await db.transaction(deletion);
  await db.transaction(leadReadModel);
  await check('members and pending invitations map predictably; Admin remains Admin', async () => {
    const rows = await db('workspaceMemberships').where({ workspaceId: a }).select('userId', 'role');
    assert.deepEqual(Object.fromEntries(rows.map(row => [row.userId, row.role])), { owner: 'owner', admin: 'admin', office: 'office', field: 'field' });
    const invites = await db('workspaceInvitations').select('role', 'email', 'inviterId');
    assert(invites.every(row => row.email.startsWith(row.role) && row.inviterId === 'owner'));
    assert.equal(await db.schema.hasColumn('workspaceMemberships', 'profile'), false);
    assert.equal(await db('workspacePolicies').count('* as count').first().then(row => Number(row?.count)), 2);
  });
  await check('Field lists and pipeline aggregates include only assigned leads, before LIMIT', async () => {
    assert.equal((await listAuthorizedLeads(db, identity('field'), features, 1))[0].name, 'Fictional lead 0');
    assert.deepEqual(await authorizedLeadPipelineCounts(db, identity('field'), features), { new: 1 });
    assert.equal((await listAuthorizedLeads(db, identity('field'), features)).length, 1);
  });
  await check('Owner/Admin/Office read workspace leads including unassigned; no other tenant rows', async () => {
    for (const user of ['owner', 'admin', 'office']) assert.equal((await listAuthorizedLeads(db, identity(user), features)).length, 3);
    assert.deepEqual(await authorizedLeadPipelineCounts(db, identity('office'), features), { new: 2, contacted: 1 });
    assert.equal((await listAuthorizedLeads(db, identity('field', b), features)).length, 1);
  });
  await check('nonmembers, absent feature and invalid limits deny', async () => {
    await assert.rejects(listAuthorizedLeads(db, identity('outsider'), features), AuthorizationAccessError);
    await assert.rejects(listAuthorizedLeads(db, identity('owner', b), features), AuthorizationAccessError);
    await assert.rejects(listAuthorizedLeads(db, identity('field'), []), AuthorizationAccessError);
    await assert.rejects(listAuthorizedLeads(db, identity('owner'), features, 101), RangeError);
  });
  await check('Admin/Office/Field cannot save policy; no policy or audit changes', async () => {
    for (const user of ['admin', 'office', 'field']) await assert.rejects(saveWorkspacePolicy(db, identity(user), features, { expectedRevision: 0, policy: nextPolicy(1) }), AuthorizationAccessError);
    assert.equal((await db('authorizationAudit').where({ workspaceId: a })).length, 1);
  });
  await check('concurrent Owner saves allow one revision; other save conflicts; exactly one audit appended', async () => {
    const change = { expectedRevision: 0, policy: nextPolicy(1) };
    const results = await Promise.allSettled([saveWorkspacePolicy(db, identity('owner'), features, change), saveWorkspacePolicy(db, identity('owner'), features, change)]);
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    const failure = results.find(result => result.status === 'rejected');
    assert(failure?.status === 'rejected' && failure.reason instanceof AuthorizationConflictError);
    const audit = await db('authorizationAudit').where({ workspaceId: a, action: 'policy.saved' });
    assert.equal(audit.length, 1); assert.equal(audit[0].beforePolicy.revision, 0); assert.equal(audit[0].afterPolicy.revision, 1);
  });
  await check('invalid scope, protected Owner removal, cross-workspace and permanent-ceiling grants deny', async () => {
    const invalidScope = nextPolicy(2);
    invalidScope.grants = invalidScope.grants.map(g => g.role === 'field' && g.permission === 'leads.read' ? { ...g, scope: 'enabled' as const } : g);
    const policies = [invalidScope,
      { ...nextPolicy(2), workspaceId: b },
      { ...nextPolicy(2), grants: nextPolicy(2).grants.filter(g => !(g.role === 'owner' && g.permission === 'permissions.manage')) },
      { ...nextPolicy(2), grants: [...nextPolicy(2).grants, { role: 'field' as const, permission: 'leads.export' as const, scope: 'assigned' as const }] },
    ];
    for (const policy of policies) await assert.rejects(saveWorkspacePolicy(db, identity('owner'), features, { expectedRevision: 1, policy }), AuthorizationAccessError);
    assert.equal((await db('authorizationAudit').where({ workspaceId: a })).length, 2);
  });
  await check('audit-write failure rolls back grants and revision together', async () => {
    await db.raw(`ALTER TABLE "authorizationAudit" ADD CONSTRAINT rehearsal_reject_save CHECK (action <> 'policy.saved') NOT VALID`);
    try {
      const policy = nextPolicy(2); policy.grants = policy.grants.filter(g => !(g.role === 'office' && g.permission === 'leads.create'));
      const before = await db('workspaceRolePolicies').where({ workspaceId: a }).orderBy(['role', 'permission']);
      await assert.rejects(saveWorkspacePolicy(db, identity('owner'), features, { expectedRevision: 1, policy }), /rehearsal_reject_save/);
      assert.equal((await db('workspacePolicies').where({ workspaceId: a }).first()).revision, 1);
      assert.deepEqual(await db('workspaceRolePolicies').where({ workspaceId: a }).orderBy(['role', 'permission']), before);
    } finally { await db.raw('ALTER TABLE "authorizationAudit" DROP CONSTRAINT rehearsal_reject_save'); }
  });
  await check('membership mutations wait for an active protected-read workspace lock', async () => {
    const reader = await db.transaction();
    const writer = await db.transaction();
    let pending: Promise<number> | undefined;
    try {
      await reader('workspaces').where({ id: a }).forShare().first();
      const readerPid = (await reader.raw('SELECT pg_backend_pid() AS pid')).rows[0].pid;
      const writerPid = (await writer.raw('SELECT pg_backend_pid() AS pid')).rows[0].pid;
      pending = writer('workspaceMemberships').where(identity('office')).update({ role: 'field' }).then(count => count);
      let blockers: number[] = [];
      const deadline = Date.now() + 3000;
      while (!blockers.includes(readerPid) && Date.now() < deadline) {
        blockers = (await admin.raw('SELECT pg_blocking_pids(?) AS blockers', [writerPid])).rows[0].blockers;
        if (!blockers.includes(readerPid)) await new Promise(resolve => setTimeout(resolve, 10));
      }
      assert(blockers.includes(readerPid), 'Membership writer must wait on the protected workspace read');
      await reader.commit(); await pending; await writer.commit();
      assert.equal((await listAuthorizedLeads(db, identity('office'), features)).length, 1);
    } finally {
      if (!reader.isCompleted()) await reader.rollback();
      if (pending) await pending.catch(() => undefined);
      if (!writer.isCompleted()) await writer.rollback();
      await db('workspaceMemberships').where(identity('office')).update({ role: 'office' });
    }
  });
  await check('policy revocation affects the next read without cached/default fallback', async () => {
    const policy = nextPolicy(2); policy.grants = policy.grants.filter(g => !(g.role === 'field' && g.permission.startsWith('leads.')));
    await saveWorkspacePolicy(db, identity('owner'), features, { expectedRevision: 1, policy });
    await assert.rejects(listAuthorizedLeads(db, identity('field'), features), AuthorizationAccessError);
    assert.equal((await listAuthorizedLeads(db, identity('field', b), features)).length, 1);
  });
  await check('membership revocation applies on the next operation', async () => {
    await db('workspaceMemberships').where(identity('admin')).delete();
    await assert.rejects(listAuthorizedLeads(db, identity('admin'), features), AuthorizationAccessError);
  });
  await check('invalid persisted policy denies rather than silently reseeding defaults', async () => {
    const key = { workspaceId: a, role: 'owner', permission: 'permissions.manage' };
    await db('workspaceRolePolicies').where(key).delete();
    await assert.rejects(listAuthorizedLeads(db, identity('owner'), features), AuthorizationAccessError);
    await db('workspaceRolePolicies').insert({ ...key, scope: 'enabled' });
  });
  await check('audit rows reject updates and deletes', async () => {
    await assert.rejects(db('authorizationAudit').where({ workspaceId: a }).update({ actorId: 'field' }), /immutable/);
    await assert.rejects(db('authorizationAudit').where({ workspaceId: a }).delete(), /immutable/);
  });
  await check('database rejects extra Owner, Owner removal, mismatched ownerId and missing policy', async () => {
    await assert.rejects(db('workspaceMemberships').where(identity('office')).update({ role: 'owner' }), /exactly one/);
    await assert.rejects(db('workspaceMemberships').where(identity('owner')).update({ role: 'office' }), /exactly one/);
    await assert.rejects(db('workspaces').where({ id: a }).update({ ownerId: 'office' }), /exactly one/);
    await assert.rejects(db('workspacePolicies').where({ workspaceId: b }).delete(), /persisted authorization/);
  });
  await check('atomic ownership transfer preserves one Owner and removes former Owner policy authority', async () => {
    await db.transaction(async trx => {
      await trx('workspaces').where({ id: a }).update({ ownerId: 'office' });
      await trx('workspaceMemberships').where(identity('owner')).update({ role: 'admin' });
      await trx('workspaceMemberships').where(identity('office')).update({ role: 'owner' });
    });
    await assert.rejects(saveWorkspacePolicy(db, identity('owner'), features, { expectedRevision: 2, policy: nextPolicy(3) }), AuthorizationAccessError);
    await saveWorkspacePolicy(db, identity('office'), features, { expectedRevision: 2, policy: nextPolicy(3) });
  });
  await check('new workspace seeds Owner, defaults and audit atomically; duplicate initialization denies', async () => {
    const workspaceId = randomUUID();
    await db.transaction(async trx => {
      await trx('workspaces').insert({ id: workspaceId, ownerId: 'outsider', businessName: 'New fictional workspace', businessType: 'test', postalCode: '', serviceRange: '' });
      await trx('workspaceMemberships').insert({ workspaceId, userId: 'outsider', role: 'owner' });
      await initializeWorkspacePolicy(trx, identity('outsider', workspaceId));
    });
    assert.equal((await db('authorizationAudit').where({ workspaceId, action: 'workspace.seeded' })).length, 1);
    await assert.rejects(db.transaction(trx => initializeWorkspacePolicy(trx, identity('outsider', workspaceId))), AuthorizationAccessError);
    const unseeded = randomUUID();
    await assert.rejects(db.transaction(async trx => {
      await trx('workspaces').insert({ id: unseeded, ownerId: 'admin', businessName: 'Unseeded fictional workspace', businessType: 'test', postalCode: '', serviceRange: '' });
      await trx('workspaceMemberships').insert({ workspaceId: unseeded, userId: 'admin', role: 'owner' });
    }), /persisted authorization/);
    assert.equal(await db('workspaces').where({ id: unseeded }).first(), undefined);
  });
  console.log(`Authorization PostgreSQL rehearsal: ${checks} checks passed. Development database untouched.`);
} finally {
  await db.destroy();
  try { await admin.raw('DROP SCHEMA IF EXISTS ?? CASCADE', [schema]); } finally { await admin.destroy(); }
}
