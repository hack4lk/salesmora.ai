import 'server-only';
import {createHash} from 'node:crypto';
import {serviceDueCommandSchema,serviceEmailTextSchema,type ServiceEmailText} from '@salesmora/contracts';
import {createServiceEmailModel} from '@salesmora/agent';
import {authorize,validServiceEmail} from '@salesmora/domain';
import {withCurrentWorkspaceMutation,canSendServiceEmail,dueWorkflow,outreachFacts,createAIUsageRecorder,AuthorizationAccessError,WorkflowConflictError,WorkflowDraftError} from '@salesmora/data';
import {database} from '../workspaces/store';
import {enabledPermissions} from '../authorization/permissions';
import {workspaceChatAvailable} from '../chat/config';
export async function generateServiceEmail(identity:{workspaceId:string;userId:string},workflowId:string,requestId:string,raw:unknown,signal:AbortSignal){
 const input=serviceDueCommandSchema.parse(raw);if(input.action!=='generate')throw new WorkflowDraftError('Use a service email request.');
 const {facts,hash,prior}=await withCurrentWorkspaceMutation(database(),identity,enabledPermissions,async(trx,c)=>{
  if(!canSendServiceEmail(c)||!authorize(c,{permission:'assistant.use'}).allowed)throw new AuthorizationAccessError();
  const w=await dueWorkflow(trx,c,workflowId),facts=await outreachFacts(trx,c,w);if(w.status!=='active'||input.serviceId!==w.serviceId||input.templateVersion!==facts.template.version)throw new WorkflowConflictError();if(!facts.company.email||!facts.company.phone)throw new WorkflowDraftError('Save the company phone and email before drafting.');
  const hash=createHash('sha256').update(JSON.stringify({workflowId,input,company:facts.company})).digest('hex'),old=await trx('serviceDueOperations').where({workspaceId:identity.workspaceId,requestId}).forUpdate().first();
  if(old){if(old.actorId!==identity.userId||old.hash!==hash)throw new WorkflowConflictError();if(old.result.status==='completed')return {facts:{service:w.serviceName,annualReview:w.definition.kind==='annual_service_review',...facts},hash,prior:old.result.text as ServiceEmailText};if(old.result.status==='generating'&&Date.now()-old.result.startedAt<45000)throw new WorkflowDraftError('This draft is still being prepared. Try again shortly.');await trx('serviceDueOperations').where({workspaceId:identity.workspaceId,requestId}).update({result:JSON.stringify({status:'generating',startedAt:Date.now()})});}
  else await trx('serviceDueOperations').insert({workspaceId:identity.workspaceId,requestId,actorId:identity.userId,hash,result:JSON.stringify({status:'generating',startedAt:Date.now()})});return {facts:{service:w.serviceName,annualReview:w.definition.kind==='annual_service_review',...facts},hash,prior:undefined};
 });if(prior)return prior;
 try{if(!await workspaceChatAvailable(identity.workspaceId))throw new WorkflowDraftError('Assistant drafting is unavailable. You can edit the message directly.');const model=createServiceEmailModel(process.env.OPENAI_API_KEY??'',createAIUsageRecorder(database(),identity));const result=serviceEmailTextSchema.parse(await model(JSON.stringify({annualReview:facts.annualReview,service:facts.service,company:facts.company,current:input.current,request:input.request}),signal));if(!validServiceEmail(result)||facts.annualReview&&/\{Due date\}/.test(result.subject+result.body)||/\breply\s+to\s+(this|the)\s+(email|message)/i.test(result.body))throw new WorkflowDraftError('The email draft needs another review. Try rephrasing the request.');await database()('serviceDueOperations').where({workspaceId:identity.workspaceId,requestId,actorId:identity.userId,hash}).update({result:JSON.stringify({status:'completed',text:result})});return result;
 }catch(error){await database()('serviceDueOperations').where({workspaceId:identity.workspaceId,requestId,actorId:identity.userId,hash}).update({result:JSON.stringify({status:'failed'})});throw error;}
}
