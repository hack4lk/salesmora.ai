'use client';
import { useEffect, useRef, useState } from 'react';
import { jobNotificationSettingsSnapshotSchema, type JobNotificationSettingsSnapshot, type JobNotificationSection, type SaveJobNotificationSettings } from '@salesmora/contracts';
import { JobNotificationSettingsPage } from './job-notification-settings-page';
import { jobNotificationSettingsRouteData as copy } from './job-notification-settings-route.data';
export function JobNotificationSettingsRoute({ workspaceId, initial }: { workspaceId: string; initial: JobNotificationSettingsSnapshot }) {
  const [saved, setSaved] = useState(initial), [draft, setDraft] = useState({ deadline: initial.deadline.values, reminders: initial.reminders.values, events: initial.events.values });
  const [errors, setErrors] = useState<Partial<Record<JobNotificationSection, string>>>({}), [conflicts, setConflicts] = useState<Partial<Record<JobNotificationSection, boolean>>>({});
  const [busy, setBusy] = useState<JobNotificationSection | null>(null), [state, setState] = useState<'ready' | 'loading' | 'error'>('ready');
  const inFlight = useRef(false), controllers = useRef(new Set<AbortController>()), receipts = useRef<Partial<Record<JobNotificationSection, { signature: string; id: string }>>>({});
  useEffect(() => { const active = controllers.current; return () => { for (const c of active) c.abort(); }; }, []);
  async function request(body?: SaveJobNotificationSettings) {
    const controller = new AbortController(); controllers.current.add(controller);
    try {
      const response = await fetch(`/api/settings/job-notifications?workspace=${encodeURIComponent(workspaceId)}`, { method: body ? 'PUT' : 'GET', cache: 'no-store', signal: controller.signal,
        ...(body ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}) });
      if (!response.ok) { if ([401, 404].includes(response.status)) { setState('error'); setSaved(v => ({ ...v, canManage: false })); } throw Object.assign(new Error(), { status: response.status }); }
      return jobNotificationSettingsSnapshotSchema.parse(await response.json());
    } finally { controllers.current.delete(controller); }
  }
  function accept(next: JobNotificationSettingsSnapshot, section?: JobNotificationSection) {
    // Do not silently replace another section's draft or reviewed revision.
    setSaved(previous => section ? { ...previous, today: next.today, plan: next.plan, timezone: next.timezone, members: next.members, canManage: next.canManage, [section]: next[section] } : next);
    setDraft(previous => section ? { ...previous, [section]: next[section].values } : { deadline: next.deadline.values, reminders: next.reminders.values, events: next.events.values });
    setErrors(previous => section ? { ...previous, [section]: undefined } : {}); setConflicts(previous => section ? { ...previous, [section]: false } : {});
    if (section) delete receipts.current[section]; else receipts.current = {};
  }
  async function reload(section?: JobNotificationSection) {
    if (inFlight.current) return;
    inFlight.current = true; if (section) setBusy(section); else setState('loading');
    try { accept(await request(), section); setState('ready'); }
    catch { if (section) setErrors(v => ({ ...v, [section]: copy.loadError })); else setState('error'); }
    finally { inFlight.current = false; setBusy(null); }
  }
  async function save(input: Omit<Extract<SaveJobNotificationSettings, { section: 'deadline' }>, 'workspaceId' | 'submissionId'> | Omit<Extract<SaveJobNotificationSettings, { section: 'reminders' }>, 'workspaceId' | 'submissionId'> | Omit<Extract<SaveJobNotificationSettings, { section: 'events' }>, 'workspaceId' | 'submissionId'>) {
    if (inFlight.current) throw Error();
    inFlight.current = true; setBusy(input.section); setErrors(v => ({ ...v, [input.section]: undefined }));
    const signature = JSON.stringify(input), receipt = receipts.current[input.section];
    const submissionId = receipt?.signature === signature ? receipt.id : crypto.randomUUID();
    receipts.current[input.section] = { signature, id: submissionId };
    try { accept(await request({ ...input, workspaceId, submissionId }), input.section); }
    catch (error) {
      const status = (error as { status?: number }).status;
      if (status === 409 || status === 422) setConflicts(v => ({ ...v, [input.section]: true }));
      setErrors(v => ({ ...v, [input.section]: status === 422 ? copy.invalid : copy.saveError })); throw error;
    } finally { inFlight.current = false; setBusy(null); }
  }
  const common = (section: JobNotificationSection) => ({ revision: saved[section].revision, pending: busy === section, error: errors[section], conflict: conflicts[section] });
  const change = <K extends JobNotificationSection>(section: K, values: typeof draft[K]) => { setDraft(v => ({ ...v, [section]: values })); setErrors(v => ({ ...v, [section]: undefined })); };
  const discard = (section: JobNotificationSection) => { setDraft(v => ({ ...v, [section]: saved[section].values })); setErrors(v => ({ ...v, [section]: undefined })); };
  return <JobNotificationSettingsPage settingsHref={`/settings?workspace=${encodeURIComponent(workspaceId)}`} preferencesHref={`/settings/notifications?workspace=${encodeURIComponent(workspaceId)}`} deliveryPending plan={saved.plan} timezone={saved.timezone} canManage={saved.canManage} state={state} onRetry={() => { void reload(); }}
    deadline={{ ...common('deadline'), onReload: () => { void reload('deadline'); }, values: draft.deadline, savedValues: saved.deadline.values, exampleCreatedDate: saved.today, onChange: v => change('deadline', v), onDiscard: () => discard('deadline'), onSave: ({ revision, ...values }) => save({ section: 'deadline', values, revision }) }}
    reminders={{ ...common('reminders'), onReload: () => { void reload('reminders'); }, values: draft.reminders, savedValues: saved.reminders.values, members: saved.members, onChange: v => change('reminders', v), onDiscard: () => discard('reminders'), onSave: ({ revision, ...values }) => save({ section: 'reminders', values, revision }) }}
    events={{ ...common('events'), onReload: () => { void reload('events'); }, values: draft.events, savedValues: saved.events.values, onChange: v => change('events', v), onDiscard: () => discard('events'), onSave: ({ revision, emails }) => save({ section: 'events', values: emails, revision }) }}/>
}
