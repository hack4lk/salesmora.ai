import {
  renderEstimatePreviewPage,
  type EstimateEditorSearchParams,
} from "../../../../../server/estimates/editor-page";

export const dynamic = "force-dynamic";
export const metadata = { title: "Estimate preview" };

export default async function EstimatePreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ estimateId: string }>;
  searchParams: Promise<EstimateEditorSearchParams>;
}) {
  const [{ estimateId }, query] = await Promise.all([params, searchParams]);
  return renderEstimatePreviewPage(estimateId, query);
}
