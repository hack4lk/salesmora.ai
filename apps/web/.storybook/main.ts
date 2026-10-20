import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)', '../../../packages/ui/src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  staticDirs: ['../public'],
  framework: '@storybook/nextjs-vite',
  core: { disableTelemetry: true },
  async viteFinal(config) {
    config.server = { ...config.server, proxy: { ...config.server?.proxy,
      '/api/auth/get-session': { target: 'http://127.0.0.1:3000', changeOrigin: true },
    } };
    return config;
  },
};
export default config;
