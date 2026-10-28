"use client";

import { useId } from "react";
import { TextField } from "@salesmora/ui";
import type { EstimateDetailsValues, EstimateMember, EstimateStatus } from "../estimate-preview.types";
import { estimateInput, estimatePanel } from "../estimate-ui";
import type { EstimateDetailsErrors } from "./estimate-details-card.validation";
import { estimateDetailsCardData as c } from "./estimate-details-card.data";

export type EstimateDetailsCardProps = {
  value: EstimateDetailsValues;
  number: string | null;
  revision?: number;
  status?: EstimateStatus;
  members: readonly EstimateMember[];
  canEdit?: boolean;
  canAssignOwner?: boolean;
  pending?: boolean;
  errors?: EstimateDetailsErrors;
  onChange?: (value: EstimateDetailsValues) => void;
};

export function EstimateDetailsCard({
  value,
  number,
  revision = 1,
  status = "draft",
  members,
  canEdit = false,
  canAssignOwner = false,
  pending = false,
  errors = {},
  onChange,
}: EstimateDetailsCardProps) {
  const id = useId();
  const editable = status === "draft" && canEdit && !!onChange;
  const owner = members.find((member) => member.id === value.ownerId);
  const ownerLabel = value.ownerId ? owner?.name ?? c.ownerUnavailable : c.unassigned;
  function change(patch: Partial<EstimateDetailsValues>) {
    if (editable && !pending) onChange?.({ ...value, ...patch });
  }
  return (
    <section aria-labelledby={`${id}-title`} aria-busy={pending} className={`${estimatePanel} grid gap-5`}>
      <h2 id={`${id}-title`} className="m-0 text-lg font-semibold">{c.title}</h2>
      <p className="m-0 text-sm leading-6 text-muted">{editable ? c.description : status === "draft" ? c.readOnly : c.locked}</p>
      <dl className="m-0 grid min-w-0 gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-semibold text-muted">{c.number}</dt>
          <dd className="m-0 mt-1 text-sm wrap-anywhere">{number ?? c.generatedNumber}</dd>
        </div>
        {number && <div>
          <dt className="text-sm font-semibold text-muted">{c.revision}</dt>
          <dd className="m-0 mt-1 text-sm">{revision}</dd>
        </div>}
      </dl>
      {editable ? (
        <fieldset disabled={pending} className="m-0 grid min-w-0 gap-5 border-0 p-0">
          <legend className="sr-only">{c.title}</legend>
          <TextField
            name="name"
            label={c.name}
            required
            value={value.name}
            disabled={pending}
            onChange={(event) => change({ name: event.target.value })}
            error={!!errors.name}
            helperText={errors.name ?? c.nameHint}
            slotProps={{ input: { className: "has-focus-visible:focus-ring" }, htmlInput: { maxLength: 120 } }}
          />
          <TextField
            name="recipientName"
            label={c.recipientName}
            value={value.recipientName}
            disabled={pending}
            onChange={(event) => change({ recipientName: event.target.value })}
            error={!!errors.recipientName}
            helperText={errors.recipientName ?? c.recipientHint}
            autoComplete="name"
            slotProps={{ input: { className: "has-focus-visible:focus-ring" } }}
          />
          <TextField
            name="recipientEmail"
            label={c.recipientEmail}
            type="email"
            value={value.recipientEmail}
            disabled={pending}
            onChange={(event) => change({ recipientEmail: event.target.value })}
            error={!!errors.recipientEmail}
            helperText={errors.recipientEmail ?? c.recipientHint}
            autoComplete="email"
            slotProps={{ input: { className: "has-focus-visible:focus-ring" }, htmlInput: { maxLength: 254 } }}
          />
          <TextField
            name="serviceAddress"
            label={c.serviceAddress}
            value={value.serviceAddress}
            disabled={pending}
            onChange={(event) => change({ serviceAddress: event.target.value })}
            error={!!errors.serviceAddress}
            helperText={errors.serviceAddress ?? c.addressHint}
            autoComplete="street-address"
            slotProps={{ input: { className: "has-focus-visible:focus-ring" } }}
          />
          {canAssignOwner ? (
            <div className="grid min-w-0 gap-2">
              <label htmlFor={`${id}-owner`} className="text-sm font-semibold text-ink">{c.owner}</label>
              <select
                id={`${id}-owner`}
                name="ownerId"
                value={value.ownerId}
                disabled={pending}
                aria-invalid={!!errors.ownerId}
                aria-describedby={`${id}-owner-hint`}
                className={estimateInput}
                onChange={(event) => change({ ownerId: event.target.value })}
              >
                <option value="" disabled>{c.unassigned}</option>
                {value.ownerId && !owner && <option value={value.ownerId} disabled>{c.ownerUnavailable}</option>}
                {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
              </select>
              <p id={`${id}-owner-hint`} className={`m-0 text-sm leading-6 ${errors.ownerId ? "text-error" : "text-muted"}`}>{errors.ownerId ?? c.ownerHint}</p>
            </div>
          ) : (
            <dl className="m-0">
              <dt className="text-sm font-semibold text-muted">{c.owner}</dt>
              <dd className="m-0 mt-1 text-sm wrap-anywhere">{ownerLabel}</dd>
            </dl>
          )}
        </fieldset>
      ) : (
        <dl className="m-0 grid min-w-0 gap-4">
          {([
            [c.name, value.name],
            [c.recipientName, value.recipientName],
            [c.recipientEmail, value.recipientEmail],
            [c.serviceAddress, value.serviceAddress.trim() ? value.serviceAddress : c.confirmAddress],
            [c.owner, ownerLabel],
          ] as const).map(([label, text]) => (
            <div key={label}>
              <dt className="text-sm font-semibold text-muted">{label}</dt>
              <dd className="m-0 mt-1 whitespace-pre-wrap text-sm leading-6 wrap-anywhere">{text.trim() ? text : c.notProvided}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
