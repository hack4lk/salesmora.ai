import type { WorkflowDefinition } from "@salesmora/contracts";
import type { WorkflowAutomationExample } from "./workflow-automation-guide";

// Keep every executable recipe represented; authority still comes from the server.
export const workflowAutomationExamples = {
  customer_schedule_change: [
    {id:'customer_schedule_change',name:'Notify customers about visit changes',prompt:'Automatically email customers when their visit date or arrival window changes, or their visit is no longer scheduled. Wait five minutes to combine quick corrections.'},
  ],
  post_job_thank_you: [
    {id:'post_job_thank_you',name:'Thank customers after a job',prompt:'Automatically email customers a thank-you at 9 AM, two days after the job and linked work are finished. Help me choose the message. An external review link is optional.'},
  ],
  assigned_lead_cold: [
    { id: 'assigned_lead_cold', name: 'Catch assigned leads going cold', prompt: 'Remind the lead owner at 9 AM if an assigned lead has no recorded activity for three business days.' },
  ],
  customer_visit_reminder: [
    { id: 'customer_visit_reminder', name: 'Remind customers before a visit', prompt: 'Automatically email customers at 9 AM the day before their visit with the arrival window.' },
  ],
  completion_handoff: [
    { id: "completion_handoff", name: "Catch unfinished work at job completion", prompt: "When a job is completed, notify me immediately if any linked work orders are still open. Use in-app and email." },
  ],
  annual_service_review: [
    { id: "annual_service_review", name: "Review customers on a chosen date", prompt: "Every March 15 at 9 AM, remind me in-app and by email to review Gutter cleaning customers." },
  ],
  service_due: [
    { id: "service_due", name: "Repeat service reminders", prompt: "Remind me in-app and by email at 9 AM when customers are due for Gutter cleaning, six months after their latest job was marked completed. Start with future completions." },
  ],
  cancellation_fill: [
    { id: "cancellation_fill", name: "Fill a cancellation", prompt: "When a Roofing visit frees an opening, suggest unscheduled Roofing jobs. Plan 1 hour with a 30-minute gap. Notify me in-app and by email; I will review before booking." },
  ],
  routine_booking: [
    { id: "routine_booking", name: "Book new jobs automatically", prompt: "Automatically book new Maintenance jobs for their assigned people. Allow 1 hour Monday–Friday from 8 AM to noon, a 30-minute gap and 14 calendar days. Notify me in-app and by email if no time fits." },
    { id: "routine_booking_qualified", name: "Choose a qualified worker and book", prompt: "Automatically book new unassigned Maintenance jobs using one configured qualified worker. Allow 1 hour Monday–Friday from 8 AM to noon, a 30-minute gap and 14 calendar days. Notify me in-app and by email if no time fits." },
  ],
  lead_routing: [
    { id: "lead_routing", name: "Share new leads fairly", prompt: "Take turns assigning new unassigned leads from my website form to the teammates I choose. Match their saved work ZIP codes and keep existing owners." },
    { id: "lead_routing_owner", name: "Route leads to one teammate", prompt: "Assign new unassigned leads from my website form to Alex Parker. Keep existing owners." },
    { id: "lead_routing_workload", name: "Balance open leads", prompt: "Assign new unassigned leads from my website form to Alex Parker or Morgan Ellis, choosing whoever has the fewest open leads. Match their saved work ZIP codes and keep existing owners." },
  ],
  visit_materials: [
    { id: "visit_materials", name: "Check materials before a visit", prompt: "Remind me at 8 AM the day before a visit if materials are still needed or on order." },
  ],
  unassigned_visit: [
    { id: "unassigned_visit", name: "Catch visits without an assignee", prompt: "Remind me at 8 AM the day before a visit if nobody is assigned." },
  ],
  weekly_briefing: [
    { id: "weekly_briefing", name: "Start Monday with a briefing", prompt: "Send me a briefing every Monday at 9 AM with inactive leads, estimates awaiting a decision, unscheduled jobs and jobs due soon." },
  ],
  unassigned_lead: [
    { id: "unassigned_lead", name: "Catch unassigned leads", prompt: "Remind me after one business day if a new lead is still unassigned." },
  ],
  estimate_follow_up: [
    { id: "estimate_follow_up", name: "Follow up on sent estimates", prompt: "Remind me two business days after an estimate is sent if it still has no decision." },
  ],
  unscheduled_estimate: [
    { id: "unscheduled_estimate", name: "Flag unscheduled work", prompt: "Remind me after one business day if an approved estimate still needs a visit." },
  ],
} satisfies Record<WorkflowDefinition["kind"], readonly [WorkflowAutomationExample, ...WorkflowAutomationExample[]]>;

export function automationExamplesFor(recipes: readonly WorkflowDefinition["kind"][]): WorkflowAutomationExample[] {
  return (Object.keys(workflowAutomationExamples) as WorkflowDefinition["kind"][])
    .filter(kind => recipes.includes(kind))
    .flatMap(kind => workflowAutomationExamples[kind]);
}
