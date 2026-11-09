'use client';

import { useRef, useState } from 'react';
import { ConfirmDialog, FormFeedback, TextField } from '@salesmora/ui';
import { reportTemplateNameDialogData as copy } from './report-template-name-dialog.data';
import { reportTemplateNameError, type ReportTemplateNameEntry } from './report-template-name-dialog.validation';

export type ReportTemplateNameDialogProps = {
  open: boolean;
  reportLabel: string;
  initialName: string;
  /** Current user's templates in this workspace and report area only. */
  existingTemplates: readonly ReportTemplateNameEntry[];
  canSave: boolean;
  pending?: boolean;
  error?: string;
  onClose: () => void;
  /** Revalidate uniqueness/access on the server. Resolve on success, reject on failure; host closes on success. */
  onSave: (name: string) => Promise<void>;
} & ({ mode: 'save' } | { mode: 'rename'; templateId: string });

function NameDialog(props: ReportTemplateNameDialogProps) {
  const { mode, reportLabel, initialName, existingTemplates, canSave, pending = false, error, onClose, onSave } = props;
  const [name, setName] = useState(initialName), [submitted, setSubmitted] = useState(false), [saving, setSaving] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const invalid = reportTemplateNameError(name, existingTemplates, props.mode === 'rename' ? props.templateId : undefined);
  const busy = pending || saving;
  return <ConfirmDialog open title={copy.titles[mode]} description={copy.description} confirmLabel={copy.confirm[mode]} initialFocus="content" confirmAppearance="seafoam"
    confirmDisabled={!canSave} pending={pending} pendingLabel={copy.saving} error={error} onClose={onClose} onConfirm={async () => {
      if (!canSave || busy) return;
      setSubmitted(true);
      if (invalid) { input.current?.focus(); return; }
      setSaving(true);
      try { await onSave(name.trim()); }
      finally { setSaving(false); }
    }}>
    <div className="grid min-w-0 gap-4">
      <p className="m-0 text-sm font-semibold wrap-anywhere">{reportLabel}</p>
      {!canSave && <FormFeedback kind="error" message={copy.denied} />}
      <TextField label={copy.name} required autoFocus inputRef={input} value={name} disabled={!canSave || busy}
        error={submitted && !!invalid} helperText={submitted && invalid ? copy.errors[invalid] : copy.help} autoComplete="off"
        slotProps={{ input: { className: 'has-focus-visible:focus-ring' }, htmlInput: { className: 'box-border min-h-11', maxLength: 80 } }}
        onChange={event => setName(event.target.value)} />
    </div>
  </ConfirmDialog>;
}

/** Reopening or switching templates starts a fresh draft, without persisting result data. */
export function ReportTemplateNameDialog(props: ReportTemplateNameDialogProps) {
  return props.open ? <NameDialog key={JSON.stringify([props.mode, props.mode === 'rename' ? props.templateId : null, props.reportLabel, props.initialName])} {...props} /> : null;
}
