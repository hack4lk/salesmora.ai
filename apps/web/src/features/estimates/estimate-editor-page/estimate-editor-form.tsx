"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  ConfirmDialog,
  FormFeedback,
  MoneyText,
} from "@salesmora/ui";
import type { EstimateEditorSeed } from "@salesmora/data";
import type { EstimateItemsCatalog, EstimateEditorItem } from "../estimate-items-editor/estimate-items-editor";
import { EstimateDetailsCard } from "../estimate-details-card/estimate-details-card";
import { EstimateInternalNotesCard } from "../estimate-internal-notes-card/estimate-internal-notes-card";
import { EstimateItemsEditor } from "../estimate-items-editor/estimate-items-editor";
import { EstimateLinkedRecord, type EstimateLinkedParent } from "../estimate-linked-record/estimate-linked-record";
import type { EstimateEditorValues } from "./estimate-editor-values";
import { reviewEstimateEditorDraftValues } from "./estimate-editor-validation";
import { guardEstimateUnsavedNavigation } from "./estimate-editor-page.preview";
import { EstimateScopeCard } from "../estimate-scope-card/estimate-scope-card";
import { EstimateStatusBadge } from "../estimate-status-badge/estimate-status-badge";
import { EstimateTermsCard } from "../estimate-terms-card/estimate-terms-card";
import { EstimateTotals } from "../estimate-totals/estimate-totals";
import { estimateButton, estimatePrimary, estimatePanel } from "../estimate-ui";
import { estimateEditorRouteData as c } from "./estimate-editor-route.data";
import { EstimateCreationFlow, type EstimateCreationFlowProps } from "../estimate-creation-flow/estimate-creation-flow";
import { EstimatePaymentOption } from "../estimate-payment-option/estimate-payment-option";
import { EstimateActionsMenu, type EstimateMenuItem } from "../estimate-row-menu/estimate-row-menu";

function linkedParent(parent: NonNullable<EstimateEditorSeed["parent"]>): EstimateLinkedParent {
  return parent.type === "lead"
    ? {
        type: "lead",
        id: parent.id,
        number: parent.number,
        name: parent.name,
        status: parent.status,
        customer: parent.customer,
        contactName: parent.contactName,
        href: parent.href,
      }
    : {
        type: "job",
        id: parent.id,
        number: parent.number,
        name: parent.name,
        status: parent.status,
        customer: parent.customer,
        href: parent.href,
      };
}

export type EstimateEditorFormProps = {
  seed: EstimateEditorSeed;
  values: EstimateEditorValues;
  dirty: boolean;
  pending?: boolean;
  showErrors?: boolean;
  notice?: string;
  error?: string;
  conflict?: boolean;
  catalog?: EstimateItemsCatalog;
  onChange: (values: EstimateEditorValues) => void;
  onSave: () => void;
  onPreview?: () => void;
  onSend?: () => void;
  onPublish?: () => void;
  delivery?: ReactNode;
  statusPanel?: ReactNode;
  history?: ReactNode;
  revisions?: ReactNode;
  onRevise?: () => void;
  onVoid?: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
  onNavigate: (href: string) => void;
  onReload?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  creation?: Omit<EstimateCreationFlowProps, "children" | "pending" | "error" | "notice" | "onSaveDraft"> & {
    review: ReactNode;
    send: ReactNode;
  };
};

