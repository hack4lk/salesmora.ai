import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';
import { AdminFrame } from '../admin-frame/admin-frame';
import { AdminUserManagement } from './admin-user-management';
import {
  adminCustomerUserPreviews,
  adminUserDetailSupplementalPreview,
  adminUserManagementData as copy,
} from './admin-user-management.data';
import { adminUserSuspensionData } from './admin-user-suspension-copy.data';
import { adminUserSessionActionsData } from './admin-user-session-actions-copy.data';
import { adminUserPasswordResetData } from './admin-user-password-reset-copy.data';
import { adminUserEmailVerificationData } from './admin-user-email-verification-copy.data';
import { adminUserEmailChangeData } from './admin-user-email-change-copy.data';
import { adminUserPrivacyData } from './admin-user-privacy-copy.data';

type Mode = 'normal' | 'unavailable' | 'denied' | 'invalid' | 'detail-unavailable' | 'slow-detail'
  | 'suspension-denied' | 'sessions-denied' | 'password-reset-denied' | 'password-reset-unavailable'
  | 'email-verification-denied' | 'email-change' | 'email-change-denied' | 'privacy-denied' | 'history-denied';

function mock(mode: Mode = 'normal') {
  const original = window.fetch;
  const suspensionStates = new Map<string, boolean>();
  const verificationStates = new Map<string, boolean>();
  const pendingEmailChanges = new Map<string, { maskedNewEmail: string; expiresAt: string }>();
  const pendingActions = new Map<string, 'suspend' | 'unsuspend'>();
  const revealEvents: Array<{ field: 'email' | 'session_ips'; reason: string }> = [];
  const sessionRows = new Map<string, Array<{
    id: string;
    device: string;
    maskedIp: string | null;
    createdAt: string;
    lastActivityAt: string;
  }>>();
  function sessionsFor(userId: string) {
    let rows = sessionRows.get(userId);
    if (!rows) {
      rows = adminUserDetailSupplementalPreview.sessions.map((session, index) => ({
        ...session,
        id: `${userId}-storybook-session-${index}`,
      }));
      sessionRows.set(userId, rows);
    }
    return rows;
  }
  window.fetch = async (input, init) => {
    const url = new URL(String(input), window.location.origin);
    if (url.pathname === '/api/admin/users') {
      const filters = JSON.parse(String(init?.body)) as { query?: string; status?: string; page?: number };
      if (mode === 'unavailable') throw new Error('Fictional network failure.');
      if (mode === 'denied') return Response.json({ error: 'Your current role cannot read customer users.' }, { status: 403 });
      if (mode === 'invalid') return Response.json({ users: 'not-an-array' });

      const query = filters.query?.toLowerCase() ?? '';
      const status = filters.status ?? 'all';
      const filtered = adminCustomerUserPreviews.filter(user => {
        const statusMatch = status === 'all' ||
          (status === 'deletion_pending' ? Boolean(user.deletionRequestedAt) :
            status === 'suspended' ? Boolean(user.suspendedAt) :
              status === 'unverified' ? !user.emailVerified :
                user.emailVerified && !user.suspendedAt && !user.deletionRequestedAt);
        const queryMatch = !query || [user.name, user.maskedEmail, user.id, ...user.memberships.map(item => item.workspaceName)]
          .some(value => value.toLowerCase().includes(query));
        return statusMatch && queryMatch;
      });
      return Response.json({
        users: filtered,
        total: filtered.length,
        page: filters.page ?? 0,
        pageSize: 20,
      });
    }
    const suspensionMatch = url.pathname.match(/^\/api\/admin\/users\/([^/]+)\/suspension$/);
    if (suspensionMatch) {
      const userId = decodeURIComponent(suspensionMatch[1]);
      if (init?.method !== 'POST') return Response.json({ methods: ['totp'] });
      const operation = JSON.parse(String(init.body)) as { operation: string; action?: 'suspend' | 'unsuspend'; token?: string };
      if (mode === 'suspension-denied' && operation.operation === 'factor') {
        return Response.json({ error: 'Your current role cannot manage customer account access.' }, { status: 403 });
      }
      if (operation.operation === 'start' && operation.action) {
        const token = 's'.repeat(43);
        pendingActions.set(token, operation.action);
        return Response.json({
          token,
          options: { challenge: 'storybook-challenge', rpId: 'localhost', userVerification: 'required', allowCredentials: [] },
        });
      }
      if (operation.operation === 'factor') return Response.json({ verified: true });
      if (operation.operation === 'commit' && operation.token) {
        const action = pendingActions.get(operation.token);
        if (!action) return Response.json({ error: 'Verification expired.' }, { status: 401 });
        const suspended = action === 'suspend';
        suspensionStates.set(userId, suspended);
        pendingActions.delete(operation.token);
        return Response.json({ action, changed: true, suspendedAt: suspended ? '2026-01-15T12:00:00.000Z' : null });
      }
      return Response.json({ error: 'Unexpected suspension operation.' }, { status: 400 });
    }
    const passwordResetMatch = url.pathname.match(/^\/api\/admin\/users\/([^/]+)\/password-reset$/);
    if (passwordResetMatch) {
      if (mode === 'password-reset-denied') {
        return Response.json({ error: 'Your current role cannot request customer password resets.' }, { status: 403 });
      }
      if (mode === 'password-reset-unavailable') {
        return Response.json({ error: adminUserPasswordResetData.failed }, { status: 503 });
      }
      return Response.json({ requested: true });
    }
    const emailVerificationMatch = url.pathname.match(/^\/api\/admin\/users\/([^/]+)\/email-verification$/);
    if (emailVerificationMatch) {
      if (mode === 'email-verification-denied') {
        return Response.json({ error: 'Your current role cannot manage customer email verification.' }, { status: 403 });
      }
      if (init?.method !== 'POST') return Response.json({ methods: ['totp'] });
      const operation = JSON.parse(String(init.body)) as { operation: string; userId?: string; token?: string };
      if (operation.operation === 'resend') return Response.json({ requested: true });
      if (operation.operation === 'start') {
        return Response.json({
          token: 'e'.repeat(43),
          methods: ['totp'],
          options: { challenge: 'storybook-email-challenge', rpId: 'localhost', userVerification: 'required', allowCredentials: [] },
        });
      }
      if (operation.operation === 'factor') return Response.json({ verified: true });
      if (operation.operation === 'commit') {
        verificationStates.set(decodeURIComponent(emailVerificationMatch[1]), true);
        return Response.json({ changed: true });
      }
      return Response.json({ error: 'Unexpected email-verification operation.' }, { status: 400 });
    }
    const emailChangeMatch = url.pathname.match(/^\/api\/admin\/users\/([^/]+)\/email-change$/);
    if (emailChangeMatch) {
      if (mode === 'email-change-denied') {
        return Response.json({ error: 'Your current role cannot change customer email addresses.' }, { status: 403 });
      }
      const userId = decodeURIComponent(emailChangeMatch[1]);
      if (init?.method !== 'POST') return Response.json({ methods: ['totp'] });
      const operation = JSON.parse(String(init?.body)) as { operation: string; email?: string; token?: string };
      if (operation.operation === 'start') {
        return Response.json({
          token: 'm'.repeat(43),
          methods: ['totp'],
          options: { challenge: 'storybook-email-change-challenge', rpId: 'localhost', userVerification: 'required', allowCredentials: [] },
        });
      }
      if (operation.operation === 'factor') return Response.json({ verified: true });
      if (operation.operation === 'commit') {
        const pending = { maskedNewEmail: 'ne••••@example.test', expiresAt: '2026-11-01T12:00:00.000Z' };
        pendingEmailChanges.set(userId, pending);
        return Response.json({ requested: true, ...pending });
      }
      return Response.json({ error: 'Unexpected email-change operation.' }, { status: 400 });
    }
    const piiMatch = url.pathname.match(/^\/api\/admin\/users\/([^/]+)\/pii$/);
    if (piiMatch) {
      if (mode === 'privacy-denied') {
        return Response.json({ error: 'Your current role cannot reveal customer personal information.' }, { status: 403 });
      }
      if (init?.method !== 'POST') return Response.json({ error: 'Privacy reveal requires a reason.' }, { status: 405 });
      const userId = decodeURIComponent(piiMatch[1]);
      const operation = JSON.parse(String(init.body)) as { field: 'email' | 'session_ips'; reason: string };
      revealEvents.unshift(operation);
      if (operation.field === 'email') {
        const user = adminCustomerUserPreviews.find(item => item.id === userId);
        return Response.json({ field: 'email', value: user ? `jordan.lee@${user.maskedEmail.split('@')[1]}` : 'customer@example.test' });
      }
      return Response.json({
        field: 'session_ips',
        sessions: sessionsFor(userId).map((session, index) => ({
          device: session.device,
          ipAddress: index === 0 ? '73.162.45.18' : '174.204.88.203',
          createdAt: session.createdAt,
          lastActivityAt: session.lastActivityAt,
        })),
      });
    }
    const staffActionsMatch = url.pathname.match(/^\/api\/admin\/users\/([^/]+)\/staff-actions$/);
    if (staffActionsMatch) {
      if (mode === 'history-denied') {
        return Response.json({ error: 'Your current role cannot read related staff actions.' }, { status: 403 });
      }
      const actions = [
        ...revealEvents.map((event, index) => ({
          sequence: String(20 - index),
          occurredAt: '2026-11-02T10:00:00.000Z',
          actorName: 'Alex Chen',
          actorRole: 'billing',
          action: 'customer.user.pii.revealed',
          reason: event.reason,
        })),
        {
          sequence: '1',
          occurredAt: '2026-11-01T10:00:00.000Z',
          actorName: 'Riley Morgan',
          actorRole: 'support',
          action: 'customer.user.profile.read',
          reason: null,
        },
      ];
      return Response.json({ actions, nextCursor: null });
    }
    const sessionsMatch = url.pathname.match(/^\/api\/admin\/users\/([^/]+)\/sessions$/);
    if (sessionsMatch) {
      const userId = decodeURIComponent(sessionsMatch[1]);
      if (mode === 'sessions-denied') {
        return Response.json({ error: 'Your current role cannot revoke customer sessions.' }, { status: 403 });
      }
      const rows = sessionsFor(userId);
      if (init?.method !== 'POST') return Response.json({ sessions: rows, totalSessions: rows.length });
      const operation = JSON.parse(String(init.body)) as {
        scope: 'all' | 'selected';
        sessionIds?: string[];
        reason: string;
      };
      const removed = operation.scope === 'all' ? rows.length : rows.filter(row => operation.sessionIds?.includes(row.id)).length;
      const remaining = operation.scope === 'all' ? [] : rows.filter(row => !operation.sessionIds?.includes(row.id));
      sessionRows.set(userId, remaining);
      return Response.json({ revoked: removed });
    }
    if (url.pathname.startsWith('/api/admin/users/')) {
      if (mode === 'detail-unavailable') return Response.json({ error: copy.detailUnavailable }, { status: 503 });
      if (mode === 'slow-detail') await new Promise(resolve => setTimeout(resolve, 750));
      const user = adminCustomerUserPreviews.find(item => item.id === decodeURIComponent(url.pathname.slice('/api/admin/users/'.length)));
      const suspended = user && suspensionStates.get(user.id);
      const verified = user && verificationStates.get(user.id);
      const sessions = sessionsFor(decodeURIComponent(url.pathname.slice('/api/admin/users/'.length)));
      return user ? Response.json({
        user: {
          ...user,
          ...(suspensionStates.has(user.id) ? { suspendedAt: suspended ? '2026-01-15T12:00:00.000Z' : null } : {}),
          ...(verified ? { emailVerified: true } : {}),
        },
        supplemental: {
          ...adminUserDetailSupplementalPreview,
          sessions: sessions.map(({ device, maskedIp, createdAt, lastActivityAt }) => ({
            device, maskedIp, createdAt, lastActivityAt,
          })),
          totalSessions: sessions.length,
        },
        permissions: {
          canSuspend: true, canRevokeSessions: true, canRequestPasswordReset: true, canManageEmailVerification: true,
          canChangeEmail: mode === 'email-change' || mode === 'email-change-denied',
          canRevealPii: true,
          canReadRelatedAudit: true,
        },
        pendingEmailChange: pendingEmailChanges.get(user.id) ?? null,
      }) : Response.json({ error: 'Customer user not found.' }, { status: 404 });
    }
    throw new Error(`Unexpected Storybook request: ${url.pathname}`);
  };
  return () => { window.fetch = original; };
}

