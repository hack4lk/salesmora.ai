"use client";
import { useId, useState } from "react";
import { candidatePickerData as c } from "./candidate-picker.data";
export function CandidatePicker({
  kind,
  candidates,
  disabled,
  onChoose,
}: {
  kind: "customer" | "member";
  candidates: readonly { id: string; name: string; detail: string }[];
  disabled?: boolean;
  onChoose: (id: string) => void;
}) {
  const id = useId(),
    [selected, setSelected] = useState("");
  return (
    <section
      aria-labelledby={id}
      className="grid min-w-0 gap-4 rounded-xl border border-assistant-border bg-assistant-surface p-5 text-assistant-foreground"
    >
      <h3 id={id} className="m-0 text-lg font-semibold">
        {c.titles[kind]}
      </h3>
      <p className="m-0 text-sm text-assistant-muted">{c.hint}</p>
      <fieldset
        disabled={disabled}
        className="m-0 grid min-w-0 gap-3 border-0 p-0"
      >
        <legend className="sr-only">{c.titles[kind]}</legend>
        {candidates.map((candidate) => (
          <label
            key={candidate.id}
            className="flex min-w-0 cursor-pointer items-start gap-3 rounded-xl border border-assistant-border bg-assistant-message p-4"
          >
            <input
              type="radio"
              name={id}
              checked={candidate.id === selected}
              onChange={() => setSelected(candidate.id)}
              className="mt-1 size-5 shrink-0 cursor-pointer accent-assistant-accent focus-visible:focus-ring"
            />
            <span className="grid min-w-0 gap-1">
              <strong className="text-sm wrap-anywhere">
                {candidate.name}
              </strong>
              <span className="text-sm text-assistant-muted wrap-anywhere">
                {candidate.detail}
              </span>
            </span>
          </label>
        ))}
      </fieldset>
      {!candidates.length && (
        <p role="status" className="m-0 text-sm">
          {c.empty}
        </p>
      )}
      <button
        type="button"
        disabled={
          disabled || !candidates.some((candidate) => candidate.id === selected)
        }
        onClick={() => onChoose(selected)}
        className="min-h-11 cursor-pointer rounded-xl bg-assistant-accent px-4 py-2 text-sm font-semibold text-assistant-surface focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        {c.choose}
      </button>
    </section>
  );
}
