import {
  renderEstimateDetailPage,
  type EstimateEditorSearchParams,
} from "../../../../server/estimates/editor-page";

export const dynamic = "force-dynamic";
export const metadata = { title: "Estimate" };

export default async function EstimateDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ estimateId: string }>;
  searchParams: Promise<EstimateEditorSearchParams>;
}) {
  const [{ estimateId }, query] = await Promise.all([params, searchParams]);
  return renderEstimateDetailPage(estimateId, query);
}
