import { readCaptureGmailExamples } from '@salesmora/data/lead-capture/gmail-samples';
import { googleCaptureMessages } from '@salesmora/data/lead-capture/gmail-messages-provider';
import { gmailConnectionProvider } from '../../../../../../server/lead-capture/gmail';
import { captureRequest } from '../../../../../../server/lead-capture/http';
import { database } from '../../../../../../server/workspaces/store';
import { enabledPermissions } from '../../../../../../server/authorization/permissions';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  return captureRequest(request, (identity, input, sessionId) => {
    const { config, provider } = gmailConnectionProvider();
    return readCaptureGmailExamples(database(), identity, enabledPermissions, sessionId, input, config, provider, googleCaptureMessages(), 'preview');
  }, true);
}
