import { z } from 'zod';
import { captureIdSchema, captureVersionSchema } from './common';
export const captureInstallationSchema = z.object({
  id: captureIdSchema, version: captureVersionSchema, name: z.string().min(1).max(80), hostedUrl: z.url(),
  status: z.enum(['active', 'paused', 'scheduled', 'archived', 'blocked']),
  embeds: z.array(z.object({ method: z.enum(['iframe', 'javascript']), code: z.string().min(1).max(20000) }).strict()).min(1).max(2),
  scheduledAt: z.iso.datetime().optional(), timezone: z.string().max(100).optional(),
}).strict();
export type CaptureInstallation = z.infer<typeof captureInstallationSchema>;
