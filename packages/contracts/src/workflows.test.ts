import { describe, expect, it } from "vitest";
import { workflowRunConfirmSchema, workflowRunPreviewSchema, workflowRunRequestSchema, workflowRunResultSchema, workflowPrepareSchema, workflowNotificationsCommandSchema, workflowDefinitionSchema, workflowLocalTimeSchema, workflowPublishDecisionSchema, workflowEditCommandSchema } from "./workflows";

const input = { workspaceId: "00000000-0000-4000-8000-000000000001", id: "00000000-0000-4000-8000-000000000002", version: 1 };
it("keeps unspecified assistant edit fields unchanged instead of applying creation defaults", () => {
  const edit = workflowPrepareSchema.parse({ operation: "edit", workflowRef: input.id, kind: null, name: null, businessDays: null,
    localTime: "08:15", recipient: null, notifications: null });
  expect(edit.operation).toBe("edit"); expect(edit.notifications).toBeNull(); expect(edit.recipient).toBeNull();
  expect(workflowPrepareSchema.safeParse({ operation: "edit", localTime: "08:15" }).success).toBe(false);
  expect(workflowPrepareSchema.safeParse({ operation: "create", workflowRef: input.id, name: "Reminder", businessDays: 1, recipient: "me" }).success).toBe(false);
});
it("binds direct edits to a version and retry identity without accepting trigger changes", () => {
  const command = { ...input, requestId: "00000000-0000-4000-8000-000000000003", values: { name: "Reminder", localTime: "08:15", businessDays: 2,
    recipientId: "teammate", notifications: { inApp: true, email: true } } };
  expect(workflowEditCommandSchema.safeParse(command).success).toBe(true);
  expect(workflowEditCommandSchema.safeParse({ ...command, values: { ...command.values, kind: "weekly_briefing" } }).success).toBe(false);
  expect(workflowEditCommandSchema.safeParse({ ...command, requestId: undefined }).success).toBe(false);
  expect(workflowEditCommandSchema.safeParse({ ...command, version: 0 }).success).toBe(false);
});
it("accepts only minute-precision local send times in setup and reviewed publication", () => {
  for (const localTime of ["00:00", "08:15", "17:00", "23:59"]) {
    expect(workflowLocalTimeSchema.safeParse(localTime).success).toBe(true);
    expect(workflowPrepareSchema.parse({ name: "Reminder", businessDays: 1, recipient: "me", localTime }).localTime).toBe(localTime);
    expect(workflowPublishDecisionSchema.safeParse({ workspaceId: input.workspaceId, id: input.id, inputHash: "a".repeat(64), decision: "confirm", localTime }).success).toBe(true);
  }
  for (const localTime of ["8am", "8:00", "24:00", "08:60", "08:00:00", "", null]) {
    expect(workflowLocalTimeSchema.safeParse(localTime).success).toBe(false);
  }
  expect(workflowPrepareSchema.parse({ name: "Reminder", businessDays: 1, recipient: "me", localTime: null }).localTime).toBeNull();
});
describe("manual workflow contracts", () => {
  it("requires a specific reviewed preview for execution", () => {
    expect(workflowRunRequestSchema.safeParse(input).success).toBe(true);
    expect(workflowRunConfirmSchema.safeParse(input).success).toBe(false);
    expect(workflowRunConfirmSchema.safeParse({ ...input, previewId: input.id }).success).toBe(true);
  });
  it("rejects caller-controlled record sets and invalid versions", () => {
    expect(workflowRunRequestSchema.safeParse({ ...input, estimateIds: [input.id] }).success).toBe(false);
    expect(workflowRunConfirmSchema.safeParse({ ...input, previewId: input.id, version: 0 }).success).toBe(false);
  });
  it("bounds previews and receipts to the execution batch", () => {
    expect(workflowRunPreviewSchema.safeParse({ id: input.id, matchedCount: 101, actionSummary: "Run" }).success).toBe(false);
    expect(workflowRunResultSchema.safeParse({ completedCount: -1, skippedCount: 0, pendingCount: 0 }).success).toBe(false);
  });
});
it("defaults new drafts to both notification channels while retaining legacy reviewed definitions", () => {
  expect(workflowPrepareSchema.parse({ name: "Reminder", businessDays: 2, recipient: "me" }).notifications).toEqual({ inApp: true, email: true });
  expect(workflowPrepareSchema.parse({ operation: "create", name: "Reminder", businessDays: 2, recipient: "me", notifications: null }).notifications).toEqual({ inApp: true, email: true });
  expect(workflowDefinitionSchema.parse({ kind: "unscheduled_estimate", businessDays: 2, recipientId: "me", recipientName: "Fixture", timezone: "America/New_York" }).notifications).toBeUndefined();
});
it("requires at least one notification channel", () => {
  expect(workflowNotificationsCommandSchema.safeParse({ ...input, notifications: { inApp: false, email: false } }).success).toBe(false);
  expect(workflowNotificationsCommandSchema.safeParse({ ...input, notifications: { inApp: false, email: true } }).success).toBe(true);
});
it("selects only supported recipes and keeps older draft calls compatible", () => {
  const input = { name: "Reminder", businessDays: 2, recipient: "me" };
  expect(workflowPrepareSchema.parse(input).kind).toBe("unscheduled_estimate");
  expect(workflowPrepareSchema.parse({ ...input, kind: "estimate_follow_up" }).kind).toBe("estimate_follow_up");
  expect(workflowPrepareSchema.parse({ ...input, kind: "unassigned_lead" }).kind).toBe("unassigned_lead");
  expect(workflowPrepareSchema.safeParse({ ...input, kind: "automatic_booking" }).success).toBe(false);
});
it("keeps briefings on Monday with a configurable time and no business-day delay", () => {
  const prepare = { kind: "weekly_briefing", name: "Monday briefing", businessDays: null, recipient: "me" };
  expect(workflowPrepareSchema.parse(prepare).notifications).toEqual({ inApp: true, email: true });
  expect(workflowPrepareSchema.safeParse({ ...prepare, businessDays: 2 }).success).toBe(false);
  const definition = { kind: "weekly_briefing", recipientId: "owner", recipientName: "Owner", timezone: "America/New_York", weekday: "monday", localTime: "09:00" };
  expect(workflowDefinitionSchema.safeParse(definition).success).toBe(true);
  expect(workflowDefinitionSchema.safeParse({ ...definition, localTime: "10:00" }).success).toBe(true);
  expect(workflowDefinitionSchema.safeParse({ ...definition, weekday: "friday" }).success).toBe(false);
  expect(workflowDefinitionSchema.safeParse({ ...definition, businessDays: 1 }).success).toBe(false);
});
it("keeps unassigned visits on the approved previous-calendar-day schedule", () => {
  const value = { kind: "unassigned_visit", name: "Visit reminder", businessDays: null, recipient: "me" };
  expect(workflowPrepareSchema.parse(value).notifications).toEqual({ inApp: true, email: true });
  expect(workflowPrepareSchema.safeParse({ ...value, businessDays: 1 }).success).toBe(false);
  const definition = { kind: "unassigned_visit", recipientId: "owner", recipientName: "Owner", timezone: "America/New_York", calendarDaysBefore: 1, localTime: "09:00" };
  expect(workflowDefinitionSchema.safeParse(definition).success).toBe(true);
  expect(workflowDefinitionSchema.safeParse({ ...definition, calendarDaysBefore: 2 }).success).toBe(false);
  expect(workflowDefinitionSchema.safeParse({ ...definition, localTime: "10:00" }).success).toBe(true);
});

