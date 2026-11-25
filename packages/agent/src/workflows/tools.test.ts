import { workflowRecipeSchema } from "@salesmora/contracts";
import { expect, it } from "vitest";
import { workflowPrepareTool } from "./tools";
import { instructionsFor } from "../planner-instructions";

it("advertises exactly the executable recipes with a strict recipe selector", () => {
  const tool = workflowPrepareTool.modelDefinition.function;
  expect(tool.parameters.properties.kind.enum).toEqual([...workflowRecipeSchema.options, null]);
  expect(tool.parameters.required).toContain("kind");
  expect(tool.parameters.additionalProperties).toBe(false);
  expect(tool.parameters.properties.notifications.additionalProperties).toBe(false);
});
it("keeps workflow planner instructions aligned with every advertised recipe", () => {
  const instructions = instructionsFor(["workflows_prepare", "search_help"]);
  for (const recipe of workflowPrepareTool.modelDefinition.function.parameters.properties.kind.enum.filter(value => value !== null)) {
    expect(instructions).toContain(recipe);
  }
  expect(instructions).toContain('a decision has not been recorded uses estimate_follow_up');
  expect(instructions).not.toContain('Prepare only the supported unscheduled-estimate reminder');
  expect(instructionsFor(["leads_query"])).not.toContain('WORKFLOWS:');
});
it("explains reply limitations, successful-send timing and explicit publication", () => {
  const description = workflowPrepareTool.modelDefinition.function.description;
  for (const text of ["first successful estimate email", "default 2 business days", "Customer replies are NOT tracked", "ask whether to use recorded decisions before drafting", "Only the Publish workflow button"]) {
    expect(description).toContain(text);
  }
});

it("describes day-before visit timing and shared-assignment limits", () => {
  const description = workflowPrepareTool.modelDefinition.function.description;
  for (const text of ["previous calendar day", "including weekends", "Supporting teams/crews count", "Use businessDays null", "Does not assign people"]) expect(description).toContain(text);
});
it("describes source routing separately from timed reminders and preserves existing owners", () => {
  const tool = workflowPrepareTool.modelDefinition.function;
  expect(tool.parameters.required).toContain("source");
  expect(tool.parameters.properties.source.type).toEqual(["string", "null"]);
  for (const text of ["lead_routing", "Preserves every source/default/manual owner", "businessDays and localTime to null", "may both be off for routing", "No schedule or Run now"]) expect(tool.description).toContain(text);
  expect(instructionsFor(["workflows_prepare"])).toContain("Do not substitute unassigned_lead reminders for an assignment request");
});

it('lets incomplete provider requests reach business clarification without changing wire values', () => {
  const call = { operation: 'create', kind: 'lead_routing', name: null, workflowRef: null, source: 'Fictional Demo Form', recipient: null,
    businessDays: null, notifications: null, routing: { strategy: 'round_robin', members: ['Jordan Example', 'Taylor Example'], matchWorkZipCodes: true } };
  expect(workflowPrepareTool.inputSchema.parse(call)).toEqual(call);
  expect(workflowPrepareTool.inputSchema.safeParse({ ...call, kind: 'invented_recipe' }).success).toBe(false);
  expect(workflowPrepareTool.inputSchema.safeParse({ ...call, publish: true }).success).toBe(false);
  expect(workflowPrepareTool.modelDefinition.function.description).toContain('preserve their previously stated team');
});

it('prepares customer visit reviews without another permission request or staff-recipient question',()=>{
 const instructions=instructionsFor(['workflows_prepare','search_help'],['customer_visit_reminder']);
 expect(instructions).toContain('call workflows_prepare now to create the review card');
 expect(instructions).toContain('Do not merely say I can prepare');
 const tool=workflowPrepareTool.modelDefinition.function;
 expect(tool.description).toContain('without asking for a staff recipient');
 expect(tool.description).not.toContain('Draft one staff reminder or weekly_briefing.');
 expect(tool.parameters.properties.notifications.description).toContain('null selects customer Email only');
});

it('supports thank-you setup without internal review features or silent wording selection',()=>{
 const instructions=instructionsFor(['workflows_prepare','search_help'],['post_job_thank_you']);
 for(const text of ['Prepare the review now','messageChoice null','optional exact user-supplied HTTPS external review link','no runtime AI'])expect(instructions).toContain(text);
 expect(workflowPrepareTool.modelDefinition.function.parameters.required).toContain('postJobRules');
 expect(instructionsFor(['leads_query'])).not.toContain('post_job_thank_you');
});
it('describes schedule changes as an event rule with no daily time or custom email copy',()=>{
 const instructions=instructionsFor(['workflows_prepare','search_help'],['customer_schedule_change']);
 for(const text of ['five-minute quiet period','Initial bookings','localTime and businessDays null','Prepare the review now','No historical backfill'])expect(instructions).toContain(text);
 expect(instructionsFor(['leads_query'])).not.toContain('customer_schedule_change');
});
