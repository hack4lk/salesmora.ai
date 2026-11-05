import { z } from 'zod';
import { captureSetupOperations, captureSetupToolInputSchema } from './assistant-setup';
import { captureIdSchema } from './common';
import { captureDetailViewSchema } from './views';
import { captureAssistantProposalTicketSchema } from './assistant';
import { captureLaunchSchema, captureOperationResultSchema } from './commands';
import { captureReadinessCodeSchema } from './publication';
export const captureSourceOperations = ['publish', 'change_schedule', 'cancel_schedule', 'pause', 'resume', 'archive', 'restore', 'duplicate'] as const;
export const captureProposeOperations = [...captureSetupOperations, ...captureSourceOperations] as const;
const toolTiming = z.object({ kind: z.enum(['now', 'scheduled']), localDateTime: z.string().max(16).nullable() }).strict();
/** Legacy setup callers may omit the new nullable fields; model wire parameters require every property. */
export const captureProposeToolSchema = captureSetupToolInputSchema.extend({ operation: z.enum(captureProposeOperations), timing: toolTiming.nullable().default(null), configurationKind: z.enum(['draft', 'approved']).nullable().default(null) });
export const captureProposeToolParameters = z.toJSONSchema(captureProposeToolSchema, { io: 'input', override: ({ jsonSchema }) => {
    if (jsonSchema.oneOf) {
      jsonSchema.anyOf = jsonSchema.oneOf;
      delete jsonSchema.oneOf;
    }
    if (jsonSchema.format === 'uri')
      delete jsonSchema.format;
    delete jsonSchema.default;
    if (jsonSchema.type === 'object' && jsonSchema.properties)
      jsonSchema.required = Object.keys(jsonSchema.properties);
  } });
delete captureProposeToolParameters.$schema;
export const captureSourceInputSchema = z.object({ operation: z.enum(captureSourceOperations), sourceId: captureIdSchema.nullable(), name: z.string().trim().min(1).max(80).nullable(), configurationKind: z.enum(['draft', 'approved']).nullable(), timing: toolTiming.nullable() }).strict().superRefine((input, context) => {
  if (input.timing && (input.timing.kind === 'scheduled' ? !input.timing.localDateTime : input.timing.localDateTime !== null))
    context.addIssue({ code: 'custom', message: 'Provide a workspace-local date and time only for scheduled publication.' });
  if (['publish', 'change_schedule'].includes(input.operation) !== !!input.timing || input.operation !== 'duplicate' && (input.name !== null || input.configurationKind !== null) || input.operation === 'duplicate' && !input.name)
    context.addIssue({ code: 'custom', message: 'Missing or unexpected source action details.' });
});
export const captureSourceProposalViewSchema = z.object({ ticket: captureAssistantProposalTicketSchema, source: captureDetailViewSchema, timing: captureLaunchSchema.shape.timing.nullable(), configurationKind: z.enum(['draft', 'approved']).nullable(), copyName: z.string().min(1).max(80).nullable(), ready: z.boolean(), checks: z.array(z.object({ code: captureReadinessCodeSchema, ready: z.boolean() }).strict()).max(12), receipt: captureOperationResultSchema.nullable() }).strict().superRefine((view, context) => {
  const target = view.ticket.target;
  if (!captureSourceOperations.some(op => op === view.ticket.operation) || target.kind !== 'source' || target.sourceId !== view.source.detail.source.id || target.sourceVersion !== view.source.detail.source.version || (view.ticket.state === 'confirmed') !== !!view.receipt || view.receipt?.kind === 'intake')
    context.addIssue({ code: 'custom', message: 'Invalid source proposal binding.' });
  if (view.receipt && view.receipt.kind !== 'intake' && target.kind === 'source' && view.ticket.operation !== 'duplicate' && view.receipt.sourceId !== target.sourceId)
    context.addIssue({ code: 'custom', message: 'Invalid source receipt.' });
});
export type CaptureProposeInput = z.infer<typeof captureProposeToolSchema>;
export type CaptureSourceInput = z.infer<typeof captureSourceInputSchema>;
export type CaptureSourceProposalView = z.infer<typeof captureSourceProposalViewSchema>;
