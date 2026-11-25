import { renderWorkflowsPage } from "../../../../../server/workflows/read-page";
export default async function BriefingPage({ params, searchParams }: {
  params: Promise<{ briefingId: string }>; searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return renderWorkflowsPage(await searchParams, (await params).briefingId);
}
