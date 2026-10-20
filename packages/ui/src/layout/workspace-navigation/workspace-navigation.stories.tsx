import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { WorkspaceNavigation } from './workspace-navigation';
import { workspaceNavigationData as copy } from './workspace-navigation.data';

const meta = {
  title: 'Workspace/WorkspaceNavigation', component: WorkspaceNavigation,
  args: {authorizedPages:copy.items.map(item=>item.id),workspaceName:copy.stories.workspaceName,user:{name:copy.stories.name,email:copy.stories.email,role:'owner'},currentPage:'home',contentId:'workspace-preview-content',onNavigate:fn(),onAccountSettings:fn(),onSignOut:fn()},
  parameters: {layout:'fullscreen'}, globals:{viewport:{value:'desktop',isRotated:false}},
  decorators:[Story => <div className="min-h-screen md:flex"><Story /><main id="workspace-preview-content" tabIndex={-1} className="min-w-0 flex-1 p-6 focus-visible:focus-ring sm:p-10"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.heading}</h1><p className="mt-4 max-w-reading text-sm leading-6 text-muted">{copy.stories.notice}</p><p className="mt-6 max-w-reading rounded-xl border border-line bg-paper p-6 leading-relaxed text-ink">{copy.stories.content}</p></main></div>],
} satisfies Meta<typeof WorkspaceNavigation>;
export default meta;
type Story = StoryObj<typeof meta>;
async function openNavigationIfMobile(canvasElement: HTMLElement) {
  const c=within(canvasElement); const button=c.getByRole('button',{name:copy.open,hidden:true});
  if (getComputedStyle(button).display !== 'none') await userEvent.click(button);
  return c;
}
export const Owner: Story = {args: { permissionsHref: '/settings/permissions?workspace=fictional-workspace' }, play:async({canvasElement,args})=>{
  const c=await openNavigationIfMobile(canvasElement);
  await expect(c.getByRole('img',{name:copy.brandName})).toHaveAttribute('src',copy.logoSrc);
  await expect(c.getByRole('link',{name:copy.items.find(item=>item.id==='home')!.label})).toHaveAttribute('aria-current','page');
  await expect(c.getByRole('navigation',{name:copy.management})).toBeVisible();
  await userEvent.click(c.getByRole('link',{name:copy.items.find(item=>item.id==='jobs')!.label}));
  await expect(args.onNavigate).toHaveBeenCalledWith('jobs');
}};
export const Admin: Story = {args:{user:{name:copy.stories.name,email:copy.stories.email,role:'admin'},currentPage:'settings'},play:async({canvasElement})=>{
  const c=await openNavigationIfMobile(canvasElement);
  await expect(c.getByRole('link',{name:copy.items.find(item=>item.id==='settings')!.label})).toHaveAttribute('aria-current','page');
}};
export const Field: Story = {args:{authorizedPages:['home','leads','customers','jobs','calendar','estimates'],user:{name:copy.stories.memberName,email:copy.stories.memberEmail,role:'field'},currentPage:'jobs'},play:async({canvasElement})=>{
  const c=await openNavigationIfMobile(canvasElement);
  for (const id of ['calendar','estimates'] as const) {
    const item=copy.items.find(item=>item.id===id)!;
    await expect(c.getByRole('link',{name:item.label})).toHaveAttribute('href',item.href);
  }
  await expect(c.queryByRole('navigation',{name:copy.management})).not.toBeInTheDocument();
  for(const item of copy.items.filter(item=>item.management)) await expect(c.queryByRole('link',{name:item.label})).not.toBeInTheDocument();
}};
export const AccountOptions: Story = {play:async({canvasElement,args})=>{
  const c=await openNavigationIfMobile(canvasElement);
  await userEvent.click(c.getByRole('button',{name:new RegExp(copy.account)}));
  await expect(c.getByRole('button',{name:copy.accountSettings})).toBeVisible();
  await userEvent.click(c.getByRole('button',{name:copy.accountSettings}));
  await expect(args.onAccountSettings).toHaveBeenCalledTimes(1);
  await userEvent.click(c.getByRole('button',{name:new RegExp(copy.account)}));
  await userEvent.click(c.getByRole('button',{name:copy.signOut}));
  await expect(args.onSignOut).toHaveBeenCalledTimes(1);
}};
export const Keyboard: Story = {play:async({canvasElement})=>{
  const c=await openNavigationIfMobile(canvasElement); const account=c.getByRole('button',{name:new RegExp(copy.account)});
  account.focus(); await userEvent.keyboard('{Enter}');
  await expect(account).toHaveAttribute('aria-expanded','true');
  await userEvent.tab(); await expect(c.getByRole('button',{name:copy.accountSettings})).toHaveFocus();
  await userEvent.keyboard('{Escape}'); await expect(account).toHaveFocus();
  await expect(account).toHaveAttribute('aria-expanded','false');
}};
export const Mobile: Story = {globals:{viewport:{value:'phone',isRotated:false}}};
export const MobileExpanded: Story = {globals:{viewport:{value:'phone',isRotated:false}},play:async({canvasElement})=>{
  const c=await openNavigationIfMobile(canvasElement);
  await expect(c.getByRole('navigation',{name:copy.navigation})).toBeVisible();
}};
export const LongContent: Story = {args:{workspaceName:copy.stories.longWorkspace,user:{name:copy.stories.longName,email:copy.stories.longEmail,role:'admin'}}};
export const LongContentMobile: Story = {...LongContent,globals:{viewport:{value:'phone',isRotated:false}},play:MobileExpanded.play};

