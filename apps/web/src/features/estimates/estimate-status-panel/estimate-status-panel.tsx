"use client";

import { useId } from "react";
import Link from "next/link";
import type { EstimateRecordedDecision } from "@salesmora/contracts";
import { getEstimateStatusActions, type EstimateStatusAction, type EstimateStatusActionContext } from "../estimate-actions";
import { EstimateStatusBadge } from "../estimate-status-badge/estimate-status-badge";
import { estimateButton, estimatePanel, estimatePrimary } from "../estimate-ui";
import { estimateStatusPanelData as c } from "./estimate-status-panel.data";
import { estimateDate } from "../estimate-ui";
import { estimateDecisionDialogData as decisionCopy } from "../estimate-decision-dialog/estimate-decision-dialog.data";

export type EstimateStatusPanelProps = Omit<EstimateStatusActionContext, "hasConvertedJob"> & {
  /** Host supplies only an authorized job reference/URL; this is not the estimate's parent job. */
  convertedJob?: { number: string; href?: string };
  /** Authorized reference to the existing parent job, distinct from a converted job. */
  parentJob?: { number: string; href?: string };
  decision?: EstimateRecordedDecision | null;
  pending?: boolean;
  error?: string;
  onAction?: (action: EstimateStatusAction) => void;
};

export function EstimateStatusPanel({
  status, archived = false, capabilities, canCorrectDecision = false, canConvertToJob = false,
  convertedJob, parentJob, parentType, decision, pending = false, error, onAction,
}: EstimateStatusPanelProps) {
  const id = useId();
  if (!capabilities.read) return (
    <section aria-labelledby={`${id}-title`} className={`${estimatePanel} grid gap-5`}>
      <h2 id={`${id}-title`} className="m-0 text-lg font-semibold">{c.title}</h2>
      <p role="status" className="m-0 text-sm leading-6 text-muted">{c.unavailable}</p>
    </section>
  );
  const actions = getEstimateStatusActions({
    status, archived, capabilities, canCorrectDecision, canConvertToJob, parentType, hasConvertedJob: !!convertedJob,
  });
  return (
    <section aria-labelledby={`${id}-title`} aria-busy={pending} className={`${estimatePanel} grid gap-5 print:hidden`}>
      <h2 id={`${id}-title`} className="m-0 text-lg font-semibold">{c.title}</h2>
      <EstimateStatusBadge status={status} archived={archived} />
      <p className="m-0 text-sm leading-6 text-muted">{c.descriptions[status]}</p>
      {decision && <section aria-labelledby={`${id}-decision`} className="grid min-w-0 gap-2">
        <h3 id={`${id}-decision`} className="m-0 text-base font-semibold">{decisionCopy.current}</h3>
        <p className="m-0 text-sm leading-6">{decisionCopy.outcomes[decision.outcome]} · {estimateDate(`${decision.decisionDate}T00:00:00Z`)} · {decisionCopy.channels[decision.channel]}</p>
        {decision.note && <p className="m-0 whitespace-pre-wrap text-sm leading-6 wrap-anywhere">{decision.note}</p>}
      </section>}
      {archived && <p className="m-0 text-sm leading-6 text-muted">{c.archived}</p>}
      {convertedJob && <div className="grid min-w-0 gap-2 rounded-xl bg-canvas p-4">
        <dl className="m-0 min-w-0">
          <dt className="text-sm font-semibold text-muted">{c.converted}</dt>
          <dd className="m-0 mt-1 text-sm wrap-anywhere">
            {convertedJob.href ? <Link href={convertedJob.href} className="inline-flex min-h-11 max-w-full items-center rounded-xl font-semibold text-primary wrap-anywhere underline focus-visible:focus-ring">{convertedJob.number}</Link> : convertedJob.number}
          </dd>
        </dl>
        <p className="m-0 text-sm leading-6 text-muted">{c.convertedHint}</p>
        <p className="m-0 text-sm leading-6 text-muted">{decisionCopy.jobUnchanged}</p>
      </div>}
      {status === "accepted" && parentType === "job" && !convertedJob && <div className="grid min-w-0 gap-2 rounded-xl bg-canvas p-4">
        <p className="m-0 text-sm leading-6 text-muted">{c.parentJobHint}</p>
        {parentJob && (parentJob.href
          ? <Link href={parentJob.href} className="inline-flex min-h-11 max-w-full items-center rounded-xl font-semibold text-primary wrap-anywhere underline focus-visible:focus-ring">{c.openParentJob(parentJob.number)}</Link>
          : <p className="m-0 text-sm wrap-anywhere">{parentJob.number}</p>)}
      </div>}
      {error && <p role="alert" className="m-0 text-sm leading-6 text-error wrap-anywhere">{error}</p>}
      {actions.length > 0 && onAction ? <>
        <div role="group" aria-label={c.actionsLabel} aria-describedby={`${id}-review`} className="grid min-w-0 gap-3">
          {actions.map((action) => <button key={action} type="button" disabled={pending}
            className={["send", "mark-accepted", "convert"].includes(action) ? estimatePrimary : estimateButton}
            onClick={() => {
              if (!pending) onAction(action);
            }}>{c.actions[action]}</button>)}
        </div>
        <p id={`${id}-review`} className="m-0 text-sm leading-6 text-muted">{c.reviewHint}</p>
      </> : !archived && <p className="m-0 text-sm leading-6 text-muted">{actions.length ? c.noHandler : c.noActions}</p>}
      {actions.includes("mark-accepted") && <p className="m-0 text-sm leading-6 text-muted">{c.decisionHint}</p>}
      {actions.includes("correct-decision") && <p className="m-0 text-sm leading-6 text-muted">{c.correctionHint}</p>}
      {status === "accepted" && parentType === "lead" && !convertedJob && !archived && <p className="m-0 text-sm leading-6 text-muted">{c.conversionHint}</p>}
    </section>
  );
}
