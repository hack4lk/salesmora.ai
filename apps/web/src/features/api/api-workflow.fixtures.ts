import {
  customerQuerySchema, customerListResultSchema, customerDetailResultSchema,
  jobListResultSchema, jobDetailResultSchema, calendarResultSchema,
} from '@salesmora/contracts';
import { customerFixtures, customerMembers, customerOwnerCapabilities } from '../customers/customer-preview.data';
import { jobFixtures, jobMembers } from '../jobs/job-preview.data';

export const workflowScope = { workspaceId: '00000000-0000-4000-8000-000000000001', viewerId: '00000000-0000-4000-8000-000000000002' };
export const customerQueryFixture = customerQuerySchema.parse({ workspaceId: workflowScope.workspaceId });
export const customerListFixture = customerListResultSchema.parse({
  rows: [{ ...customerFixtures[0], id: '00000000-0000-4000-8000-000000000003' }],
  total: 1, page: 1, members: customerMembers, capabilities: customerOwnerCapabilities,
  totals: { customers: 1, withOpenLeads: 1 }, policyRevision: 1, now: '2026-10-19T12:00:00Z',
});
export const customerDetailFixture = customerDetailResultSchema.parse({
  customer: customerListFixture.rows[0], leads: [], leadsTotal: 0, events: [], notes: [], activityTotal: 0, notesTotal: 0,
  members: customerMembers, capabilities: customerOwnerCapabilities, policyRevision: 1,
});
export const jobListFixture = jobListResultSchema.parse({
  rows: [{ ...jobFixtures[0], id: '00000000-0000-4000-8000-000000000004', customerId: customerDetailFixture.customer.id }],
  total: 1, page: 1, pageSize: 20, timezone: 'America/Chicago', today: '2026-10-19',
  metrics: { active: 1, waiting: 0, overdue: 0, unassigned: 0 },
  options: { members: jobMembers, customers: [{ id: customerDetailFixture.customer.id, name: customerDetailFixture.customer.name }], customerNames: ['Jordan Lee'], services: ['Plumbing'] },
  canCreate: true, canScheduleCreation: true,
});
export const jobDetailFixture = jobDetailResultSchema.parse({
  job: jobListFixture.rows[0], activity: [], activityTotal: 0, activityPage: 1, canOpenCustomer: true, canOpenLead: false,
});
export const calendarFixture = calendarResultSchema.parse({
  query: { workspaceId: workflowScope.workspaceId, date: '2026-10-19', view: 'week', person: 'all', recordType: 'all', status: 'all', customerQuery: '', queuePage: 1 },
  weekDate: '2026-10-19', today: '2026-10-19', timezone: 'America/Chicago', scope: 'workspace', viewerId: workflowScope.viewerId,
  members: jobMembers, canSchedule: true, entries: [], unscheduledTotal: 1, queuePages: 1,
  unscheduled: [{
    id: '00000000-0000-4000-8000-000000000005', title: jobDetailFixture.job.title, customerName: 'Jordan Lee',
    timezone: 'America/Chicago', location: '18 Willow Street', nextStep: null, scheduledDate: null, arrivalWindow: null,
    records: [{ type: 'job', id: jobDetailFixture.job.id, number: 'J-1038', title: jobDetailFixture.job.title, status: 'needs-scheduling' }],
    crew: [], completionDeadline: null, waiting: false, canReschedule: true, revision: 'v1',
    review: { expectedVisitVersion: 1, records: [{ type: 'job', id: jobDetailFixture.job.id, expectedVersion: 1 }] },
  }],
});
