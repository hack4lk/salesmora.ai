'use client';

import { useId } from 'react';
import MuiTextField from '@mui/material/TextField';
import { fieldClasses, FormFeedback, StatusBadge } from '@salesmora/ui';
import { gmailCaptureScopeData as copy } from './gmail-capture-scope.data';

export type GmailCaptureScopeValue = { accountId: string | null };
export type GmailCaptureAccount = { id: string; email: string; status: 'connected' | 'reconnect-required' | 'disconnected' };
export type GmailCaptureScopeProps = {
  value: GmailCaptureScopeValue;
  accounts: readonly GmailCaptureAccount[];
  accountsStatus?: 'loading' | 'ready' | 'error';
  gmailAccess: 'available' | 'loading' | 'upgrade-required' | 'unavailable';
  canRead: boolean; canEdit: boolean; pending?: boolean; showErrors?: boolean;
  connectionAvailable?: boolean; connectionError?: string;
  canConnect?: boolean; canSelect?: boolean; canDisconnect?: boolean; onDisconnect?: (accountId: string) => void;
  onChange: (value: GmailCaptureScopeValue) => void;
  onConnect: () => void;
  onReconnect: (accountId: string) => void;
  onRetryAccounts: () => void;
  onReviewPlans?: () => void;
};
const button = 'min-h-11 max-w-full cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary wrap-anywhere hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';

/** Controlled draft only. The host owns authorization, OAuth, account loading and launch readiness. */
export function GmailCaptureScope({ value, accounts, accountsStatus = 'ready', gmailAccess, canRead, canEdit, pending = false, showErrors = false, connectionAvailable = true, connectionError, canConnect = true, canSelect = true, canDisconnect = false, onDisconnect, onChange, onConnect, onReconnect, onRetryAccounts, onReviewPlans }: GmailCaptureScopeProps) {
  const id = useId();
  if (!canRead) return <FormFeedback kind="error" message={copy.forbidden} />;
  const access = gmailAccess === 'available';
  const disabled = !canEdit || pending || !access;
  const account = accounts.find(item => item.id === value.accountId);
  const missingAccount = accountsStatus === 'ready' && !!value.accountId && !account;
  const accountError = missingAccount ? copy.unknownAccount : showErrors && !value.accountId ? copy.missingAccount : undefined;
  const accessMessage = gmailAccess === 'loading' ? copy.accessLoading : gmailAccess === 'upgrade-required' ? copy.upgrade : gmailAccess === 'unavailable' ? copy.accessUnavailable : undefined;
  const patch = (next: Partial<GmailCaptureScopeValue>) => { if (!disabled) onChange({ ...value, ...next }); };

  return <section className="grid min-w-0 gap-6 text-ink">
    {accessMessage && <div className="grid justify-items-start gap-3 rounded-xl border border-line bg-paper p-4"><p role="status" className="m-0 text-sm leading-6 text-muted">{accessMessage}</p>
      {gmailAccess === 'upgrade-required' && canEdit && onReviewPlans && <button type="button" disabled={pending} className={button} onClick={onReviewPlans}>{copy.plans}</button>}
    </div>}
    {!canEdit && <p className="m-0 text-sm text-muted">{copy.readOnly}</p>}
    <section aria-labelledby={`${id}-account-title`} className="grid min-w-0 justify-items-start gap-4 rounded-2xl border border-line bg-paper p-4 sm:p-6">
      <div><h2 id={`${id}-account-title`} className="m-0 text-xl font-semibold">{copy.title}</h2><p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.description}</p></div>
      <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-start">
        <div className="w-full min-w-0 max-w-sm sm:shrink-0">
          <MuiTextField label={copy.account} select required fullWidth size="small" variant="outlined" className={fieldClasses} value={value.accountId ?? ''} disabled={disabled || !canSelect || accountsStatus !== 'ready'}
            error={!!accountError} helperText={accountError} slotProps={{ select: { native: true }, inputLabel: { shrink: true }, input: { className: 'has-focus-visible:focus-ring' } }}
            onChange={event => { if (accountsStatus === 'ready') patch({ accountId: event.target.value || null }); }}>
            <option value="" disabled={!!value.accountId}>{copy.chooseAccount}</option>
            {value.accountId && !account && <option value={value.accountId} disabled>{copy.unavailableAccount}</option>}
            {accounts.map(item => <option key={item.id} value={item.id} disabled={item.status !== 'connected'}>{item.email}</option>)}
          </MuiTextField>
        </div>
        {canEdit && connectionAvailable && <div className="flex min-w-0 flex-wrap gap-3">
          <button type="button" className={button} disabled={disabled || !canConnect || accountsStatus !== 'ready'} aria-busy={pending} onClick={() => { if (!disabled && canConnect && accountsStatus === 'ready') onConnect(); }}>{pending ? copy.working : copy.connect}</button>
          {account && account.status !== 'connected' && <button type="button" className={button} disabled={disabled || !canConnect || accountsStatus !== 'ready'} onClick={() => { if (!disabled && canConnect && accountsStatus === 'ready') onReconnect(account.id); }}>{copy.reconnect}</button>}
        </div>}
      </div>
      {accountsStatus === 'ready' && account && <p className="m-0 text-sm font-semibold wrap-anywhere">{account.email}</p>}
      {accountsStatus === 'ready' && account && <StatusBadge label={account.status === 'connected' ? copy.connected : account.status === 'disconnected' ? copy.disconnected : copy.reconnectRequired} tone={account.status === 'connected' ? 'success' : 'warning'} />}
      {account?.status === 'reconnect-required' && <p role="alert" className="m-0 text-sm leading-6 text-muted">{copy.expired}</p>}
      {accountsStatus === 'loading' && <p role="status" className="m-0 text-sm text-muted">{copy.loadingAccounts}</p>}
      {accountsStatus === 'error' && <FormFeedback kind="error" message={copy.accountsError} />}
      {connectionError && <FormFeedback kind="error" message={connectionError} />}
      {!connectionAvailable && accountsStatus === 'ready' && <p role="status" className="m-0 text-sm text-muted">{copy.notConfigured}</p>}
      {accountsStatus === 'error' && <button type="button" className={button} disabled={pending} onClick={() => { if (!pending) onRetryAccounts(); }}>{copy.retryAccounts}</button>}
      {accountsStatus !== 'error' && connectionError && <button type="button" className={button} disabled={pending} onClick={() => { if (!pending) onRetryAccounts(); }}>{copy.retryAccounts}</button>}
      {account && account.status !== 'disconnected' && canEdit && canDisconnect && onDisconnect && <button type="button" className={button} disabled={pending} onClick={() => onDisconnect(account.id)}>{copy.disconnect}</button>}
      <p className="m-0 text-sm leading-6 text-muted">{copy.incoming}</p>
    </section>
    <section aria-labelledby={`${id}-access`} className="grid gap-3 rounded-2xl border border-line bg-paper p-4 sm:p-6"><h2 id={`${id}-access`} className="m-0 text-base font-semibold">{copy.accessTitle}</h2><p className="m-0 text-sm leading-6 text-muted">{copy.accessDescription}</p><p className="m-0 text-sm leading-6 text-muted">{copy.draft}</p></section>
  </section>;
}
