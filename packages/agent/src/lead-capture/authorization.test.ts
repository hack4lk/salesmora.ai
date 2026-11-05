import { describe, expect, it } from 'vitest';
import { captureAssistantOperations, type AuthorizationContext, type WorkspaceRole } from '@salesmora/contracts';
import { createDefaultWorkspacePolicy } from '@salesmora/domain';
import { implementedTools } from '../tools/registry';
import { authorizeCaptureAssistantOperation, captureAssistantCapabilities, type CaptureAssistantTargets } from './authorization';
const workspaceId = '00000000-0000-4000-8000-000000000001', other = '00000000-0000-4000-8000-000000000002';
const targets: CaptureAssistantTargets = { source: { kind: 'capture_source', id: 'source-1', workspaceId }, intake: { kind: 'intake', id: 'intake-1', workspaceId }, lead: { kind: 'lead', id: 'lead-1', workspaceId, ownerId: 'owner-user' } };
function context(role: WorkspaceRole = 'owner'): AuthorizationContext {
  const userId = `${role}-user`;
  return { workspaceId, userId, ownerUserId: 'owner-user', membership: { workspaceId, userId, role }, policy: createDefaultWorkspacePolicy(workspaceId), enabledPermissions: [...new Set(['assistant.use' as const, ...Object.values(captureAssistantCapabilities).flat(), 'leads.assign' as const, 'leads.update' as const])] };
}
const authorize = (c: AuthorizationContext, op: unknown, records: CaptureAssistantTargets = targets) => authorizeCaptureAssistantOperation(c, op, records, captureAssistantOperations);
describe('Lead Capture assistant permission policy', () => {
  it('registers implemented setup tools while operation authorization remains disabled by default', () => {
    for (const op of captureAssistantOperations) expect(authorizeCaptureAssistantOperation(context(), op, targets).allowed).toBe(false);
    expect(implementedTools).toContain('lead_capture_query');
    expect(implementedTools).toContain('lead_capture_propose_action');
    expect(authorize(context(), 'enable_delivery').allowed).toBe(false);
    expect(authorizeCaptureAssistantOperation(context(), 'publish', targets, ['sources']).allowed).toBe(false);
  });
  for (const role of ['owner', 'admin', 'office'] as const) it(`${role}: intersects every operation with exact enabled permissions`, () => {
    const c = context(role);
    for (const operation of captureAssistantOperations) {
      // Intake corrections now have a reviewed application use case.
      expect(authorize(c, operation).allowed, operation).toBe(true);
      for (const permission of ['assistant.use', ...captureAssistantCapabilities[operation]]) expect(authorize({ ...c, enabledPermissions: c.enabledPermissions.filter(p => p !== permission) }, operation).allowed, `${operation}: ${permission}`).toBe(false);
    }
  });
  it('denies Field by default and honors custom reviewed grants without role shortcuts', () => {
    const c = context('field');
    for (const operation of captureAssistantOperations) expect(authorize(c, operation).allowed).toBe(false);
    c.policy.grants.push({ role: 'field', permission: 'leadCapture.read', scope: 'workspace' });
    expect(authorize(c, 'sources', {}).allowed).toBe(true);
    expect(authorize(c, 'source_details').allowed).toBe(true);
    expect(authorize(c, 'publish').allowed).toBe(false);
  });
  it('requires loaded record targets and denies foreign workspace or wrong record kinds', () => {
    for (const operation of ['source_details', 'publish', 'duplicate'] as const) {
      expect(authorize(context(), operation, {}).allowed).toBe(false);
      expect(authorize(context(), operation, { source: { ...targets.source!, workspaceId: other } }).allowed).toBe(false);
      expect(authorize(context(), operation, { source: targets.intake }).allowed).toBe(false);
    }
    for (const operation of ['intake_details', 'dismiss_intake', 'create_lead'] as const) {
      expect(authorize(context(), operation, {}).allowed).toBe(false);
      expect(authorize(context(), operation, { intake: { ...targets.intake!, workspaceId: other } }).allowed).toBe(false);
      expect(authorize(context(), operation, { intake: targets.source }).allowed).toBe(false);
    }
    expect(authorize(context(), 'link_lead', { intake: targets.intake }).allowed).toBe(false);
    expect(authorize(context(), 'link_lead', { ...targets, lead: { ...targets.lead!, workspaceId: other } }).allowed).toBe(false);
  });
  it('retains mandatory source, intake and linked-lead collection constraints', () => {
    const sources = authorize(context(), 'sources', {}), intake = authorize(context(), 'intake_items', {}), duplicates = authorize(context(), 'duplicate_candidates', { intake: targets.intake });
    expect(sources.allowed && sources.scopes['leadCapture.read']?.workspaceId).toBe(workspaceId);
    expect(intake.allowed && intake.scopes['intake.read']?.workspaceId).toBe(workspaceId);
    expect(duplicates.allowed && duplicates.scopes['leads.read']?.scope).toBe('workspace');
  });
  it('requires assignment authority when creating a lead and exact update fields only when linking changes', () => {
    const c = context();
    expect(authorize({ ...c, enabledPermissions: c.enabledPermissions.filter(p => p !== 'leads.assign') }, 'create_lead').allowed).toBe(false);
    const noUpdate = { ...c, enabledPermissions: c.enabledPermissions.filter(p => p !== 'leads.update') };
    expect(authorize(noUpdate, 'link_lead').allowed).toBe(true);
    expect(authorize(noUpdate, 'link_lead', { ...targets, leadFields: ['name'] }).allowed).toBe(false);
    expect(authorize(c, 'link_lead', { ...targets, leadFields: ['name', 'email'] }).allowed).toBe(true);
    expect(authorize(c, 'link_lead', { ...targets, leadFields: ['ownerId'] }).allowed).toBe(false);
    expect(authorize(c, 'dismiss_intake', { ...targets, leadFields: ['name'] }).allowed).toBe(false);
  });
  it('checks the current selected lead assignment rather than trusting intake access', () => {
    const c = context('field');
    c.policy.grants.push({ role: 'field', permission: 'intake.read', scope: 'workspace' }, { role: 'field', permission: 'intake.approve', scope: 'workspace' });
    expect(authorize(c, 'link_lead').allowed).toBe(false);
    expect(authorize(c, 'link_lead', { ...targets, lead: { ...targets.lead!, ownerId: c.userId } }).allowed).toBe(true);
    const decision = authorize(c, 'duplicate_candidates', { intake: targets.intake });
    expect(decision.allowed && decision.scopes['leads.read']?.scope).toBe('assigned');
  });
});
