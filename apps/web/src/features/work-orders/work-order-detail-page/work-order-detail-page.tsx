'use client';
import type { WorkOrderDetailResult } from '@salesmora/contracts';
import type { WorkOrderAssignment, WorkOrderCompletionInput, WorkOrderInstructions } from '../work-order-preview.types';
import { WorkOrderHeader, type WorkOrderHeaderAction } from '../work-order-header/work-order-header';
import { WorkOrderInstructionsCard } from '../work-order-instructions-card/work-order-instructions-card';
import { WorkOrderTaskList } from '../work-order-task-list/work-order-task-list';
import { WorkOrderMaterials, type WorkOrderMaterialInput, type WorkOrderMaterialsProps } from '../work-order-materials/work-order-materials';
import { WorkOrderCrewCard } from '../work-order-crew-card/work-order-crew-card';
import { WorkOrderSignoff } from '../work-order-signoff/work-order-signoff';
import { WorkOrderCrewNotes } from '../work-order-crew-notes/work-order-crew-notes';
import { woPanel, woStamp } from '../work-order-ui';
import type { MaterialPickerOption } from '../../materials/material-picker/material-picker';
import { toView } from '../work-order-view';
import { workOrderDetailPageData as copy } from './work-order-detail-page.data';

export type WorkOrderDetailHandlers = {
  onBack: () => void; onOpenJob: (jobId: string) => void; onHeaderAction: (action: WorkOrderHeaderAction) => void;
  onSaveInstructions: (value: WorkOrderInstructions) => void;
  onToggleTask: (taskId: string, done: boolean) => void; onAddTask: (label: string, required: boolean) => void; onRemoveTask: (taskId: string) => void; onToggleRequired: (taskId: string, required: boolean) => void;
  searchCatalog: (query: string, signal: AbortSignal) => Promise<MaterialPickerOption[]>;
  newMaterial?: WorkOrderMaterialsProps['newMaterial'];
  onAddMaterial: (item: WorkOrderMaterialInput) => void; onRemoveMaterial: (id: string) => void; onChangeMaterialStatus: (id: string, status: WorkOrderDetailResult['materials'][number]['status']) => void; onChangeMaterialPrice: (id: string, cents: number | null) => void;
  onSaveAssignment: (value: WorkOrderAssignment) => void; onOpenSchedule: () => void; onComplete: (input: WorkOrderCompletionInput) => void; onReopen: () => void; onAddNote: (body: string) => void | Promise<void>;
};

export function WorkOrderDetailPage({ detail, ...h }: { detail: WorkOrderDetailResult } & WorkOrderDetailHandlers) {
  const { workOrder: w, tasks, materials, activity, notes, completion, members, access, contact } = detail;
  const view = toView(w), c = view.capabilities;
  return <div className="grid min-w-0 gap-6">
    <WorkOrderHeader workOrder={view} onBack={h.onBack} onOpenJob={h.onOpenJob} onAction={h.onHeaderAction} />
    <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="grid min-w-0 content-start gap-6">
        <WorkOrderInstructionsCard status={w.status} value={{ instructions: w.instructions, accessNotes: w.accessNotes, safetyNotes: w.safetyNotes }} changedAfterIssue={w.changedAfterIssue} capabilities={c} onSave={h.onSaveInstructions} />
        <WorkOrderTaskList status={w.status} tasks={tasks} capabilities={c} onToggle={h.onToggleTask} onAdd={h.onAddTask} onRemove={h.onRemoveTask} onToggleRequired={h.onToggleRequired} />
        <WorkOrderMaterials status={w.status} materials={materials} searchCatalog={h.searchCatalog} newMaterial={h.newMaterial} access={access} capabilities={c} onAdd={h.onAddMaterial} onRemove={h.onRemoveMaterial} onChangeStatus={h.onChangeMaterialStatus} onChangePrice={h.onChangeMaterialPrice} />
        <WorkOrderCrewNotes status={w.status} archived={w.archived} notes={notes} canAdd={access.canNote} onAdd={h.onAddNote} />
        <WorkOrderSignoff status={w.status} completion={completion && { ...completion, signatureUrl: completion.signatureImage }} openRequiredTasks={tasks.filter(t => t.required && !t.done).length} signoffRequired={access.signoffRequired} canOverride={access.canOverride} capabilities={c} onComplete={h.onComplete} onReopen={h.onReopen} />
      </div>
      <div className="grid min-w-0 content-start gap-6">
        <WorkOrderCrewCard status={w.status} assignment={{ assigneeId: w.primaryAssigneeId, crewIds: w.crewIds }} members={members} schedule={{ date: w.scheduledDate, window: w.arrivalWindow }} contact={contact} capabilities={c} canSchedule={access.canSchedule} onSave={h.onSaveAssignment} onOpenSchedule={h.onOpenSchedule} />
        <section className={`${woPanel} grid gap-3`} aria-labelledby="wo-activity"><h2 id="wo-activity" className="m-0 text-lg font-semibold">{copy.activity}</h2>
          {activity.length === 0 ? <p className="m-0 text-sm text-muted">{copy.noActivity}</p> : <ul className="m-0 grid list-none gap-2 p-0">{activity.map(a => <li key={a.id} className="text-sm"><span className="font-semibold">{a.type.replace(/[-_.]/g, ' ')}</span> {copy.by} {a.actorName} · <time dateTime={a.createdAt}>{woStamp(a.createdAt)}</time></li>)}</ul>}
        </section>
      </div>
    </div>
  </div>;
}
