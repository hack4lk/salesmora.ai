import type { WorkOrderRowView } from '@salesmora/contracts';
import type { WorkOrderView } from './work-order-preview.types';

/** Maps the live row DTO onto the approved component view model. */
export const toView = ({ arrivalWindow, ...row }: WorkOrderRowView): WorkOrderView => ({ ...row, scheduledWindow: arrivalWindow });
