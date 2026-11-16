import { StrictMode } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import {
  saveJobNotificationSettingsSchema, saveLeadAssignmentSettingsSchema, notificationPreferencesSchema,
  workOrderSettingsSchema, policyChangeSchema, estimateBusinessProfileRecordSchema,
} from '@salesmora/contracts';
import { ApiViewerProvider } from '../api/api-query-provider';
import { LeadSettingsRoute } from './lead-settings-page/lead-settings-route';
import { JobNotificationSettingsRoute } from './job-notification-settings-page/job-notification-settings-route';
import { WorkOrderSettingsRoute } from './work-order-settings-page/work-order-settings-route';
import { NotificationPreferencesRoute } from './notification-preferences-page/notification-preferences-route';
import { EstimateSettingsRoute } from './estimate-settings-page/estimate-settings-route';
import { PermissionsRoute } from './permissions-page/permissions-route';
import { AIUsageRoute } from './ai-usage-page/ai-usage-route';
import {
  settingsScope, leadSettingsFixture, jobSettingsFixture, estimateSettingsFixture, notificationPreferencesFixture,
  workOrderSettingsFixture, settingsPolicyFixture, aiUsageFixture,
} from './settings-queries.fixtures';
import { defaultLeadAssignmentData as leadCopy } from './default-lead-assignment/default-lead-assignment.data';
import { leadSettingsPageData as leadPageCopy } from './lead-settings-page/lead-settings-page.data';
import { defaultCompletionDeadlineData as deadlineCopy } from './default-completion-deadline/default-completion-deadline.data';
import { jobNotificationEventsData as eventCopy } from './job-notification-events/job-notification-events.data';
import { notificationPreferencesPageData as preferencesCopy } from './notification-preferences-page/notification-preferences-page.data';
import { workOrderSettingsPageData as orderCopy } from './work-order-settings-page/work-order-settings-page.data';
import { estimateBusinessProfileFormData as estimateCopy } from '../estimates/estimate-business-profile-form/estimate-business-profile-form.data';
import { permissionsPageData as permissionsCopy } from './permissions-page/permissions-page.data';
import { permissionsRouteData as identityCopy } from './permissions-page/permissions-route.data';
import { aiUsagePageData as usageCopy } from './ai-usage-page/ai-usage-page.data';

