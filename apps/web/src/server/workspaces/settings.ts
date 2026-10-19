import 'server-only';
import { authorize } from '@salesmora/domain';
import { AuthorizationAccessError } from '@salesmora/data';
import { authorizedWorkspace } from '../authorization/permissions';

export async function workspaceSettings(userId: string, workspaceId: string) {
  return authorizedWorkspace(userId, workspaceId, false, async (trx, context) => {
    const readBusiness = authorize(context, { permission: 'settings.business.read' }).allowed;
    if (!readBusiness && !authorize(context, { permission: 'permissions.read' }).allowed && !authorize(context,{permission:'billing.read'}).allowed && !authorize(context,{permission:'billing.manage'}).allowed) throw new AuthorizationAccessError();
    if (!readBusiness) return { context, profile: null };
    const profile = await trx('workspaces').where({ id: workspaceId }).first('businessName', 'businessType', 'postalCode', 'serviceRange') as {
      businessName: string; businessType: string; postalCode: string; serviceRange: string;
    };
    const services = await trx('workspaceServices').where({ workspaceId }).select<{ service: string }[]>('service').orderBy('service');
    return { context, profile: { ...profile, services: services.map(row => row.service) } };
  });
}
