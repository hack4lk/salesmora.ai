import type { Metadata } from "next";
import { PublicEstimateView } from "../../../features/estimates/public-estimate-view/public-estimate-view";
import { publicEstimateSource } from "../../../server/estimates/public";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Estimate",
  robots: { index: false, follow: false, noarchive: true },
  referrer: "no-referrer",
};

export default async function PublicEstimatePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { source } = await publicEstimateSource(token);
  return <PublicEstimateView source={source} />;
}
