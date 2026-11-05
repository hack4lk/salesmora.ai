import { createReadStream } from 'node:fs';
import { NextResponse, type NextRequest } from 'next/server';
import { getSession } from '../../../../../server/auth/session';
import {
  cleanupOwnerWorkspaceExportDownload,
  prepareOwnerWorkspaceExportDownload,
  WorkspaceExportDownloadBusyError,
  WorkspaceExportUnavailableError,
} from '../../../../../server/workspace-exports';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const requestIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const responseHeaders = {
  'cache-control': 'no-store, private',
  'content-security-policy': "default-src 'none'; frame-ancestors 'none'",
  'referrer-policy': 'no-referrer',
  'x-content-type-options': 'nosniff',
  'cross-origin-resource-policy': 'same-origin',
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ requestId: string }> },
) {
  if (request.nextUrl.searchParams.size) {
    return NextResponse.json({ error: 'Invalid workspace export request.' }, { status: 400, headers: responseHeaders });
  }
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Sign in to your SalesMora.ai account to download this export.' }, {
      status: 401,
      headers: responseHeaders,
    });
  }
  const { requestId } = await context.params;
  if (!requestIdPattern.test(requestId)) {
    return NextResponse.json({ error: 'This workspace export is unavailable or has expired.' }, {
      status: 404,
      headers: responseHeaders,
    });
  }

  let download: Awaited<ReturnType<typeof prepareOwnerWorkspaceExportDownload>>;
  try {
    download = await prepareOwnerWorkspaceExportDownload(requestId, session.user.id);
  } catch (error) {
    if (error instanceof WorkspaceExportUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: responseHeaders });
    }
    if (error instanceof WorkspaceExportDownloadBusyError) {
      return NextResponse.json({ error: error.message }, {
        status: 429,
        headers: { ...responseHeaders, 'retry-after': '30' },
      });
    }
    console.error(JSON.stringify({
      event: 'web.workspace_export_download_failed',
      requestId,
      error: error instanceof Error ? error.name : 'UnknownError',
    }));
    return NextResponse.json({ error: 'The workspace export could not be prepared for download.' }, {
      status: 503,
      headers: responseHeaders,
    });
  }

  const fileStream = createReadStream(download.filePath);
  fileStream.once('close', () => {
    void cleanupOwnerWorkspaceExportDownload(download.directory)
      .catch(error => {
        console.error(JSON.stringify({
          event: 'web.workspace_export_temp_cleanup_failed',
          requestId,
          error: error instanceof Error ? error.name : 'UnknownError',
        }));
      })
      .finally(download.release);
  });
  const iterator = fileStream[Symbol.asyncIterator]();
  const body = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const chunk = await iterator.next();
        if (chunk.done) controller.close();
        else controller.enqueue(chunk.value);
      } catch (error) {
        controller.error(error);
      }
    },
    async cancel() {
      fileStream.destroy();
      await iterator.return?.();
    },
  });
  return new Response(body, {
    headers: {
      ...responseHeaders,
      'content-type': 'application/zip',
      'content-disposition': `attachment; filename="salesmora-workspace-export-${requestId}.zip"`,
      'content-length': String(download.size),
    },
  });
}
