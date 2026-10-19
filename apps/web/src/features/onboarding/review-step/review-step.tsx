'use client';
import { useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import Button from '@mui/material/Button';
import { FormFeedback } from '@salesmora/ui';
import { OnboardingStepFrame } from '../onboarding-step-frame/onboarding-step-frame';
import { businessProfileStepData as businessCopy } from '../business-profile-step/business-profile-step.data';
import { validateBusinessProfile, type BusinessProfileValues } from '../business-profile-step/business-profile-step.validation';
import { servicesAreaStepData as servicesCopy } from '../services-area-step/services-area-step.data';
import { validateServicesArea, type ServicesAreaValues } from '../services-area-step/services-area-step.validation';
import { teamStepData as teamCopy } from '../team-step/team-step.data';
import { validateTeam, type TeamValues } from '../team-step/team-step.validation';
import { reviewStepData as copy } from './review-step.data';
export type ReviewSection = 'business' | 'services' | 'team';
export interface ReviewStepProps {
  business: BusinessProfileValues; services: ServicesAreaValues; team: TeamValues; ownerEmail: string;
  onEdit: (section: ReviewSection) => void; onBack: () => void; onCreate: () => void;
  pending?: boolean; error?: string;
}
/** Read-only review of the parent-owned draft; persistence stays with the parent. */
export function ReviewStep({ business, services, team, ownerEmail, onEdit, onBack, onCreate, pending = false, error }: ReviewStepProps) {
  const id = useId();
  const editButtons = useRef(new Map<ReviewSection, HTMLButtonElement>());
  const [attempted, setAttempted] = useState(false);
  const invalid = {
    business: Object.keys(validateBusinessProfile(business)).length > 0,
    services: Object.keys(validateServicesArea(services)).length > 0,
    team: Object.keys(validateTeam(team, ownerEmail)).length > 0,
  };
  const incomplete = Object.values(invalid).some(Boolean);
  const selected = servicesCopy.serviceOptions.filter(option => services.services.includes(option.value));
  function create() {
    if (pending) return;
    setAttempted(true);
    for (const section of ['business', 'services', 'team'] as const) {
      if (invalid[section]) { editButtons.current.get(section)?.focus(); return; }
    }
    onCreate();
  }
  function section(key: ReviewSection, children: ReactNode) {
    return <section aria-labelledby={`${id}-${key}`} className="min-w-0 rounded-xl border border-line p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 id={`${id}-${key}`} className="m-0 text-base font-semibold text-ink">{copy.sections[key]}</h3>
        <Button ref={node => { if (node) editButtons.current.set(key, node); else editButtons.current.delete(key); }} type="button" disabled={pending} onClick={() => onEdit(key)} className="min-h-11 rounded-lg px-2 text-sm font-semibold normal-case text-primary hover:bg-canvas focus-visible:focus-ring">{copy.edit[key]}</Button>
      </div>
      {attempted && invalid[key] && <p className="mb-3 mt-0 text-sm font-semibold text-error">{copy.needsAttention}</p>}
      {children}
    </section>;
  }
  function detail(label: string, value: string) {
    return <div className="min-w-0"><dt className="text-muted">{label}</dt><dd className="m-0 mt-1 font-semibold text-ink wrap-anywhere">{value || copy.notProvided}</dd></div>;
  }
  return <OnboardingStepFrame activeStep="review" onContinue={create} onBack={onBack} pending={pending}>
    <div className="grid min-w-0 gap-4">
      {error && <FormFeedback kind="error" title={copy.createErrorTitle} message={error} />}
      {attempted && incomplete && <FormFeedback kind="error" message={copy.incomplete} />}
      {section('business', <dl className="m-0 grid gap-4 text-sm leading-6">
        {detail(copy.businessName, business.businessName.trim())}
        {detail(copy.businessType, businessCopy.types.find(option => option.value === business.businessType)?.label ?? '')}
      </dl>)}
      {section('services', <div className="grid gap-4 text-sm leading-6">
        <div><p className="mb-2 mt-0 text-muted">{copy.services}</p>{selected.length ? <ul aria-label={copy.services} className="m-0 flex list-none flex-wrap gap-2 p-0">{selected.map(option => <li key={option.value} className="max-w-full rounded-full border border-line bg-canvas px-3 py-1 text-ink wrap-anywhere">{option.label}</li>)}</ul> : <p className="m-0 text-muted">{copy.notProvided}</p>}</div>
        <dl className="m-0 grid gap-4 sm:grid-cols-2">
          {detail(copy.postalCode, services.postalCode.trim())}
          {detail(copy.range, servicesCopy.ranges.find(option => option.value === services.serviceRange)?.label ?? '')}
        </dl>
      </div>)}
      {section('team', <div className="grid min-w-0 gap-4 text-sm leading-6">
        <dl className="m-0">{detail(copy.owner, ownerEmail)}</dl>
        {team.invitations.length ? <ul aria-label={copy.invitations} className="m-0 grid list-none gap-3 p-0">{team.invitations.map(invite => <li key={invite.id} className="min-w-0 rounded-lg bg-canvas p-3"><p className="m-0 font-semibold text-ink wrap-anywhere">{invite.email.trim().toLowerCase()}</p><dl className="mb-0 mt-2 grid gap-2 sm:grid-cols-2">{detail(teamCopy.role, teamCopy.roles.find(option => option.value === invite.role)?.label ?? '')}</dl></li>)}</ul> : <p className="m-0 text-muted">{copy.noInvitations}</p>}
        <p className="m-0 text-muted">{copy.delivery}</p>
      </div>)}
      <p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.confirmation}</p>
    </div>
  </OnboardingStepFrame>;
}
