import type { ReactNode } from 'react';
import type {
  AdminWorkspaceDetailResponse,
  AdminWorkspacePlan,
  AdminWorkspaceStatus,
} from '@salesmora/contracts';
import {
  adminWorkspaceDetailPreviewCopy as copy,
  type AdminWorkspaceDetailPreview,
} from './admin-workspace-detail-preview.data';
import styles from './admin-workspace-detail.module.css';

export interface AdminWorkspaceDetailViewProps {
  detail: AdminWorkspaceDetailPreview;
  onBack: () => void;
  onSelectUser?: (userId: string) => void;
  preview?: boolean;
  workspaceManagementAction?: ReactNode;
  workspaceBillingSection?: ReactNode;
  memberActions?: (member: AdminWorkspaceDetailResponse['members'][number]) => ReactNode;
}

function percentage(used: number, limit: number) {
  return limit > 0 ? Math.round((used / limit) * 100) : used > 0 ? 100 : 0;
}

function usageMeter(label: string, used: number, limit: number, displayUsed: string, displayLimit: string, foot: string) {
  const percent = percentage(used, limit);
  const ariaValue = Math.min(percent, 100);
  const tone = percent >= 100 ? 'over' : percent >= 90 ? 'near' : '';
  return (
    <div className={styles.meter}>
      <div className={styles.meterTop}>
        <strong>{label}</strong>
        <span>{copy.usedOf(displayUsed, displayLimit, percent)}</span>
      </div>
      <div
        className={`${styles.bar} ${tone ? styles[tone] : ''}`}
        role="progressbar"
        aria-label={label}
        aria-valuenow={ariaValue}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ width: `${ariaValue}%` }} />
      </div>
      <p className={styles.meterFoot}>{foot}</p>
    </div>
  );
}

function statusTone(status: AdminWorkspaceStatus) {
  if (status === 'active') return 'active';
  if (status === 'deleting') return 'warning';
  return 'danger';
}

function planLabel(plan: AdminWorkspacePlan) {
  return copy.plans[plan].label;
}

function recordValues(detail: AdminWorkspaceDetailPreview) {
  return [
    { label: copy.fields.leadRecords, value: detail.records.leads },
    { label: copy.fields.customers, value: detail.records.customers },
    { label: copy.fields.jobs, value: detail.records.jobs },
    { label: copy.fields.estimates, value: detail.records.estimates },
    { label: copy.fields.workOrders, value: detail.records.workOrders },
  ];
}

