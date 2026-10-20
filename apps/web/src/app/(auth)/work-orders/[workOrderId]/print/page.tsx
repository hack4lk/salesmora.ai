import { renderWorkOrderPrintPage } from "../../../../../server/work-orders/print-page";
export default async function WorkOrderPrintPage({ searchParams, params }: { searchParams: Promise<Record<string, string | string[] | undefined>>; params: Promise<{ workOrderId: string }> }) {
  return renderWorkOrderPrintPage(await searchParams, (await params).workOrderId);
}
