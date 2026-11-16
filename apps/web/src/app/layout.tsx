import type { ReactNode } from 'react';
import '@salesmora/ui/styles.css';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { BrandProvider } from '@salesmora/ui';
import { setupPageData } from './page.data';
import { ApiQueryProvider } from '../features/api/api-query-provider';

export const metadata = { title: setupPageData.documentTitle };

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body><AppRouterCacheProvider options={{ enableCssLayer: true }}><BrandProvider><ApiQueryProvider>{children}</ApiQueryProvider></BrandProvider></AppRouterCacheProvider></body></html>;
}
