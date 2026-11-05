'use client';

import { useId, useRef, useState } from 'react';
import { FormFeedback, StatusBadge } from '@salesmora/ui';
import { capturePublicationInstructionsData as copy } from './capture-publication-instructions.data';
import { validCapturePublication, type CaptureEmbedMethod, type CapturePublication } from './capture-publication-instructions.validation';

export type CapturePublicationInstructionsProps = {
  publication: CapturePublication | null; canRead: boolean; pending?: boolean;
  /** Defaults to the browser clipboard; stories inject a mock. Reject on failure. */
  onCopy?: (text: string) => Promise<void>;
};
const button = 'min-h-11 max-w-full cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary wrap-anywhere focus-visible:focus-ring enabled:hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-50';
const field = 'w-full min-w-0 rounded-xl border border-line bg-canvas p-3 text-sm leading-6 text-ink focus-visible:focus-ring';
const browserCopy = (text: string) => navigator.clipboard.writeText(text);
export function CapturePublicationInstructions({ publication, canRead, pending = false, onCopy = browserCopy }: CapturePublicationInstructionsProps) {
  const id = useId(), lock = useRef(false);
  const [method, setMethod] = useState<CaptureEmbedMethod>('iframe'), [platform, setPlatform] = useState<'website' | 'wordpress'>('website');
  const [working, setWorking] = useState<'link' | 'code' | null>(null);
  const [feedback, setFeedback] = useState<{ signature: string; kind: 'link' | 'code' | 'error' } | null>(null);
  if (!canRead) return <FormFeedback kind="error" message={copy.denied} />;
  if (!publication) return <p className="m-0 rounded-2xl border border-line bg-paper p-4 text-sm leading-6 text-muted sm:p-6">{copy.draft}</p>;
  if (!validCapturePublication(publication)) return <FormFeedback kind="error" message={copy.invalid} />;
  const embed = publication.embeds.find(item => item.method === method) ?? publication.embeds[0];
  const signature = JSON.stringify([publication, embed.method]);
  const disabled = pending || !!working;
  const write = async (kind: 'link' | 'code') => {
    if (disabled || lock.current) return;
    lock.current = true; setWorking(kind); setFeedback(null);
    try { await onCopy(kind === 'link' ? publication.hostedUrl : embed.code); setFeedback({ signature, kind }); }
    catch { setFeedback({ signature, kind: 'error' }); }
    finally { lock.current = false; setWorking(null); }
  };
  return <section className="grid min-w-0 gap-6 text-ink">
    <header><h2 className="m-0 text-xl font-semibold">{copy.title}</h2><p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.description}</p><p className="mb-0 mt-3 text-base font-semibold wrap-anywhere">{publication.name}</p></header>
    <section aria-labelledby={`${id}-availability`} className="grid min-w-0 gap-3 rounded-2xl border border-line bg-paper p-4 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3"><h3 id={`${id}-availability`} className="m-0 text-base font-semibold">{copy.availability}</h3><StatusBadge label={copy.statuses[publication.status]} tone={publication.status === 'active' ? 'success' : publication.status === 'scheduled' ? 'info' : 'warning'} /></header>
      <p className="m-0 text-sm leading-6 text-muted">{copy.statusHelp[publication.status]}</p>
      {publication.status === 'scheduled' && <p className="m-0 text-sm font-semibold text-primary-dark"><time dateTime={publication.scheduledAt}>{new Intl.DateTimeFormat('en-US', { timeZone: publication.timezone, dateStyle: 'full', timeStyle: 'short' }).format(new Date(publication.scheduledAt!))}</time><span className="block text-xs text-muted">{publication.timezone}</span></p>}
    </section>
    <div className="grid min-w-0 items-start gap-6 lg:grid-cols-2">
      <section aria-labelledby={`${id}-share`} className="grid min-w-0 gap-5 rounded-2xl border border-line bg-paper p-4 sm:p-6">
        <h3 id={`${id}-share`} className="m-0 text-base font-semibold">{copy.url}</h3>
        <label className="grid min-w-0 gap-2 text-sm font-semibold"><span className="sr-only">{copy.url}</span><input readOnly value={publication.hostedUrl} className={field} onFocus={event => event.target.select()} onClick={event => event.currentTarget.select()} /></label>
        <div className="flex flex-wrap gap-3"><button type="button" disabled={disabled} className={button} onClick={() => { void write('link'); }}>{working === 'link' ? copy.copying : copy.copyLink}</button>{!disabled && <a className={`${button} inline-flex items-center no-underline`} href={publication.hostedUrl} target="_blank" rel="noopener noreferrer">{copy.open}</a>}</div>
        <fieldset disabled={disabled} className="m-0 flex min-w-0 flex-wrap gap-3 border-0 p-0"><legend className="mb-3 text-sm font-semibold">{copy.method}</legend>{publication.embeds.map(item => <label key={item.method} className={`flex min-h-11 items-center gap-3 rounded-xl border px-3 py-2 text-sm font-semibold ${embed.method === item.method ? 'border-primary bg-primary/10 text-primary-dark' : 'border-line'}`}><input type="radio" name={`${id}-method`} checked={embed.method === item.method} className="size-5 accent-primary focus-visible:focus-ring" onChange={() => { if (!disabled) setMethod(item.method); }} />{copy.methods[item.method]}</label>)}</fieldset>
        <label className="grid min-w-0 gap-2 text-sm font-semibold">{copy.code}<textarea readOnly value={embed.code} rows={7} spellCheck={false} className={`${field} resize-y font-mono`} onFocus={event => event.target.select()} onClick={event => event.currentTarget.select()} /></label>
        <button type="button" disabled={disabled} className={`${button} justify-self-start`} onClick={() => { void write('code'); }}>{working === 'code' ? copy.copying : copy.copyCode}</button>
        <div role="status" aria-live="polite">{feedback?.signature === signature && <p className={`m-0 text-sm leading-6 ${feedback.kind === 'error' ? 'text-error' : 'text-primary-dark'}`}>{feedback.kind === 'error' ? copy.copyFailed : feedback.kind === 'link' ? copy.copiedLink : copy.copiedCode}</p>}</div>
      </section>
      <section aria-labelledby={`${id}-install`} className="grid min-w-0 gap-4 rounded-2xl border border-line bg-paper p-4 sm:p-6">
        <h3 id={`${id}-install`} className="m-0 text-base font-semibold">{copy.instructions}</h3>
        <fieldset className="m-0 flex min-w-0 flex-wrap gap-3 border-0 p-0"><legend className="mb-3 text-sm font-semibold">{copy.platform}</legend>{(['website', 'wordpress'] as const).map(key => <label key={key} className={`flex min-h-11 items-center gap-3 rounded-xl border px-3 py-2 text-sm font-semibold ${platform === key ? 'border-primary bg-primary/10 text-primary-dark' : 'border-line'}`}><input type="radio" name={`${id}-platform`} checked={platform === key} className="size-5 accent-primary focus-visible:focus-ring" onChange={() => setPlatform(key)} />{copy.platforms[key]}</label>)}</fieldset>
        <ol className="m-0 grid list-decimal gap-3 pl-5 text-sm leading-6">{(platform === 'wordpress' ? copy.wordpressSteps : copy.websiteSteps).map(step => <li key={step}>{step}</li>)}</ol>
        {embed.method === 'javascript' && <p className="m-0 text-sm leading-6 text-muted">{copy.scriptHint}</p>}
        <p className="m-0 text-sm leading-6 text-muted">{copy.sameForm}</p><p className="m-0 text-sm leading-6 text-muted">{copy.test}</p>
      </section>
    </div>
  </section>;
}
