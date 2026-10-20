'use client';
import { useEffect, useRef, useState } from 'react';
import { workspaceSchema, type WorkspaceInput } from '@salesmora/contracts';
import { BusinessProfileStep, type BusinessProfileValues } from '../business-profile-step/business-profile-step';
import { ServicesAreaStep, type ServicesAreaValues } from '../services-area-step/services-area-step';
import { TeamStep, type TeamValues } from '../team-step/team-step';
import { ReviewStep, type ReviewSection } from '../review-step/review-step';
import { onboardingFlowData as copy } from './onboarding-flow.data';
export interface OnboardingFlowProps { teammateLimit?: number; ownerEmail: string; onCreate: (input: WorkspaceInput) => Promise<{ ok: boolean; status?: number }>; onCreated: () => void }
export function OnboardingFlow({ ownerEmail, onCreate, onCreated, teammateLimit }: OnboardingFlowProps) {
  const [business, setBusiness] = useState<BusinessProfileValues>({ businessName: '', businessType: '' });
  const [services, setServices] = useState<ServicesAreaValues>({ services: [], postalCode: '', serviceRange: '' });
  const [team, setTeam] = useState<TeamValues>({ invitations: [] });
  const [skipped, setSkipped] = useState(false);
  const [step, setStep] = useState<ReviewSection | 'review'>('business');
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const locked = useRef(false);
  const content = useRef<HTMLDivElement>(null);
  useEffect(() => { content.current?.querySelector<HTMLHeadingElement>('h2')?.focus(); }, [step]);
  function advance(next: 'services' | 'team') { setStep(editing ? 'review' : next); setEditing(false); setError(undefined); }
  function edit(section: ReviewSection) { setEditing(true); setStep(section); setError(undefined); }
  async function create() {
    if (locked.current) return;
    const input = workspaceSchema.safeParse({ business, services, team: { invitations: skipped ? [] : team.invitations.map(({ email, role }) => ({ email, role })) } });
    if (teammateLimit !== undefined && input.success && input.data.team.invitations.length + 1 > teammateLimit) { setError(copy.invalid); return; }
    if (!input.success) { setError(copy.invalid); return; }
    locked.current = true; setPending(true); setError(undefined);
    try {
      const response = await onCreate(input.data);
      if (!response.ok) { setError(response.status === 401 ? copy.expired : response.status === 422 ? copy.invalid : copy.error); locked.current = false; setPending(false); return; }
      onCreated();
    } catch { setError(copy.error); locked.current = false; setPending(false); }
  }
  return <div ref={content}>
    {step === 'business' ? <BusinessProfileStep values={business} onChange={setBusiness} onContinue={next => { setBusiness(next); advance('services'); }} /> : step === 'services' ? <ServicesAreaStep values={services} onChange={setServices} onBack={() => setStep('business')} onContinue={next => { setServices(next); advance('team'); }} /> : step === 'team' ? <TeamStep teammateLimit={teammateLimit} ownerEmail={ownerEmail} values={team} onChange={setTeam} onBack={() => setStep('services')} onContinue={next => { setTeam(next); setSkipped(false); setEditing(false); setStep('review'); }} onSkip={() => { setSkipped(true); setEditing(false); setStep('review'); }} /> : <ReviewStep business={business} services={services} team={skipped ? { invitations: [] } : team} ownerEmail={ownerEmail} onEdit={edit} onBack={() => { setError(undefined); setStep('team'); }} onCreate={create} pending={pending} error={error} />}
  </div>;
}
