'use client';

import { useId, useRef, useState } from 'react';
import HomeOutlined from '@mui/icons-material/HomeOutlined';
import InboxOutlined from '@mui/icons-material/InboxOutlined';
import PeopleOutlined from '@mui/icons-material/PeopleOutlined';
import ContactsOutlined from '@mui/icons-material/ContactsOutlined';
import WorkOutlined from '@mui/icons-material/WorkOutlined';
import AssignmentOutlined from '@mui/icons-material/AssignmentOutlined';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import RequestQuoteOutlined from '@mui/icons-material/RequestQuoteOutlined';
import BarChartOutlined from '@mui/icons-material/BarChartOutlined';
import CampaignOutlined from '@mui/icons-material/CampaignOutlined';
import SettingsOutlined from '@mui/icons-material/SettingsOutlined';
import MenuOutlined from '@mui/icons-material/MenuOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import ExpandMoreOutlined from '@mui/icons-material/ExpandMoreOutlined';
import LogoutOutlined from '@mui/icons-material/LogoutOutlined';
import ManageAccountsOutlined from '@mui/icons-material/ManageAccountsOutlined';
import { workspaceNavigationData as copy } from './workspace-navigation.data';

export type WorkspaceNavigationPage = typeof copy.items[number]['id'];
export interface WorkspaceNavigationProps {
  workspaceName: string;
  user: { name: string; email: string; role: keyof typeof copy.roles };
  currentPage: WorkspaceNavigationPage;
  contentId: string;
  homeHref?: string;
  leadsHref?: string;
  customersHref?: string;
  jobsHref?: string;
  workOrdersHref?: string;
  settingsHref?: string;
  /** Supply only when the server authorizes permissions.read. Omitted means deny. */
  permissionsHref?: string;
  aiUsageHref?: string;
  billingHref?: string;
  accountHref?: string;
  notificationsHref?: string;
  currentSettingsPage?: 'permissions' | 'ai-usage' | 'billing' | 'account' | 'notifications';
  availablePages?: readonly WorkspaceNavigationPage[];
  /** Current server-resolved permissions, independent of implemented routes. Omitted means deny. */
  authorizedPages?: readonly WorkspaceNavigationPage[];
  accountSettingsAvailable?: boolean;
  signingOut?: boolean;
  /** Optional routing adapter. Without it, links use their native hrefs. */
  onNavigate?: (page: WorkspaceNavigationPage) => void;
  onAccountSettings: () => void;
  onSignOut: () => void;
}
const icons = { home: HomeOutlined, intake: InboxOutlined, leads: PeopleOutlined, customers: ContactsOutlined, jobs: WorkOutlined, 'work-orders': AssignmentOutlined, calendar: CalendarMonthOutlined, estimates: RequestQuoteOutlined, reports: BarChartOutlined, campaigns: CampaignOutlined, settings: SettingsOutlined };
const controlClass = 'inline-flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold focus-visible:focus-ring';