it("prepares the material-status reminder with a chosen time and a fixed previous-day offset", () => {
  const prepare = { kind: "visit_materials", name: "Materials reminder", businessDays: null, localTime: "08:00", recipient: "me" };
  expect(workflowPrepareSchema.parse(prepare).notifications).toEqual({ inApp: true, email: true });
  expect(workflowPrepareSchema.safeParse({ ...prepare, businessDays: 1 }).success).toBe(false);
  const definition = { kind: "visit_materials", recipientId: "owner", recipientName: "Owner", timezone: "America/New_York", calendarDaysBefore: 1, localTime: "08:00" };
  expect(workflowDefinitionSchema.safeParse(definition).success).toBe(true);
  expect(workflowDefinitionSchema.safeParse({ ...definition, calendarDaysBefore: 2 }).success).toBe(false);
  expect(workflowDefinitionSchema.safeParse({ ...definition, localTime: "25:00" }).success).toBe(false);
});

it("allows a single notification channel edit without guessing the other channel", () => {
  const edit = workflowPrepareSchema.parse({ operation: "edit", workflowRef: input.id, notifications: { inApp: null, email: true } });
  expect(edit.notifications).toEqual({ inApp: null, email: true });
  expect(workflowPrepareSchema.parse({ name: "Reminder", businessDays: 1, recipient: "me", notifications: { inApp: null, email: true } }).notifications).toEqual({ inApp: true, email: true });
});
it("routes only an identified source with no reminder time and allows silent assignment", () => {
  const input = { kind: "lead_routing", name: "Route website leads", source: "Website quote form", businessDays: null, localTime: null, recipient: "Jordan Lee" };
  expect(workflowPrepareSchema.parse(input).notifications).toEqual({ inApp: true, email: true });
  expect(workflowPrepareSchema.safeParse({ ...input, notifications: { inApp: false, email: false } }).success).toBe(true);
  for (const patch of [{ source: null }, { localTime: "09:00" }, { businessDays: 1 }]) expect(workflowPrepareSchema.safeParse({ ...input, ...patch }).success).toBe(false);
  const definition = { kind: "lead_routing", sourceId: "00000000-0000-4000-8000-000000000081", sourceName: "Website", recipientId: "jordan", recipientName: "Jordan Lee", timezone: "America/New_York", notifications: { inApp: false, email: false } };
  expect(workflowDefinitionSchema.safeParse(definition).success).toBe(true);
  expect(workflowDefinitionSchema.safeParse({ ...definition, localTime: "09:00" }).success).toBe(false);
  expect(workflowPrepareSchema.safeParse({ name: "Reminder", businessDays: 1, recipient: "me", notifications: { inApp: false, email: false } }).success).toBe(false);
});

