import type { ReactNode } from 'react';
import { getSession } from '../../server/auth/session';
import { ApiViewerProvider } from '../../features/api/api-query-provider';

export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  return <ApiViewerProvider viewerId={session?.user.id ?? null}>{children}</ApiViewerProvider>;
}
