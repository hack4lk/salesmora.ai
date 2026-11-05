'use client';

import { useRef, useState } from 'react';
import type { AuthenticationResponseJSON, PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/server';
import { ConfirmDialog, TextField } from '@salesmora/ui';
import { getAdminPasskeyResponse } from '../admin-sign-in/admin-sign-in';
import type { AdminExportWorkspace, AdminWorkspaceExportRequest } from './admin-data-requests.types';

type ExportMethod = 'totp' | 'passkey';
type ExportFactor =
  | { token: string; method: 'totp'; code: string }
  | { token: string; method: 'passkey'; response: AuthenticationResponseJSON };

export interface WorkspaceExportRequestDialogProps {
  open: boolean;
  workspaces: readonly AdminExportWorkspace[];
  methods: readonly ExportMethod[];
  onClose: () => void;
  onStartExport: (request: AdminWorkspaceExportRequest & { password: string; method: ExportMethod }) =>
    Promise<{ token: string; options?: PublicKeyCredentialRequestOptionsJSON }>;
  onVerifyExport: (factor: ExportFactor) => Promise<void>;
  onRequestExport: (request: { token: string }) => Promise<void>;
  getPasskeyResponse?: (options: PublicKeyCredentialRequestOptionsJSON) => Promise<AuthenticationResponseJSON>;
  onSuccess?: (message: string) => void;
}

const reasonError = 'Enter a reason between 10 and 500 characters.';
const submittedMessage = 'Export request queued. The verified Owner will receive a sign-in notice when the archive is ready.';

export function WorkspaceExportRequestDialog({
  open,
  workspaces,
  methods,
  onClose,
  onStartExport,
  onVerifyExport,
  onRequestExport,
  getPasskeyResponse = getAdminPasskeyResponse,
  onSuccess,
}: WorkspaceExportRequestDialogProps) {
  const [stage, setStage] = useState<'request' | 'verification' | 'confirmation'>('request');
  const [workspaceId, setWorkspaceId] = useState(workspaces[0]?.id ?? '');
  const [reason, setReason] = useState('');
  const [password, setPassword] = useState('');
  const [factor, setFactor] = useState<ExportMethod>(methods.includes('passkey') ? 'passkey' : 'totp');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const challenge = useRef<{ token: string } | null>(null);
  const workspace = workspaces.find(item => item.id === workspaceId);

  function reset() {
    setStage('request');
    setWorkspaceId(workspaces[0]?.id ?? '');
    setReason('');
    setPassword('');
    setFactor(methods.includes('passkey') ? 'passkey' : 'totp');
    setCode('');
    challenge.current = null;
    setError('');
  }

  function close() {
    reset();
    onClose();
  }

  async function advance() {
    setError('');
    if (stage === 'request') {
      if (reason.trim().length < 10 || reason.trim().length > 500) {
        setError(reasonError);
        return;
      }
      if (!workspace) {
        setError('Select a workspace with a verified Owner.');
        return;
      }
      setStage('verification');
      return;
    }
    if (stage === 'verification') {
      if (!workspace) {
        setError('Select a workspace with a verified Owner.');
        return;
      }
      if (!password) {
        setError('Enter your staff password to continue.');
        return;
      }
      if (!methods.includes(factor)) {
        setError('Enroll a passkey or authenticator code before requesting an export.');
        return;
      }
      if (factor === 'totp' && !/^\d{6}$/.test(code)) {
        setError('Enter a 6-digit authenticator code.');
        return;
      }
      setBusy(true);
      try {
        const started = await onStartExport({
          workspaceId: workspace.id,
          reason: reason.trim(),
          password,
          method: factor,
        });
        challenge.current = { token: started.token };
        if (factor === 'totp') {
          await onVerifyExport({ token: started.token, method: 'totp', code });
        } else {
          if (!started.options) throw new Error('The server did not provide passkey verification options.');
          await onVerifyExport({
            token: started.token,
            method: 'passkey',
            response: await getPasskeyResponse(started.options),
          });
        }
        setStage('confirmation');
      } catch (verificationError) {
        challenge.current = null;
        setError(verificationError instanceof Error
          ? verificationError.message : 'Workspace export verification failed.');
      } finally {
        setBusy(false);
      }
      return;
    }
    if (!challenge.current) {
      setError('Verify your identity before confirming the export request.');
      return;
    }
    setBusy(true);
    try {
      await onRequestExport(challenge.current);
      onSuccess?.(submittedMessage);
      close();
    } catch (requestError) {
      setError(requestError instanceof Error
        ? requestError.message : 'The export request could not be submitted. Refresh before retrying an uncertain request.');
    } finally {
      setBusy(false);
    }
  }

  return <ConfirmDialog open={open} title={stage === 'request' ? 'Request workspace export'
    : stage === 'verification' ? 'Verify this export request' : 'Confirm export request'}
    description={stage === 'request'
      ? 'Request one encrypted ZIP for the workspace Owner. Starting an export is audited and requires a reason and fresh step-up verification.'
      : stage === 'verification' ? 'Verify your staff password and one enrolled second factor before reviewing the request.'
        : 'Review the workspace, verified Owner, archive contents, expiry and reason before submitting.'}
    confirmLabel={stage === 'request' ? 'Continue to verification'
      : stage === 'verification' ? 'Verify and review' : 'Confirm export request'}
    cancelLabel="Cancel" pending={busy} pendingLabel={stage === 'verification' ? 'Verifying…' : 'Submitting…'} error={error}
    confirmDisabled={busy} onClose={close} onConfirm={advance} initialFocus="content">
    {stage === 'request' ? <>
      <label htmlFor="export-workspace" className="mb-2 block text-sm font-semibold">Workspace</label>
      <select id="export-workspace" value={workspaceId} onChange={event => setWorkspaceId(event.target.value)}
        className="min-h-11 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink focus-visible:focus-ring">
        {workspaces.map(item => <option key={item.id} value={item.id}>{item.name} · {item.id}</option>)}
      </select>
      {workspace && <p className="mb-0 mt-2 text-sm text-muted">Verified Owner: {workspace.ownerName} · {workspace.maskedOwnerEmail}</p>}
      <div className="mt-4 rounded-lg border border-line p-3 text-sm leading-6">
        <strong className="block">Included datasets</strong>
        Leads · Customers · Estimates · Jobs · Work orders · Materials · File metadata
        <span className="mt-1 block text-xs text-muted">Uploaded file contents are excluded.</span>
      </div>
      <TextField label="Audit reason" required value={reason} onChange={event => setReason(event.target.value)}
        helperText="Required. Enter 10 to 500 characters. The reason is retained in the admin audit log, not inside the archive."
        autoComplete="off" slotProps={{ htmlInput: { maxLength: 500 } }} />
    </> : stage === 'verification' ? <>
      <label htmlFor="export-password" className="mb-2 block text-sm font-semibold">Staff password</label>
      <input id="export-password" type="password" required value={password}
        onChange={event => setPassword(event.target.value)} autoComplete="current-password"
        className="min-h-11 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink focus-visible:focus-ring" />
      <label htmlFor="export-factor" className="mb-2 block text-sm font-semibold">Second factor</label>
      <select id="export-factor" value={factor} onChange={event => {
        setFactor(event.target.value as ExportMethod);
        setCode('');
        setError('');
      }} className="min-h-11 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink focus-visible:focus-ring">
        {methods.map(method => <option key={method} value={method}>{method === 'totp' ? 'Authenticator code' : 'Passkey'}</option>)}
      </select>
      {methods.length === 0 && <p role="alert" className="text-sm text-danger">Enroll a passkey or authenticator code before requesting an export.</p>}
      {factor === 'totp' && methods.includes('totp') ? <TextField label="6-digit authenticator code" required value={code}
        onChange={event => setCode(event.target.value)} autoComplete="one-time-code"
        slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '[0-9]{6}', maxLength: 6 } }} />
        : factor === 'passkey' && methods.includes('passkey') ? <p className="mb-0 mt-3 text-sm leading-6 text-muted">
          Selecting “Verify and review” will prompt your registered passkey.
        </p> : null}
    </> : <>
      <dl className="m-0 grid gap-3">
        <div><dt className="text-xs font-semibold text-muted">Workspace</dt><dd className="m-0 text-sm">{workspace?.name} · {workspace?.id}</dd></div>
        <div><dt className="text-xs font-semibold text-muted">Verified Owner</dt><dd className="m-0 text-sm">{workspace?.ownerName} · {workspace?.maskedOwnerEmail}</dd></div>
        <div><dt className="text-xs font-semibold text-muted">Contents</dt><dd className="m-0 text-sm">6 CSV datasets and file metadata only</dd></div>
        <div><dt className="text-xs font-semibold text-muted">Download expiry</dt><dd className="m-0 text-sm">7 days after the archive is ready</dd></div>
        <div><dt className="text-xs font-semibold text-muted">Audit reason</dt><dd className="m-0 text-sm">{reason.trim()}</dd></div>
      </dl>
      <p className="mb-0 mt-4 rounded-lg bg-canvas p-3 text-sm leading-6 text-muted">
        The Owner signs in to the customer app to download. The email link is not a bearer credential. No uploaded file contents are included.
      </p>
    </>}
  </ConfirmDialog>;
}