type Route = 'leads' | 'jobs' | 'work-orders' | 'notifications' | 'estimates' | 'permissions' | 'ai-usage';
function SettingsRouteStory({ route }: { route: Route }) {
  const workspaceId = settingsScope.workspaceId;
  switch (route) {
    case 'leads': return <LeadSettingsRoute initial={leadSettingsFixture}/>;
    case 'jobs': return <JobNotificationSettingsRoute workspaceId={workspaceId} initial={jobSettingsFixture}/>;
    case 'work-orders': return <WorkOrderSettingsRoute workspaceId={workspaceId} initial={workOrderSettingsFixture} canEdit/>;
    case 'notifications': return <NotificationPreferencesRoute workspaceId={workspaceId} initial={notificationPreferencesFixture}/>;
    case 'estimates': return <EstimateSettingsRoute workspaceId={workspaceId}
      timezone="America/New_York" initial={estimateSettingsFixture} canManage role="owner"/>;
    case 'permissions': return <PermissionsRoute email="owner@example.test" userId={settingsScope.viewerId}
      viewerRole="owner" policy={settingsPolicyFixture} defaultPolicy={settingsPolicyFixture}
      availablePermissions={['home.access', 'assistant.use', 'leads.read', 'leads.create', 'permissions.read', 'permissions.manage']}/>;
    case 'ai-usage': return <AIUsageRoute workspaceId={workspaceId} initialUsage={aiUsageFixture}/>;
  }
}
const reads = fn(), writes = fn(), identities = fn();
let readStatus = 200, writeStatus = 200, malformed = false;
let lead = structuredClone(leadSettingsFixture), jobs = structuredClone(jobSettingsFixture);
let record = structuredClone(estimateSettingsFixture), preferences = structuredClone(notificationPreferencesFixture);
const meta = {
  title: 'Settings/ConnectedSettingsRoutes', component: SettingsRouteStory,
  args: { route: 'leads' }, parameters: { layout: 'fullscreen' },
  decorators: [Story => <StrictMode><ApiViewerProvider viewerId={settingsScope.viewerId}><main className="mx-auto max-w-6xl p-4 sm:p-8"><Story/></main></ApiViewerProvider></StrictMode>],
  beforeEach: () => {
    reads.mockClear(); writes.mockClear(); identities.mockClear();
    readStatus = 200; writeStatus = 200; malformed = false;
    lead = structuredClone(leadSettingsFixture); jobs = structuredClone(jobSettingsFixture);
    record = structuredClone(estimateSettingsFixture); preferences = structuredClone(notificationPreferencesFixture);
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      const path = new URL(String(input), 'http://localhost').pathname;
      if (path === '/api/auth/sign-in/email') {
        identities();
        return Response.json({ user: { id: settingsScope.viewerId } });
      }
      if (!['/api/settings/leads', '/api/settings/job-notifications', '/api/settings/work-orders', '/api/settings/notifications',
        '/api/settings/estimates', '/api/permissions', '/api/ai-usage'].includes(path)) return original(input, init);
      if (!init?.method || init.method === 'GET') {
        reads(path);
        if (readStatus !== 200) return Response.json({ error: 'Settings unavailable.' }, { status: readStatus });
        if (malformed) return Response.json({});
        const responses: Record<string, unknown> = {
          '/api/settings/leads': lead, '/api/settings/job-notifications': jobs, '/api/settings/notifications': preferences,
          '/api/settings/estimates': { record, canManage: true, role: 'owner' },
          '/api/permissions': { policy: settingsPolicyFixture }, '/api/ai-usage': { usage: { ...aiUsageFixture, usedOrReservedTokens: '250' } },
        };
        if (!(path in responses)) throw new Error('Unexpected settings read.');
        return Response.json(responses[path]);
      }
      const body: unknown = JSON.parse(String(init.body));
      writes({ path, body });
      if (writeStatus !== 200) return Response.json({ error: 'Settings not saved.' }, { status: writeStatus });
      if (malformed) return Response.json({});
      if (path === '/api/settings/leads') {
        const command = saveLeadAssignmentSettingsSchema.parse(body);
        lead = { ...lead, version: lead.version + 1, value: command.value };
        return Response.json(lead);
      }
      if (path === '/api/settings/job-notifications') {
        const command = saveJobNotificationSettingsSchema.parse(body);
        jobs = { ...jobs, [command.section]: { revision: String(Number(command.revision) + 1), values: command.values } };
        return Response.json(jobs);
      }
      if (path === '/api/settings/work-orders') {
        const { workspaceId: _workspaceId, ...settings } = workOrderSettingsSchema.parse(body);
        void _workspaceId;
        return Response.json(settings);
      }
      if (path === '/api/settings/notifications') {
        if (!body || typeof body !== 'object' || !('workspaceId' in body)) throw new Error('Expected preferences workspace.');
        const { workspaceId: _workspaceId, ...values } = body;
        void _workspaceId;
        preferences = notificationPreferencesSchema.parse(values);
        return Response.json(preferences);
      }
      if (path === '/api/settings/estimates') {
        if (!body || typeof body !== 'object' || !('profile' in body)) throw new Error('Expected profile draft.');
        record = estimateBusinessProfileRecordSchema.parse({ ...record, profile: body.profile, version: record.version + 1 });
        return Response.json({ record });
      }
      if (path === '/api/permissions') return Response.json({ policy: policyChangeSchema.parse(body).policy });
      throw new Error('Unexpected settings command.');
    };
    return () => { globalThis.fetch = original; };
  },
} satisfies Meta<typeof SettingsRouteStory>;
export default meta;
type Story = StoryObj<typeof meta>;