const meta = {
  title: 'Admin/Customers/AdminUserManagement',
  component: AdminUserManagement,
  decorators: [Story => <AdminFrame environment="local" contentWidth="wide"><Story /></AdminFrame>],
  args: {
    initialDirectory: {
      users: [...adminCustomerUserPreviews],
      total: adminCustomerUserPreviews.length,
      page: 0,
      pageSize: 20,
    },
  },
  beforeEach: () => mock(),
} satisfies Meta<typeof AdminUserManagement>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Directory: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: copy.title })).toBeVisible();
    await expect(canvas.getByText(copy.liveNotice)).toBeVisible();
    await expect(canvas.getByText(adminCustomerUserPreviews[0].maskedEmail)).toBeVisible();
    await expect(canvas.queryByText(copy.previewNotice)).not.toBeInTheDocument();
  },
};

export const Search: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const search = canvas.getByRole('searchbox', { name: copy.search });
    await userEvent.type(search, 'Jordan');
    await waitFor(() => expect(canvas.getByText(copy.results(1, 1, 1))).toBeVisible());
    await expect(canvas.getByText('Jordan Lee')).toBeVisible();
    await expect(canvas.queryByText('Morgan Patel')).not.toBeInTheDocument();
  },
};

export const StatusFilter: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: copy.statuses.suspended }));
    await waitFor(() => expect(canvas.getByText(copy.results(1, 1, 1))).toBeVisible());
    await expect(canvas.getByText('Casey Rivera')).toBeVisible();
    await expect(canvas.queryByText('Jordan Lee')).not.toBeInTheDocument();
  },
};

