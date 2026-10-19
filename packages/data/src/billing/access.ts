import {authorize} from '@salesmora/domain';
/** Locked workspace authorization is supplied by the data boundary for every read. */
export function billingReadAllowed(context:Parameters<typeof authorize>[0]){
  return authorize(context,{permission:'billing.read'}).allowed||authorize(context,{permission:'billing.manage'}).allowed;
}
