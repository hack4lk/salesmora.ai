import { z } from "zod";
export const workflowChannelChoicesSchema = z.object({ inApp: z.boolean(), email: z.boolean() }).strict();
export const workflowNotificationChannelsSchema = workflowChannelChoicesSchema
  .refine(value => value.inApp || value.email, { message: "Choose at least one notification option." });
export type WorkflowNotificationChannels = z.infer<typeof workflowNotificationChannelsSchema>;

