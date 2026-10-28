"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  estimateEmailDestinationSchema,
  type EstimateConversionReceipt,
  type EstimateDraftValues,
  type EstimateRevisionFamily,
  type MaterialListResult,
} from "@salesmora/contracts";
import { FormFeedback, MoneyText, TextField } from "@salesmora/ui";
import type { EstimateDraftSaveResult, EstimateEditorSeed, EstimateShareReceipt, EstimateSharingReviewResult } from "@salesmora/data";
import { calculateEstimateTotals } from "@salesmora/domain";
import type { EstimateCapabilities } from "../estimate-preview.types";
import type { MaterialPickerOption } from "../../materials/material-picker/material-picker";
import type { EstimateItemsCatalog } from "../estimate-items-editor/estimate-items-editor";
import { EstimateDeleteDraftDialog } from "../estimate-delete-draft-dialog/estimate-delete-draft-dialog";
import {
  initialEstimateDeleteDraftValues,
  type EstimateDeleteDraftRecord,
  type EstimateDeleteDraftValues,
} from "../estimate-delete-draft-dialog/estimate-delete-draft-dialog.preview";
import { EstimateEditorForm } from "./estimate-editor-form";
import { EstimateSendDialog } from "../estimate-send-dialog/estimate-send-dialog";
import type { EstimateSendRequest } from "../estimate-send-dialog/estimate-send-dialog.preview";
import { EstimatePublishDialog } from "../estimate-publish-dialog/estimate-publish-dialog";
import type { EstimatePublishRequest } from "../estimate-publish-dialog/estimate-publish-dialog.preview";
import { EstimateDeliveryCard } from "../estimate-delivery-card/estimate-delivery-card";
import { EstimatePreviewPaper } from "../estimate-preview-paper/estimate-preview-paper";
import type { EstimatePaperSource } from "../estimate-preview-paper/estimate-preview-paper.preview";
import type { EstimateSharingPreview, EstimateSharingReadiness } from "../estimate-sharing-review";
import type { EstimateEditorValues } from "./estimate-editor-values";
import { reviewEstimateEditorDraftValues } from "./estimate-editor-validation";
import { estimateEditorRouteData as c } from "./estimate-editor-route.data";
import type { EstimateCreationStep } from "../estimate-creation-flow/estimate-creation-flow.data";
import { estimateButton, estimatePanel } from "../estimate-ui";
import { EstimateStatusPanel } from "../estimate-status-panel/estimate-status-panel";
import { EstimateHistoryConnected } from "../estimate-history-timeline/estimate-history-connected";
import { EstimateVoidReview } from "../estimate-void-dialog/estimate-void-review";
import { EstimateArchiveReview } from "../estimate-archive-dialog/estimate-archive-review";
import { estimateArchiveDialogData as archiveCopy } from "../estimate-archive-dialog/estimate-archive-dialog.data";
import { estimateLifecycleData } from "../estimate-lifecycle-client";
import { estimateLifecycleRequest, EstimateLifecycleRequestError } from "../estimate-lifecycle-client";
import type { EstimateDecisionReview as DecisionReview } from "@salesmora/contracts";
import { EstimateDecisionReview } from "../estimate-decision-dialog/estimate-decision-review";
import { estimateDecisionDialogData as decisionCopy } from "../estimate-decision-dialog/estimate-decision-dialog.data";
import { EstimateRevisionsConnected } from "../estimate-revisions-panel/estimate-revisions-connected";
import { EstimateRevisionReview } from "../estimate-revision-review/estimate-revision-review";
import { estimateRevisionReviewData as revisionCopy } from "../estimate-revision-review/estimate-revision-review.data";
import { reviewEstimateRevisionSharing, type EstimateRevisionReviewValue } from "../estimate-revision-review/estimate-revision-review.preview";
import { EstimateLeadStageConnected } from "../estimate-lead-stage-suggestion/estimate-lead-stage-connected";
import { estimateLeadStageSuggestionData as leadStageCopy } from "../estimate-lead-stage-suggestion/estimate-lead-stage-suggestion.data";
import { EstimateConvertConnected } from "../estimate-convert-dialog/estimate-convert-connected";

class EstimateRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
  }
}

function statusOf(error: unknown): number | undefined {
  return error instanceof EstimateRequestError
    ? error.status
    : undefined;
}

function codeOf(error: unknown): string | undefined {
  return error instanceof EstimateRequestError
    ? error.code
    : undefined;
}

function messageOf(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

async function request<T>(
  url: string,
  init: RequestInit,
  fallback: string,
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: init.body ? { "Content-Type": "application/json" } : init.headers,
  });
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = undefined;
  }
  if (!response.ok) {
    const errorMessage =
      body && typeof body === "object" && "error" in body && typeof body.error === "string"
        ? body.error
        : fallback;
    const error = new EstimateRequestError(
      errorMessage,
      response.status,
      body && typeof body === "object" && "code" in body && typeof body.code === "string"
        ? body.code
        : undefined,
    );
    throw error;
  }
  return body as T;
}

function valuesFromSeed(seed: EstimateEditorSeed, currentUserId: string): EstimateEditorValues {
  if (seed.estimate) {
    const { items, ...values } = seed.estimate.values;
    return {
      ...values,
      items: items.map((item, index) => ({ ...item, id: `saved-estimate-item-${index}` })),
    };
  }
  return {
    details: {
      name: "",
      recipientName: seed.parent?.contactName || seed.parent?.customer?.name || "",
      recipientEmail: seed.parent?.recipientEmail ?? "",
      serviceAddress: seed.parent?.serviceAddress ?? "",
      ownerId: currentUserId,
    },
    items: [],
    totals: {
      discount: { type: "none" },
      taxRate: seed.defaults.taxRate,
    },
    terms: {
      message: seed.defaults.message,
      validUntil: seed.defaults.validUntil,
      paymentTerms: "",
      termsNote: seed.defaults.termsNote,
      deposit: seed.defaults.deposit,
    },
    scope: "",
    internalNotes: "",
    paymentLink: "",
  };
}

