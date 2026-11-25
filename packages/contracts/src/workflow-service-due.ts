import {z} from 'zod';
import {workflowChannelChoicesSchema} from './workflow-channels';
export const serviceDueRulesSchema=z.object({intervalMonths:z.union([z.literal(3),z.literal(6),z.literal(12)]),includeExisting:z.boolean()}).strict();
export const serviceDueValuesSchema=z.object({name:z.string().trim().min(1).max(120),service:z.string().min(1).max(200),rules:serviceDueRulesSchema,recipientId:z.string().min(1),localTime:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),notifications:workflowChannelChoicesSchema}).strict();
export const serviceEmailTextSchema=z.object({subject:z.string().trim().min(1).max(200).refine(v=>!/[\r\n]/.test(v)),body:z.string().trim().min(1).max(8000)}).strict();
export const serviceEmailTemplateSchema=serviceEmailTextSchema.safeExtend({id:z.uuid(),version:z.number().int().positive()});
export const serviceDueCustomerSchema=z.object({id:z.uuid(),version:z.number().int().positive(),customerId:z.uuid(),name:z.string(),firstName:z.string().nullable(),email:z.string().nullable(),completedDate:z.string(),dueDate:z.string(),jobId:z.uuid(),jobNumber:z.string(),activeJob:z.object({id:z.uuid(),number:z.string()}).optional(),status:z.enum(['due','work_open','snoozed','dismissed','queued','sent','failed']),exclusion:z.string().optional()}).strict();
export const serviceEmailMessageSchema=serviceEmailTextSchema.safeExtend({cycleId:z.uuid(),cycleVersion:z.number().int().positive(),customerId:z.uuid(),name:z.string(),to:z.email()});
export const serviceEmailReviewSchema=z.object({id:z.uuid(),revision:z.string(),expiresAt:z.iso.datetime(),templateId:z.uuid(),templateVersion:z.number().int().positive(),from:z.string(),replyTo:z.string(),senderReady:z.boolean(),messages:z.array(serviceEmailMessageSchema).max(100),excluded:z.array(z.object({name:z.string(),reason:z.string()})).max(100)}).strict();
export const serviceEmailResultSchema=z.object({cycleId:z.uuid(),name:z.string(),status:z.enum(['queued','sent','failed'])}).strict();
export const serviceCompanySchema=z.object({version:z.number().int().nonnegative(),phone:z.string().max(100),email:z.string().max(254)}).strict();
export const serviceDueFilterSchema=z.enum(['active','contacted']);
export type ServiceDueFilter=z.infer<typeof serviceDueFilterSchema>;
export const serviceDuePageSchema=z.object({reviewDate:z.string().optional(),filter:serviceDueFilterSchema.default('active'),workflowId:z.uuid(),workflowVersion:z.number().int().positive(),workflowName:z.string(),service:z.object({id:z.uuid(),name:z.string()}),rows:z.array(serviceDueCustomerSchema).max(100),total:z.number().int().nonnegative(),page:z.number().int().positive(),pageSize:z.union([z.literal(25),z.literal(50),z.literal(100)]),today:z.string(),canRead:z.literal(true),canManage:z.boolean(),canEmail:z.boolean(),canConfigureCompany:z.boolean(),paused:z.boolean(),company:serviceCompanySchema,template:serviceEmailTemplateSchema,initializing:z.boolean()}).strict();
const cycle=z.object({id:z.uuid(),version:z.number().int().positive()}).strict();
export const serviceDueCommandSchema=z.discriminatedUnion('action',[
 z.object({action:z.literal('resolve'),cycleId:z.uuid(),expectedVersion:z.number().int().positive(),resolution:z.enum(['dismiss','snooze']),date:z.string().optional()}).strict(),
 z.object({action:z.literal('template'),serviceId:z.uuid(),templateId:z.uuid(),expectedVersion:z.number().int().positive(),text:serviceEmailTextSchema}).strict(),
 z.object({action:z.literal('company'),expectedVersion:z.number().int().nonnegative(),phone:z.string().trim().min(1).max(100).regex(/^[0-9+()\-.\sx]+$/),email:z.email().max(254)}).strict(),
 z.object({action:z.literal('prepare'),cycles:z.array(cycle).min(1).max(100).refine(v=>new Set(v.map(c=>c.id)).size===v.length),templateId:z.uuid(),templateVersion:z.number().int().positive()}).strict(),
 z.object({action:z.literal('revise'),reviewId:z.uuid(),revision:z.string(),messages:z.array(serviceEmailMessageSchema).min(1).max(100)}).strict(),
 z.object({action:z.literal('send'),reviewId:z.uuid(),revision:z.string()}).strict(),
 z.object({action:z.literal('generate'),serviceId:z.uuid(),templateVersion:z.number().int().positive(),request:z.string().trim().min(1).max(2000),current:z.object({subject:z.string().max(200),body:z.string().max(8000)}).strict()}).strict()
]);
export type ServiceDueCustomer=z.infer<typeof serviceDueCustomerSchema>;
export type ServiceEmailText=z.infer<typeof serviceEmailTextSchema>;
export type ServiceEmailTemplate=z.infer<typeof serviceEmailTemplateSchema>;
export type ServiceEmailSendReview=z.infer<typeof serviceEmailReviewSchema>;
export type ServiceEmailMessage=z.infer<typeof serviceEmailMessageSchema>;
export type ServiceEmailResult=z.infer<typeof serviceEmailResultSchema>;
export type ServiceDuePage=z.infer<typeof serviceDuePageSchema>;

export type ServiceDueValues=z.infer<typeof serviceDueValuesSchema>;

export const serviceDueSavedSchema=z.object({ok:z.literal(true)}).strict();
export const serviceEmailResultsSchema=z.array(serviceEmailResultSchema).max(100);