export const CustomerProfile: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Jordan Lee/ }));
    await waitFor(() => expect(canvas.getByRole('heading', { name: 'Jordan Lee' })).toBeVisible());
    await expect(canvas.getByText(adminCustomerUserPreviews[0].maskedEmail)).toBeVisible();
    await expect(canvas.getByText('Northstar Home Services')).toBeVisible();
    await expect(canvas.getByText(copy.liveDetailNotice)).toBeVisible();
    await expect(canvas.getByText('Chrome on macOS')).toBeVisible();
    await expect(canvas.getByText('73.162.x.x')).toBeVisible();
    await expect(canvas.getByText(copy.notificationPreferenceLabels.deadlineReminderEmail)).toBeVisible();
  },
};

export const U8ReasonedPrivacy: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: /Jordan Lee/ }));
    await waitFor(() => expect(canvas.getByRole('heading', { name: adminUserPrivacyData.staffActions })).toBeVisible());
    await expect(canvas.getByText(adminUserPrivacyData.phoneUnavailable)).toBeVisible();
    await expect(canvas.queryByRole('button', { name: /reveal phone/i })).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: adminUserPrivacyData.revealEmail }));
    const emailDialog = within(body.getByRole('alertdialog'));
    fireEvent.change(emailDialog.getByRole('textbox', { name: adminUserPrivacyData.reason }), {
      target: { value: 'Customer requested identity verification' },
    });
    await waitFor(() => expect(emailDialog.getByRole('button', { name: adminUserPrivacyData.confirm })).toBeEnabled());
    await userEvent.click(emailDialog.getByRole('button', { name: adminUserPrivacyData.confirm }));
    await waitFor(() => expect(canvas.getByText('jordan.lee@northstar.example')).toBeVisible());
    await expect(canvas.getByText(adminUserPrivacyData.visibleUntilLeave)).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: adminUserSessionActionsData.revealIps }));
    const ipDialog = within(body.getByRole('alertdialog'));
    fireEvent.change(ipDialog.getByRole('textbox', { name: adminUserSessionActionsData.reason }), {
      target: { value: 'Customer asked us to review sign-in locations' },
    });
    await waitFor(() => expect(ipDialog.getByRole('button', { name: adminUserSessionActionsData.revealConfirm })).toBeEnabled());
    await userEvent.click(ipDialog.getByRole('button', { name: adminUserSessionActionsData.revealConfirm }));
    await waitFor(() => expect(canvas.getByText(/73\.162\.45\.18/)).toBeVisible());
    await expect(canvas.getByText(/174\.204\.88\.203/)).toBeVisible();
    await waitFor(() => expect(canvas.getByText(
      'Reason: “Customer asked us to review sign-in locations”',
    )).toBeVisible());
  },
};

