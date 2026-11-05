import { z } from 'zod';
import { workspaceSuspensionPasskeyResponseSchema, workspaceSuspensionTokenSchema } from './workspace-management';

const workspaceId = z.uuid();
const eventId = z.string().max(128).regex(/^evt_[A-Za-z0-9]+$/);
const reason = z.string().trim().min(10).max(500);

export const adminWorkspaceWebhookReplayOperationSchema = z.union([
  z.object({
    operation: z.literal('start'),
    workspaceId,
    eventId,
    reason,
  }).strict(),
  z.object({
    operation: z.literal('factor'),
    workspaceId,
    token: workspaceSuspensionTokenSchema,
    method: z.literal('totp'),
    code: z.string().regex(/^\d{6}$/),
  }).strict(),
  z.object({
    operation: z.literal('factor'),
    workspaceId,
    token: workspaceSuspensionTokenSchema,
    method: z.literal('passkey'),
    response: workspaceSuspensionPasskeyResponseSchema,
  }).strict(),
  z.object({
    operation: z.literal('commit'),
    workspaceId,
    token: workspaceSuspensionTokenSchema,
  }).strict(),
]);

export const adminWorkspaceWebhookReplayOverviewSchema = z.object({
  workspaceId,
  deletionPending: z.boolean(),
  methods: z.array(z.enum(['passkey', 'totp'])).max(2),
  events: z.array(z.object({
    replayKey: eventId,
    type: z.string().min(1).max(120),
    status: z.enum(['processed', 'pending', 'retry_due', 'retry_scheduled']),
    receivedAt: z.iso.datetime(),
    processedAt: z.iso.datetime().nullable(),
    attempts: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
    retryAt: z.iso.datetime(),
  }).strict()).max(20),
}).strict();

export const adminWorkspaceWebhookReplayStartResponseSchema = z.object({
  token: workspaceSuspensionTokenSchema,
  options: z.object({
    challenge: z.string().min(1),
    rpId: z.string().optional(),
    timeout: z.number().int().positive().optional(),
    userVerification: z.literal('required'),
    extensions: z.object({}).passthrough().optional(),
    allowCredentials: z.array(z.object({
      id: z.string().min(1),
      type: z.literal('public-key'),
    }).strict()).max(100),
  }).strict(),
}).strict();

export const adminWorkspaceWebhookReplayVerifiedSchema = z.object({
  verified: z.literal(true),
}).strict();

export const adminWorkspaceWebhookReplayResultSchema = z.object({
  status: z.literal('queued'),
}).strict();

export type AdminWorkspaceWebhookReplayOperation = z.infer<typeof adminWorkspaceWebhookReplayOperationSchema>;
export type AdminWorkspaceWebhookReplayResult = z.infer<typeof adminWorkspaceWebhookReplayResultSchema>;
export type AdminWorkspaceWebhookReplayOverview = z.infer<typeof adminWorkspaceWebhookReplayOverviewSchema>;
export type AdminWorkspaceWebhookReplayStartResponse = z.infer<typeof adminWorkspaceWebhookReplayStartResponseSchema>;
