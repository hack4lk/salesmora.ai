"use client";

import type { WorkflowNotificationChannels } from "@salesmora/contracts";

export function WorkflowNotificationChoices({ value, onChange, disabled = false, dark = false, optional = false }: {
  value: WorkflowNotificationChannels;
  onChange?: (value: WorkflowNotificationChannels) => void;
  disabled?: boolean;
  dark?: boolean;
  optional?: boolean;
}) {
  return <fieldset disabled={disabled || !onChange} className={`m-0 grid gap-2 border-0 p-0 text-sm ${dark ? "text-assistant-foreground" : "text-ink"}`}>
    <legend className="mb-2 font-semibold">Notify via</legend>
    <div className="flex flex-wrap gap-x-6 gap-y-2">
      {([ ["inApp", "In-app"], ["email", "Email"] ] as const).map(([key, label]) => <label key={key} className="flex min-h-11 cursor-pointer items-center gap-2 has-disabled:cursor-default">
        <input type="checkbox" checked={value[key]} onChange={event => onChange?.({ ...value, [key]: event.target.checked })}
          className="size-5 accent-seafoam-dark focus-visible:focus-ring" />{label}
      </label>)}
    </div>
    {!optional && !value.inApp && !value.email && <p role="alert" className="m-0">Choose at least one notification option.</p>}
  </fieldset>;
}
