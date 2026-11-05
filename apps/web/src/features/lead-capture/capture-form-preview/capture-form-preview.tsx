"use client";

import { useId, useState } from "react";
import { FormFeedback } from "@salesmora/ui";
import {
  VisitorCaptureForm,
  type VisitorCaptureResult,
} from "../visitor-capture-form/visitor-capture-form";
import {
  isVisitorDefinitionValid,
  type VisitorCaptureDefinition,
  type VisitorCaptureValues,
} from "../visitor-capture-form/visitor-capture-form.validation";
import { captureFormPreviewData as copy } from "./capture-form-preview.data";

export type CaptureFormPreviewProps = {
  definition: VisitorCaptureDefinition;
  canRead: boolean;
  initialViewport?: "desktop" | "mobile";
};
const controlClasses =
  "min-h-11 rounded-xl border px-4 py-2 text-sm font-semibold focus-visible:focus-ring";
// This boundary deliberately accepts no submission callback or persistence dependency.
async function simulateReceipt(): Promise<VisitorCaptureResult> {
  return { ok: true };
}
function PreviewSession({
  definition,
  availability,
  compact,
}: {
  definition: VisitorCaptureDefinition;
  availability: "active" | "paused";
  compact: boolean;
}) {
  const [value, setValue] = useState<VisitorCaptureValues>({
    answers: {},
    consent: false,
    website: "",
  });
  return (
    <VisitorCaptureForm
      definition={definition}
      value={value}
      onChange={setValue}
      onSubmit={simulateReceipt}
      availability={availability}
      compact={compact}
    />
  );
}

export function CaptureFormPreview({
  definition,
  canRead,
  initialViewport = "desktop",
}: CaptureFormPreviewProps) {
  const id = useId();
  const [viewport, setViewport] = useState(initialViewport);
  const [availability, setAvailability] = useState<"active" | "paused">(
    "active",
  );
  const [reset, setReset] = useState(0);
  if (!canRead) return <FormFeedback kind="error" message={copy.denied} />;
  return (
    <section
      aria-labelledby={`${id}-title`}
      className="grid min-w-0 gap-5 rounded-2xl border border-line bg-paper p-4 sm:p-6"
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-1">
          <h2 id={`${id}-title`} className="m-0 text-xl font-semibold text-ink">
            {copy.title}
          </h2>
          <p className="m-0 text-sm text-muted">{copy.description}</p>
        </div>
        <div
          role="group"
          aria-label={copy.viewport}
          className="flex flex-wrap gap-2"
        >
          {(["desktop", "mobile"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={viewport === mode}
              className={`${controlClasses} ${viewport === mode ? "border-primary bg-primary/10 text-primary-dark" : "border-line bg-paper text-ink"}`}
              onClick={() => setViewport(mode)}
            >
              {copy[mode]}
            </button>
          ))}
        </div>
      </header>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label
          className="grid min-w-0 gap-2 text-sm font-semibold text-ink"
          htmlFor={`${id}-state`}
        >
          {copy.state}
          <select
            id={`${id}-state`}
            value={availability}
            onChange={(event) =>
              setAvailability(event.target.value as "active" | "paused")
            }
            className={`${controlClasses} border-line bg-paper text-ink`}
          >
            <option value="active">{copy.active}</option>
            <option value="paused">{copy.paused}</option>
          </select>
        </label>
        <button
          type="button"
          className={`${controlClasses} border-line bg-paper text-ink`}
          onClick={() => setReset((count) => count + 1)}
        >
          {copy.reset}
        </button>
      </div>
      {!isVisitorDefinitionValid(definition) && (
        <FormFeedback kind="error" message={copy.invalid} />
      )}
      <div className="min-w-0 rounded-xl bg-canvas p-2 sm:p-4">
        <div
          className={`mx-auto w-full min-w-0 ${viewport === "mobile" ? "max-w-sm" : "max-w-2xl"}`}
        >
          {/* Any draft edit resets stale answers, validation and receipts; viewport changes preserve them. */}
          <PreviewSession
            key={JSON.stringify([definition, availability, reset])}
            definition={definition}
            availability={availability}
            compact={viewport === "mobile"}
          />
        </div>
      </div>
    </section>
  );
}
