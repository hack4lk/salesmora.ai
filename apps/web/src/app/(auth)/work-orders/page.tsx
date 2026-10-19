import { renderWorkOrdersPage } from "../../../server/work-orders/read-page";
export default async function WorkOrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return renderWorkOrdersPage(await searchParams);
}
