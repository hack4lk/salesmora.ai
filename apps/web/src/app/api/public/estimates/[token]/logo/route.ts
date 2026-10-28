import { NextResponse } from "next/server";
import { publicEstimateHeaders, publicEstimateLogo } from "../../../../../../server/estimates/public";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await publicEstimateLogo(token);
  if (result.state !== "ready") {
    return NextResponse.json({ error: "This estimate logo is unavailable." }, {
      status: result.status,
      headers: { ...publicEstimateHeaders, ...(result.status === 429 ? { "Retry-After": "60" } : {}) },
    });
  }
  return new NextResponse(new Uint8Array(result.image), {
    headers: { ...publicEstimateHeaders, "Content-Type": "image/webp" },
  });
}
