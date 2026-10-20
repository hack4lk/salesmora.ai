import { leadsToolbarData } from '../leads-toolbar/leads-toolbar.data';

export const moveStageDialogData = {
  stages: leadsToolbarData.stages,
  title: 'Move this lead?', description: (name: string, stage: string) => `Move ${name} from ${stage} to a new stage. This change will appear in its activity history.`,
  stage: 'New stage', choose: 'Choose a stage', reason: 'Lost reason (optional)', reasonHelp: 'Up to 500 characters. Saved in activity history.',
  confirm: 'Confirm move', pending: 'Moving lead…', cancel: 'Cancel',
  forbidden: 'You do not have permission to move this lead.', archived: 'Restore this archived lead before changing its stage.',
  stale: 'This lead changed. Reload its details before moving it.',
  invalid: 'Choose a different stage and keep the Lost reason within 500 characters.',
  reloadFailed: 'Could not reload this lead. Try again.', conflictTitle: 'This lead changed', reload: 'Reload details',
  stories: {
    title: 'Move lead stage', description: 'Shared stage review for the pipeline and quick view. Submission and reload are mocked.',
    open: 'Review stage change', success: 'Lead moved (preview only).',
    failure: 'The lead could not be moved. Try again.', conflict: 'Another teammate updated this lead. Reload its latest details before trying again.',
    reason: 'Customer chose another provider.', longName: 'Alexandra Morgan-Williams and Christopher Rivera',
    lead: { id: 'jordan', version: 3, name: 'Jordan Lee', stage: 'contacted', canMove: true, archived: false },
  },
} as const;
