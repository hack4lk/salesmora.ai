import { describe, expect, it } from 'vitest';
import { createJobSchema, jobMutationSchema } from './job';
import { leadSchema } from './lead';
import { estimateConversionJobSchema } from './estimate-conversion';
const workspaceId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const base = { workspaceId, submissionId: workspaceId, customerId: workspaceId, title: 'Roof repair', primaryOwnerId: null };
describe('structured record geography', () => {
  it('requires a real ZIP on all new Jobs and normalizes ZIP+4 without losing leading zeros', () => {
    expect(createJobSchema.safeParse(base).success).toBe(false);
    expect(createJobSchema.safeParse({ ...base, location: '00501 Main Street', postalCode: '' }).success).toBe(false);
    expect(createJobSchema.parse({ ...base, postalCode: '00501-1234' })).toMatchObject({ postalCode: '00501', countryCode: 'US' });
    expect(createJobSchema.safeParse({ ...base, postalCode: '10001', countryCode: 'CA' }).success).toBe(false);
  });
  it('requires ZIP on Work details saves without imposing it on unrelated status operations', () => {
    const edit = { workspaceId, submissionId: workspaceId, jobId: workspaceId, expectedVersion: 1, action: 'edit', title: 'Repair', service: '', location: '', description: '' };
    expect(jobMutationSchema.safeParse(edit).success).toBe(false);
    expect(jobMutationSchema.safeParse({ ...edit, postalCode: '10001' }).success).toBe(true);
    expect(jobMutationSchema.safeParse({ workspaceId, submissionId: workspaceId, jobId: workspaceId, expectedVersion: 1, action: 'status', to: 'in-progress' }).success).toBe(true);
  });
  it('keeps optional lead geography separate from address and requires it before conversion', () => {
    const lead = { name: 'Alex', email: '', phone: '', service: 'Roofing', address: '18 Main St 00501', details: '', notes: '', source: 'website', stage: 'new', ownerId: '' };
    expect(leadSchema.parse(lead).postalCode).toBeUndefined();
    expect(leadSchema.parse({ ...lead, postalCode: '00501-1234' }).postalCode).toBe('00501');
    expect(leadSchema.safeParse({ ...lead, postalCode: 'NYC' }).success).toBe(false);
    const conversion = { customerId: workspaceId, title: 'Roofing', service: '', location: '', description: '', primaryOwnerId: null, teamUserIds: [], scheduledDate: null, arrivalWindow: null, completionDeadline: null };
    expect(estimateConversionJobSchema.safeParse(conversion).success).toBe(false);
    expect(estimateConversionJobSchema.parse({ ...conversion, postalCode: '00501-1234' }).postalCode).toBe('00501');
  });
});
