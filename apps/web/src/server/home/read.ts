import 'server-only';
import { AuthorizationAccessError, homeClock, readHomeLeadsInTransaction, readHomeJobsInTransaction,
  readHomeScheduleInTransaction, listHomeIntakeInTransaction, canReadHomeWorkload,
  readHomeWorkloadInTransaction, readHomeActivityInTransaction, type Knex } from '@salesmora/data';
import { authorizedWorkspace, workspaceCapabilities } from '../authorization/permissions';

export type HomeReadState<T> = { status: 'ready'; data: T } | { status: 'error' };
export type HomeSnapshot = Awaited<ReturnType<typeof readHomeSnapshot>>['snapshot'];

export async function readHomeSnapshot(userId: string, workspaceId: string) {
  return authorizedWorkspace(userId, workspaceId, false, async (trx, context) => {
    const clock = await homeClock(trx, context);
    const capabilities = workspaceCapabilities(context);
    async function section<T>(name: string, read: (savepoint: Knex.Transaction) => Promise<T>): Promise<HomeReadState<T>> {
      try {
        return { status: 'ready', data: await trx.transaction(read) };
      } catch (error) {
        if (error instanceof AuthorizationAccessError) throw error;
        console.error(`Home ${name} could not be loaded or failed server contract validation.`);
        return { status: 'error' };
      }
    }
    // Savepoints isolate SQL failures while the shared workspace lock keeps authorization stable.
    const leads = capabilities.readLeads ? await section('leads', t => readHomeLeadsInTransaction(t, context, clock.today, clock.timezone)) : undefined;
    const jobs = capabilities.readJobs ? await section('jobs', t => readHomeJobsInTransaction(t, context, clock.today)) : undefined;
    const intake = capabilities.readIntake ? await section('intake', t => listHomeIntakeInTransaction(t, context)) : undefined;
    const schedule = capabilities.readCalendar ? await section('schedule', t => readHomeScheduleInTransaction(t, context, clock.today)) : undefined;
    const workload = canReadHomeWorkload(context) ? await section('workload', t => readHomeWorkloadInTransaction(t, context)) : undefined;
    const activity = capabilities.readLeads || capabilities.readJobs ? await section('activity', t => readHomeActivityInTransaction(t, context)) : undefined;
    return { context, snapshot: { ...clock, leads, jobs, intake, schedule, workload, activity, canCreateLead: capabilities.createLead } };
  });
}
