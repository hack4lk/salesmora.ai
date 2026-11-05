'use client';
import { useState } from 'react';
import { capturePublicViewSchema, captureSubmissionResponseSchema, type CapturePublicView } from '@salesmora/contracts';
import { VisitorCaptureForm, type VisitorCaptureProtection, type VisitorCaptureResult } from '../visitor-capture-form/visitor-capture-form';
import type { VisitorCaptureValues, VisitorCaptureSubmission } from '../visitor-capture-form/visitor-capture-form.validation';
import { publicCapturePageData as copy } from './public-capture-page.data';
import { CaptureEmbedResize } from './embed-resize';
import { TurnstileCheck } from './turnstile-check';
export function PublicCapturePage({ source, embedded = false }: { source: CapturePublicView; embedded?: boolean }) {
  return <PublicCaptureSession key={source.state === 'ready' ? source.context : source.state} initial={source} embedded={embedded} />;
}
function PublicCaptureSession({ initial, embedded }: { initial: CapturePublicView; embedded: boolean }) {
  const [source, setSource] = useState(initial), [protection, setProtection] = useState<VisitorCaptureProtection>(), [challenge, setChallenge] = useState<{ siteKey: string; cData: string }>(), [reset, setReset] = useState(0), [stale, setStale] = useState(false), [refreshing, setRefreshing] = useState(false), [notice, setNotice] = useState('');
  const [value, setValue] = useState<VisitorCaptureValues>({ answers: {}, website: '', consent: false });
  async function submit(input: VisitorCaptureSubmission): Promise<VisitorCaptureResult> {
    if (source.state !== 'ready' || !source.submissionAvailable) return { ok: false, unavailable: true };
    const response = await fetch(`/api/public/capture/${source.definition.publicKey}`, { method: 'POST', credentials: 'omit', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ context: source.context, requestId: input.idempotencyKey, answers: input.answers, consent: input.consent, website: input.website, ...(input.challengeToken ? { challengeToken: input.challengeToken } : {}) }) });
    const result = captureSubmissionResponseSchema.parse(await response.json());
    if (result.state === 'accepted') { if (!response.ok || result.requestId !== input.idempotencyKey) throw Error(copy.conflict); return { ok: true }; }
    if (result.state === 'challenge-required') { setChallenge({ siteKey: result.siteKey, cData: result.cData }); setProtection({ kind: 'challenge', status: 'required' }); return { ok: false, uncertain: true, message: copy.challenge }; }
    if (result.state === 'challenge-error') { setProtection({ kind: 'challenge', status: 'expired' }); return { ok: false, uncertain: true, message: copy.challengeError }; }
    if (result.state === 'rate-limited') { setProtection({ kind: 'rate-limited', retryAt: result.retryAt }); return { ok: false, uncertain: true, message: copy.rateLimited }; }
    if (result.state === 'stale') { setStale(true); return { ok: false, message: copy.stale }; }
    if (result.state === 'invalid') return { ok: false, message: copy.invalid };
    if (result.state === 'unavailable') return { ok: false, unavailable: true };
    return { ok: false, uncertain: true, message: copy.conflict };
  }
  async function refresh() {
    if (source.state !== 'ready' || refreshing) return; setRefreshing(true); setNotice('');
    try {
      const response = await fetch(`/api/public/capture/${source.definition.publicKey}`, { cache: 'no-store', credentials: 'omit' });
      const next = capturePublicViewSchema.parse(await response.json()); if (!response.ok || next.state !== 'ready' || next.definition.publicKey !== source.definition.publicKey) throw Error(copy.refreshFailed);
      const consent = next.definition.content.consent, previous = source.definition.content.consent;
      setValue(current => ({ ...current, answers: Object.fromEntries(next.definition.fields.filter(field => Object.hasOwn(current.answers, field.id)).map(field => [field.id, current.answers[field.id]])), consent: next.definition.version === source.definition.version && consent?.id === previous?.id && consent?.version === previous?.version && consent?.label === previous?.label ? current.consent : false }));
      setSource(next); setProtection(undefined); setChallenge(undefined); setStale(false); setNotice(copy.refreshed);
    } catch { setNotice(copy.refreshFailed); } finally { setRefreshing(false); }
  }
  const container = `min-w-0 bg-canvas text-ink ${embedded ? 'p-3' : 'min-h-screen p-4 sm:p-8'}`;
  if (source.state === 'not-found' || source.state === 'error') return <main className={container}>{embedded && <CaptureEmbedResize />}<section className="mx-auto grid max-w-2xl gap-4 rounded-2xl border border-line bg-paper p-6 sm:p-8"><h1 className="m-0 text-heading font-semibold">{source.state === 'not-found' ? copy.missingTitle : copy.errorTitle}</h1><p role="status" className="m-0 leading-6 text-muted">{source.state === 'not-found' ? copy.missing : copy.error}</p></section></main>;
  const content = source.state === 'ready' ? source.definition.content : source.content;
  const definition = { id: source.state === 'ready' ? source.definition.publicKey : 'unavailable', version: source.state === 'ready' ? source.definition.version : 1,
    ...content, fields: source.state === 'ready' ? source.definition.fields : [], contactRequired: true,
    privacy: source.state === 'ready' ? source.definition.content.privacy ?? undefined : undefined, consent: source.state === 'ready' ? source.definition.content.consent ?? undefined : undefined };
  return <main className={container}>{embedded && <CaptureEmbedResize />}{(stale || notice) && <div className="mx-auto mb-5 grid max-w-2xl gap-3 rounded-xl border border-line bg-paper p-4"><p role="status" className="m-0 text-sm leading-6 text-muted">{notice || copy.stale}</p>{stale && <button type="button" disabled={refreshing} onClick={() => { void refresh(); }} className="min-h-11 justify-self-start rounded-xl border border-line px-4 text-sm font-semibold text-primary focus-visible:focus-ring">{refreshing ? copy.refreshing : copy.refresh}</button>}</div>}
    <VisitorCaptureForm key={source.state === 'ready' ? source.context : source.state} definition={definition} value={value} onChange={setValue} availability={source.state === 'ready' ? 'active' : 'blocked'} compact={embedded} submissionAvailable={source.state === 'ready' && source.submissionAvailable} interactionLocked={stale || refreshing} onSubmit={submit} protection={protection}
      onRetryChallenge={() => { setReset(current => current + 1); setProtection({ kind: 'challenge', status: 'required' }); }}
      challengeContent={challenge ? <TurnstileCheck key={`${challenge.cData}:${reset}`} siteKey={challenge.siteKey} cData={challenge.cData} onVerified={token => setProtection({ kind: 'challenge', status: 'verified', token })} onExpired={() => setProtection({ kind: 'challenge', status: 'expired' })} onError={() => setProtection({ kind: 'challenge', status: 'error' })} /> : undefined} />
  </main>;
}
