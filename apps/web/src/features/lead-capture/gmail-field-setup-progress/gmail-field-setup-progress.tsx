'use client';

import { gmailFieldSetupProgressData as copy } from './gmail-field-setup-progress.data';

/** The host decides which steps are available for the current draft. */
export function GmailFieldSetupProgress({ step, onBack, onReviewFindings, pending = false }: { step: 'example' | 'findings'; onBack?: () => void; onReviewFindings?: () => void; pending?: boolean }) {
  const currentIndex = step === 'example' ? 0 : 1;
  return <nav aria-label={copy.label}>
    <ol className="m-0 flex min-w-0 list-none gap-3 p-0">
      {copy.steps.map((label, index) => {
        const onSelect = index < currentIndex ? onBack : index > currentIndex ? onReviewFindings : undefined;
        const content = <><span aria-hidden="true" className={`grid size-8 shrink-0 place-items-center rounded-full border sm:size-9 ${index === currentIndex ? 'border-primary bg-primary text-paper' : index < currentIndex ? 'border-primary bg-canvas text-primary-dark' : 'border-line bg-paper text-muted'}`}>{index + 1}</span><span className="wrap-anywhere">{label}</span></>;
        const layout = 'flex min-h-11 w-full min-w-0 flex-col items-center justify-center gap-2 text-center text-xs font-semibold sm:flex-row sm:text-sm';
        return <li key={label} aria-current={index === currentIndex ? 'step' : undefined}
        className={`flex min-w-0 flex-1 flex-col border-b-2 pb-3 ${index <= currentIndex ? 'border-primary text-primary-dark' : 'border-line text-muted'}`}>
        {onSelect ? <button type="button" disabled={pending} onClick={onSelect} className={`${layout} rounded-lg focus-visible:focus-ring enabled:cursor-pointer enabled:hover:bg-canvas disabled:cursor-default`}>{content}</button> : <div className={layout}>{content}</div>}
        {index !== currentIndex && <span className="sr-only">{index < currentIndex || onSelect ? copy.completed : copy.upcoming}</span>}
      </li>;
      })}
    </ol>
  </nav>;
}
