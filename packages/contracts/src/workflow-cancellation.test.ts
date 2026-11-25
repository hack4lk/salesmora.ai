import {expect,it} from 'vitest';
import {workflowPrepareSchema,workflowDefinitionSchema,workflowPublishDecisionSchema} from './workflows';
import {cancellationBookingSchema} from './workflow-cancellation';
const request={kind:'cancellation_fill',name:'Fill roofing openings',service:'Roofing',cancellationRules:{durationMinutes:60,gapMinutes:30},businessDays:null,recipient:'me',localTime:null};
it('prepares cancellation suggestions with only explicit duration/gap and both channels by default',()=>{expect(workflowPrepareSchema.parse(request)).toMatchObject({kind:'cancellation_fill',notifications:{inApp:true,email:true}});});
it('rejects missing rules, send times, conflicting booking policy and invalid durations',()=>{
 for(const patch of [{cancellationRules:null},{localTime:'09:00'},{assignmentMode:'qualified_if_unassigned'},{cancellationRules:{durationMinutes:0,gapMinutes:30}},{cancellationRules:{durationMinutes:60,gapMinutes:121}},{businessDays:2}])expect(workflowPrepareSchema.safeParse({...request,...patch}).success).toBe(false);
 expect(workflowPrepareSchema.safeParse({...request,kind:'routine_booking'}).success).toBe(false);
});
it('definitions and publication values keep cancellation settings typed',()=>{
 expect(workflowDefinitionSchema.parse({kind:'cancellation_fill',service:'Roofing',rules:request.cancellationRules,recipientId:'person',recipientName:'Morgan Ellis',timezone:'America/New_York',notifications:{inApp:true,email:true}}).kind).toBe('cancellation_fill');
 expect(workflowPublishDecisionSchema.parse({workspaceId:'9a84062c-2149-4ecb-8e22-c67603ac2b84',id:'7394b8ed-cbdc-41bf-9b49-4042187d3c89',inputHash:'a'.repeat(64),decision:'confirm',cancellationValues:{name:request.name,service:request.service,rules:request.cancellationRules,recipientId:'person',notifications:{inApp:true,email:true}}}).cancellationValues?.rules).toEqual(request.cancellationRules);
});
it('booking confirmation binds the opening, job, exact people and time and rejects extra keys',()=>{
 const valid={workspaceId:'9a84062c-2149-4ecb-8e22-c67603ac2b84',requestId:'7394b8ed-cbdc-41bf-9b49-4042187d3c89',openingId:'64ec1571-c7a0-49b8-bd86-67ceba85349a',openingRevision:'1:2',jobId:'7394b8ed-cbdc-41bf-9b49-4042187d3c89',jobVersion:2,date:'2026-11-24',timezone:'America/New_York',workTime:{startTime:'10:00',durationMinutes:60},personIds:['alex']};
 expect(cancellationBookingSchema.safeParse(valid).success).toBe(true);expect(cancellationBookingSchema.safeParse({...valid,personIds:[]}).success).toBe(false);expect(cancellationBookingSchema.safeParse({...valid,automatic:true}).success).toBe(false);
});
