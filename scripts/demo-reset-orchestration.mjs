import { validateDemoResetTarget } from './demo-reset-safety.mjs';

export async function runDemoReset(env, actions) {
  const target = validateDemoResetTarget(env);
  let phase = 'preflight';
  let state = 'unchanged';
  try {
    await actions.preflight(target);
    phase = 'confirmation';
    if (!await actions.confirm(target)) {
      return { status: 'cancelled', state };
    }
    phase = 'credentials';
    const credentials = await actions.prepareCredentials();
    phase = 'connection check';
    await actions.assertNoConnections(target);
    phase = 'drop';
    await actions.dropDatabase(target);
    state = 'dropped';
    phase = 'create';
    await actions.createDatabase(target);
    state = 'empty';
    phase = 'migration';
    await actions.migrate(target);
    state = 'migrated';
    phase = 'runtime access';
    await actions.provisionRoles(target);
    phase = 'seed';
    await actions.seed(target, credentials);
    state = 'seeded';
    phase = 'verification';
    await actions.verify(target, credentials);
    return { status: 'complete', state, target };
  } catch (error) {
    throw new Error(`Demo reset failed during ${phase}; last confirmed state: ${state}. Inspect the database before retrying.`, { cause: error });
  }
}
