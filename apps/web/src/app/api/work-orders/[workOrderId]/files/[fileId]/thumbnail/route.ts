import 'server-only';
import { NextResponse } from 'next/server';
import { createStorageAdapter } from '@salesmora/data';
import { getSession } from '../../../../../../../server/auth/session';
import { database } from '../../../../../../../server/workspaces/store';
import { AuthorizationAccessError } from '@salesmora/data';

const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' };

/**
 * GET /api/work-orders/[workOrderId]/files/[fileId]/thumbnail
 * Retrieve thumbnail for a file (if available)
 * 
 * Query params:
 *   - workspace: string (workspaceId)
 * 
 * Returns: Image binary data (WebP) or 404 if no thumbnail
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ workOrderId: string; fileId: string }> }
) {
  const { workOrderId, fileId } = await params;

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
        { error: 'Missing workspace parameter' },
        { status: 400, headers }
      );
    }

    const db = database();
    const storage = createStorageAdapter();

    // Get file record - FileStore will validate workspace access
    const fileRow = await db('files')
      .where({ id: fileId, workspaceId, deletedAt: null })
      .first();

    if (!fileRow) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404, headers }
      );
    }

    // Check if thumbnail exists
    if (!fileRow.thumbnailStorageKey) {
      return NextResponse.json(
        { error: 'No thumbnail available for this file' },
        { status: 404, headers }
      );
    }

    // Retrieve thumbnail from storage (encrypted)
    // TODO: Decrypt thumbnail if needed
    const thumbnailBuffer = await storage.get(fileRow.thumbnailStorageKey);

    return new NextResponse(Buffer.from(thumbnailBuffer), {
      status: 200,
      headers: {
        ...headers,
        'Content-Type': 'image/webp',
        'Content-Length': thumbnailBuffer.length.toString(),
        'Cache-Control': 'public, max-age=86400', // Cache for 1 day
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
    console.error('[FileAPI] GET /files/:fileId/thumbnail error:', message);
    return NextResponse.json(
      { error: 'Could not retrieve thumbnail.' },
      { status: 500, headers }
    );
  }
}
