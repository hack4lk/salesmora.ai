'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { captureSetupSampleSchema, captureSetupFindingSchema, captureSetupContextSchema, captureSetupCanonical, captureSetupViewSchema, type CaptureSetupView, type CaptureSetupContext, captureDraftConfigurationSchema, captureDetailViewSchema, type CaptureDetailView, type CaptureDraftConfiguration } from '@salesmora/contracts';
import { useWorkspaceAssistant } from '../../assistant/workspace-assistant/workspace-assistant';
import { gmailSetupApprovalKey, gmailSetupSave } from '../gmail-setup-page/gmail-setup-page.validation';
import { useCaptureGmailConnection } from './capture-gmail-connection';
import { captureGmailSampleCandidatesSchema, captureGmailSelectedExampleSchema } from '@salesmora/contracts';
import type { GmailSamplePickerProps } from '../gmail-sample-picker/gmail-sample-picker';
import { ConfirmDialog, FormFeedback } from '@salesmora/ui';
import { WebsiteSetupPage } from '../website-setup-page/website-setup-page';
import type { WebsiteSetupPanel, WebsiteSetupSave } from '../website-setup-page/website-setup-page.validation';
import { GmailSetupPage } from '../gmail-setup-page/gmail-setup-page';
import type { GmailSetupPanel, GmailSetupSave } from '../gmail-setup-page/gmail-setup-page.validation';
import { CaptureReviewPage } from '../capture-review-page/capture-review-page';
import type { CaptureSetupDestination } from '../capture-setup-header/capture-setup-header';
import type { CaptureReviewLaunchRequest } from '../capture-review-page/capture-review-page.validation';
import type { CaptureLaunchValue } from '../capture-setup-review/capture-setup-review.validation';
import { captureInitialConfiguration, websiteDraftFrom, websiteConfiguration, gmailDraftFrom, gmailConfiguration, gmailDraftDirty, gmailDraftConfigurationDirty } from './capture-adapters';
import { captureReviewFrom } from './capture-review-adapter';
import { capturePublicationWrite, captureWrite, captureHref, CaptureRequestError } from './capture-api';
import { useCaptureLeaveGuard } from './use-capture-leave-guard';
import { captureConnectedData as copy } from './capture-connected.data';
const unavailable = async (): Promise<never> => { throw new Error(copy.unavailable); };
export function CaptureWizardRoute({ initial }: { initial: CaptureDetailView }) {
  const assistant = useWorkspaceAssistant();
  const router = useRouter(), params = useSearchParams();
  const [view, setView] = useState(initial), [website, setWebsite] = useState(() => websiteDraftFrom(initial)), [gmail, setGmail] = useState(() => gmailDraftFrom(initial));
  const [pending, setPending] = useState(false), [error, setError] = useState(''), [denied, setDenied] = useState(false), [saveConflict, setConflict] = useState(false), [reload, setReload] = useState(false);
  const [gmailScreen, setGmailScreen] = useState<'example' | 'findings'>('example');
  const extractionOrigin = useRef<string | undefined>(undefined), sampleIdentity = useRef({ id: crypto.randomUUID(), version: 1, text: '' });
  const [timing, setTiming] = useState<CaptureLaunchValue>({ mode: 'now', localDateTime: '' });
  const attempts = useRef(new Map<string, string>()), lock = useRef(false), mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const source = view.detail.source, draft = view.detail.draft;
  useEffect(() => {
    if (draft?.configuration.type !== 'gmail' || !draft.configuration.sampleId) return;
    const abort = new AbortController(), sampleId = draft.configuration.sampleId;
    void fetch(`/api/lead-capture/${source.id}/setup-sample?workspace=${source.workspaceId}`, { cache: 'no-store', signal: abort.signal }).then(async response => {
      if (!response.ok) return;
      const result = (await response.json()).sample;
      if (!result || result.id !== sampleId || abort.signal.aborted) return;
      const sample = captureSetupSampleSchema.parse(result.sample), findings = result.findings.map((finding: unknown) => captureSetupFindingSchema.parse(finding));
      setGmail(current => { if (current.sample || current.example.subject || current.example.body || current.approvedSampleId !== sampleId) return current; const next = { ...current, sample, example: { subject: sample.subject, body: sample.body }, findings: { sampleId: sample.id, sampleVersion: sample.version, findings } }; return { ...next, approvedKey: gmailSetupApprovalKey(next) }; });
      setGmailScreen('findings');
    }).catch(() => { /* The draft remains editable; unavailable sample evidence never becomes approved. */ });
    return () => abort.abort();
  }, [source.id, source.workspaceId, draft]);
  const conflict = saveConflict || initial.detail.source.version > view.detail.source.version;
  const canEdit = view.canEdit && initial.canEdit && !conflict;
  const type = source.type, active = type === 'website' ? website : gmail;
  const dirty = type === 'website' ? captureSetupCanonical(website) !== captureSetupCanonical(websiteDraftFrom(view)) : gmailDraftDirty(gmail, gmailDraftFrom(view), draft?.configuration ?? captureInitialConfiguration('gmail', view.business));
  const mailboxDirty = type === 'gmail' && gmailDraftConfigurationDirty(gmail, gmailDraftFrom(view), draft?.configuration ?? captureInitialConfiguration('gmail', view.business));
  const gmailConnection = useCaptureGmailConnection({ enabled: type === 'gmail', view, canEdit, dirty, save: async () => {
    if (!draft) throw Error(copy.unavailable);
    const request = gmailSetupSave(draft.id, draft.version, gmail); if (!request) throw Error(copy.unavailable);
    const result = await save(request); return { sourceVersion: result.sourceVersion, draftVersion: result.version };
  }, onChanged: async () => { await reloadDraft(); } });
  const selectedAccount = gmailConnection.accounts.find(account => account.id === gmail.account.accountId);
  async function sampleRequest(kind: 'search' | 'preview', value: Record<string, string>) {
    if (!draft || !canEdit || mailboxDirty || pending || gmailConnection.pending) throw Error(copy.unavailable);
    const response = await fetch(`/api/lead-capture/gmail/samples/${kind}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store',
      body: JSON.stringify({ workspaceId: source.workspaceId, sourceId: source.id, expectedVersion: source.version, expectedDraftVersion: draft.version, ...value }) });
    if (!response.ok) {
      if (mounted.current) { if ([401, 404, 423].includes(response.status)) setDenied(true); if (response.status === 409) setConflict(true); if (response.status === 503) gmailConnection.reload(); }
      throw Error(copy.unavailable);
    }
    return response.json();
  }
  const mailbox: Omit<GmailSamplePickerProps, 'canRead' | 'canEdit' | 'pending'> | undefined = draft && !mailboxDirty && gmailConnection.available && selectedAccount ? {
    bindingKey: `${source.id}:${source.version}:${draft.version}:${selectedAccount.id}:${selectedAccount.version}`,
    accountEmail: selectedAccount.email, connected: selectedAccount.status === 'connected',
    onSearch: async subjectPhrase => captureGmailSampleCandidatesSchema.parse(await sampleRequest('search', { subjectPhrase })).candidates,
    onPreview: async reference => captureGmailSelectedExampleSchema.parse(await sampleRequest('preview', { reference })),
    // This stage copies editable text to the existing extraction path. It grants no publication authority.
    onUse: async sample => { if (!mounted.current || !canEdit || pending || mailboxDirty) throw Error(copy.unavailable); extractionOrigin.current = undefined; setGmail(current => ({ ...current, example: { subject: sample.subject, body: sample.body }, exampleOrigin: { retrievalId: sample.retrievalId, reference: sample.id, accountId: selectedAccount!.id, accountVersion: selectedAccount!.version, sourceVersion: source.version, draftVersion: draft!.version, subject: sample.subject, body: sample.body }, sample: null, findings: { sampleId: '', sampleVersion: 0, findings: [] }, approvedKey: null, approvedSampleId: undefined })); },
  } : undefined;
  const step = params.get('step') === 'source' ? 'source' : params.get('step') === 'review' && !dirty ? 'review' : 'intake';
  const selectedPanel = params.get('panel');
  const websitePanel: WebsiteSetupPanel = ['brief', 'fields', 'preview', 'workflow'].includes(selectedPanel ?? '') ? selectedPanel as WebsiteSetupPanel : 'brief';
  const gmailPanel: GmailSetupPanel = ['account', 'rules', 'fields', 'workflow'].includes(selectedPanel ?? '') ? selectedPanel as GmailSetupPanel : 'account';
  const route = (next: string, panel?: string) => router.push(`${captureHref(source.workspaceId, source.id, true)}&step=${next}${panel ? `&panel=${panel}` : ''}`);
  const { leave, setLeave } = useCaptureLeaveGuard(dirty && !gmailConnection.redirecting, pending && !gmailConnection.redirecting);
  const reset = (next: CaptureDetailView) => { setView(next); setWebsite(websiteDraftFrom(next)); setGmail(gmailDraftFrom(next)); setConflict(false); setError(''); };
  const navigate = (destination: CaptureSetupDestination) => { setWebsite(websiteDraftFrom(view)); setGmail(gmailDraftFrom(view)); if (destination === 'list') router.push(captureHref(source.workspaceId)); else route(destination); };
  const save = async (request: WebsiteSetupSave | GmailSetupSave) => {
    if (!draft || !canEdit || lock.current || !mounted.current || request.draftId !== draft.id || request.expectedVersion !== draft.version) throw new Error(copy.unavailable);
    let configuration: CaptureDraftConfiguration;
    if (request.selection.source === 'website') configuration = 'website' in request && request.website ? websiteConfiguration(request.website, draft.configuration, view.business) : captureInitialConfiguration('website', view.business);
    else configuration = 'gmail' in request && request.gmail ? gmailConfiguration(request.gmail, draft.configuration) : captureInitialConfiguration('gmail', view.business);
    configuration = captureDraftConfigurationSchema.parse(configuration);
    const payload = { workspaceId: source.workspaceId, sourceId: source.id, expectedVersion: source.version, expectedDraftVersion: draft.version, name: request.selection.name, configuration };
    const key = JSON.stringify(payload), requestId = attempts.current.get(key) ?? crypto.randomUUID(); attempts.current.set(key, requestId);
    lock.current = true; setPending(true); setError('');
    try {
      const result = await captureWrite(`/api/lead-capture/${source.id}/draft`, 'PUT', { ...payload, requestId });
      if (!mounted.current) throw new Error(copy.unavailable);
      const next: CaptureDetailView = { ...view, detail: { ...view.detail, source: { ...source, name: payload.name, type: configuration.type, version: result.sourceVersion, draftVersion: result.draftVersion }, draft: { ...draft, version: result.draftVersion, configuration } } };
      reset(next); return { draftId: draft.id, version: result.draftVersion, sourceVersion: result.sourceVersion };
    } catch (failure) {
      if (mounted.current) { if (failure instanceof CaptureRequestError) { if ([401, 404, 423].includes(failure.status)) setDenied(true); if (failure.status === 409) setConflict(true); } setError(failure instanceof Error ? failure.message : copy.failed); }
      throw failure;
    } finally { lock.current = false; if (mounted.current) setPending(false); }
  };
  const reloadDraft = async () => {
    if (lock.current) return; lock.current = true; setPending(true);
    try { const response = await fetch(`/api/lead-capture/${source.id}?workspace=${source.workspaceId}`, { cache: 'no-store' }); if (!response.ok) { if ([401, 404, 423].includes(response.status)) setDenied(true); throw new Error(copy.failed); } const next = captureDetailViewSchema.parse(await response.json()); if (mounted.current) { reset(next); setReload(false); } }
    catch (failure) { if (mounted.current) setError(failure instanceof Error ? failure.message : copy.failed); }
    finally { lock.current = false; if (mounted.current) setPending(false); }
  };
  function setupSnapshot(): CaptureSetupContext | undefined {
    if (!draft || !canEdit || pending || gmailConnection.pending || denied) return undefined;
    const configuration = type === 'website' ? websiteConfiguration(website, draft.configuration, view.business) : gmailConfiguration(gmail, draft.configuration);
    const text = JSON.stringify(gmail.example);
    if (text !== sampleIdentity.current.text) sampleIdentity.current = { id: crypto.randomUUID(), version: sampleIdentity.current.version + 1, text };
    const rawSample = type === 'gmail' && (gmail.example.subject || gmail.example.body) ? gmail.sample?.subject === gmail.example.subject && gmail.sample.body === gmail.example.body ? gmail.sample : { id: sampleIdentity.current.id, version: sampleIdentity.current.version, ...gmail.example } : null;
    const origin = gmail.exampleOrigin;
    const sample = rawSample && origin?.retrievalId && origin.subject === rawSample.subject && origin.body === rawSample.body && origin.accountId === gmail.account.accountId ? { ...rawSample, retrievalId: origin.retrievalId } : rawSample;
    const result = captureSetupContextSchema.safeParse({ sourceId: source.id, sourceVersion: source.version, draftVersion: draft.version, name: active.selection.name, configuration, sample, findings: type === 'gmail' ? gmail.findings.findings : [] });
    return result.success ? result.data : undefined;
  }
  function applySetup(result: CaptureSetupView) {
    if (result.receipt?.kind !== 'suggestions' || !draft) return;
    const receipt = result.receipt, config = receipt.configuration;
    const projection = { ...view, detail: { ...view.detail, source: { ...source, name: result.review.name }, draft: { ...draft, configuration: config } } };
    if (config.type === 'website') setWebsite(websiteDraftFrom(projection));
    else {
      if (result.ticket.operation === 'suggest_workflow') { setGmail({ ...gmail, workflow: gmailDraftFrom(projection).workflow }); return; }
      const next = { ...gmail, workflow: gmailDraftFrom(projection).workflow, contactRequired: config.contactRequired ?? true, configurationFields: config.fields, rules: { location: config.rules?.location ?? 'both' as const, mode: config.rules?.mode ?? 'all' as const, phrases: (config.rules?.phrases ?? []).map((text, index) => ({ id: `phrase-${index}`, text })) }, targets: (config.fields ?? []).map(field => ({ ...field })), sample: receipt.sample, findings: { sampleId: receipt.sample?.id ?? '', sampleVersion: receipt.sample?.version ?? 0, findings: receipt.findings }, approvedSampleId: config.sampleId, approvedKey: null as string | null };
      if (receipt.sampleApproved) next.approvedKey = gmailSetupApprovalKey(next);
      if (['extract_sample', 'refine_mapping'].includes(result.ticket.operation)) extractionOrigin.current = result.ticket.proposalId;
      setGmail(next); if (receipt.sample) setGmailScreen('findings');
    }
  }
  const host = useRef({ read: setupSnapshot, apply: applySetup }); useLayoutEffect(() => { host.current = { read: setupSnapshot, apply: applySetup }; });
  const register = assistant?.registerCaptureSetup;
  useEffect(() => { register?.({ read: () => host.current.read(), apply: result => host.current.apply(result) }); return () => register?.(); }, [register]);
  const askSetup = (prompt: string) => {
    if (!setupSnapshot()) { setError('This setup is too large or changed. Shorten the pasted sample or save other draft changes before asking.'); return; }
    assistant?.prepare(prompt, document.activeElement instanceof HTMLElement ? document.activeElement : null);
  };
  async function approveSample(snapshot: typeof gmail) {
    const setup = setupSnapshot();
    if (!setup || !extractionOrigin.current || captureSetupCanonical(snapshot) !== captureSetupCanonical(gmail)) throw Error(copy.unavailable);
    const body = { workspaceId: source.workspaceId, originProposalId: extractionOrigin.current, requestId: '', setup };
    const key = JSON.stringify({ ...body, requestId: undefined }), requestId = attempts.current.get(key) ?? crypto.randomUUID(); attempts.current.set(key, requestId); body.requestId = requestId;
    const prepared = await fetch('/api/chat/lead-capture/setup', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!prepared.ok) throw Error(copy.failed);
    const proposal = captureSetupViewSchema.parse((await prepared.json()).view);
    if (captureSetupCanonical(host.current.read()) !== captureSetupCanonical(setup)) throw Error(copy.unavailable);
    const confirmed = await fetch('/api/chat/lead-capture/setup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: source.workspaceId, proposalId: proposal.ticket.proposalId, inputHash: proposal.ticket.inputHash, decision: 'confirm' }) });
    if (!confirmed.ok) throw Error(copy.failed);
    const result = captureSetupViewSchema.parse((await confirmed.json()).view);
    if (!mounted.current || captureSetupCanonical(host.current.read()) !== captureSetupCanonical(setup)) throw Error(copy.unavailable);
    host.current.apply(result);
  }
  if (denied || !draft) return <FormFeedback kind="error" message={copy.unavailable} />;
  const authoritative = initial.publicationReview?.sourceVersion === source.version && initial.publicationReview.draftVersion === draft.version ? initial.publicationReview : view.publicationReview;
  const review = captureReviewFrom(view, authoritative);
  const canLaunch = !conflict && authoritative?.sourceId === source.id && authoritative.sourceVersion === source.version && authoritative.draftVersion === draft.version && authoritative.ready && authoritative.canActivate;
  const approve = async (request: CaptureReviewLaunchRequest) => {
    if (!canLaunch || lock.current || !mounted.current || !authoritative) throw new Error(copy.unavailable);
    lock.current = true; setPending(true); setError('');
    try {
      await capturePublicationWrite(`/api/lead-capture/${source.id}/publication`, { workspaceId: source.workspaceId, sourceId: source.id, expectedVersion: source.version, draftVersion: draft.version, baseApprovedVersion: authoritative.baseApprovedVersion, configurationVersion: authoritative.configurationVersion, requestId: request.requestId, confirmed: true, timing: request.timing.kind === 'now' ? { kind: 'now' } : { kind: 'scheduled', at: request.timing.at, timezone: request.timing.timezone } });
      if (mounted.current) router.replace(`${captureHref(source.workspaceId, source.id)}${source.type === 'website' ? '&tab=publication' : ''}`);
    } catch (failure) {
      if (mounted.current) { if (failure instanceof CaptureRequestError) { if (failure.status === 409) setConflict(true); if ([401,404,423].includes(failure.status)) setDenied(true); } setError(failure instanceof Error ? failure.message : copy.failed); }
      throw failure;
    } finally { lock.current = false; if (mounted.current) setPending(false); }
  };
  return <div className="grid gap-6"><p role="status" className="text-sm text-muted">{copy.draftNotice}</p>{error && <FormFeedback kind="error" message={error} />}{conflict && <button type="button" disabled={pending} onClick={() => setReload(true)}>{copy.reload}</button>}
    {type === 'gmail' && params.get('gmail') && <p role="status" className="text-sm text-muted">{params.get('gmail') === 'connected' ? 'Gmail account connected. Review the selected account and continue setup; capture has not launched.' : params.get('gmail') === 'cancelled' ? 'Gmail authorization was cancelled. Your saved draft is preserved.' : 'Gmail could not be connected. Your saved draft is preserved. Try connecting again.'}</p>}
    {gmailConnection.dialogs}
    {step !== 'review' && <button type="button" className="min-h-11 justify-self-start rounded-xl border border-line px-4 py-2 text-sm text-primary" disabled={!canEdit || pending || gmailConnection.pending || assistant?.status !== 'ready'} onClick={() => askSetup('Suggest an assignment, stage, tags and notification workflow for this unsaved capture setup. Prepare a review before applying.')}>Suggest workflow with assistant</button>}
    {step === 'review' ? <CaptureReviewPage draft={review} value={timing} canRead canEdit={canEdit} canLaunch={!!canLaunch} pending={pending} revision={source.approvedVersion !== null} onChange={setTiming} onEdit={section => route(section === 'source' ? 'source' : 'intake', section === 'fields' ? 'fields' : 'workflow')} onNavigate={navigate} onApprove={approve} onLaunch={unavailable} onOpenSource={() => router.push(captureHref(source.workspaceId, source.id))} onOpenIntake={() => {}} /> : type === 'website' ? <>
      <p className="text-sm text-muted">Use the assistant to review suggested fields and workflow. Apply suggestions here, then save the draft.</p><WebsiteSetupPage draftId={draft.id} version={draft.version} draft={website} dirty={dirty} step={step} panel={websitePanel} canRead canEdit={canEdit} pending={pending} revision={source.approvedVersion !== null} gmailAccess={view.business.gmailAccess} teammates={view.business.teammates} context={view.business} previewIdentity={view.business} previewContent={draft.configuration.type === 'website' ? { privacy: draft.configuration.content?.privacy ?? undefined, consent: draft.configuration.content?.consent ?? undefined, submitLabel: draft.configuration.content?.submitLabel, thankYou: draft.configuration.content?.thankYou } : undefined} canSuggest={assistant?.status === 'ready'} onDraft={setWebsite} onStep={next => route(next)} onPanel={panel => route('intake', panel)} onNavigate={navigate} onSave={save} onReview={() => route('review')} onGmailSetup={() => route('intake', 'account')} onSuggest={() => askSetup('Suggest website fields for my current brief. Prepare a review to apply to this unsaved draft.')} onUseFields={() => {}} />
    </> : <><p className="text-sm text-muted">Connect a Gmail account, then review matching rules and a representative sample. Publication requires separate checks.</p><GmailSetupPage draftId={draft.id} version={draft.version} draft={gmail} dirty={dirty} step={step} panel={gmailPanel} screen={gmailScreen} canRead canEdit={canEdit} pending={pending || gmailConnection.pending} revision={source.approvedVersion !== null} gmailAccess={view.business.gmailAccess} accounts={gmailConnection.accounts} accountsStatus={gmailConnection.status} teammates={view.business.teammates} messages={[]} connectionAvailable={gmailConnection.available} connectionError={gmailConnection.error} accountCapabilities={gmailConnection.capabilities} onSelectAccount={gmailConnection.select} onDisconnect={gmailConnection.disconnect} mailbox={mailbox} mailboxNotice={mailboxDirty && gmailConnection.available ? 'Save your draft before searching Gmail examples. Your current example is preserved.' : undefined} extractionAvailable={assistant?.status === 'ready'} sampleSetupAvailable={gmailConnection.available || assistant?.status === 'ready'} onDraft={setGmail} onStep={next => route(next)} onPanel={panel => route('intake', panel)} onScreen={setGmailScreen} onNavigate={navigate} onSave={save} onReview={() => route('review')} onWebsiteSetup={() => route('intake', 'brief')} onRequestExtract={() => askSetup('Extract and map the current email example. Prepare an extraction review with exact supporting quotes; do not connect Gmail.')} onRequestAssistant={message => askSetup(`Refine the current email example mapping: ${message}`)} onApproveSample={approveSample} onExtract={unavailable} onAssistant={unavailable} onMessages={() => {}} onSuggestions={() => {}} onConnect={gmailConnection.connect} onReconnect={gmailConnection.reconnect} onRetryAccounts={gmailConnection.reload} /></>}
    <ConfirmDialog open={reload} title={copy.reloadTitle} description={copy.reloadDescription} confirmLabel={copy.reload} pending={pending} onClose={() => setReload(false)} onConfirm={reloadDraft} />
    <ConfirmDialog open={leave !== null} title={copy.discardTitle} description={copy.discardDescription} confirmLabel={copy.discard} cancelLabel={copy.keep} onClose={() => setLeave(null)} onConfirm={() => { if (leave) { setWebsite(websiteDraftFrom(view)); setGmail(gmailDraftFrom(view)); router.push(leave); setLeave(null); } }} />
  </div>;
}
