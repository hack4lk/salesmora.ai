import {
  renderEstimatesPage,
  type EstimateSearchParams,
} from "../../../server/estimates/read-page";

export const dynamic = "force-dynamic";
export const metadata = { title: "Estimates" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<EstimateSearchParams>;
}) {
  return renderEstimatesPage(await searchParams);
}
