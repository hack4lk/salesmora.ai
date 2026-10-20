import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {expect,fn,userEvent,within} from 'storybook/test';
import {HomeOverview} from './home-overview';
import {homeOverviewData as copy} from './home-overview.data';
const meta={
  title:'Workspace/HomeOverview',component:HomeOverview,parameters:{layout:'fullscreen'},
  args:{userName:copy.stories.name,workspaceName:copy.stories.workspace,role:'owner',canCreateLead:true,canCreateCampaign:true,entry:'created',activity:{hasLeads:false,hasCampaigns:false,hasActivity:false},onCreateLead:fn(),onCreateCampaign:fn()},
  decorators:[Story=><main className="mx-auto min-h-screen max-w-5xl p-6 sm:p-10"><h1 className="m-0 text-sm font-semibold text-muted">{copy.stories.title}</h1><p className="mb-8 mt-2 text-sm leading-6 text-muted">{copy.stories.notice}</p><Story /></main>],
} satisfies Meta<typeof HomeOverview>;
export default meta;
type Story=StoryObj<typeof meta>;
export const Owner:Story={play:async({canvasElement,args})=>{
  const c=within(canvasElement);
  await expect(c.getByRole('heading',{name:copy.greeting(args.userName)})).toBeVisible();
  await expect(c.getByText(args.workspaceName,{exact:true})).toBeVisible();
  await expect(c.getByText(copy.created.label,{exact:true})).toBeVisible();
  await userEvent.click(c.getByRole('button',{name:copy.leads.action}));
  await expect(args.onCreateLead).toHaveBeenCalledTimes(1);
}};
export const Admin:Story={args:{role:'admin',entry:'joined'},play:async({canvasElement,args})=>{
  const c=within(canvasElement);
  await userEvent.click(c.getByRole('button',{name:copy.campaigns.action}));
  await expect(args.onCreateCampaign).toHaveBeenCalledTimes(1);
}};
export const Field:Story={args:{userName:copy.stories.memberName,role:'field',entry:'joined',canCreateLead:false,canCreateCampaign:false},play:async({canvasElement})=>{
  const c=within(canvasElement);
  await expect(c.queryByRole('heading',{name:copy.campaigns.title})).not.toBeInTheDocument();
  await expect(c.queryByRole('button',{name:copy.leads.action})).not.toBeInTheDocument();
  await expect(c.getByRole('heading',{name:copy.assigned.title})).toBeVisible();
}};
export const Office:Story={args:{role:'office',entry:'joined'}};
export const Keyboard:Story={play:async({canvasElement,args})=>{
  const c=within(canvasElement);c.getByRole('button',{name:copy.leads.action}).focus();
  await userEvent.keyboard('{Enter}');await expect(args.onCreateLead).toHaveBeenCalledTimes(1);
}};
export const MissingName:Story={args:{userName:'   '},play:async({canvasElement})=>{
  await expect(within(canvasElement).getByRole('heading',{name:copy.greeting('')})).toBeVisible();
}};
export const Mobile:Story={globals:{viewport:{value:'phone',isRotated:false}}};
export const LongContent:Story={args:{userName:copy.stories.longName,workspaceName:copy.stories.longWorkspace}};
export const LongContentMobile:Story={...LongContent,globals:Mobile.globals};

export const CreationUnavailable:Story={args:{onCreateLead:undefined,onCreateCampaign:undefined},play:async({canvasElement})=>{
  const c=within(canvasElement);
  for(const label of [copy.leads.action,copy.campaigns.action])await expect(c.getByRole('button',{name:`${label} ${copy.unavailable}`})).toBeDisabled();
}};
const contentPresent:Story['play']=async({canvasElement})=>{
  const c=within(canvasElement);
  await expect(c.queryByRole('heading',{name:copy.created.title})).not.toBeInTheDocument();
  await expect(c.queryByRole('button',{name:copy.leads.action})).not.toBeInTheDocument();
  await expect(c.getByRole('heading',{name:copy.greeting(copy.stories.name)})).toBeVisible();
};
export const HasLeads:Story={args:{activity:{hasLeads:true,hasCampaigns:false,hasActivity:false}},play:contentPresent};
export const HasCampaigns:Story={args:{activity:{hasLeads:false,hasCampaigns:true,hasActivity:false}},play:contentPresent};
export const HasActivity:Story={args:{activity:{hasLeads:false,hasCampaigns:false,hasActivity:true}},play:contentPresent};

export const LinkedCreation:Story={args:{createLeadHref:copy.stories.leadHref,onCreateLead:undefined},play:async({canvasElement})=>{
  await expect(within(canvasElement).getByRole('link',{name:copy.leads.action})).toHaveAttribute('href',copy.stories.leadHref);
}};
export const HasLeadsWithCreation:Story={args:{createLeadHref:copy.stories.leadHref,onCreateLead:undefined,activity:{hasLeads:true,hasCampaigns:false,hasActivity:false}},play:async({canvasElement})=>{
  const c=within(canvasElement);
  await expect(c.queryByRole('heading',{name:copy.created.title})).not.toBeInTheDocument();
  await expect(c.getByRole('link',{name:copy.leads.action})).toHaveAttribute('href',copy.stories.leadHref);
}};
