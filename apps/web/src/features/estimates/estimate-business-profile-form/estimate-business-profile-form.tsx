"use client";

import { useEffect, useId, useRef, useState } from "react";
import { FormFeedback } from "@salesmora/ui";
import { EstimateBusinessLogo } from "../estimate-business-logo";
import { isEstimatePaperLogoPath } from "../estimate-preview-paper/estimate-preview-paper.preview";
import type { EstimateRole } from "../estimate-preview.types";
import { createEstimateTimestampFormatter } from "../estimate-timestamp";
import { estimateButton, estimateInput, estimatePanel, estimatePrimary } from "../estimate-ui";
import { estimateBusinessProfileFormData as c, estimateBusinessProfileLimits as limits, estimateBusinessLogoLimits as logoLimits } from "./estimate-business-profile-form.data";
import {
  estimateBusinessIdentityIssues, reviewEstimateBusinessProfile, validateEstimateBusinessLogoImage,
  type EstimateBusinessProfile, type EstimateBusinessProfileDraft, type EstimateBusinessProfileSource, type EstimateBusinessLogoUpload,
} from "./estimate-business-profile-form.preview";

export type EstimateBusinessProfileFormProps = {
  source: EstimateBusinessProfileSource;
  value: EstimateBusinessProfileDraft;
  role: EstimateRole;
  canRead: boolean;
  canManage: boolean;
  timezone: string;
  pending?: boolean;
  conflict?: boolean;
  saved?: boolean;
  onChange?: (value: EstimateBusinessProfileDraft) => void;
  onSave?: (request: EstimateBusinessProfileDraft) => void | Promise<void>;
  onDiscard?: () => void;
  onReload?: () => void | Promise<void>;
  /** Stages an authorized immutable asset; profile persistence still requires Save. */
  onUploadLogo?: (request: EstimateBusinessLogoUpload) => Promise<{ logoPath: string }>;
};

