import { NextResponse } from "next/server";
import {
  AuthorizationAccessError,
  EstimateExportEmptyError,
  EstimateExportLimitError,
} from "@salesmora/data";
import { estimateExportRequestSchema } from "@salesmora/contracts";
import { estimateHeaders, estimateRequest } from "../../../../server/estimates/http";
import {
  exportWorkspaceEstimates,
  previewWorkspaceEstimateExport,
} from "../../../../server/estimates/export";

export const runtime = "nodejs";
export const maxDuration = 40;
const exportHeaders = {
  ...estimateHeaders,
  "X-Content-Type-Options": "nosniff",
};

function failure(error: unknown) {
  if (error instanceof AuthorizationAccessError) {
    return NextResponse.json(
      { error: "Export is unavailable or you no longer have permission." },
      { status: 404, headers: exportHeaders },
    );
  }
  if (error instanceof EstimateExportLimitError) {
    return NextResponse.json(
      { error: "This export exceeds the row limit. Narrow your filters; no rows were omitted." },
      { status: 422, headers: exportHeaders },
    );
  }
  if (error instanceof EstimateExportEmptyError) {
    return NextResponse.json(
      { error: "No estimates match these filters." },
      { status: 422, headers: exportHeaders },
    );
  }
  return NextResponse.json(
    { error: "The export could not be completed. Try again." },
    { status: 500, headers: exportHeaders },
  );
}

export function POST(request: Request) {
  return estimateRequest(
    request,
    async (identity, body) => {
      const input = estimateExportRequestSchema.safeParse(body);
      if (!input.success) {
        return NextResponse.json(
          { error: "Invalid Estimate export filters." },
          { status: 400, headers: exportHeaders },
        );
      }
      try {
        const preview = await previewWorkspaceEstimateExport(
          identity.userId,
          input.data,
        );
        return NextResponse.json(preview, { headers: exportHeaders });
      } catch (error) {
        return failure(error);
      }
    },
    true,
    (body) => {
      const input = estimateExportRequestSchema.safeParse(body);
      return input.success ? input.data.query.workspaceId : null;
    },
  );
}

export function GET(request: Request) {
  const origin =
    process.env.BETTER_AUTH_URL &&
    new URL(process.env.BETTER_AUTH_URL).origin;
  if (
    !origin ||
    request.headers.get("x-salesmora-export") !== "1" ||
    (request.headers.get("origin") &&
      request.headers.get("origin") !== origin) ||
    request.headers.get("sec-fetch-site") === "cross-site"
  ) {
    return NextResponse.json(
      { error: "Invalid export request." },
      { status: 403, headers: exportHeaders },
    );
  }
  return estimateRequest(request, async (identity) => {
    let raw: unknown;
    try {
      const url = new URL(request.url);
      const params = url.searchParams;
      if (
        url.href.length > 24_000 ||
        params.getAll("workspace").length !== 1 ||
        params.getAll("request").length !== 1 ||
        [...params.keys()].some(
          (key) => key !== "workspace" && key !== "request",
        )
      ) {
        throw new Error();
      }
      raw = JSON.parse(params.get("request")!);
    } catch {
      return NextResponse.json(
        { error: "Invalid Estimate export filters." },
        { status: 400, headers: exportHeaders },
      );
    }
    const input = estimateExportRequestSchema.safeParse(raw);
    if (!input.success || input.data.query.workspaceId !== identity.workspaceId) {
      return NextResponse.json(
        { error: "Invalid Estimate export filters." },
        { status: 400, headers: exportHeaders },
      );
    }
    try {
      const result = await exportWorkspaceEstimates(
        identity.userId,
        input.data,
        request.signal,
      );
      return new Response(result.stream, {
        headers: {
          ...exportHeaders,
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="salesmora-estimates-${new Date().toISOString().slice(0, 10)}.csv"`,
          "X-Export-Count": String(result.count),
          "X-Accel-Buffering": "no",
        },
      });
    } catch (error) {
      return failure(error);
    }
  });
}
