import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { http, HttpResponse } from 'msw';
import { JobFilesList } from './job-files-list';

const mockFiles = [
  {
    id: 'file-1',
    name: 'foundation-inspection.jpg',
    kind: 'image' as const,
    category: 'before' as const,
    caption: 'Foundation before repairs',
    uploader: 'John Doe',
    uploadedAt: new Date('2026-10-20T10:00:00Z').toISOString(),
    state: 'ready' as const,
    thumbnailUrl: 'data:image/webp;base64,UklGRiYAAABXRUJQVlA4IBIAAAAwAQCdASoCAAEADgCgyAEAfQ==',
    canRemove: true,
  },
  {
    id: 'file-2',
    name: 'progress-notes.pdf',
    kind: 'document' as const,
    category: 'other' as const,
    caption: 'Work progress notes',
    uploader: 'Jane Smith',
    uploadedAt: new Date('2026-10-19T14:30:00Z').toISOString(),
    state: 'ready' as const,
    thumbnailUrl: null,
    canRemove: true,
  },
  {
    id: 'file-3',
    name: 'final-inspection.jpg',
    kind: 'image' as const,
    category: 'after' as const,
    caption: 'Completed work',
    uploader: 'John Doe',
    uploadedAt: new Date('2026-10-20T15:45:00Z').toISOString(),
    state: 'ready' as const,
    thumbnailUrl: 'data:image/webp;base64,UklGRiYAAABXRUJQVlA4IBIAAAAwAQCdASoCAAEADgCgyAEAfQ==',
    canRemove: true,
  },
];

const meta = {
  title: 'Jobs/JobFilesList',
  component: JobFilesList,
  parameters: {
    layout: 'centered',
    msw: {
      handlers: [
        http.get('/api/jobs/:jobId/files', () => {
          return HttpResponse.json({
            files: mockFiles,
          });
        }),
      ],
    },
  },
  args: {
    jobId: 'job-123',
    workspaceId: 'workspace-456',
  },
} satisfies Meta<typeof JobFilesList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithFiles: Story = {
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/jobs/:jobId/files', () => {
          return HttpResponse.json({
            files: [],
          });
        }),
      ],
    },
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const Error: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/jobs/:jobId/files', () => {
          return HttpResponse.json(
            { error: 'Failed to fetch files' },
            { status: 500 }
          );
        }),
      ],
    },
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};
