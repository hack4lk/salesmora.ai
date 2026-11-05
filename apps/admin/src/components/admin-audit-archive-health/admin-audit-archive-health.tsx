'use client';

import { useEffect, useState } from 'react';
import { auditArchiveHealthSchema, type AuditArchiveHealth } from '@salesmora/contracts';
import { BrandProvider } from '@salesmora/ui';
import { adminAuditArchiveHealthData as copy } from './admin-audit-archive-health-copy.data';

type Snapshot = { state: 'loading' } | { state: 'error'; message: string } | AuditArchiveHealth;
const button = 'min-h-11 cursor-pointer rounded-xl border border-line px-4 py-2 text-sm font-semibold focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';
const date = (value: string) => new Date(value).toISOString().replace('T', ' ').replace('.000Z', ' UTC');

async function loadArchiveHealth(signal: AbortSignal): Promise<AuditArchiveHealth> {
  let response: Response;
  try {
    response = await fetch('/api/admin/audit/archive-health', {
      credentials: 'same-origin', cache: 'no-store', signal,
    });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new Error(copy.failed);
  }
  if (!response.ok) {
    if (response.status === 401) throw new Error(copy.expired);
    if (response.status === 403) throw new Error(copy.denied);
    throw new Error(copy.failed);
  }
  let data: unknown;
  try { data = await response.json(); } catch { throw new Error(copy.invalid); }
  const parsed = auditArchiveHealthSchema.safeParse(data);
  if (!parsed.success) throw new Error(copy.invalid);
  return parsed.data;
}

function status(snapshot: Extract<AuditArchiveHealth, { state: 'reported' }>) {
  const current = snapshot.latestCopy;
  if (current.state === 'pending') return 'pending';
  if (current.state === 'copying') return 'copying';
  if (current.state === 'failed') return 'failed';
  if (current.latestCheck?.state === 'failed') return 'verificationFailed';
  if (current.latestCheck?.state === 'accepted' &&
    snapshot.latestAccepted?.retained.scope.throughSequence === current.scope.throughSequence) return 'accepted';
  return 'awaitingVerification';
}

