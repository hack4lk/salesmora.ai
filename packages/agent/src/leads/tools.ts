import { leadCapabilities, leadToolParameters, leadsQuerySchema, leadsProposeActionSchema, type LeadOperationId, type LeadToolName } from '@salesmora/contracts';
export const leadsQueryTool = { kind: 'read', inputSchema: leadsQuerySchema, progress: 'retrieving' } as const;
export const leadsProposeActionTool = { kind: 'draft', inputSchema: leadsProposeActionSchema, progress: 'preparing_draft' } as const;
/** Describe and expose only the operations currently granted to this user on this surface. */
export function leadModelDefinition(tool: LeadToolName, operations: readonly LeadOperationId[]) {
  const allowed = operations.filter(id => Object.hasOwn(leadCapabilities, id) && leadCapabilities[id].tool === tool);
  return { type: 'function' as const, function: { name: tool, strict: true,
    description: allowed.map(id => `${id}: ${leadCapabilities[id].description}`).join('\n'),
    parameters: leadToolParameters(tool, allowed),
  } };
}
