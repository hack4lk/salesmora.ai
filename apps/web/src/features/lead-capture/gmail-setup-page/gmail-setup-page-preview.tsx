'use client';

import { useRef, useState } from 'react';
import { WorkspaceNavigation } from '@salesmora/ui';
import { GmailSetupPage, type GmailSetupAssistantResult, type GmailSetupExtractionRequest } from './gmail-setup-page';
import { gmailSetupPageData as copy } from './gmail-setup-page.data';
import { gmailSetupApprovalKey, type GmailExtractionResult, type GmailSetupDraft, type GmailSetupPanel, type GmailSetupSave, type GmailSetupSaved } from './gmail-setup-page.validation';
import { defaultCaptureLeadWorkflow } from '../capture-lead-workflow/capture-lead-workflow.validation';
import { gmailFieldMappingData } from '../gmail-field-mapping/gmail-field-mapping.data';
import type { GmailFindingsMessage, GmailFindingsValue } from '../gmail-field-mapping/gmail-field-mapping.findings';
import type { GmailCaptureAccount } from '../gmail-capture-scope/gmail-capture-scope';
const chat = gmailFieldMappingData.findings;
export const gmailSetupExample: GmailSetupDraft = {
  selection: { name: copy.stories.name, source: 'gmail' }, account: { accountId: 'gmail-1' },
  rules: { location: 'both', mode: 'all', phrases: [{ id: 'estimate', text: copy.stories.phrase }] }, example: { subject: copy.stories.subject, body: copy.stories.body },
  targets: (['name', 'email', 'service'] as const).map(key => ({ id: key, key, label: copy.stories.targetLabels[key], required: key !== 'email' })),
  sample: null, findings: { sampleId: '', sampleVersion: 0, findings: [] }, approvedKey: null, workflow: defaultCaptureLeadWorkflow,
};
/** Literal fixture parser only. No model or Gmail service is invoked. */
export function gmailSetupFixture(example: GmailSetupDraft['example'], version = 1, targets = gmailSetupExample.targets): GmailExtractionResult {
  const sample = { ...example, id: 'preview-sample', version };
  return { sample, value: { sampleId: sample.id, sampleVersion: version, findings: targets.map(target => {
    const label = target.key === 'name' || target.key === 'email' || target.key === 'service' ? copy.stories.sourceLabels[target.key] : target.label;
    const evidence = example.body.split('\n').find(line => line.startsWith(`${label}:`));
    const text = evidence?.slice(evidence.indexOf(':') + 1).trim() ?? '';
    return { id: target.id, fieldId: target.id, included: true, sampleValue: text, suggestedValue: text, confidence: evidence ? 'found' : 'missing', required: !!target.required, instruction: copy.stories.instruction(target.label), evidence: evidence ? { source: 'body', text: evidence } : null };
  }) } };
}
export function gmailSetupFindings(approved = false): GmailSetupDraft {
  const result = gmailSetupFixture(gmailSetupExample.example);
  const draft = { ...gmailSetupExample, sample: result.sample, findings: result.value };
  return { ...draft, approvedKey: approved ? gmailSetupApprovalKey(draft) : null };
}
export type GmailSetupPagePreviewProps = {
  initialStep?: 'source' | 'intake'; initialPanel?: GmailSetupPanel; initialScreen?: 'example' | 'findings'; initialDraft?: GmailSetupDraft;
  canRead?: boolean; readOnly?: boolean; failSave?: boolean; holdSave?: boolean; failExtract?: boolean; holdExtract?: boolean; reconnect?: boolean; accountsError?: boolean; upgradeRequired?: boolean;
  onSave: (request: GmailSetupSave) => void; onReview: (saved: GmailSetupSaved) => void; onWebsiteSetup: (saved: GmailSetupSaved) => void; onExit: () => void; onExtract: (request: GmailSetupExtractionRequest) => void;
};
/** In-memory review adapter. Persistence, OAuth, extraction and assistant services remain deferred. */
export function GmailSetupPagePreview({ initialStep = 'source', initialPanel = 'account', initialScreen = 'example', initialDraft = gmailSetupExample, canRead = true, readOnly = false, failSave = false, holdSave = false, failExtract = false, holdExtract = false, reconnect = false, accountsError = false, upgradeRequired = false, onSave, onReview, onWebsiteSetup, onExit, onExtract }: GmailSetupPagePreviewProps) {
  const [draft, setDraft] = useState(initialDraft), [saved, setSaved] = useState(initialDraft), [version, setVersion] = useState(1), versionRef = useRef(1), sequence = useRef(1);
  const [step, setStep] = useState(initialStep), [panel, setPanel] = useState(initialPanel), [screen, setScreen] = useState(initialScreen), [message, setMessage] = useState('');
  const [accounts, setAccounts] = useState<readonly GmailCaptureAccount[]>([{ id: 'gmail-1', email: copy.stories.account, status: reconnect ? 'reconnect-required' : 'connected' }, { id: 'gmail-2', email: copy.stories.otherAccount, status: 'connected' }]);
  const [accountsStatus, setAccountsStatus] = useState<'ready' | 'error'>(accountsError ? 'error' : 'ready');
  const [messages, setMessages] = useState<readonly GmailFindingsMessage[]>([{ id: 'intro', role: 'assistant', text: chat.initial }]), [suggestions, setSuggestions] = useState<readonly string[]>([]);
  const wizard = useRef<{ stage: 'name' | 'meaning' | 'example' | 'required'; name?: string; meaning?: string; example?: string } | null>(null);
  const assistant = async (text: string, value: GmailFindingsValue): Promise<GmailSetupAssistantResult> => {
    let reply: string = chat.reply, nextValue = value, targets = draft.targets, nextSuggestions: readonly string[] = [];
    if (text === chat.addPrompt) { wizard.current = { stage: 'name' }; reply = chat.askName; }
    else if (wizard.current?.stage === 'name') { wizard.current = { ...wizard.current, stage: 'meaning', name: text }; reply = chat.askMeaning; }
    else if (wizard.current?.stage === 'meaning') { wizard.current = { ...wizard.current, stage: 'example', meaning: text }; reply = chat.askExample; }
    else if (wizard.current?.stage === 'example') { wizard.current = { ...wizard.current, stage: 'required', example: text }; reply = chat.askRequired; nextSuggestions = [chat.optional, chat.mandatory]; }
    else if (wizard.current?.stage === 'required') {
      if (text !== chat.optional && text !== chat.mandatory) { reply = chat.askRequired; nextSuggestions = [chat.optional, chat.mandatory]; }
      else { const field = wizard.current, id = `custom-${++sequence.current}`, required = text === chat.mandatory;
        targets = [...targets, { id, key: 'custom', label: field.name!, required }];
        nextValue = { ...value, findings: [...value.findings, { id, fieldId: id, included: true, sampleValue: field.example!, suggestedValue: '', confidence: 'missing', required, instruction: field.meaning!, evidence: null }] };
        wizard.current = null; reply = chat.added;
      }
    } else if (text === chat.explainPrompt) reply = chat.explainReply;
    return { value: nextValue, targets, reply, suggestions: nextSuggestions };
  };
  return <div className="min-h-screen bg-canvas text-ink md:flex">
    <WorkspaceNavigation workspaceName={copy.stories.workspace} user={{ name: copy.stories.viewer, email: copy.stories.email, role: 'owner' }} currentPage="campaigns" contentId="gmail-setup-preview-content" authorizedPages={canRead ? ['home', 'campaigns', 'settings'] : ['home', 'settings']} availablePages={['campaigns']} onNavigate={() => {}} onAccountSettings={() => {}} onSignOut={() => {}} accountSettingsAvailable={false} />
    <main id="gmail-setup-preview-content" tabIndex={-1} className="min-w-0 flex-1 px-4 py-6 focus-visible:focus-ring sm:px-8 sm:py-8"><p className="mb-6 mt-0 text-sm leading-6 text-muted">{copy.stories.description}</p>{message && canRead && <p role="status" className="mb-5 mt-0 text-sm text-muted">{message}</p>}
      <GmailSetupPage draftId="gmail-draft" version={version} draft={draft} dirty={JSON.stringify(draft) !== JSON.stringify(saved)} step={step} panel={panel} screen={screen} canRead={canRead} canEdit={!readOnly} accounts={accounts} accountsStatus={accountsStatus} gmailAccess={upgradeRequired ? 'upgrade-required' : 'available'} teammates={[{ id: 'sam', name: copy.stories.viewer }]} messages={messages} suggestions={suggestions}
        onDraft={setDraft} onStep={setStep} onPanel={setPanel} onScreen={setScreen} onMessages={setMessages} onSuggestions={setSuggestions}
        onNavigate={destination => { setDraft(saved); setMessage(''); if (destination === 'list') { onExit(); setMessage(copy.stories.exit); } else if (destination !== 'review') setStep(destination); }}
        onSave={async request => { onSave(request); if (holdSave) await new Promise<void>(() => {}); if (failSave || request.expectedVersion !== versionRef.current) throw new Error(copy.stories.failure); versionRef.current += 1; setVersion(versionRef.current); setSaved(structuredClone({ ...draft, ...request.gmail, selection: request.selection })); setMessage(copy.stories.saved); return { draftId: request.draftId, version: versionRef.current }; }}
        onReview={result => { onReview(result); setMessage(copy.stories.review); }} onWebsiteSetup={result => { onWebsiteSetup(result); setMessage(copy.stories.website); }}
        onExtract={async request => { onExtract(request); if (holdExtract) await new Promise<void>(() => {}); if (failExtract) throw new Error(copy.stories.failure); wizard.current = null; setMessages([{ id: 'intro', role: 'assistant', text: chat.initial }]); setSuggestions([]); return gmailSetupFixture(request.example, ++sequence.current, request.targets); }} onAssistant={assistant}
        onConnect={() => setMessage(copy.stories.connect)} onReconnect={id => { setAccounts(previous => previous.map(account => account.id === id ? { ...account, status: 'connected' } : account)); setMessage(copy.stories.connect); }} onRetryAccounts={() => setAccountsStatus('ready')} />
    </main>
  </div>;
}
