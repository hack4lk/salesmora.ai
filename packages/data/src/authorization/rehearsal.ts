/** Opt-in PostgreSQL rehearsal. Never runs against development or changes existing test tables. */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import knex from 'knex';
import { createDefaultWorkspacePolicy } from '@salesmora/domain';
import type { PermissionId, WorkspacePolicy } from '@salesmora/contracts';
import { migrateFreshBaseline } from '../baseline-runner';
import { initializeWorkspacePolicy, loadWorkspaceAuthorization, withWorkspaceAuthorization, withWorkspaceAuthoritySnapshot, saveWorkspacePolicy, listAuthorizedLeads, authorizedLeadPipelineCounts, AuthorizationAccessError, AuthorizationConflictError, WorkspaceSuspendedError } from './store';

const envFile = fileURLToPath(new URL('../../../../.env.local', import.meta.url));
if (existsSync(envFile)) process.loadEnvFile(envFile);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith('_test') ||
  !['localhost', '127.0.0.1'].includes(new URL(connection).hostname))
  throw new Error('Authorization rehearsal requires a separate local TEST_DATABASE_URL ending in _test.');
const database = `authorization_rehearsal_${randomUUID().replaceAll('-', '')}_test`;
const isolatedConnection = new URL(connection);
isolatedConnection.pathname = `/${database}`;
const admin = knex({ client: 'pg', connection });
const db = knex({ client: 'pg', connection: isolatedConnection.toString(), pool: { min: 0, max: 5 } });
let created = false;
let checks = 0;
async function check(name: string, run: () => Promise<void>) { await run(); checks++; console.log(`PASS ${name}`); }
const a = randomUUID(), b = randomUUID();
const features: PermissionId[] = ['leads.read', 'leads.update', 'leads.stage.update', 'permissions.read', 'permissions.manage'];
const identity = (userId: string, workspaceId: string = a) => ({ userId, workspaceId });
const nextPolicy = (revision: number): WorkspacePolicy => createDefaultWorkspacePolicy(a, revision);
try {
  await admin.raw('CREATE DATABASE ??', [database]);
  created = true;
  await migrateFreshBaseline(db);
  const now = new Date();
  await db('users').insert(['owner', 'admin', 'office', 'field', 'outsider', 'second-owner'].map(id => ({ id, name: id, email: `${id}@example.test`, createdAt: now, updatedAt: now, termsVersion: 'test', termsAcceptedAt: now })));
  await db.transaction(async trx => {
    await trx('workspaces').insert([{ id: a, ownerId: 'owner' }, { id: b, ownerId: 'second-owner' }].map(row => ({ ...row, businessName: 'Fictional workspace', businessType: 'test', postalCode: '', serviceRange: '' })));
    await trx('workspaceMemberships').insert([
      { workspaceId: a, userId: 'owner', role: 'owner' },
      { workspaceId: a, userId: 'admin', role: 'admin' },
      { workspaceId: a, userId: 'office', role: 'office' },
      { workspaceId: a, userId: 'field', role: 'field' },
      { workspaceId: b, userId: 'second-owner', role: 'owner' },
      { workspaceId: b, userId: 'field', role: 'office' },
    ]);
    await initializeWorkspacePolicy(trx, identity('owner'));
    await initializeWorkspacePolicy(trx, identity('second-owner', b));
  });
  await db('workspaceInvitations').insert(['office', 'field'].map(role => ({ id: randomUUID(), workspaceId: a, email: `${role}-invite@example.test`, role, inviterId: 'owner', status: 'queued' })));
  await db('leads').insert([
    { workspaceId: a, ownerId: 'field', stage: 'new' },
    { workspaceId: a, ownerId: 'office', stage: 'contacted' },
    { workspaceId: a, ownerId: null, stage: 'new' },
    { workspaceId: b, ownerId: null, stage: 'new' },
  ].map((row, i) => ({ ...row, id: randomUUID(), createdBy: null, submissionId: randomUUID(), submissionHash: `test-${i}`, name: `Fictional lead ${i}`, email: '', phone: '', service: '', address: '', details: '', notes: '', source: 'other' })));
  const base = (await db('workspacePolicies').where({ workspaceId: a }).first()).revision as number;
  const audits = (await db('authorizationAudit').where({ workspaceId: a })).length;
  await check('joined authority matches persisted context for every role and uses four calls including transaction control', async () => {
    const policy = await db('workspacePolicies').where({ workspaceId: a }).first('revision');
    const grants = await db('workspaceRolePolicies').where({ workspaceId: a }).select('role', 'permission', 'scope');
    const byGrant = (x: { role: string; permission: string }, y: { role: string; permission: string }) =>
      x.role.localeCompare(y.role) || x.permission.localeCompare(y.permission);
    for (const role of ['owner', 'admin', 'office', 'field']) {
      const statements: string[] = [];
      const record = (query: { sql: string }) => { statements.push(query.sql); };
      db.on('query', record);
      let context;
      try { context = await loadWorkspaceAuthorization(db, identity(role), features); }
      finally { db.removeListener('query', record); }
      assert.equal(statements.length, 4);
      assert.match(statements[0], /^BEGIN/i);
      assert.match(statements[1], /for share/i);
      assert.match(statements[2], /left join "workspaceRolePolicies"/);
      assert.match(statements[3], /^COMMIT/i);
      assert.deepEqual({ ...context, policy: { ...context.policy, grants: [...context.policy.grants].sort(byGrant) } }, {
        ...identity(role), ownerUserId: 'owner', membership: { ...identity(role), role },
        policy: { workspaceId: a, revision: policy.revision, grants: [...grants].sort(byGrant) }, enabledPermissions: features,
      });
    }
  });
  await check('request authority is reused without reloads, isolated by identity, and expires before the next request', async () => {
    const captured = await loadWorkspaceAuthorization(db, identity('field'), features);
    const statements: string[] = [];
    const record = (query: { sql: string }) => statements.push(query.sql);
    await db('users').where({ id: 'field' }).update({ suspendedAt: new Date(), suspendedReason: 'Fictional request snapshot check' });
    try {
      db.on('query', record);
      await withWorkspaceAuthoritySnapshot(db, captured, async () => {
        for (let index = 0; index < 2; index++) await withWorkspaceAuthorization(db, identity('field'), features, false, async (trx, current) => {
          assert.deepEqual(current, captured);
          await withWorkspaceAuthorization(trx, identity('field'), ['leads.read'], false, async (_nested, narrowed) => {
            assert.deepEqual(narrowed.enabledPermissions, ['leads.read']);
          });
        });
        await assert.rejects(withWorkspaceAuthorization(db, identity('owner'), features, false, async () => {}), AuthorizationAccessError);
        await assert.rejects(withWorkspaceAuthorization(db, identity('field', b), features, false, async () => {}), AuthorizationAccessError);
      });
      assert.equal(statements.filter(sql => /workspaceRolePolicies|for share|for update/.test(sql)).length, 0);
      db.removeListener('query', record);
      await assert.rejects(loadWorkspaceAuthorization(db, identity('field'), features), AuthorizationAccessError);
    } finally {
      db.removeListener('query', record);
      await db('users').where({ id: 'field' }).update({ suspendedAt: null, suspendedReason: null });
    }
  });
  await check('scoped nested reads reuse one authority load and transaction', async () => {
    const statements: string[] = [];
    const record = (query: { sql: string }) => statements.push(query.sql);
    db.on('query', record);
    try {
      await withWorkspaceAuthorization(db, identity('owner'), features, true, async (trx, context) => {
        for (let index = 0; index < 3; index++)
          await withWorkspaceAuthorization(trx, identity('owner'), features, false, async (nested, current) => {
            assert.equal(nested, trx);
            assert.deepEqual(current, context);
          });
      }, { reuseNestedAuthority: true });
    } finally { db.removeListener('query', record); }
    assert.equal(statements.length, 4);
    assert.match(statements[1], /for update/i);
    assert.equal(statements.filter(sql => sql.includes('left join "workspaceRolePolicies"')).length, 1);
  });
  await check('scoped authority cannot change identity or widen feature permissions through nested readers', async () => {
    await withWorkspaceAuthorization(db, identity('owner'), features, true, async trx => {
      await assert.rejects(withWorkspaceAuthorization(trx, identity('field'), features, false, async () => {}),
        AuthorizationAccessError);
      await assert.rejects(withWorkspaceAuthorization(trx, identity('owner', b), features, true, async () => {}),
        AuthorizationAccessError);
      await withWorkspaceAuthorization(trx, identity('owner'), ['leads.read'], false, async (nested, context) => {
        assert.deepEqual(context.enabledPermissions, ['leads.read']);
        await withWorkspaceAuthorization(nested, identity('owner'), features, false, async (_next, current) => {
          assert.deepEqual(current.enabledPermissions, ['leads.read']);
        });
      });
      await withWorkspaceAuthorization(trx, identity('owner'), features, false, async (_next, current) => {
        assert.deepEqual(current.enabledPermissions, features);
      });
    }, { reuseNestedAuthority: true });
  });
  await check('caught native write/SQL failures roll back to savepoints without poisoning the tool transaction', async () => {
    await withWorkspaceAuthorization(db, identity('owner'), features, true, async trx => {
      const before = await trx('workspaces').where({ id: a }).first('businessName');
      await assert.rejects(withWorkspaceAuthorization(trx, identity('owner'), features, true, async nested => {
        await nested('workspaces').where({ id: a }).update({ businessName: 'Must roll back' });
        await nested.raw('select missing_scoped_authority_test_column');
      }), /missing_scoped_authority_test_column/);
      assert.equal((await trx('workspaces').where({ id: a }).first('businessName')).businessName, before.businessName);
      await withWorkspaceAuthorization(trx, identity('owner'), features, false, async (nested, context) => {
        assert.equal(nested, trx);
        assert.equal(context.userId, 'owner');
      });
    }, { reuseNestedAuthority: true });
  });
  await check('authority scopes are isolated concurrently and never reused by a later request', async () => {
    await Promise.all([['owner', a], ['second-owner', b]].map(async ([userId, workspaceId]) =>
      withWorkspaceAuthorization(db, identity(userId, workspaceId), features, true, async (trx, context) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        await withWorkspaceAuthorization(trx, identity(userId, workspaceId), features, false, async (_nested, current) => {
          assert.equal(current.userId, context.userId);
          assert.equal(current.workspaceId, context.workspaceId);
        });
      }, { reuseNestedAuthority: true })));
    await db('users').where({ id: 'owner' }).update({ suspendedAt: new Date(), suspendedReason: 'Fictional scope test' });
    try {
      await assert.rejects(withWorkspaceAuthorization(db, identity('owner'), features, true, async () => {},
        { reuseNestedAuthority: true }), AuthorizationAccessError);
    } finally { await db('users').where({ id: 'owner' }).update({ suspendedAt: null, suspendedReason: null }); }
    await assert.rejects(withWorkspaceAuthorization(db, identity('owner'), features, false, async () => {},
      { reuseNestedAuthority: true }), /exclusive workspace lock/);
  });
  await check('joined authority denies suspended/deleting identities and retains workspace suspension error', async () => {
    for (const column of ['suspendedAt', 'deletionRequestedAt']) {
      await db('users').where({ id: 'office' }).update({ [column]: new Date(), ...(column === 'suspendedAt' ? { suspendedReason: 'Fictional authorization test' } : {}) });
      try { await assert.rejects(loadWorkspaceAuthorization(db, identity('office'), features), AuthorizationAccessError); }
      finally { await db('users').where({ id: 'office' }).update({ [column]: null, ...(column === 'suspendedAt' ? { suspendedReason: null } : {}) }); }
    }
    for (const column of ['suspendedAt', 'deletionRequestedAt']) {
      await db('workspaces').where({ id: a }).update({ [column]: new Date(), ...(column === 'suspendedAt' ? { suspendedReason: 'Fictional authorization test' } : {}) });
      try {
        await assert.rejects(loadWorkspaceAuthorization(db, identity('owner'), features),
          column === 'suspendedAt' ? WorkspaceSuspendedError : AuthorizationAccessError);
      } finally { await db('workspaces').where({ id: a }).update({ [column]: null, ...(column === 'suspendedAt' ? { suspendedReason: null } : {}) }); }
    }
    await assert.rejects(loadWorkspaceAuthorization(db, identity('missing-user'), features), AuthorizationAccessError);
    await assert.rejects(loadWorkspaceAuthorization(db, identity('owner', randomUUID()), features), AuthorizationAccessError);
  });
  await check('missing policy or empty grants deny before protected work without default fallback', async () => {
    let invoked = false;
    for (const table of ['workspacePolicies', 'workspaceRolePolicies']) {
      await assert.rejects(db.transaction(async trx => {
        await trx(table).where({ workspaceId: a }).delete();
        await withWorkspaceAuthorization(trx, identity('owner'), features, false, async () => { invoked = true; });
      }), AuthorizationAccessError);
    }
    assert.equal(invoked, false);
    await loadWorkspaceAuthorization(db, identity('owner'), features);
  });
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
    for (const user of ['admin', 'office', 'field']) await assert.rejects(saveWorkspacePolicy(db, identity(user), features, { expectedRevision: base, policy: nextPolicy(base + 1) }), AuthorizationAccessError);
    assert.equal((await db('authorizationAudit').where({ workspaceId: a })).length, audits);
  });
  await check('concurrent Owner saves allow one revision; other save conflicts; exactly one audit appended', async () => {
    const change = { expectedRevision: base, policy: nextPolicy(base + 1) };
    const results = await Promise.allSettled([saveWorkspacePolicy(db, identity('owner'), features, change), saveWorkspacePolicy(db, identity('owner'), features, change)]);
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    const failure = results.find(result => result.status === 'rejected');
    assert(failure?.status === 'rejected' && failure.reason instanceof AuthorizationConflictError);
    const audit = await db('authorizationAudit').where({ workspaceId: a, action: 'policy.saved' });
    assert.equal(audit.length, 1); assert.equal(audit[0].beforePolicy.revision, base); assert.equal(audit[0].afterPolicy.revision, base + 1);
  });
  await check('invalid scope, protected Owner removal, cross-workspace and permanent-ceiling grants deny', async () => {
    const invalidScope = nextPolicy(base + 2);
    invalidScope.grants = invalidScope.grants.map(g => g.role === 'field' && g.permission === 'leads.read' ? { ...g, scope: 'enabled' as const } : g);
    const policies = [invalidScope,
      { ...nextPolicy(base + 2), workspaceId: b },
      { ...nextPolicy(base + 2), grants: nextPolicy(base + 2).grants.filter(g => !(g.role === 'owner' && g.permission === 'permissions.manage')) },
      { ...nextPolicy(base + 2), grants: [...nextPolicy(base + 2).grants, { role: 'field' as const, permission: 'leads.export' as const, scope: 'assigned' as const }] },
    ];
    for (const policy of policies) await assert.rejects(saveWorkspacePolicy(db, identity('owner'), features, { expectedRevision: base + 1, policy }), AuthorizationAccessError);
    assert.equal((await db('authorizationAudit').where({ workspaceId: a })).length, audits + 1);
  });
  await check('audit-write failure rolls back grants and revision together', async () => {
    await db.raw(`ALTER TABLE "authorizationAudit" ADD CONSTRAINT rehearsal_reject_save CHECK (action <> 'policy.saved') NOT VALID`);
    try {
      const policy = nextPolicy(base + 2); policy.grants = policy.grants.filter(g => !(g.role === 'office' && g.permission === 'leads.create'));
      const before = await db('workspaceRolePolicies').where({ workspaceId: a }).orderBy(['role', 'permission']);
      await assert.rejects(saveWorkspacePolicy(db, identity('owner'), features, { expectedRevision: base + 1, policy }), /rehearsal_reject_save/);
      assert.equal((await db('workspacePolicies').where({ workspaceId: a }).first()).revision, base + 1);
      assert.deepEqual(await db('workspaceRolePolicies').where({ workspaceId: a }).orderBy(['role', 'permission']), before);
    } finally { await db.raw('ALTER TABLE "authorizationAudit" DROP CONSTRAINT rehearsal_reject_save'); }
  });
  await check('membership mutations wait for an active protected-read workspace lock', async () => {
    const reader = await db.transaction();
    const writer = await db.transaction();
    let pending: Promise<number> | undefined;
    try {
      await withWorkspaceAuthorization(reader, identity('owner'), features, false, async () => {});
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
    const policy = nextPolicy(base + 2); policy.grants = policy.grants.filter(g => !(g.role === 'field' && g.permission.startsWith('leads.')));
    await saveWorkspacePolicy(db, identity('owner'), features, { expectedRevision: base + 1, policy });
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
    await assert.rejects(saveWorkspacePolicy(db, identity('owner'), features, { expectedRevision: base + 2, policy: nextPolicy(base + 3) }), AuthorizationAccessError);
    await saveWorkspacePolicy(db, identity('office'), features, { expectedRevision: base + 2, policy: nextPolicy(base + 3) });
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
  try { if (created) await admin.raw('DROP DATABASE ??', [database]); } finally { await admin.destroy(); }
}
