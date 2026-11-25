import {it,expect,vi} from 'vitest';
import {createServiceEmailModel,chatModelId} from './openai-model';
import {AIBudgetExceededError} from '@salesmora/contracts';
const signal=()=>new AbortController().signal;
it('reserves one bounded service-level draft and accounts for the structured response',async()=>{
 const text={subject:'Your next {Service}',body:'Hi {First name}, call {Company phone} or email {Company email} to arrange a visit.'};
 const request=vi.fn<typeof fetch>().mockResolvedValueOnce(Response.json({object:'response.input_tokens',input_tokens:20})).mockResolvedValueOnce(Response.json({id:'resp_fixture',object:'response',created_at:1,model:chatModelId,status:'completed',output:[{type:'function_call',id:'fc_fixture',call_id:'call_fixture',name:'prepare_service_email',arguments:JSON.stringify(text),status:'completed'}],usage:{input_tokens:20,output_tokens:10,total_tokens:30}}));
 const finish=vi.fn(async()=>{}),start=vi.fn(async()=>finish);
 await expect(createServiceEmailModel('fictional',{requiresReservation:true,start},request)(JSON.stringify({service:'Maintenance',request:'Keep it short',current:text}),signal())).resolves.toEqual(text);
 expect(start).toHaveBeenCalledTimes(1);expect(request).toHaveBeenCalledTimes(2);expect(finish).toHaveBeenCalledWith(expect.objectContaining({outcome:'completed',tokens:expect.objectContaining({totalTokens:30})}));
 const payload=JSON.parse(String(request.mock.calls[1][1]?.body));expect(payload).toMatchObject({store:false,max_output_tokens:1024,parallel_tool_calls:false});expect(payload.tools).toHaveLength(1);expect(JSON.stringify(payload.input)).toContain('Never ask them to reply');
});
it('does not contact the provider when budget reservation is denied',async()=>{
 const request=vi.fn<typeof fetch>().mockResolvedValueOnce(Response.json({object:'response.input_tokens',input_tokens:20})),start=vi.fn(async()=>{throw new AIBudgetExceededError();});
 await expect(createServiceEmailModel('fictional',{requiresReservation:true,start},request)('Short reminder',signal())).rejects.toBeInstanceOf(AIBudgetExceededError);expect(request).toHaveBeenCalledTimes(1);
});
