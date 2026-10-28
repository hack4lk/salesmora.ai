"use client";

import { useId } from "react";
import { FormFeedback } from "@salesmora/ui";
import { moveStageDialogData } from "../../leads/move-stage-dialog/move-stage-dialog.data";
import { getEstimateLeadStageTarget, type EstimateLeadStageContext, type EstimateLeadStageTarget } from "../estimate-lead-suggestions";
import { estimateButton, estimatePanel, estimatePrimary } from "../estimate-ui";
import { estimateLeadStageSuggestionData as c } from "./estimate-lead-stage-suggestion.data";

export type EstimateLeadStageSuggestionProps = EstimateLeadStageContext & {
  estimate: { number: string; revision: number };
  lead?: EstimateLeadStageContext["lead"] & { number: string };
  state?: "ready" | "loading" | "error" | "unavailable";
  pending?: boolean;
  error?: string;
  onReview?: (target: EstimateLeadStageTarget) => void;
  onDismiss?: () => void;
  onReload?: () => void;
};

export function EstimateLeadStageSuggestion({
  estimate, event, parentType, status, lead, archived = false, canRead = false,
  state = "ready", pending = false, error, onReview, onDismiss, onReload,
}: EstimateLeadStageSuggestionProps) {
  const id = useId();
  const unavailable = !canRead || state === "unavailable";
  const target = getEstimateLeadStageTarget({ event, parentType, status, lead, archived, canRead });
  return <section aria-labelledby={`${id}-title`} aria-busy={!unavailable && (pending || state === "loading")}
    className={`${estimatePanel} grid gap-4 print:hidden`}>
    <h2 id={`${id}-title`} className="m-0 text-lg font-semibold">{c.title}</h2>
    {unavailable ? <p role="status" className="m-0 text-sm leading-6 text-muted">{c.unavailable}</p>
      : state === "loading" ? <p role="status" className="m-0 text-sm leading-6 text-muted">{c.loading}</p>
      : state === "error" ? <div className="grid justify-items-start gap-3">
        <FormFeedback kind="error" message={error || c.error} />
        {onReload && <button type="button" className={estimateButton} disabled={pending}
          onClick={() => { if (!pending) onReload(); }}>{c.retry}</button>}
      </div>
      : !target || !lead ? <p role="status" className="m-0 text-sm leading-6 text-muted">
        {parentType === "lead" && lead
          ? archived || lead.archived ? c.archived : !lead.canMove ? c.forbidden : c.noSuggestion
          : c.noSuggestion}
      </p> : <>
        <p className="m-0 text-sm text-muted wrap-anywhere">{c.estimate(estimate.number, estimate.revision)}</p>
        <dl className="m-0 grid min-w-0 gap-3 rounded-xl bg-canvas p-4 text-sm">
          <div className="grid min-w-0 gap-1">
            <dt className="font-semibold text-muted">{c.lead}</dt>
            <dd className="m-0 wrap-anywhere">{lead.number} · {lead.name}</dd>
          </div>
          <div className="grid gap-1">
            <dt className="font-semibold text-muted">{c.currentStage}</dt>
            <dd className="m-0">{moveStageDialogData.stages.find(stage => stage.value === lead.stage)?.label}</dd>
          </div>
        </dl>
        <p className="m-0 text-sm leading-6 text-muted">{c.descriptions[target]}</p>
        <p id={`${id}-effects`} className="m-0 text-sm leading-6 text-muted">{c.effects}</p>
        <div className="grid min-w-0 gap-3" aria-describedby={`${id}-effects`}>
          {onReview ? <button type="button" className={estimatePrimary} disabled={pending}
            onClick={() => { if (!pending) onReview(target); }}>{c.review[target]}</button>
            : <p className="m-0 text-sm leading-6 text-muted">{c.notConnected}</p>}
          {onDismiss && <button type="button" className={estimateButton} disabled={pending}
            onClick={() => { if (!pending) onDismiss(); }}>{c.dismiss[target]}</button>}
        </div>
      </>}
  </section>;
}
