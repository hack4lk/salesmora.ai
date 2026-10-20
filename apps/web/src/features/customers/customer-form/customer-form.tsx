"use client";
import { useId, useRef, useState } from "react";
import { TextField, FormFeedback } from "@salesmora/ui";
import type { CustomerMember, CustomerValues } from "../customer-preview.types";
import { customerButton, customerPrimary, customerInput } from "../customer-ui";
import { customerFormData as c } from "./customer-form.data";
export type CustomerFormProps = {
  value: CustomerValues;
  members: readonly CustomerMember[];
  editing?: boolean;
  pending?: boolean;
  disabled?: boolean;
  reviewRequired?: boolean;
  error?: string;
  conflict?: boolean;
  moreOpen?: boolean;
  onChange: (value: CustomerValues) => void;
  onSubmit: (value: CustomerValues) => Promise<void>;
  onCancel?: () => void;
  onReload?: () => void;
};
export function CustomerForm({
  value,
  members,
  editing,
  pending,
  disabled,
  reviewRequired,
  error,
  conflict,
  moreOpen,
  onChange,
  onSubmit,
  onCancel,
  onReload,
}: CustomerFormProps) {
  const id = useId(),
    lock = useRef(false),
    [busy, setBusy] = useState(false),
    [failure, setFailure] = useState(""),
    [errors, setErrors] = useState<
      Partial<Record<keyof CustomerValues, string>>
    >({});
  const blocked = busy || !!pending || !!disabled || !!reviewRequired;
  const change = (patch: Partial<CustomerValues>) => {
    if (!blocked) {
      onChange({ ...value, ...patch });
      setErrors({});
      setFailure("");
    }
  };
  const fields = [
    ["name", c.name],
    ["email", c.email],
    ["phone", c.phone],
  ] as const;
  return (
    <form
      aria-label={editing ? c.edit : c.add}
      aria-busy={busy || !!pending}
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        if (blocked || lock.current || conflict) return;
        const next: typeof errors = {};
        if (!value.name.trim() || value.name.trim().length > 200)
          next.name = c.nameError;
        if (
          value.email &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim())
        )
          next.email = c.emailError;
        if (
          value.phone &&
          (!/^[+()\d\s.-]+$/.test(value.phone.trim()) ||
            value.phone.replace(/\D/g, "").length < 7 ||
            value.phone.replace(/\D/g, "").length > 15)
        )
          next.phone = c.phoneError;
        if (value.companyName.length > 200) next.companyName = c.companyError;
        if (Object.keys(next).length) {
          setErrors(next);
          const key = Object.keys(next)[0];
          e.currentTarget
            .querySelector<HTMLInputElement>(`[name="${key}"]`)
            ?.focus();
          return;
        }
        lock.current = true;
        setBusy(true);
        setFailure("");
        try {
          await onSubmit(
            Object.fromEntries(
              (
                [
                  "name",
                  "type",
                  "companyName",
                  "email",
                  "phone",
                  "location",
                  "internalNotes",
                  "ownerId",
                ] as const
              ).map((key) => [key, value[key].trim()]),
            ) as CustomerValues,
          );
        } catch {
          setFailure(c.failed);
        } finally {
          lock.current = false;
          setBusy(false);
        }
      }}
      className="grid min-w-0 gap-5"
    >
      <fieldset
        disabled={blocked}
        className="m-0 grid min-w-0 gap-5 border-0 p-0"
      >
        <legend className="sr-only">{c.contact}</legend>
        {fields.map(([key, label]) => (
          <TextField
            key={key}
            name={key}
            label={label}
            required={key === "name"}
            type={key === "email" ? "email" : "text"}
            value={value[key]}
            onChange={(e) => change({ [key]: e.target.value })}
            error={!!errors[key]}
            helperText={errors[key]}
            slotProps={{
              htmlInput: {
                maxLength: key === "email" ? 254 : key === "phone" ? 40 : 200,
                inputMode: key === "phone" ? "tel" : undefined,
              },
            }}
          />
        ))}
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            checked={value.type === "business"}
            onChange={(e) =>
              change({ type: e.target.checked ? "business" : "person" })
            }
            className="size-5 cursor-pointer accent-primary focus-visible:focus-ring"
          />
          {c.business}
        </label>
        {value.type === "business" && (
          <TextField
            name="companyName"
            label={c.company}
            value={value.companyName}
            onChange={(e) => change({ companyName: e.target.value })}
            error={!!errors.companyName}
            helperText={errors.companyName}
            slotProps={{ htmlInput: { maxLength: 200 } }}
          />
        )}
        <details open={moreOpen} className="rounded-xl border border-line p-4">
          <summary className="min-h-11 cursor-pointer font-semibold text-primary focus-visible:focus-ring">
            {c.more}
          </summary>
          <div className="mt-3 grid min-w-0 gap-5">
            <TextField
              label={c.location}
              value={value.location}
              onChange={(e) => change({ location: e.target.value })}
              slotProps={{ htmlInput: { maxLength: 500 } }}
            />
            <label className="grid gap-2 text-sm font-semibold text-ink">
              {c.owner}
              <select
                value={value.ownerId}
                onChange={(e) => change({ ownerId: e.target.value })}
                className={customerInput}
              >
                <option value="">{c.unassigned}</option>
                {members.map((m) => (
                  <option value={m.id} key={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>
            <label
              htmlFor={`${id}-notes`}
              className="grid gap-2 text-sm font-semibold text-ink"
            >
              {c.notes}
              <textarea
                id={`${id}-notes`}
                value={value.internalNotes}
                rows={3}
                maxLength={4000}
                onChange={(e) => change({ internalNotes: e.target.value })}
                className={customerInput}
              />
            </label>
            <p className="m-0 text-sm text-muted">{c.notesHint}</p>
          </div>
        </details>
      </fieldset>
      {conflict && (
        <>
          <FormFeedback kind="error" message={c.conflict} />
          {onReload && (
            <button
              type="button"
              className={customerButton}
              disabled={blocked}
              onClick={onReload}
            >
              {c.reload}
            </button>
          )}
        </>
      )}
      {(error || failure) && (
        <FormFeedback kind="error" message={error || failure} />
      )}
      {reviewRequired && (
        <p role="status" className="m-0 text-sm text-muted">
          {c.review}
        </p>
      )}
      {disabled && (
        <p role="status" className="m-0 text-sm text-muted">
          {c.readonly}
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            disabled={blocked}
            onClick={onCancel}
            className={customerButton}
          >
            {c.cancel}
          </button>
        )}
        <button
          type="submit"
          disabled={blocked || conflict}
          className={customerPrimary}
        >
          {busy || pending ? c.saving : editing ? c.save : c.add}
        </button>
      </div>
    </form>
  );
}
