'use client';

import { useState } from 'react';
import { adminFrameData as copy } from './admin-frame.data';
import styles from './admin-frame.module.css';

export function AdminSignOut() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function signOut() {
    setBusy(true);
    setError(false);
    try {
      const response = await fetch('/api/auth/sign-out', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{}',
        cache: 'no-store',
        redirect: 'error',
      });
      if (!response.ok) throw new Error('Admin sign-out failed.');
      window.location.replace('/sign-in');
    } catch {
      setError(true);
      setBusy(false);
    }
  }

  return (
    <div className={styles.accountControls}>
      <button className={styles.signOut} type="button" disabled={busy} onClick={signOut}>
        {busy ? copy.signingOut : copy.signOut}
      </button>
      {error ? <p className={styles.signOutError} role="alert">{copy.signOutError}</p> : null}
    </div>
  );
}
