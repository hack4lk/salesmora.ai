import { describe, expect, it } from 'vitest';
import type { WorkOrderMutation } from '@salesmora/contracts';
import { WorkOrderLifecycleError, assertEditable, isOverdue, reopenTarget, validateArchive, validateCompletion, validateReopen, validateStatusChange } from './lifecycle';

type Status = Extract<WorkOrderMutation, { action: 'status' }>;
type Complete = Extract<WorkOrderMutation, { action: 'complete' }>;
const status = (to: Status['to'], extra: Partial<Status> = {}) => ({ to, reason: '', confirmed: false, ...extra }) as Status;
const complete = (extra: Partial<Complete> = {}) => ({ summary: 'Done', followUp: 'none', followUpNote: '', signerName: '', signatureImage: null, overrideReason: '', ...extra }) as Complete;
const base = { status: 'draft' as const, archived: false, assigneeId: 'u1' };
const ctx = { status: 'in-progress' as const, archived: false, tasks: [{ required: true, done: true }], signoffRequired: false, canOverride: true };

describe('work order lifecycle', () => {
  it('allows only forward transitions and requires a cancel reason', () => {
    expect(() => validateStatusChange(base, status('issued'))).not.toThrow();
    expect(() => validateStatusChange(base, status('in-progress'))).toThrow(WorkOrderLifecycleError);
    expect(() => validateStatusChange({ ...base, status: 'completed' }, status('canceled', { reason: 'x' }))).toThrow(WorkOrderLifecycleError);
    expect(() => validateStatusChange(base, status('canceled'))).toThrow(/reason/);
    expect(() => validateStatusChange(base, status('issued', { reason: 'x' }))).toThrow(/Reasons/);
  });
  it('requires confirmation to issue without an assignee', () => {
    expect(() => validateStatusChange({ ...base, assigneeId: null }, status('issued'))).toThrow(/assignee/);
    expect(() => validateStatusChange({ ...base, assigneeId: null }, status('issued', { confirmed: true }))).not.toThrow();
  });
  it('freezes closed and archived work orders', () => {
    for (const s of ['completed', 'canceled'] as const) expect(() => assertEditable({ status: s, archived: false })).toThrow(WorkOrderLifecycleError);
    expect(() => assertEditable({ status: 'issued', archived: true })).toThrow(WorkOrderLifecycleError);
    expect(() => assertEditable({ status: 'in-progress', archived: false })).not.toThrow();
  });
  it('completes only in progress with required tasks done or an authorised override', () => {
    expect(() => validateCompletion(ctx, complete())).not.toThrow();
    expect(() => validateCompletion({ ...ctx, status: 'issued' }, complete())).toThrow(/in progress/);
    const open = { ...ctx, tasks: [{ required: true, done: false }, { required: false, done: false }] };
    expect(() => validateCompletion(open, complete())).toThrow(/required task is not done/);
    expect(() => validateCompletion(open, complete({ overrideReason: 'Customer waived' }))).not.toThrow();
    expect(() => validateCompletion({ ...open, canOverride: false }, complete({ overrideReason: 'x' }))).toThrow(/office/);
    expect(() => validateCompletion(ctx, complete({ overrideReason: 'x' }))).toThrow(/open/);
  });
  it('requires a signature only when the workspace demands one', () => {
    expect(() => validateCompletion({ ...ctx, signoffRequired: true }, complete())).toThrow(/signature/);
    expect(() => validateCompletion({ ...ctx, signoffRequired: true }, complete({ signerName: 'A', signatureImage: 'img' }))).not.toThrow();
  });
  it('reopens completed to in progress and canceled to draft', () => {
    expect(reopenTarget('completed')).toBe('in-progress');
    expect(reopenTarget('canceled')).toBe('draft');
    expect(() => reopenTarget('issued')).toThrow(WorkOrderLifecycleError);
    expect(() => validateReopen({ status: 'completed', archived: true })).toThrow(/Unarchive/);
  });
  it('archives only closed work orders', () => {
    expect(() => validateArchive({ status: 'completed', archived: false }, true)).not.toThrow();
    expect(() => validateArchive({ status: 'issued', archived: false }, true)).toThrow(WorkOrderLifecycleError);
    expect(() => validateArchive({ status: 'completed', archived: true }, true)).toThrow(WorkOrderLifecycleError);
  });
  it('derives overdue from the scheduled date', () => {
    expect(isOverdue('issued', '2026-10-18', '2026-10-19')).toBe(true);
    expect(isOverdue('issued', '2026-10-19', '2026-10-19')).toBe(false);
    expect(isOverdue('completed', '2026-10-01', '2026-10-19')).toBe(false);
    expect(isOverdue('issued', null, '2026-10-19')).toBe(false);
  });
});
