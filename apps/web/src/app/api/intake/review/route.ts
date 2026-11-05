import { prepareIntakeReview } from '@salesmora/data/lead-capture/intake-store';
import { intakeRequest } from '../../../../server/lead-capture/intake-http';
import { database } from '../../../../server/workspaces/store';
import { enabledPermissions } from '../../../../server/authorization/permissions';
export async function POST(request: Request) { return intakeRequest(request, (identity, input) => prepareIntakeReview(database(), identity, enabledPermissions, input), true); }
