'use client';
import { workOrdersRouteData as copy } from '../../../features/work-orders/work-orders-route/work-orders-route.data';
export default function WorkOrdersError({ reset }: { reset: () => void }) {
  return <div role="alert" className="p-8"><h2 className="text-xl font-semibold">{copy.errorTitle}</h2><p>{copy.error}</p>
    <button type="button" onClick={reset} className="min-h-11 rounded-lg border border-border px-4 font-semibold">{copy.retry}</button></div>;
}
