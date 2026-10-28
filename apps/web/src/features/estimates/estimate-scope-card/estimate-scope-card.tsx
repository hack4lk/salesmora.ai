"use client";

import { useId } from "react";
import MuiTextField from "@mui/material/TextField";
import { fieldClasses } from "@salesmora/ui";
import type { EstimateStatus } from "../estimate-preview.types";
import { estimatePanel } from "../estimate-ui";
import { estimateScopeCardData as c } from "./estimate-scope-card.data";

export type EstimateScopeCardProps = {
  value: string;
  status?: EstimateStatus;
  canEdit?: boolean;
  pending?: boolean;
  error?: string;
  onChange?: (value: string) => void;
};

export function EstimateScopeCard({
  value, status = "draft", canEdit = false, pending = false, error, onChange,
}: EstimateScopeCardProps) {
  const id = useId();
  const editable = status === "draft" && canEdit && !!onChange;

  return (
    <section aria-labelledby={`${id}-title`} aria-busy={pending} className={`${estimatePanel} grid gap-5`}>
      <h2 id={`${id}-title`} className="m-0 text-lg font-semibold">{c.title}</h2>
      <p className="m-0 text-sm leading-6 text-muted">{c.description}</p>
      {editable ? <MuiTextField
        id={`${id}-scope`} name="scope" label={c.optionalLabel} value={value}
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