it("requires explicit team routing instead of a placeholder recipient", () => {
  const routing = { strategy: "round_robin", members: ["Jordan Lee", "Alex Parker"], matchWorkZipCodes: true };
  const prepare = { kind: "lead_routing", name: "Share website leads", source: "Website", businessDays: null, recipient: null, routing };
  expect(workflowPrepareSchema.safeParse(prepare).success).toBe(true);
  expect(workflowPrepareSchema.safeParse({ ...prepare, recipient: "team" }).success).toBe(false);
  expect(workflowPrepareSchema.safeParse({ ...prepare, kind: "unassigned_lead", source: null }).success).toBe(false);
  const definition = { kind: "lead_routing", sourceId: input.id, sourceName: "Website", timezone: "America/New_York", notifications: { inApp: true, email: true },
    routing: { strategy: "round_robin", matchWorkZipCodes: true, members: [{ id: "jordan", name: "Jordan Lee" }, { id: "alex", name: "Alex Parker" }] } };
  expect(workflowDefinitionSchema.safeParse(definition).success).toBe(true);
  expect(workflowDefinitionSchema.safeParse({ ...definition, recipientId: "team", recipientName: "Team" }).success).toBe(false);
  expect(workflowDefinitionSchema.safeParse({ ...definition, routing: { ...definition.routing, members: [definition.routing.members[0], definition.routing.members[0]] } }).success).toBe(false);
  expect(workflowDefinitionSchema.safeParse({ ...definition, routing: { ...definition.routing, strategy: "one_teammate" } }).success).toBe(false);
});

