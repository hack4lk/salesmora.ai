import { renderJobsPage } from "../../../server/jobs/read-page";
export default async function JobsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return renderJobsPage(await searchParams);
}
