import { z } from 'zod';
import { registrationSchema } from './registration';
import { businessTypes } from './business-types';
import { serviceCatalog } from './service-catalog';
export const workspaceSchema = z.object({
  business: z.object({ businessName: z.string().trim().min(1).max(100), businessType: z.enum(businessTypes.map(option => option.value)) }).strict(),
  services: z.object({
    services: z.array(z.enum(serviceCatalog.map(option => option.value))).min(1).max(serviceCatalog.length).transform(values => [...new Set(values)]),
    postalCode: z.string().trim().max(100), serviceRange: z.enum(['', '10-miles', '25-miles', '50-miles', 'multiple-regions']),
  }).strict(),
  team: z.object({ invitations: z.array(z.object({
    email: registrationSchema.shape.email, role: z.enum(['field', 'office', 'admin']),
  }).strict()).max(100) }).strict(),
}).strict().superRefine((values, ctx) => {
  const emails = new Set<string>();
  values.team.invitations.forEach((invite, index) => {
    if (emails.has(invite.email)) ctx.addIssue({ code: 'custom', path: ['team', 'invitations', index, 'email'], message: 'Duplicate invitation.' });
    emails.add(invite.email);
  });
});
export type WorkspaceInput = z.infer<typeof workspaceSchema>;
