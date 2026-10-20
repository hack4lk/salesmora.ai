import { registrationSchema } from '@salesmora/contracts';
import { teamStepData as copy } from './team-step.data';
export interface TeamInvitation { id: string; email: string; role: 'field' | 'office' | 'admin' }
export interface TeamValues { invitations: TeamInvitation[] }
export type TeamErrors = Record<string, Partial<Record<'email' | 'role', string>>>;
export function validateTeam(values: TeamValues, ownerEmail: string): TeamErrors {
  const errors: TeamErrors = {};
  const seen = new Set<string>();
  for (const invite of values.invitations) {
    const row: TeamErrors[string] = {};
    const email = invite.email.trim().toLowerCase();
    if (!registrationSchema.shape.email.safeParse(email).success) row.email = copy.errors.email;
    else if (email === ownerEmail.trim().toLowerCase()) row.email = copy.errors.owner;
    else if (seen.has(email)) row.email = copy.errors.duplicate;
    seen.add(email);
    if (!copy.roles.some(option => option.value === invite.role)) row.role = copy.errors.role;
    if (Object.keys(row).length) errors[invite.id] = row;
  }
  return errors;
}