export const RevokeSelectedSession: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: /Jordan Lee/ }));
    await waitFor(() => expect(canvas.getAllByRole('button', { name: adminUserSessionActionsData.revoke })).toHaveLength(2));
    await userEvent.click(canvas.getAllByRole('button', { name: adminUserSessionActionsData.revoke })[0]);
    fireEvent.change(body.getByRole('textbox', { name: adminUserSessionActionsData.reason }), {
      target: { value: 'Reviewed this device session' },
    });
    await waitFor(() => expect(body.getByRole('button', { name: adminUserSessionActionsData.confirmOne })).toBeEnabled());
    await userEvent.click(body.getByRole('button', { name: adminUserSessionActionsData.confirmOne }));
    await waitFor(() => expect(canvas.getByText(adminUserSessionActionsData.revoked(1))).toBeVisible());
    await expect(canvas.getByText('Safari on iPhone')).toBeVisible();
    await waitFor(() => expect(canvas.getByText(adminUserSuspensionData.activeSessions(1))).toBeVisible());
  },
};

export const SignOutAllSessions: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: /Jordan Lee/ }));
    await waitFor(() => expect(canvas.getByRole('button', { name: adminUserSessionActionsData.signOutAll })).toBeVisible());
    await userEvent.click(canvas.getByRole('button', { name: adminUserSessionActionsData.signOutAll }));
    fireEvent.change(body.getByRole('textbox', { name: adminUserSessionActionsData.reason }), {
      target: { value: 'Requested sign-out from all devices' },
    });
    await waitFor(() => expect(body.getByRole('button', { name: adminUserSessionActionsData.confirmAll })).toBeEnabled());
    await userEvent.click(body.getByRole('button', { name: adminUserSessionActionsData.confirmAll }));
    await waitFor(() => expect(canvas.getByText(adminUserSessionActionsData.revoked(2))).toBeVisible());
    await expect(canvas.getByText(adminUserSessionActionsData.noSessions)).toBeVisible();
    await waitFor(() => expect(canvas.getByText(adminUserSuspensionData.activeSessions(0))).toBeVisible());
  },
};

