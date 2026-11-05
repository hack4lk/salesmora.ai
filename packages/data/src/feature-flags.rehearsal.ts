import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createDatabase } from './database';
import { createFeatureFlagReader } from './feature-flags';

const envFile = fileURLToPath(new URL('../../../.env.local', import.meta.url));
if (existsSync(envFile)) process.loadEnvFile(envFile);
const url = process.env.TEST_DATABASE_URL;
if (!url || url === process.env.DATABASE_URL || !new URL(url).pathname.endsWith('_test') ||
  !['localhost', '127.0.0.1'].includes(new URL(url).hostname)) {
  throw new Error('Use an isolated local test database for feature flag rehearsal.');
}

const db = createDatabase(url);
const rollback = Symbol('rollback');
const workspaceId = randomUUID();
const staffId = randomUUID();

try {
  try {
    await db.transaction(async trx => {
      const now = new Date();
      await trx.withSchema('admin').table('staffUsers').insert({
        id: staffId,
        name: 'Feature flag rehearsal',
        email: `feature-flags-${staffId}@example.test`,
        createdAt: now,
        updatedAt: now,
      });

      const read = createFeatureFlagReader();
      assert.equal(await read(trx, 'chat.enabled', workspaceId), true, 'catalog default enables chat when the environment permits it');

      await trx.withSchema('admin').table('featureFlags').where({ id: 'chat.enabled' }).update({ enabled: false });
      assert.equal(await read(trx, 'chat.enabled', workspaceId), true, 'cached value remains stable during the 60-second TTL');

      const uncached = createFeatureFlagReader();
      assert.equal(await uncached(trx, 'chat.enabled', workspaceId), false, 'global flag change is visible to an uncached reader');

      await trx.withSchema('admin').table('featureFlagOverrides').insert({
        flagId: 'chat.enabled',
        targetType: 'plan',
        targetId: 'free',
        enabled: true,
        reason: 'Enable free-plan test cohort',
        updatedBy: staffId,
        updatedAt: now,
      });
      const planReader = createFeatureFlagReader();
      assert.equal(await planReader(trx, 'chat.enabled', workspaceId), true, 'plan override takes precedence over the global setting');

      await trx.withSchema('admin').table('featureFlagOverrides').insert({
        flagId: 'chat.enabled',
        targetType: 'workspace',
        targetId: workspaceId,
        enabled: false,
        reason: 'Disable one test workspace',
        updatedBy: staffId,
        updatedAt: now,
      });
      const workspaceReader = createFeatureFlagReader();
      assert.equal(await workspaceReader(trx, 'chat.enabled', workspaceId), false, 'workspace override takes precedence over plan');

      await trx.withSchema('admin').table('featureFlagOverrides').where({
        flagId: 'chat.enabled',
        targetType: 'workspace',
        targetId: workspaceId,
      }).update({ expiresAt: new Date(Date.now() - 60_000) });
      const expiryReader = createFeatureFlagReader();
      assert.equal(await expiryReader(trx, 'chat.enabled', workspaceId), true, 'expired workspace override falls back to the active plan override');

      let clock = Date.now();
      const ttlReader = createFeatureFlagReader(() => clock);
      assert.equal(await ttlReader(trx, 'estimate.sharing.enabled'), true, 'estimate sharing starts at its catalog default');
      await trx.withSchema('admin').table('featureFlags').where({ id: 'estimate.sharing.enabled' }).update({ enabled: false });
      assert.equal(await ttlReader(trx, 'estimate.sharing.enabled'), true, 'global estimate flag is cached for the full TTL');
      clock += 60_001;
      assert.equal(await ttlReader(trx, 'estimate.sharing.enabled'), false, 'global estimate flag refreshes after the TTL');

      throw rollback;
    });
  } catch (error) {
    if (error !== rollback) throw error;
  }
  console.log('Feature flag rehearsal passed (global, plan/workspace precedence, expiry, 60-second cache, transactional cleanup).');
} finally {
  await db.destroy();
}
