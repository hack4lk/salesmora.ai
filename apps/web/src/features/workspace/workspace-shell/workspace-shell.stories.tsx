import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { WorkspaceShell } from './workspace-shell';
import { workspaceShellData as copy } from './workspace-shell.data';
import { workspaceNavigationData as nav } from '../../../../../../packages/ui/src/layout/workspace-navigation/workspace-navigation.data';
const meta = {
  title:'Workspace/WorkspaceShell',component:WorkspaceShell,parameters:{layout:'fullscreen'},globals:{viewport:{value:'desktop',isRotated:false}},
  args:{authorizedPages:['home','leads'],assistantAvailable:true,workspaceId:'fictional-workspace',workspaceName:copy.stories.workspace,user:{name:copy.stories.name,email:copy.stories.email,role:'owner'},title:copy.stories.title,description:copy.stories.description,onSignOut:fn(async()=>{}),children:<section className="rounded-xl border border-line bg-paper p-6 text-ink">{copy.stories.content}</section>},
} satisfies Meta<typeof WorkspaceShell>;
export default meta;
type Story = StoryObj<typeof meta>;
async function openAccount(canvasElement:HTMLElement) {
  const c=within(canvasElement); const toggle=c.queryByRole('button',{name:nav.open});
  if(toggle)await userEvent.click(toggle);
  await userEvent.click(c.getByRole('button',{name:new RegExp(nav.account)}));
  return c;
}
export const Owner: Story = {play:async({canvasElement,args})=>{
  const c=await openAccount(canvasElement);
  await expect(c.getByRole('main')).toContainElement(c.getByRole('heading',{level:1}));
  await expect(c.getByRole('link',{name:nav.items[0].label})).toHaveAttribute('href','/home?workspace=fictional-workspace');
  await expect(c.getByRole('link',{name:'Leads'})).toHaveAttribute('href','/leads?workspace=fictional-workspace');
  for(const item of nav.items.filter(item=>!['home','leads'].includes(item.id)))await expect(c.queryByRole('button',{name:`${item.label} ${nav.unavailable}`})).not.toBeInTheDocument();
  await expect(c.getByRole('button',{name:nav.accountSettings})).toBeEnabled();
  await userEvent.click(c.getByRole('button',{name:nav.signOut}));
  await expect(args.onSignOut).toHaveBeenCalledTimes(1);
}};
export const Admin: Story = {args:{user:{...meta.args.user,role:'admin'}}};
export const FullWidth: Story = {args:{contentWidth:'full'}};
export const Field: Story = {args:{user:{...meta.args.user,role:'field'}},play:async({canvasElement})=>{
  const c=within(canvasElement); const toggle=c.queryByRole('button',{name:nav.open}); if(toggle)await userEvent.click(toggle);
  await expect(c.getByRole('link',{name:'Settings'})).toHaveAttribute('href','/settings?workspace=fictional-workspace');
  for(const item of nav.items.filter(item=>['reports','campaigns'].includes(item.id)))await expect(c.queryByRole('button',{name:`${item.label} ${nav.unavailable}`})).not.toBeInTheDocument();
}};
export const Mobile: Story = {globals:{viewport:{value:'phone',isRotated:false}}};
export const SignOutPending: Story = {args:{onSignOut:fn(()=>new Promise<void>(()=>{}))},play:async({canvasElement,args})=>{
  const c=await openAccount(canvasElement);
  await userEvent.click(c.getByRole('button',{name:nav.signOut}));
  await expect(c.getByRole('button',{name:nav.signingOut})).toBeDisabled();
  await expect(args.onSignOut).toHaveBeenCalledTimes(1);
}};
export const SignOutError: Story = {args:{onSignOut:fn(async()=>{throw Error('Preview failure');})},play:async({canvasElement})=>{
  const c=await openAccount(canvasElement);await userEvent.click(c.getByRole('button',{name:nav.signOut}));
  await expect(c.getByRole('alert')).toHaveAccessibleDescription(copy.signOutError);
  await expect(c.getByRole('button',{name:nav.signOut})).toBeEnabled();
}};
