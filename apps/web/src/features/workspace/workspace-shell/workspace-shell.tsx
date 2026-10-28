'use client';
import { useRouter } from 'next/navigation';
import { useState, useTransition, type ReactNode } from 'react';
import { AssistantPanel, FormFeedback, WorkspaceNavigation, type WorkspaceNavigationAuthorizedPage, type WorkspaceNavigationProps } from '@salesmora/ui';
import { ConnectedNotificationMenu } from '../../notifications/notification-menu/connected-notification-menu';
import { ConnectedAssistant } from '../../assistant/connected-assistant/connected-assistant';
import { WorkspaceAssistantProvider, type AssistantPageContext } from '../../assistant/workspace-assistant/workspace-assistant';
import type { ChatSurfaceKey } from '@salesmora/contracts';
import { workspaceShellData as copy } from './workspace-shell.data';
export interface WorkspaceShellProps {
  currentPage?: WorkspaceNavigationProps['currentPage'];
  currentSettingsPage?: WorkspaceNavigationProps['currentSettingsPage'];
  currentCalendarPage?: WorkspaceNavigationProps['currentCalendarPage'];
  ganttAvailable?: boolean;
  jobNotificationsAvailable?: boolean;
  permissionsAvailable?: boolean;
  billingAvailable?: boolean;
  workspaceId: string;
  workspaceName: string;
  user: WorkspaceNavigationProps['user'];
  title?: string;
  description?: string;
  contentWidth?: 'standard' | 'full';
  authorizedPages?: readonly WorkspaceNavigationAuthorizedPage[];
  assistantAvailable?: boolean;
  chatEnabled?: boolean;
  chatSurface?: ChatSurfaceKey;
  chatContext?: AssistantPageContext;
  printChromeHidden?: boolean;
  onSignOut: () => Promise<void>;
  children: ReactNode;
}
export function WorkspaceShell({currentPage = 'home',currentSettingsPage,currentCalendarPage,ganttAvailable = false,jobNotificationsAvailable = false,permissionsAvailable = false,billingAvailable = false,workspaceId,workspaceName,user,title,description,contentWidth = 'standard',onSignOut,children,authorizedPages = [],assistantAvailable = false,chatEnabled = false,chatSurface = 'home',chatContext,printChromeHidden = false}:WorkspaceShellProps) {
  const router = useRouter();
  // Every active teammate can open personal settings; business settings still authorize independently.
  const accountHref = `/settings/account?workspace=${encodeURIComponent(workspaceId)}`;
  const [pending,startTransition] = useTransition();
  const [error,setError] = useState(false);
  function signOut() {
    if (pending) return;
    setError(false);
    startTransition(async()=>{
      try {await onSignOut();} catch {setError(true);}
    });
  }
  return <WorkspaceAssistantProvider key={workspaceId} enabled={assistantAvailable && chatEnabled} initialPageContext={chatContext}><div className={`min-h-screen md:flex ${printChromeHidden ? 'print:min-h-0' : ''}`}>
    <div className={printChromeHidden ? 'contents print:hidden' : 'contents'}><WorkspaceNavigation
      jobNotificationsHref={jobNotificationsAvailable ? `/settings/job-notifications?workspace=${encodeURIComponent(workspaceId)}` : undefined}
      ganttHref={ganttAvailable ? `/calendar/gantt?workspace=${encodeURIComponent(workspaceId)}` : undefined}
      currentCalendarPage={currentCalendarPage}
      notificationsHref={`/settings/notifications?workspace=${encodeURIComponent(workspaceId)}`}
      accountHref={accountHref}
      billingHref={billingAvailable ? `/settings/billing?workspace=${encodeURIComponent(workspaceId)}` : undefined}
      aiUsageHref={user.role === 'owner' ? `/settings/ai-usage?workspace=${encodeURIComponent(workspaceId)}` : undefined}
      workspaceName={workspaceName}
      user={user}
      currentPage={currentPage}
      currentSettingsPage={currentSettingsPage}
      permissionsHref={permissionsAvailable ? `/settings/permissions?workspace=${encodeURIComponent(workspaceId)}` : undefined}
      contentId={copy.contentId}
      homeHref={`/home?workspace=${encodeURIComponent(workspaceId)}`}
      calendarHref={`/calendar?workspace=${encodeURIComponent(workspaceId)}`}
      estimatesHref={`/estimates?workspace=${encodeURIComponent(workspaceId)}`}
      estimateSettingsHref={authorizedPages.includes('estimate-settings') ? `/settings/estimates?workspace=${encodeURIComponent(workspaceId)}` : undefined}
      jobsHref={`/jobs?workspace=${encodeURIComponent(workspaceId)}`}
      workOrdersHref={`/work-orders?workspace=${encodeURIComponent(workspaceId)}`}
      materialsHref={`/materials?workspace=${encodeURIComponent(workspaceId)}`}
      customersHref={`/customers?workspace=${encodeURIComponent(workspaceId)}`}
      leadsHref={`/leads?workspace=${encodeURIComponent(workspaceId)}`}
      settingsHref={`/settings?workspace=${encodeURIComponent(workspaceId)}`}
      availablePages={['home', 'leads', 'customers', 'jobs', 'work-orders', 'materials', 'calendar', 'estimates', 'settings']}
      authorizedPages={[...authorizedPages.filter(page => page !== 'settings'), 'settings']}
      accountSettingsAvailable
      signingOut={pending}
      onAccountSettings={() => router.push(accountHref)}
      onSignOut={signOut}
    /></div>
    <main id={copy.contentId} tabIndex={-1} className={`min-w-0 flex-1 px-6 py-8 pb-28 focus-visible:focus-ring sm:px-10 md:py-10 md:pb-28 ${printChromeHidden ? 'print:p-0 print:pb-0' : ''}`}>
      <div className={`mx-auto w-full ${contentWidth === 'standard' ? 'max-w-4xl' : ''}`}>
        <div className={`mb-6 flex justify-end ${printChromeHidden ? 'print:hidden' : ''}`}><ConnectedNotificationMenu key={workspaceId} workspaceId={workspaceId} workspaceName={workspaceName}/></div>
        {assistantAvailable && (chatEnabled ? <ConnectedAssistant key={workspaceId} workspaceId={workspaceId} surfaceKey={chatSurface} /> : <AssistantPanel sendDisabled badge={copy.assistant.badge} onSend={async () => ({ ok: false, message: copy.assistant.unavailable })} />)}
        {title && <header className={`mb-8 ${printChromeHidden ? 'print:hidden' : ''}`}><h1 className="m-0 text-heading font-semibold text-ink sm:text-heading-lg">{title}</h1>{description && <p className="mb-0 mt-3 text-base leading-relaxed text-muted">{description}</p>}</header>}
        {error && <div className="mb-6"><FormFeedback kind="error" title={copy.signOutErrorTitle} message={copy.signOutError} /></div>}
        {children}
      </div>
    </main>
  </div></WorkspaceAssistantProvider>;
}
