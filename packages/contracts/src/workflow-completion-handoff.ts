import {z} from 'zod';
import {workflowChannelChoicesSchema} from './workflow-channels';
export const completionHandoffValuesSchema=z.object({name:z.string().trim().min(1).max(120),recipientId:z.string().min(1).max(200),notifications:workflowChannelChoicesSchema}).strict();
export type CompletionHandoffValues=z.infer<typeof completionHandoffValuesSchema>;
export const completionHandoffSnapshotSchema=z.object({jobId:z.uuid(),jobNumber:z.string().regex(/^J-\d{4,}$/),jobTitle:z.string().min(1).max(200),totalOpen:z.number().int().positive().max(Number.MAX_SAFE_INTEGER),workOrders:z.array(z.object({number:z.string().regex(/^WO-\d{4,}$/),title:z.string().max(200),status:z.enum(['draft','issued','in-progress'])}).strict()).min(1).max(3)}).strict();
export type CompletionHandoffSnapshot=z.infer<typeof completionHandoffSnapshotSchema>;
export const completionHandoffOptionsSchema=z.object({recipients:z.array(z.object({id:z.string(),name:z.string()}).strict()).max(500)}).strict();
