"use client";

import { useId } from "react";
import MuiTextField from "@mui/material/TextField";
import { fieldClasses } from "@salesmora/ui";
import type { EstimateStatus } from "../estimate-preview.types";
import { estimatePanel } from "../estimate-ui";
import { estimateInternalNotesCardData as c } from "./estimate-internal-notes-card.data";

export type EstimateInternalNotesCardProps = {
  value: string;
  status?: EstimateStatus;
  canEdit?: boolean;
  pending?: boolean;
  error?: string;
  onChange?: (value: string) => void;
};

export function EstimateInternalNotesCard({
  value, status = "draft", canEdit = false, pending = false, error, onChange,
}: EstimateInternalNotesCardProps) {
  const id = useId();
  const editable = status === "draft" && canEdit && !!onChange;

  return (
    <section aria-labelledby={`${id}-title`} aria-describedby={`${id}-privacy`} aria-busy={pending}
      className={`${estimatePanel} grid gap-5 print:hidden`}>
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <h2 id={`${id}-title`} className="m-0 text-lg font-semibold">{c.title}</h2>
        <span className="rounded-xl bg-canvas px-3 py-1 text-sm font-semibold text-muted">{c.badge}</span>
      </div>
      <p id={`${id}-privacy`} className="m-0 text-sm leading-6 text-muted">{c.privacy}</p>
      {editable ? <MuiTextField
        id={`${id}-notes`} name="internalNotes" label={c.optionalLabel} value={value}
        multiline rows={6} fullWidth size="small" disabled={pending} className={fieldClasses}
        error={!!error} helperText={error ?? `${c.hint} ${c.count(value.length)}`}
        slotProps={{ input: { className: "has-focus-visible:focus-ring" }, htmlInput: { maxLength: c.limit } }}
        onChange={(event) => {
          if (editable && !pending) onChange?.(event.target.value);
        }}
      /> : <>
        <p className="m-0 text-sm leading-6 text-muted">{c.readOnly}</p>
        <dl className="m-0 min-w-0">
          <dt className="text-sm font-semibold text-muted">{c.label}</dt>
          <dd className="m-0 mt-1 whitespace-pre-wrap text-sm leading-6 wrap-anywhere">{value.trim() ? value : c.notProvided}</dd>
        </dl>
        {error && <p role="alert" className="m-0 text-sm leading-6 text-error">{error}</p>}
      </>}
    </section>
  );
}