it('requires an explicit valid annual date and keeps annual and completion-based rules separate', () => {
  const input = { kind: 'annual_service_review', name: 'Annual customer review', service: 'Gutter cleaning', annualReviewRules: { firstReviewDate: '2027-03-15' }, recipient: 'me', businessDays: null, localTime: '09:00' };
  expect(workflowPrepareSchema.safeParse(input).success).toBe(true);
  for (const patch of [{ annualReviewRules: null }, { annualReviewRules: { firstReviewDate: '2027-02-29' } }, { businessDays: 1 }, { serviceDueRules: { intervalMonths: 6, includeExisting: true } }]) expect(workflowPrepareSchema.safeParse({ ...input, ...patch }).success).toBe(false);
  expect(workflowPrepareSchema.safeParse({ ...input, annualReviewRules: { firstReviewDate: '2028-02-29' } }).success).toBe(true);
});

it('accepts customer visit reminders only as email-only fixed day-before definitions',()=>{
 const def={kind:'customer_visit_reminder',calendarDaysBefore:1,localTime:'09:00',timezone:'America/New_York',recipientId:'publisher',recipientName:'Publisher',notifications:{inApp:false,email:true}};
 expect(workflowDefinitionSchema.safeParse(def).success).toBe(true);
 expect(workflowDefinitionSchema.safeParse({...def,calendarDaysBefore:2}).success).toBe(false);
 expect(workflowDefinitionSchema.safeParse({...def,notifications:{inApp:true,email:true}}).success).toBe(false);
 expect(workflowDefinitionSchema.safeParse({...def,service:'Invented filter'}).success).toBe(false);
});


it('normalizes customer reminder channels idempotently across tool and data boundaries',()=>{
 const input={kind:'customer_visit_reminder',name:'Visit reminder',recipient:'me',businessDays:null,localTime:'09:00'};
 const first=workflowPrepareSchema.parse(input);expect(first.notifications).toEqual({inApp:false,email:true});
 expect(workflowPrepareSchema.parse(first)).toEqual(first);
 expect(workflowPrepareSchema.safeParse({...input,notifications:{inApp:true,email:false}}).success).toBe(false);
});

it('keeps assigned-lead defaults idempotent and validates dynamic versus fixed recipients',()=>{
 const input={kind:'assigned_lead_cold',name:'Cold lead reminder',recipient:null,businessDays:null,localTime:null};
 const first=workflowPrepareSchema.parse(input);expect(first.businessDays).toBe(3);expect(workflowPrepareSchema.parse(first)).toEqual(first);
 const definition={kind:'assigned_lead_cold',businessDays:3,localTime:'09:00',timezone:'America/New_York',recipientMode:'owner',notifications:{inApp:true,email:true}};
 expect(workflowDefinitionSchema.safeParse(definition).success).toBe(true);
 expect(workflowDefinitionSchema.safeParse({...definition,recipientMode:'teammate'}).success).toBe(false);
 expect(workflowDefinitionSchema.safeParse({...definition,recipientId:'guessed'}).success).toBe(false);
 expect(workflowDefinitionSchema.safeParse({...definition,recipientMode:'teammate',recipientId:'office',recipientName:'Office'}).success).toBe(true);
});


it('uses the reviewed cold-lead title when the planner omits a creation name',()=>{
 const input={operation:'create',kind:'assigned_lead_cold',name:null,recipient:'lead owner',businessDays:3,localTime:'09:00'};
 const parsed=workflowPrepareSchema.parse(input);expect(parsed.name).toBe('Assigned lead needs attention');expect(workflowPrepareSchema.parse(parsed)).toEqual(parsed);
 expect(workflowPrepareSchema.safeParse({...input,kind:'unassigned_lead',recipient:'me'}).success).toBe(false);
});
