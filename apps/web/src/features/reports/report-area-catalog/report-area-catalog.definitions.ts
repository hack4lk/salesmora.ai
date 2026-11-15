import type { ReportTemplateArea } from '@salesmora/contracts';

export const reportAreaDefinitions: readonly { id: ReportTemplateArea; label: string; description: string; modeLabel: string }[] = [
  { id: 'overview', label: 'Business overview', description: 'Period intake and outcomes, with current operations kept separate.', modeLabel: 'Workspace report' },
  { id: 'leads', label: 'Leads and pipeline', description: 'Intake, current pipeline, source and ownership.', modeLabel: 'Workspace report' },
  { id: 'jobs', label: 'Jobs and deadlines', description: 'Recorded completions, current active Jobs and overdue work.', modeLabel: 'Workspace report' },
  { id: 'team', label: 'Team workload', description: 'Current primary and supporting assignments. No productivity scores.', modeLabel: 'Current snapshot' },
  { id: 'estimates', label: 'Estimates and acceptance', description: 'Effective decisions, frozen accepted values and current follow-up.', modeLabel: 'Workspace report' },
  { id: 'calendar', label: 'Calendar and scheduling', description: 'Canonical visits and the current unscheduled queue.', modeLabel: 'Upcoming + current' },
  { id: 'sources', label: 'Lead-source effectiveness', description: 'Current broad-source labels for lead cohorts and accepted values.', modeLabel: 'Workspace report' },
  { id: 'activity', label: 'CRM activity history', description: 'Safe native-domain events, counted once each.', modeLabel: 'Workspace report' },
  { id: 'financial', label: 'Sales value and recorded costs', description: 'Accepted sales value and current known material costs, not profit.', modeLabel: 'Workspace report' },
];
