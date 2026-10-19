/// <reference types="vite/client" />
import type { Preview } from '@storybook/nextjs-vite';
import { BrandProvider } from '@salesmora/ui';
import GlobalStyles from '@mui/material/GlobalStyles';
import cascadeLayers from '../public/cascade-layers.css?raw';
import { StyledEngineProvider } from '@mui/material/styles';
import '@salesmora/ui/styles.css';

const preview: Preview = {
  decorators: [(Story) => <StyledEngineProvider enableCssLayer><GlobalStyles styles={cascadeLayers} /><BrandProvider><Story /></BrandProvider></StyledEngineProvider>],
  parameters: {
    nextjs: { appDirectory: true },
    a11y: { test: 'error' },
    viewport: {
      options: {
        phone: { name: 'Phone · 390px', styles: { width: '390px', height: '844px' }, type: 'mobile' },
        desktop: { name: 'Desktop · 1440px', styles: { width: '1440px', height: '900px' }, type: 'desktop' },
      },
    },
  },
};
export default preview;
