import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { ProgressSteps } from './progress-steps';

const meta = {
  title: 'Data Display/ProgressSteps',
  component: ProgressSteps,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Displays a numbered progress indicator for multi-step workflows. Styled to match lead-capture workflows with grid layout, numbered circles, and status-based coloring. Supports optional step navigation.',
      },
    },
  },
  args: {
    steps: [
      { id: 'choose', label: 'Choose report' },
      { id: 'templates', label: 'My templates' },
      { id: 'configure', label: 'Configure' },
      { id: 'results', label: 'Results' },
      { id: 'export', label: 'CSV preview' },
    ],
    currentStep: 'configure',
    completedSteps: ['choose', 'templates'],
    clickable: false,
  },
  decorators: [
    (Story) => (
      <main className="min-h-screen bg-canvas p-4 text-ink">
        <Story />
      </main>
    ),
  ],
} satisfies Meta<typeof ProgressSteps>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <ProgressSteps {...args} />,
};

export const FirstStep: Story = {
  args: {
    currentStep: 'choose',
    completedSteps: [],
  },
};

export const LastStep: Story = {
  args: {
    currentStep: 'export',
    completedSteps: ['choose', 'templates', 'configure', 'results'],
  },
};

export const Clickable: Story = {
  args: {
    clickable: true,
  },
  play: async ({ canvasElement }) => {
    const buttons = within(canvasElement).getAllByRole('button');
    const thirdButton = buttons[2];
    await expect(thirdButton).toHaveAttribute('aria-current', 'step');
    // Clicking on a completed step
    await userEvent.click(buttons[0]);
    await expect(buttons[0]).toHaveAttribute('aria-current', 'step');
  },
};

export const ThreeSteps: Story = {
  args: {
    steps: [
      { id: 'setup', label: 'Setup' },
      { id: 'confirm', label: 'Confirm' },
      { id: 'complete', label: 'Complete' },
    ],
    currentStep: 'confirm',
    completedSteps: ['setup'],
  },
};

export const LongLabels: Story = {
  args: {
    steps: [
      { id: 'step1', label: 'Verify email' },
      { id: 'step2', label: 'Connect Gmail' },
      { id: 'step3', label: 'Configure rules' },
      { id: 'step4', label: 'Select assignment' },
      { id: 'step5', label: 'Review & enable' },
    ],
    currentStep: 'step3',
    completedSteps: ['step1', 'step2'],
  },
};

export const TwoSteps: Story = {
  args: {
    steps: [
      { id: 'step1', label: 'Configure' },
      { id: 'step2', label: 'Review' },
    ],
    currentStep: 'step2',
    completedSteps: ['step1'],
  },
};
