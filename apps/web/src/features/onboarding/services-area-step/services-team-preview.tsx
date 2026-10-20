import { useEffect, useRef, useState } from 'react';
import { ServicesAreaStep, type ServicesAreaStepProps } from './services-area-step';
import { BusinessProfileStep, type BusinessProfileStepProps, type BusinessProfileValues } from '../business-profile-step/business-profile-step';
import { businessProfileStepData as businessCopy } from '../business-profile-step/business-profile-step.data';
import { TeamStep, type TeamStepProps, type TeamValues } from '../team-step/team-step';
import { SessionOwnerPreview } from '../team-step/session-owner-preview';
import { ReviewStep, type ReviewSection } from '../review-step/review-step';
import { reviewStepData as copy } from '../review-step/review-step.data';
interface PreviewProps extends ServicesAreaStepProps {
  ownerEmail?: string; businessArgs?: BusinessProfileStepProps; teamArgs?: TeamStepProps;
  initialStep?: 'business' | 'services' | 'team' | 'review';
}
/** Local Storybook flow; keeps all drafts while editing and performs no writes. */
export function ServicesTeamPreview(args: PreviewProps) {
  const [business, setBusiness] = useState<BusinessProfileValues>(args.businessArgs?.values ?? { businessName: businessCopy.stories.name, businessType: 'plumbing' });
  const [services, setServices] = useState(args.values);
  const [team, setTeam] = useState<TeamValues>(args.teamArgs?.values ?? { invitations: [] });
  const [skipTeam, setSkipTeam] = useState(false);
  const [step, setStep] = useState<ReviewSection | 'review'>(args.initialStep ?? 'services');
  const [returnToReview, setReturnToReview] = useState(false);
  const [complete, setComplete] = useState(false);
  const content = useRef<HTMLDivElement>(null);
  const previousStep = useRef(step);
  useEffect(() => {
    if (previousStep.current !== step) content.current?.querySelector<HTMLHeadingElement>('h2')?.focus();
    previousStep.current = step;
  }, [step]);
  function advance(next: 'services' | 'team') { setStep(returnToReview ? 'review' : next); setReturnToReview(false); }
  function edit(section: ReviewSection) { setComplete(false); setReturnToReview(true); setStep(section); }
  function renderAccountStep(ownerEmail: string) {
    return step === 'review' ? <ReviewStep business={business} services={services} team={skipTeam ? { invitations: [] } : team} ownerEmail={ownerEmail} onEdit={edit} onBack={() => { setComplete(false); setStep('team'); }} onCreate={() => setComplete(true)} /> : <TeamStep {...args.teamArgs} ownerEmail={ownerEmail} values={team} onChange={next => { setTeam(next); args.teamArgs?.onChange(next); }} onBack={() => setStep('services')} onContinue={next => { setTeam(next); setSkipTeam(false); setReturnToReview(false); args.teamArgs?.onContinue(next); setStep('review'); }} onSkip={() => { setSkipTeam(true); setReturnToReview(false); args.teamArgs?.onSkip(); setStep('review'); }} />;
  }
  return <div ref={content} className="grid gap-6">
    {complete && <p role="status" className="m-0 rounded-xl border border-line bg-canvas p-4 text-sm leading-6 text-muted">{copy.stories.complete}</p>}
    {step === 'business' ? <BusinessProfileStep {...args.businessArgs} values={business} onChange={next => { setBusiness(next); args.businessArgs?.onChange(next); }} onContinue={next => { setBusiness(next); args.businessArgs?.onContinue(next); advance('services'); }} /> : step === 'services' ? <ServicesAreaStep {...args} values={services} onChange={next => { setServices(next); args.onChange(next); }} onBack={() => { args.onBack(); setStep('business'); }} onContinue={next => { setServices(next); args.onContinue(next); advance('team'); }} /> : (args.ownerEmail ? renderAccountStep(args.ownerEmail) : <SessionOwnerPreview>{renderAccountStep}</SessionOwnerPreview>)}
  </div>;
}
