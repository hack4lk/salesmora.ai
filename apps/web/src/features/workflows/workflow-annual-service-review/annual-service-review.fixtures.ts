import type { AnnualServiceRule } from './workflow-annual-service-card';
import type { ServiceDueCustomer, ServiceEmailTemplate, ServiceEmailSendReview } from '../workflow-service-due/workflow-service-due.types';
import { previewServiceEmail } from '../workflow-service-due/service-email-template';
export const annualServices = [{ id: 'gutters', name: 'Gutter cleaning' }, { id: 'roofing', name: 'Roofing' }, { id: 'washing', name: 'Pressure washing' }];
export const annualRecipients = [{ id: 'morgan', name: 'Morgan Ellis' }, { id: 'alex', name: 'Alex Parker' }];
export const annualRule: AnnualServiceRule = { name: 'Annual gutter-cleaning review', serviceId: 'gutters', firstReviewDate: '2027-03-15', localTime: '09:00', recipientId: 'morgan', notifications: { inApp: true, email: true } };
export const annualCompany = { version: 1, phone: '(555) 010-0142', email: 'office@example.test' };
export const annualTemplate: ServiceEmailTemplate = { id: 'annual-template', version: 1, subject: 'Planning your {Service}?', body: 'Hi {First name},\n\nWe’re planning upcoming {Service} visits. If you’d like to arrange yours, call {Company phone} or email {Company email}.\n\nThank you,\nThe service team' };
export const annualCustomers: ServiceDueCustomer[] = [
  { id: 'annual-1', version: 1, customerId: 'customer-1', name: 'Skyler Grant', firstName: 'Skyler', email: 'skyler@example.test', jobId: 'job-1', jobNumber: 'J-0012', completedDate: '2026-09-14', dueDate: '2027-03-15', status: 'due' },
  { id: 'annual-2', version: 1, customerId: 'customer-2', name: 'Jordan Lee', firstName: 'Jordan', email: 'jordan@example.test', jobId: 'job-2', jobNumber: 'J-0013', completedDate: '2026-11-06', dueDate: '2027-03-15', status: 'due' },
  { id: 'annual-3', version: 1, customerId: 'customer-3', name: 'Avery Chen', firstName: 'Avery', email: null, jobId: 'job-3', jobNumber: 'J-0014', completedDate: '2026-10-02', dueDate: '2027-03-15', status: 'due', exclusion: 'No email address' },
];
export function annualEmailReview(rows = annualCustomers): ServiceEmailSendReview {
  return { id: 'annual-email-review', revision: 'annual-v1', expiresAt: '2099-03-15T16:00:00Z', templateId: annualTemplate.id, templateVersion: annualTemplate.version,
    from: 'Service reminders <service@example.test>', replyTo: annualCompany.email, senderReady: true, excluded: [], messages: rows.filter(row => !!row.email).map(row => ({
      cycleId: row.id, cycleVersion: row.version, customerId: row.customerId, name: row.name, to: row.email!, ...previewServiceEmail(annualTemplate, annualServices[0].name, row, annualCompany),
    })) };
}
