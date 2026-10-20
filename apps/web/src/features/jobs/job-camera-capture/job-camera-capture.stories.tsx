import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CameraCapture } from './job-camera-capture';

const meta: Meta<typeof CameraCapture> = {
  title: 'Jobs/Camera Capture',
  component: CameraCapture,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onCapture: (blob: Blob) => {
      console.log('Photo captured:', blob);
    },
    onCancel: () => {
      console.log('Camera cancelled');
    },
  },
  decorators: [
    (Story) => (
      <div className="w-96 bg-paper p-6 rounded-lg">
        <Story />
      </div>
    ),
  ],
};

export const InDialog: Story = {
  args: {
    onCapture: (blob: Blob) => {
      console.log('Photo captured:', blob);
    },
    onCancel: () => {
      console.log('Camera cancelled');
    },
  },
  decorators: [
    (Story) => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-md rounded-lg bg-paper shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Take Photo</h2>
          <Story />
        </div>
      </div>
    ),
  ],
};