/** Visibility reflects current server-supplied capabilities; routes must enforce authorization. */
export function WorkspaceNavigation({ workspaceName, user, currentPage, contentId, homeHref = '/home', leadsHref = '/leads', customersHref = '/customers', jobsHref = '/jobs', workOrdersHref = '/work-orders', settingsHref = '/settings', permissionsHref, aiUsageHref, billingHref, accountHref, notificationsHref, currentSettingsPage, availablePages, authorizedPages = [], accountSettingsAvailable = true, signingOut = false, onNavigate, onAccountSettings, onSignOut }: WorkspaceNavigationProps) {
  const id = useId();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const mobileButton = useRef<HTMLButtonElement>(null);
  const accountButton = useRef<HTMLButtonElement>(null);
  const canManage = copy.items.some(item => item.management && authorizedPages.includes(item.id));
  function navigate(page: WorkspaceNavigationPage) {
    setMobileOpen(false); setAccountOpen(false); onNavigate?.(page);
  }
  function links(management: boolean) {
    return copy.items.filter(item => item.management === management && authorizedPages.includes(item.id)).map(item => {
      const Icon = icons[item.id];
      if (availablePages && !availablePages.includes(item.id)) return <button key={item.id} type="button" disabled className={`${controlClass} w-full cursor-not-allowed text-left text-muted`}>
        <Icon className="size-5 shrink-0" aria-hidden="true" /><span className="min-w-0 flex-1">{item.label}</span><span className="text-xs font-normal">{copy.unavailable}</span>
      </button>;
      return <div key={item.id}><a href={item.id === 'home' ? homeHref : item.id === 'leads' ? leadsHref : item.id === 'customers' ? customersHref : item.id === 'jobs' ? jobsHref : item.id === 'work-orders' ? workOrdersHref : item.id === 'settings' ? settingsHref : item.href} aria-current={currentPage === item.id && !(item.id === 'settings' && currentSettingsPage) ? 'page' : undefined}
        onClick={event => { if (onNavigate) event.preventDefault(); navigate(item.id); }}
        className={`${controlClass} w-full ${currentPage === item.id ? 'bg-primary text-paper hover:bg-primary-dark' : 'text-muted hover:bg-canvas hover:text-ink'}`}>
        <Icon className="size-5 shrink-0" aria-hidden="true" /><span>{item.label}</span>
      </a>
        {item.id === 'settings' && (permissionsHref || aiUsageHref || billingHref || accountHref || notificationsHref) && <ul className="mb-1 ml-6 mt-1 list-none border-l border-line py-1 pl-3">
          {([{ id: 'notifications', href: notificationsHref, label: copy.notifications }, { id: 'account', href: accountHref, label: copy.accountPage }, { id: 'billing', href: billingHref, label: copy.billing }, { id: 'permissions', href: permissionsHref, label: copy.permissions }, { id: 'ai-usage', href: aiUsageHref, label: copy.aiUsage }] as const).filter(item => item.href).map(item => <li key={item.id}><a href={item.href} aria-current={currentPage === 'settings' && currentSettingsPage === item.id ? 'page' : undefined}
            onClick={() => { setMobileOpen(false); setAccountOpen(false); }}
            className={`${controlClass} w-full ${currentPage === 'settings' && currentSettingsPage === item.id ? 'bg-canvas text-primary' : 'text-muted hover:bg-canvas hover:text-ink'}`}>
            {item.label}
          </a></li>)}
        </ul>}
      </div>;
    });
  }
  return <aside aria-label={copy.navigation} onKeyDown={event => {
    if (event.key !== 'Escape') return;
    if (accountOpen) { setAccountOpen(false); accountButton.current?.focus(); }
    else if (mobileOpen) { setMobileOpen(false); mobileButton.current?.focus(); }
  }} className="w-full shrink-0 border-b border-line bg-paper md:flex md:min-h-screen md:w-72 md:flex-col md:border-r md:border-b-0">
    <a href={`#${contentId}`} className="sr-only rounded-xl bg-paper p-3 text-primary focus:not-sr-only focus-visible:focus-ring">{copy.skip}</a>
    <div className="flex items-center justify-between gap-3 px-4 py-4 md:px-6 md:py-6">
      <a href={homeHref} aria-label={copy.homeLabel} onClick={event => {if (onNavigate) event.preventDefault(); navigate('home');}} className="min-w-0 rounded-xl focus-visible:focus-ring">
        {/* eslint-disable-next-line @next/next/no-img-element -- Approved shared SVG also served by Storybook. */}
        <img src={copy.logoSrc} alt={copy.brandName} className="h-auto w-brand-logo max-w-full" />
      </a>
      <button ref={mobileButton} type="button" aria-label={mobileOpen ? copy.close : copy.open} aria-expanded={mobileOpen} aria-controls={`${id}-navigation`} onClick={() => {setMobileOpen(!mobileOpen); setAccountOpen(false);}} className={`${controlClass} shrink-0 justify-center text-primary hover:bg-canvas md:hidden`}>
        {mobileOpen ? <CloseOutlined aria-hidden="true" className="size-5" /> : <MenuOutlined aria-hidden="true" className="size-5" />}
      </button>
    </div>
    <div className="mx-4 mb-4 min-w-0 rounded-xl border border-line bg-canvas p-4 md:mx-6">
      <p className="m-0 text-xs font-bold tracking-widest text-muted uppercase">{copy.workspace}</p>
      <p className="mb-0 mt-2 font-semibold text-ink wrap-anywhere">{workspaceName}</p>
      <p className="mb-0 mt-1 text-sm text-muted">{copy.roles[user.role]}</p>
    </div>
    <div id={`${id}-navigation`} className={`${mobileOpen ? 'flex' : 'hidden'} min-w-0 flex-1 flex-col gap-6 px-4 pb-6 md:flex md:px-6`}>
      <nav aria-label={copy.navigation} className="grid gap-1">{links(false)}</nav>
      {canManage && <div><p className="mb-3 mt-0 px-3 text-xs font-bold tracking-widest text-muted uppercase">{copy.manage}</p><nav aria-label={copy.management} className="grid gap-1">{links(true)}</nav></div>}
      <div className="mt-auto min-w-0 border-t border-line pt-4">
        <button ref={accountButton} type="button" aria-expanded={accountOpen} aria-controls={`${id}-account`} onClick={() => setAccountOpen(!accountOpen)} className={`${controlClass} w-full text-left text-ink hover:bg-canvas`}>
          <span className="sr-only">{copy.account}</span><span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-canvas text-base text-primary">{user.name.trim().split(/\s+/).slice(0,2).map(part => Array.from(part)[0]).join('').toUpperCase()}</span>
          <span className="min-w-0 flex-1"><span className="block wrap-anywhere">{user.name}</span><span className="mt-1 block text-xs font-normal text-muted wrap-anywhere">{user.email}</span></span>
          <ExpandMoreOutlined aria-hidden="true" className={`size-5 shrink-0 ${accountOpen ? 'rotate-180' : ''}`} />
        </button>
        <div id={`${id}-account`} hidden={!accountOpen} className="mt-2 rounded-xl border border-line p-2">
          <button type="button" disabled={!accountSettingsAvailable} onClick={() => {setAccountOpen(false); accountButton.current?.focus(); onAccountSettings();}} className={`${controlClass} w-full text-ink hover:bg-canvas disabled:cursor-not-allowed disabled:text-muted`}><ManageAccountsOutlined className="size-5 shrink-0" aria-hidden="true" />{copy.accountSettings}{!accountSettingsAvailable && <span className="ml-auto text-xs font-normal">{copy.unavailable}</span>}</button>
          <button type="button" disabled={signingOut} aria-busy={signingOut} onClick={() => {onSignOut();}} className={`${controlClass} w-full text-ink hover:bg-canvas`}><LogoutOutlined className="size-5 shrink-0" aria-hidden="true" />{signingOut ? copy.signingOut : copy.signOut}</button>
        </div>
      </div>
    </div>
  </aside>;
}
