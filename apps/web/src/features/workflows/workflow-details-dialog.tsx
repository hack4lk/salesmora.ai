"use client";

import { useId, useState } from "react";
import Dialog from "@mui/material/Dialog";
import { FormFeedback } from "@salesmora/ui";
import type { WorkflowNotificationChannels } from "@salesmora/contracts";
import type { WorkflowSummary } from "./workflows-page";
import { WorkflowNotificationChoices } from "./workflow-notification-choices";

export function WorkflowDetailsDialog({ row, onClose, onSaveNotifications }: {
  row: WorkflowSummary;
  onClose: () => void;
  onSaveNotifications?: (row: WorkflowSummary, notifications: WorkflowNotificationChannels) => Promise<void>;
}) {
  const title = useId();
  const saved = row.notifications;
  const [notifications, setNotifications] = useState(saved ?? { inApp: true, email: false });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const editable = !!row.canRunNow && !!onSaveNotifications;
  const dirty = notifications.inApp !== saved?.inApp || notifications.email !== saved?.email;
  return <Dialog open onClose={() => { if (!pending) onClose(); }} aria-labelledby={title} fullWidth maxWidth="sm">
    <div className="grid gap-4 p-6 text-ink">
      <h2 id={title} className="m-0 text-xl font-semibold wrap-anywhere">{row.name}</h2>
      <p className="m-0 text-sm leading-6 wrap-anywhere">{row.rule}</p>
      {saved && <>
        <WorkflowNotificationChoices optional={row.kind === "lead_routing"} value={notifications} onChange={editable ? setNotifications : undefined} disabled={pending} />
        <p className="m-0 text-sm leading-6 text-muted">{row.kind === "lead_routing" ? "Applies to future assignments." : "Applies to future reminders."} Email follows the recipient’s notification preferences and requires a verified address.</p>
      </>}
      {error && <FormFeedback kind="error" message={error} />}
      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" disabled={pending} onClick={onClose} className="min-h-11 cursor-pointer rounded-xl border border-line px-4 text-sm font-semibold hover:bg-canvas focus-visible:focus-ring">Close</button>
        {saved && editable && <button type="button" disabled={pending || !dirty || (!notifications.inApp && !notifications.email)}
          onClick={async () => {
            if (pending || !onSaveNotifications) return;
            setPending(true); setError("");
            try { await onSaveNotifications(row, notifications); onClose(); }
            catch { setError("Couldn't save notification options. Try again."); }
            finally { setPending(false); }
          }} className="min-h-11 cursor-pointer rounded-xl bg-seafoam px-4 text-sm font-semibold hover:bg-seafoam-dark focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50">{pending ? "Saving…" : "Save changes"}</button>}
      </div>
    </div>
  </Dialog>;
}
