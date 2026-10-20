import { fn } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { JobFileUploadDialog } from './job-file-upload-dialog';

const meta = {
  title: 'Jobs/JobFileUploadDialog',
  component: JobFileUploadDialog,
  parameters: {
    layout: 'centered',
  },
  args: {
    isOpen: true,
    workspaceId: 'workspace-123',
    jobId: 'job-456',
    category: 'before',
    onClose: fn(),
    onUploadComplete: fn(),
  },
} satisfies Meta<typeof JobFileUploadDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Before: Story = {
  args: {
    category: 'before',
  },
};

export const After: Story = {
  args: {
    category: 'after',
  },
};

export const OtherFiles: Story = {
  args: {
    category: 'other',
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
  },
};