export const SessionRevocationAccessDenied: Story = {
  beforeEach: () => mock('sessions-denied'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Jordan Lee/ }));
    await waitFor(() => expect(canvas.getByRole('alert')).toHaveTextContent(
      'Your current role cannot revoke customer sessions.',
    ));
    await expect(canvas.queryByRole('heading', { name: 'Jordan Lee' })).not.toBeInTheDocument();
  },
};

export const SuspendCustomer: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: /Jordan Lee/ }));
    await waitFor(() => expect(canvas.getByRole('button', { name: adminUserSuspensionData.suspend })).toBeVisible());
    await userEvent.click(canvas.getByRole('button', { name: adminUserSuspensionData.suspend }));
    fireEvent.change(body.getByRole('textbox', { name: adminUserSuspensionData.reason }), {
      target: { value: 'Verified support review' },
    });
    await waitFor(() => expect(body.getByRole('button', { name: adminUserSuspensionData.continue })).toBeEnabled());
    await userEvent.click(body.getByRole('button', { name: adminUserSuspensionData.continue }));
    await waitFor(() => expect(body.getByRole('textbox', { name: adminUserSuspensionData.code })).toBeVisible());
    fireEvent.change(body.getByRole('textbox', { name: adminUserSuspensionData.code }), { target: { value: '123456' } });
    await waitFor(() => expect(body.getByRole('button', { name: adminUserSuspensionData.verifySuspend })).toBeEnabled());
    await userEvent.click(body.getByRole('button', { name: adminUserSuspensionData.verifySuspend }));
    await waitFor(() => expect(canvas.getByText('Account is suspended')).toBeVisible());
    await expect(canvas.getByText(adminUserSuspensionData.suspended)).toBeVisible();
  },
};

