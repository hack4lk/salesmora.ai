import { useQueryClient } from '@tanstack/react-query';
import type { Decorator } from '@storybook/nextjs-vite';

/** Fixed historical fixtures represent fresh server reads, not today's stale data. */
export const reportSnapshotDecorator: Decorator = function ReportSnapshot(Story) {
  const client = useQueryClient();
  client.setQueryDefaults(['api'], { staleTime: Infinity });
  return <Story/>;
};
