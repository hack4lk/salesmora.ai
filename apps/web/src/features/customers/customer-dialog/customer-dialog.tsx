"use client";
import { useId, useState } from "react";
import Dialog from "@mui/material/Dialog";
import type { CustomerFormProps } from "../customer-form/customer-form";
import { CustomerForm } from "../customer-form/customer-form";
import {
  DuplicateMatchBanner,
  type CustomerDuplicateMatch,
} from "../duplicate-match-banner/duplicate-match-banner";
import { customerButton } from "../customer-ui";
import { customerDialogData as c } from "./customer-dialog.data";
export type CustomerDialogProps = CustomerFormProps & {
  open: boolean;
  onClose: () => void;
  matches?: readonly CustomerDuplicateMatch[];
  onUseExisting?: (id: string) => void;
  onCreateAnyway?: () => void;
};
export function CustomerDialog({
  open,
  onClose,
  matches = [],
  onUseExisting,
  onCreateAnyway,
  ...form
}: CustomerDialogProps) {
  const id = useId();
  const [working, setWorking] = useState(false);
  const busy = working || !!form.pending;
  const close = () => {
    if (!busy) onClose();
  };
  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="sm"
      scroll="paper"
      onClose={() => {
        close();
      }}
      slotProps={{
        backdrop: { className: "bg-ink/50" },
        paper: {
          tabIndex: 0,
          "aria-labelledby": id,
          "aria-describedby": `${id}-description`,
          className: "m-3 min-w-0 rounded-2xl bg-paper text-ink sm:m-8",
        },
      }}
    >
      <div className="min-w-0 p-5 sm:p-8">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id={id} className="m-0 text-2xl font-semibold">
              {form.editing ? c.edit : c.add}
            </h2>
            <p
              id={`${id}-description`}
              className="mb-0 mt-3 text-sm leading-6 text-muted"
            >
              {c.description}
            </p>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={close}
            className={customerButton}
          >
            {c.close}
          </button>
        </header>
        {matches.length > 0 && onUseExisting && onCreateAnyway && (
          <div className="mb-6">
            <DuplicateMatchBanner
              matches={matches}
              disabled={busy}
              onUseExisting={onUseExisting}
              onCreateAnyway={onCreateAnyway}
            />
          </div>
        )}
        <div className="min-w-0">
          <CustomerForm
            {...form}
            pending={busy}
            onSubmit={async (value) => {
              setWorking(true);
              try {
                await form.onSubmit(value);
              } finally {
                setWorking(false);
              }
            }}
            disabled={form.disabled}
            reviewRequired={matches.length > 0}
            onCancel={close}
          />
        </div>
      </div>
    </Dialog>
  );
}
