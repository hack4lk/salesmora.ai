"use client";

import { useEffect, useId, useRef, useState } from "react";
import { calculateEstimateTotals } from "@salesmora/domain";
import { AssistantPanel, ConfirmDialog, FormFeedback, WorkspaceNavigation, type WorkspaceNavigationPage } from "@salesmora/ui";
import { NotificationMenu } from "../../notifications/notification-menu/notification-menu";
import { getEstimateRowActions, getEstimateStatusActions, type EstimateRowAction, type EstimateStatusAction } from "../estimate-actions";
import { EstimateArchiveDialog } from "../estimate-archive-dialog/estimate-archive-dialog";
import { initialEstimateArchiveReview, type EstimateArchiveRequest } from "../estimate-archive-dialog/estimate-archive-dialog.preview";
import { estimateBusinessProfileFixture } from "../estimate-business-profile-form/estimate-business-profile-form.data";
import { EstimateConvertDialog } from "../estimate-convert-dialog/estimate-convert-dialog";
import { initialEstimateConversionReview, type EstimateConversionRecord, type EstimateConversionRequest } from "../estimate-convert-dialog/estimate-convert-dialog.preview";
import { EstimateDecisionDialog } from "../estimate-decision-dialog/estimate-decision-dialog";
import { initialEstimateDecisionValues, type EstimateDecisionRecord, type EstimateDecisionRequest, type EstimateDecisionValues } from "../estimate-decision-dialog/estimate-decision-dialog.preview";
import { EstimateDeleteDraftDialog } from "../estimate-delete-draft-dialog/estimate-delete-draft-dialog";
import { initialEstimateDeleteDraftValues, type EstimateDeleteDraftRequest, type EstimateDeleteDraftValues } from "../estimate-delete-draft-dialog/estimate-delete-draft-dialog.preview";
import { EstimateDeliveryCard } from "../estimate-delivery-card/estimate-delivery-card";
import type { EstimateDeliverySummary } from "../estimate-delivery-card/estimate-delivery-card.preview";
import { EstimateDetailsCard } from "../estimate-details-card/estimate-details-card";
import { EstimateHistoryTimeline } from "../estimate-history-timeline/estimate-history-timeline";
import { EstimateInternalNotesCard } from "../estimate-internal-notes-card/estimate-internal-notes-card";
import { EstimateItemsEditor, type EstimateItemsCatalog } from "../estimate-items-editor/estimate-items-editor";
import { EstimateLinkedRecord } from "../estimate-linked-record/estimate-linked-record";
import { estimateCapabilitiesByRole, estimatePreviewData } from "../estimate-preview.data";
import type { EstimateCapabilities, EstimateRole, EstimateStatus, EstimateViewState } from "../estimate-preview.types";
import { EstimatePreviewPaper } from "../estimate-preview-paper/estimate-preview-paper";
import { estimatePaperAmounts, reviewEstimatePaper, type EstimatePaperSource } from "../estimate-preview-paper/estimate-preview-paper.preview";
import { EstimatePublishDialog } from "../estimate-publish-dialog/estimate-publish-dialog";
import type { EstimatePublishRequest } from "../estimate-publish-dialog/estimate-publish-dialog.preview";
import { EstimateRowMenu } from "../estimate-row-menu/estimate-row-menu";
import { EstimateScopeCard } from "../estimate-scope-card/estimate-scope-card";
import { EstimateSendDialog } from "../estimate-send-dialog/estimate-send-dialog";
import type { EstimateSendRequest } from "../estimate-send-dialog/estimate-send-dialog.preview";
import type { EstimateSharingPreview } from "../estimate-sharing-review";
import { EstimateStatusBadge } from "../estimate-status-badge/estimate-status-badge";
import { EstimateStatusPanel } from "../estimate-status-panel/estimate-status-panel";
import { EstimateTermsCard } from "../estimate-terms-card/estimate-terms-card";
import { validateEstimateTerms } from "../estimate-terms-card/estimate-terms-card.validation";
import { EstimateTotals } from "../estimate-totals/estimate-totals";
import { estimateButton, estimatePrimary } from "../estimate-ui";
import { EstimateVoidDialog } from "../estimate-void-dialog/estimate-void-dialog";
import { initialEstimateVoidValues, type EstimateVoidRequest, type EstimateVoidValues } from "../estimate-void-dialog/estimate-void-dialog.preview";
import { estimatesPageData as shell } from "../estimates-page/estimates-page.data";
import { estimateEditorCatalogFixture, estimateEditorCurrentBusiness, estimateEditorHistory, estimateEditorInitialValues, estimateEditorJobMembersFixture, estimateEditorPageData as c, estimateEditorParent, estimateEditorSnapshot } from "./estimate-editor-page.data";
import { estimateEditorAccess, estimateEditorPaper, reviewEstimateEditorDraft, type EstimateEditorValues } from "./estimate-editor-page.preview";

