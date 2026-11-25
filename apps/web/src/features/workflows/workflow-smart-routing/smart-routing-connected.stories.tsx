import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { WorkflowDraft } from '@salesmora/contracts';
import { ConnectedWorkflowDraft } from '../connected-workflow-draft';
const workspaceId='00000000-0000-4000-8000-000000000001',sourceId='00000000-0000-4000-8000-000000000002',id='00000000-0000-4000-8000-000000000003';
const policy={strategy:'round_robin' as const,matchWorkZipCodes:true,members:[{id:'alex',name:'Alex Parker'},{id:'morgan',name:'Morgan Ellis'}]};
const ticket:WorkflowDraft={id,workspaceId,inputHash:'a'.repeat(64),expiresAt:new Date(Date.now()+900000).toISOString(),name:'Share website leads',rule:'Take turns assigning new unassigned website leads.',state:'pending',definition:{kind:'lead_routing',sourceId,sourceName:'Website quote form',routing:policy,timezone:'America/New_York',notifications:{inApp:true,email:true}}};
const options={sources:[{id:sourceId,name:'Website quote form',collectsPostalCode:true}],members:policy.members.map(member=>({...member,workZipCodes:['10001']}))},reads=fn(),writes=fn();
const meta={title:'Workflows/Connected smart routing',component:ConnectedWorkflowDraft,args:{ticket,disabled:false},parameters:{layout:'fullscreen'},decorators:[Story=><main className="min-h-screen bg-assistant-panel p-4 text-assistant-foreground"><div className="mx-auto max-w-2xl"><Story/></div></main>],beforeEach:()=>{
  reads.mockClear();writes.mockClear();const original=globalThis.fetch;
  globalThis.fetch=async(input,init)=>{const path=String(input);
    if(path.startsWith('/api/workflows/routing-options')){reads(path);return Response.json(options);}
    if(path.startsWith('/api/workflows/edit?')){reads(path);return Response.json({workflow:{id,workspaceId,name:ticket.name,version:1,status:'paused',definition:ticket.definition},recipients:policy.members,sources:options.sources.map(({id,name})=>({id,name})),routingOptions:options});}
    if(path==='/api/chat/workflows/proposals'){const body=JSON.parse(String(init?.body));writes(body);return Response.json({draft:{...ticket,state:body.decision==='confirm'?'confirmed':'cancelled',...(body.editValues?{editing:{id,version:2,status:'paused'}}:{})}});}
    return original(input,init);
  };return()=>{globalThis.fetch=original;};
}} satisfies Meta<typeof ConnectedWorkflowDraft>;
export default meta;type Story=StoryObj<typeof meta>;
export const Publish:Story={play:async({canvasElement})=>{
  const c=within(canvasElement);await expect(await c.findByRole('button',{name:'Publish workflow'})).toBeEnabled();
  await userEvent.click(c.getByRole('button',{name:'Change settings'}));await userEvent.selectOptions(c.getByLabelText('Assign using'),'fewest_open_leads');
  await expect(writes).not.toHaveBeenCalled();await expect(reads).toHaveBeenCalledTimes(1);await userEvent.click(c.getByRole('button',{name:'Publish workflow'}));
  await expect(await c.findByText('Workflow published.')).toBeVisible();await expect(writes).toHaveBeenCalledTimes(1);
  await expect(writes).toHaveBeenCalledWith(expect.objectContaining({routingValues:{name:ticket.name,sourceId,strategy:'fewest_open_leads',memberIds:['alex','morgan'],matchWorkZipCodes:true,notifications:{inApp:true,email:true}}}));
}};
export const Edit:Story={args:{ticket:{...ticket,editing:{id,version:1,status:'paused'}}},play:async({canvasElement})=>{
  const c=within(canvasElement);await expect(await c.findByRole('button',{name:'Save changes'})).toBeDisabled();await expect(c.getByText('This workflow will stay paused after saving.')).toBeVisible();
  await userEvent.click(c.getByRole('button',{name:'Change settings'}));await userEvent.selectOptions(c.getByLabelText('Assign using'),'fewest_open_leads');await userEvent.click(c.getByRole('button',{name:'Save changes'}));
  await expect(await c.findByText('Changes saved.')).toBeVisible();await expect(writes).toHaveBeenCalledWith(expect.objectContaining({editValues:expect.objectContaining({recipientId:'',routing:{strategy:'fewest_open_leads',memberIds:['alex','morgan'],matchWorkZipCodes:true}})}));
}};
export const SavedHistory:Story={args:{ticket:{...ticket,state:'confirmed'}},play:async({canvasElement})=>{await expect(within(canvasElement).getByText('Workflow published.')).toBeVisible();await expect(reads).not.toHaveBeenCalled();}};
