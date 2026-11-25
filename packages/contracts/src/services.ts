import { z } from 'zod';
export const workspaceServiceChoiceSchema = z.object({ id:z.uuid(), key:z.string().min(1), name:z.string().min(1), status:z.enum(['active','archived']) });
export type WorkspaceServiceChoice = z.infer<typeof workspaceServiceChoiceSchema>;
export const workspaceServiceChoicesSchema = z.object({services:z.array(workspaceServiceChoiceSchema)});
export const workspaceServiceSchema = workspaceServiceChoiceSchema.extend({ activeWorkflows:z.number().int().nonnegative(), references:z.number().int().nonnegative() });
export type WorkspaceService = z.infer<typeof workspaceServiceSchema>;
const expected = { expectedVersion:z.number().int().nonnegative() };
export const serviceSettingsCommandSchema = z.discriminatedUnion('action',[
  z.object({...expected,action:z.literal('set_workers'),serviceId:z.uuid(),workerIds:z.array(z.string().min(1).max(200)).max(100).refine(ids=>new Set(ids).size===ids.length)}).strict(),
  z.object({...expected,action:z.literal('add'),name:z.string().trim().min(1).max(100)}).strict(),
  z.object({...expected,action:z.literal('rename'),serviceId:z.uuid(),name:z.string().trim().min(1).max(100)}).strict(),
  ...(['archive','restore'] as const).map(action=>z.object({...expected,action:z.literal(action),serviceId:z.uuid()}).strict()),
  z.object({...expected,action:z.literal('delete'),serviceId:z.uuid(),confirmation:z.literal('confirm')}).strict(),
]);
export type ServiceSettingsCommand = z.infer<typeof serviceSettingsCommandSchema>;
export const saveServiceSettingsSchema = z.object({ workspaceId:z.uuid(), requestId:z.uuid(), command:serviceSettingsCommandSchema }).strict();
export const serviceQualificationsSchema=z.object({members:z.array(z.object({id:z.string(),name:z.string(),available:z.boolean()})),byService:z.record(z.string(),z.array(z.string()))});
export const serviceSettingsSnapshotSchema = z.object({workspaceId:z.uuid(),version:z.number().int().nonnegative(),canManage:z.boolean(),services:z.array(workspaceServiceSchema),qualifications:serviceQualificationsSchema.optional()});
export type ServiceSettingsSnapshot = z.infer<typeof serviceSettingsSnapshotSchema>;
