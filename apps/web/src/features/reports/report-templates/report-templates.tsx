'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import Dialog from '@mui/material/Dialog';
import { reportTemplateConfigurationSchema, reportTemplateSchema, reportTemplateListSchema, reportTemplateRunResultSchema,
  type ReportTemplate, type ReportTemplateArea, type ReportTemplateConfiguration,
  type ReportTemplatePeriod } from '@salesmora/contracts';
import { CloseOutlined, FormFeedback, SeafoamOutlineButton } from '@salesmora/ui';
import { ReportTemplateList, type ReportTemplateAction } from '../report-template-list/report-template-list';
import { ReportTemplateCallout } from '../report-template-callout/report-template-callout';
import { ReportTemplateNameDialog } from '../report-template-name-dialog/report-template-name-dialog';
import { ReportTemplateDeleteDialog } from '../report-template-delete-dialog/report-template-delete-dialog';
import { ReportTemplateUpdateDialog } from '../report-template-update-dialog/report-template-update-dialog';

type Props = {
  area: ReportTemplateArea; workspaceId: string; query: object; period: ReportTemplatePeriod | null;
  ready: boolean; active?: ReportTemplate;
  children?: ReactNode;
  listDialog?: { open: boolean; onOpen: () => void; onClose: () => void };
  onRun: (result: unknown, template: ReportTemplate) => void;
};
async function request(url: string, method: string, body?: unknown, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(url, { method, cache: 'no-store', signal,
    ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }) });
  if (!response.ok) {
    const raw: unknown = await response.json();
    const message = typeof raw === 'object' && raw !== null && 'error' in raw && typeof raw.error === 'string'
      ? raw.error : 'The template request could not be completed.';
    throw new Error(message);
  }
  return response.status === 204 ? undefined : response.json();
}
export function ReportTemplates(props: Props) {
  return <ReportTemplatesHost key={`${props.workspaceId}:${props.area}`} {...props} />;
}
function ReportTemplatesHost({ area, workspaceId, query, period, ready, active, onRun, children, listDialog }: Props) {
  const id = useId();
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string>(), [pending, setPending] = useState(false), [retry, setRetry] = useState(0);
  const [dialog, setDialog] = useState<{ kind: 'save' } | { kind: 'rename' | 'delete' | 'update'; template: ReportTemplate }>();
  const mounted = useRef(true);
  const currentReport = useRef('');
  const reportKey = JSON.stringify({ workspaceId, area, query, period, ready });
  useLayoutEffect(() => { currentReport.current = reportKey; }, [reportKey]);
  useLayoutEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  const isCurrent = () => mounted.current;
  useEffect(() => {
    const abort = new AbortController();
    void (async () => {
      try {
        const params = new URLSearchParams({ workspaceId, area });
        const list = reportTemplateListSchema.parse(await request(`/api/reports/templates?${params}`, 'GET', undefined, abort.signal));
        if (list.some(item => item.workspaceId !== workspaceId || item.area !== area)) throw new Error('Template list does not match this report.');
        if (!abort.signal.aborted) { setTemplates(list); setState('ready'); }
      } catch (failure) {
        if (!abort.signal.aborted) { setState('error'); setError(failure instanceof Error ? failure.message : 'Templates could not be loaded.'); }
      }
    })();
    return () => abort.abort();
  }, [workspaceId, area, retry]);
  const list = templates.map(template => ({
    id: template.id, name: template.name, viewLabel: String(template.configuration.query.view),
    periodLabel: template.configuration.period?.preset === 'custom'
      ? `${template.configuration.period.from} – ${template.configuration.period.to}`
      : template.configuration.period?.preset === 'last30days' ? 'Last 30 days, recalculated'
        : template.configuration.period?.preset === 'next7days' ? 'Next 7 days, recalculated' : 'Current snapshot',
    assignmentLabel: 'Current authorized scope', groupLabel: 'Saved report selection',
    allowedActions: ['run', 'edit', 'rename', 'delete'] as ReportTemplateAction[],
  }));
  const { workspaceId: ignoredWorkspace, page, pageSize, period: ignoredPeriod, ...savedQuery } = query as Record<string, unknown>;
  void ignoredWorkspace; void page; void pageSize; void ignoredPeriod;
  const parsedConfiguration = reportTemplateConfigurationSchema.safeParse({ area, query: savedQuery, period });
  const config = parsedConfiguration.success ? parsedConfiguration.data : undefined;
  const canSave = ready && !!config;
  const refresh = () => { setState('loading'); setError(undefined); setRetry(value => value + 1); };
  async function mutate(work: () => Promise<void>) {
    if (pending) throw new Error('A template operation is already in progress.');
    setPending(true); setError(undefined);
    try { await work(); if (isCurrent()) setDialog(undefined); }
    catch (failure) {
      if (isCurrent()) setError(failure instanceof Error ? failure.message : 'Template operation failed.');
      throw failure;
    } finally { if (isCurrent()) setPending(false); }
  }
  const activeTemplate = active && templates.find(item => item.id === active.id);
  const save = async (name: string) => mutate(async () => {
    if (!config) throw new Error('Choose a valid configuration. A selected individual day cannot be saved with a rolling period.');
    const saved = reportTemplateSchema.parse(await request('/api/reports/templates', 'POST',
      { workspaceId, name, configuration: config }));
    if (saved.workspaceId !== workspaceId || saved.area !== area) throw new Error('Saved template does not match this report.');
    if (isCurrent()) setTemplates(current => [...current, saved]);
  });
  const patch = async (template: ReportTemplate, payload: { name?: string; configuration?: ReportTemplateConfiguration }) =>
    mutate(async () => {
      const saved = reportTemplateSchema.parse(await request(`/api/reports/templates/${encodeURIComponent(template.id)}`, 'PATCH',
        { workspaceId, version: template.version, ...payload }));
      if (saved.id !== template.id || saved.workspaceId !== workspaceId || saved.area !== area) throw new Error('Updated template does not match this report.');
      if (isCurrent()) setTemplates(current => current.map(item => item.id === saved.id ? saved : item));
    });
  const run = async (template: ReportTemplate) => {
    const reportAtStart = currentReport.current;
    try {
      await mutate(async () => {
        const raw = await request(`/api/reports/templates/${encodeURIComponent(template.id)}/run`, 'POST', { workspaceId });
        const result = reportTemplateRunResultSchema.parse(raw);
        if (result.template.id !== template.id || result.template.workspaceId !== workspaceId || result.template.area !== area) {
          throw new Error('Template run does not match this report.');
        }
        if (result.template.version !== template.version) {
          throw new Error('The template changed. Refresh the list and run it again.');
        }
        if (isCurrent() && currentReport.current !== reportAtStart) {
          throw new Error('The report changed while the template was running. Run the template again.');
        }
        if (isCurrent()) onRun(result.result, result.template);
      });
    } catch (failure) {
      if (isCurrent()) setError(failure instanceof Error ? failure.message : 'Template run failed.');
    }
  };
  const templateList = <ReportTemplateList templates={list} canRead canCreate={canSave} state={state}
    pendingIds={pending ? templates.map(item => item.id) : []}
    onCreate={() => { setError(undefined); setDialog({ kind: 'save' }); }}
    onRetry={refresh}
    onAction={(item, action) => {
      const template = templates.find(value => value.id === item.id);
      if (!template || pending) return;
      if (action === 'run' || action === 'edit') void run(template);
      else { setError(undefined); setDialog({ kind: action, template }); }
    }} />;
  return <div id={`report-templates-${area}`} className="grid min-w-0 gap-4">
    {error && <FormFeedback kind="error" message={error} />}
    {error && state === 'ready' && !pending && <div>
      <SeafoamOutlineButton label="Refresh templates" onClick={refresh} />
    </div>}
    {ready && !config && <FormFeedback kind="error"
      message="This selection cannot be saved as a template. Clear any individual-day selection or choose a fixed date range." />}
    {listDialog ? <Dialog open={listDialog.open && !dialog} maxWidth="md" fullWidth scroll="paper"
      onClose={() => { if (!pending) listDialog.onClose(); }}
      slotProps={{ backdrop: { className: 'bg-ink/50' }, paper: {
        'aria-labelledby': `${id}-templates-title`, className: 'm-4 min-w-0 rounded-2xl bg-paper text-ink sm:m-8',
      } }}>
      <div className="grid min-w-0 gap-4 p-4 sm:p-6">
        <header className="flex items-center justify-between gap-4">
          <h2 id={`${id}-templates-title`} className="m-0 text-xl font-semibold">My Templates</h2>
          <button type="button" aria-label="Close templates" disabled={pending}
            onClick={listDialog.onClose}
            className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-line text-primary hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50">
            <CloseOutlined aria-hidden="true" />
          </button>
        </header>
        {error && <FormFeedback kind="error" message={error} />}
        {templateList}
      </div>
    </Dialog> : <div className={children ? 'px-4 pt-4 sm:px-8' : undefined}>
      <div className={children && area === 'overview' ? 'mx-auto max-w-6xl' : undefined}>
        {templateList}
      </div>
    </div>}
    {children}
    <div className={children ? 'px-4 pb-4 sm:px-8 sm:pb-8' : undefined}>
      <div className={children && area === 'overview' ? 'mx-auto max-w-6xl' : undefined}>
        <ReportTemplateCallout configurationLabel={`Current ${area} report configuration`}
          canRead canSave={canSave && state === 'ready'} pending={pending}
          activeTemplate={activeTemplate && { id: activeTemplate.id, name: activeTemplate.name, canUpdate: canSave }}
          onSave={() => { setError(undefined); setDialog({ kind: 'save' }); }}
          onUpdate={() => { if (activeTemplate) { setError(undefined); setDialog({ kind: 'update', template: activeTemplate }); } }}
          onViewTemplates={() => listDialog ? listDialog.onOpen()
            : document.getElementById(`report-templates-${area}`)?.scrollIntoView({ behavior: 'smooth' })} />
      </div>
    </div>
    {dialog?.kind === 'save' && <ReportTemplateNameDialog open mode="save" reportLabel={area} initialName=""
      existingTemplates={templates} canSave={canSave} pending={pending} error={error}
      onClose={() => setDialog(undefined)} onSave={save} />}
    {dialog?.kind === 'rename' && <ReportTemplateNameDialog open mode="rename" templateId={dialog.template.id}
      reportLabel={area} initialName={dialog.template.name} existingTemplates={templates} canSave pending={pending} error={error}
      onClose={() => setDialog(undefined)} onSave={name => patch(dialog.template, { name })} />}
    {dialog?.kind === 'update' && <ReportTemplateUpdateDialog open template={dialog.template} canUpdate={canSave}
      pending={pending} error={error} onClose={() => setDialog(undefined)}
      onConfirm={() => config
        ? patch(dialog.template, { configuration: config })
        : mutate(async () => { throw new Error('The current report configuration is invalid.'); })} />}
    {dialog?.kind === 'delete' && <ReportTemplateDeleteDialog open template={dialog.template} canDelete
      pending={pending} error={error} onClose={() => setDialog(undefined)} onConfirm={() => mutate(async () => {
        await request(`/api/reports/templates/${encodeURIComponent(dialog.template.id)}`, 'DELETE',
          { workspaceId, version: dialog.template.version });
        if (isCurrent()) setTemplates(current => current.filter(item => item.id !== dialog.template.id));
      })} />}
  </div>;
}
