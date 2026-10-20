'use client';

import { useState, useRef } from 'react';
import type { WorkOrderPhotoCategory } from '../work-order-preview.types';
import { useFileUpload } from '../../../hooks/use-file-upload';

export interface FileUploadDialogProps {
  isOpen: boolean;
  workspaceId: string;
  workOrderId: string;
  category: WorkOrderPhotoCategory;
  onClose: () => void;
  onUploadComplete: () => void;
}

const categoryLabels: Record<WorkOrderPhotoCategory, string> = {
  before: 'Before',
  after: 'After',
  other: 'Other files',
};

/**
 * Dialog for uploading files to work orders
 * Handles file selection, caption input, and upload submission
 */
export function FileUploadDialog({
  isOpen,
  workspaceId,
  workOrderId,
  category,
  onClose,
  onUploadComplete,
}: FileUploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { uploadFile, isLoading } = useFileUpload({
    workspaceId,
    workOrderId,
  });

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    const result = await uploadFile(selectedFile, category, caption);
    
    if (result) {
      setSelectedFile(null);
      setCaption('');
      onUploadComplete();
      onClose();
    } else {
      setError('Upload failed. Please try again.');
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setSelectedFile(null);
      setCaption('');
      setError(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-paper shadow-lg">
        <div className="border-b border-line px-6 py-4">
          <h2 className="m-0 text-lg font-semibold">
            Add {categoryLabels[category].toLowerCase()}
          </h2>
        </div>

        <div className="space-y-4 px-6 py-4">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-ink">
              Select file
            </label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              disabled={isLoading}
              className="mt-1 block w-full text-sm"
              accept="image/jpeg,image/png,image/webp,image/heic,application/pdf,.docx,.xlsx,.txt"
            />
            {selectedFile && (
              <p className="mt-1 text-xs text-muted">
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {/* Caption Input */}
          <div>
            <label className="block text-sm font-medium text-ink">
              Caption (optional)
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              disabled={isLoading}
              placeholder="Add a caption or notes..."
              className="mt-1 block w-full rounded border border-line bg-canvas px-3 py-2 text-sm disabled:opacity-50"
              rows={3}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded bg-error/10 px-3 py-2 text-sm text-error">
              {error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-line px-6 py-4 flex justify-end gap-2">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-muted disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isLoading}
            className="px-4 py-2 text-sm font-medium bg-primary text-white rounded disabled:opacity-50"
          >
            {isLoading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}
