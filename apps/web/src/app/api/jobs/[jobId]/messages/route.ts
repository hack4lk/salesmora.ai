import 'server-only';
import { NextResponse } from 'next/server';
import { getJobMessages, createJobMessage } from '@salesmora/data';
import { enabledPermissions } from '../../../../../server/authorization/permissions';
import { getSession } from '../../../../../server/auth/session';
import { database, findWorkspace } from '../../../../../server/workspaces/store';

const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' };

/**
 * GET /api/jobs/[jobId]/messages
 * Fetch messages for a job
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: 'Sign in to view messages.' },
      { status: 401, headers }
    );
  }

  try {
    const url = new URL(request.url);
    const workspaceId = url.searchParams.get('workspace');
    const limit = parseInt(url.searchParams.get('limit') || '100', 10);

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Missing required query parameter: workspace' },
        { status: 400, headers }
      );
    }

    const workspace = await findWorkspace(session.user.id, workspaceId);
    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 403, headers }
      );
    }

    const db = database();
    const messages = await getJobMessages(
      db,
      { userId: session.user.id, workspaceId },
      enabledPermissions,
      jobId,
      Math.min(limit, 500)
    );

    return NextResponse.json(
      { messages },
      { status: 200, headers }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[JobMessagesAPI] GET error:', message);
    return NextResponse.json(
      { error: 'Could not fetch messages. Please try again.' },
      { status: 500, headers }
    );
  }
}

/**
 * POST /api/jobs/[jobId]/messages
 * Create a new message for a job
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: 'Sign in to send messages.' },
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

    const workspace = await findWorkspace(session.user.id, workspaceId);
    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 403, headers }
      );
    }

    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Message text is required' },
        { status: 400, headers }
      );
    }

    const db = database();
    const result = await createJobMessage(
      db,
      { userId: session.user.id, workspaceId },
      enabledPermissions,
      jobId,
      text
    );

    return NextResponse.json(
      result,
      { status: 201, headers }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[JobMessagesAPI] POST error:', message);
    return NextResponse.json(
      { error: 'Could not send message. Please try again.' },
      { status: 500, headers }
    );
  }
}