export const Calendar: Story = {args:{currentPage:'calendar'},play:async({canvasElement,args})=>{
  const c=await openNavigationIfMobile(canvasElement); const item=copy.items.find(item=>item.id==='calendar')!;
  await expect(c.getByRole('link',{name:item.label})).toHaveAttribute('aria-current','page');
  await userEvent.click(c.getByRole('link',{name:item.label}));
  await expect(args.onNavigate).toHaveBeenCalledWith('calendar');
}};
export const Estimates: Story = {args:{currentPage:'estimates'},play:async({canvasElement,args})=>{
  const c=await openNavigationIfMobile(canvasElement); const item=copy.items.find(item=>item.id==='estimates')!;
  await expect(c.getByRole('link',{name:item.label})).toHaveAttribute('aria-current','page');
  await userEvent.click(c.getByRole('link',{name:item.label}));
  await expect(args.onNavigate).toHaveBeenCalledWith('estimates');
}};

export const Office:Story={args:{user:{name:copy.stories.name,email:copy.stories.email,role:'office'},authorizedPages:['home','leads','jobs','calendar','estimates','reports','campaigns']}};
export const DeniedCapabilities:Story={args:{authorizedPages:['home']},play:async({canvasElement})=>{const c=await openNavigationIfMobile(canvasElement);await expect(c.queryByRole('link',{name:'Campaigns'})).not.toBeInTheDocument();await expect(c.queryByRole('navigation',{name:copy.management})).not.toBeInTheDocument();}};

export const WorkspaceSettings: Story = {
  args: { currentPage: 'settings', authorizedPages: ['home', 'settings'], availablePages: ['home', 'settings'], settingsHref: '/settings?workspace=fictional-workspace', permissionsHref: '/settings/permissions?workspace=fictional-workspace' },
  play: async ({ canvasElement, args }) => {
    const c = await openNavigationIfMobile(canvasElement);
    await expect(c.getByRole('link', { name: copy.items.find(item => item.id === 'settings')!.label })).toHaveAttribute('href', args.settingsHref);
    await expect(c.getByRole('link', { name: copy.items.find(item => item.id === 'settings')!.label })).toHaveAttribute('aria-current', 'page');
  },
};

export const SettingsPermissions: Story = {
  args: { ...WorkspaceSettings.args, permissionsHref: '/settings/permissions?workspace=fictional-workspace', currentSettingsPage: 'permissions' },
  play: async ({ canvasElement, args }) => {
    const c = await openNavigationIfMobile(canvasElement);
    const settings = c.getByRole('link', { name: copy.items.find(item => item.id === 'settings')!.label });
    await expect(settings).not.toHaveAttribute('aria-current');
    const permissions = c.getByRole('link', { name: copy.permissions });
    await expect(permissions).toHaveAttribute('href', args.permissionsHref);
    await expect(permissions).toHaveAttribute('aria-current', 'page');
    settings.focus();
    await userEvent.tab();
    await expect(permissions).toHaveFocus();
  },
};
export const SettingsWithoutPermissions: Story = {
  args: { ...WorkspaceSettings.args, permissionsHref: undefined, user: { name: copy.stories.name, email: copy.stories.email, role: 'admin' } },
  play: async ({ canvasElement }) => {
    const c = await openNavigationIfMobile(canvasElement);
    await expect(c.queryByRole('link', { name: copy.permissions })).not.toBeInTheDocument();
  },
};

export const AIUsageSettings: Story = {
  args: { ...WorkspaceSettings.args, aiUsageHref: '/settings/ai-usage?workspace=fictional-workspace', currentSettingsPage: 'ai-usage' },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await openNavigationIfMobile(canvasElement);
    const usage = c.getByRole('link', { name: copy.aiUsage });
    await expect(usage).toHaveAttribute('href', args.aiUsageHref);
    await expect(usage).toHaveAttribute('aria-current', 'page');
    await expect(c.getByRole('link', { name: copy.permissions })).not.toHaveAttribute('aria-current');
  },
};

export const AccountSettings: Story = {
  args: { ...WorkspaceSettings.args, accountHref: '/settings/account?workspace=fictional-workspace', currentSettingsPage: 'account' },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await openNavigationIfMobile(canvasElement);
    const account = c.getByRole('link', { name: copy.accountPage });
    await expect(account).toHaveAttribute('href', args.accountHref);
    await expect(account).toHaveAttribute('aria-current', 'page');
    await expect(c.getByRole('link', { name: copy.items.find(item => item.id === 'settings')!.label })).not.toHaveAttribute('aria-current');
  },
};
