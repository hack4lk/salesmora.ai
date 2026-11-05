'use client';

import { useRef, useState } from 'react';
import { WorkspaceNavigation } from '@salesmora/ui';
import { IntakeDetailPage } from './intake-detail-page';
import { intakeDetailPageData as copy } from './intake-detail-page.data';
import type { IntakeDecisionResult } from '../intake-decision-review/intake-decision-review';
import type { IntakeDecisionRequest, IntakeDecisionReviewModel } from '../intake-decision-review/intake-decision-review.validation';
import type { IntakeEvidenceSnapshot } from '../intake-source-evidence/intake-source-evidence.validation';
import { standardCaptureFieldTypes, type CaptureStandardField } from '../capture-form-field-editor/capture-form-field-editor.validation';

export const intakeDetailFixture: IntakeDecisionReviewModel = {
  intakeId: 'intake-detail', intakeVersion: 1, revision: 'review-1', resolved: false, duplicateRequired: false, decision: 'create', matches: [],
  definitionVersion: 1, definition: { contactRequired: true, fields: (['name', 'email', 'phone', 'service', 'details'] as CaptureStandardField[]).map(key => ({ id: key, key, label: copy.stories.labels[key as keyof typeof copy.stories.labels], type: standardCaptureFieldTypes[key], required: key === 'name' || key === 'service', options: [] })) },
  answers: { name: copy.stories.name, email: copy.stories.email, phone: copy.stories.phone, service: copy.stories.service },
  workflowVersion: 1, workflow: copy.stories.workflow, access: 'ready', capacity: 'available', canCreate: true, canLink: true, canDismiss: true,
};
export const intakeDetailEmailFixture: IntakeEvidenceSnapshot = {
  intakeId: intakeDetailFixture.intakeId, version: 1, sourceName: copy.stories.source, receivedAt: '2026-10-30T14:30:00Z', type: 'gmail',
  from: `${copy.stories.name} <${copy.stories.email}>`, subject: copy.stories.subject, body: copy.stories.body,
  fields: [{ id: 'name', label: copy.stories.labels.name, origin: { kind: 'email', location: 'body', quote: copy.stories.name } }, { id: 'service', label: copy.stories.labels.service, uncertain: true, origin: { kind: 'email', location: 'body', quote: 'kitchen cabinet replacement' } }],
};
export type IntakeDetailPagePreviewProps = {
  website?: boolean; duplicate?: boolean; missingFields?: boolean; readOnly?: boolean; canRead?: boolean; canReadMatches?: boolean;
  resolved?: boolean; capacity?: 'available' | 'checking' | 'exhausted' | 'error'; access?: 'ready' | 'checking' | 'blocked';
  state?: 'ready' | 'loading' | 'error' | 'missing'; matchesState?: 'ready' | 'loading' | 'error';
  reloadRevisionOnly?: boolean; mismatch?: boolean; longContent?: boolean; untrusted?: boolean; dismissOnly?: boolean;
  revokeWhileConfirming?: boolean; changeWhileConfirming?: boolean;
  onConfirm: (request: IntakeDecisionRequest) => Promise<IntakeDecisionResult>; onLeave: () => void;
};
/** Storybook-only versioned session with fictional originals and simulated decision/reload services. */
export function IntakeDetailPagePreview({ website = false, duplicate = false, missingFields = false, readOnly = false, canRead = true, canReadMatches = true, resolved = false, capacity = 'available', access = 'ready', state: initialState = 'ready', matchesState: initialMatchesState = 'ready', reloadRevisionOnly = false, mismatch = false, longContent = false, untrusted = false, dismissOnly = false, revokeWhileConfirming = false, changeWhileConfirming = false, onConfirm, onLeave }: IntakeDetailPagePreviewProps) {
  const [review, setReview] = useState<IntakeDecisionReviewModel>(() => {
    const base = structuredClone(intakeDetailFixture);
    return { ...base, resolved, duplicateRequired: duplicate, capacity, access,
      canCreate: !readOnly && !dismissOnly, canLink: !readOnly && !dismissOnly, canDismiss: !readOnly,
      answers: missingFields ? { ...base.answers, name: '', email: '', phone: '' } : longContent ? { ...base.answers, service: copy.stories.long.repeat(3) } : untrusted ? { ...base.answers, service: copy.stories.untrusted } : base.answers,
      matches: duplicate ? [{ id: 'existing-lead', version: 3, name: copy.stories.existing, contact: copy.stories.email, reason: copy.stories.reason, canLink: true,
        changes: [{ id: 'phone', label: copy.stories.labels.phone, existing: copy.stories.oldPhone, proposed: copy.stories.phone }, { id: 'service', label: copy.stories.labels.service, existing: 'Cabinet repair', proposed: base.answers.service as string }] }] : [],
    };
  });
  const [originalAnswers] = useState(() => structuredClone(review.answers)), [allowed, setAllowed] = useState(canRead), [message, setMessage] = useState('');
  const [state, setState] = useState(initialState), [matchesState, setMatchesState] = useState(initialMatchesState);
  const counter = useRef(1);
  const advance = (current: IntakeDecisionReviewModel): IntakeDecisionReviewModel => ({ ...current, revision: `review-${++counter.current}`, decision: 'create' });
  const email: IntakeEvidenceSnapshot = { ...intakeDetailEmailFixture, version: mismatch ? 99 : review.intakeVersion,
    ...(missingFields ? { body: 'Hello, I need a kitchen cabinet replacement estimate.', fields: intakeDetailEmailFixture.fields.filter(field => field.id !== 'name') } : longContent ? { body: copy.stories.body + '\n' + copy.stories.long.repeat(15) } : untrusted ? { body: copy.stories.untrusted, fields: [] } : {}),
  };
  const evidence: IntakeEvidenceSnapshot = website ? { intakeId: review.intakeId, version: email.version, sourceName: copy.stories.websiteSource, receivedAt: email.receivedAt, type: 'website',
    answers: Object.entries(originalAnswers).map(([id, value]) => ({ id, label: copy.stories.labels[id as keyof typeof copy.stories.labels], value: String(value) })),
    fields: [{ id: 'name', label: copy.stories.labels.name, origin: { kind: 'form', answerId: 'name', quote: String(originalAnswers.name) } }],
  } : email;
  return <div className="min-h-screen bg-canvas text-ink md:flex">
    <WorkspaceNavigation workspaceName={copy.stories.workspace} user={{ name: copy.stories.viewer, email: copy.stories.viewerEmail, role: 'owner' }} currentPage="intake" contentId="intake-detail-preview-content" authorizedPages={allowed ? ['home', 'intake', 'campaigns', 'settings'] : ['home', 'settings']} availablePages={['intake', 'campaigns']} onNavigate={() => {}} onAccountSettings={() => {}} onSignOut={() => {}} accountSettingsAvailable={false} />
    <main id="intake-detail-preview-content" tabIndex={-1} className="min-w-0 flex-1 px-4 py-6 focus-visible:focus-ring sm:px-8 sm:py-8">
      <p className="mb-6 mt-0 text-sm leading-6 text-muted">{copy.stories.preview}</p>
      {message && allowed && <p role="status" className="mb-5 mt-0 text-sm text-muted">{message}</p>}
      <IntakeDetailPage review={review} evidence={evidence} originalAnswers={originalAnswers} canRead={allowed} canEdit={!readOnly && !dismissOnly} canReadMatches={canReadMatches} uncertainFieldIds={['service']} timezone="America/New_York" state={state} matchesState={matchesState}
        onAnswers={answers => setReview(current => advance({ ...current, answers, matches: current.matches.map(match => ({ ...match, changes: match.changes.map(change => ({ ...change, proposed: typeof answers[change.id] === 'string' ? answers[change.id] as string : change.proposed })) })) }))}
        onDecision={decision => setReview(current => ({ ...current, decision }))}
        onConfirm={async request => {
          if (revokeWhileConfirming) { setAllowed(false); await new Promise(resolve => setTimeout(resolve, 20)); }
          if (changeWhileConfirming) { setReview(current => advance({ ...current, intakeVersion: current.intakeVersion + 1 })); await new Promise(resolve => setTimeout(resolve, 20)); }
          return onConfirm(request);
        }}
        onReload={async () => { setState('ready'); setReview(current => advance({ ...current, intakeVersion: current.intakeVersion + (reloadRevisionOnly ? 0 : 1) })); }}
        onRetryMatches={() => { setMatchesState('ready'); setReview(current => advance(current)); }}
        onLeave={() => { onLeave(); setMessage(copy.stories.returned); setReview(current => advance({ ...current, answers: structuredClone(originalAnswers) })); }} />
    </main>
  </div>;
}
