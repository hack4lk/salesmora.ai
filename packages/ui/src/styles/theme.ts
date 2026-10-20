'use client';

import { createTheme } from '@mui/material/styles';

export const salesmoraTheme = createTheme({
  palette: {
    primary: { main: '#3B6FA5', dark: '#315C8A', contrastText: '#FFFFFF' },
    secondary: { main: '#7CCBB7', contrastText: '#23384D' },
    text: { primary: '#23384D', secondary: '#52677B' },
    background: { default: '#F4F8FC', paper: '#FFFFFF' },
    divider: '#E2EAF1',
  },
  typography: {
    fontFamily: "'Source Sans 3', 'Segoe UI', Arial, sans-serif",
    h1: { fontWeight: 600, letterSpacing: '-0.035em' },
    h2: { fontWeight: 600, letterSpacing: '-0.035em' },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: { borderRadius: 12 },
});
