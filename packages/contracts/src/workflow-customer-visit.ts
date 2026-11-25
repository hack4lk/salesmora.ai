import { z } from 'zod';
export const customerVisitValuesSchema = z.object({ name: z.string().trim().min(1).max(120), localTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/) }).strict();
export const customerVisitOptionsSchema = z.object({ company: z.object({ version:z.number().int().nonnegative().default(0), name: z.string(), phone: z.string(), email: z.string() }), senderReady: z.boolean(), canConfigureCompany:z.boolean().default(false) }).strict();

export type CustomerVisitOptions = z.infer<typeof customerVisitOptionsSchema>;
