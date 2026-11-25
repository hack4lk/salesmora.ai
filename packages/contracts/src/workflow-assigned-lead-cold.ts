import { z } from 'zod';
import { workflowChannelChoicesSchema } from './workflow-channels';
export const coldLeadRecipientSchema = z.discriminatedUnion('kind', [z.object({kind:z.literal('owner')}).strict(),z.object({kind:z.literal('teammate'),id:z.string().min(1).max(200)}).strict()]);
export const assignedLeadColdValuesSchema = z.object({name:z.string().trim().min(1).max(120),businessDays:z.number().int().min(1).max(30),localTime:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),recipient:coldLeadRecipientSchema,notifications:workflowChannelChoicesSchema}).strict().refine(v=>v.notifications.inApp||v.notifications.email,{message:'Choose at least one notification option.'});
export type ColdLeadRecipient = z.infer<typeof coldLeadRecipientSchema>;
export type AssignedLeadColdValues = z.infer<typeof assignedLeadColdValuesSchema>;
