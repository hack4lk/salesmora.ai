import 'server-only';
import { NextResponse } from 'next/server';
import {
  createStorageAdapter,
  deserializeFileCiphertext,
  decryptFile,
} from '@salesmora/data';
import { getSession } from '../../../../../../../server/auth/session';
import { database } from '../../../../../../../server/workspaces/store';
import { AuthorizationAccessError } from '@salesmora/data';

const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' };

/**
 * GET /api/work-orders/[workOrderId]/files/[fileId]/thumbnail
 * Retrieve and decrypt thumbnail for a file
 * 
 * Query params:
 *   - workspace: string (workspaceId)
 * 
 * Returns: Decrypted image binary data (WebP) or 404 if no thumbnail
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

    // Get file record with thumbnail metadata
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
    if (!fileRow.thumbnailStorageKey || !fileRow.thumbnailEncryptedDekB64) {
      return NextResponse.json(
        { error: 'No thumbnail available for this file' },
        { status: 404, headers }
      );
    }

    // Retrieve encrypted thumbnail from storage
    const encryptedThumbnailData = await storage.get(fileRow.thumbnailStorageKey);

    // Deserialize the ciphertext
    const ciphertext = deserializeFileCiphertext(Buffer.from(encryptedThumbnailData));

    // Reconstruct the encrypted envelope from stored DEK envelope
    const dekEnvelopeBuffer = Buffer.from(fileRow.thumbnailEncryptedDekB64, 'base64');
    const dekIv = dekEnvelopeBuffer.subarray(0, 16);
    const dekAuthTag = dekEnvelopeBuffer.subarray(16, 32);
    const encryptedDek = dekEnvelopeBuffer.subarray(32);

    const envelope = {
      dekIv,
      dekAuthTag,
      encryptedDek,
      fileIv: ciphertext.fileIv,
      fileAuthTag: ciphertext.fileAuthTag,
      ciphertext: ciphertext.ciphertext,
    };

    // Decrypt the thumbnail
    const { plaintext: decryptedThumbnail } = decryptFile(envelope);

    return new NextResponse(new Uint8Array(decryptedThumbnail), {
      status: 200,
      headers: {
        ...headers,
        'Content-Type': 'image/webp',
        'Content-Length': decryptedThumbnail.length.toString(),
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