export function EstimateEditorForm({
  seed,
  values,
  dirty,
  pending = false,
  showErrors = false,
  notice,
  error,
  conflict = false,
  catalog,
  onChange,
  onSave,
  onPreview,
  onSend,
  onPublish,
  delivery,
  statusPanel,
  history,
  revisions,
  onRevise,
  onVoid,
  onArchive,
  onRestore,
  onNavigate,
  onReload,
  onDuplicate,
  onDelete,
  creation,
}: EstimateEditorFormProps) {
  const [leaveTarget, setLeaveTarget] = useState<{ href: string } | { reload: true } | null>(null);
  const record = seed.estimate;
  const status = record?.status ?? "draft";
  const editable = !conflict && (record ? seed.capabilities.update : seed.capabilities.create);
  const review = reviewEstimateEditorDraftValues(values, seed.members, { today: seed.today });
  const totalCents = review.calculation.totalCents;
  const parent = record?.parent ?? seed.parent;
  const actions: EstimateMenuItem[] = [];
  if (record && !record.archived && onPreview && !creation) actions.push({
    id: "preview", label: c.preview, disabled: dirty || conflict,
    title: dirty ? c.saveBeforePreview : undefined, onSelect: onPreview,
  });
  if (record && seed.capabilities.create && onDuplicate) actions.push({
    id: "duplicate", label: c.duplicate, disabled: dirty || conflict, onSelect: onDuplicate,
  });
  if (record && onRevise && !record.archived && ["sent", "published", "declined", "expired"].includes(record.status)) actions.push({
    id: "revise", label: c.revise, disabled: dirty || conflict, onSelect: onRevise,
  });
  if (record && seed.capabilities.void && !record.archived && ["sent", "published"].includes(record.status) && onVoid) actions.push({
    id: "void", label: c.void, disabled: dirty || conflict, destructive: true, onSelect: onVoid,
  });
  if (record && seed.capabilities.archive) {
    if (!record.archived && ["declined", "expired", "superseded", "void"].includes(record.status) && onArchive) actions.push({
      id: "archive", label: c.archive, disabled: dirty || conflict, onSelect: onArchive,
    });
    if (record.archived && onRestore) actions.push({
      id: "restore", label: c.restore, disabled: dirty || conflict, onSelect: onRestore,
    });
  }

  function navigate(href: string) {
    if (dirty) setLeaveTarget({ href });
    else onNavigate(href);
  }

  function reload() {
    if (!onReload) return;
    if (dirty) setLeaveTarget({ reload: true });
    else onReload();
  }

  useEffect(() => {
    if (!dirty) return;
    return guardEstimateUnsavedNavigation(href => setLeaveTarget({ href }));
  }, [dirty]);

  const linked = <EstimateLinkedRecord
            record={parent ? linkedParent(parent) : null}
            scope={seed.capabilities.assignOwner ? "workspace" : "assigned-jobs"}
            existingEstimates={record ? [] : seed.existingEstimates}
            disabled={pending}
          />;
  const details = <EstimateDetailsCard
            value={values.details}
            number={record?.number ?? null}
            revision={record?.revision ?? 1}
            status={status}
            members={seed.members}
            canEdit={editable}
            canAssignOwner={seed.capabilities.assignOwner}
            pending={pending}
            errors={showErrors ? review.details : undefined}
            onChange={(details) => onChange({ ...values, details })}
          />;
  const items = <EstimateItemsEditor
            items={values.items}
            status={status}
            canEdit={editable}
            pending={pending}
            showErrors={showErrors}
            catalog={catalog}
            onChange={(items: EstimateEditorItem[]) => onChange({ ...values, items })}
          />;
  const totals = <EstimateTotals
            items={values.items}
            value={values.totals}
            deposit={values.terms.deposit}
            status={status}
            canEdit={editable}
            pending={pending}
            onChange={(totals) => onChange({ ...values, totals })}
          />;
  const terms = <EstimateTermsCard
            value={values.terms}
            timezone={seed.timezone}
            calculation={review.calculation}
            paymentPresets={seed.paymentPresets}
            status={status}
            canEdit={editable}
            pending={pending}
            errors={showErrors ? review.terms : undefined}
            onChange={(terms) => onChange({ ...values, terms })}
          />;
  const scope = <EstimateScopeCard
            value={values.scope}
            status={status}
            canEdit={editable}
            pending={pending}
            error={showErrors ? review.scope : undefined}
            onChange={(scope) => onChange({ ...values, scope })}
          />;
  const internalNotes = <EstimateInternalNotesCard
            value={values.internalNotes}
            status={status}
            canEdit={editable}
            pending={pending}
            error={showErrors ? review.internalNotes : undefined}
            onChange={(internalNotes) => onChange({ ...values, internalNotes })}
          />;
  const payment = <EstimatePaymentOption
            value={values.paymentLink ?? ""} canEdit={editable} pending={pending} showErrors={showErrors}
            onChange={paymentLink => onChange({ ...values, paymentLink })}
          />;
  const fields = creation ? <div className="grid min-w-0 gap-6">
    {linked}
    <div className="grid min-w-0 items-start gap-6 lg:grid-cols-2">
      {details}<div className="grid min-w-0 gap-6">{payment}{scope}</div>
    </div>
    {items}
    <div className="grid min-w-0 items-start gap-6 lg:grid-cols-2">{totals}{terms}</div>
    {internalNotes}
  </div> : <div className="grid min-w-0 items-start gap-6 lg:grid-cols-3">
        <div className="grid min-w-0 gap-6 lg:col-span-2">
          {linked}{details}{items}{totals}{terms}{scope}{internalNotes}
        </div>
        <aside className="grid min-w-0 gap-6">
          {payment}
          {statusPanel ?? <section aria-label={c.status} className={`${estimatePanel} grid min-w-0 gap-4`}>
            <h2 className="m-0 text-lg font-semibold">{c.status}</h2>
            <div><EstimateStatusBadge status={status} archived={record?.archived ?? false} /></div>
            <div role="group" aria-label={c.currentTotal}>
              <p className="m-0 text-sm text-muted">{c.currentTotal}</p>
              <p className="mb-0 mt-2 text-2xl font-semibold"><MoneyText cents={totalCents} /></p>
            </div>
            {totalCents === null && <p className="m-0 text-sm leading-6 text-muted">{c.emptyTotal}</p>}
            {!seed.capabilities.assignOwner && <p className="m-0 text-sm leading-6 text-muted">{c.assignedScope}</p>}
          </section>}
          {delivery}
          {revisions}
          {history}
        </aside>
      </div>;

  return (
    <div className="grid min-w-0 gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" className={estimateButton} disabled={pending}
          onClick={() => navigate(`/estimates?workspace=${encodeURIComponent(seed.workspaceId)}`)}>{c.back}</button>
        <div className="flex flex-wrap items-center gap-3">
          {record && <EstimateStatusBadge status={record.status} archived={record.archived} />}
          {editable && !creation && <button type="button" className={estimatePrimary}
            disabled={pending || !dirty || conflict} onClick={onSave}>{pending ? c.saving : c.save}</button>}
          {record?.status === "draft" && !record.archived && !creation && <>
            {onSend && <button type="button" className={estimatePrimary}
              disabled={pending || dirty || conflict} onClick={onSend}>{c.send}</button>}
            {onPublish && <button type="button" className={estimateButton}
              disabled={pending || dirty || conflict} onClick={onPublish}>{c.publish}</button>}
          </>}
          {record && seed.capabilities.delete && onDelete && <button type="button" className={`${estimateButton} border-error/30 text-red-800`}
            disabled={pending || dirty || conflict || record.status !== "draft" || record.archived} onClick={onDelete}>{c.delete}</button>}
          {record && <EstimateActionsMenu name={values.details.name.trim() || record.number}
            items={actions} disabled={pending} />}
        </div>
      </div>
      {record?.status === "draft" && dirty && !creation && <p role="status" className="m-0 text-sm leading-6 text-muted">{c.previewSaveFirst}</p>}
      <header className="grid min-w-0 gap-3">
        <h1 className="m-0 text-heading font-semibold text-ink wrap-anywhere sm:text-heading-lg">{values.details.name.trim() || c.title}</h1>
        <p className="m-0 text-base leading-6 text-muted">{record ? `${record.number} · ${record.updatedAt}` : c.notSaved}</p>
        {dirty && <p role="status" className="m-0 text-sm font-semibold">{c.unsaved}</p>}
        {!creation && notice && <p role="status" className="m-0 text-sm leading-6">{notice}</p>}
        {!creation && error && <FormFeedback kind="error" message={error} />}
        {conflict && <FormFeedback kind="error" message={c.conflict} />}
        {conflict && onReload && <button type="button" className={estimateButton} disabled={pending} onClick={reload}>{c.retry}</button>}
        {showErrors && !review.valid && !creation && <FormFeedback kind="error" message={c.validation} />}
        {!editable && <p className="m-0 text-sm leading-6 text-muted">{c.draftOnly}</p>}
      </header>
      {creation ? <EstimateCreationFlow {...creation} pending={pending} error={error} notice={notice}
        onSaveDraft={editable && (dirty || !record) && creation.step === "details" ? onSave : undefined}>
        {creation.step === "details" ? fields : creation.step === "review" ? creation.review : creation.send}
      </EstimateCreationFlow> : fields}
      {creation && revisions}
      {creation && history}

      <ConfirmDialog
        open={leaveTarget !== null}
        title={c.leaveTitle}
        description={c.leaveDescription}
        confirmLabel={c.discard}
        cancelLabel={c.stay}
        pending={pending}
        onClose={() => setLeaveTarget(null)}
        onConfirm={() => {
          const target = leaveTarget;
          setLeaveTarget(null);
          if (target && "href" in target) onNavigate(target.href);
          else if (target?.reload) onReload?.();
        }}
      />
    </div>
  );
}
