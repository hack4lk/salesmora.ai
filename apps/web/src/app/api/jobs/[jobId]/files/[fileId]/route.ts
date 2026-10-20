import 'server-only';
import { NextResponse } from 'next/server';
import { createFileStore, createStorageAdapter, FileStorageError } from '@salesmora/data';
import { getSession } from '../../../../../../server/auth/session';
import { database } from '../../../../../../server/workspaces/store';
import { AuthorizationAccessError } from '@salesmora/data';

const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' };

/**
 * GET /api/jobs/[jobId]/files/[fileId]
 * Download a file with decryption
 * 
 * Query params:
 *   - workspace: string (workspaceId)
 * 
 * Returns: File binary data with appropriate Content-Type and Content-Disposition
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string; fileId: string }> }
) {
  const { jobId, fileId } = await params;

  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: 'Sign in to download files.' },
      { status: 401, headers }
    );
  }

  try {
    const url = new URL(request.url);
    const workspaceId = url.searchParams.get('workspace');

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Missing workspace parameter' },
        { status: 400, headers }
      );
    }

    const db = database();
    const storage = createStorageAdapter();
    const fileStore = await createFileStore(db, storage);

    // Download and decrypt file
    const fileBuffer = await fileStore.downloadFile(
      {
        userId: session.user.id,
        workspaceId,
        permissions: {},
      },
      fileId
    );

    // Get file metadata for headers
    const fileRow = await db('files')
      .where({ id: fileId, workspaceId, deletedAt: null })
      .first();

    if (!fileRow) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404, headers }
      );
    }

    return new NextResponse(Buffer.from(fileBuffer), {
      status: 200,
      headers: {
        ...headers,
        'Content-Type': fileRow.mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileRow.name)}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    if (error instanceof AuthorizationAccessError) {
      return NextResponse.json(
        { error: 'You do not have permission to access this file.' },
        { status: 403, headers }
      );
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[JobFileAPI] GET /files/[fileId] error:', message);
    return NextResponse.json(
      { error: 'Could not download file. Please try again.' },
      { status: 500, headers }
    );
  }
}

/**
 * DELETE /api/jobs/[jobId]/files/[fileId]
 * Delete a file for a job
 * 
 * Query params:
 *   - workspace: workspaceId (required)
 * 
 * Returns:
 * {
 *   success: boolean
 *   message: string
 * }
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ jobId: string; fileId: string }> }
) {
  const { jobId, fileId } = await params;

  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: 'Sign in to delete files.' },
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
    const storage = createStorageAdapter();
    const fileStore = await createFileStore(db, storage);

    // Soft delete the file
    await db.transaction(async (trx) => {
      await trx('files')
        .where({
          id: fileId,
          workspaceId: workspaceId,
          entityType: 'job',
          entityId: jobId,
          deletedAt: null,
        })
        .update({
          deletedAt: new Date(),
          updatedAt: new Date(),
        });
    });

    return NextResponse.json(
      {
        success: true,
        message: 'File deleted successfully.',
      },
      { status: 200, headers }
    );
  } catch (error) {
    if (error instanceof AuthorizationAccessError) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this file.' },
        { status: 403, headers }
      );
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[JobFileAPI] DELETE /files/[fileId] error:', message);
    return NextResponse.json(
      { error: 'Could not delete file. Please try again.' },
      { status: 500, headers }
    );
  }
}
