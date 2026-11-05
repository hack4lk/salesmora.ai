'use client';

import { useEffect, useRef } from 'react';
import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/server';
import { auditExportMethodsSchema, auditExportStartSchema, auditExportVerifiedSchema, type AuditExportSnapshot } from '@salesmora/contracts';
import { getAdminPasskeyResponse } from '../admin-sign-in/admin-sign-in';
import type { StaffSecondFactor, StaffVerificationResult } from '../staff-action-review/staff-action-review';
import { AdminAuditExportReview } from './admin-audit-export-review';
import { adminAuditExportData as copy } from './admin-audit-export-copy.data';

export class AuditExportRequestError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}
export async function auditExportRequest(body?: unknown) {
  let response: Response;
  try {
    response = await fetch('/api/admin/audit/export', { method: body === undefined ? 'GET' : 'POST',
      credentials: 'same-origin', cache: 'no-store',
      ...(body === undefined ? {} : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }) });
  } catch { throw new AuditExportRequestError(copy.failed, 0); }
  if (!response.ok) {
    let value: unknown;
    try { value = await response.json(); } catch { throw new AuditExportRequestError(copy.invalid, response.status); }
    throw new AuditExportRequestError(value && typeof value === 'object' && 'error' in value && typeof value.error === 'string' ? value.error : copy.failed, response.status);
  }
  return response;
}
export { auditExportMethodsSchema };

export function AdminAuditExport({ snapshot, methods, onClose, onFeedback, onAccessError }: {
  snapshot: AuditExportSnapshot; methods: readonly StaffSecondFactor['method'][];
  onClose: () => void; onFeedback: (message: string, success: boolean) => void;
  onAccessError: (status: number, message: string) => void;
}) {
  const verification = useRef<{ token: string; options: PublicKeyCredentialRequestOptionsJSON } | null>(null);
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => { active.current = false; verification.current = null; };
  }, []);
  async function attempt(callback: () => Promise<void>): Promise<StaffVerificationResult> {
    try { await callback(); return { ok: true }; }
    catch (error) {
      if (error instanceof AuditExportRequestError && error.status === 403) onAccessError(error.status, error.message);
      return { ok: false, message: error instanceof Error ? error.message : copy.failed };
    }
  }
  return <AdminAuditExportReview snapshot={snapshot} reviewerRole="super_admin" methods={methods} preview={false}
    onClose={() => { verification.current = null; onClose(); }}
    onVerifyPassword={(password, input) => attempt(async () => {
      verification.current = null;
      const response = await auditExportRequest({ operation: 'start', password, input });
      const parsed = auditExportStartSchema.safeParse(await response.json());
      if (!parsed.success) throw new AuditExportRequestError(copy.invalid, 502);
      if (!active.current) return;
      verification.current = parsed.data;
    })}
    onVerifyFactor={factor => attempt(async () => {
      const state = verification.current;
      if (!state) throw new Error(copy.missing);
      const response = await auditExportRequest(factor.method === 'passkey'
        ? { operation: 'factor', token: state.token, method: 'passkey', response: await getAdminPasskeyResponse(state.options) }
        : { operation: 'factor', token: state.token, ...factor });
      const parsed = auditExportVerifiedSchema.safeParse(await response.json());
      if (!parsed.success) throw new AuditExportRequestError(copy.invalid, 502);
    })}
    onConfirm={() => attempt(async () => {
      const state = verification.current;
      verification.current = null;
      if (!state) throw new Error(copy.missing);
      try {
        const response = await auditExportRequest({ operation: 'commit', token: state.token });
        if (!active.current) return;
        const eventId = response.headers.get('x-audit-event-id');
        const checksum = response.headers.get('x-export-sha256');
        if (!response.headers.get('content-type')?.startsWith('text/csv') || response.headers.get('x-export-count') !== String(snapshot.count) ||
          !eventId || !/^[0-9a-f-]{36}$/.test(eventId) || !checksum || !/^[0-9a-f]{64}$/.test(checksum)) throw new Error(copy.invalid);
        const blob = await response.blob();
        const actual = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', await blob.arrayBuffer())), byte => byte.toString(16).padStart(2, '0')).join('');
        if (!active.current) return;
        if (actual !== checksum) throw new Error(copy.invalid);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        try {
          link.href = url; link.download = `salesmora-admin-audit-${snapshot.asOf.slice(0, 10)}.csv`;
          document.body.append(link); link.click();
        } finally { link.remove(); setTimeout(() => URL.revokeObjectURL(url), 60_000); }
        onFeedback(copy.prepared, true);
      } catch (error) {
        if (!active.current) return;
        if (error instanceof AuditExportRequestError && error.status === 403) onAccessError(error.status, error.message);
        onFeedback(`${error instanceof Error ? error.message : copy.failed} ${copy.uncertain}`, false);
      }
      onClose();
    })} />;
}
