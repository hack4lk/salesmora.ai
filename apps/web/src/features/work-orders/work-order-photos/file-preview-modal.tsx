'use client';

import { useState, useEffect } from 'react';
import type { WorkOrderPhoto } from '../work-order-preview.types';
import { useFileDownload } from '../../../hooks/use-file-download';

export interface FilePreviewModalProps {
  isOpen: boolean;
  workspaceId: string;
  workOrderId: string;
  file: WorkOrderPhoto | null;
  onClose: () => void;
}

/**
 * Modal for previewing files
 * Shows thumbnails for images, allows download, displays file info
 */
export function FilePreviewModal({
  isOpen,
  workspaceId,
  workOrderId,
  file,
  onClose,
}: FilePreviewModalProps) {
  const [imageError, setImageError] = useState(false);
  const { downloadFile, getThumbnailUrl, isLoading } = useFileDownload({
    workspaceId,
    workOrderId,
  });

  if (!isOpen || !file) return null;

  const isImage = file.kind === 'image';
  const thumbnailUrl = file.thumbnailUrl;
  const when = new Date(file.uploadedAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const handleDownload = () => {
    downloadFile(file.id, file.name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl max-h-[90vh] rounded-lg bg-paper shadow-lg flex flex-col">
        {/* Header */}
        <div className="border-b border-line px-6 py-4 flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="m-0 text-lg font-semibold truncate">{file.name}</h2>
            {file.caption && (
              <p className="m-0 mt-1 text-sm text-muted">{file.caption}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-2xl font-light text-muted hover:text-ink"
          >
            ×
          </button>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-auto px-6 py-4 flex items-center justify-center bg-canvas">
          {isImage && thumbnailUrl && !imageError ? (
            <img
              src={thumbnailUrl}
              alt={file.name}
              onError={() => setImageError(true)}
              className="max-h-full max-w-full object-contain rounded"
            />
          ) : isImage ? (
            <div className="flex flex-col items-center gap-2 text-muted">
              <div className="text-6xl">🖼️</div>
              <p className="text-sm">Image preview not available</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted">
              <div className="text-6xl">📄</div>
              <p className="text-sm">
                {file.kind === 'document' ? 'Document preview not available' : 'File'}
              </p>
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="border-t border-line px-6 py-3 bg-paper text-xs text-muted space-y-1">
          <p className="m-0">
            <strong>Uploaded by:</strong> {file.uploader}
          </p>
          <p className="m-0">
            <strong>Date:</strong> {when}
          </p>
          {file.state === 'scanning' && (
            <p className="m-0 text-primary">
              <strong>Status:</strong> Security scan pending...
            </p>
          )}
          {file.state === 'failed' && (
            <p className="m-0 text-error">
              <strong>Status:</strong> Upload failed
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-line px-6 py-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted"
          >
            Close
          </button>
          {file.state === 'ready' && (
            <button
              onClick={handleDownload}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium bg-primary text-white rounded disabled:opacity-50"
            >
              {isLoading ? 'Downloading...' : 'Download'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