export type EstimateEditorPreviewRequest =
  | { type: "save"; expectedVersion: number; value: EstimateEditorValues }
  | { type: "send"; request: EstimateSendRequest }
  | { type: "publish"; request: EstimatePublishRequest }
  | { type: "decision"; request: EstimateDecisionRequest }
  | { type: "convert"; request: EstimateConversionRequest }
  | { type: "void"; request: EstimateVoidRequest }
  | { type: "archive"; request: EstimateArchiveRequest }
  | { type: "delete-draft"; request: EstimateDeleteDraftRequest };

export type EstimateEditorPagePreviewProps = {
  scenario?: EstimateStatus | "new-lead" | "new-job";
  parentType?: "lead" | "job";
  role?: EstimateRole;
  state?: EstimateViewState;
  capabilities?: Partial<EstimateCapabilities>;
  canCreateJob?: boolean;
  canCorrectDecision?: boolean;
  canScheduleCreation?: boolean;
  assignedJob?: boolean;
  archived?: boolean;
  converted?: boolean;
  invalidDraft?: boolean;
  emptyDraft?: boolean;
  longContent?: boolean;
  missingBusiness?: boolean;
  businessLogoPath?: string | null;
  changedCurrentBusiness?: boolean;
  missingSnapshot?: boolean;
  conflict?: boolean;
  pending?: boolean;
  saveBehavior?: "request-only" | "host-saved" | "error";
  catalog?: EstimateItemsCatalog | null;
  initialOverlay?: "preview" | "assistant";
  onRequest?: (request: EstimateEditorPreviewRequest) => void;
};

