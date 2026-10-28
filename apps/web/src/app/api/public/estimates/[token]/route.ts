import { NextResponse } from "next/server";
import { publicEstimateHeaders, publicEstimateSource } from "../../../../../server/estimates/public";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { source, status } = await publicEstimateSource(token);
  return NextResponse.json(source, {
    status, headers: { ...publicEstimateHeaders, ...(status === 429 ? { "Retry-After": "60" } : {}) },
  });
}
