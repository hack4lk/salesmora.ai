import { z } from 'zod';
import { permissionIdSchema, workspaceRoleSchema } from './authorization/schemas';
export const knowledgeSlugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100);
export const knowledgeMetadataSchema = z.object({
  slug: knowledgeSlugSchema, title: z.string().trim().min(1).max(160),
  roles: z.array(workspaceRoleSchema).min(1),
  capabilities: z.array(permissionIdSchema).max(10),
  plans: z.array(z.enum(['free', 'enterprise'])).min(1),
  productStatus: z.enum(['implemented', 'planned']),
}).strict();
export type KnowledgeMetadata = z.infer<typeof knowledgeMetadataSchema>;
export type HelpSection = { anchor: string; heading: string; text: string };
export type HelpSource = { slug: string; version: string; title: string; anchor: string; heading: string; href: string };
export const helpSourceSchema = z.object({
  slug: knowledgeSlugSchema, version: z.string().regex(/^[a-f0-9]{64}$/), title: z.string().min(1).max(160),
  anchor: knowledgeSlugSchema, heading: z.string().min(1).max(160),
  href: z.string().max(400).regex(/^\/help\/[a-z0-9-]+\?workspace=[a-f0-9-]{36}&version=[a-f0-9]{64}#[a-z0-9-]+$/),
}).strict();