export function AdminWorkspaceDetailView({
  detail,
  onBack,
  onSelectUser,
  preview = true,
  workspaceManagementAction,
  workspaceBillingSection,
  memberActions,
}: AdminWorkspaceDetailViewProps) {
  const { workspace } = detail;
  const effectivePlan = copy.plans[workspace.plan];
  const statusToneClass = styles[statusTone(workspace.status)];

  function userLink(userId: string, name: string) {
    if (!onSelectUser) return <span className={styles.personName}>{name}</span>;
    return (
      <button className={styles.userLink} type="button" onClick={() => onSelectUser(userId)}>
        {name}
      </button>
    );
  }

  return (
    <div className={styles.page}>
      <button className={styles.back} type="button" onClick={onBack}>{copy.back}</button>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h1 id="admin-title">{copy.title}</h1>
          <p className={styles.description}>{copy.description}</p>
        </div>
      </header>
      <p className={styles.notice} role="note">{preview ? copy.notice : copy.liveNotice}</p>

      <div className={`${styles.banner} ${statusToneClass}`} role="status">
        <strong>{copy.statusLabel(workspace.status)}.</strong>
        <span>{detail.statusDetail ?? copy.statusDetail[workspace.status]}</span>
      </div>
      {workspaceManagementAction}
      {detail.override && (
        <div className={`${styles.banner} ${styles.info}`} role="note">
          <strong>{copy.override}.</strong>
          <span>{copy.overrideNotice(planLabel(workspace.overridePlan ?? workspace.plan), copy.date(detail.override.endsAt))}</span>
          <span className={styles.bannerMeta}>
            Applied {detail.override.appliedAt} by {detail.override.appliedBy}. Reason: “{detail.override.reason}”
          </span>
        </div>
      )}

      <section className={`${styles.panel} ${styles.overview}`} aria-labelledby="workspace-overview-title">
        <div className={styles.workspaceMark} aria-hidden="true">WS</div>
        <div className={styles.overviewMain}>
          <h2 id="workspace-overview-title">
            {workspace.name}
            <span className={`${styles.badge} ${statusToneClass}`}>{copy.statusLabel(workspace.status)}</span>
            <span className={styles.badge}>{planLabel(workspace.plan)}</span>
            {detail.override && <span className={`${styles.badge} ${styles.warning}`}>{copy.override}</span>}
          </h2>
          <p>
            <span className={styles.mono}>{workspace.id}</span>
            <span aria-hidden="true"> · </span>
            Created {copy.date(workspace.createdAt)}
            <span aria-hidden="true"> · </span>
            Owner {userLink(detail.ownerUserId, workspace.ownerName)}
          </p>
        </div>
      </section>

      <div className={styles.contentGrid}>
        <div className={styles.stack}>
          <section className={styles.panel} aria-labelledby="workspace-usage-title">
            <div className={styles.panelHeader}>
              <h2 id="workspace-usage-title">{copy.sections.usage}</h2>
              <span className={styles.badge}>Resets Nov 1</span>
            </div>
            <div className={styles.usage}>
              {usageMeter(
                copy.fields.leads,
                detail.usage.leads,
                detail.limits.leads,
                copy.formatNumber(detail.usage.leads),
                copy.formatNumber(detail.limits.leads),
                `${effectivePlan.label} plan limit.`,
              )}
              {usageMeter(
                copy.fields.teammates,
                detail.totalMembers,
                detail.limits.teammates,
                copy.formatNumber(detail.totalMembers),
                copy.formatNumber(detail.limits.teammates),
                copy.pendingInvitations,
              )}
              {usageMeter(
                copy.fields.aiTokens,
                detail.usage.aiTokens,
                detail.limits.aiTokens,
                copy.formatTokens(detail.usage.aiTokens),
                copy.formatTokens(detail.limits.aiTokens),
                detail.limits.aiTokens === effectivePlan.aiTokens
                  ? `${effectivePlan.label} plan default.`
                  : 'Custom workspace budget.',
              )}
            </div>
          </section>

          <section className={styles.panel} aria-labelledby="workspace-members-title">
            <div className={styles.panelHeader}>
              <h2 id="workspace-members-title">{copy.sections.members}</h2>
              <span className={styles.badge}>
                {copy.membershipCount(detail.totalMembers, detail.limits.teammates)}
              </span>
            </div>
            {detail.members.length > 0 ? (
              <ul className={styles.memberList}>
                {detail.members.map(member => (
                  <li className={styles.member} key={member.id}>
                    <span className={styles.avatar} aria-hidden="true">
                      {member.name.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase()}
                    </span>
                    <div className={styles.memberBody}>
                      <div className={styles.memberNameLine}>
                        {userLink(member.id, member.name)}
                        <span className={styles.badge}>{member.role}</span>
                        {member.status !== 'Active' && (
                          <span className={`${styles.badge} ${member.status === 'Suspended' ? styles.danger : styles.warning}`}>
                            {member.status}
                          </span>
                        )}
                      </div>
                      <p className={styles.memberMeta}>{member.maskedEmail} · {member.lastActivity}</p>
                    </div>
                    {memberActions?.(member)}
                  </li>
                ))}
              </ul>
            ) : <p className={styles.empty}>{copy.noMembers}</p>}
            {detail.totalMembers > detail.members.length && (
              <p className={styles.memberFoot}>{preview ? copy.showAll : copy.liveMemberFoot}</p>
            )}
          </section>

          <section className={styles.panel} aria-labelledby="workspace-records-title">
            <div className={styles.panelHeader}>
              <h2 id="workspace-records-title">{copy.sections.records}</h2>
              <span className={styles.badge}>Counts only</span>
            </div>
            <dl className={styles.records}>
              {recordValues(detail).map(record => (
                <div key={record.label}>
                  <dd>{copy.formatNumber(record.value)}</dd>
                  <dt>{record.label}</dt>
                </div>
              ))}
            </dl>
            <dl className={styles.definitionList}>
              <dt>{copy.sections.onboarding}</dt>
              <dd>{detail.onboarding}</dd>
              <dt>{copy.sections.featureFlags}</dt>
              <dd>
                {detail.featureFlags === null
                  ? <span className={styles.muted}>{copy.noFlagSource}</span>
                  : detail.featureFlags.length > 0
                    ? detail.featureFlags.map(flag => <span className={styles.badge} key={flag}>{flag}</span>)
                    : <span className={styles.muted}>{copy.noFlags}</span>}
              </dd>
            </dl>
          </section>
        </div>

        <div className={styles.stack}>
          <section className={styles.panel} aria-labelledby="workspace-plan-title">
            <div className={styles.panelHeader}>
              <h2 id="workspace-plan-title">{copy.sections.plan}</h2>
              <span className={styles.badge}>Read-only</span>
            </div>
            <dl className={styles.definitionList}>
              <dt>{copy.fields.plan}</dt>
              <dd>
                {planLabel(workspace.plan)}
                {detail.override && <span className={styles.muted}>(override)</span>}
              </dd>
              <dt>{copy.fields.stripePlan}</dt>
              <dd>{planLabel(detail.stripePlan)}</dd>
              <dt>{copy.fields.price}</dt>
              <dd>{copy.plans[detail.stripePlan].price}</dd>
              <dt>{copy.fields.subscription}</dt>
              <dd>{detail.subscriptionStatus}</dd>
              <dt>{copy.fields.billingPeriod}</dt>
              <dd>{detail.billingPeriod}</dd>
              <dt>{copy.fields.paymentMethod}</dt>
              <dd>{detail.paymentMethod}</dd>
            </dl>
          </section>

          {workspaceBillingSection}

          <section className={styles.panel} aria-labelledby="workspace-audit-title">
            <div className={styles.panelHeader}>
              <h2 id="workspace-audit-title">{copy.sections.audit}</h2>
            </div>
            {detail.auditActions.length > 0 ? (
              <ol className={styles.auditList}>
                {detail.auditActions.map((action, index) => (
                  <li className={styles.auditRow} key={`${action.occurredAt}-${index}`}>
                    <time>{action.occurredAt}</time>
                    <div>
                      <p><strong>{action.actor}</strong> {action.description}</p>
                      <p className={styles.auditReason}>{copy.auditReason(action.reason)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : <p className={styles.empty}>{copy.noAudit}</p>}
          </section>
        </div>
      </div>
    </div>
  );
}
