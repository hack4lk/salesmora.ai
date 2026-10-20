import 'server-only';
import { getLeadHistory } from './history';
import { getLeadDetails } from './details';
import { searchLeads } from './search';
import { leadsQuerySchema, leadsProposeActionSchema, type LeadOperationId } from '@salesmora/contracts';
import { draftDeleteLead } from './delete';
import { draftExportLeads } from './export-csv';
import { draftSetLeadArchived } from './set-archived';
import { draftAddLeadNote } from './add-note';
import { draftAssignLead } from './assign';
import { draftUpdateLead, draftUpdateLeadWithStage } from './update';
import { draftCreateLead } from './create';
import { draftChangeLeadStage } from './change-stage';
import { getLeadPipelineSummary } from './pipeline-summary';
import type { ChatToolHandler } from '../tools/types';
/** All implemented Leads operations route to existing app use cases; no generic SQL execution. */
const operations = { history: getLeadHistory, details: getLeadDetails, search: searchLeads, delete: draftDeleteLead, export_csv: draftExportLeads, set_archived: draftSetLeadArchived, add_note: draftAddLeadNote, assign: draftAssignLead, update_with_stage: draftUpdateLeadWithStage, update: draftUpdateLead, create: draftCreateLead, change_stage: draftChangeLeadStage, pipeline_summary: getLeadPipelineSummary } satisfies Record<LeadOperationId, ChatToolHandler>;
export const leadsQuery: ChatToolHandler = async (context, raw) => {
  const { request } = leadsQuerySchema.parse(raw);
  await context.authorize('leads_query', request.operation);
  return operations[request.operation](context, request.input);
};
export const leadsProposeAction: ChatToolHandler = async (context, raw) => {
  const { request } = leadsProposeActionSchema.parse(raw);
  await context.authorize('leads_propose_action', request.operation);
  return operations[request.operation](context, request.input);
};
