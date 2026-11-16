'use client';
import { useEffect, useRef, useState } from 'react';
import { jobNotificationSettingsSnapshotSchema, type JobNotificationSettingsSnapshot, type JobNotificationSection, type SaveJobNotificationSettings } from '@salesmora/contracts';
import { JobNotificationSettingsPage } from './job-notification-settings-page';
import { jobNotificationSettingsRouteData as copy } from './job-notification-settings-route.data';
import { SettingsQueryBoundary, useSettingsRequest } from '../use-settings-request';
import { ApiRequestError } from '../../api/api-request';
import { isApiAccessError } from '../../api/api-query';
export function JobNotificationSettingsRoute({ workspaceId, initial }: { workspaceId: string; initial: JobNotificationSettingsSnapshot }) {
  return <SettingsQueryBoundary workspaceId={workspaceId}><JobNotificationSettingsHost workspaceId={workspaceId} initial={initial}/></SettingsQueryBoundary>;
}
function JobNotificationSettingsHost({ workspaceId, initial }: { workspaceId: string; initial: JobNotificationSettingsSnapshot }) {
  const path = `/api/settings/job-notifications?workspace=${encodeURIComponent(workspaceId)}`;
  const api = useSettingsRequest('job-notification-settings', path, jobNotificationSettingsSnapshotSchema.parse, copy.loadError);
  const [saved, setSaved] = useState(initial), [draft, setDraft] = useState({ deadline: initial.deadline.values, reminders: initial.reminders.values, events: initial.events.values });
  const [errors, setErrors] = useState<Partial<Record<JobNotificationSection, string>>>({}), [conflicts, setConflicts] = useState<Partial<Record<JobNotificationSection, boolean>>>({});
  const [busy, setBusy] = useState<JobNotificationSection | null>(null), [state, setState] = useState<'ready' | 'loading' | 'error'>('ready');
  const inFlight = useRef(false), active = useRef(true), receipts = useRef<Partial<Record<JobNotificationSection, { signature: string; id: string }>>>({});
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  async function request(body?: SaveJobNotificationSettings) {
    try {
      return body ? await api.write({ path, method: 'PUT', body, parse: jobNotificationSettingsSnapshotSchema.parse, failureMessage: copy.saveError }) : await api.read();
    } catch (error) {
      if (active.current && isApiAccessError(error)) { setState('error'); setSaved(v => ({ ...v, canManage: false })); }
      throw error;
    }
  }
  function accept(next: JobNotificationSettingsSnapshot, section?: JobNotificationSection) {
    if (!active.current) return;
    // Do not silently replace another section's draft or reviewed revision.
    setSaved(previous => section ? { ...previous, today: next.today, plan: next.plan, timezone: next.timezone, members: next.members, canManage: next.canManage, [section]: next[section] } : next);
    setDraft(previous => section ? { ...previous, [section]: next[section].values } : { deadline: next.deadline.values, reminders: next.reminders.values, events: next.events.values });
    setErrors(previous => section ? { ...previous, [section]: undefined } : {}); setConflicts(previous => section ? { ...previous, [section]: false } : {});
    if (section) delete receipts.current[section]; else receipts.current = {};
  }
  async function reload(section?: JobNotificationSection) {
    if (inFlight.current) return;
    inFlight.current = true; if (section) setBusy(section); else setState('loading');
    try { accept(await request(), section); if (active.current) setState('ready'); }
    catch { if (active.current) { if (section) setErrors(v => ({ ...v, [section]: copy.loadError })); else setState('error'); } }
    finally { inFlight.current = false; if (active.current) setBusy(null); }
  }
  async function save(input: Omit<Extract<SaveJobNotificationSettings, { section: 'deadline' }>, 'workspaceId' | 'submissionId'> | Omit<Extract<SaveJobNotificationSettings, { section: 'reminders' }>, 'workspaceId' | 'submissionId'> | Omit<Extract<SaveJobNotificationSettings, { section: 'events' }>, 'workspaceId' | 'submissionId'>) {
    if (inFlight.current) throw Error();
    inFlight.current = true; setBusy(input.section); setErrors(v => ({ ...v, [input.section]: undefined }));
    const signature = JSON.stringify(input), receipt = receipts.current[input.section];
    const submissionId = receipt?.signature === signature ? receipt.id : crypto.randomUUID();
    receipts.current[input.section] = { signature, id: submissionId };
    try { accept(await request({ ...input, workspaceId, submissionId }), input.section); }
    catch (error) {
      const status = error instanceof ApiRequestError ? error.status : undefined;
      if (active.current) {
        if (status === 409 || status === 422) setConflicts(v => ({ ...v, [input.section]: true }));
        setErrors(v => ({ ...v, [input.section]: status === 422 ? copy.invalid : copy.saveError }));
      }
      throw error;
    } finally { inFlight.current = false; if (active.current) setBusy(null); }
  }
  const common = (section: JobNotificationSection) => ({ revision: saved[section].revision, pending: busy === section, error: errors[section], conflict: conflicts[section] });
  const change = <K extends JobNotificationSection>(section: K, values: typeof draft[K]) => { setDraft(v => ({ ...v, [section]: values })); setErrors(v => ({ ...v, [section]: undefined })); };
  const discard = (section: JobNotificationSection) => { setDraft(v => ({ ...v, [section]: saved[section].values })); setErrors(v => ({ ...v, [section]: undefined })); };
  return <JobNotificationSettingsPage preferencesHref={`/settings/notifications?workspace=${encodeURIComponent(workspaceId)}`} deliveryPending plan={saved.plan} timezone={saved.timezone} canManage={saved.canManage} state={state} onRetry={() => { void reload(); }}
    deadline={{ ...common('deadline'), onReload: () => { void reload('deadline'); }, values: draft.deadline, savedValues: saved.deadline.values, exampleCreatedDate: saved.today, onChange: v => change('deadline', v), onDiscard: () => discard('deadline'), onSave: ({ revision, ...values }) => save({ section: 'deadline', values, revision }) }}
    reminders={{ ...common('reminders'), onReload: () => { void reload('reminders'); }, values: draft.reminders, savedValues: saved.reminders.values, members: saved.members, onChange: v => change('reminders', v), onDiscard: () => discard('reminders'), onSave: ({ revision, ...values }) => save({ section: 'reminders', values, revision }) }}
    events={{ ...common('events'), onReload: () => { void reload('events'); }, values: draft.events, savedValues: saved.events.values, onChange: v => change('events', v), onDiscard: () => discard('events'), onSave: ({ revision, emails }) => save({ section: 'events', values: emails, revision }) }}/>
}
