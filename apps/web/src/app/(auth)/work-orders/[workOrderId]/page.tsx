import { renderWorkOrdersPage } from "../../../../server/work-orders/read-page";
export default async function WorkOrderPage({ searchParams, params }: { searchParams: Promise<Record<string, string | string[] | undefined>>; params: Promise<{ workOrderId: string }> }) {
  return renderWorkOrdersPage(await searchParams, (await params).workOrderId);
}