function apiValues(values: EstimateEditorValues): EstimateDraftValues {
  return {
    details: values.details,
    items: values.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxable: item.taxable,
      included: item.included,
      ...(item.unit !== undefined ? { unit: item.unit } : {}),
      ...(item.catalog ? { catalog: item.catalog } : {}),
    })),
    totals: values.totals,
    terms: values.terms,
    scope: values.scope,
    internalNotes: values.internalNotes,
    paymentLink: values.paymentLink?.trim() ?? "",
  };
}

function fingerprint(value: unknown) {
  return JSON.stringify(value);
}

export function EstimateEditorRoute({
  workspaceId,
  currentUserId,
  seed,
  initialReview = false,
}: {
  workspaceId: string;
  currentUserId: string;
  seed: EstimateEditorSeed;
  initialReview?: boolean;
}) {
  const router = useRouter();
  const initial = useMemo(() => valuesFromSeed(seed, currentUserId), [currentUserId, seed]);
  const [values, setValues] = useState(initial);
  const [step, setStep] = useState<EstimateCreationStep>(initialReview ? "review" : "details");
  const [reviewBinding, setReviewBinding] = useState<{ version: number; hash: string; sourceId?: string; sourceVersion?: number } | null>(null);
  const [revisionValue, setRevisionValue] = useState<EstimateRevisionReviewValue | null>(null);
  const [revisionFamily, setRevisionFamily] = useState<EstimateRevisionFamily | null>(null);
  const [deliveryEmail, setDeliveryEmail] = useState(initial.details.recipientEmail);
  const [deliveryEmailError, setDeliveryEmailError] = useState("");
  const [savedFingerprint, setSavedFingerprint] = useState(() => fingerprint(initial));
  const [record, setRecord] = useState(seed.estimate);
  const [pending, setPending] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(false);
  const [deleteValue, setDeleteValue] = useState<EstimateDeleteDraftValues | null>(null);
  const [deleteError, setDeleteError] = useState<{ kind: "error" | "conflict"; message: string }>();
  const [sharing, setSharing] = useState<EstimateSharingReviewResult | null>(null);
  const [sharingError, setSharingError] = useState("");
  const [sharingReadable, setSharingReadable] = useState(true);
  const [sharingMode, setSharingMode] = useState<"send" | "publish" | "resend" | null>(null);
  const [sharingDialogError, setSharingDialogError] = useState<{ kind: "error" | "conflict"; message: string }>();
  const [shareReceipt, setShareReceipt] = useState<EstimateShareReceipt | null>(null);
  const [resendEmail, setResendEmail] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "pending" | "copied" | "error">("idle");
  const [copyError, setCopyError] = useState("");
  const [voidOpen, setVoidOpen] = useState(false);
  const [archiveMode, setArchiveMode] = useState<"archive" | "restore" | null>(null);
  const [decisionReview, setDecisionReview] = useState<DecisionReview | null>(null);
  const [decisionError, setDecisionError] = useState("");
  const [decisionReadable, setDecisionReadable] = useState(true);
  const [decisionMode, setDecisionMode] = useState<"record" | "correct" | null>(null);
  const [conversionOpen, setConversionOpen] = useState(false);
  const [conversionRefresh, setConversionRefresh] = useState(0);
  const [decisionOutcome, setDecisionOutcome] = useState<"accepted" | "declined">("accepted");
  const [leadSuggestion, setLeadSuggestion] = useState<{ sourceSubmissionId: string; expectedEstimateVersion: number } | null>(null);
  const [leadStageOpen, setLeadStageOpen] = useState(false);
  const closeConversion = useCallback(() => setConversionOpen(false), []);
  const conversionAccessLost = useCallback(() => {
    setConversionOpen(false);
    setDecisionReview(null);
    setDecisionReadable(false);
  }, []);
  const conversionSucceeded = useCallback((receipt: EstimateConversionReceipt) => {
    setConversionOpen(false);
    setDecisionReview(current => current?.estimate.id === receipt.estimateId
      ? {
        ...current,
        canConvertToJob: false,
        convertedJob: { number: receipt.job.number, href: receipt.job.href },
      }
      : current);
    setConversionRefresh(current => current + 1);
    setNotice(c.converted);
  }, []);
  const inFlight = useRef(false);
  const sharingSequence = useRef(0);
  const submission = useRef<{ fingerprint: string; id: string } | null>(null);
  const dirty = fingerprint(values) !== savedFingerprint;
  const query = `?workspace=${encodeURIComponent(workspaceId)}`;
  const routeSeed = useMemo(
    () => ({
      ...seed, estimate: record,
      capabilities: {
        ...seed.capabilities,
        update: seed.capabilities.update && record?.status === "draft" && !record.archived,
        delete: seed.capabilities.delete && record?.status === "draft" && !record.archived,
      },
    }),
    [record, seed],
  );
  const recordId = record?.id;
  const recordVersion = record?.version;
  const recordStatus = record?.status;
  const loadDecision = useCallback((signal?: AbortSignal) => {
    if (!recordId || recordStatus === "draft") return Promise.resolve();
    return estimateLifecycleRequest<DecisionReview>(
      `/api/estimates/${encodeURIComponent(recordId)}/decision${query}`, decisionCopy.live.loadError, { signal },
    ).then(review => {
      if (signal?.aborted) return;
      if (review.estimate.id !== recordId || review.estimate.version !== recordVersion) {
        throw new EstimateLifecycleRequestError(decisionCopy.live.mismatch, 409);
      }
      setDecisionReview(review);
      setRecord(current => current?.version === review.estimate.version && current.status !== review.estimate.status
        ? { ...current, status: review.estimate.status } : current);
      setDecisionError("");
      setDecisionReadable(true);
    }).catch((caught: unknown) => {
      if (signal?.aborted) return;
      setDecisionReview(null);
      setDecisionError(messageOf(caught, decisionCopy.live.loadError));
      const status = caught instanceof EstimateLifecycleRequestError ? caught.status : undefined;
      if (status === 401 || status === 404) setDecisionReadable(false);
      if (status === 409) setConflict(true);
      if (status === 401) router.replace("/login");
    });
  }, [query, recordId, recordStatus, recordVersion, router]);
  useEffect(() => {
    const controller = new AbortController();
    void loadDecision(controller.signal);
    return () => controller.abort();
  }, [loadDecision]);
  const loadSharing = useCallback((signal?: AbortSignal, background = false) => {
    if (!recordId) return Promise.resolve(null);
    const sequence = ++sharingSequence.current;
    return request<EstimateSharingReviewResult>(
      `/api/estimates/${encodeURIComponent(recordId)}/sharing${query}`, { signal }, c.sharingError,
    ).then(result => {
      if (signal?.aborted || sequence !== sharingSequence.current) return null;
      if (result.estimate.id !== recordId || result.estimate.version !== recordVersion) {
        throw new EstimateRequestError(c.sharingConflict, 409, "conflict");
      }
      setSharing(result);
      setSharingError("");
      setSharingDialogError(undefined);
      setSharingReadable(true);
      setRecord(current => current?.version === result.estimate.version ? result.estimate : current);
      return result;
    }).catch((caught: unknown) => {
      if (signal?.aborted || sequence !== sharingSequence.current) return null;
      const message = messageOf(caught, c.sharingError);
      const status = statusOf(caught);
      if (!background || status === 401 || status === 404 || status === 409) setSharing(null);
      setSharingError(message);
      setSharingDialogError({ kind: statusOf(caught) === 409 ? "conflict" : "error", message });
      if (statusOf(caught) === 409) setConflict(true);
      if (statusOf(caught) === 401 || statusOf(caught) === 404) setSharingReadable(false);
      if (statusOf(caught) === 401) router.replace("/login");
      return null;
    });
  }, [query, recordId, recordVersion, router]);
  useEffect(() => {
    if (!recordId) return;
    const controller = new AbortController();
    void loadSharing(controller.signal);
    return () => controller.abort();
  }, [loadSharing, recordId]);
  const emailQueued = sharing?.delivery.email.state === "queued";
  useEffect(() => {
    if (!emailQueued) return;
    const controller = new AbortController();
    let refreshing = false;
    const timer = setInterval(() => {
      if (!refreshing && !inFlight.current && !dirty && !sharingMode && !controller.signal.aborted) {
        refreshing = true;
        void loadSharing(controller.signal, true).finally(() => { refreshing = false; });
      }
    }, 5000);
    return () => { clearInterval(timer); controller.abort(); };
  }, [dirty, emailQueued, loadSharing, sharingMode]);

  const searchCatalog = useCallback(async (
    q: string,
    signal: AbortSignal,
  ): Promise<MaterialPickerOption[]> => {
    const params = new URLSearchParams({ workspace: workspaceId, q, pageSize: "25" });
    const result = await request<MaterialListResult>(
      `/api/materials?${params}`,
      { signal },
      c.searchError,
    );
    return result.rows.map((material) => ({
      id: material.id,
      name: material.name,
      unit: material.unit,
      sku: material.sku,
      priceCents: material.priceCents,
    }));
  }, [workspaceId]);
  const catalog = useMemo<EstimateItemsCatalog | undefined>(
    () => seed.capabilities.browseMaterials
      ? { search: searchCatalog, canViewPrices: seed.capabilities.viewMaterialPrices }
      : undefined,
    [searchCatalog, seed.capabilities.browseMaterials, seed.capabilities.viewMaterialPrices],
  );

  function submissionId(payload: unknown) {
    const currentFingerprint = fingerprint(payload);
    if (submission.current?.fingerprint === currentFingerprint) return submission.current.id;
    const id = crypto.randomUUID();
    submission.current = { fingerprint: currentFingerprint, id };
    return id;
  }

  async function save(continueToReview = false): Promise<boolean> {
    if (inFlight.current || pending) return false;
    setShowErrors(true);
    setNotice("");
    setError("");
    setConflict(false);
    if (!seed.capabilities.read || !(record ? routeSeed.capabilities.update : seed.capabilities.create)) {
      setError(c.saveError);
      return false;
    }
    if (!reviewEstimateEditorDraftValues(values, seed.members, { today: seed.today }).valid) {
      setError(c.validation);
      return false;
    }
    const payloadValues = apiValues(values);
    const payload = record
      ? {
          workspaceId,
          estimateId: record.id,
          expectedVersion: record.version,
          values: payloadValues,
        }
      : {
          workspaceId,
          submissionId: submissionId({
            workspaceId,
            parentType: seed.parent?.type,
            parentId: seed.parent?.id,
            customerId: seed.creationCustomerId,
            values: payloadValues,
          }),
          parentType: seed.parent?.type,
          parentId: seed.parent?.id,
          customerId: seed.creationCustomerId,
          values: payloadValues,
        };
    if (!record && (!seed.parent || !seed.capabilities.create)) {
      setError(c.createError);
      return false;
    }
    inFlight.current = true;
    setPending(true);
    try {
      const result = await request<EstimateDraftSaveResult>(
        record ? `/api/estimates/${encodeURIComponent(record.id)}${query}` : `/api/estimates${query}`,
        {
          method: record ? "PATCH" : "POST",
          body: JSON.stringify(payload),
        },
        record ? c.saveError : c.createError,
      );
      if (!record) {
        router.replace(`/estimates/${encodeURIComponent(result.id)}${query}${continueToReview ? "&review=1" : ""}`);
        return true;
      }
      setRecord({ ...record, ...result });
      setSharingError("");
      setSavedFingerprint(fingerprint(values));
      setShowErrors(false);
      setNotice(c.saved);
      if (continueToReview) setStep("review");
      return true;
    } catch (caught) {
      setError(messageOf(caught, record ? c.saveError : c.createError));
      if (statusOf(caught) === 409 || codeOf(caught) === "conflict") setConflict(true);
      if (statusOf(caught) === 401) router.replace("/login");
      return false;
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  async function continueDetails() {
    if (pending || inFlight.current || conflict) return;
    const draft = reviewEstimateEditorDraftValues(values, seed.members, { today: seed.today });
    if (!draft.valid || !values.details.recipientName.trim() || !values.items.length ||
        !values.terms.validUntil || draft.calculation.totalCents === null) {
      setShowErrors(true); setError(c.reviewRequired); return;
    }
    setReviewBinding(null); setSharingDialogError(undefined); setNotice(""); setError("");
    if (dirty || !record) { await save(true); return; }
    inFlight.current = true; setPending(true);
    try {
      const reviewed = await loadSharing();
      if (reviewed) setStep("review");
    } finally { inFlight.current = false; setPending(false); }
  }

  async function confirmReview() {
    if (dirty || pending || inFlight.current || conflict || !sharing?.snapshotHash || sharing.issues.length) return;
    inFlight.current = true;
    setPending(true); setError(""); setNotice("");
    const displayedHash = sharing.snapshotHash;
    const displayedRevision = fingerprint(sharing.revision);
    try {
      const latest = await loadSharing();
      if (!latest) return;
      if (!latest.snapshotHash || latest.issues.length) { setError(c.reviewNotReady); return; }
      if (latest.snapshotHash !== displayedHash) { setError(c.reviewChanged); return; }
      if (fingerprint(latest.revision) !== displayedRevision) {
        setRevisionValue(null); setError(c.reviewChanged); return;
      }
      if (revisionConfirmation && !revisionConfirmation.confirmation) {
        setError(revisionConfirmation.issues.join(" ")); return;
      }
      setReviewBinding({
        version: latest.estimate.version, hash: latest.snapshotHash,
        ...(latest.revision ? { sourceId: latest.revision.sourceEstimateId, sourceVersion: latest.revision.sourceVersion } : {}),
      });
      setDeliveryEmail(latest.estimate.values.details.recipientEmail);
      setDeliveryEmailError(""); setStep("send");
    } finally { inFlight.current = false; setPending(false); }
  }

  function backStep() {
    if (pending || inFlight.current) return;
    setReviewBinding(null); setRevisionValue(null); setError(""); setNotice(""); setSharingDialogError(undefined);
    setStep(step === "send" ? "review" : "details");
  }

  async function sendReviewed(mode: "send" | "publish") {
    if (!record || !sharing?.canSend || !reviewBinding || dirty || conflict || !bindingCurrent) return;
    if (mode === "send") {
      const parsed = estimateEmailDestinationSchema.safeParse({
        recipientEmail: deliveryEmail.trim(), subject: sharing.subject,
      });
      if (!parsed.success) {
        setDeliveryEmailError(c.invalidDeliveryEmail); setError(c.invalidDeliveryEmail); return;
      }
    }
    setDeliveryEmailError(""); setError("");
    const reviewed = {
      estimateId: record.id, expectedVersion: reviewBinding.version, snapshotHash: reviewBinding.hash,
      ...(revisionConfirmation?.confirmation ? { revisionReview: revisionConfirmation.confirmation } : {}),
    };
    await confirmSharing(mode === "send"
      ? { ...reviewed, mode: "send", recipientEmail: deliveryEmail.trim(), subject: sharing.subject }
      : { ...reviewed, mode: "publish" });
  }

  async function duplicate() {
    if (!record || inFlight.current || pending || dirty || !seed.capabilities.create) return;
    setError("");
    setNotice("");
    inFlight.current = true;
    setPending(true);
    const payload = {
      workspaceId,
      estimateId: record.id,
      expectedVersion: record.version,
    };
    try {
      const result = await request<EstimateDraftSaveResult>(
        `/api/estimates/${encodeURIComponent(record.id)}/duplicate${query}`,
        {
          method: "POST",
          body: JSON.stringify({ ...payload, submissionId: submissionId(payload) }),
        },
        c.duplicateError,
      );
      router.push(`/estimates/${encodeURIComponent(result.id)}${query}`);
    } catch (caught) {
      setError(messageOf(caught, c.duplicateError));
      if (statusOf(caught) === 409 || codeOf(caught) === "conflict") setConflict(true);
      if (statusOf(caught) === 401) router.replace("/login");
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  async function revise() {
    if (!record || pending || inFlight.current || dirty || conflict) return;
    if (!revisionFamily?.canRevise || revisionFamily.currentEstimateId !== record.id ||
        revisionFamily.version !== record.version || !revisionFamily.snapshotHash) {
      setError(c.reviseUnavailable); return;
    }
    setError(""); setNotice("");
    inFlight.current = true;
    setPending(true);
    const payload = {
      workspaceId, estimateId: record.id, expectedVersion: revisionFamily.version, snapshotHash: revisionFamily.snapshotHash,
    };
    try {
      const result = await request<EstimateDraftSaveResult>(
        `/api/estimates/${encodeURIComponent(record.id)}/revise${query}`,
        { method: "POST", body: JSON.stringify({ ...payload, submissionId: submissionId({ operation: "revise", ...payload }) }) },
        c.reviseError,
      );
      router.push(`/estimates/${encodeURIComponent(result.id)}${query}`);
    } catch (caught) {
      setError(messageOf(caught, c.reviseError));
      if (statusOf(caught) === 409) setConflict(true);
      if (statusOf(caught) === 401) router.replace("/login");
      if (statusOf(caught) === 401 || statusOf(caught) === 404) {
        setRevisionFamily(null); setSharingReadable(false);
      }
    } finally {
      inFlight.current = false; setPending(false);
    }
  }

  async function confirmDelete(requestValue: EstimateDeleteDraftValues) {
    if (!record || inFlight.current || pending) return;
    setError("");
    setDeleteError(undefined);
    inFlight.current = true;
    setPending(true);
    try {
      await request<{ deleted: true; id: string }>(
        `/api/estimates/${encodeURIComponent(record.id)}${query}`,
        { method: "DELETE", body: JSON.stringify({ workspaceId, ...requestValue }) },
        c.deleteError,
      );
      router.replace(`/estimates${query}`);
    } catch (caught) {
      setDeleteError({
        kind: statusOf(caught) === 409 || codeOf(caught) === "conflict" ? "conflict" : "error",
        message: messageOf(caught, c.deleteError),
      });
      if (statusOf(caught) === 401) router.replace("/login");
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  async function openSharing(mode: "send" | "publish" | "resend") {
    if (!record || dirty || pending || inFlight.current || conflict) return;
    setSharingMode(mode);
    setSharing(null);
    setSharingError("");
    setShareReceipt(null);
    setSharingDialogError(undefined);
    setCopyState("idle");
    const review = await loadSharing();
    if (mode === "resend" && review) {
      setResendEmail(review.delivery.email.state === "not-sent"
        ? review.estimate.values.details.recipientEmail
        : review.delivery.email.recipientEmail);
    }
  }

  async function confirmSharing(input: EstimateSendRequest | (EstimatePublishRequest & { mode: "publish" })) {
    if (!record || dirty || pending || inFlight.current || conflict) return;
    inFlight.current = true;
    setPending(true);
    setSharingDialogError(undefined);
    const payload = { ...input, workspaceId };
    const sourceSubmissionId = submissionId(payload);
    try {
      const receipt = await request<EstimateShareReceipt>(
        `/api/estimates/${encodeURIComponent(record.id)}/sharing${query}`,
        { method: "POST", body: JSON.stringify({ ...payload, submissionId: sourceSubmissionId }) },
        c.shareError,
      );
      if (receipt.estimateId !== input.estimateId || receipt.snapshotHash !== input.snapshotHash ||
          receipt.version !== input.expectedVersion + 1 || receipt.status !== (input.mode === "publish" ? "published" : "sent")) {
        throw new EstimateRequestError(c.shareMismatch, 502);
      }
      setShareReceipt(receipt);
      setSharingError("");
      setRecord({ ...record, status: receipt.status, version: receipt.version, sharing: "shared" });
      setLeadSuggestion(input.mode === "send" && record.parent.type === "lead"
        ? { sourceSubmissionId, expectedEstimateVersion: receipt.version } : null);
      setNotice(input.mode === "publish" ? c.published : "");
      submission.current = null;
      if (input.mode !== "publish") setSharingMode(null);
    } catch (caught) {
      setSharingDialogError({
        kind: statusOf(caught) === 409 ? "conflict" : "error",
        message: messageOf(caught, c.shareError),
      });
      if (statusOf(caught) === 409) setConflict(true);
      if (statusOf(caught) === 401 || statusOf(caught) === 404) {
        setSharing(null);
        setSharingReadable(false);
      }
      if (statusOf(caught) === 401) router.replace("/login");
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  async function copyLink() {
    if (!record || pending || inFlight.current || dirty) return;
    inFlight.current = true;
    setCopyState("pending");
    setCopyError("");
    try {
      const result = await request<{ path: string }>(
        `/api/estimates/${encodeURIComponent(record.id)}/sharing/link${query}`, {}, c.copyError,
      );
      if (!/^\/e\/[A-Za-z0-9_-]{43}$/.test(result.path)) throw new Error(c.copyError);
      await navigator.clipboard.writeText(new URL(result.path, window.location.origin).href);
      setCopyState("copied");
    } catch (caught) {
      setCopyState("error");
      setCopyError(c.copyError);
      if (statusOf(caught) === 401) router.replace("/login");
    } finally {
      inFlight.current = false;
    }
  }

  function reload() {
    window.location.reload();
  }

  const deleteRecord: EstimateDeleteDraftRecord | null = record
    ? {
        id: record.id,
        number: record.number,
        revision: record.revision,
        version: record.version,
        name: values.details.name,
        status: record.status,
        archived: record.archived,
        recipientName: values.details.recipientName,
        sharing: record.sharing,
      }
    : null;
  const deleteCapabilities: EstimateCapabilities = {
    read: seed.capabilities.read && sharingReadable,
    create: seed.capabilities.create,
    update: routeSeed.capabilities.update,
    send: sharing?.canSend ?? false,
    decide: false,
    void: seed.capabilities.void,
    archive: seed.capabilities.archive,
    delete: routeSeed.capabilities.delete,
    export: false,
  };
  const currentSharing = sharing?.estimate.version === record?.version ? sharing : null;
  const paperSource: EstimatePaperSource | null = currentSharing?.paper ?? currentSharing?.draftPaper ??
    (currentSharing?.draft ? { state: "draft", content: currentSharing.draft } : null);
  const sharingPreview: EstimateSharingPreview = paperSource && currentSharing?.snapshotHash && record
    ? {
      state: "ready", estimateId: record.id, version: record.version, snapshotHash: currentSharing.snapshotHash,
      content: <EstimatePreviewPaper source={paperSource} showPrintControl={false} />,
    }
    : sharingError ? { state: "error", message: sharingError } : { state: "loading" };
  const sharingReadiness: EstimateSharingReadiness = !currentSharing
    ? { state: "blocked", issues: [sharingError || c.sharingLoading] }
    : currentSharing.issues.length ? { state: "blocked", issues: currentSharing.issues } : { state: "ready" };
  const sharingRecord = record ? {
    id: record.id, number: record.number, revision: record.revision, version: record.version,
    status: record.status, archived: record.archived, name: record.values.details.name,
    recipientName: currentSharing?.paper?.content.recipientName ?? record.values.details.recipientName,
    recipientEmail: currentSharing?.paper?.content.recipientEmail ?? record.values.details.recipientEmail,
    totalCents: currentSharing?.paper?.amounts.totalCents ?? calculateEstimateTotals({
      items: record.values.items, ...record.values.totals, deposit: record.values.terms.deposit,
    }).totalCents,
    validUntil: currentSharing?.paper?.content.validUntil ?? record.values.terms.validUntil,
  } : null;
  const link = currentSharing?.delivery.link ?? { state: "unavailable" as const, expiresAt: null, firstViewedAt: null };
  const creationActive = !record || (record.status === "draft" && !record.archived);
  const reviewReady = !!currentSharing?.draftPaper && !currentSharing.issues.length && !!currentSharing.snapshotHash;
  const paperBindingCurrent = reviewReady && reviewBinding?.version === record?.version &&
    reviewBinding?.hash === currentSharing?.snapshotHash;
  const reviewedContent = currentSharing?.draftPaper?.content;
  const revisionInput = sharingRecord && currentSharing?.revision ? {
    estimate: sharingRecord, preview: sharingPreview, revision: currentSharing.revision,
    paymentLink: reviewedContent?.paymentLink ?? "", canRead: deleteCapabilities.read,
    canSend: !!currentSharing.canSend, value: revisionValue,
  } : null;
  const revisionConfirmation = revisionInput ? reviewEstimateRevisionSharing(revisionInput) : null;
  const revisionReady = revisionConfirmation === null || revisionConfirmation.confirmation !== null;
  const sourceBindingCurrent = reviewBinding?.sourceId === currentSharing?.revision?.sourceEstimateId &&
    reviewBinding?.sourceVersion === currentSharing?.revision?.sourceVersion;
  const bindingCurrent = paperBindingCurrent && sourceBindingCurrent && revisionReady;
  const canRevise = !!record && !dirty && !conflict && sharingReadable &&
    revisionFamily?.currentEstimateId === record.id && revisionFamily.version === record.version && revisionFamily.canRevise;

  return (
    <>
      <EstimateEditorForm
        seed={routeSeed}
        values={creationActive ? values : { ...values, paymentLink: currentSharing?.paper?.content.paymentLink ?? "" }}
        dirty={dirty}
        pending={pending || voidOpen || decisionMode !== null || archiveMode !== null || leadStageOpen || conversionOpen}
        showErrors={showErrors}
        notice={notice || (currentSharing?.delivery.email.state === "queued" ? c.queued : "")}
        error={error || (creationActive ? sharingDialogError?.message || sharingError : "")}
        conflict={conflict}
        catalog={catalog}
        onChange={(next) => {
          setValues(next);
          setNotice("");
          setError("");
          setReviewBinding(null);
          setRevisionValue(null);
        }}
        onSave={() => void save()}
        creation={creationActive ? {
          step,
          onContinue: () => { void (step === "details" ? continueDetails() : confirmReview()); },
          onBack: backStep,
          continueDisabled: conflict || (step === "details"
            ? !(record ? routeSeed.capabilities.update : seed.capabilities.create)
            : dirty || !reviewReady || !revisionReady),
          sendDisabled: !bindingCurrent || conflict || !currentSharing?.canSend,
          publishDisabled: !bindingCurrent || conflict || !currentSharing?.canSend,
          onSend: currentSharing?.canSend ? () => { void sendReviewed("send"); } : undefined,
          onPublish: currentSharing?.canSend ? () => { void sendReviewed("publish"); } : undefined,
          review: <div className="grid min-w-0 gap-4">
            {revisionInput && <EstimateRevisionReview {...revisionInput} pending={pending || conflict} onChange={setRevisionValue} />}
            {record && currentSharing?.draftPaper && <div className="mx-auto w-full max-w-letter print:hidden">
              <a href={`/estimates/${encodeURIComponent(record.id)}/preview${query}`}
                target="_blank" rel="noopener noreferrer" className={estimateButton}>{c.printPreview}</a>
            </div>}
            {currentSharing?.issues.map(issue => <FormFeedback key={issue} kind="error" message={issue} />)}
            {currentSharing?.draftPaper
              ? <EstimatePreviewPaper source={currentSharing.draftPaper} showPrintControl={false} />
              : <p role="status" className="m-0">{c.sharingLoading}</p>}
          </div>,
          send: <div className="grid min-w-0 items-start gap-6 lg:grid-cols-2">
            <section aria-label={c.deliveryEmail} className={`${estimatePanel} grid min-w-0 gap-5`}>
              <TextField name="deliveryEmail" type="email" label={c.deliveryEmail} required
                value={deliveryEmail} disabled={pending} error={!!deliveryEmailError}
                helperText={deliveryEmailError || c.deliveryEmailHint}
                onChange={event => { setDeliveryEmail(event.target.value); setDeliveryEmailError(""); setError(""); }}
                slotProps={{ input: { className: "has-focus-visible:focus-ring" }, htmlInput: { maxLength: 254 } }} />
              <TextField name="subject" label={c.subject} value={currentSharing?.subject ?? ""}
                helperText={c.subjectHint} slotProps={{ input: { readOnly: true } }} />
              <p className="m-0 text-sm leading-6 text-muted">{c.sendHint}</p>
              {!currentSharing?.canSend && <FormFeedback kind="error" message={c.noSendPermission} />}
            </section>
            <div className="grid min-w-0 gap-4">
              <section aria-label={c.sendSummary} className={`${estimatePanel} grid min-w-0 gap-4`}>
                <h3 className="m-0 text-lg font-semibold">{c.sendSummary}</h3>
                {currentSharing?.revision && <p className="m-0 text-sm leading-6 wrap-anywhere">
                  {revisionCopy.replacement(currentSharing.estimate.number, currentSharing.revision.sourceRevision, currentSharing.estimate.revision)}
                </p>}
                <p className="m-0 wrap-anywhere">{reviewedContent?.name}</p>
                <dl className="m-0 grid gap-3 text-sm">
                  <div><dt className="text-muted">{c.client}</dt><dd className="m-0 font-semibold">{reviewedContent?.recipientName}</dd></div>
                  <div><dt className="text-muted">{c.total}</dt><dd className="m-0 font-semibold">
                    <MoneyText cents={currentSharing?.draftPaper?.amounts.totalCents ?? null} /></dd></div>
                  <div><dt className="text-muted">{c.validUntil}</dt><dd className="m-0">{reviewedContent?.validUntil}</dd></div>
                </dl>
              </section>
            </div>
          </div>,
        } : undefined}
        onPreview={() => {
          if (!record || dirty || record.archived) return;
          router.push(`/estimates/${encodeURIComponent(record.id)}/preview${query}`);
        }}
        onNavigate={(href) => router.push(href)}
        onReload={reload}
        statusPanel={record && <div className="grid min-w-0 gap-3 print:hidden">
          <EstimateStatusPanel status={record.status} archived={record.archived}
            parentType={record.parent.type} convertedJob={decisionReview?.convertedJob ?? undefined}
            parentJob={record.parent.type === "job" ? { number: record.parent.number, href: record.parent.href } : undefined}
            decision={decisionReview?.estimate.decision}
            canConvertToJob={!conflict && !dirty && decisionReview?.estimate.version === record.version &&
              decisionReadable && !!decisionReview.canConvertToJob}
            canCorrectDecision={decisionReview?.estimate.version === record.version && !!decisionReview?.canCorrectDecision}
            capabilities={{
              ...deleteCapabilities, read: deleteCapabilities.read && decisionReadable, update: !!canRevise,
              decide: decisionReview?.estimate.version === record.version && decisionReadable && !!decisionReview?.canDecide,
            }}
            pending={pending || conflict || decisionMode !== null || archiveMode !== null || leadStageOpen || conversionOpen} error={decisionError}
            onAction={action => {
              if (action === "revise") { void revise(); return; }
              if (action === "convert") {
                if (!pending && !conflict && !dirty && decisionReview?.estimate.version === record.version &&
                  decisionReadable && decisionReview.canConvertToJob) setConversionOpen(true);
                return;
              }
              if (!decisionReview) return;
              if (action === "mark-accepted" || action === "mark-declined") {
                setDecisionOutcome(action === "mark-accepted" ? "accepted" : "declined"); setDecisionMode("record");
              } else if (action === "correct-decision") {
                setDecisionOutcome(decisionReview.estimate.decision?.outcome ?? "accepted"); setDecisionMode("correct");
              }
            }} />
          {decisionError && decisionReadable && <button type="button" className={estimateButton} disabled={pending}
            onClick={() => { void loadDecision(); }}>{decisionCopy.live.retry}</button>}
          {leadSuggestion && leadSuggestion.expectedEstimateVersion === record.version && record.parent.type === "lead" &&
            <EstimateLeadStageConnected key={`${record.id}:${leadSuggestion.sourceSubmissionId}`}
              binding={{ workspaceId, estimateId: record.id, ...leadSuggestion }} estimate={record}
              canRead={sharingReadable && decisionReadable} open={leadStageOpen} onOpenChange={setLeadStageOpen}
              pending={pending || conflict || voidOpen || decisionMode !== null || archiveMode !== null}
              onDismiss={() => { setLeadSuggestion(null); setLeadStageOpen(false); }}
              onMoved={() => { setLeadSuggestion(null); setLeadStageOpen(false); setNotice(leadStageCopy.live.moved); }} />}
        </div>}
        history={record && <EstimateHistoryConnected key={`history:${record.id}`} workspaceId={workspaceId} estimateId={record.id}
          timezone={seed.timezone} refreshKey={`${record.version}:${conversionRefresh}:${currentSharing?.delivery.email.state ?? ""}:${currentSharing?.delivery.link.firstViewedAt ?? ""}`} />}
        revisions={record && <EstimateRevisionsConnected key={`revisions:${record.id}`} workspaceId={workspaceId} estimateId={record.id}
          number={record.number} version={record.version} canRead={sharingReadable && decisionReadable}
          refreshOnFocus={!pending && !dirty && !sharingMode && !voidOpen && !decisionMode && !archiveMode && !leadStageOpen}
          onReview={setRevisionFamily} />}
        onRevise={canRevise ? () => { void revise(); } : undefined}
        onVoid={() => setVoidOpen(true)}
        onArchive={sharingReadable && decisionReadable ? () => setArchiveMode("archive") : undefined}
        onRestore={sharingReadable && decisionReadable ? () => setArchiveMode("restore") : undefined}
        onSend={currentSharing?.canSend ? () => { void openSharing("send"); } : undefined}
        onPublish={currentSharing?.canSend ? () => { void openSharing("publish"); } : undefined}
        delivery={record && <EstimateDeliveryCard
          status={record.status} archived={record.archived} capabilities={deleteCapabilities}
          timezone={seed.timezone} delivery={currentSharing?.delivery ?? null}
          state={sharingError ? "error" : currentSharing ? "ready" : "loading"}
          error={sharingError} pending={pending || dirty || conflict}
          copyState={copyState} copyError={copyError} onCopyLink={() => { void copyLink(); }}
          onReviewResend={() => { void openSharing("resend"); }}
          onRetry={() => { setSharing(null); setSharingError(""); void loadSharing(); }}
        />}
        onDuplicate={() => void duplicate()}
        onDelete={() => {
          if (!deleteRecord) return;
          setDeleteValue(initialEstimateDeleteDraftValues(deleteRecord));
          setDeleteError(undefined);
        }}
      />
      {archiveMode && sharingRecord && <EstimateArchiveReview workspaceId={workspaceId} estimate={sharingRecord}
        mode={archiveMode} onClose={() => setArchiveMode(null)} onArchived={receipt => {
          setArchiveMode(null);
          setRecord(current => current && ({ ...current, archived: receipt.archived, version: receipt.version, updatedAt: receipt.updatedAt }));
          setSharing(null);
          setDecisionReview(null);
          setCopyState("idle");
          setNotice(receipt.archived ? archiveCopy.live.archived : archiveCopy.live.restored);
        }} />}
      {decisionMode && decisionReview && <EstimateDecisionReview workspaceId={workspaceId} review={decisionReview}
        mode={decisionMode} outcome={decisionOutcome} onClose={() => setDecisionMode(null)}
        onRecorded={(receipt, suggestionSource) => {
          setDecisionMode(null);
          setRecord(current => current && ({ ...current, status: receipt.status, version: receipt.version, updatedAt: receipt.updatedAt }));
          setDecisionReview(null);
          setSharing(null);
          setCopyState("idle");
          setLeadSuggestion(suggestionSource && record?.parent.type === "lead"
            ? { sourceSubmissionId: suggestionSource, expectedEstimateVersion: receipt.version } : null);
          setNotice(decisionMode === "correct" ? decisionCopy.live.corrected : decisionCopy.live.recorded);
        }} />}
      {conversionOpen && record && decisionReview && <EstimateConvertConnected
        workspaceId={workspaceId}
        estimateId={record.id}
        expectedVersion={record.version}
        expectedSnapshotHash={decisionReview.snapshotHash}
        open={conversionOpen}
        onClose={closeConversion}
        onConverted={conversionSucceeded}
        onAccessLost={conversionAccessLost}
      />}
      {voidOpen && sharingRecord && <EstimateVoidReview workspaceId={workspaceId} estimate={sharingRecord}
        onClose={() => setVoidOpen(false)} onVoided={receipt => {
          setVoidOpen(false);
          setRecord(current => current && ({ ...current, status: receipt.status, version: receipt.version, updatedAt: receipt.updatedAt }));
          setSharing(null);
          setCopyState("idle");
          setNotice(estimateLifecycleData.voided);
        }} />}
      {deleteRecord && deleteValue && (
        <EstimateDeleteDraftDialog
          open
          estimate={deleteRecord}
          capabilities={deleteCapabilities}
          value={deleteValue}
          pending={pending}
          error={deleteError}
          onChange={setDeleteValue}
          onConfirm={confirmDelete}
          onReload={reload}
          onClose={() => setDeleteValue(null)}
        />
      )}
      {sharingRecord && (sharingMode === "send" || sharingMode === "resend") && <EstimateSendDialog
        open estimate={sharingRecord} capabilities={deleteCapabilities}
        today={currentSharing?.today ?? seed.today} subject={currentSharing?.subject ?? ""}
        readiness={sharingReadiness} preview={sharingPreview} pending={pending}
        revision={currentSharing?.revision} paymentLink={reviewedContent?.paymentLink}
        error={sharingDialogError} onConfirm={confirmSharing} onReload={reload}
        onClose={() => setSharingMode(null)}
        {...(sharingMode === "resend" ? {
          mode: "resend" as const, delivery: currentSharing?.delivery,
          recipientEmail: resendEmail, onRecipientEmailChange: setResendEmail,
        } : { mode: "send" as const })}
      />}
      {sharingRecord && sharingMode === "publish" && <EstimatePublishDialog
        open estimate={sharingRecord} capabilities={deleteCapabilities} pending={pending}
        onClose={() => setSharingMode(null)}
        view={shareReceipt?.status === "published" ? {
          state: "published", receipt: shareReceipt, link, copyState, copyError,
          onCopyLink: () => { void copyLink(); },
        } : {
          state: "review", today: currentSharing?.today ?? seed.today,
          readiness: sharingReadiness, preview: sharingPreview, error: sharingDialogError,
          revision: currentSharing?.revision, paymentLink: reviewedContent?.paymentLink,
          onConfirm: input => confirmSharing({ ...input, mode: "publish" }), onReload: reload,
        }}
      />}
    </>
  );
}
