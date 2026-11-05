import { describe, expect, it } from 'vitest';
import { captureSetupContextSchema, captureSetupProposeSchema, captureSetupCanonical, captureSetupToolParameters } from './assistant-setup';
import { chatTurnRequestSchema } from '../chat';
const id = '00000000-0000-4000-8000-000000000001';
const empty = { operation: 'create_source', sourceId: null, name: 'Fictional source', sourceType: 'website', fields: null, contactRequired: null, workflow: null, brief: null, content: null, rules: null, mappings: null, findings: null };
const setup = { sourceId: id, sourceVersion: 1, draftVersion: 1, name: 'Fictional source', configuration: { schemaVersion: 1, type: 'website' }, sample: null, findings: [] };
describe('Lead Capture setup contracts', () => {
  it('requires explicit nullable tool arguments and rejects business commits or unknown keys', () => {
    expect(captureSetupProposeSchema.safeParse(empty).success).toBe(true);
    for (const operation of ['publish', 'pause', 'connect_gmail', 'confirm']) expect(captureSetupProposeSchema.safeParse({ ...empty, operation }).success).toBe(false);
    expect(captureSetupProposeSchema.safeParse({ ...empty, confirmed: true }).success).toBe(false);
    expect(captureSetupToolParameters.required).toHaveLength(Object.keys(empty).length);
  });
  it('emits provider-compatible unions at every nested schema level', () => {
    const inspect = (value: unknown) => {
      if (!value || typeof value !== 'object') return;
      expect(value).not.toHaveProperty('oneOf');
      expect(value).not.toHaveProperty('format', 'uri');
      if ('type' in value && value.type === 'object' && 'properties' in value) {
        expect(value).toHaveProperty('additionalProperties', false);
        expect(value).toHaveProperty('required', Object.keys(value.properties as object));
      }
      for (const nested of Object.values(value)) inspect(nested);
    };
    inspect(captureSetupToolParameters);
  });
  it('restricts each setup operation to its reviewed scope', () => {
    expect(captureSetupProposeSchema.safeParse({ ...empty, operation: 'begin_revision', sourceType: null }).success).toBe(false);
    expect(captureSetupProposeSchema.safeParse({ ...empty, operation: 'suggest_workflow', sourceType: null, name: null, workflow: { assignment: { kind: 'default' }, stage: 'new', tags: [], notifyAssigned: false } }).success).toBe(true);
    expect(captureSetupProposeSchema.safeParse({ ...empty, operation: 'extract_sample', sourceType: null, name: null }).success).toBe(false);
  });
  it('bounds UTF-8 unsaved state and rejects samples on website sources', () => {
    expect(captureSetupContextSchema.safeParse(setup).success).toBe(true);
    expect(captureSetupContextSchema.safeParse({ ...setup, configuration: { ...setup.configuration, brief: '😀'.repeat(3000) } }).success).toBe(false);
    expect(captureSetupContextSchema.safeParse({ ...setup, sample: { id, version: 1, subject: '', body: '' } }).success).toBe(false);
  });
  it('binds unsaved state to the selected setup surface and source', () => {
    const request = { workspaceId: id, clientTurnId: id, message: 'Suggest fields', surfaceKey: 'lead_capture.setup', captureContext: { surface: 'lead_capture.setup', sourceId: id }, captureSetup: setup };
    expect(chatTurnRequestSchema.safeParse(request).success).toBe(true);
    expect(chatTurnRequestSchema.safeParse({ ...request, surfaceKey: 'home' }).success).toBe(false);
    expect(chatTurnRequestSchema.safeParse({ ...request, captureContext: undefined }).success).toBe(false);
  });
  it('compares object keys canonically while preserving array order and exact values', () => {
    expect(captureSetupCanonical({ b: 1, a: [1, 2] })).toBe(captureSetupCanonical({ a: [1, 2], b: 1, unused: undefined }));
    expect(captureSetupCanonical([1, 2])).not.toBe(captureSetupCanonical([2, 1]));
  });
});
