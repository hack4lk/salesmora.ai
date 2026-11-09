import { NextResponse } from 'next/server';
import { AuthorizationAccessError } from '@salesmora/data';
import { getSession } from '../auth/session';
import { isWorkspaceSuspended, workspaceSuspendedResponse } from '../http/suspension';

export async function readReportHttp<T>(request: Request, options: {
  name: string;
  parseQuery: (raw: unknown) => { success: true; data: T } | { success: false };
  read: (userId: string, query: T) => Promise<unknown>;
}) {
  const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' };
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Sign in to view reports.' }, { status: 401, headers });
  const invalid = () => NextResponse.json({ error: `Choose a valid ${options.name} report request.` }, { status: 422, headers });
  const params = new URL(request.url).searchParams;
  const queries = params.getAll('query');
  if (queries.length !== 1 || [...params.keys()].some(key => key !== 'query')) return invalid();
  if (queries[0]!.length > 16000) return NextResponse.json({ error: 'Report filters are too large.' }, { status: 413, headers });
  let raw: unknown;
  try { raw = JSON.parse(queries[0]!); }
  catch (error) { if (!(error instanceof SyntaxError)) throw error; return invalid(); }
  const parsed = options.parseQuery(raw);
  if (!parsed.success) return invalid();
  try {
    return NextResponse.json(await options.read(session.user.id, parsed.data), { headers });
  } catch (error) {
    if (isWorkspaceSuspended(error)) return workspaceSuspendedResponse();
    if (error instanceof AuthorizationAccessError) return NextResponse.json({ error: 'This report is unavailable.' }, { status: 404, headers });
    if (error instanceof RangeError) return NextResponse.json({ error: 'Check the report period and selections.' }, { status: 422, headers });
    console.error(`${options.name} report could not be loaded or failed server contract validation.`);
    return NextResponse.json({ error: `${options.name} report could not be loaded. Try again.` }, { status: 500, headers });
  }
}