async function editLead(canvasElement: HTMLElement) {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('radio', { name: leadCopy.teammate }));
  await userEvent.selectOptions(c.getByRole('combobox'), 'alex');
  return c;
}
export const LeadExactRetry: Story = { play: async ({ canvasElement }) => {
  const c = await editLead(canvasElement);
  writeStatus = 503;
  await userEvent.click(c.getByRole('button', { name: leadCopy.save }));
  await expect(await c.findByText(leadPageCopy.failed)).toBeVisible();
  await expect(c.getByRole('combobox')).toHaveValue('alex');
  await expect(writes).toHaveBeenCalledTimes(1);
  writeStatus = 200;
  await userEvent.click(c.getByRole('button', { name: leadCopy.save }));
  await waitFor(() => expect(writes).toHaveBeenCalledTimes(2));
  await expect(writes.mock.calls[0]).toEqual(writes.mock.calls[1]);
  await waitFor(() => expect(c.getByRole('button', { name: leadCopy.save })).toBeDisabled());
  await expect(reads).not.toHaveBeenCalled();
} };
export const LeadConflictReload: Story = { play: async ({ canvasElement }) => {
  const c = await editLead(canvasElement);
  writeStatus = 409;
  await userEvent.click(c.getByRole('button', { name: leadCopy.save }));
  await expect(await c.findByText(leadCopy.conflict)).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: leadCopy.reload }));
  const body = within(canvasElement.ownerDocument.body);
  await userEvent.click(body.getByRole('button', { name: leadPageCopy.reload }));
  await waitFor(() => expect(c.getByRole('radio', { name: leadCopy.unassigned })).toBeChecked());
  await expect(reads).toHaveBeenCalledTimes(1);
} };
export const JobIndependentSections: Story = { args: { route: 'jobs' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement), d = within(c.getByRole('region', { name: deadlineCopy.title })), e = within(c.getByRole('region', { name: eventCopy.title }));
  const checkbox = e.getByRole('checkbox', { name: eventCopy.emailLabel('Job status changed') });
  await userEvent.click(checkbox);
  await userEvent.click(d.getByRole('radio', { name: deadlineCopy.relative }));
  await userEvent.click(d.getByRole('button', { name: deadlineCopy.review }));
  await userEvent.click(within(canvasElement.ownerDocument.body).getByRole('button', { name: deadlineCopy.confirm }));
  await waitFor(() => expect(d.getByRole('button', { name: deadlineCopy.review })).toBeDisabled());
  await expect(checkbox).not.toBeChecked();
  await expect(e.getByRole('button', { name: eventCopy.review })).toBeEnabled();
  await expect(writes).toHaveBeenCalledTimes(1);
  await expect(writes.mock.calls[0][0].body).toMatchObject({ section: 'deadline', revision: '0' });
} };
export const WorkOrderSave: Story = { args: { route: 'work-orders' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('switch'));
  await userEvent.click(c.getByRole('button', { name: orderCopy.save }));
  await expect(await c.findByText(orderCopy.successTitle)).toBeVisible();
  await expect(c.getByRole('switch')).toBeChecked();
  await expect(writes).toHaveBeenCalledTimes(1);
} };
export const WorkOrderDenied: Story = { args: { route: 'work-orders' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  writeStatus = 403;
  await userEvent.click(c.getByRole('switch'));
  await userEvent.click(c.getByRole('button', { name: orderCopy.save }));
  await expect(await c.findByText(orderCopy.unavailable)).toBeVisible();
  await expect(c.queryByRole('switch')).not.toBeInTheDocument();
} };
export const PreferencesMalformedRetry: Story = { args: { route: 'notifications' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  malformed = true;
  await userEvent.click(c.getByRole('switch', { name: preferencesCopy.leadAssigned }));
  await userEvent.click(c.getByRole('button', { name: preferencesCopy.save }));
  await expect(await c.findByText(preferencesCopy.saveErrorTitle)).toBeVisible();
  await expect(c.getByRole('switch', { name: preferencesCopy.leadAssigned })).not.toBeChecked();
  malformed = false;
  await userEvent.click(c.getByRole('button', { name: preferencesCopy.save }));
  await expect(await c.findByText(preferencesCopy.successTitle)).toBeVisible();
  await expect(writes.mock.calls[0]).toEqual(writes.mock.calls[1]);
} };
export const PreferencesDeniedReload: Story = { args: { route: 'notifications' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  writeStatus = 423;
  await userEvent.click(c.getByRole('switch', { name: preferencesCopy.leadAssigned }));
  await userEvent.click(c.getByRole('button', { name: preferencesCopy.save }));
  await expect(await c.findByText(preferencesCopy.loadErrorTitle)).toBeVisible();
  await expect(c.queryByRole('switch')).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('button', { name: preferencesCopy.retry }));
  await expect(await c.findByRole('switch', { name: preferencesCopy.leadAssigned })).toBeChecked();
} };
export const EstimateSaveAndConflict: Story = { args: { route: 'estimates' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  fireEvent.change(c.getByRole('textbox', { name: estimateCopy.fields.name.label }), { target: { value: 'Northstar Updated' } });
  writeStatus = 409;
  await userEvent.click(c.getByRole('button', { name: estimateCopy.save }));
  await expect(await c.findByText(estimateCopy.errors.conflict)).toBeVisible();
  await expect(c.getByRole('textbox', { name: estimateCopy.fields.name.label })).toBeDisabled();
  await expect(writes.mock.calls[0][0].body).toMatchObject({ profile: { name: 'Northstar Updated' } });
  await userEvent.click(c.getByRole('button', { name: estimateCopy.reload }));
  await waitFor(() => expect(c.getByRole('textbox', { name: estimateCopy.fields.name.label })).toHaveValue(estimateSettingsFixture.profile.name));
  writeStatus = 200;
  fireEvent.change(c.getByRole('textbox', { name: estimateCopy.fields.name.label }), { target: { value: 'Northstar Updated' } });
  await userEvent.click(c.getByRole('button', { name: estimateCopy.save }));
  await expect(await c.findByText(estimateCopy.saved)).toBeVisible();
} };
export const UsageRefresh: Story = { args: { route: 'ai-usage' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(reads).not.toHaveBeenCalled();
  await userEvent.click(c.getByRole('button', { name: usageCopy.refresh }));
  await expect(await c.findByText('25% used or reserved')).toBeVisible();
  await expect(reads).toHaveBeenCalledTimes(1);
} };
export const UsageDenied: Story = { args: { route: 'ai-usage' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  readStatus = 403;
  await userEvent.click(c.getByRole('button', { name: usageCopy.refresh }));
  await expect(await c.findByText(usageCopy.errorTitle)).toBeVisible();
  await expect(c.queryByText('10% used or reserved')).not.toBeInTheDocument();
} };
export const PermissionsReauthentication: Story = { args: { route: 'permissions' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('switch', { name: permissionsCopy.labels['leads.create'] }));
  await userEvent.click(c.getByRole('button', { name: permissionsCopy.review }));
  writeStatus = 428;
  await userEvent.click(c.getByRole('button', { name: permissionsCopy.save }));
  await expect(await c.findByText(permissionsCopy.reauth)).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: permissionsCopy.reauthenticate }));
  const dialog = within(await body.findByRole('dialog', { name: identityCopy.identityTitle }));
  fireEvent.change(dialog.getByLabelText(identityCopy.password, { exact: false, selector: 'input' }), { target: { value: 'fictional-story-password' } });
  await waitFor(() => expect(dialog.getByRole('button', { name: identityCopy.confirm })).toBeEnabled());
  await userEvent.click(dialog.getByRole('button', { name: identityCopy.confirm }));
  await waitFor(() => expect(identities).toHaveBeenCalledTimes(1));
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  writeStatus = 200;
  await userEvent.click(c.getByRole('button', { name: permissionsCopy.save }));
  await expect(await c.findByText(permissionsCopy.successTitle)).toBeVisible();
  await expect(writes.mock.calls[0]).toEqual(writes.mock.calls[1]);
} };
