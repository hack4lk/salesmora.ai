import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createDatabase } from '../database';
import { initializeWorkspacePolicy } from '../authorization/store';
import { workspaceAIAllowance } from '../ai-usage';
import { ADMIN_APP_ROLE, RUNTIME_LOGIN_ROLES } from '../runtime-roles';
import { PlanCapacityError, assertLeadCapacity, assertSeatCapacity, workspaceEntitlements } from './entitlements';
import { PlanOverrideError, applyPlanOverride, clearPlanOverride, recordExpiredPlanOverrides, type PlanOverrideActor } from './plan-override';

// Runs the override use cases as the admin app role, the limit checks as web and the expiry audit as the worker.
const env = fileURLToPath(new URL('../../../../.env.local', import.meta.url));
if (existsSync(env)) process.loadEnvFile(env);
process.env.BILLING_SANDBOX_ENABLED = 'true';
const ownerURL = process.env.TEST_DATABASE_URL;
if (!ownerURL || !new URL(ownerURL).pathname.endsWith('_test') || ownerURL === process.env.DATABASE_URL ||
  !['localhost', '127.0.0.1'].includes(new URL(ownerURL).hostname)) throw Error('Use the isolated local test database.');
const loginURL = (username: string, password: string | undefined) => {
  if (!password) throw Error(`Set the ${username} password and run pnpm db:roles:test.`);
  return Object.assign(new URL(ownerURL), { username, password }).toString();
};
const owner = createDatabase(ownerURL);
const admin = createDatabase(loginURL(ADMIN_APP_ROLE, process.env.DB_ADMIN_APP_PASSWORD));
const web = createDatabase(loginURL(RUNTIME_LOGIN_ROLES.web, process.env.DB_WEB_PASSWORD));
const worker = createDatabase(loginURL(RUNTIME_LOGIN_ROLES.worker, process.env.DB_WORKER_PASSWORD));
const denied = (error: { code?: string }) => error.code === '42501';

const suffix = randomUUID().slice(0, 8);
const ownerId = `override-owner-${suffix}`;
const workspaceId = randomUUID();
const staff: PlanOverrideActor = { type: 'staff', id: `staff-${suffix}` };
const inDays = (days: number) => new Date(Date.now() + days * 86400000);
let passed = 0;
const check = async (name: string, run: () => Promise<void>) => { await run(); passed++; console.log(`PASS ${name}`); };
const auditRows = () => owner('billingAudit').where({ workspaceId }).where('action', 'like', 'plan.override_%').orderBy('id').select('action', 'actorId', 'details');
const capacity = (run: (trx: Parameters<typeof assertSeatCapacity>[0]) => Promise<unknown>) =>
  web.transaction(run).then(() => 'ok', (error: unknown) => error instanceof PlanCapacityError ? error.resource : Promise.reject(error));

async function seed() {
  const now = new Date();
  await owner('users').insert({ id: ownerId, name: ownerId, email: `${ownerId}@example.test`, createdAt: now, updatedAt: now, termsVersion: 'test', termsAcceptedAt: now });
  await owner.transaction(async trx => {
    await trx('workspaces').insert({ id: workspaceId, ownerId, businessName: 'Fictional override workspace', businessType: 'test', postalCode: '', serviceRange: '' });
    await trx('workspaceMemberships').insert({ workspaceId, userId: ownerId, role: 'owner' });
    await initializeWorkspacePolicy(trx, { userId: ownerId, workspaceId });
    await trx('workspaceSubscriptions').insert({ workspaceId, plan: 'free', catalogVersion: 'fixture' });
  });
  // Uses up the Free lead allowance (100) for this month.
  await owner('workspaceLeadAdmissions').insert(Array.from({ length: 100 }, () => ({ leadId: randomUUID(), workspaceId })));
}

