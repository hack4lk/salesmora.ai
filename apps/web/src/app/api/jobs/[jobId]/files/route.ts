import 'server-only';
import { NextResponse } from 'next/server';
import { createFileStore, createStorageAdapter, FileStorageError } from '@salesmora/data';
import { getSession } from '../../../../../server/auth/session';
import { database } from '../../../../../server/workspaces/store';
import { AuthorizationAccessError } from '@salesmora/data';
import type { WorkOrderPhoto } from '../../../../../features/work-orders/work-order-preview.types';

const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' };

/**
 * GET /api/jobs/[jobId]/files
 * Retrieve all files for a job
 * 
 * Query params:
 *   - workspace: workspaceId (required)
 * 
 * Returns:
 * {
 *   files: WorkOrderPhoto[]
 * }
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: 'Sign in to access files.' },
      { status: 401, headers }
    );
  }

  try {
    const url = new URL(request.url);
    const workspaceId = url.searchParams.get('workspace');

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Missing required query parameter: workspace' },
        { status: 400, headers }
      );
    }

    const db = database();

    // Query files with user names using raw query for better control
    const fileRecords = await db('files as f')
      .leftJoin('users as u', 'u.id', 'f.uploadedByUserId')
      .where({
        'f.workspaceId': workspaceId,
        'f.entityType': 'job',
        'f.entityId': jobId,
        'f.deletedAt': null,
      })
      .orderBy('f.createdAt', 'desc')
      .select('f.*', 'u.name as uploaderName');

    // Transform to WorkOrderPhoto format (reusing type)
    const files = fileRecords.map((row: any) => {
      const isImage = row.mimeType?.startsWith('image/');
      return {
        id: row.id,
        name: row.name,
        kind: isImage ? 'image' : 'document',
        category: (row.categoryTag ?? 'other') as 'before' | 'after' | 'other',
        caption: row.caption ?? '',
        uploader: row.uploaderName ?? 'User',
        uploadedAt: new Date(row.createdAt).toISOString(),
        state: row.status as 'ready' | 'failed',
        thumbnailUrl: row.status === 'ready' && isImage ? `/api/jobs/${jobId}/files/${row.id}/thumbnail?workspace=${workspaceId}` : null,
        canRemove: true,
      } as WorkOrderPhoto;
    });

    return NextResponse.json(
      { files },
      { status: 200, headers }
    );
  } catch (error) {
    if (error instanceof AuthorizationAccessError) {
      return NextResponse.json(
        { error: 'You do not have permission to access files for this job.' },
        { status: 403, headers }
      );
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[JobFileAPI] GET /files error:', message);
    return NextResponse.json(
      { error: 'Could not retrieve files. Please try again.' },
      { status: 500, headers }
    );
  }
}

/**
 * POST /api/jobs/[jobId]/files
 * Upload a file for a job
 * 
 * Request body: FormData with:
 *   - file: File object
 *   - workspaceId: string
 *   - jobId: string
 *   - category: 'before' | 'after' | 'other'
 *   - caption?: string
 * 
 * Returns:
 * {
 *   success: boolean
 *   fileId: string (UUID)
 *   name: string
 *   message: string
 * }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: 'Sign in to upload files.' },
      { status: 401, headers }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const workspaceId = formData.get('workspaceId') as string | null;
    const category = formData.get('category') as string | null;
    const caption = (formData.get('caption') as string | null) ?? '';

    console.log('[JobFileAPI] POST request:', { fileName: file?.name, fileSize: file?.size, workspaceId, category });

    // Validate inputs
    if (!file || !workspaceId || !category) {
      console.error('[JobFileAPI] Validation failed: missing fields');
      return NextResponse.json(
        { error: 'Missing required fields: file, workspaceId, category' },
        { status: 400, headers }
      );
    }

    if (!['before', 'after', 'other'].includes(category)) {
      console.error('[JobFileAPI] Invalid category:', category);
      return NextResponse.json(
        { error: 'Invalid category. Must be: before, after, or other' },
        { status: 400, headers }
      );
    }

    // Convert File to Buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    console.log('[JobFileAPI] File converted to buffer:', fileBuffer.length, 'bytes');

    const db = database();
    const storage = createStorageAdapter();
    const fileStore = await createFileStore(db, storage);

    console.log('[JobFileAPI] Calling fileStore.uploadFile()...');

    // Upload file - FileStore will validate workspace access
    const fileRecord = await fileStore.uploadFile(
      {
        userId: session.user.id,
        workspaceId,
        permissions: {},
      },
      {
        entityType: 'job',
        entityId: jobId,
        name: file.name,
        mimeType: file.type,
        data: fileBuffer,
        categoryTag: category,
        caption: caption,
      }
    );

    console.log('[JobFileAPI] Upload successful:', { fileId: fileRecord.id, status: fileRecord.status });

    // Log file upload activity
    try {
      await db('jobActivity').insert({
        id: crypto.randomUUID(),
        jobId: jobId,
        workspaceId: workspaceId,
        actorId: session.user.id,
        actorName: session.user.name || 'User',
        source: 'ui',
        type: 'file_upload',
        changes: JSON.stringify({
          fileName: file.name,
          fileId: fileRecord.id,
          category: category,
        }),
        createdAt: new Date(),
      });
    } catch (activityErr) {
      console.error('[JobFileAPI] Failed to log activity:', activityErr);
      // Don't fail the upload if activity logging fails
    }

    return NextResponse.json(
      {
        success: true,
        fileId: fileRecord.id,
        name: fileRecord.name,
        message: 'File uploaded successfully. Processing will begin shortly.',
      },
      { status: 201, headers }
    );
  } catch (error) {
    if (error instanceof AuthorizationAccessError) {
      console.error('[JobFileAPI] Authorization error:', error.message);
      return NextResponse.json(
        { error: 'You do not have permission to upload files to this job.' },
        { status: 403, headers }
      );
    }

    if (error instanceof FileStorageError) {
      console.error('[JobFileAPI] FileStorageError:', error.message);
      const status = error.message.includes('quota') ? 413 : error.message.includes('type') ? 415 : 400;
      return NextResponse.json(
        { error: error.message },
        { status, headers }
      );
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[JobFileAPI] POST /files error:', message, error);
    return NextResponse.json(
      { error: 'Could not upload file. Please try again.' },
      { status: 500, headers }
    );
  }
}