export const PasswordResetRequest: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: /Jordan Lee/ }));
    await waitFor(() => expect(canvas.getByRole('button', { name: adminUserPasswordResetData.action })).toBeVisible());
    await userEvent.click(canvas.getByRole('button', { name: adminUserPasswordResetData.action }));
    fireEvent.change(body.getByRole('textbox', { name: adminUserPasswordResetData.reason }), {
      target: { value: 'Customer cannot access their account' },
    });
    await waitFor(() => expect(body.getByRole('button', { name: adminUserPasswordResetData.confirm })).toBeEnabled());
    await userEvent.click(body.getByRole('button', { name: adminUserPasswordResetData.confirm }));
    await waitFor(() => expect(canvas.getByText(adminUserPasswordResetData.success(adminCustomerUserPreviews[0].maskedEmail))).toBeVisible());
    await expect(canvas.getByText(adminUserPasswordResetData.auditReason('Customer cannot access their account'))).toBeVisible();
  },
};

export const ResendVerificationEmail: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: /Taylor Kim/ }));
    await waitFor(() => expect(canvas.getByRole('button', { name: adminUserEmailVerificationData.resend })).toBeVisible());
    await userEvent.click(canvas.getByRole('button', { name: adminUserEmailVerificationData.resend }));
    fireEvent.change(body.getByRole('textbox', { name: adminUserEmailVerificationData.reason }), {
      target: { value: 'Customer requested another verification email' },
    });
    await waitFor(() => expect(body.getByRole('button', { name: adminUserEmailVerificationData.resendConfirm })).toBeEnabled());
    await userEvent.click(body.getByRole('button', { name: adminUserEmailVerificationData.resendConfirm }));
    await waitFor(() => expect(canvas.getByText(
      adminUserEmailVerificationData.resent(adminCustomerUserPreviews[2].maskedEmail),
    )).toBeVisible());
    await expect(canvas.getByText(adminUserEmailVerificationData.auditReason(
      'Customer requested another verification email',
    ))).toBeVisible();
  },
};

export const MarkEmailVerified: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: /Taylor Kim/ }));
    await waitFor(() => expect(canvas.getByRole('button', { name: adminUserEmailVerificationData.verify })).toBeVisible());
    await userEvent.click(canvas.getByRole('button', { name: adminUserEmailVerificationData.verify }));
    fireEvent.change(body.getByRole('textbox', { name: adminUserEmailVerificationData.reason }), {
      target: { value: 'Confirmed control from verified support reply' },
    });
    await waitFor(() => expect(body.getByRole('button', { name: adminUserEmailVerificationData.continue })).toBeEnabled());
    await userEvent.click(body.getByRole('button', { name: adminUserEmailVerificationData.continue }));
    const stepUpDialog = within(body.getByRole('alertdialog'));
    await expect(stepUpDialog.getByText(adminUserEmailVerificationData.verificationHint)).toBeInTheDocument();
    fireEvent.change(stepUpDialog.getByRole('textbox', { name: adminUserEmailVerificationData.totp }), {
      target: { value: '123456' },
    });
    await waitFor(() => expect(stepUpDialog.getByRole('button', { name: adminUserEmailVerificationData.verifyCode })).toBeEnabled());
    await userEvent.click(stepUpDialog.getByRole('button', { name: adminUserEmailVerificationData.verifyCode }));
    await waitFor(() => expect(canvas.getByText(copy.verified, { exact: true })).toBeVisible());
    await expect(canvas.queryByRole('button', { name: adminUserEmailVerificationData.verify })).not.toBeInTheDocument();
  },
};

