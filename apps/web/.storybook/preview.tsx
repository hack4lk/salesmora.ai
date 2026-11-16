/// <reference types="vite/client" />
import type { Preview } from '@storybook/nextjs-vite';
import { BrandProvider } from '@salesmora/ui';
import GlobalStyles from '@mui/material/GlobalStyles';
import cascadeLayers from '../public/cascade-layers.css?raw';
import { StyledEngineProvider } from '@mui/material/styles';
import '@salesmora/ui/styles.css';
import { ApiQueryProvider, ApiViewerProvider } from '../src/features/api/api-query-provider';

const preview: Preview = {
  decorators: [(Story, context) => <StyledEngineProvider enableCssLayer><GlobalStyles styles={cascadeLayers} /><BrandProvider><ApiQueryProvider key={context.id} testing><ApiViewerProvider viewerId="storybook-viewer"><Story /></ApiViewerProvider></ApiQueryProvider></BrandProvider></StyledEngineProvider>],
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
