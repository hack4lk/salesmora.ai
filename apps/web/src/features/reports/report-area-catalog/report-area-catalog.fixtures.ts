import type { ReportAreaCatalogItem } from './report-area-catalog';
import { reportAreaDefinitions } from './report-area-catalog.definitions';

export const reportAreaCatalogAreas: readonly ReportAreaCatalogItem[] = reportAreaDefinitions.map(area => ({
  ...area, access: area.id === 'financial'
    ? { allowed: false, reason: 'Financial report and applicable money permissions required.' }
    : { allowed: true, templateCount: area.id === 'overview' ? 2 : area.id === 'leads' ? 1 : 0 },
}));
