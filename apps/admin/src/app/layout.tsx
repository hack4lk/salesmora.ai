import type { ReactNode } from 'react';
import '@salesmora/ui/styles.css';

export const metadata = {
  title: 'SalesMora Admin',
  description: 'Internal administration for SalesMora.ai.',
  robots: { index: false, follow: false, noarchive: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
