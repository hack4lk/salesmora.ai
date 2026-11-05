import { captureLeadWorkflowData as copy } from './capture-lead-workflow.data';
export type CaptureWorkflowTeammate = { id: string; name: string };
export type CaptureLeadWorkflowValue = {
  assignment: 'default' | 'teammate'; teammateId: string;
  stage: typeof copy.stages[number]['value']; tagsText: string; notifyAssigned: boolean;
};
export const defaultCaptureLeadWorkflow: CaptureLeadWorkflowValue = { assignment: 'default', teammateId: '', stage: 'new', tagsText: '', notifyAssigned: true };
export function captureWorkflowTags(text: string): string[] {
  return text.split(',').map(tag => tag.trim()).filter(Boolean);
}
/** Draft validation only; the host must reauthorize members and validate settings before saving/launch. */
export function validateCaptureLeadWorkflow(value: CaptureLeadWorkflowValue, teammates: readonly CaptureWorkflowTeammate[], teammatesReady = true) {
  const errors: Partial<Record<keyof CaptureLeadWorkflowValue, string>> = {};
  if (!['default', 'teammate'].includes(value.assignment)) errors.assignment = copy.errors.assignment;
  if (value.assignment === 'teammate' && (!teammatesReady || !value.teammateId || !teammates.some(member => member.id === value.teammateId))) errors.teammateId = copy.errors.teammate;
  if (!copy.stages.some(stage => stage.value === value.stage)) errors.stage = copy.errors.stage;
  const tags = captureWorkflowTags(value.tagsText);
  if (tags.length > 20 || tags.some(tag => tag.length > 50) || new Set(tags.map(tag => tag.toLowerCase())).size !== tags.length) errors.tagsText = copy.errors.tags;
  if (typeof value.notifyAssigned !== 'boolean') errors.notifyAssigned = copy.errors.notify;
  return errors;
}
