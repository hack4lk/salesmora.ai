import 'server-only';
import { readPublicCapture, takeCaptureRequestBudget } from '@salesmora/data';
import type { CapturePublicView } from '@salesmora/contracts';
import { database } from '../workspaces/store';
import { capturePublicConfig, captureRequestSurface } from './public-config';
import { createCaptureSubmissionContext } from './submission-context';
import { captureSubmissionPolicy } from './submission-policy';
export async function publicCaptureSource(publicKey: string, host: string | null, embedded: boolean): Promise<CapturePublicView> {
  const config = capturePublicConfig(), path = `/${embedded ? 'embed' : 'f'}/${publicKey}`;
  if (!config || !['hosted', 'embed'].includes(captureRequestSurface(host, path, 'GET', config))) return { state: 'not-found' };
  try {
    const policy = captureSubmissionPolicy(), submissionAvailable = !!policy && await database().schema.hasTable('captureReceiptProcessing');
    if (submissionAvailable && policy && await takeCaptureRequestBudget(database(), policy.requestsPerMinute)) return { state: 'error' };
    const source = await readPublicCapture(database(), publicKey);
    if (source.state !== 'ready') return source;
    const context = createCaptureSubmissionContext(source.binding, config.origin, process.env.CAPTURE_CONTEXT_SECRET ?? '', source.now);
    return { state: 'ready', definition: source.definition, context, submissionAvailable };
  } catch { return { state: 'error' }; }
}