export function AdminAuditArchiveHealth() {
  const [snapshot, setSnapshot] = useState<Snapshot>({ state: 'loading' });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    void loadArchiveHealth(controller.signal).then(result => {
      if (!controller.signal.aborted) setSnapshot(result);
    }).catch(error => {
      if (!controller.signal.aborted) setSnapshot({ state: 'error', message: error instanceof Error ? error.message : copy.failed });
    });
    return () => controller.abort();
  }, [revision]);
  function reload() {
    setSnapshot({ state: 'loading' });
    setRevision(value => value + 1);
  }

  if (snapshot.state === 'loading') return <BrandProvider><section aria-label={copy.title}
    className="grid min-w-0 gap-4 rounded-xl border border-line p-4">
    <h2 className="m-0 text-lg font-semibold">{copy.title}</h2>
    <p role="status" className="m-0 text-sm">{copy.loading}</p>
    <p className="m-0 text-sm leading-6 text-muted">{copy.notice}</p>
  </section></BrandProvider>;
  if (snapshot.state === 'error') return <BrandProvider><section aria-label={copy.title}
    className="grid min-w-0 gap-4 rounded-xl border border-line p-4">
    <h2 className="m-0 text-lg font-semibold">{copy.title}</h2>
    <div role="alert"><p className="m-0 font-semibold">{copy.unavailable}</p><p className="mb-0 mt-2 text-sm">{snapshot.message}</p>
      <p className="mb-0 mt-2 text-sm leading-6">{copy.unavailableHint}</p></div>
    <button type="button" className={`${button} justify-self-start`} onClick={reload}>{copy.reload}</button>
  </section></BrandProvider>;

  if (snapshot.state === 'unconfigured') return <BrandProvider><section aria-label={copy.title}
    className="grid min-w-0 gap-4 rounded-xl border border-line p-4">
    <h2 className="m-0 text-lg font-semibold">{copy.title}</h2>
    <p className="m-0 text-sm">{copy.unconfigured}</p><p className="m-0 text-sm leading-6">{copy.unconfiguredHint}</p>
    <p className="m-0 text-sm text-muted">{copy.observedAt}: {date(snapshot.observedAt)}</p>
    <p className="m-0 text-sm leading-6 text-muted">{copy.notice}</p>
    <button type="button" className={`${button} justify-self-start`} onClick={reload}>{copy.reload}</button>
  </section></BrandProvider>;

  const state = status(snapshot);
  const warning = state === 'failed' || state === 'verificationFailed';
  const archive = snapshot.latestAccepted;
  const current = snapshot.latestCopy;
  return <BrandProvider><section aria-label={copy.title} className="grid min-w-0 gap-4 rounded-xl border border-line p-4">
    <h2 className="m-0 text-lg font-semibold">{copy.title}</h2>
    <p className="m-0 rounded-xl bg-canvas p-4 text-sm leading-6">{copy.notice}</p>
    <div role={warning ? 'alert' : 'status'} className={warning ? 'rounded-xl border border-error p-4' : 'rounded-xl border border-line p-4'}>
      <h3 className="m-0 text-base font-semibold">{copy.states[state]}</h3>
      <p className="mb-0 mt-2 text-sm leading-6">{copy.hints[state]}</p>
    </div>
    <p className="m-0 text-sm text-muted">{copy.observedAt}: {date(snapshot.observedAt)}</p>
    <h3 className="m-0 text-base font-semibold">{copy.latestCopy}</h3>
    <dl className="m-0 grid min-w-0 gap-3 sm:grid-cols-2">
      <div><dt className="text-sm text-muted">{copy.labels.copyState}</dt><dd className="m-0 text-sm font-semibold">{current.state}</dd></div>
      <div><dt className="text-sm text-muted">{copy.labels.sequence}</dt><dd className="m-0 text-sm font-semibold">{current.scope.throughSequence}</dd></div>
      <div><dt className="text-sm text-muted">{copy.labels.attempts}</dt><dd className="m-0 text-sm font-semibold">{current.attempts}</dd></div>
      <div><dt className="text-sm text-muted">{copy.labels.updated}</dt><dd className="m-0 text-sm font-semibold">{date(current.updatedAt)}</dd></div>
      {current.failureCode && <div><dt className="text-sm text-muted">{copy.labels.copyFailure}</dt><dd className="m-0 text-sm font-semibold">{current.failureCode}</dd></div>}
      {current.latestCheck && <div>
        <dt className="text-sm text-muted">{copy.labels.checkState}</dt>
        <dd className="m-0 text-sm font-semibold">{current.latestCheck.state}</dd>
        <dd className="m-0 text-sm">{copy.labels.checkTime}: {date(current.latestCheck.checkedAt)}</dd>
        {current.latestCheck.state === 'failed' && <dd className="m-0 text-sm">{copy.labels.checkFailure}: {current.latestCheck.failureCode}</dd>}
      </div>}
    </dl>
    <h3 className="m-0 text-base font-semibold">{copy.latestAccepted}</h3>
    {!archive ? <p className="m-0 text-sm">{copy.noAccepted}</p> : <>
      <p className="m-0 text-sm">{copy.labels.sequenceRange}: {archive.retained.checkpoint.firstSequence} - {archive.retained.scope.throughSequence}</p>
      <p className="m-0 text-sm">{copy.labels.eventCount}: {archive.retained.checkpoint.eventCount.toLocaleString('en-US')}</p>
      <p className="m-0 text-sm">{copy.labels.bucket}: {archive.retained.target.bucket} ({archive.retained.target.jurisdiction})</p>
      <p className="m-0 text-sm">{copy.labels.checkpoint}: <span className="break-all">{archive.retained.checkpointSHA256}</span></p>
      <p className="m-0 text-sm">{copy.labels.object}: <span className="break-all">{archive.evidence.objectSHA256}</span></p>
      <p className="m-0 text-sm">{copy.labels.objectKey}: <span className="break-all">{archive.evidence.objectKey}</span></p>
      <p className="m-0 text-sm">{copy.labels.checkpointKey}: <span className="break-all">{archive.evidence.checkpointKey}</span></p>
      <p className="m-0 text-sm">{copy.labels.checkTime}: {date(archive.evidence.checkedAt)}</p>
      <h4 className="m-0 text-sm font-semibold">{copy.labels.lockEvidence}</h4>
      <ul className="m-0 grid gap-3 pl-5">
        {archive.evidence.locks.map(lock => <li key={lock.key} className="min-w-0 text-sm">
          <p className="m-0 break-all"><strong>{copy.labels.lock}:</strong> {lock.key}</p>
          <p className="m-0">{copy.labels.rule}: {lock.ruleId}</p>
          <p className="m-0">{copy.labels.uploaded}: {date(lock.uploadedAt)}</p>
          <p className="m-0">{copy.labels.checked}: {date(lock.checkedAt)}</p>
          <p className="m-0">{copy.labels.protectedUntil}: {lock.protectedUntil ? date(lock.protectedUntil) : copy.labels.indefinite}</p>
        </li>)}
      </ul>
      <p className="m-0 text-sm">{copy.labels.lockedObjects}</p>
      <p className="m-0 text-sm leading-6 text-muted">{copy.labels.scope}</p>
      <p className="m-0 text-sm leading-6 text-muted">{copy.labels.age}</p>
    </>}
    <button type="button" className={`${button} justify-self-start`} onClick={reload}>{copy.reload}</button>
  </section></BrandProvider>;
}
