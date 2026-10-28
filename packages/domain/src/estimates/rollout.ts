/** Explicit staging rollout; request headers never choose the deployment or origin. */
export function estimateSharingAvailable(origin: string | undefined, rollout: { environment?: string; enabled?: boolean } = {}) {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    if (url.username || url.password || url.pathname !== '/' || url.search || url.hash) return false;
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    if (local) return ['http:', 'https:'].includes(url.protocol);
    return url.protocol === 'https:' && rollout.environment === 'staging' && rollout.enabled === true;
  } catch { return false; }
}
