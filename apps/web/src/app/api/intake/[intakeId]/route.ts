import { readIntakeItem } from '@salesmora/data/lead-capture/intake-store';
import { intakeRequest } from '../../../../server/lead-capture/intake-http';
import { database } from '../../../../server/workspaces/store';
import { enabledPermissions } from '../../../../server/authorization/permissions';
export async function GET(request: Request, context: { params: Promise<{ intakeId: string }> }) {
  const { intakeId } = await context.params;
  return intakeRequest(request, (identity, input) => readIntakeItem(database(), identity, enabledPermissions, { ...input as object, intakeId }));
}
