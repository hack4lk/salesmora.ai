'use client';

import { useRouter } from 'next/navigation';
import { BrandProvider } from '@salesmora/ui';
import type { AdminWorkspaceDetailResponse } from '@salesmora/contracts';
import { AdminWorkspaceTeamActions } from './admin-workspace-team-actions';
import { AdminWorkspaceOwnership } from './admin-workspace-ownership';
import { AdminWorkspacePlanOverride } from './admin-workspace-plan-override';
import { AdminWorkspaceAIBudget } from './admin-workspace-ai-budget';
import { AdminWorkspaceSuspension } from './admin-workspace-suspension';
import { AdminWorkspaceBilling } from './admin-workspace-billing';

export function AdminWorkspaceDetail({ detail }: { detail: AdminWorkspaceDetailResponse }) {
  const router = useRouter();
  const workspaceActions = (
    <div className="grid gap-4">
      <AdminWorkspaceSuspension
        workspaceId={detail.workspace.id}
        name={detail.workspace.name}
        status={detail.workspace.status}
        deletionPending={detail.workspace.status === 'deleting'}
        canManage={detail.permissions?.canSuspend === true}
        onComplete={() => router.refresh()}
      />
      <AdminWorkspaceOwnership
        detail={detail}
        onComplete={() => router.refresh()}
      />
      <AdminWorkspacePlanOverride
        detail={detail}
        onComplete={() => router.refresh()}
      />
      <AdminWorkspaceAIBudget
        detail={detail}
        onComplete={() => router.refresh()}
      />
    </div>
  );
  return (
    <BrandProvider>
      <AdminWorkspaceTeamActions
        detail={detail}
        onBack={() => router.push('/workspaces')}
        onComplete={() => router.refresh()}
        workspaceActions={workspaceActions}
        workspaceBillingSection={
          <AdminWorkspaceBilling
            workspaceId={detail.workspace.id}
            canReadBillingLinks={detail.permissions?.canReadBillingLinks === true}
            canChangePlan={detail.permissions?.canChangePlan === true}
            canManageRecovery={detail.permissions?.canManageRecovery === true}
            canReplayWebhooks={detail.permissions?.canReplayWebhooks === true}
            deletionPending={detail.workspace.status === 'deleting'}
            onComplete={() => router.refresh()}
          />
        }
      />
    </BrandProvider>
  );
}
