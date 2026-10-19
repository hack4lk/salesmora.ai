'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormFeedback } from '@salesmora/ui';
import { useWorkspaceAssistant } from '../../assistant/workspace-assistant/workspace-assistant';
import type { WorkOrderDetailResult, WorkOrderStatus } from '@salesmora/contracts';
import { WorkOrderDetailPage } from '../work-order-detail-page/work-order-detail-page';
import { WorkOrderMoveDialog } from '../work-order-move-dialog/work-order-move-dialog';
import { WorkOrderReopenDialog } from '../work-order-reopen-dialog/work-order-reopen-dialog';
import { WorkOrderDeleteDialog } from '../work-order-delete-dialog/work-order-delete-dialog';
import { WorkOrderScheduleDialog } from '../work-order-schedule-dialog/work-order-schedule-dialog';
import { workOrderRequest } from '../work-order-client';
import { statusPayload, useWorkOrderWrites } from '../work-order-writes';
import { toView } from '../work-order-view';
import { workOrdersRouteData as copy } from './work-orders-route.data';

type Overlay = { kind: 'move'; to: WorkOrderStatus | null } | { kind: 'reopen' } | { kind: 'schedule' } | { kind: 'delete' };

export function WorkOrderDetailRoute({ workspaceId, initial }: { workspaceId: string; initial: WorkOrderDetailResult }) {
  const router = useRouter(), writes = useWorkOrderWrites(workspaceId, copy.saveError);
  const [detail, setDetail] = useState(initial), [overlay, setOverlay] = useState<Overlay>(), [loadError, setLoadError] = useState('');
  const w = detail.workOrder, view = toView(w), id = w.id;
  const setPageContext = useWorkspaceAssistant()?.setPageContext;
  useEffect(() => {
    setPageContext?.({ key: `work-order:${id}`, label: `${w.number} · ${w.title}`, recordRefs: [{ type: 'work_order', id }] });
    return () => setPageContext?.(undefined);
  }, [setPageContext, id, w.number, w.title]);
  const query = `?workspace=${encodeURIComponent(workspaceId)}`;
  const reload = async () => {
    try { setDetail(await workOrderRequest<WorkOrderDetailResult>(`/api/work-orders/${id}${query}`, undefined, copy.error)); setLoadError(''); }
    catch (e) { setLoadError(e instanceof Error ? e.message : copy.error); }
  };
  async function save(payload: object) {
    const result = await writes.patch({ id, version: w.version }, payload);
    if (result) setOverlay(undefined);
    if (result) await reload();
    return !!result;
  }
  async function remove() {
    const result = await writes.patch({ id, version: w.version }, { action: 'delete' });
    if (result) router.push(`/work-orders${query}`);
  }
  const tasks = detail.tasks.map(t => ({ id: t.id, label: t.label, required: t.required }));
  const materials = detail.materials.map(({ id: materialId, catalogId, name, quantity, unit, status, note, customerPriceCents, costCents }) => ({ id: materialId, catalogId, name, quantity, unit, status, note, customerPriceCents, costCents }));
  const board = () => router.push(`/work-orders${query}`);
  async function duplicate() {
    const created = await writes.create({ jobId: w.jobId, title: `${w.title}${copy.copySuffix}`.slice(0, 200), assigneeId: w.primaryAssigneeId, source: { kind: 'duplicate', workOrderId: id } });
    if (created) router.push(`/work-orders/${created.workOrderId}${query}`);
  }
  return <div className="grid min-w-0 gap-4">
    {(loadError || (writes.error && !overlay)) && <FormFeedback kind="error" message={loadError || writes.error} />}
    <WorkOrderDetailPage detail={detail} onBack={board} onOpenJob={jobId => router.push(`/jobs/${jobId}${query}`)}
      onHeaderAction={action => {
        writes.clearError();
        if (action === 'issue' || action === 'cancel') setOverlay({ kind: 'move', to: action === 'issue' ? 'issued' : 'canceled' });
        else if (action === 'start') void save(statusPayload('in-progress'));
        else if (action === 'complete') document.getElementById('wo-signoff-title')?.scrollIntoView({ block: 'start' });
        else if (action === 'reopen') setOverlay({ kind: 'reopen' });
        else if (action === 'archive') void save({ action: 'archive', archived: true });
        else if (action === 'delete') setOverlay({ kind: 'delete' });
        else if (action === 'duplicate') void duplicate();
        else if (action === 'print') window.open(`/work-orders/${id}/print${query}`, '_blank', 'noopener');
      }}
      onSaveInstructions={v => void save({ action: 'edit', ...v })}
      onToggleTask={(taskId, done) => void save({ action: 'task-toggle', taskId, done })}
      onAddTask={(label, required) => void save({ action: 'tasks', tasks: [...tasks, { label, required }] })}
      onRemoveTask={taskId => void save({ action: 'tasks', tasks: tasks.filter(t => t.id !== taskId) })}
      onToggleRequired={(taskId, required) => void save({ action: 'tasks', tasks: tasks.map(t => t.id === taskId ? { ...t, required } : t) })}
      onAddMaterial={item => void save({ action: 'materials', materials: [...materials, { ...item, status: 'needed' }] })}
      onRemoveMaterial={materialId => void save({ action: 'materials', materials: materials.filter(m => m.id !== materialId) })}
      onChangeMaterialStatus={(materialId, status) => void save({ action: 'materials', materials: materials.map(m => m.id === materialId ? { ...m, status } : m) })}
      onChangeMaterialPrice={(materialId, cents) => void save({ action: 'materials', materials: materials.map(m => m.id === materialId ? { ...m, customerPriceCents: cents } : m) })}
      onSaveAssignment={v => void save({ action: 'assign', assigneeId: v.assigneeId, crewIds: v.crewIds })}
      onOpenSchedule={() => { writes.clearError(); setOverlay({ kind: 'schedule' }); }}
      onComplete={input => void save({ action: 'complete', summary: input.summary, followUp: input.followUp, followUpNote: input.followUpNote, signerName: input.signerName, signatureImage: input.signatureDataUrl, overrideReason: input.overrideReason })}
      onAddNote={async body => { if (!(await save({ action: 'note', body }))) throw new Error(writes.error); }}
      onReopen={() => { writes.clearError(); setOverlay({ kind: 'reopen' }); }} />
    {overlay?.kind === 'move' && <WorkOrderMoveDialog key={`${id}:${overlay.to}`} open workOrder={view} to={overlay.to} pending={writes.pending} error={writes.error} onClose={() => setOverlay(undefined)}
      onConfirm={(to, reason) => to === 'completed' ? setOverlay(undefined) : void save(statusPayload(to, reason))} />}
    {overlay?.kind === 'reopen' && <WorkOrderReopenDialog key={id} open number={w.number} pending={writes.pending} error={writes.error} conflict={writes.conflict} onReload={() => void reload()} onClose={() => setOverlay(undefined)} onConfirm={reason => void save({ action: 'reopen', reason })} />}
    {overlay?.kind === 'delete' && <WorkOrderDeleteDialog key={id} open number={w.number} title={w.title} pending={writes.pending} error={writes.error} onClose={() => setOverlay(undefined)} onConfirm={() => void remove()} />}
    {overlay?.kind === 'schedule' && <WorkOrderScheduleDialog key={id} open schedule={{ date: w.scheduledDate, window: w.arrivalWindow }} pending={writes.pending} error={writes.error} conflict={writes.conflict} onReload={() => void reload()} onClose={() => setOverlay(undefined)} onConfirm={v => void save({ action: 'schedule', ...v })} />}
  </div>;
}
