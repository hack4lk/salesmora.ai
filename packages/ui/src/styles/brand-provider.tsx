'use client';

import type { ReactNode } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { salesmoraTheme } from './theme';

/** The web app and Storybook serve the same local font from /fonts. */
export function BrandProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={salesmoraTheme}>
      {children}
    </ThemeProvider>
  );
}
