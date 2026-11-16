'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import type { HomeSnapshot } from '../../../server/home/read';
import { HomePageView, type HomePageViewProps } from './home-page-view';
import { homeRouteProps } from './home-route.projection';

export interface HomeRouteProps {
  initial: HomeSnapshot;
  shell: HomePageViewProps['shell'];
  entry: 'created' | 'joined';
  notices?: ReactNode;
}
export function HomeRoute({ initial, shell, entry, notices }: HomeRouteProps) {
  const router = useRouter();
  const [retrying, startTransition] = useTransition();
  return <HomePageView {...homeRouteProps(initial, shell, () => startTransition(() => router.refresh()), retrying, entry)} notices={notices} />;
}
