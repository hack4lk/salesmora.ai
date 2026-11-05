import { defineRailway } from 'railway/iac';
import staging from './railway.ts';
/** Compatibility entry point for the staging rollout; the default now retains the gateway. */
export default defineRailway(async (context, project) => {
  if (!context.isEnvironment('staging')) throw Error('This candidate is restricted to the existing staging environment.');
  return staging(context, project);
});
