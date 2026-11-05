import type { Preview } from '@storybook/nextjs-vite';
import '@salesmora/ui/styles.css';

const preview: Preview = {
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