export const EmailChangeTOTP: Story = {
  beforeEach: () => mock('email-change'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: /Jordan Lee/ }));
    await waitFor(() => expect(canvas.getByRole('button', { name: adminUserEmailChangeData.action })).toBeVisible());
    await userEvent.click(canvas.getByRole('button', { name: adminUserEmailChangeData.action }));
    fireEvent.change(body.getByRole('textbox', { name: adminUserEmailChangeData.newEmail }), {
      target: { value: 'new@example.test' },
    });
    fireEvent.change(body.getByRole('textbox', { name: adminUserEmailChangeData.reason }), {
      target: { value: 'Customer requested an email change' },
    });
    await waitFor(() => expect(body.getByRole('button', { name: adminUserEmailChangeData.continue })).toBeEnabled());
    await userEvent.click(body.getByRole('button', { name: adminUserEmailChangeData.continue }));
    const stepUpDialog = within(body.getByRole('alertdialog'));
    await expect(stepUpDialog.getByRole('note')).toHaveTextContent(adminUserEmailChangeData.sessionNotice);
    fireEvent.change(stepUpDialog.getByRole('textbox', { name: adminUserEmailChangeData.totp }), {
      target: { value: '123456' },
    });
    await waitFor(() => expect(stepUpDialog.getByRole('button', { name: adminUserEmailChangeData.verifyCode })).toBeEnabled());
    await userEvent.click(stepUpDialog.getByRole('button', { name: adminUserEmailChangeData.verifyCode }));
    await waitFor(() => expect(canvas.getByText(adminUserEmailChangeData.pendingStatus)).toBeVisible());
    await expect(canvas.getByText(/ne••••@example\.test/)).toBeVisible();
  },
};

export const EmailChangeAccessDenied: Story = {
  beforeEach: () => mock('email-change-denied'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: /Jordan Lee/ }));
    await waitFor(() => expect(canvas.getByRole('button', { name: adminUserEmailChangeData.action })).toBeVisible());
    await userEvent.click(canvas.getByRole('button', { name: adminUserEmailChangeData.action }));
    fireEvent.change(body.getByRole('textbox', { name: adminUserEmailChangeData.newEmail }), {
      target: { value: 'new@example.test' },
    });
    fireEvent.change(body.getByRole('textbox', { name: adminUserEmailChangeData.reason }), {
      target: { value: 'Customer requested an email change' },
    });
    await waitFor(() => expect(body.getByRole('button', { name: adminUserEmailChangeData.continue })).toBeEnabled());
    await userEvent.click(body.getByRole('button', { name: adminUserEmailChangeData.continue }));
    await waitFor(() => expect(canvas.getByRole('alert')).toHaveTextContent(
      'Your current role cannot change customer email addresses.',
    ));
  },
};

export const EmailVerificationAccessDenied: Story = {
  beforeEach: () => mock('email-verification-denied'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: /Taylor Kim/ }));
    await waitFor(() => expect(canvas.getByRole('button', { name: adminUserEmailVerificationData.resend })).toBeVisible());
    await userEvent.click(canvas.getByRole('button', { name: adminUserEmailVerificationData.resend }));
    fireEvent.change(body.getByRole('textbox', { name: adminUserEmailVerificationData.reason }), {
      target: { value: 'Customer requested another verification email' },
    });
    await userEvent.click(body.getByRole('button', { name: adminUserEmailVerificationData.resendConfirm }));
    await waitFor(() => expect(canvas.getByRole('alert')).toHaveTextContent(
      'Your current role cannot manage customer email verification.',
    ));
  },
};

export const PasswordResetRequestUnavailable: Story = {
  beforeEach: () => mock('password-reset-unavailable'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: /Jordan Lee/ }));
    await waitFor(() => expect(canvas.getByRole('button', { name: adminUserPasswordResetData.action })).toBeVisible());
    await userEvent.click(canvas.getByRole('button', { name: adminUserPasswordResetData.action }));
    fireEvent.change(body.getByRole('textbox', { name: adminUserPasswordResetData.reason }), {
      target: { value: 'Customer cannot access their account' },
    });
    await waitFor(() => expect(body.getByRole('button', { name: adminUserPasswordResetData.confirm })).toBeEnabled());
    await userEvent.click(body.getByRole('button', { name: adminUserPasswordResetData.confirm }));
    await waitFor(() => expect(body.getByRole('alert')).toHaveTextContent(adminUserPasswordResetData.failed));
    await expect(canvas.queryByText(adminUserPasswordResetData.success(adminCustomerUserPreviews[0].maskedEmail))).not.toBeInTheDocument();
  },
};

