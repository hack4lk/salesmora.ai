import 'server-only';
import { NextResponse } from 'next/server';
import { createFileStore, createStorageAdapter, FileStorageError } from '@salesmora/data';
import { getSession } from '../../../../../server/auth/session';
import { database } from '../../../../../server/workspaces/store';
import { AuthorizationAccessError } from '@salesmora/data';

const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' };

/**
 * POST /api/work-orders/[workOrderId]/files
 * Upload a file for a work order
 * 
 * Request body: FormData with:
 *   - file: File object
 *   - workspaceId: string
 *   - workOrderId: string
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
  { params }: { params: Promise<{ workOrderId: string }> }
) {
  const { workOrderId } = await params;

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

    // Validate inputs
    if (!file || !workspaceId || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: file, workspaceId, category' },
        { status: 400, headers }
      );
    }

    if (!['before', 'after', 'other'].includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category. Must be: before, after, or other' },
        { status: 400, headers }
      );
    }

    // Convert File to Buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const db = database();
    const storage = createStorageAdapter();
    const fileStore = await createFileStore(db, storage);

    // Upload file - FileStore will validate workspace access
    const fileRecord = await fileStore.uploadFile(
      {
        userId: session.user.id,
        workspaceId,
        permissions: {},
      },
      {
        entityType: 'work_order',
        entityId: workOrderId,
        name: file.name,
        mimeType: file.type,
        data: fileBuffer,
        categoryTag: category,
        caption: caption,
      }
    );

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
      return NextResponse.json(
        { error: 'You do not have permission to upload files to this work order.' },
        { status: 403, headers }
      );
    }

    if (error instanceof FileStorageError) {
      const status = error.message.includes('quota') ? 413 : error.message.includes('type') ? 415 : 400;
      return NextResponse.json(
        { error: error.message },
        { status, headers }
      );
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[FileAPI] POST /files error:', message);
    return NextResponse.json(
      { error: 'Could not upload file. Please try again.' },
      { status: 500, headers }
    );
  }
}
