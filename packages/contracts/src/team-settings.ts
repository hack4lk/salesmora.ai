import { z } from 'zod';
import { calendarAvailabilitySchema } from './calendar-availability';

import { usPostalCodeSchema } from './postal-code';
export { usPostalCodeSchema } from './postal-code';
const revision = z.string().regex(/^[a-f0-9]{64}$/);
export const teamSettingsMemberSchema = z.object({
  id: z.string().min(1).max(200), name: z.string(), role: z.string(), revision, coverageRevision: revision,
  timezone: z.string().min(1).max(100), availability: calendarAvailabilitySchema,
  workZipCodes: z.array(z.string().regex(/^\d{5}$/)).max(500),
}).strict();
export const teamSettingsQuerySchema = z.object({ page: z.coerce.number().int().min(1).max(100000).default(1), pageSize: z.coerce.number().pipe(z.union([z.literal(10), z.literal(20), z.literal(50)])).default(10) });
export const teamSettingsSnapshotSchema = z.object({
  workspaceId: z.uuid(), canManage: z.boolean(), members: z.array(teamSettingsMemberSchema).max(50),
  total: z.number().int().nonnegative(), page: z.number().int().positive(), pageSize: z.union([z.literal(10), z.literal(20), z.literal(50)]),
}).strict();
export const teamMemberCommandSchema = z.object({
  personId: z.string().min(1).max(200),
  availability: z.object({ revision, timezone: z.string().min(1).max(100), value: calendarAvailabilitySchema }).strict().optional(),
  coverage: z.object({ revision, countryCode: z.literal('US'), postalCodes: z.array(usPostalCodeSchema).max(500).transform(codes => [...new Set(codes)].sort()) }).strict().optional(),
}).strict().refine(value => !!value.availability || !!value.coverage, 'Choose a change to save.');
export const saveTeamMemberSchema = z.object({ workspaceId: z.uuid(), requestId: z.uuid(), command: teamMemberCommandSchema }).strict();
export type TeamSettingsMember = z.infer<typeof teamSettingsMemberSchema>;
export type TeamSettingsSnapshot = z.infer<typeof teamSettingsSnapshotSchema>;
export type TeamMemberCommand = z.infer<typeof teamMemberCommandSchema>;
