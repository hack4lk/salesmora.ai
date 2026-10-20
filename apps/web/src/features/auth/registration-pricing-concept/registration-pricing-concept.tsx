'use client';

import { useId, useState } from 'react';
import { RegistrationForm, type RegistrationFormProps } from '../registration-form/registration-form';
import { registrationPricingConceptData as copy, type PreviewPlanId } from './registration-pricing-concept.data';

type Variant = 'compare-first' | 'split-view' | 'guided';
export interface RegistrationPricingConceptProps {
  variant: Variant;
  initialPlan?: PreviewPlanId;
  onSubmit: RegistrationFormProps['onSubmit'];
  onPlanChange?: (plan: PreviewPlanId) => void;
}

/** Local design workbench only. The live registration route is unchanged. */
export function RegistrationPricingConcept({ variant, initialPlan = 'free', onSubmit, onPlanChange }: RegistrationPricingConceptProps) {
  const id = useId();
  const [selected, setSelected] = useState<PreviewPlanId>(initialPlan);
  const [step, setStep] = useState<'account' | 'plan' | 'review'>(variant === 'guided' ? 'account' : 'plan');
  const [complete, setComplete] = useState(false);
  const plan = copy.plans.find(item => item.id === selected)!;
  const paid = selected !== 'free';
  const button = 'cursor-pointer rounded-xl bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark focus-visible:focus-ring';
  const secondary = 'cursor-pointer rounded-xl border border-line bg-paper px-4 py-3 font-semibold text-primary hover:bg-canvas focus-visible:focus-ring';

  function options(compact = false) {
    return <fieldset className="min-w-0">
      <legend className="mb-4 text-lg font-semibold">{copy.choose}</legend>
      <div className={compact ? 'grid gap-4' : 'grid gap-4 md:grid-cols-3'}>
        {copy.plans.map(item => <label key={item.id} className={`relative cursor-pointer rounded-2xl border-2 p-5 transition-colors focus-within:focus-ring ${selected === item.id ? 'border-primary bg-canvas' : 'border-line bg-paper hover:border-primary'}`}>
          <div className="flex items-start justify-between gap-4">
            <div><span className="text-lg font-semibold">{item.name}</span><p className="mt-1 text-sm text-muted">{item.audience}</p></div>
            {compact && <p className="flex shrink-0 items-baseline gap-1"><strong className="text-2xl font-semibold">{item.price}</strong><span className="text-xs text-muted">{copy.monthly}</span></p>}
            <input type="radio" name={`${id}-plan`} aria-label={item.name} aria-describedby={`${id}-${item.id}-benefits`} value={item.id} checked={selected === item.id} onChange={() => { setSelected(item.id); onPlanChange?.(item.id); }} className="mt-1 size-5 shrink-0 accent-primary" />
          </div>
          {!compact && <p className="mt-4 flex flex-wrap items-baseline gap-2"><strong className="text-3xl font-semibold">{item.price}</strong><span className="text-sm text-muted">{copy.monthly}</span></p>}
          <ul id={`${id}-${item.id}-benefits`} className={compact ? 'mt-4 grid gap-2 text-sm text-muted sm:grid-cols-2' : 'mt-5 grid gap-3 text-sm text-muted'}>
            {[item.seats, item.tokens, item.storage].map(feature => <li key={feature}>{feature}</li>)}
            {!compact && <><li>{item.leads}</li><li>{item.campaigns}</li></>}
          </ul>
          {compact && <p className="mt-3 text-xs text-muted">{item.leads} · {item.campaigns}</p>}
        </label>)}
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted">{copy.planned}</p>
    </fieldset>;
  }

  function summary() {
    return <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-canvas p-4" aria-live="polite">
      <div><p className="text-xs font-semibold text-muted">{copy.summary}</p><p className="mt-1 font-semibold">{plan.name} · {plan.price} {copy.monthly}</p></div>
      {variant !== 'split-view' && <button type="button" className="cursor-pointer font-semibold text-primary underline underline-offset-4 focus-visible:focus-ring" onClick={() => setStep('plan')}>{copy.change}</button>}
    </div>;
  }

  function account() {
    const Heading = variant === 'compare-first' ? 'h1' : 'h2';
    return <section className="mx-auto w-full max-w-form" aria-labelledby={`${id}-account`}>
      <Heading id={`${id}-account`} className="text-heading font-semibold">{copy.accountTitle}</Heading>
      <p className="mt-3 mb-6 leading-relaxed text-muted">{copy.accountDescription}</p>
      {variant !== 'guided' && summary()}
      <RegistrationForm onSubmit={async values => {
        const result = await onSubmit(values);
        if (result.ok && variant === 'guided') setStep('plan');
        return result;
      }} termsHref="#terms-preview" privacyHref="#privacy-preview" submitLabel={variant === 'guided' ? copy.accountNext : paid ? copy.createPaid : copy.createFree} successTitle={copy.successTitle} successMessage={copy.success} />
      <p className="mt-4 text-sm leading-relaxed text-muted">{paid ? copy.payment : copy.freePayment}</p>
    </section>;
  }

  return <div className="min-h-svh bg-canvas text-ink">
    <div className="border-b border-line bg-paper px-6 py-3 text-center text-xs text-muted">{copy.preview}</div>
    <div className="mx-auto max-w-7xl px-6 py-8 sm:px-10">
      <header className="mb-10 flex flex-wrap items-center justify-between gap-6">
        {/* Reuse the approved brand asset with its intrinsic proportions. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={copy.logo} alt={copy.brand} width={540} height={144} className="h-auto w-brand-logo" />
        <p className="text-sm text-muted">{copy.existing} <a href="/login" className="font-semibold text-primary underline underline-offset-4 focus-visible:focus-ring">{copy.signIn}</a></p>
      </header>
      {variant === 'split-view' ? <main>
        <div className="mb-8 max-w-3xl"><h1 className="text-heading-lg sm:text-display font-semibold">{copy.headline}</h1><p className="mt-4 text-lg leading-relaxed text-muted">{copy.description}</p></div>
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-16">
          <section aria-label={copy.choose}>{options(true)}</section>
          <div className="rounded-2xl border border-line bg-paper p-6 sm:p-8">{account()}</div>
        </div>
      </main> : variant === 'compare-first' ? <main>
        {step === 'plan' ? <>
          <div className="mx-auto mb-10 max-w-3xl text-center"><h1 className="text-display font-semibold">{copy.headline}</h1><p className="mt-4 text-lg leading-relaxed text-muted">{copy.description}</p></div>
          {options()}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-paper p-6"><p className="text-sm text-muted">{paid ? copy.payment : copy.freePayment}</p><button type="button" className={button} onClick={() => setStep('account')}>{copy.continue} {plan.name}</button></div>
        </> : <div className="mx-auto max-w-2xl rounded-2xl border border-line bg-paper p-6 sm:p-10">{account()}</div>}
      </main> : <main className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
        <aside className="max-w-brand"><h1 className="text-display font-semibold">{copy.nextHeading}</h1><p className="mt-5 text-lg leading-relaxed text-muted">{copy.nextDescription}</p>
          <ol className="mt-8 grid gap-4" aria-label={copy.review}>
            {copy.steps.map((label, index) => <li key={label} className={`flex items-center gap-3 ${['account', 'plan', 'review'][index] === step ? 'font-semibold text-primary' : 'text-muted'}`}><span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line bg-paper">{index + 1}</span>{label}</li>)}
          </ol>
        </aside>
        <div className="rounded-2xl border border-line bg-paper p-6 sm:p-8">
          {step === 'account' ? account() : step === 'plan' ? <>{options(true)}<button type="button" className={`${button} mt-6 w-full`} onClick={() => setStep('review')}>{copy.review}</button><button type="button" className={`${secondary} mt-3 w-full`} onClick={() => setStep('account')}>{copy.steps[0]}</button></> : <>
            <h2 className="mb-3 text-heading font-semibold">{copy.review}</h2><p className="mb-6 leading-relaxed text-muted">{copy.reviewDescription}</p>{summary()}<ul className="mb-6 grid gap-3 text-muted">{[plan.seats, plan.tokens, plan.storage].map(feature => <li key={feature}>{feature}</li>)}</ul><p className="mb-6 text-sm text-muted">{paid ? copy.payment : copy.freePayment}</p><button type="button" className={`${button} w-full`} onClick={() => setComplete(true)}>{copy.reviewButton}</button>{complete && <p role="status" className="mt-4 rounded-xl bg-canvas p-4 text-success">{copy.reviewDone}</p>}
          </>}
        </div>
      </main>}
      <footer className="mt-10 flex flex-wrap justify-center gap-6 border-t border-line py-6 text-sm text-muted"><a id="terms-preview" href="#terms-preview" className="underline focus-visible:focus-ring">{copy.terms}</a><a id="privacy-preview" href="#privacy-preview" className="underline focus-visible:focus-ring">{copy.privacy}</a></footer>
    </div>
  </div>;
}
