import { describe,expect,it } from 'vitest';
import { calendarProposeSchema,calendarProposalDecisionSchema,calendarProposalViewSchema,calendarProposalStoredSchema,calendarProposalDraftSchema } from './calendar-proposal';
const id='00000000-0000-4000-8000-000000000001',hash='a'.repeat(64);
const binding={proposalId:id,inputHash:hash,visitId:id,revision:hash};
describe('Calendar proposal boundaries',()=>{
 it('accepts exact references and workspace-local schedule only; no grants, SQL, implicit clearing or assignments',()=>{
  const input={operation:'schedule',recordRef:'J-0001',scheduledDate:'2026-11-02',arrivalWindow:'12:00-14:00'};
  expect(calendarProposeSchema.safeParse(input).success).toBe(true);
  expect(calendarProposeSchema.safeParse({...input,windowMode:'set',arrivalWindow:null}).success).toBe(false);
  expect(calendarProposeSchema.safeParse({...input,windowMode:'keep',arrivalWindow:null}).success).toBe(true);
  expect(calendarProposeSchema.safeParse({...input,windowMode:'unset',arrivalWindow:null}).success).toBe(true);
  for(const patch of [{recordRef:id},{recordRef:null}])expect(calendarProposeSchema.safeParse({...input,...patch}).success).toBe(true);
  for(const patch of [{scheduledDate:null},{scheduledDate:'2026-02-30'},{operation:'clear'},{recordRef:'first job'},{assigneeId:id},{role:'owner'},{sql:'update jobs'},{workspaceId:id}])expect(calendarProposeSchema.safeParse({...input,...patch}).success).toBe(false);
 });
 it('requires explicit clear intent and empty date/window; window-only removal stays a schedule',()=>{
  const input={operation:'clear',recordRef:'WO-0001',scheduledDate:null,arrivalWindow:null,windowMode:'unset'};
  expect(calendarProposeSchema.safeParse(input).success).toBe(true);
  for(const patch of [{operation:'schedule'},{scheduledDate:'2026-11-02'},{arrivalWindow:'09:00-11:00'},{windowMode:'keep'},{windowMode:'set'},{windowMode:undefined},{records:[]},{intent:'clear'}])expect(calendarProposeSchema.safeParse({...input,...patch}).success).toBe(false);
 });
 it('accepts metadata-only decisions and rejects model/browser schedule execution fields',()=>{
  const decision={workspaceId:id,...binding,decision:'confirm'};expect(calendarProposalDecisionSchema.safeParse(decision).success).toBe(true);
  for(const patch of [{decision:'yes'},{schedule:{scheduledDate:'2026-11-02'}},{records:[]},{authorization:'owner'},{inputHash:'forged'}])expect(calendarProposalDecisionSchema.safeParse({...decision,...patch}).success).toBe(false);
 });
 it('requires a complete bound active review and an exact confirmed receipt',()=>{
  const records=[{type:'job',id,number:'J-0001',title:'Fixture Job',status:'scheduled',expectedVersion:2}];
  const draft={id,inputHash:hash,visitId:id,revision:hash,createdAt:'2026-10-27T12:00:00.000Z',expiresAt:'2026-10-27T12:15:00.000Z',state:'pending',timezone:'America/New_York',from:{scheduledDate:'2026-10-20',arrivalWindow:null},to:{scheduledDate:'2026-11-02',arrivalWindow:null},records,crew:[],warnings:[]};
  const context={...binding,records:records.map(({type,id,expectedVersion})=>({type,id,expectedVersion})),read:true,canSchedule:true};
  expect(calendarProposalViewSchema.safeParse({draft,context}).success).toBe(true);
  expect(calendarProposalViewSchema.safeParse({draft,context:{...context,records:[]}}).success).toBe(false);
  expect(calendarProposalViewSchema.safeParse({draft:{...draft,records:[{...records[0],status:'completed'}]},context}).success).toBe(false);
  const clearDraft={...draft,intent:'clear',to:{scheduledDate:null,arrivalWindow:null}};
  expect(calendarProposalDraftSchema.safeParse(clearDraft).success).toBe(true);
  for(const patch of [{intent:undefined},{intent:'schedule'},{from:{scheduledDate:null,arrivalWindow:null}},{to:{scheduledDate:null,arrivalWindow:'09:00-11:00'}},{warnings:['irrelevant advisory']}])expect(calendarProposalDraftSchema.safeParse({...clearDraft,...patch}).success).toBe(false);
  const stored={draft,command:{workspaceId:id,visitId:id,submissionId:id,expectedVisitVersion:1,records:context.records,schedule:draft.to},stamp:hash,authority:hash,receipt:null,resultStamp:null};
  expect(calendarProposalStoredSchema.safeParse(stored).success).toBe(true);
  const clearStored={...stored,draft:clearDraft,command:{...stored.command,schedule:clearDraft.to}};
  expect(calendarProposalStoredSchema.safeParse(clearStored).success).toBe(true);
  expect(calendarProposalStoredSchema.safeParse({...clearStored,command:stored.command}).success).toBe(false);
  expect(calendarProposalStoredSchema.safeParse({...stored,command:clearStored.command}).success).toBe(false);
  expect(calendarProposalStoredSchema.safeParse({...stored,draft:{...draft,state:'confirmed'}}).success).toBe(false);
  const receipt={visitId:id,version:2,revision:hash,records:[{...context.records[0],expectedVersion:3}]};
  expect(calendarProposalStoredSchema.safeParse({...stored,draft:{...draft,state:'confirmed'},receipt,resultStamp:hash}).success).toBe(true);
  expect(calendarProposalStoredSchema.safeParse({...stored,draft:{...draft,state:'confirmed'},receipt:{...receipt,records:[{...receipt.records[0],expectedVersion:2}]},resultStamp:hash}).success).toBe(false);
 });
});
