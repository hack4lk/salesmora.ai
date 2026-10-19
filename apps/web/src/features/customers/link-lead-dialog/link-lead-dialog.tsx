"use client";
import { useId, useState } from "react";
import { ConfirmDialog } from "@salesmora/ui";
import type { LinkedCustomerRecord } from "../customer-preview.types";
import { customerInput } from "../customer-ui";
import { linkLeadDialogData as c } from "./link-lead-dialog.data";
export type LinkLeadDialogProps = {
  open: boolean;
  customerName: string;
  records: readonly LinkedCustomerRecord[];
  unlinking?: LinkedCustomerRecord;
  pending?: boolean;
  error?: string;
  loading?: boolean;
  onSearch?: (value: string) => void;
  onClose: () => void;
  onConfirm: (record: LinkedCustomerRecord, replace: boolean) => Promise<void>;
};
export function LinkLeadDialog(props: LinkLeadDialogProps) {
  return (
    <LinkReview key={`${props.open}:${props.unlinking?.id ?? ""}`} {...props} />
  );
}
function LinkReview({
  open,
  customerName,
  records,
  unlinking,
  pending,
  error,
  loading,
  onSearch,
  onClose,
  onConfirm,
}: LinkLeadDialogProps) {
  const id = useId(),
    [search, setSearch] = useState(""),
    [selected, setSelected] = useState(""),
    [replace, setReplace] = useState(false);
  const record = unlinking ?? records.find((item) => item.id === selected),
    elsewhere = !unlinking && !!record?.customerId;
  const results = onSearch
    ? records
    : records.filter((r) =>
        `${r.name} ${r.number}`.toLowerCase().includes(search.toLowerCase()),
      );
  return (
    <ConfirmDialog
      open={open}
      title={unlinking ? c.unlink : c.link}
      description={
        unlinking
          ? c.unlinkHint(unlinking.number, customerName)
          : c.description(customerName)
      }
      confirmLabel={unlinking ? c.unlink : c.link}
      confirmDisabled={
        loading || !!error || !record || (!!elsewhere && !replace)
      }
      pending={pending}
      error={error}
      onClose={onClose}
      onConfirm={async () => {
        if (record) await onConfirm(record, replace);
      }}
    >
      {!unlinking && (
        <div className="grid min-w-0 gap-4">
          <label htmlFor={id} className="grid gap-2 text-sm font-semibold">
            {c.search}
            <input
              type="search"
              id={id}
              value={search}
              disabled={pending}
              className={customerInput}
              onChange={(e) => {
                setSearch(e.target.value);
                onSearch?.(e.target.value);
                setSelected("");
                setReplace(false);
              }}
            />
          </label>
          <fieldset
            disabled={pending}
            className="m-0 grid min-w-0 gap-3 border-0 p-0"
          >
            <legend className="mb-3 text-sm font-semibold">{c.choose}</legend>
            {results.map((r) => (
              <label
                key={r.id}
                className="flex min-w-0 cursor-pointer items-start gap-3 rounded-xl border border-line p-3 text-sm"
              >
                <input
                  type="radio"
                  name={id}
                  checked={selected === r.id}
                  onChange={() => {
                    setSelected(r.id);
                    setReplace(false);
                  }}
                  className="mt-1 size-5 shrink-0 cursor-pointer accent-primary focus-visible:focus-ring"
                />
                <span className="grid min-w-0 gap-1">
                  <strong className="wrap-anywhere">
                    {r.number} · {r.name}
                  </strong>
                  <span className="text-muted">{r.status}</span>
                  {r.customerName && (
                    <span className="text-muted wrap-anywhere">
                      {c.current(r.customerName)}
                    </span>
                  )}
                </span>
              </label>
            ))}
          </fieldset>
          {!results.length && (
            <p role="status" className="m-0 text-sm text-muted">
              {c.empty}
            </p>
          )}
          {elsewhere && (
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
              <input
                type="checkbox"
                checked={replace}
                disabled={pending}
                onChange={(e) => setReplace(e.target.checked)}
                className="mt-1 size-5 shrink-0 cursor-pointer accent-primary focus-visible:focus-ring"
              />
              <span>{c.replace(record?.customerName || c.other)}</span>
            </label>
          )}
        </div>
      )}
    </ConfirmDialog>
  );
}
