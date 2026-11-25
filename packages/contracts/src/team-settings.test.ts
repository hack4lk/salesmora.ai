import { describe, expect, it } from 'vitest';
import { saveTeamMemberSchema, teamMemberCommandSchema, teamSettingsQuerySchema, usPostalCodeSchema } from './team-settings';
const revision = 'a'.repeat(64);
describe('team settings commands', () => {
  it('normalizes US coverage, preserving leading zeros and overlapping coverage between people', () => {
    const result = teamMemberCommandSchema.parse({ personId: 'alex', coverage: { revision, countryCode: 'US', postalCodes: ['10001-1234', '00501', '10001'] } });
    expect(result.coverage?.postalCodes).toEqual(['00501', '10001']);
    expect(usPostalCodeSchema.safeParse('K1A 0B1').success).toBe(false);
  });
  it('requires a real edit, a revision, the supported country and bounded lists', () => {
    expect(teamMemberCommandSchema.safeParse({ personId: 'alex' }).success).toBe(false);
    for (const coverage of [{ countryCode: 'US', postalCodes: ['10001'] }, { revision, countryCode: 'CA', postalCodes: ['10001'] }, { revision, countryCode: 'US', postalCodes: Array(501).fill('10001') }]) {
      expect(teamMemberCommandSchema.safeParse({ personId: 'alex', coverage }).success).toBe(false);
    }
  });
  it('rejects invalid availability, unrestricted list sizes and unknown command fields', () => {
    expect(teamSettingsQuerySchema.safeParse({ pageSize: 1000 }).success).toBe(false);
    expect(teamSettingsQuerySchema.safeParse({ page: 0 }).success).toBe(false);
    expect(teamMemberCommandSchema.safeParse({ personId: 'alex', availability: { revision, timezone: 'America/New_York', value: { weeklyHours: {}, unavailableDates: [] } } }).success).toBe(false);
    expect(saveTeamMemberSchema.safeParse({ workspaceId: 'none', requestId: 'none', command: {} }).success).toBe(false);
    expect(teamMemberCommandSchema.safeParse({ personId: 'alex', coverage: { revision, countryCode: 'US', postalCodes: [], allZipCodes: true } }).success).toBe(false);
  });
});
