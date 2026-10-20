import { z } from 'zod';

export const accountDeletionRequestSchema = z.object({
  workspaceId: z.uuid(), password: z.string().min(1).max(128),
  confirmation: z.string().min(1).max(320), acknowledged: z.literal(true),
}).strict();
export type AccountDeletionRequest = z.infer<typeof accountDeletionRequestSchema>;
