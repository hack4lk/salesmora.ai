import { useState, useCallback } from 'react';

export interface UploadProgress {
  fileId?: string;
  fileName: string;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'processing' | 'success' | 'error';
  error?: string;
}

export interface FileUploadOptionsV2 {
  workspaceId: string;
  entityType: 'work_order' | 'job';
  entityId: string;
}

/**
 * Generic hook for managing file uploads to work orders and jobs
 * Handles FormData submission, progress tracking, and error handling
 */
export function useFileUploadV2(options: FileUploadOptionsV2) {
  const [uploads, setUploads] = useState<Record<string, UploadProgress>>({});
  const [isLoading, setIsLoading] = useState(false);

  const uploadFile = useCallback(
    async (
      file: File,
      category: 'before' | 'after' | 'other',
      caption?: string
    ): Promise<{ fileId: string; name: string } | null> => {
      const uploadId = `${Date.now()}-${Math.random()}`;
      
      setUploads((prev) => ({
        ...prev,
        [uploadId]: {
          fileName: file.name,
          progress: 0,
          status: 'uploading',
        },
      }));

      try {
        setIsLoading(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('workspaceId', options.workspaceId);
        formData.append('category', category);
        if (caption) {
          formData.append('caption', caption);
        }

        // Build API endpoint based on entity type
        const apiEndpoint = options.entityType === 'work_order'
          ? `/api/work-orders/${options.entityId}/files`
          : `/api/jobs/${options.entityId}/files`;

        const response = await fetch(apiEndpoint, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }

        const result = await response.json();

        setUploads((prev) => ({
          ...prev,
          [uploadId]: {
            fileId: result.fileId,
            fileName: result.name,
            progress: 100,
            status: 'processing',
          },
        }));

        return {
          fileId: result.fileId,
          name: result.name,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        setUploads((prev) => ({
          ...prev,
          [uploadId]: {
            fileName: file.name,
            progress: 0,
            status: 'error',
            error: errorMessage,
          },
        }));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [options.workspaceId, options.entityType, options.entityId]
  );

  const clearUpload = useCallback((uploadId: string) => {
    setUploads((prev) => {
      const newUploads = { ...prev };
      delete newUploads[uploadId];
      return newUploads;
    });
  }, []);

  const getUpload = useCallback((uploadId: string) => {
    return uploads[uploadId];
  }, [uploads]);

  return {
    uploadFile,
    uploads,
    getUpload,
    clearUpload,
    isLoading,
  };
}
