'use client';

import { useState, useEffect, useRef } from 'react';
import type { WorkOrderPhoto } from '../../work-orders/work-order-preview.types';
import { jobButton, jobPanel } from '../job-ui';
import { FileDownloadOutlined, CloseOutlined } from '@salesmora/ui';

export interface JobFilesListProps {
  jobId: string;
  workspaceId: string;
  refreshTrigger?: number;
  initialFiles?: WorkOrderPhoto[];
  canUpload?: boolean;
  onUploadClick?: () => void;
}

/**
 * Component to display files for a job
 * Polls for updates while files are processing
 */
export function JobFilesList({ jobId, workspaceId, refreshTrigger, initialFiles, canUpload = false, onUploadClick }: JobFilesListProps) {
  const [files, setFiles] = useState<WorkOrderPhoto[]>(initialFiles || []);
  const [isLoading, setIsLoading] = useState(!initialFiles);
  const [error, setError] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!initialFiles) {
      fetchFiles();
    }
    
    // Set up polling for file status updates
    startPolling();
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [jobId, workspaceId, refreshTrigger, initialFiles]);

  const startPolling = () => {
    // Poll every 2 seconds to check for status updates
    pollIntervalRef.current = setInterval(() => {
      fetchFiles();
    }, 2000);
  };

  const fetchFiles = async () => {
    try {
      if (!isLoading) setIsLoading(true);
      const response = await fetch(
        `/api/jobs/${jobId}/files?workspace=${workspaceId}`,
        { cache: 'no-store' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }

      const data = await response.json();
      const newFiles = data.files || [];
      setFiles(newFiles);
      setError(null);

      // Stop polling if no files are processing
      const hasProcessing = newFiles.some((f: WorkOrderPhoto) => f.state !== 'ready' && f.state !== 'failed');
      if (!hasProcessing && pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      setIsDeleting(fileId);
      const response = await fetch(
        `/api/jobs/${jobId}/files/${fileId}?workspace=${workspaceId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      // Refresh the file list
      await fetchFiles();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete file');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDownload = async (file: WorkOrderPhoto) => {
    try {
      const response = await fetch(
        `/api/jobs/${jobId}/files/${file.id}?workspace=${workspaceId}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to download file');
    }
  };

  if (isLoading) {
    return (
      <section className={jobPanel}>
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="m-0 text-lg font-semibold">Files</h2>
          {canUpload && onUploadClick && (
            <button className={jobButton} onClick={onUploadClick}>
              Add File
            </button>
          )}
        </header>
        <div className="text-center text-muted py-4">Loading files...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={jobPanel}>
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="m-0 text-lg font-semibold">Files</h2>
          {canUpload && onUploadClick && (
            <button className={jobButton} onClick={onUploadClick}>
              Add File
            </button>
          )}
        </header>
        <div className="text-center text-error py-4">
          {error}
          <button
            onClick={fetchFiles}
            className="ml-2 text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  if (files.length === 0) {
    return (
      <section className={jobPanel}>
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="m-0 text-lg font-semibold">Files</h2>
          {canUpload && onUploadClick && (
            <button className={jobButton} onClick={onUploadClick}>
              Add File
            </button>
          )}
        </header>
        <div className="text-center text-muted py-4">No files uploaded yet</div>
      </section>
    );
  }

  return (
    <section className={jobPanel}>
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="m-0 text-lg font-semibold">Files</h2>
        {canUpload && onUploadClick && (
          <button className={jobButton} onClick={onUploadClick}>
            Add File
          </button>
        )}
      </header>
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
                className="h-12 w-12 rounded object-cover flex-shrink-0"
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
            <div className="text-right text-xs text-muted whitespace-nowrap flex-shrink-0">
              <div>{file.uploader}</div>
              <div>{new Date(file.uploadedAt).toLocaleDateString()}</div>
            </div>

            {/* Actions */}
            {file.state === 'ready' && (
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => handleDownload(file)}
                  className="p-2 text-primary hover:bg-canvas rounded transition-colors"
                  title="Download file"
                  aria-label="Download file"
                >
                  <FileDownloadOutlined style={{ fontSize: 20 }} />
                </button>
                {file.canRemove && (
                  <button
                    onClick={() => handleDelete(file.id)}
                    disabled={isDeleting === file.id}
                    className="p-2 text-error hover:bg-canvas rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete file"
                    aria-label="Delete file"
                  >
                    <CloseOutlined style={{ fontSize: 20 }} />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
