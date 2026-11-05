import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { AdminFrame } from '../admin-frame/admin-frame';
import type { AdminAIUsageResponse } from '@salesmora/contracts';
import { AdminAIUsagePage } from './admin-ai-usage-page';

const now = '2026-11-02T15:00:00.000Z';
const usage = {
  calls: 14, completedCalls: 12, failedCalls: 2, unknownUsageCalls: 0,
  inputTokens: '102400', outputTokens: '51200', totalTokens: '153600', estimatedCostUsd: null,
};
const report: AdminAIUsageResponse = {
  period: '30d',
  since: '2026-10-03T15:00:00.000Z',
  asOf: now,
  pricingConfigured: false,
  pricingVersionCount: 0,
  summary: usage,
  byDay: [{ date: '2026-11-02', ...usage }],
  byModel: [{ model: 'gpt-6-luna', ...usage }],
  byFeature: [{ feature: 'answer', ...usage }],
  topWorkspaces: [{
    id: '36ab5d58-831c-49fa-9fbe-0396a58e156e',
    name: 'Fictional Workspace',
    ...usage,
  }],
};

const meta = {
  title: 'Admin/Platform/AIUsage',
  component: AdminAIUsagePage,
  decorators: [Story => <AdminFrame environment="local" activeHref="/ai-usage" contentWidth="wide"><Story /></AdminFrame>],
  args: { report },
} satisfies Meta<typeof AdminAIUsagePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RecordedUsageWithoutPricing: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: 'AI usage' })).toBeVisible();
    await expect(canvas.getAllByText('153,600')).toHaveLength(5);
    await expect(canvas.getByText(/No verified model pricing is configured/)).toBeVisible();
    await expect(canvas.getByRole('link', { name: '30 days' })).toHaveAttribute('aria-current', 'page');
    await expect(canvas.getByRole('region', { name: 'Top workspaces' })).toHaveTextContent('Fictional Workspace');
    await expect(canvas.getByText(/Prompts and provider payloads are never included/)).toBeVisible();
  },
};

export const ConfiguredCostEstimate: Story = {
  args: {
    report: {
      ...report,
      pricingConfigured: true,
      pricingVersionCount: 1,
      summary: { ...usage, estimatedCostUsd: '1.234567' },
      byDay: [{ date: '2026-11-02', ...usage, estimatedCostUsd: '1.234567' }],
      byModel: [{ model: 'gpt-6-luna', ...usage, estimatedCostUsd: '1.234567' }],
      byFeature: [{ feature: 'answer', ...usage, estimatedCostUsd: '1.234567' }],
      topWorkspaces: [{ id: '36ab5d58-831c-49fa-9fbe-0396a58e156e', name: 'Fictional Workspace', ...usage, estimatedCostUsd: '1.234567' }],
    },
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByText('$1.23')).toHaveLength(5);
  },
};
