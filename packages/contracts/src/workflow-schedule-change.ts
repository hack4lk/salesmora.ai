import { z } from 'zod';
import { arrivalWindows } from './job';
export const scheduleChangeValuesSchema = z.object({ name: z.string().trim().min(1).max(120) }).strict();
export const customerScheduleStateSchema = z.object({ date: z.iso.date(), arrivalWindow: z.enum(arrivalWindows).nullable() }).strict();
export const scheduleChangeSnapshotSchema = z.object({ before: customerScheduleStateSchema, after: customerScheduleStateSchema.nullable() }).strict();
export type CustomerScheduleState = z.infer<typeof customerScheduleStateSchema>;
