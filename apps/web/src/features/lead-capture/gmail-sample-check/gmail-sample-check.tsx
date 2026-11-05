import { useId } from 'react';
import { FormFeedback, StatusBadge } from '@salesmora/ui';
import type { GmailCaptureRulesValue } from '../gmail-capture-rules/gmail-capture-rules.validation';
import { gmailCaptureRulesData } from '../gmail-capture-rules/gmail-capture-rules.data';
import { checkGmailSample } from './gmail-sample-check.validation';
import { gmailSampleCheckData as copy } from './gmail-sample-check.data';

export type GmailSampleCheckProps = { rules: GmailCaptureRulesValue; sample: { subject: string; body: string } | null; canRead: boolean };
export function GmailSampleCheck({ rules, sample, canRead }: GmailSampleCheckProps) {
  const id = useId();
  if (!canRead) return <FormFeedback kind="error" message={copy.denied} />;
  const result = checkGmailSample(rules, sample);
  const ready = result.status === 'matches' || result.status === 'noMatch';
  return <section aria-labelledby={id} className="grid min-w-0 gap-3 rounded-2xl border border-line bg-paper p-4 sm:p-6">
    <header className="flex flex-wrap items-center justify-between gap-3"><h3 id={id} className="m-0 text-base font-semibold">{copy.title}</h3><StatusBadge label={ready ? copy[result.status as 'matches' | 'noMatch'] : copy.incomplete} tone={result.status === 'matches' ? 'success' : 'warning'} /></header>
    {ready ? <>
      <p className="m-0 text-sm leading-6 text-muted">{gmailCaptureRulesData.summaryStart(gmailCaptureRulesData.summaryModes[rules.mode], gmailCaptureRulesData.summaryLocations[rules.location])}</p>
      <ul role="list" className="m-0 flex min-w-0 list-none flex-wrap gap-3 p-0">{result.phrases.map(phrase => <li key={phrase.id} className="flex min-w-0 flex-wrap items-center gap-3 rounded-xl border border-line bg-canvas p-3"><span className="min-w-0 text-sm font-semibold wrap-anywhere">{phrase.text.trim()}</span><span className={`text-xs font-semibold ${phrase.location === 'none' ? 'text-muted' : 'text-primary-dark'}`}>{copy.found[phrase.location]}</span></li>)}</ul>
      {result.status === 'noMatch' && <p className="m-0 text-sm leading-6 text-muted">{copy.mismatch}</p>}
    </> : <p className="m-0 text-sm leading-6 text-muted">{copy[result.status as 'missing' | 'invalid']}</p>}
  </section>;
}
