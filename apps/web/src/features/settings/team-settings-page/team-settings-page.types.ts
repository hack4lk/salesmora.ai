import type { TeamMemberCommand, TeamSettingsMember } from '@salesmora/contracts';
export type { TeamSettingsMember } from '@salesmora/contracts';
export type TeamSettingsPageProps = {
  settingsHref: string; members: readonly TeamSettingsMember[]; total: number; page: number; pageSize: number;
  canManage: boolean; state?: 'ready' | 'loading' | 'error'; pending?: boolean; conflict?: boolean;
  onPageChange: (page: number) => void; onPageSizeChange: (size: number) => void; onReload: () => void;
  /** One transaction saves the edited sections, checking each section's revision. */
  onSaveMember: (input: TeamMemberCommand) => Promise<void>;
};
