import 'server-only';
import {
  authorizeChatTool, authorizeLeadOperation, availableCaptureSetupOperations,
  availableCustomerOperations, availableMaterialOperations, availableWorkOrderOperations, liveChatTools,
  type ImplementedToolId,
} from '@salesmora/agent';
import { isLeadOperation, type AuthorizationContext, type ChatSurfaceKey } from '@salesmora/contracts';
import { AuthorizationAccessError } from '@salesmora/data';

function operationOf(args: unknown): string | undefined {
  if (!args || typeof args !== 'object') return;
  const request = 'request' in args ? args.request : args;
  return request && typeof request === 'object' && 'operation' in request &&
    typeof request.operation === 'string' ? request.operation : undefined;
}

export function assertToolOperation(
  authority: AuthorizationContext, surface: ChatSurfaceKey, name: ImplementedToolId, args: unknown,
) {
  if (!authorizeChatTool(authority, surface, name, liveChatTools).allowed) throw new AuthorizationAccessError();
  const operation = operationOf(args);
  if (name === 'leads_query' || name === 'leads_propose_action') {
    if (!isLeadOperation(operation) || !authorizeLeadOperation(authority, surface, operation).allowed)
      throw new AuthorizationAccessError();
  }
  const available = name === 'customers_query' || name === 'customers_propose_action'
    ? availableCustomerOperations(authority)
    : name === 'lead_capture_propose_action' ? availableCaptureSetupOperations(authority)
    : name === 'materials_propose_action' ? availableMaterialOperations(authority)
    : name === 'work_orders_propose_action' ? availableWorkOrderOperations(authority) : undefined;
  if (available && !available.some(item => item === operation)) throw new AuthorizationAccessError();
}
