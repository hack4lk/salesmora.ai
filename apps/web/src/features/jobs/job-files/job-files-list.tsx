'use client';

import { useState, useEffect } from 'react';
import type { WorkOrderPhoto } from '../../work-orders/work-order-preview.types';

export interface JobFilesListProps {
  jobId: string;
  workspaceId: string;
  refreshTrigger?: number;
  initialFiles?: WorkOrderPhoto[];
}

/**
 * Component to display files for a job
 */
export function JobFilesList({ jobId, workspaceId, refreshTrigger, initialFiles }: JobFilesListProps) {
  const [files, setFiles] = useState<WorkOrderPhoto[]>(initialFiles || []);
  const [isLoading, setIsLoading] = useState(!initialFiles);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialFiles) {
      fetchFiles();
    }
  }, [jobId, workspaceId, refreshTrigger, initialFiles]);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/jobs/${jobId}/files?workspace=${workspaceId}`,
        { cache: 'no-store' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }

      const data = await response.json();
      setFiles(data.files || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center text-muted py-4">Loading files...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-error py-4">
        {error}
        <button
          onClick={fetchFiles}
          className="ml-2 text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (files.length === 0) {
    return <div className="text-center text-muted py-4">No files uploaded yet</div>;
  }

  return (
    <div className="space-y-3">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-start gap-3 rounded border border-line p-3"
        >
          {/* Thumbnail */}
          {file.thumbnailUrl && (
            <img
              src={file.thumbnailUrl}
              alt={file.name}
              className="h-12 w-12 rounded object-cover"
            />
          )}

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-ink truncate">
              {file.name}
            </div>
            {file.caption && (
              <div className="text-xs text-muted mt-1">{file.caption}</div>
            )}
            <div className="flex items-center gap-2 mt-1 text-xs text-muted">
              <span className="capitalize">{file.category}</span>
              {file.state === 'ready' ? (
                <span className="text-success">✓ Ready</span>
              ) : file.state === 'failed' ? (
                <span className="text-error">✗ Failed</span>
              ) : (
                <span>Processing...</span>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="text-right text-xs text-muted whitespace-nowrap">
            <div>{file.uploader}</div>
            <div>{new Date(file.uploadedAt).toLocaleDateString()}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
