import { leadsToolbarData } from '../../leads/leads-toolbar/leads-toolbar.data';

export const captureLeadWorkflowData = {
  title: 'Lead workflow', description: 'Choose how new leads from this capture source are assigned and organized.',
  assignment: 'Lead assignment', defaultAssignment: 'Use business default', teammateAssignment: 'Assign to one teammate',
  defaultHint: 'Uses the business’s assignment rule when the lead is created.', teammateHint: 'New leads are assigned to the teammate you select.', teammate: 'Teammate', choose: 'Choose a teammate', unavailable: 'Previously selected teammate (unavailable)',
  stage: 'Starting lead stage', stages: leadsToolbarData.stages,
  tags: 'Tags', tagsHint: 'Separate tags with commas. Up to 20 tags, with 50 characters per tag.',
  notify: 'Notify assigned teammate', notifyHint: 'Uses the teammate’s existing notification preferences when a new lead is created.',
  summary: 'Workflow summary', applied: { website: 'Applied when a website submission creates a new lead. Submissions needing review use these settings after approval.', gmail: 'Applied after an email is reviewed and approved as a new lead.' },
  summaryAssignment: 'Assignment', summaryStage: 'Starting stage', summaryTags: 'Tags', summaryNotify: 'Assigned teammate notification',
  noTags: 'No tags', enabled: 'Enabled · uses notification preferences', disabled: 'Off', incomplete: 'Complete the settings to preview this workflow.',
  duplicate: 'Stage and tag changes for an existing lead require review before they are applied.',
  denied: 'You do not have permission to view this lead workflow.', readOnly: 'You can view this workflow but do not have permission to change it.',
  loading: 'Loading teammates…', loadError: 'Teammates could not be loaded.', retry: 'Retry loading teammates', empty: 'No eligible teammates are available. You can use business default assignment.',
  errors: { title: 'Review the workflow', assignment: 'Choose an assignment option.', teammate: 'Choose an available teammate.', stage: 'Choose an existing lead stage.', tags: 'Use up to 20 distinct tags, each with 1–50 characters.', notify: 'Choose whether to notify the assigned teammate.' },
  stories: { description: 'Draft settings only. No lead is created, assignment saved or notification sent.', teammates: [{ id: 'sam', name: 'Sam Rivera' }, { id: 'alex', name: 'Alex Chen' }], tags: 'Website inquiry, Water heater', long: 'Alexandra Morgan-Williams — residential services and whole-home improvement team', longTag: 'Residential service and improvement inquiry', duplicateTags: 'Urgent, urgent', unknown: 'removed-teammate' },
};
