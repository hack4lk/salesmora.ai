import { disconnectCaptureGmail, reviewCaptureGmailDisconnect } from '@salesmora/data/lead-capture/gmail-connections';
import { captureRequest } from '../../../../../server/lead-capture/http';
import { gmailConnectionConfiguration } from '../../../../../server/lead-capture/gmail';
import { database } from '../../../../../server/workspaces/store';
import { enabledPermissions } from '../../../../../server/authorization/permissions';
export const dynamic = 'force-dynamic';
export function GET(request: Request) { return captureRequest(request, (identity, input) => reviewCaptureGmailDisconnect(database(), identity, enabledPermissions, input, gmailConnectionConfiguration())); }
export function POST(request: Request) { return captureRequest(request, (identity, input) => disconnectCaptureGmail(database(), identity, enabledPermissions, input, gmailConnectionConfiguration()), true); }
