"use client";

import { useId, useRef, useState } from "react";
import MuiTextField from "@mui/material/TextField";
import {
  fieldClasses,
  FormFeedback,
  HelpTooltip,
  SeafoamButton,
} from "@salesmora/ui";
import { reportDateControlsData as copy } from "./report-date-controls.data";
import {
  defaultReportPreset,
  formatReportDate,
  resolveReportPeriod,
  validReportTimezone,
  type ReportDateContext,
  type ReportPeriodSelection,
} from "./report-date-controls.validation";

export type ReportDateControlsProps = {
  value: ReportPeriodSelection;
  context: ReportDateContext;
  /** Workspace-local date supplied by the host, never inferred from the browser clock. */
  today: string;
  timezone: string;
  pending?: boolean;
  onApply: (selection: ReportPeriodSelection) => void;
};
const button =
  "min-h-11 cursor-pointer rounded-xl border px-4 py-2 text-sm font-semibold focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50";

/** Edits a period only. The host owns authorized queries, timezone boundaries and apply failures. */
export function ReportDateControls({
  value,
  context,
  today,
  timezone,
  pending = false,
  onApply,
}: ReportDateControlsProps) {
  const id = useId(),
    fromRef = useRef<HTMLInputElement>(null),
    toRef = useRef<HTMLInputElement>(null);
  const source = JSON.stringify([
    value.preset,
    value.preset === "custom" ? [value.from, value.to] : null,
    context,
    today,
    timezone,
  ]);
  const [edit, setEdit] = useState<{
    source: string;
    value: ReportPeriodSelection;
    submitted: boolean;
  } | null>(null);
  const draft = edit?.source === source ? edit.value : value;
  const submitted = edit?.source === source && edit.submitted;
  const applied = resolveReportPeriod(value, today, context);
  const result = resolveReportPeriod(draft, today, context);
  const changed =
    draft.preset !== value.preset ||
    (draft.preset === "custom" &&
      value.preset === "custom" &&
      (draft.from !== value.from || draft.to !== value.to));
  const error = submitted ? result.error : undefined;
  const change = (next: ReportPeriodSelection) => {
    if (!pending) setEdit({ source, value: next, submitted: false });
  };

  if (!validReportTimezone(timezone))
    return <FormFeedback kind="error" message={copy.errors.context} />;
  if (applied.error)
    return <FormFeedback kind="error" message={copy.errors[applied.error]} />;
  const range = applied.range;
  return (
    <section
      aria-labelledby={`${id}-title`}
      aria-busy={pending}
      className="grid w-full min-w-0 max-w-2xl gap-5 rounded-2xl border border-line bg-paper p-4 text-ink sm:p-6"
    >
      <header className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 items-center gap-1">
          <h2 id={`${id}-title`} className="m-0 text-xl font-semibold">
            {copy.title}
          </h2>
          <HelpTooltip
            label={copy.periodHelp}
            paragraphs={[copy.count(range.count)]}
          />
        </div>
        <p className="m-0 min-w-0 text-xs text-muted wrap-anywhere">
          <span className="sr-only">{copy.timezone}: </span>
          {timezone}
        </p>
      </header>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (pending) return;
          if (result.error) {
            setEdit({ source, value: draft, submitted: true });
            (draft.preset === "custom" &&
            draft.from &&
            (!draft.to || result.error === "order")
              ? toRef
              : fromRef
            ).current?.focus();
            return;
          }
          onApply(draft);
        }}
        className="grid min-w-0 gap-4"
      >
        <div className="grid min-w-0 gap-5">
          <MuiTextField
            select
            label={copy.range}
            value={draft.preset}
            disabled={pending}
            fullWidth
            size="small"
            className={fieldClasses}
            slotProps={{
              select: { native: true },
              inputLabel: { shrink: true },
              htmlInput: {
                className: "box-border min-h-11",
                "aria-describedby":
                  draft.preset === "custom" ? `${id}-help` : undefined,
              },
            }}
            onChange={(event) => {
              if (event.target.value === "custom")
                change({ preset: "custom", from: range.from, to: range.to });
              else change({ preset: defaultReportPreset(context) });
            }}
          >
            <option value={defaultReportPreset(context)}>
              {copy.presets[context]}
            </option>
            <option value="custom">{copy.custom}</option>
          </MuiTextField>
          {draft.preset === "custom" && (
            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
              {(["from", "to"] as const).map((key) => (
                <MuiTextField
                  key={key}
                  type="date"
                  label={copy[key]}
                  value={draft[key]}
                  required
                  disabled={pending}
                  inputRef={key === "from" ? fromRef : toRef}
                  fullWidth
                  size="small"
                  className={fieldClasses}
                  error={!!error}
                  slotProps={{
                    inputLabel: { shrink: true },
                    htmlInput: {
                      className: "box-border min-h-11",
                      min: "0001-01-01",
                      max: "9999-12-31",
                      "aria-describedby": `${id}-help${error ? ` ${id}-error` : ""}`,
                    },
                  }}
                  onChange={(event) =>
                    change({ ...draft, [key]: event.target.value })
                  }
                />
              ))}
            </div>
          )}
        </div>
        {draft.preset === "custom" && (
          <p id={`${id}-help`} className="m-0 text-xs leading-5 text-muted">
            {copy.help}
          </p>
        )}
        {error && (
          <div id={`${id}-error`}>
            <FormFeedback
              kind="error"
              title={copy.errorTitle}
              message={copy.errors[error]}
            />
          </div>
        )}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="grid min-w-0 flex-1 gap-1"
        >
          <p className="m-0 text-sm wrap-anywhere">
            <span className="text-muted">{copy.applied}: </span>
            <strong className="font-semibold">
              {formatReportDate(range.from)} to {formatReportDate(range.to)}
            </strong>
          </p>
          {pending ? (
            <p className="mb-0 mt-1 text-sm text-muted">{copy.pending}</p>
          ) : (
            changed && (
              <p className="mb-0 mt-1 text-sm text-muted">{copy.changed}</p>
            )
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
          <SeafoamButton
            size={14}
            type="submit"
            disabled={pending}
            label={copy.apply}
          />
          <button
            type="button"
            disabled={pending || !changed}
            className={`${button} border-line bg-paper text-primary hover:bg-canvas`}
            onClick={() => setEdit(null)}
          >
            {copy.cancel}
          </button>
        </div>
      </form>
    </section>
  );
}
