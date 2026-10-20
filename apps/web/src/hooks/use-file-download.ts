import { useState, useCallback } from 'react';

export interface FileDownloadOptions {
  workspaceId: string;
  workOrderId: string;
}

/**
 * Hook for downloading files from work orders
 * Handles file retrieval and browser download
 */
export function useFileDownload(options: FileDownloadOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadFile = useCallback(
    async (fileId: string, fileName: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `/api/work-orders/${options.workOrderId}/files/${fileId}?workspace=${options.workspaceId}`,
          {
            method: 'GET',
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Download failed');
        }

        // Create blob and trigger download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Download failed';
        setError(errorMessage);
        console.error('[FileDownload]', errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [options.workspaceId, options.workOrderId]
  );

  const getThumbnailUrl = useCallback(
    (fileId: string) => {
      return `/api/work-orders/${options.workOrderId}/files/${fileId}/thumbnail?workspace=${options.workspaceId}`;
    },
    [options.workspaceId, options.workOrderId]
  );

  return {
    downloadFile,
    getThumbnailUrl,
    isLoading,
    error,
  };
}
