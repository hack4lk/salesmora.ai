import { NextResponse } from "next/server";
import { estimateIdSchema } from "@salesmora/contracts";
import {
  AuthorizationAccessError,
  EstimateBusinessProfileConflict,
  EstimateBusinessProfileInvalid,
  FileStorageError,
  QuotaExceededError,
  uploadEstimateBusinessLogo,
  createStorageAdapter,
} from "@salesmora/data";
import { getSession } from "../../../../../server/auth/session";
import { database } from "../../../../../server/workspaces/store";
import { enabledPermissions } from "../../../../../server/authorization/permissions";

const headers = { "Cache-Control": "private, no-store", Vary: "Cookie" };
const requestBytesLimit = 2_300_000;
class LogoRequestTooLargeError extends Error {}

async function limitedFormData(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Logo upload body is missing.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > requestBytesLimit) {
        await reader.cancel();
        throw new LogoRequestTooLargeError();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const body = Buffer.concat(chunks, size);
  return new Request(request.url, {
    method: "POST",
    headers: request.headers,
    body,
  }).formData();
}

export async function POST(request: Request) {
  if (
    !process.env.BETTER_AUTH_URL ||
    request.headers.get("origin") !== new URL(process.env.BETTER_AUTH_URL).origin
  ) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403, headers });
  }
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in to upload a logo." }, { status: 401, headers });
  }
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data")) {
    return NextResponse.json({ error: "Use a multipart upload." }, { status: 415, headers });
  }
  const lengthHeader = request.headers.get("content-length");
  const length = lengthHeader && /^\d+$/.test(lengthHeader) ? Number(lengthHeader) : null;
  if (length !== null && length > requestBytesLimit) {
    return NextResponse.json({ error: "Logo files must be no larger than 2 MB." }, { status: 413, headers });
  }
  let form: FormData;
  try {
    form = await limitedFormData(request);
  } catch (error) {
    if (error instanceof LogoRequestTooLargeError) {
      return NextResponse.json({ error: "Logo files must be no larger than 2 MB." }, { status: 413, headers });
    }
    return NextResponse.json({ error: "Invalid logo upload." }, { status: 400, headers });
  }
  const workspaceId = form.get("workspaceId");
  const expectedVersion = Number(form.get("expectedVersion"));
  const file = form.get("file");
  const parsedWorkspace = estimateIdSchema.safeParse(workspaceId);
  if (
    !parsedWorkspace.success ||
    !Number.isSafeInteger(expectedVersion) ||
    expectedVersion < 1 ||
    !(file instanceof File)
  ) {
    return NextResponse.json({ error: "Invalid logo upload." }, { status: 400, headers });
  }
  if (file.size === 0 || file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "Logo files must be no larger than 2 MB." }, { status: 413, headers });
  }
  try {
    const result = await uploadEstimateBusinessLogo(
      database(),
      createStorageAdapter(),
      { userId: session.user.id, workspaceId: parsedWorkspace.data },
      enabledPermissions,
      expectedVersion,
      { type: file.type, data: Buffer.from(await file.arrayBuffer()) },
    );
    return NextResponse.json(result, { headers });
  } catch (error) {
    if (error instanceof AuthorizationAccessError) {
      return NextResponse.json({ error: "These settings are unavailable." }, { status: 404, headers });
    }
    if (error instanceof EstimateBusinessProfileConflict) {
      return NextResponse.json({ error: "Settings changed. Reload before uploading.", code: "conflict" }, { status: 409, headers });
    }
    if (error instanceof EstimateBusinessProfileInvalid) {
      return NextResponse.json({ error: "Choose a valid PNG, JPEG or WebP image up to 2 MB." }, { status: 422, headers });
    }
    if (error instanceof QuotaExceededError) {
      return NextResponse.json({ error: "Workspace file storage is full." }, { status: 413, headers });
    }
    if (error instanceof FileStorageError) {
      return NextResponse.json({ error: "The logo could not be stored. Try again." }, { status: 422, headers });
    }
    throw error;
  }
}
