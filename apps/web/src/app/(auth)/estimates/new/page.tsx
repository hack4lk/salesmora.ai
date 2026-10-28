import {
  renderNewEstimatePage,
  type EstimateEditorSearchParams,
} from "../../../../server/estimates/editor-page";

export const dynamic = "force-dynamic";
export const metadata = { title: "Create estimate" };

export default async function NewEstimatePage({
  searchParams,
}: {
  searchParams: Promise<EstimateEditorSearchParams>;
}) {
  return renderNewEstimatePage(await searchParams);
}
