import { proposeCaptureSource, CapturePublicationError } from '@salesmora/data';
import { CaptureDraftEntitlementError, CaptureDraftValidationError, CaptureDraftConflictError, proposeCaptureSetup } from '@salesmora/data';
import { captureSourceOperations, captureProposeToolSchema, captureSetupProposeSchema } from '@salesmora/contracts';
import 'server-only';
import { readToolRegistry } from '@salesmora/agent';
import { readCaptureForChat } from '@salesmora/data';
import { database } from '../../workspaces/store';
import { enabledPermissions } from '../../authorization/permissions';
import { captureDeliveryAuthority } from '../../lead-capture/delivery';
import { captureInstallationOrigin } from '../../lead-capture/submission-policy';
import { captureChatDeliveryStamp } from '../capture-policy';
import { rememberCaptureRead } from '../store';
import type { ChatToolHandler } from './types';
export const captureQuery: ChatToolHandler = async (context, raw) => {
  const input = readToolRegistry.lead_capture_query.inputSchema.parse(raw);
  await context.authorize('lead_capture_query'); context.signal.throwIfAborted();
  const read = await readCaptureForChat(database(), context.identity, enabledPermissions, input, { pageContext: context.pageContext.captureContext, authority: captureDeliveryAuthority(), installationOrigin: captureInstallationOrigin(process.env, context.identity.workspaceId), deliveryStamp: captureChatDeliveryStamp(context.identity.workspaceId) });
  context.signal.throwIfAborted();
  if ('clarification' in read) return { evidence: { type: 'capture-clarification', instruction: read.clarification } };
  const ticket = await rememberCaptureRead(context.identity, context.turnId, read.stamp, read.snapshot);
  await context.authorize('lead_capture_query');
  return { captureResult: ticket, evidence: { type: 'capture-read-result', untrusted: true, result: read.snapshot.result, instruction: 'Historical authorized read only. No save, launch, lifecycle change, Gmail connection or intake decision occurred. Current page selection alone may fill a missing source reference; do not reuse IDs from earlier conversation as a selection. Installation null means unavailable; never fabricate a URL.' } };
};

export const capturePropose: ChatToolHandler = async (context, raw) => {
  await context.authorize('lead_capture_propose_action'); context.signal.throwIfAborted();
  const wire = captureProposeToolSchema.parse(raw);
  if (captureSourceOperations.some(operation => operation === wire.operation)) {
    if (['sourceType','fields','contactRequired','workflow','brief','content','rules','mappings','findings'].some(key => wire[key as keyof typeof wire] !== null)) return { evidence: { type: 'capture-source-clarification', instruction: 'Source actions use saved configuration only. Save draft edits separately, then ask for a new source review.' } };
    try {
      const view = await proposeCaptureSource(database(), context.identity, enabledPermissions, context.turnId, { operation: wire.operation, sourceId: wire.sourceId, name: wire.name, timing: wire.timing, configurationKind: wire.configurationKind }, context.signal, captureDeliveryAuthority(), captureChatDeliveryStamp(context.identity.workspaceId));
      await context.authorize('lead_capture_propose_action');
      return { captureSource: view.ticket, evidence: { type: 'capture-source-proposal', untrusted: true, ticket: view.ticket, ready: view.ready, checks: view.checks, timing: view.timing, instruction: 'Prepared browser review only. No publication, lifecycle change or copy happened. Only an app-recorded confirmed receipt proves the operation; it never proves successful real delivery. Blocked readiness cannot be overridden through chat.' } };
    } catch (error) {
      if (!(error instanceof CapturePublicationError || error instanceof CaptureDraftConflictError || error instanceof CaptureDraftValidationError)) throw error;
      await context.authorize('lead_capture_propose_action');
      return { evidence: { type: 'capture-source-clarification', instruction: error instanceof CaptureDraftConflictError ? 'The selected source or schedule changed. Request a reload and fresh review; no operation happened.' : 'Ask for a selected source and valid source action details. Scheduled changes require an unambiguous workspace-local YYYY-MM-DDTHH:mm time; duplication requires a name. Publication requires a saved draft. No operation happened.' } };
    }
  }
  const { timing, configurationKind, ...setup } = wire;
  const parsed = captureSetupProposeSchema.safeParse(setup);
  if (!parsed.success || timing !== null || configurationKind !== null) return { evidence: { type: 'capture-setup-clarification', invalidFields: parsed.success ? ['timing/configurationKind must be null for setup actions'] : parsed.error.issues.slice(0, 10).map(issue => ({ path: issue.path.join('.'), message: issue.message })), instruction: raw && typeof raw === 'object' && 'operation' in raw && raw.operation === 'create_source' && 'name' in raw && !raw.name ? 'No proposal was prepared. Ask what the user wants to name the new capture source. Do not invent a name, deny the available setup capability or claim creation.' : 'No proposal was prepared. Correct invalid tool fields from the current setup evidence before retrying; ask the user only for facts actually missing. For extraction/mapping/sample approval, fields/findings/mappings must be provided and name/sourceType/workflow/brief/content/timing/configurationKind must be null. Nothing was created, applied or saved.' } };
  const input = parsed.data;
  let view;
  try { view = await proposeCaptureSetup(database(), context.identity, enabledPermissions, context.turnId, input, context.signal, captureChatDeliveryStamp(context.identity.workspaceId)); }
  catch (error) {
    if (!(error instanceof CaptureDraftEntitlementError || error instanceof CaptureDraftValidationError || error instanceof CaptureDraftConflictError)) throw error;
    await context.authorize('lead_capture_propose_action');
    return { evidence: { type: 'capture-setup-clarification', invalidFields: error instanceof CaptureDraftValidationError ? error.issues : [], instruction: error instanceof CaptureDraftEntitlementError ? 'No proposal was prepared. Gmail capture requires an eligible workspace plan. Explain this requirement and offer website draft setup instead; do not claim a Gmail connection or creation.' : error instanceof CaptureDraftConflictError ? 'No proposal was prepared. The saved source or draft changed; ask for a reload and fresh review.' : 'No proposal was prepared. Correct the reported invalid fields using the current setup evidence when available. Ask the user only for facts actually missing, such as a source selection or teammate choice. Never invent sample evidence. Do not claim a save or approval.' } };
  }
  await context.authorize('lead_capture_propose_action');
  return { captureSetup: view.ticket, evidence: { type: 'capture-setup-proposal', untrusted: true, ticket: view.ticket, review: view.review, instruction: 'Prepared for browser review only. Nothing saved/applied/approved yet. Never treat a chat yes as confirmation.' } };
};
