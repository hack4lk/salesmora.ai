'use client';

import type { ReactNode } from 'react';
import { FormFeedback } from '@salesmora/ui';
import { WorkspaceShell, type WorkspaceShellProps } from '../workspace-shell/workspace-shell';
import { HomeOverview, type HomeOverviewProps } from '../home-overview/home-overview';
import { homeOverviewData } from '../home-overview/home-overview.data';
import { HomeActionsMenu, type HomeAction } from '../home-actions-menu/home-actions-menu';
import { HomeSummaryMetrics, type HomeSummaryMetric } from '../home-summary-metrics/home-summary-metrics';
import { HomeAttentionWidget, type HomeAttentionWidgetProps } from '../home-attention-widget/home-attention-widget';
import { HomeIntakeWidget, type HomeIntakeWidgetProps } from '../home-intake-widget/home-intake-widget';
import { HomeScheduleWidget, type HomeScheduleWidgetProps } from '../home-schedule-widget/home-schedule-widget';
import { HomeActiveJobsWidget, type HomeActiveJobsWidgetProps } from '../home-active-jobs-widget/home-active-jobs-widget';
import { HomeTeamWorkloadWidget, type HomeTeamWorkloadWidgetProps } from '../home-team-workload-widget/home-team-workload-widget';
import { HomeActivityWidget, type HomeActivityWidgetProps } from '../home-activity-widget/home-activity-widget';
import { LeadPipelineWidget, type LeadPipelineWidgetProps } from '../lead-pipeline-widget/lead-pipeline-widget';
import { homePageViewData as copy } from './home-page-view.data';

export type HomePipelineState =
  | { status: 'ready'; props: LeadPipelineWidgetProps }
  | { status: 'loading' }
  | { status: 'error'; onRetry: () => void; retrying?: boolean };
export interface HomePageViewProps {
  shell: Omit<WorkspaceShellProps, 'children' | 'beforeAssistant' | 'title' | 'description' | 'currentPage' | 'contentWidth'>;
  today: string;
  timezone: string;
  actions: readonly HomeAction[];
  metrics: readonly HomeSummaryMetric[];
  attention?: HomeAttentionWidgetProps;
  intake?: HomeIntakeWidgetProps;
  schedule?: HomeScheduleWidgetProps;
  jobs?: HomeActiveJobsWidgetProps;
  workload?: HomeTeamWorkloadWidgetProps;
  activity?: HomeActivityWidgetProps;
  pipeline?: HomePipelineState;
  onboarding?: Omit<HomeOverviewProps, 'userName' | 'workspaceName' | 'role' | 'headingLevel' | 'showHeader'>;
  notices?: ReactNode;
}

/** Presentation only: omit unreadable sections and supply independently authorized data and actions. */
export function HomePageView({ shell, today, timezone, actions, metrics, attention, intake, schedule, jobs, workload, activity, pipeline, onboarding, notices }: HomePageViewProps) {
  const field = shell.user.role === 'field';
  const date = new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeZone: 'UTC' }).format(new Date(`${today}T12:00:00Z`));
  const sections = {
    attention: attention && <HomeAttentionWidget {...attention} />,
    intake: intake && <HomeIntakeWidget {...intake} />,
    schedule: schedule && <HomeScheduleWidget {...schedule} />,
    jobs: jobs && <HomeActiveJobsWidget {...jobs} />,
    workload: workload && <HomeTeamWorkloadWidget {...workload} />,
    activity: activity && <HomeActivityWidget {...activity} />,
    pipeline: pipeline && (pipeline.status === 'ready' ? <LeadPipelineWidget {...pipeline.props} /> :
      <section aria-label={copy.pipeline} aria-busy={pipeline.status === 'loading' || pipeline.retrying} className="rounded-2xl border border-line bg-paper p-6">
        <h2 className="m-0 text-lg font-semibold text-ink">{copy.pipeline}</h2>
        {pipeline.status === 'loading' ? <p role="status" className="text-sm text-muted">{copy.pipelineLoading}</p> : <div className="mt-4 grid gap-4">
          <FormFeedback kind="error" message={copy.pipelineError} />
          <button type="button" disabled={pipeline.retrying} onClick={pipeline.onRetry} className="min-h-11 w-fit rounded-xl border border-line px-4 text-sm font-semibold text-primary focus-visible:focus-ring disabled:text-muted">{copy.pipelineRetry}</button>
        </div>}
      </section>),
  };
  const order = field ? ['schedule', 'attention', 'jobs', 'intake', 'pipeline', 'workload', 'activity'] as const : ['attention', 'schedule', 'intake', 'jobs', 'pipeline', 'workload', 'activity'] as const;
  return <WorkspaceShell {...shell} currentPage="home" contentWidth="full" beforeAssistant={notifications =>
    <header className="mb-6 flex min-w-0 flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="m-0 text-heading font-semibold text-ink wrap-anywhere sm:text-heading-lg">{homeOverviewData.greeting(shell.user.name)}</h1>
        <p className="mb-0 mt-2 text-sm leading-6 text-muted"><time dateTime={today}>{date}</time> · {timezone}</p>
      </div>
      <div className="flex items-center gap-2">{notifications}<HomeActionsMenu actions={actions} /></div>
    </header>
  }>
    <div className="grid min-w-0 gap-6">
      {onboarding && <HomeOverview {...onboarding} showHeader={false} headingLevel={1} userName={shell.user.name} workspaceName={shell.workspaceName} role={shell.user.role} />}
      {notices}
      <HomeSummaryMetrics metrics={metrics} />
      <div className="flex min-w-0 flex-col gap-6 lg:flex-row">
        <div className="contents lg:flex lg:min-w-0 lg:flex-1 lg:flex-col lg:gap-6">
          {order.filter(key => field ? ['schedule', 'jobs'].includes(key) : ['attention', 'intake', 'pipeline'].includes(key)).map(key => sections[key] && <div key={key} data-home-section={key} className={`min-w-0 ${copy.orderClasses[order.indexOf(key)]} lg:order-none`}>{sections[key]}</div>)}
        </div>
        <div className="contents lg:flex lg:min-w-0 lg:flex-1 lg:flex-col lg:gap-6">
          {order.filter(key => field ? !['schedule', 'jobs'].includes(key) : !['attention', 'intake', 'pipeline'].includes(key)).map(key => sections[key] && <div key={key} data-home-section={key} className={`min-w-0 ${copy.orderClasses[order.indexOf(key)]} lg:order-none`}>{sections[key]}</div>)}
        </div>
      </div>
    </div>
  </WorkspaceShell>;
}
