import { selectCaptureGmailAccount } from '@salesmora/data/lead-capture/gmail-connections';
import { captureRequest } from '../../../../../server/lead-capture/http';
import { gmailConnectionConfiguration } from '../../../../../server/lead-capture/gmail';
import { database } from '../../../../../server/workspaces/store';
import { enabledPermissions } from '../../../../../server/authorization/permissions';
export const dynamic = 'force-dynamic';
export function POST(request: Request) { return captureRequest(request, (identity, input) => selectCaptureGmailAccount(database(), identity, enabledPermissions, input, gmailConnectionConfiguration()), true); }
