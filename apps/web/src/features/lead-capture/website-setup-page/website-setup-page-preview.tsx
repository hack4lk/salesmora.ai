'use client';

import { useRef, useState } from 'react';
import { WorkspaceNavigation } from '@salesmora/ui';
import { WebsiteSetupPage } from './website-setup-page';
import { websiteSetupPageData as copy } from './website-setup-page.data';
import { captureFormPreviewExample } from '../capture-form-preview/capture-form-preview.data';
import { defaultCaptureLeadWorkflow } from '../capture-lead-workflow/capture-lead-workflow.validation';
import type { WebsiteFieldSuggestion } from '../website-capture-brief/website-capture-brief';
import type { WebsiteSetupDraft, WebsiteSetupPanel, WebsiteSetupSave, WebsiteSetupSaved } from './website-setup-page.validation';
export const websiteSetupExample: WebsiteSetupDraft = {
  selection: { name: copy.stories.name, source: 'website' }, brief: copy.stories.brief,
  form: { fields: captureFormPreviewExample.fields, contactRequired: true },
  content: { title: captureFormPreviewExample.title, intro: captureFormPreviewExample.intro ?? '', unavailableMessage: captureFormPreviewExample.unavailableMessage ?? '', showBusinessEmail: true, showBusinessPhone: true },
  workflow: defaultCaptureLeadWorkflow,
};
export type WebsiteSetupPagePreviewProps = {
  initialStep?: 'source' | 'intake'; initialPanel?: WebsiteSetupPanel; initialDraft?: WebsiteSetupDraft;
  canRead?: boolean; readOnly?: boolean; revision?: boolean; failSave?: boolean; holdSave?: boolean; failSuggestions?: boolean;
  onSave: (request: WebsiteSetupSave) => void; onReview: (saved: WebsiteSetupSaved) => void; onGmailSetup: (saved: WebsiteSetupSaved) => void; onExit: () => void;
};
/** In-memory page adapter. No persistence, assistant invocation, routing or publication. */
export function WebsiteSetupPagePreview({ initialStep = 'source', initialPanel = 'brief', initialDraft = websiteSetupExample, canRead = true, readOnly = false, revision = false, failSave = false, holdSave = false, failSuggestions = false, onSave, onReview, onGmailSetup, onExit }: WebsiteSetupPagePreviewProps) {
  const [draft, setDraft] = useState(initialDraft), [savedDraft, setSavedDraft] = useState(initialDraft), [version, setVersion] = useState(1);
  const [step, setStep] = useState(initialStep), [panel, setPanel] = useState(initialPanel), [message, setMessage] = useState('');
  const [suggestion, setSuggestion] = useState<WebsiteFieldSuggestion>(), [accepted, setAccepted] = useState<string>(), [suggestionError, setSuggestionError] = useState<string>();
  const versionRef = useRef(1);
  return <div className="min-h-screen bg-canvas text-ink md:flex">
    <WorkspaceNavigation workspaceName={copy.stories.workspace} user={{ name: copy.stories.viewer, email: copy.stories.email, role: 'owner' }} currentPage="campaigns" contentId="website-setup-preview-content" authorizedPages={canRead ? ['home', 'campaigns', 'settings'] : ['home', 'settings']} availablePages={['campaigns']} onNavigate={() => {}} onAccountSettings={() => {}} onSignOut={() => {}} accountSettingsAvailable={false} />
    <main id="website-setup-preview-content" tabIndex={-1} className="min-w-0 flex-1 px-4 py-6 focus-visible:focus-ring sm:px-8 sm:py-8"><p className="mb-6 mt-0 text-sm leading-6 text-muted">{copy.stories.description}</p>{message && canRead && <p role="status" className="mb-5 mt-0 text-sm text-muted">{message}</p>}
      <WebsiteSetupPage draftId="website-draft" version={version} draft={draft} dirty={JSON.stringify(draft) !== JSON.stringify(savedDraft)} step={step} panel={panel} canRead={canRead} canEdit={!readOnly} revision={revision} gmailAccess="available"
        context={{ businessName: copy.stories.workspace, services: copy.stories.services, serviceArea: copy.stories.area }} suggestion={suggestion} acceptedSuggestionId={accepted} suggestionError={suggestionError}
        teammates={[{ id: 'sam', name: copy.stories.teammate }]} previewIdentity={{ businessName: copy.stories.workspace, businessEmail: captureFormPreviewExample.businessEmail, businessPhone: captureFormPreviewExample.businessPhone }}
        onDraft={setDraft} onStep={setStep} onPanel={setPanel} onNavigate={destination => { setDraft(savedDraft); setMessage(''); if (destination === 'list') { onExit(); setMessage(copy.stories.exit); } else if (destination === 'source' || destination === 'intake') setStep(destination); }}
        onSave={async request => {
          onSave(request);
          if (holdSave) await new Promise<void>(() => {});
          if (failSave || request.expectedVersion !== versionRef.current) throw new Error(copy.stories.failure);
          versionRef.current += 1; setVersion(versionRef.current); setSavedDraft(structuredClone(draft)); setMessage(copy.stories.saved);
          return { draftId: request.draftId, version: versionRef.current };
        }}
        onReview={result => { onReview(result); setMessage(copy.stories.review); }} onGmailSetup={result => { onGmailSetup(result); setMessage(copy.stories.gmail); }}
        onSuggest={brief => { setSuggestionError(undefined); if (failSuggestions) { setSuggestionError(copy.stories.failure); return; } setSuggestion({ id: crypto.randomUUID(), brief, fields: captureFormPreviewExample.fields.map(field => ({ id: field.id, label: field.label, type: field.type, requirement: field.key === 'email' || field.key === 'phone' ? 'contact' : field.required ? 'required' : 'optional', reason: copy.stories.suggestion })) }); }}
        onUseFields={proposal => { if (proposal.brief !== draft.brief) return; setDraft({ ...draft, form: websiteSetupExample.form }); setAccepted(proposal.id); }} />
    </main>
  </div>;
}
