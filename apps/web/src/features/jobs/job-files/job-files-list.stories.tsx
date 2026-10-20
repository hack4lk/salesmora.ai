import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { JobFilesList } from './job-files-list';
import type { WorkOrderPhoto } from '../../work-orders/work-order-preview.types';

const mockFiles: WorkOrderPhoto[] = [
  {
    id: 'file-1',
    name: 'foundation-inspection.jpg',
    kind: 'image',
    category: 'before',
    caption: 'Foundation before repairs',
    uploader: 'John Doe',
    uploadedAt: new Date('2026-10-20T10:00:00Z').toISOString(),
    state: 'ready',
    thumbnailUrl: 'data:image/webp;base64,UklGRiYAAABXRUJQVlA4IBIAAAAwAQCdASoCAAEADgCgyAEAfQ==',
    canRemove: true,
  },
  {
    id: 'file-2',
    name: 'progress-notes.pdf',
    kind: 'document',
    category: 'other',
    caption: 'Work progress notes',
    uploader: 'Jane Smith',
    uploadedAt: new Date('2026-10-19T14:30:00Z').toISOString(),
    state: 'ready',
    thumbnailUrl: null,
    canRemove: true,
  },
  {
    id: 'file-3',
    name: 'final-inspection.jpg',
    kind: 'image',
    category: 'after',
    caption: 'Completed work',
    uploader: 'John Doe',
    uploadedAt: new Date('2026-10-20T15:45:00Z').toISOString(),
    state: 'ready',
    thumbnailUrl: 'data:image/webp;base64,UklGRiYAAABXRUJQVlA4IBIAAAAwAQCdASoCAAEADgCgyAEAfQ==',
    canRemove: true,
  },
];

const meta = {
  title: 'Jobs/JobFilesList',
  component: JobFilesList,
  parameters: {
    layout: 'centered',
  },
  args: {
    jobId: 'job-123',
    workspaceId: 'workspace-456',
  },
} satisfies Meta<typeof JobFilesList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithFiles: Story = {
  args: {
    initialFiles: mockFiles,
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const Empty: Story = {
  args: {
    initialFiles: [],
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const Failed: Story = {
  args: {
    initialFiles: [
      {
        id: 'file-4',
        name: 'corrupted-file.jpg',
        kind: 'image',
        category: 'before',
        caption: 'Failed upload',
        uploader: 'Jane Smith',
        uploadedAt: new Date('2026-10-20T12:00:00Z').toISOString(),
        state: 'failed',
        thumbnailUrl: null,
        canRemove: true,
      },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};
