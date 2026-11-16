import type { EstimateEditorSeed, EstimateSharingReviewResult } from '@salesmora/data';
import { estimatePaperContentSchema, estimatePaperAmountsSchema, type EstimateListResult } from '@salesmora/contracts';
import { workflowScope } from './api-workflow.fixtures';
import { estimatePaperFixture, estimatePaperSnapshotFixture } from '../estimates/estimate-preview-paper/estimate-preview-paper.data';

const paper = estimatePaperContentSchema.parse(estimatePaperFixture);
const parent = {
  type: 'job' as const, id: '00000000-0000-4000-8000-000000000601', number: 'J-1048',
  name: 'Kitchen remodel', status: 'open', service: 'Remodeling',
  customer: { id: '00000000-0000-4000-8000-000000000602', name: 'Jordan Lee' },
  contactName: 'Jordan Lee', recipientEmail: 'jordan@example.test', serviceAddress: '18 Maple Street',
};
export const estimateRecordFixture: NonNullable<EstimateEditorSeed['estimate']> = {
  id: '00000000-0000-4000-8000-000000000603', number: 'EST-2048', revision: 1, status: 'draft',
  archived: false, version: 1, updatedAt: '2026-10-22T12:00:00Z', sharing: 'never-shared', parent,
  values: {
    details: { name: 'Kitchen remodel estimate', recipientName: parent.contactName, recipientEmail: parent.recipientEmail,
      serviceAddress: parent.serviceAddress, ownerId: workflowScope.viewerId },
    items: paper.items,
    totals: { discount: estimatePaperFixture.discount, taxRate: estimatePaperFixture.taxRate },
    terms: { message: estimatePaperFixture.message, validUntil: estimatePaperFixture.validUntil,
      paymentTerms: estimatePaperFixture.paymentTerms, termsNote: estimatePaperFixture.termsNote, deposit: estimatePaperFixture.deposit },
    scope: estimatePaperFixture.scope, internalNotes: 'Private fixture note.', paymentLink: '',
  },
};
export const estimateSeedFixture: EstimateEditorSeed = {
  workspaceId: workflowScope.workspaceId, timezone: 'America/New_York', today: '2026-10-22',
  paperBusiness: estimatePaperFixture.business, parent, existingEstimates: [], estimate: estimateRecordFixture,
  members: [{ id: workflowScope.viewerId, name: 'Alex Morgan' }], paymentPresets: [],
  defaults: { taxRate: '0', validUntil: '2026-11-21', message: '', termsNote: '', deposit: { type: 'none' } },
  capabilities: { read: true, create: true, update: true, delete: true, void: true, archive: true,
    assignOwner: true, browseMaterials: false, viewMaterialPrices: false },
};
export const estimateSharingFixture: EstimateSharingReviewResult = {
  estimate: estimateRecordFixture, today: estimateSeedFixture.today, canSend: true,
  subject: 'Your estimate EST-2048', issues: [], snapshotHash: 'a'.repeat(64), paper: null,
  draftPaper: { ...estimatePaperSnapshotFixture, content: paper, amounts: estimatePaperAmountsSchema.parse(estimatePaperSnapshotFixture.amounts),
    estimateId: estimateRecordFixture.id, version: 1, snapshotHash: 'a'.repeat(64) },
  draft: paper, delivery: { email: { state: 'not-sent' }, link: { state: 'not-created', expiresAt: null, firstViewedAt: null } },
  revision: null,
};
export const estimateListFixture: EstimateListResult = {
  rows: [{
    id: estimateRecordFixture.id, number: estimateRecordFixture.number, estimateNumber: 2048, revision: 1,
    name: estimateRecordFixture.values.details.name, customerName: parent.contactName, service: parent.service, status: 'draft', totalCents: 96917,
    parentType: 'job', parentId: parent.id, parentNumber: parent.number, ownerId: workflowScope.viewerId, ownerName: 'Alex Morgan',
    validUntil: '2026-11-21', updatedAt: estimateRecordFixture.updatedAt, decidedAt: null, archived: false, version: 1,
    canDuplicate: true, canRevise: false, canDelete: true,
  }],
  total: 1, scopeTotal: 1, page: 1, pageSize: 25, timezone: estimateSeedFixture.timezone,
  scope: 'workspace', policyRevision: 1, canCreate: true, canExport: true, canVoid: true, canArchive: true,
  owners: [{ id: workflowScope.viewerId, name: 'Alex Morgan', openEstimateCount: 1 }],
  metrics: { awaitingCount: 0, openValueCents: '96917', acceptedThisMonthCount: 0, acceptedThisMonthCents: '0', expiringInSevenDaysCount: 0 },
};