/** Storybook-only composition/controller. No services, persistence, route changes or lifecycle commits. */
export function EstimateEditorPagePreview({
  scenario = "draft", parentType: suppliedParent, role = "owner", state = "ready", capabilities: suppliedCapabilities,
  canCreateJob = true, canCorrectDecision = true, canScheduleCreation = true,
  assignedJob = true, archived = false, converted = false, invalidDraft = false, emptyDraft = false,
  longContent = false, missingBusiness = false, businessLogoPath = estimateEditorCurrentBusiness.logoPath,
  changedCurrentBusiness = false, missingSnapshot = false, conflict = false, pending = false,
  saveBehavior = "request-only", catalog = estimateEditorCatalogFixture, initialOverlay, onRequest,
}: EstimateEditorPagePreviewProps) {
  const id = useId(), contentId = `${id}-main`;
  const status: EstimateStatus = scenario === "new-lead" || scenario === "new-job" ? "draft" : scenario;
  const parentType = suppliedParent ?? (scenario === "new-job" ? "job" : "lead");
  const parent = estimateEditorParent(parentType);
  const capabilities = { ...estimateCapabilitiesByRole[role], ...suppliedCapabilities };
  if (role === "field") { capabilities.void = false; capabilities.archive = false; capabilities.delete = false; }
  const initialNew = scenario === "new-lead" || scenario === "new-job";
  const [saved, setSaved] = useState(() => {
    const value = estimateEditorInitialValues(initialNew);
    if (role === "field") value.details.ownerId = "member-sam";
    if (status === "expired") value.terms.validUntil = "2026-10-21";
    if (emptyDraft) { value.items = []; value.details.recipientName = ""; value.details.recipientEmail = ""; value.terms.validUntil = ""; }
    if (longContent && status === "draft") {
      value.details.name = estimatePreviewData.longName; value.details.recipientName = estimatePreviewData.longCustomer;
      value.scope = value.scope.repeat(8); value.internalNotes = value.internalNotes.repeat(6); value.terms.message = value.terms.message.repeat(8);
    }
    return { value, number: initialNew ? "" : estimateEditorSnapshot.content.number, version: initialNew ? 0 : estimateEditorSnapshot.version };
  });
  const [value, setValue] = useState(() => {
    const initial = structuredClone(saved.value);
    if (invalidDraft) {
      initial.details.name = ""; initial.details.recipientEmail = c.stories.invalidEmail;
      initial.items[0] = { id: "invalid-line", description: "", quantity: "-1", unitPrice: "10", taxable: false, included: false };
    }
    return initial;
  });
  const [notice, setNotice] = useState("");
  const [saveError, setSaveError] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [versionConflict, setVersionConflict] = useState(conflict);
  const [preview, setPreview] = useState(initialOverlay === "preview");
  const [assistant, setAssistant] = useState(initialOverlay === "assistant");
  const [action, setAction] = useState<EstimateStatusAction | EstimateRowAction | "resend" | null>(null);
  const [navigation, setNavigation] = useState<"leave" | "reload" | null>(null);
  const [decision, setDecision] = useState<EstimateDecisionValues | null>(null);
  const [voidValue, setVoidValue] = useState<EstimateVoidValues | null>(null);
  const [deleteValue, setDeleteValue] = useState<EstimateDeleteDraftValues | null>(null);
  const [resendEmail, setResendEmail] = useState("");
  const previewButton = useRef<HTMLButtonElement>(null), closePreviewButton = useRef<HTMLButtonElement>(null);
  const feedback = useRef<HTMLDivElement>(null);
  const returningFromPreview = useRef(false);
  const dirty = !saved.number || JSON.stringify(value) !== JSON.stringify(saved.value);
  const access = estimateEditorAccess({ role, capabilities, parentType, assignedJob, status, archived, newDraft: !saved.number, ready: state === "ready" });
  const conversionGranted = access.convert && canCreateJob;
  const correctionGranted = access.correctDecision && canCorrectDecision;
  const editable = access.edit && !versionConflict;
  const members = estimatePreviewData.members;
  const preparedBy = members.find((member) => member.id === value.details.ownerId)?.name ?? c.unknownMember;
  const review = reviewEstimateEditorDraft(value, members);
  const business = {
    ...estimateEditorCurrentBusiness, logoPath: businessLogoPath,
    ...(missingBusiness ? { name: "", address: "", phone: "", email: "" } : {}),
    ...(changedCurrentBusiness ? { name: c.stories.changedBusiness } : {}),
  };
  const draftContent = estimateEditorPaper(value, {
    number: saved.number, revision: 1, business, preparedBy, relatedRecord: parent.number,
  });
  const captured: EstimatePaperSource = missingSnapshot ? { state: "unavailable" } : {
    ...estimateEditorSnapshot,
    content: {
      ...estimateEditorSnapshot.content, validUntil: saved.value.terms.validUntil, relatedRecord: parent.number,
      preparedBy: members.find((member) => member.id === saved.value.details.ownerId)?.name ?? c.unknownMember,
    },
  };
  const paper: EstimatePaperSource = status === "draft" ? { state: "draft", content: draftContent } : captured;
  const capturedReview = reviewEstimatePaper(captured);
  const totalCents = status === "draft" ? review.calculation.totalCents : capturedReview.amounts?.totalCents ?? null;
  const record = {
    id: estimateEditorSnapshot.estimateId, version: saved.version, number: saved.number, revision: 1,
    name: saved.value.details.name, status, archived, recipientName: saved.value.details.recipientName,
    recipientEmail: saved.value.details.recipientEmail, totalCents, validUntil: saved.value.terms.validUntil,
  };
  const decisionRecord: EstimateDecisionRecord = {
    ...record,
    decision: status === "accepted" || status === "declined"
      ? { outcome: status, decisionDate: c.today, channel: "phone", note: c.stories.decisionNote } : null,
  };
  const deletionRecord = { ...record, sharing: "never-shared" as const };
  const conversionRecord: EstimateConversionRecord = {
    ...record, parentType, parentId: parent.id, parentNumber: parent.number, snapshotHash: estimateEditorSnapshot.snapshotHash,
    totalCents, customerId: c.stories.customerId, service: c.stories.service,
    sourceLeadVersion: parentType === "lead" ? 4 : null, sourceLeadArchived: false, customerVersion: 2,
    convertedJobExists: converted, sourceLeadHasJob: converted,
    scope: estimateEditorSnapshot.content.scope, serviceAddress: estimateEditorSnapshot.content.serviceAddress,
    convertedJob: converted ? { id: c.stories.jobId, number: c.stories.jobNumber, canOpen: false } : null,
  };
  const customer = { state: "ready" as const, id: c.stories.customerId, name: c.stories.customer };
  const snapshotHash = status === "draft" ? `sample-editor-saved-v${saved.version}` : estimateEditorSnapshot.snapshotHash;
  const amounts = estimatePaperAmounts(calculateEstimateTotals(draftContent));
  const sharingSource: EstimatePaperSource = status === "draft"
    ? amounts ? { state: "snapshot", estimateId: record.id, version: saved.version, snapshotHash, content: draftContent, amounts } : { state: "unavailable" }
    : captured;
  const sharingPaper = reviewEstimatePaper(sharingSource);
  const sharingPreview: EstimateSharingPreview = sharingPaper.content ? {
    state: "ready", estimateId: record.id, version: saved.version, snapshotHash,
    content: <EstimatePreviewPaper source={sharingSource} showPrintControl={false} />,
  } : { state: "error", message: c.missingSnapshot };
  const sharingIssues = [
    ...reviewEstimatePaper(paper).issues,
    ...Object.values(validateEstimateTerms(value.terms, { today: c.today, purpose: action === "publish" ? "publish" : "send" })),
    ...(!saved.number || dirty ? [c.saveBeforeSharing] : []),
  ];
  const readiness = sharingIssues.length ? { state: "blocked" as const, issues: sharingIssues } : { state: "ready" as const };
  const inactive = ["expired", "superseded", "void"].includes(status);
  const delivery: EstimateDeliverySummary = {
    email: status === "draft" || status === "published" || status === "superseded" ? { state: "not-sent" }
      : { state: "sent", recipientEmail: saved.value.details.recipientEmail, updatedAt: "2026-10-22T15:00:00Z" },
    link: {
      state: status === "draft" ? "not-created" : status === "expired" ? "expired" : status === "superseded" ? "replaced" : status === "void" ? "revoked" : "active",
      expiresAt: status === "draft" ? null : inactive ? "2026-10-22T04:00:00Z" : "2026-11-22T05:00:00Z",
      firstViewedAt: status === "accepted" || status === "declined" ? "2026-10-22T15:30:00Z" : null,
    },
  };
  const events = estimateEditorHistory(status, !saved.number);
  const currentMember = members[role === "field" ? 1 : 0];
  const pages: WorkspaceNavigationPage[] = role === "field"
    ? ["home", "jobs", "calendar", "estimates", "work-orders", "settings"]
    : ["home", "leads", "customers", "jobs", "calendar", "estimates", "work-orders", "materials", "settings"];

  useEffect(() => {
    if (!dirty || !access.read) return;
    function guard(event: BeforeUnloadEvent) { event.preventDefault(); event.returnValue = ""; }
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty, access.read]);
  useEffect(() => {
    if (preview && access.read) { closePreviewButton.current?.focus(); returningFromPreview.current = true; }
    else if (returningFromPreview.current) { previewButton.current?.focus(); returningFromPreview.current = false; }
  }, [preview, access.read]);

  function change(patch: Partial<EstimateEditorValues>) {
    if (!editable || pending) return;
    setValue((current) => ({ ...current, ...patch })); setSaveError(""); setNotice("");
  }
  function save() {
    if (!editable || pending || !dirty) return;
    setShowErrors(true); setNotice("");
    if (!review.valid) { setSaveError(c.validation); feedback.current?.focus(); return; }
    onRequest?.({ type: "save", expectedVersion: saved.version, value: structuredClone(value) });
    if (saveBehavior === "error") { setSaveError(c.saveError); feedback.current?.focus(); return; }
    if (saveBehavior === "host-saved") {
      setSaved({ value: structuredClone(value), number: saved.number || c.stories.savedNewNumber, version: saved.version + 1 });
      setSaveError(""); setNotice(c.saved);
    } else setNotice(c.saveRequest);
  }
  function navigate() {
    if (pending) return;
    if (dirty && access.read) setNavigation("leave");
    else setNotice(c.navigation);
  }
  function reload() {
    const refreshed = structuredClone(saved.value);
    if (versionConflict) {
      refreshed.details.name = c.stories.reloadedName;
      setSaved({ ...saved, value: refreshed, version: saved.version + 1 });
    }
    setValue(refreshed); setVersionConflict(false); setSaveError(""); setShowErrors(false);
    setAction(null); setNavigation(null); setNotice(versionConflict ? c.reloaded : c.navigation);
  }
  function requestAction(next: EstimateStatusAction | EstimateRowAction | "resend") {
    if (!access.read || pending || versionConflict) return;
    if (dirty || !saved.number) { setNotice(c.saveBeforeSharing); return; }
    if (next === "open") { setNotice(c.navigation); return; }
    const context = { status, archived, capabilities, parentType, canCorrectDecision: correctionGranted, canConvertToJob: conversionGranted, hasConvertedJob: converted };
    if (next !== "resend" && ![...getEstimateRowActions(context), ...getEstimateStatusActions(context)].includes(next)) return;
    if (next === "duplicate" || next === "revise") { setNotice(c.createDraftRequest); return; }
    if (next === "mark-accepted" || next === "mark-declined" || next === "correct-decision") {
      setDecision(initialEstimateDecisionValues(decisionRecord, c.today, next === "mark-declined" ? "declined" : "accepted"));
    }
    if (next === "void") setVoidValue(initialEstimateVoidValues(record));
    if (next === "delete-draft") setDeleteValue(initialEstimateDeleteDraftValues(deletionRecord));
    if (next === "resend") setResendEmail(record.recipientEmail);
    setAction(next);
  }
  function confirmed(request: EstimateEditorPreviewRequest) {
    if (!access.read || pending || versionConflict || dirty) return;
    onRequest?.(request); setAction(null); setNotice(c.actionRequest);
  }
  const actionContext = { status, archived, capabilities };

  return <div className="estimate-editor-host">
    <div className={preview && access.read ? "hidden print:hidden" : "min-h-screen bg-canvas print:hidden md:flex"}>
      <WorkspaceNavigation workspaceName={shell.workspace}
        user={{ name: currentMember.name, email: role === "field" ? shell.fieldEmail : shell.userEmail, role }}
        currentPage="estimates" contentId={contentId} availablePages={pages}
        authorizedPages={capabilities.read ? pages : pages.filter((page) => page !== "estimates")}
        onNavigate={navigate} onAccountSettings={navigate} onSignOut={navigate} />
      <main id={contentId} tabIndex={-1} className="min-w-0 flex-1 px-6 py-8 pb-28 focus-visible:focus-ring sm:px-10 md:py-10 md:pb-28"
        onClickCapture={(event) => {
          const href = event.target instanceof Element ? event.target.closest("a")?.getAttribute("href") : null;
          if (href?.startsWith("/")) { event.preventDefault(); event.stopPropagation(); navigate(); }
        }}>
        <div className="mx-auto grid min-w-0 gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button type="button" disabled={pending} className={estimateButton} onClick={navigate}>{c.back}</button>
            <NotificationMenu workspaceName={shell.workspace} unreadCount={0} items={[]} state="ready" preferencesHref={`#${contentId}`}
              onOpen={() => undefined} onRetry={() => undefined} onMarkRead={() => undefined} onLoadMore={() => undefined} />
          </div>
          <header className="flex min-w-0 flex-wrap items-end justify-between gap-5">
            <div className="min-w-0 flex-1">
              <h1 className="m-0 text-heading font-semibold wrap-anywhere sm:text-heading-lg">{access.read ? value.details.name.trim() || c.title : c.title}</h1>
              <p className="mb-0 mt-3 text-base leading-6 text-muted">{c.description}</p>
              {access.read && <div className="mt-3 grid gap-1 text-sm text-muted">
                <p className="m-0 wrap-anywhere">{saved.number ? `${saved.number} · ${c.lastUpdated}` : c.neverSaved}</p>
                <p className="m-0 wrap-anywhere">{c.preparedBy(preparedBy)}</p>
              </div>}
            </div>
            {access.read && <div className="flex max-w-full flex-wrap items-center gap-3">
              <EstimateStatusBadge status={status} archived={archived} />
              {access.edit && <button type="button" disabled={pending || versionConflict || !dirty} className={estimateButton} onClick={save}>{pending ? c.saving : c.save}</button>}
              <button ref={previewButton} type="button" className={estimatePrimary} disabled={pending} onClick={() => setPreview(true)}>{c.preview}</button>
              {saved.number && <EstimateRowMenu name={record.name} {...actionContext} disabled={pending || versionConflict || dirty} onAction={requestAction} />}
            </div>}
          </header>
          <p className="m-0 rounded-2xl border border-line bg-paper p-4 text-sm leading-6 text-muted">{c.previewNotice}</p>
          {!access.read ? state === "loading" ? <p role="status">{c.loading}</p>
            : <div className="grid justify-items-start gap-3">
              <FormFeedback kind="error" message={state === "error" ? c.error : state === "not-found" ? c.notFound : c.forbidden} />
              {state === "error" && <button type="button" className={estimateButton} onClick={() => setNotice(c.loadRequest)}>{c.retry}</button>}
              {notice && <p role="status">{notice}</p>}
            </div> : <>
              <div ref={feedback} tabIndex={-1} className="grid gap-3 rounded-xl focus-visible:focus-ring">
                {dirty && <p role="status" className="m-0 text-sm font-semibold text-ink">{c.unsaved}</p>}
                {notice && <p role="status" className="m-0 text-sm leading-6 wrap-anywhere">{notice}</p>}
                {saveError && <FormFeedback kind="error" message={saveError} />}
                {versionConflict && <FormFeedback kind="error" message={c.conflict} />}
                {status === "draft" && (dirty || versionConflict) && <button type="button" disabled={pending} className={`${estimateButton} justify-self-start`}
                  onClick={() => dirty ? setNavigation("reload") : reload()}>{c.reload}</button>}
                {!access.edit && <p className="m-0 text-sm text-muted">{c.readOnly}</p>}
                {status === "draft" && <p className="m-0 text-sm leading-6 text-muted">{c.incompleteDraft}</p>}
              </div>
              <div className="grid min-w-0 items-start gap-6 lg:grid-cols-3">
                <div className="grid min-w-0 gap-6 lg:col-span-2">
                  <EstimateLinkedRecord record={parent} scope={role === "field" ? "assigned-jobs" : "workspace"} />
                  <EstimateDetailsCard value={value.details} number={saved.number || null} revision={1} status={status} members={members}
                    canEdit={editable} canAssignOwner={access.assignOwner} pending={pending} errors={showErrors ? review.details : undefined}
                    onChange={(details) => change({ details })} />
                  <EstimateItemsEditor items={value.items} status={status} canEdit={editable} pending={pending} showErrors={showErrors}
                    catalog={catalog ?? undefined}
                    onChange={(items) => change({ items })} />
                  <EstimateTotals items={value.items} value={value.totals} deposit={value.terms.deposit} status={status} canEdit={editable} pending={pending}
                    onChange={(totals) => change({ totals })} />
                  <EstimateTermsCard value={value.terms} timezone={c.timezone} calculation={review.calculation}
                    paymentPresets={estimateBusinessProfileFixture.profile.paymentPresets} status={status} canEdit={editable} pending={pending}
                    errors={showErrors ? review.terms : undefined} onChange={(terms) => change({ terms })} />
                  <EstimateScopeCard value={value.scope} status={status} canEdit={editable} pending={pending} error={showErrors ? review.scope : undefined}
                    onChange={(scope) => change({ scope })} />
                  <EstimateInternalNotesCard value={value.internalNotes} status={status} canEdit={editable} pending={pending} error={showErrors ? review.internalNotes : undefined}
                    onChange={(internalNotes) => change({ internalNotes })} />
                </div>
                <aside aria-label={c.rail} className="grid min-w-0 gap-6">
                  <EstimateStatusPanel {...actionContext} parentType={parentType} canCorrectDecision={correctionGranted} canConvertToJob={conversionGranted}
                    convertedJob={converted ? { number: c.stories.jobNumber } : undefined}
                    parentJob={parentType === "job" ? { number: parent.number } : undefined}
                    pending={pending || versionConflict || (status === "draft" && dirty)}
                    error={status === "draft" && dirty ? c.saveBeforeSharing : undefined} onAction={requestAction} />
                  <EstimateHistoryTimeline events={events} total={events.length} timezone={c.timezone} canRead />
                  <EstimateDeliveryCard {...actionContext} delivery={delivery} timezone={c.timezone} pending={pending || versionConflict}
                    actionError={notice === c.copyUnavailable ? notice : undefined} onCopyLink={() => setNotice(c.copyUnavailable)}
                    onReviewResend={() => requestAction("resend")} />
                </aside>
              </div>
              <AssistantPanel open={assistant} onOpenChange={setAssistant} badge={c.assistantBadge} description={c.assistantDescription}
                contextLabel={saved.number ? `${saved.number} · ${value.details.name}` : value.details.name || c.title}
                messages={[{ id: "estimate-editor-preview", role: "assistant", text: c.assistantText }]} sendDisabled
                onSend={async () => ({ ok: false, message: c.assistantUnavailable })} />
            </>}
        </div>
      </main>
    </div>
    {preview && access.read && <main aria-labelledby={`${id}-preview-title`} className="min-h-screen bg-canvas p-6 sm:p-10 print:min-h-0 print:bg-paper print:p-0">
      <header className="mx-auto mb-6 grid max-w-letter gap-3 print:hidden">
        <button ref={closePreviewButton} type="button" className={`${estimateButton} justify-self-start`} onClick={() => setPreview(false)}>{c.closePreview}</button>
        <h1 id={`${id}-preview-title`} className="m-0 text-heading font-semibold">{c.previewTitle}</h1>
        <p className="m-0 text-sm leading-6 text-muted">{c.previewDescription}</p>
      </header>
      <EstimatePreviewPaper source={paper} />
    </main>}
    {access.read && !preview && <>
      <ConfirmDialog open={navigation !== null} title={navigation === "reload" ? c.reloadTitle : c.leaveTitle}
        description={navigation === "reload" ? c.reloadDescription : c.leaveDescription}
        confirmLabel={navigation === "reload" ? c.reloadConfirm : c.discard} cancelLabel={c.stay} pending={pending}
        onClose={() => setNavigation(null)} onConfirm={reload} />
      {action === "send" && <EstimateSendDialog open estimate={record} capabilities={capabilities} today={c.today}
        pending={pending} subject={c.subject(record.number)} readiness={readiness} preview={sharingPreview} onClose={() => setAction(null)}
        onConfirm={(request) => confirmed({ type: "send", request })} />}
      {action === "resend" && <EstimateSendDialog open mode="resend" estimate={record} capabilities={capabilities} today={c.today}
        pending={pending} subject={c.subject(record.number)} readiness={readiness} preview={sharingPreview} delivery={delivery}
        recipientEmail={resendEmail} onRecipientEmailChange={setResendEmail} onClose={() => setAction(null)}
        onConfirm={(request) => confirmed({ type: "send", request })} />}
      {action === "publish" && <EstimatePublishDialog open pending={pending} estimate={record} capabilities={capabilities}
        view={{ state: "review", today: c.today, readiness, preview: sharingPreview, onConfirm: (request) => confirmed({ type: "publish", request }) }}
        onClose={() => setAction(null)} />}
      {decision && (action === "mark-accepted" || action === "mark-declined" || action === "correct-decision") && <EstimateDecisionDialog open
        pending={pending} estimate={decisionRecord} capabilities={capabilities} canCorrectDecision={correctionGranted}
        mode={action === "correct-decision" ? "correct" : "record"} value={decision} today={c.today} timezone={c.timezone}
        onChange={setDecision} onConfirm={(request) => confirmed({ type: "decision", request })} onClose={() => setAction(null)} />}
      {action === "convert" && <EstimateConvertDialog open pending={pending} estimate={conversionRecord} capabilities={capabilities}
        canCreateJob={conversionGranted} canScheduleCreation={canScheduleCreation} customer={customer}
        review={initialEstimateConversionReview(conversionRecord, customer)} members={estimateEditorJobMembersFixture}
        onConfirm={(request) => confirmed({ type: "convert", request })} onClose={() => setAction(null)} />}
      {action === "void" && voidValue && <EstimateVoidDialog open pending={pending} estimate={record} capabilities={capabilities} value={voidValue}
        onChange={setVoidValue} onConfirm={(request) => confirmed({ type: "void", request })} onClose={() => setAction(null)} />}
      {(action === "archive" || action === "restore") && <EstimateArchiveDialog open pending={pending} estimate={record} capabilities={capabilities} mode={action}
        review={initialEstimateArchiveReview(record, action)}
        onConfirm={(request) => confirmed({ type: "archive", request })} onClose={() => setAction(null)} />}
      {action === "delete-draft" && deleteValue && <EstimateDeleteDraftDialog open pending={pending} estimate={deletionRecord} capabilities={capabilities} value={deleteValue}
        onChange={setDeleteValue} onConfirm={(request) => confirmed({ type: "delete-draft", request })} onClose={() => setAction(null)} />}
    </>}
  </div>;
}
