import type {
  AdminWorkspaceDirectoryItem as ContractWorkspaceDirectoryItem,
  AdminWorkspacePlan as ContractWorkspacePlan,
  AdminWorkspaceStatus as ContractWorkspaceStatus,
} from '@salesmora/contracts';

export type AdminWorkspaceStatus = ContractWorkspaceStatus;
export type AdminWorkspacePlan = ContractWorkspacePlan;
export type AdminWorkspacePlanFilter = AdminWorkspacePlan | 'override';

export interface AdminWorkspaceDirectoryPreview extends ContractWorkspaceDirectoryItem {
  ownerEmail: string;
}

export type AdminWorkspaceDirectoryItem = ContractWorkspaceDirectoryItem;

export const adminWorkspaceManagementData = {
  title: 'Workspaces',
  eyebrow: 'Customers',
  description: "Search and filter workspace accounts. Open a workspace for read-only details; owner emails remain masked and are revealed from the owner's user profile with a reason.",
  previewNotice: 'Storybook preview only. All workspace records are fictional; no live tenant data or admin actions are connected.',
  liveNotice: "Live workspace directory. Open workspace names for read-only details. Owner emails remain masked; use the owner's user profile to reveal them with a reason.",
  deniedTitle: 'Workspace access denied',
  deniedDescription: 'Your current role cannot read workspaces.',
  search: 'Filter workspaces',
  searchPlaceholder: 'Name, workspace ID, owner name or full owner email',
  planFilter: 'Filter by plan',
  plans: {
    all: 'All plans',
    free: 'Free',
    standard: 'Standard',
    premium: 'Premium',
    override: 'Has plan override',
  } satisfies Record<'all' | AdminWorkspacePlanFilter, string>,
  statusFilter: 'Filter workspaces by status',
  statuses: {
    all: 'All',
    active: 'Active',
    past_due: 'Past due',
    suspended: 'Suspended',
    deleting: 'Deletion pending',
  } satisfies Record<'all' | AdminWorkspaceStatus, string>,
  columns: {
    workspace: 'Workspace',
    owner: 'Owner',
    plan: 'Plan',
    status: 'Status',
    members: 'Members',
    created: 'Created',
  },
  membershipCount: (count: number) => `${count} ${count === 1 ? 'member' : 'members'}`,
  override: 'Override',
  results: (start: number, end: number, total: number) => `${start}–${end} of ${total} workspaces`,
  previous: 'Previous page',
  next: 'Next page',
  pagination: 'Workspace result pages',
  emptyTitle: 'No workspaces found',
  emptyDescription: 'No workspaces match these filters.',
  loading: 'Loading workspaces…',
  loadFailed: 'Could not load workspaces. Retry before relying on this list.',
  retry: 'Retry workspaces',
  createdUnknown: 'Not recorded',
  statusLabel: (status: AdminWorkspaceStatus) => ({
    active: 'Active',
    past_due: 'Past due',
    suspended: 'Suspended',
    deleting: 'Deletion pending',
  })[status],
} as const;

export const adminWorkspaceDirectoryPreviews: readonly AdminWorkspaceDirectoryPreview[] = [
  {
    id: 'ws_8f21c',
    name: 'Northside Plumbing',
    ownerName: 'Maria Owens',
    ownerEmail: 'owner@northsideplumbing.example',
    maskedOwnerEmail: 'ow••••@northsideplumbing.example',
    plan: 'standard',
    overridePlan: null,
    status: 'active',
    memberCount: 3,
    createdAt: '2026-03-04T12:00:00.000Z',
  },
  {
    id: 'ws_19a77',
    name: 'Brightline Electric',
    ownerName: 'Priya Natarajan',
    ownerEmail: 'priya@brightlineelectric.example',
    maskedOwnerEmail: 'pr••••@brightlineelectric.example',
    plan: 'premium',
    overridePlan: null,
    status: 'past_due',
    memberCount: 5,
    createdAt: '2026-01-12T12:00:00.000Z',
  },
  {
    id: 'ws_4c0d2',
    name: 'Summit HVAC',
    ownerName: 'Grace Kim',
    ownerEmail: 'grace@summithvac.example',
    maskedOwnerEmail: 'gr••••@summithvac.example',
    plan: 'standard',
    overridePlan: 'premium',
    status: 'active',
    memberCount: 9,
    createdAt: '2026-05-21T12:00:00.000Z',
  },
  {
    id: 'ws_77be0',
    name: 'Oakridge Builders',
    ownerName: 'Tom Okafor',
    ownerEmail: 'tom@oakridgebuilders.example',
    maskedOwnerEmail: 'to••••@oakridgebuilders.example',
    plan: 'premium',
    overridePlan: null,
    status: 'active',
    memberCount: 4,
    createdAt: '2026-04-09T12:00:00.000Z',
  },
  {
    id: 'ws_5e612',
    name: 'Clearwater Pools',
    ownerName: 'Rita Gomez',
    ownerEmail: 'rita@clearwaterpools.example',
    maskedOwnerEmail: 'ri••••@clearwaterpools.example',
    plan: 'standard',
    overridePlan: null,
    status: 'suspended',
    memberCount: 2,
    createdAt: '2026-08-30T12:00:00.000Z',
  },
  {
    id: 'ws_a3f90',
    name: 'Riverbend Roofing',
    ownerName: 'Kevin Walsh',
    ownerEmail: 'kevin@riverbendroofing.example',
    maskedOwnerEmail: 'ke••••@riverbendroofing.example',
    plan: 'free',
    overridePlan: null,
    status: 'deleting',
    memberCount: 1,
    createdAt: '2026-02-02T12:00:00.000Z',
  },
];
