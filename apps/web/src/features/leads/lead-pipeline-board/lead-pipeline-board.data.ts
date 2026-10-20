import { moveStageDialogData } from '../move-stage-dialog/move-stage-dialog.data';
import { leadCardData } from '../lead-card/lead-card.data';
import type { LeadCardRecord } from '../lead-card/lead-card';

export const leadPipelineBoardData = {
  stale: moveStageDialogData.stale,
  successToastMs: 2000,
  stages: leadCardData.stages, label: 'Lead pipeline', instructions: 'Drag a card to another stage, use its menu, or focus Move lead and press Enter, then arrow keys to choose a stage and Enter to review. Escape cancels.',
  readOnlyInstructions: 'Open a card for quick view, or select its name to open the full lead record.',
  move: (name: string) => `Move lead ${name}`, count: (count: number) => `${count} ${count === 1 ? 'lead' : 'leads'}`,
  loaded: (loaded: number, total: number) => `${loaded} of ${total} loaded`,
  empty: 'No leads in this stage.', loading: 'Loading leads…', more: 'Load more', retry: 'Retry loading',
  hideLost: 'Collapse Lost', showLost: 'Expand Lost',
  picked: (name: string, stage: string) => `${name}: target ${stage}. Use arrow keys to choose, Enter to review, Escape to cancel.`,
  canceled: 'Move canceled.', title: moveStageDialogData.title,
  stage: moveStageDialogData.stage, reason: moveStageDialogData.reason, confirm: moveStageDialogData.confirm,
  stories: { title: 'Lead pipeline', description: 'Local preview with scoped sample counts and simulated moves. No live records are changed.',
    failed: 'The move failed. The lead was returned to its original stage.', conflict: 'This lead changed. The move was rolled back; reload the latest data before retrying.',
    success: 'Lead moved (preview only).', loadError: 'Could not load this stage.',
    names: ['Avery Chen', 'Jordan Lee', 'Morgan Reed', 'Taylor Brooks', 'Casey Patel'],
    now: leadCardData.stories.now, timezone: leadCardData.stories.timezone,
  },
} as const;
export const pipelinePreviewColumns = leadPipelineBoardData.stages.map((stage, index) => ({
  stage: stage.value, total: index === 0 ? 29 : index === 4 ? 1 : 2,
  leads: Array.from({ length: index === 0 ? 25 : index === 4 ? 1 : 2 }, (_, row): LeadCardRecord => ({
    ...leadCardData.stories.lead, id: `${stage.value}-${row}`, stage: stage.value,
    name: row === 0 ? leadPipelineBoardData.stories.names[index] : `${leadPipelineBoardData.stories.names[index]} ${row + 1}`,
    owner: row % 3 === 0 ? null : leadCardData.stories.lead.owner, needsAttention: row === 0 && index < 2,
    createdAt: new Date(Date.parse(leadCardData.stories.now) - (row + index) * 86400000).toISOString(),
  })),
}));
