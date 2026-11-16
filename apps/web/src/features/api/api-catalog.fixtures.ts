import { materialListResultSchema, workOrderDetailResultSchema, workOrderListResultSchema } from '@salesmora/contracts';
import { jobListFixture, workflowScope } from './api-workflow.fixtures';

export const materialListFixture = materialListResultSchema.parse({
  rows: [{
    id: '00000000-0000-4000-8000-000000000010', name: 'Copper elbow', sku: 'CU-90', unit: 'each', category: 'Fittings', supplier: 'Local supply',
    costCents: 500, priceCents: 1000, marginPercent: 50, notes: '', imageUrl: '', sourceUrl: '', status: 'active', archived: false,
    version: 1, updatedAt: '2026-10-19T12:00:00Z', proposedByName: null, rejectionReason: '', duplicateOf: null,
  }],
  total: 1, page: 1, pageSize: 25, options: { categories: ['Fittings'], suppliers: ['Local supply'] },
  pendingProposals: 0, canManage: true, canPropose: true, canExport: true, canViewPrices: true, canViewCosts: true,
});
export const workOrderListFixture = workOrderListResultSchema.parse({
  rows: [{
    id: '00000000-0000-4000-8000-000000000011', number: 'WO-1001', jobId: jobListFixture.rows[0].id, title: 'Replace kitchen fitting', status: 'draft',
    instructions: 'Replace the fitting and check for leaks.', accessNotes: '', safetyNotes: '', scheduledDate: null, arrivalWindow: null,
    primaryAssigneeId: workflowScope.viewerId, crewIds: [], sourceEstimateId: null, cancellationReason: null, changedAfterIssue: false, archived: false,
    issuedAt: null, startedAt: null, completedAt: null, canceledAt: null, version: 1, createdAt: '2026-10-19T12:00:00Z', updatedAt: '2026-10-19T12:00:00Z',
    jobNumber: jobListFixture.rows[0].number, customerName: 'Jordan Lee', address: '18 Willow Street', assigneeName: 'Alex Morgan', crewNames: [],
    tasksDone: 0, tasksTotal: 0, overdue: false,
    capabilities: { update: true, issue: true, start: false, progress: false, complete: false, cancel: false, reopen: false, archive: false, remove: true, print: false, duplicate: true },
  }],
  total: 1, page: 1, pageSize: 25, timezone: 'America/Chicago', today: '2026-10-19',
  metrics: { issuedToday: 0, inProgress: 0, overdue: 0, awaitingSignoff: 0 },
  options: { members: [{ id: workflowScope.viewerId, name: 'Alex Morgan' }], jobs: [{ id: jobListFixture.rows[0].id, number: jobListFixture.rows[0].number, title: jobListFixture.rows[0].title, customerName: 'Jordan Lee' }] },
  canCreate: true, canExport: true,
});
export const workOrderDetailFixture = workOrderDetailResultSchema.parse({
  workOrder: workOrderListFixture.rows[0], tasks: [], materials: [], activity: [], notes: [], completion: null,
  members: workOrderListFixture.options.members, access: { prices: true, costs: true, canSchedule: true, canOverride: false, canNote: true, signoffRequired: false },
  businessPhone: '', contact: { name: 'Jordan Lee', phone: null, address: '18 Willow Street' },
});
