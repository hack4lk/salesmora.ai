'use client';

import { useState, type FormEvent } from 'react';
import {
  adminRolloutFlagSchema,
  adminRolloutFlagsResponseSchema,
  type AdminRolloutFlag,
  type AdminRolloutFlagMutation,
} from '@salesmora/contracts';
import styles from './admin-rollout-flags-page.module.css';

async function mutate(input: AdminRolloutFlagMutation) {
  let response: Response;
  try {
    response = await fetch('/api/admin/rollout-flags', {
      method: 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error('Rollout flags are unavailable. Try again.');
  }
  let body: unknown;
  try { body = await response.json(); }
  catch { throw new Error('The server returned an invalid rollout flag response. Refresh before trying again.'); }
  if (!response.ok) {
    const message = body && typeof body === 'object' && 'error' in body && typeof body.error === 'string'
      ? body.error : 'The flag could not be changed. Refresh and try again.';
    throw new Error(message);
  }
  const parsed = adminRolloutFlagsResponseSchema.safeParse(body);
  if (!parsed.success || new Set(parsed.data.flags.map(flag => flag.key)).size !== parsed.data.flags.length) {
    throw new Error('The server returned an invalid rollout flag response. Refresh before trying again.');
  }
  return parsed.data.flags;
}

export function AdminRolloutFlagsPage({
  initialFlags,
  canManage = true,
}: {
  initialFlags: AdminRolloutFlag[];
  canManage?: boolean;
}) {
  const [flags, setFlags] = useState(initialFlags);
  const [editor, setEditor] = useState<{ original: AdminRolloutFlag | null } | null>(null);
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [deleting, setDeleting] = useState<AdminRolloutFlag | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function openEditor(flag?: AdminRolloutFlag) {
    setEditor({ original: flag ?? null });
    setKey(flag?.key ?? '');
    setDescription(flag?.description ?? '');
    setEnabled(flag?.enabled ?? false);
    setDeleting(null);
    setError('');
    setSuccess('');
  }

  async function save(input: AdminRolloutFlagMutation, message: string) {
    if (!canManage || pending) return;
    setPending(true);
    setError('');
    setSuccess('');
    try {
      setFlags(await mutate(input));
      setSuccess(message);
      setEditor(null);
      setDeleting(null);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'The flag could not be changed. Try again.');
    } finally {
      setPending(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor) return;
    const parsed = adminRolloutFlagSchema.safeParse({ key: key.trim(), description, enabled });
    if (!parsed.success) {
      setError('Use a lowercase key starting with a letter (up to 100 letters, numbers, dots, underscores or hyphens) and a description of 1–200 characters.');
      return;
    }
    if (flags.some(flag => flag.key === parsed.data.key && flag.key !== editor.original?.key)) {
      setError('A flag with this key already exists.');
      return;
    }
    void save(editor.original === null
      ? { operation: 'create', flag: parsed.data }
      : { operation: 'update', originalKey: editor.original.key, flag: parsed.data, expected: editor.original },
    `${parsed.data.key}: ${editor.original === null ? 'created' : 'updated'}.`);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 id="admin-title">System rollout flags</h1>
          <p>Simple on/off controls for system-wide feature rollouts.</p>
        </div>
        <button type="button" className={styles.primary} disabled={!canManage || pending}
          onClick={() => openEditor()}>Create flag</button>
      </header>
      <p className={styles.note}>These flags are separate from plan and workspace overrides.
        Application code must check a key for it to control a feature. New, unknown and deleted flags are off by default.</p>
      {!canManage && <p className={styles.note}>Your role has read-only access to these flags.</p>}
      {error && <p role="alert" className={styles.error}>{error}</p>}
      {success && <p role="status" className={styles.success}>{success}</p>}
      <div className={styles.tableContainer} role="region" aria-label="System rollout flags" tabIndex={0}>
        <table className={styles.table}>
          <caption className={styles.caption}>System-wide rollout controls</caption>
          <thead><tr><th scope="col">Flag key / value</th><th scope="col">Short description</th>
            <th scope="col">Enabled</th><th scope="col">Actions</th></tr></thead>
          <tbody>
            {flags.length === 0 && <tr><td colSpan={4}>No rollout flags yet. Create a flag to get started.</td></tr>}
            {flags.map(flag => (
              <tr key={flag.key}>
                <th scope="row"><code>{flag.key}</code></th>
                <td>{flag.description}</td>
                <td>
                  <button type="button" role="switch" aria-checked={flag.enabled}
                    aria-label={`Enable ${flag.key}`} className={styles.toggle}
                    disabled={!canManage || pending || editor !== null || deleting !== null}
                    onClick={() => void save({
                      operation: 'update', originalKey: flag.key, flag: { ...flag, enabled: !flag.enabled }, expected: flag,
                    }, `${flag.key}: ${flag.enabled ? 'disabled' : 'enabled'}.`)}>
                    {flag.enabled ? 'On' : 'Off'}
                  </button>
                </td>
                <td><div className={styles.actions}>
                  <button type="button" aria-label={`Edit ${flag.key}`} disabled={!canManage || pending}
                    onClick={() => openEditor(flag)}>Edit</button>
                  <button type="button" aria-label={`Delete ${flag.key}`} disabled={!canManage || pending}
                    onClick={() => { setDeleting(flag); setEditor(null); setError(''); setSuccess(''); }}>Delete</button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editor && (
        <section className={styles.panel} aria-label={editor.original === null ? 'Create rollout flag' : 'Edit rollout flag'}>
          <h2>{editor.original === null ? 'Create flag' : 'Edit flag'}</h2>
          <form onSubmit={submit} className={styles.form}>
            <label>Flag key / value
              <input autoFocus required maxLength={100} value={key} disabled={pending}
                aria-describedby="rollout-key-help" onChange={event => setKey(event.target.value)} />
            </label>
            <p id="rollout-key-help">For example: new_dashboard. Changing a key requires updating its application checks.</p>
            <label>Short description
              <textarea required maxLength={200} value={description} disabled={pending}
                onChange={event => setDescription(event.target.value)} />
            </label>
            <label className={styles.checkbox}><input type="checkbox" checked={enabled} disabled={pending}
              onChange={event => setEnabled(event.target.checked)} />Enabled</label>
            <div className={styles.actions}>
              <button type="submit" className={styles.primary} disabled={pending || !canManage}>
                {pending ? 'Saving...' : 'Save flag'}
              </button>
              <button type="button" disabled={pending} onClick={() => { setEditor(null); setError(''); }}>Cancel</button>
            </div>
          </form>
        </section>
      )}
      {deleting && (
        <section className={styles.panel} aria-label="Delete rollout flag">
          <h2>Delete {deleting.key}?</h2>
          <p>Application checks for this key will return off. This cannot be undone.</p>
          <div className={styles.actions}>
            <button type="button" className={styles.danger} disabled={pending || !canManage}
              onClick={() => void save({ operation: 'delete', key: deleting.key, expected: deleting }, `${deleting.key}: deleted.`)}>
              {pending ? 'Deleting...' : 'Confirm delete'}
            </button>
            <button autoFocus type="button" disabled={pending} onClick={() => setDeleting(null)}>Cancel</button>
          </div>
        </section>
      )}
    </div>
  );
}
