import { routineBookingReview } from "./routine-booking-review";
import type { WorkflowDefinition } from "@salesmora/contracts";

export function isVisitWorkflow(definition: WorkflowDefinition): definition is Extract<WorkflowDefinition, { kind: "unassigned_visit" | "visit_materials" }> {
  return definition.kind === "unassigned_visit" || definition.kind === "visit_materials";
}

/** Missing times belong to legacy lead/estimate definitions and keep their original schedule. */
export function workflowLocalTime(definition: WorkflowDefinition) {
  return ("localTime" in definition ? definition.localTime : undefined) ?? "17:00";
}

export function workflowRuleDescription(definition: WorkflowDefinition) {
  if(definition.kind==='customer_schedule_change')return 'Automatically email customers five minutes after their visit date or arrival window changes, or their visit is no longer scheduled. Combine quick corrections within 15 minutes. Future changes only; initial bookings are excluded.';
  if(definition.kind==='post_job_thank_you')return `Automatically email a thank-you to the job customer at ${definition.localTime}, ${definition.rules.calendarDays} calendar days after the job and linked work finish.${definition.rules.reviewUrl?' Include an external review link, at most once per customer every 90 days.':''} Future completions only.`;
  if(definition.kind==='assigned_lead_cold')return `Notify ${definition.recipientMode==='owner'?'the lead owner':definition.recipientName} at ${definition.localTime} after ${definition.businessDays} business days without recorded lead activity. One reminder per inactive period; saved updates restart the timer.`;
  if(definition.kind==='customer_visit_reminder')return `Automatically email customers at ${definition.localTime} the calendar day before each visit, using its arrival window. Missing details are skipped and reported to the publisher.`;
  if(definition.kind==='completion_handoff')return `Notify ${definition.recipientName} immediately when a job is marked completed and linked work orders are still open.`;
  if(definition.kind==='annual_service_review')return `Notify ${definition.recipientName} at ${definition.localTime} to review ${definition.service} customers annually, starting ${definition.rules.firstReviewDate}. Customer emails require a separate review and Send action.`;
  if(definition.kind==='service_due')return `Notify ${definition.recipientName} at ${definition.localTime} when customers are due for ${definition.service}, ${definition.rules.intervalMonths} months after their latest job was marked completed. Customer emails require a separate review and Send action.`;
  if(definition.kind==='cancellation_fill')return `Suggest unscheduled ${definition.service} jobs when a future visit frees an opening. Plan ${definition.rules.durationMinutes} minutes with a ${definition.rules.gapMinutes}-minute gap. Notify ${definition.recipientName}; review before booking.`;
  if (definition.kind === 'routine_booking') {
    const review = routineBookingReview({ ...definition, name: 'Booking', notifications: definition.notifications ?? { inApp: true, email: true } });
    return `${definition.assignmentMode==='qualified_if_unassigned'?`Book new unscheduled ${definition.service} jobs; choose one qualified worker if unassigned. Earliest available slot wins; preferred order breaks ties.`:review.summary} Allow ${review.duration}, ${review.days}, ${review.hours}, with ${review.gap.toLowerCase()} between visits. Book within ${review.horizon}; notify ${definition.recipientName} if no time fits.`;
  }
  if(definition.kind==='lead_routing'&&definition.routing){const names=definition.routing.members.slice(0,3).map(member=>member.name).join(', '),extra=definition.routing.members.length>3?` and ${definition.routing.members.length-3} others`:'';return `Assign new unassigned leads from ${definition.sourceName} to ${names}${extra}${definition.routing.strategy==='round_robin'?', taking turns':definition.routing.strategy==='fewest_open_leads'?', choosing the fewest open leads':''}${definition.routing.matchWorkZipCodes?', matching member work ZIP codes':''}.`;}
  if (definition.kind === "lead_routing") return `Assign new unassigned leads from ${definition.sourceName} to ${definition.recipientName}.`;
  const [hour, minute] = workflowLocalTime(definition).split(":").map(Number);
  const time = `${hour % 12 || 12}${minute ? `:${String(minute).padStart(2, "0")}` : ""} ${hour < 12 ? "AM" : "PM"}`;
  if (definition.kind === "visit_materials") return `Notify ${definition.recipientName} at ${time} the day before a visit if a work order has materials marked Needed or Ordered.`;
  if (definition.kind === "unassigned_visit") return `Notify ${definition.recipientName} at ${time} the day before a visit if nobody is assigned.`;
  if (definition.kind === "weekly_briefing") return `Send ${definition.recipientName} a Monday briefing at ${time} with inactive leads, estimates awaiting a decision, unscheduled jobs and jobs due soon.`;
  const condition = definition.kind === "unassigned_lead" ? "a new lead is still unassigned" : definition.kind === "estimate_follow_up" ? "a sent estimate still has no recorded decision" : "an approved estimate still has no visit";
  return `Notify ${definition.recipientName} at ${time} after ${definition.businessDays} business ${definition.businessDays === 1 ? "day" : "days"} if ${condition}.`;
}