export function EstimateBusinessProfileForm(props: EstimateBusinessProfileFormProps) {
  const binding = props.source.state === "ready" ? [props.source.record.workspaceId, props.source.record.version] : props.source.state;
  return <BusinessProfileSession key={JSON.stringify([props.value.workspaceId, props.value.expectedVersion, props.canRead, props.canManage, props.role, binding, props.conflict, !!props.onChange, !!props.onUploadLogo])} {...props} />;
}
function BusinessProfileSession({
  source, value, role, canRead, canManage, timezone, pending = false, conflict = false, saved = false,
  onChange, onSave, onDiscard, onReload, onUploadLogo,
}: EstimateBusinessProfileFormProps) {
  const id = useId(), form = useRef<HTMLFormElement>(null), addButton = useRef<HTMLButtonElement>(null);
  const focusPreset = useRef<number | null>(null);
  const flight = useRef(false);
  const mounted = useRef(false), logoInput = useRef<HTMLInputElement>(null), logoButton = useRef<HTMLButtonElement>(null);
  const [working, setWorking] = useState<"save" | "reload" | "logo" | null>(null);
  const [reviewed, setReviewed] = useState(false);
  const [failure, setFailure] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [logoFailure, setLogoFailure] = useState("");
  const [failedLogo, setFailedLogo] = useState<string | null>(null);
  const currentUploadContext = useRef({ value, pending });
  const review = reviewEstimateBusinessProfile({ source, value, role, canRead, canManage, conflict });
  const busy = pending || working !== null;
  const editable = review.editable && !!onChange;
  const locked = !editable || busy;
  const profile = review.editable ? value.profile : source.state === "ready" ? source.record.profile : value.profile;
  const identityIssues = estimateBusinessIdentityIssues(profile);
  const errors = reviewed && review.editable ? review.errors : {};
  const errorFor = (field: keyof typeof errors) => errors[field];
  const presetError = errorFor("paymentPresets");
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { currentUploadContext.current = { value, pending }; }, [value, pending]);
  useEffect(() => {
    if (focusPreset.current === null) return;
    const name = `preset.${focusPreset.current}.label`;
    Array.from(form.current?.querySelectorAll<HTMLInputElement>("input[name]") ?? []).find((input) => input.name === name)?.focus();
    focusPreset.current = null;
  }, [value.profile.paymentPresets]);
  function change(patch: Partial<EstimateBusinessProfile>) {
    if (locked || flight.current) return;
    setFailure("");
    onChange?.({ ...value, profile: { ...value.profile, ...patch } });
  }
  async function uploadLogo(file: File) {
    if (locked || flight.current || !onUploadLogo) return;
    flight.current = true; setWorking("logo"); setLogoFailure(""); setFailure("");
    try {
      const error = await validateEstimateBusinessLogoImage(file);
      if (!mounted.current) return;
      if (error) { setLogoFailure(error); return; }
      if (currentUploadContext.current.value !== value || currentUploadContext.current.pending) { setLogoFailure(c.errors.logoStale); return; }
      const result = await onUploadLogo({ workspaceId: value.workspaceId, expectedVersion: value.expectedVersion, file });
      if (!mounted.current) return;
      if (currentUploadContext.current.value !== value || currentUploadContext.current.pending) { setLogoFailure(c.errors.logoStale); return; }
      if (!isEstimatePaperLogoPath(result.logoPath)) { setLogoFailure(c.errors.logoPath); return; }
      setFailedLogo(null);
      onChange?.({ ...value, profile: { ...value.profile, logoPath: result.logoPath } });
      setAnnouncement(c.logoReady);
    } catch { if (mounted.current) setLogoFailure(c.errors.logoUpload); }
    finally { flight.current = false; if (mounted.current) setWorking(null); }
  }
  async function reload() {
    if (!canRead || busy || flight.current || !onReload) return;
    flight.current = true; setWorking("reload"); setFailure("");
    try { await onReload(); }
    catch { setFailure(c.errors.reload); }
    finally { flight.current = false; setWorking(null); }
  }
  async function save() {
    if (locked || flight.current || !onSave) return;
    setReviewed(true); setFailure("");
    if (!review.request) {
      const first = Object.keys(review.errors)[0];
      const target = Array.from(form.current?.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement>("[name]") ?? []).find((field) => field.name === first);
      target?.focus();
      return;
    }
    flight.current = true; setWorking("save");
    try { await onSave(review.request); }
    catch { setFailure(c.errors.save); }
    finally { flight.current = false; setWorking(null); }
  }
  const field = (name: keyof typeof c.fields, rows?: number) => {
    const data = c.fields[name], error = errorFor(name);
    const optional = name === "licenseLine" || name === "message" || name === "termsNote";
    const help = name === "name" ? c.workspaceName : name === "email" ? c.replyHint : name === "licenseLine" ? c.licenseHint : "";
    const inputProps = {
      id: `${id}-${name}`, name, value: profile[name], maxLength: data.limit, disabled: locked,
      className: estimateInput, "aria-invalid": !!error, "aria-describedby": `${id}-${name}-hint`,
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => change({ [name]: event.target.value }),
    };
    return <div className="grid min-w-0 content-start gap-2" key={name}>
      <label htmlFor={inputProps.id} className="text-sm font-semibold">{optional ? c.optional(data.label) : data.label}</label>
      {rows ? <textarea {...inputProps} rows={rows} /> : <input {...inputProps} type={name === "email" ? "email" : name === "phone" ? "tel" : "text"} />}
      <p id={`${id}-${name}-hint`} className={`m-0 text-sm leading-6 wrap-anywhere ${error ? "text-error" : "text-muted"}`}>{error ?? `${help} ${c.count(profile[name], data.limit)}`}</p>
    </div>;
  };
  const reloadControl = <div className="grid gap-3">
    <p className="m-0 text-sm leading-6 text-muted">{c.reloadHint}</p>
    {onReload ? <button type="button" className={`${estimateButton} justify-self-start`} disabled={busy} onClick={() => { void reload(); }}>{working === "reload" ? c.reloading : c.reload}</button>
      : <p className="m-0 text-sm text-muted">{c.noReload}</p>}
  </div>;
  return <section aria-labelledby={`${id}-title`} aria-busy={busy} className="grid min-w-0 gap-5 text-ink">
    <header><h2 id={`${id}-title`} className="m-0 text-xl font-semibold">{c.title}</h2>
      {canRead && <p className="mb-0 mt-3 text-sm leading-6 text-muted">{c.description}</p>}</header>
    {!canRead ? <FormFeedback kind="error" message={c.cannotRead} />
      : source.state !== "ready" ? <div className={`${estimatePanel} grid gap-4`}>
        {source.state === "loading" ? <p role="status" className="m-0">{c.loading}</p> : <><FormFeedback kind="error" message={source.state === "error" ? c.loadError : c.unavailable} />{reloadControl}</>}
        {failure && <FormFeedback kind="error" message={failure} />}
      </div> : <form ref={form} noValidate className="grid min-w-0 gap-5" onSubmit={(event) => { event.preventDefault(); void save(); }}>
        {!editable && !review.issues.length && <p role="status" className="m-0 text-sm text-muted">{review.editable ? c.noChange : c.readOnly}</p>}
        {review.issues.map((issue) => <FormFeedback key={issue} kind="error" message={issue} />)}
        {!!review.issues.length && reloadControl}
        <fieldset disabled={locked} className={`${estimatePanel} m-0 grid min-w-0 gap-5`}>
          <legend className="sr-only">{c.identity}</legend>
          <h3 className="m-0 text-lg font-semibold">{c.identity}</h3>
          <p className="m-0 text-sm leading-6 text-muted">{c.identityHint}</p>
          <div className="grid min-w-0 gap-5 sm:grid-cols-2">{field("name")}{field("email")}{field("address", 3)}{field("phone")}</div>
          {field("licenseLine")}
          <div className="flex min-w-0 flex-col items-start gap-3 rounded-xl border border-line p-4 sm:flex-row">
            <EstimateBusinessLogo name={profile.name} logoPath={profile.logoPath} onError={() => setFailedLogo(profile.logoPath)} />
            <div className="grid min-w-0 gap-3"><p className="m-0 text-sm font-semibold">{c.logo}</p>
              <p id={`${id}-logo-hint`} className="m-0 text-sm leading-6 text-muted">{c.logoHint}</p>
              {editable && <>
                <input ref={logoInput} type="file" hidden accept={logoLimits.types.join(",")} aria-label={c.logoFile} onChange={(event) => {
                  const file = event.target.files?.[0]; event.target.value = "";
                  if (file) void uploadLogo(file);
                }} />
                <div className="flex flex-wrap gap-3">
                  <button ref={logoButton} type="button" name="logoPath" className={estimateButton} disabled={busy || !onUploadLogo} aria-describedby={`${id}-logo-hint`} onClick={() => logoInput.current?.click()}>
                    {profile.logoPath ? c.replaceLogo : c.uploadLogo}
                  </button>
                  {profile.logoPath && <button type="button" className={estimateButton} disabled={busy} onClick={() => {
                    if (locked || flight.current) return;
                    change({ logoPath: null }); setLogoFailure(""); setFailedLogo(null); setAnnouncement(c.logoRemoved);
                    if (onUploadLogo) logoButton.current?.focus();
                    else form.current?.querySelector<HTMLInputElement>('input[name="name"]')?.focus();
                  }}>{c.removeLogo}</button>}
                </div>
                {!onUploadLogo && <p className="m-0 text-sm text-muted">{c.noLogoUpload}</p>}
              </>}
              {working === "logo" && <p role="status" className="m-0 text-sm">{c.uploadingLogo}</p>}
              {(logoFailure || errorFor("logoPath") || (profile.logoPath && (!isEstimatePaperLogoPath(profile.logoPath) || failedLogo === profile.logoPath))) && <FormFeedback kind="error"
                message={logoFailure || errorFor("logoPath") || (profile.logoPath && !isEstimatePaperLogoPath(profile.logoPath) ? c.errors.logoPath : c.errors.logoLoad)} />}
            </div>
          </div>
          <label className="flex min-h-11 min-w-0 items-start gap-3 rounded-xl border border-line p-3">
            <input type="checkbox" name="requireServiceAddress" checked={profile.requireServiceAddress} onChange={(event) => change({ requireServiceAddress: event.target.checked })}
              className="mt-1 size-5 shrink-0 accent-primary focus-visible:focus-ring" aria-describedby={`${id}-address-hint`} />
            <span className="text-sm font-semibold">{c.addressRequired}</span>
          </label>
          <p id={`${id}-address-hint`} className="m-0 text-sm leading-6 text-muted">{c.addressHint}</p>
          <div role="status" className="rounded-xl border border-line bg-canvas p-4 text-sm leading-6">
            <p className="m-0">{identityIssues.length ? c.identityIncomplete : c.identityComplete}</p>
            {!!identityIssues.length && <ul className="mb-0 mt-2 pl-5">{identityIssues.map((issue) => <li key={issue}>{issue}</li>)}</ul>}
          </div>
        </fieldset>
        <fieldset disabled={locked} className={`${estimatePanel} m-0 grid min-w-0 gap-5`}>
          <legend className="sr-only">{c.defaults}</legend>
          <h3 className="m-0 text-lg font-semibold">{c.defaults}</h3>
          <div className="grid min-w-0 gap-5 sm:grid-cols-2">
            {(["validForDays", "taxRate"] as const).map((name) => <div key={name} className="grid min-w-0 content-start gap-2">
              <label htmlFor={`${id}-${name}`} className="text-sm font-semibold">{name === "validForDays" ? c.validForDays : c.taxRate}</label>
              <input id={`${id}-${name}`} name={name} value={profile[name]} className={estimateInput} inputMode={name === "validForDays" ? "numeric" : "decimal"} maxLength={name === "validForDays" ? 3 : undefined}
                aria-invalid={!!errorFor(name)} aria-describedby={`${id}-${name}-hint`} onChange={(event) => change({ [name]: event.target.value })} />
              <p id={`${id}-${name}-hint`} className={`m-0 text-sm leading-6 ${errorFor(name) ? "text-error" : "text-muted"}`}>{errorFor(name) ?? (name === "validForDays" ? c.daysHint : c.taxHint)}</p>
            </div>)}
          </div>
          <div className="grid min-w-0 gap-2"><label htmlFor={`${id}-deposit-type`} className="text-sm font-semibold">{c.depositType}</label>
            <select id={`${id}-deposit-type`} value={profile.deposit.type} className={estimateInput} onChange={(event) => {
              const type = event.target.value;
              if (type === "none") change({ deposit: { type } });
              else if (type === "percent" || type === "amount") change({ deposit: { type, value: "" } });
            }}>{(["none", "percent", "amount"] as const).map((type) => <option key={type} value={type}>{c.depositTypes[type]}</option>)}</select>
          </div>
          {profile.deposit.type !== "none" && <div className="grid min-w-0 gap-2">
            <label htmlFor={`${id}-deposit`} className="text-sm font-semibold">{profile.deposit.type === "percent" ? c.depositPercent : c.depositAmount}</label>
            <input id={`${id}-deposit`} name="deposit" inputMode="decimal" className={estimateInput} value={profile.deposit.value}
              aria-invalid={!!errorFor("deposit")} aria-describedby={`${id}-deposit-hint`} onChange={(event) => {
                if (profile.deposit.type !== "none") change({ deposit: { ...profile.deposit, value: event.target.value } });
              }} />
          </div>}
          <p id={`${id}-deposit-hint`} className={`m-0 text-sm leading-6 ${errorFor("deposit") ? "text-error" : "text-muted"}`}>{errorFor("deposit") ?? c.depositHint}</p>
          {profile.deposit.type === "amount" && <p className="m-0 text-sm leading-6 text-muted">{c.depositAmountHint}</p>}
        </fieldset>
        <fieldset disabled={locked} className={`${estimatePanel} m-0 grid min-w-0 gap-5`}>
          <legend className="sr-only">{c.presets}</legend>
          <h3 className="m-0 text-lg font-semibold">{c.presets}</h3><p className="m-0 text-sm leading-6 text-muted">{c.presetsHint}</p>
          {!profile.paymentPresets.length && <p className="m-0 text-sm text-muted">{c.noPresets}</p>}
          {profile.paymentPresets.map((preset, index) => <fieldset key={`${preset.id}-${index}`} className="m-0 grid min-w-0 gap-4 rounded-xl border border-line p-4">
            <legend className="px-1 text-sm font-semibold">{c.presetNumber(index)}</legend>
            {(["label", "text"] as const).map((name) => {
              const error = errorFor(`preset.${index}.${name}`), key = `preset.${index}.${name}`;
              return <div className="grid min-w-0 gap-2" key={name}>
                <label htmlFor={`${id}-${key}`} className="text-sm font-semibold">{name === "label" ? c.presetLabel : c.presetText}</label>
                {name === "label" ? <input id={`${id}-${key}`} name={key} className={estimateInput} value={preset.label} maxLength={limits.presetLabel}
                  aria-invalid={!!error} aria-describedby={`${id}-${key}-hint`} onChange={(event) => change({ paymentPresets: profile.paymentPresets.map((item, position) => position === index ? { ...item, label: event.target.value } : item) })} />
                  : <textarea id={`${id}-${key}`} name={key} rows={3} className={estimateInput} value={preset.text} maxLength={limits.presetText}
                    aria-invalid={!!error} aria-describedby={`${id}-${key}-hint`} onChange={(event) => change({ paymentPresets: profile.paymentPresets.map((item, position) => position === index ? { ...item, text: event.target.value } : item) })} />}
                <p id={`${id}-${key}-hint`} className={`m-0 text-sm leading-6 ${error ? "text-error" : "text-muted"}`}>{error ?? c.count(preset[name], name === "label" ? limits.presetLabel : limits.presetText)}</p>
              </div>;
            })}
            {editable && <button type="button" className={`${estimateButton} justify-self-start`} onClick={() => {
              if (locked) return;
              change({ paymentPresets: profile.paymentPresets.filter((_, position) => position !== index) });
              setAnnouncement(c.removedPreset(index)); addButton.current?.focus();
            }}>{c.removePreset(index)}</button>}
          </fieldset>)}
          {presetError && <FormFeedback kind="error" message={presetError} />}
          {editable && <button ref={addButton} type="button" className={`${estimateButton} justify-self-start`} disabled={busy || profile.paymentPresets.length >= limits.presetCount} onClick={() => {
            if (locked || profile.paymentPresets.length >= limits.presetCount) return;
            focusPreset.current = profile.paymentPresets.length;
            change({ paymentPresets: [...profile.paymentPresets, { id: crypto.randomUUID(), label: "", text: "" }] });
            setAnnouncement(c.addedPreset);
          }}>{c.addPreset}</button>}
          <p role="status" className="sr-only">{announcement}</p>
        </fieldset>
        <fieldset disabled={locked} className={`${estimatePanel} m-0 grid min-w-0 gap-5`}>
          <legend className="sr-only">{c.text}</legend><h3 className="m-0 text-lg font-semibold">{c.text}</h3>
          <p className="m-0 text-sm leading-6 text-muted">{c.textHint}</p>
          {field("message", 4)}{field("termsNote", 5)}
        </fieldset>
        <section aria-labelledby={`${id}-numbering`} className={`${estimatePanel} grid gap-4`}>
          <h3 id={`${id}-numbering`} className="m-0 text-lg font-semibold">{c.numbering}</h3>
          <dl className="m-0 grid min-w-0 gap-4 sm:grid-cols-2">{([
            [c.prefix, source.record.numberPrefix.trim() || c.unavailable],
            [c.nextNumber, Number.isSafeInteger(source.record.nextNumber) && source.record.nextNumber > 0 ? String(source.record.nextNumber) : c.unavailable],
            [c.timezone, timezone.trim() && createEstimateTimestampFormatter(timezone) ? timezone : c.timezoneMissing],
          ] as const).map(([label, text]) => <div key={label} className="min-w-0"><dt className="text-sm text-muted">{label}</dt><dd className="m-0 mt-1 text-sm font-semibold wrap-anywhere">{text}</dd></div>)}</dl>
          <p className="m-0 text-sm leading-6 text-muted">{c.numberingHint}</p>
        </section>
        {failure && <FormFeedback kind="error" message={failure} />}
        {reviewed && Object.keys(errors).length > 0 && <FormFeedback kind="error" message={c.defaultsInvalid} />}
        {saved && !review.dirty && !busy && !review.issues.length && <FormFeedback kind="success" message={c.saved} />}
        {editable && <footer className="grid min-w-0 gap-4">
          {(!onSave || !onDiscard) && <p className="m-0 text-sm text-muted">{!onSave ? c.unconnected : c.noDiscard}</p>}
          <p role="status" className="m-0 text-sm text-muted">{review.dirty ? c.dirty : c.unchanged}</p>
          <div className="flex flex-wrap gap-3">
            <button type="button" className={estimateButton} disabled={busy || !review.dirty || !onDiscard} onClick={() => {
              if (!locked && !flight.current) { setReviewed(false); setFailure(""); setLogoFailure(""); setAnnouncement(""); onDiscard?.(); }
            }}>{c.discard}</button>
            <button type="submit" className={estimatePrimary} disabled={busy || !review.dirty || !onSave}>{working === "save" || pending ? c.saving : c.save}</button>
          </div>
        </footer>}
      </form>}
  </section>;
}