async function cleanup() {
  await owner.transaction(async trx => {
    await trx('billingAudit').where({ workspaceId }).delete();
    await trx('workspaceLeadAdmissions').where({ workspaceId }).delete();
    await trx('workspaceSubscriptions').where({ workspaceId }).delete();
    await trx('workspaceRolePolicies').where({ workspaceId }).delete();
    await trx('workspacePolicies').where({ workspaceId }).delete();
    await trx('workspaceMemberships').where({ workspaceId }).delete();
    await trx('workspaces').where({ id: workspaceId }).delete();
    await trx('users').where({ id: ownerId }).delete();
  });
}

try {
  await seed();

  await check('the customer-app roles cannot set or clear a plan override', async () => {
    for (const role of [web, worker]) {
      await assert.rejects(role('workspaces').where({ id: workspaceId })
        .update({ planOverride: 'premium', planOverrideEndsAt: inDays(30), planOverrideReason: 'forged', planOverrideId: randomUUID() }), denied);
    }
  });
  await check('the admin app can only change the override columns', async () => {
    await assert.rejects(admin('workspaces').where({ id: workspaceId }).update({ businessName: 'Changed' }), denied);
  });
  await check('applying an override validates the plan, end date, reason and actor', async () => {
    await assert.rejects(applyPlanOverride(admin, { workspaceId, plan: 'free', endsAt: inDays(30), reason: 'x', actor: staff }), /Standard or Premium/);
    await assert.rejects(applyPlanOverride(admin, { workspaceId, plan: 'premium', endsAt: inDays(400), reason: 'x', actor: staff }), /within 12 months/);
    await assert.rejects(applyPlanOverride(admin, { workspaceId, plan: 'premium', endsAt: inDays(-1), reason: 'x', actor: staff }), /in the future/);
    await assert.rejects(applyPlanOverride(admin, { workspaceId, plan: 'premium', endsAt: inDays(30), reason: ' ', actor: staff }), /reason is required/);
    await assert.rejects(applyPlanOverride(admin, { workspaceId, plan: 'premium', endsAt: inDays(30), reason: 'x', actor: { type: 'staff', id: '' } }), PlanOverrideError);
    await assert.rejects(applyPlanOverride(admin, { workspaceId: randomUUID(), plan: 'premium', endsAt: inDays(30), reason: 'x', actor: staff }), /not found/);
    assert.equal((await auditRows()).length, 0);
  });
  await check('without an override, Free limits apply to leads, seats and AI tokens', async () => {
    assert.equal(await capacity(trx => assertLeadCapacity(trx, workspaceId)), 'leads');
    assert.equal(await capacity(trx => assertSeatCapacity(trx, workspaceId, 1)), 'teammates');
    assert.equal((await workspaceAIAllowance(web, workspaceId)).monthlyTokens, 1_000_000);
  });
  let firstId = '';
  await check('a Premium override raises every limit and is audited', async () => {
    const endsAt = inDays(30);
    const result = await applyPlanOverride(admin, { workspaceId, plan: 'premium', endsAt, reason: '  Pilot customer  ', actor: staff });
    assert.ok(result.changed && result.overrideId);
    firstId = result.overrideId;
    const row = await owner('workspaces').where({ id: workspaceId }).first('planOverride', 'planOverrideEndsAt', 'planOverrideReason', 'planOverrideId');
    assert.deepEqual(row, { planOverride: 'premium', planOverrideEndsAt: endsAt, planOverrideReason: 'Pilot customer', planOverrideId: firstId });
    assert.equal(await capacity(trx => assertLeadCapacity(trx, workspaceId)), 'ok');
    assert.equal(await capacity(trx => assertSeatCapacity(trx, workspaceId, 1)), 'ok');
    assert.equal((await workspaceAIAllowance(web, workspaceId)).monthlyTokens, 20_000_000);
    const entitlement = await workspaceEntitlements(web, workspaceId);
    assert.equal(entitlement.plan.id, 'premium');
    assert.equal(entitlement.billedPlan, 'free', 'Stripe keeps billing the original plan');
    assert.deepEqual(await auditRows(), [{ action: 'plan.override_applied', actorId: staff.id,
      details: { actorType: 'staff', overrideId: firstId, plan: 'premium', endsAt: endsAt.toISOString(), reason: 'Pilot customer', previous: null } }]);
  });
  await check('an override never lowers a paid plan', async () => {
    await owner('workspaceSubscriptions').where({ workspaceId }).update({ plan: 'premium', status: 'active', paidThrough: inDays(10) });
    const { overrideId } = await applyPlanOverride(admin, { workspaceId, plan: 'standard', endsAt: inDays(60), reason: 'Downgrade test', actor: staff });
    const entitlement = await workspaceEntitlements(web, workspaceId);
    assert.equal(entitlement.plan.id, 'premium');
    assert.equal(entitlement.override?.plan, 'standard');
    const [, replaced] = await auditRows();
    assert.equal(replaced.details.overrideId, overrideId);
    assert.equal(replaced.details.previous.overrideId, firstId, 'replacing an override records the previous one');
    await owner('workspaceSubscriptions').where({ workspaceId }).update({ plan: 'free', status: 'free', paidThrough: null });
  });
  await check('an expired override stops applying and the worker audits it exactly once', async () => {
    const { planOverrideId: overrideId } = await owner('workspaces').where({ id: workspaceId }).first('planOverrideId');
    // The owner connection is exempt from the guard, standing in for time passing.
    await owner('workspaces').where({ id: workspaceId }).update({ planOverrideEndsAt: new Date(Date.now() - 1000) });
    assert.equal((await workspaceEntitlements(web, workspaceId)).plan.id, 'free');
    assert.equal(await capacity(trx => assertLeadCapacity(trx, workspaceId)), 'leads');
    assert.equal((await workspaceAIAllowance(web, workspaceId)).monthlyTokens, 1_000_000);
    await recordExpiredPlanOverrides(worker);
    await recordExpiredPlanOverrides(worker);
    const expired = (await auditRows()).filter(row => row.action === 'plan.override_expired');
    assert.equal(expired.length, 1);
    assert.equal(expired[0].actorId, null);
    assert.equal(expired[0].details.overrideId, overrideId);
    assert.equal(expired[0].details.actorType, 'system');
  });
  await check('clearing an override audits once and repeating is a no-op', async () => {
    await assert.rejects(clearPlanOverride(admin, { workspaceId, reason: '', actor: staff }), /reason is required/);
    const result = await clearPlanOverride(admin, { workspaceId, reason: 'Pilot ended', actor: staff });
    assert.equal(result.changed, true);
    assert.deepEqual(await clearPlanOverride(admin, { workspaceId, reason: 'Again', actor: staff }), { changed: false, overrideId: null });
    assert.deepEqual(await owner('workspaces').where({ id: workspaceId }).first('planOverride', 'planOverrideEndsAt', 'planOverrideReason', 'planOverrideId'),
      { planOverride: null, planOverrideEndsAt: null, planOverrideReason: null, planOverrideId: null });
    const rows = await auditRows();
    assert.deepEqual(rows.map(row => row.action), ['plan.override_applied', 'plan.override_applied', 'plan.override_expired', 'plan.override_cleared']);
    assert.equal(rows[3].details.reason, 'Pilot ended');
    assert.equal(rows[3].details.previous.overrideId, result.overrideId);
  });
  await check('a workspace being deleted cannot get an override', async () => {
    await applyPlanOverride(admin, {
      workspaceId,
      plan: 'premium',
      endsAt: inDays(30),
      reason: 'Pending deletion rehearsal',
      actor: staff,
    });
    await owner('workspaces').where({ id: workspaceId }).update({ deletionRequestedAt: new Date() });
    await assert.rejects(applyPlanOverride(admin, { workspaceId, plan: 'premium', endsAt: inDays(30), reason: 'x', actor: staff }), /being deleted/);
    await assert.rejects(clearPlanOverride(admin, { workspaceId, reason: 'Pending deletion clear', actor: staff }), /being deleted/);
    assert.equal((await owner('workspaces').where({ id: workspaceId }).first('planOverride'))?.planOverride, 'premium');
  });
  console.log(`Plan override rehearsal passed: ${passed} checks.`);
} finally {
  await cleanup().catch(error => console.error('Cleanup failed', error));
  await Promise.all([owner, admin, web, worker].map(db => db.destroy()));
}