export const UnsuspendCustomer: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: /Casey Rivera/ }));
    await waitFor(() => expect(canvas.getByRole('button', { name: adminUserSuspensionData.unsuspend })).toBeVisible());
    await userEvent.click(canvas.getByRole('button', { name: adminUserSuspensionData.unsuspend }));
    fireEvent.change(body.getByRole('textbox', { name: adminUserSuspensionData.reason }), {
      target: { value: 'Reviewed recovery request' },
    });
    await waitFor(() => expect(body.getByRole('button', { name: adminUserSuspensionData.continue })).toBeEnabled());
    await userEvent.click(body.getByRole('button', { name: adminUserSuspensionData.continue }));
    await waitFor(() => expect(body.getByRole('textbox', { name: adminUserSuspensionData.code })).toBeVisible());
    fireEvent.change(body.getByRole('textbox', { name: adminUserSuspensionData.code }), { target: { value: '123456' } });
    await waitFor(() => expect(body.getByRole('button', { name: adminUserSuspensionData.verifyUnsuspend })).toBeEnabled());
    await userEvent.click(body.getByRole('button', { name: adminUserSuspensionData.verifyUnsuspend }));
    await waitFor(() => expect(canvas.getByText('Account is active')).toBeVisible());
  },
};

export const SuspensionAccessDenied: Story = {
  beforeEach: () => mock('suspension-denied'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: /Jordan Lee/ }));
    await waitFor(() => expect(canvas.getByRole('button', { name: adminUserSuspensionData.suspend })).toBeVisible());
    await userEvent.click(canvas.getByRole('button', { name: adminUserSuspensionData.suspend }));
    fireEvent.change(body.getByRole('textbox', { name: adminUserSuspensionData.reason }), {
      target: { value: 'Verified support review' },
    });
    await waitFor(() => expect(body.getByRole('button', { name: adminUserSuspensionData.continue })).toBeEnabled());
    await userEvent.click(body.getByRole('button', { name: adminUserSuspensionData.continue }));
    await waitFor(() => expect(body.getByRole('textbox', { name: adminUserSuspensionData.code })).toBeVisible());
    fireEvent.change(body.getByRole('textbox', { name: adminUserSuspensionData.code }), { target: { value: '123456' } });
    await waitFor(() => expect(body.getByRole('button', { name: adminUserSuspensionData.verifySuspend })).toBeEnabled());
    await userEvent.click(body.getByRole('button', { name: adminUserSuspensionData.verifySuspend }));
    await waitFor(() => expect(canvas.getByRole('alert')).toHaveTextContent(
      'Your current role cannot manage customer account access.',
    ));
  },
};

export const LoadingProfile: Story = {
  beforeEach: () => mock('slow-detail'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Jordan Lee/ }));
    await expect(canvas.getByText(copy.loadingDetail, { exact: true })).toBeVisible();
    await waitFor(() => expect(canvas.getByRole('heading', { name: 'Jordan Lee' })).toBeVisible(), { timeout: 3000 });
  },
};

export const DirectoryUnavailable: Story = {
  beforeEach: () => mock('unavailable'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('searchbox', { name: copy.search }), 'Jordan');
    await expect(canvas.getByRole('alert')).toHaveTextContent(copy.loadFailed);
    await expect(canvas.queryByText('Jordan Lee')).not.toBeInTheDocument();
  },
};

export const AccessDenied: Story = {
  beforeEach: () => mock('denied'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('searchbox', { name: copy.search }), 'Jordan');
    await expect(canvas.getByRole('alert')).toHaveTextContent('Your current role cannot read customer users.');
    await expect(canvas.queryByText('Jordan Lee')).not.toBeInTheDocument();
  },
};

export const InvalidServerResponse: Story = {
  beforeEach: () => mock('invalid'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('searchbox', { name: copy.search }), 'Jordan');
    await expect(canvas.getByRole('alert')).toHaveTextContent(copy.loadFailed);
  },
};

export const ProfileUnavailable: Story = {
  beforeEach: () => mock('detail-unavailable'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Jordan Lee/ }));
    await waitFor(() => expect(canvas.getByRole('alert')).toHaveTextContent(copy.detailUnavailable));
  },
};

export const CustomerDataIsReadOnly: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /Jordan Lee/ })).toBeVisible();
    await expect(canvas.queryByRole('button', { name: 'Suspend user' })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'Reset password' })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'Change email address' })).not.toBeInTheDocument();
  },
};
