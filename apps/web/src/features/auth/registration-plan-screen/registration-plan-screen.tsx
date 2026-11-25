'use client';

import { useId, useRef, useState } from 'react';
import { workspacePlanIds, type WorkspacePlanId } from '@salesmora/contracts';
import { getWorkspacePlan } from '@salesmora/domain';
import { RegistrationForm, type RegistrationFormProps, type RegistrationResult } from '../registration-form/registration-form';
import type { RegistrationSubmission } from '../registration-form/registration-form.validation';
import { registrationScreenData as legal } from '../registration-screen/registration-screen.data';
import { PlanCard } from '../../public-site/plan-overview/plan-overview';
import { planOverviewData as plans } from '../../public-site/plan-overview/plan-overview.data';
import planStyles from '../../public-site/plan-overview/plan-overview.module.css';
import { registrationPlanScreenData as copy } from './registration-plan-screen.data';

export interface RegistrationPlanScreenProps {
  onSubmit: (values: RegistrationSubmission, plan: WorkspacePlanId) => Promise<RegistrationResult>;
  notice: string;
  initialPlan?: WorkspacePlanId;
  invalidInitialPlan?: boolean;
  initialStage?: 'plan' | 'account';
  layoutVariant?: 'standalone' | 'public';
}

/** Selected plan is purchase intent only; server billing verification grants entitlements. */
export function RegistrationPlanScreen({ onSubmit, notice, initialPlan = 'free', invalidInitialPlan = false, initialStage = 'plan', layoutVariant = 'standalone' }: RegistrationPlanScreenProps) {
  const id = useId();
  const [selected, setSelected] = useState<WorkspacePlanId>(initialPlan);
  const [stage, setStage] = useState<'plan' | 'account'>(initialStage);
  const [pending, setPending] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const plan = getWorkspacePlan(selected);
  const name = copy.names[selected];
  function navigate(next: 'plan' | 'account') {
    setStage(next);
    requestAnimationFrame(() => { heading.current?.focus(); heading.current?.scrollIntoView({ block: 'start' }); });
  }
  const submit: RegistrationFormProps['onSubmit'] = async values => {
    setPending(true);
    try {
      const result = await onSubmit(values, selected);
      if (!result.ok) setPending(false);
      return result;
    } catch (error) { setPending(false); throw error; }
  };
  return <div className={`${layoutVariant === 'public' ? '' : 'min-h-svh'} bg-canvas text-ink`}>
    <p className="m-0 border-b border-line bg-paper px-6 py-3 text-center text-xs text-muted">{notice}</p>
    <div className="mx-auto max-w-7xl px-6 py-8 sm:px-10">
      {layoutVariant === 'standalone' && <header className="mb-10 flex flex-wrap items-center justify-between gap-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={copy.logo} alt={copy.brand} width={540} height={144} className="h-auto w-brand-logo"/>
        <p className="text-sm text-muted">{copy.existing} <a href="/login" className="font-semibold text-primary underline underline-offset-4 focus-visible:focus-ring">{copy.signIn}</a></p>
      </header>}
      <main id={layoutVariant === 'public' ? 'main' : undefined} tabIndex={layoutVariant === 'public' ? -1 : undefined}>{stage === 'plan' ? <>
        <div className="mx-auto mb-10 max-w-3xl text-center"><h1 ref={heading} tabIndex={-1} className="text-display font-semibold focus-visible:focus-ring">{copy.headline}</h1><p className="mt-4 text-lg leading-relaxed text-muted">{copy.description}</p></div>
        {invalidInitialPlan && <p role="status" className="mb-4 text-sm text-muted">{copy.invalidPlan}</p>}
        <fieldset className="min-w-0"><legend className="mb-4 text-lg font-semibold">{copy.choose}</legend><div className={planStyles.grid}>{workspacePlanIds.map(key =>
          <PlanCard key={key} id={key} variant="selectable" radioName={`${id}-plan`} selected={selected === key} onSelect={() => setSelected(key)} />
        )}</div></fieldset>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-paper p-6"><p className="text-sm text-muted">{selected === 'free' ? copy.free : copy.paid}</p><button type="button" className="seafoam-action cursor-pointer rounded-xl px-6 py-3 text-sm font-semibold hover:bg-none hover:bg-seafoam-dark focus-visible:focus-ring" onClick={() => navigate('account')}>{copy.continue(name)}</button></div>
      </> : <section className="mx-auto max-w-2xl rounded-2xl border border-line bg-paper p-6 sm:p-10"><div className="mx-auto w-full max-w-form"><h1 ref={heading} tabIndex={-1} className="text-heading font-semibold focus-visible:focus-ring">{copy.accountTitle}</h1><p className="mb-6 mt-3 leading-relaxed text-muted">{copy.accountDescription}</p><div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-canvas p-4"><div><p className="text-xs font-semibold text-muted">{copy.summary}</p><p className="mt-1 font-semibold">{name} · {plans.price(plan.monthlyPriceCents)} {plans.monthly}</p></div><button type="button" disabled={pending} className="cursor-pointer font-semibold text-primary underline underline-offset-4 focus-visible:focus-ring disabled:cursor-not-allowed disabled:text-muted" onClick={() => navigate('plan')}>{copy.change}</button></div><p className="mb-6 text-sm leading-6 text-muted">{legal.legal.notice}</p><RegistrationForm onSubmit={submit} termsHref={legal.termsHref} privacyHref={legal.privacyHref} openDocumentsInNewTab successTitle={legal.successTitle} successMessage={legal.successMessage} submitLabel={selected === 'free' ? copy.createFree : copy.createPaid}/><p className="mt-4 text-sm leading-relaxed text-muted">{selected === 'free' ? copy.free : copy.paid}</p></div></section>}</main>
    </div>
  </div>;
}
