import { createCaptureDraft, listCaptureSources } from '@salesmora/data';
import { captureRequest } from '../../../server/lead-capture/http';
import { database } from '../../../server/workspaces/store';
import { enabledPermissions } from '../../../server/authorization/permissions';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) { return captureRequest(request, (identity, input) => listCaptureSources(database(), identity, enabledPermissions, input)); }
export async function POST(request: Request) { return captureRequest(request, (identity, input) => createCaptureDraft(database(), identity, enabledPermissions, input), true); }
