"use client";

import { useId } from "react";
import {
  FormFeedback,
  HelpTooltip,
  SeafoamButton,
  SeafoamOutlineButton,
} from "@salesmora/ui";
import { reportTemplateCalloutData as copy } from "./report-template-callout.data";

export type ReportTemplateCalloutProps = {
  configurationLabel: string;
  canRead: boolean;
  canSave: boolean;
  activeTemplate?: { id: string; name: string; canUpdate: boolean };
  pending?: boolean;
  error?: string;
  onSave: () => void;
  onUpdate: (templateId: string) => void;
  onViewTemplates: () => void;
};

/** Requests reviewed dialogs; the host binds the displayed configuration and owns persistence/access checks. */
export function ReportTemplateCallout({
  configurationLabel,
  canRead,
  canSave,
  activeTemplate,
  pending = false,
  error,
  onSave,
  onUpdate,
  onViewTemplates,
}: ReportTemplateCalloutProps) {
  const id = useId();
  if (!canRead) return <FormFeedback kind="error" message={copy.denied} />;
  return (
    <section
      aria-labelledby={`${id}-title`}
      aria-busy={pending}
      className="flex w-full min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-2xl border border-line bg-paper px-4 py-3 text-ink"
    >
      <header className="flex min-w-0 items-center gap-1">
        <h2 id={`${id}-title`} className="m-0 text-base font-semibold">
          {copy.title}
        </h2>
        <HelpTooltip label={copy.help} paragraphs={[
          copy.description,
          configurationLabel,
          activeTemplate ? copy.basedOn(activeTemplate.name) : copy.personal,
        ]} />
      </header>
      <div className="ml-auto flex min-w-0 flex-wrap justify-end gap-3">
        <SeafoamButton
          size={16}
          label={copy.save}
          disabled={pending || !canSave}
          onClick={() => {
            if (canSave && !pending) onSave();
          }}
        />
        {activeTemplate && (
          <SeafoamButton
            size={16}
            label={copy.update}
            disabled={pending || !activeTemplate.canUpdate}
            onClick={() => {
              if (activeTemplate.canUpdate && !pending)
                onUpdate(activeTemplate.id);
            }}
          />
        )}
        <SeafoamOutlineButton
          size={16}
          label={copy.view}
          disabled={pending}
          onClick={() => {
            if (!pending) onViewTemplates();
          }}
        />
      </div>
      {!canSave && !activeTemplate?.canUpdate && (
        <p className="m-0 w-full text-sm text-muted">{copy.readOnly}</p>
      )}
      {error && <div className="w-full"><FormFeedback kind="error" message={error} /></div>}
      {pending && (
        <p role="status" className="m-0 w-full text-sm text-muted">
          {copy.pending}
        </p>
      )}
    </section>
  );
}
