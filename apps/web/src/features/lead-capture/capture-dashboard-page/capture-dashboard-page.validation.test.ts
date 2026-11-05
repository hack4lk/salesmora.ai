import { describe, expect, it } from 'vitest';
import { captureDashboardFixture, captureDashboardPublicationFixture } from './capture-dashboard-page.fixtures';
import { captureDashboardActions, captureDashboardPublication, validCaptureDashboardRecord } from './capture-dashboard-page.validation';
describe('source dashboard composition', () => {
  it('intersects host capabilities with source status', () => {
    const source = captureDashboardFixture();
    expect(captureDashboardActions(source)).toEqual(['pause', 'duplicate', 'archive']);
    expect(captureDashboardActions({ ...source, allowedActions: ['archive'] })).toEqual(['archive']);
    expect(captureDashboardActions({ ...source, status: 'archived' })).toEqual(['restore', 'duplicate']);
    expect(captureDashboardActions({ ...source, version: 0 })).toEqual([]);
  });
  it('preserves unpublished drafts through archive/restore without allowing resume', () => {
    const source = captureDashboardFixture('website', 'draft');
    expect(validCaptureDashboardRecord({ ...source, status: 'archived' })).toBe(true);
    expect(validCaptureDashboardRecord({ ...source, status: 'paused' })).toBe(true);
    expect(captureDashboardActions({ ...source, status: 'paused' })).not.toContain('resume');
    expect(validCaptureDashboardRecord({ ...source, status: 'active' })).toBe(false);
  });
  it('keeps approved configuration separate from a newer draft revision', () => {
    const source = captureDashboardFixture();
    expect(validCaptureDashboardRecord({ ...source, draftVersion: source.configuration.version + 1 })).toBe(true);
    expect(validCaptureDashboardRecord({ ...source, draftVersion: source.configuration.version })).toBe(false);
    expect(validCaptureDashboardRecord({ ...source, availability: { type: 'gmail', status: 'connected', email: 'x@example.com' } })).toBe(false);
  });
  it('binds installation details to source, approved version, status and schedule', () => {
    const source = captureDashboardFixture(), publication = captureDashboardPublicationFixture(source)!;
    expect(captureDashboardPublication(source, publication)).toBe(true);
    expect(captureDashboardPublication({ ...source, version: source.version + 1 }, publication)).toBe(true);
    for (const patch of [{ id: 'other' }, { version: publication.version + 1 }, { status: 'paused' as const }]) expect(captureDashboardPublication(source, { ...publication, ...patch })).toBe(false);
    const scheduled = captureDashboardFixture('website', 'scheduled'), scheduledPublication = captureDashboardPublicationFixture(scheduled)!;
    expect(captureDashboardPublication(scheduled, scheduledPublication)).toBe(true);
    expect(captureDashboardPublication(scheduled, { ...scheduledPublication, scheduledAt: '2026-11-04T14:00:00.000Z' })).toBe(false);
    expect(captureDashboardPublication(captureDashboardFixture('gmail'), publication)).toBe(false);
  });
});
