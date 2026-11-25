import { renderWorkflowsPage } from "../../../server/workflows/read-page";

export default async function WorkflowsPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return renderWorkflowsPage(await searchParams);
}
