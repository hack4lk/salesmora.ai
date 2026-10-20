import { renderJobsPage } from "../../../../server/jobs/read-page";
export default async function JobPage({ searchParams, params }: { searchParams: Promise<Record<string, string | string[] | undefined>>; params: Promise<{ jobId: string }> }) {
  return renderJobsPage(await searchParams, (await params).jobId);
}
