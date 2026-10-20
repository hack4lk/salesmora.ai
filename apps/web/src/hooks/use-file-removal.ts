import { useState, useCallback } from 'react';

export interface FileRemovalOptions {
  workspaceId: string;
  workOrderId: string;
}

/**
 * Hook for removing files from work orders
 */
export function useFileRemoval(options: FileRemovalOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeFile = useCallback(
    async (fileId: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `/api/work-orders/${options.workOrderId}/files/${fileId}?workspace=${options.workspaceId}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to remove file');
        }

        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to remove file';
        setError(errorMessage);
        console.error('[FileRemoval]', errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [options.workspaceId, options.workOrderId]
  );

  return {
    removeFile,
    isLoading,
    error,
  };
}
