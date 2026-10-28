import { expect, it } from 'vitest';
import { createJobSchema, createReviewedJobSchema } from './job';
const base = { workspaceId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', submissionId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', customerId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', title: 'Fixture', primaryOwnerId: null };
const preview = { revision: '1', createdDate: '2026-10-26', resolvedDate: '2026-11-09', timezone: 'America/New_York' };
it('binds explicit deadline intent and reviewed result together', () => {
  expect(createJobSchema.safeParse({ ...base, deadlineIntent: { mode: 'workspace', revision: '1' }, deadlinePreview: preview, completionDeadline: preview.resolvedDate }).success).toBe(true);
  for (const extra of [
    { deadlineIntent: { mode: 'unset' } }, { deadlinePreview: preview },
    { deadlineIntent: { mode: 'workspace', revision: '2' }, deadlinePreview: preview, completionDeadline: preview.resolvedDate },
    { deadlineIntent: { mode: 'unset' }, deadlinePreview: preview, completionDeadline: preview.resolvedDate },
    { deadlineIntent: { mode: 'date', date: '2026-11-10' }, deadlinePreview: preview, completionDeadline: preview.resolvedDate },
    { deadlineIntent: { mode: 'workspace', revision: '1' }, deadlinePreview: { ...preview, canOverride: true }, completionDeadline: preview.resolvedDate },
  ]) expect(createJobSchema.safeParse({ ...base, ...extra }).success).toBe(false);
});
it('retains legacy explicit null/date behavior when no reviewed default is requested', () => {
  expect(createJobSchema.parse(base).completionDeadline).toBeNull();
  expect(createJobSchema.parse({ ...base, completionDeadline: '2026-11-10' }).completionDeadline).toBe('2026-11-10');
});

it('requires reviewed deadline evidence at the public creation boundary', () => { expect(createReviewedJobSchema.safeParse(base).success).toBe(false); });
