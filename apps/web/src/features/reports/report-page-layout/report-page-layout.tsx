'use client';

import { useState, type ComponentProps } from 'react';
import { SeafoamButton, SeafoamOutlineButton } from '@salesmora/ui';
import { ReportTemplates } from '../report-templates/report-templates';
import { ReportExportActionContext } from './report-export-action.context';

type Props = Omit<ComponentProps<typeof ReportTemplates>, 'listDialog'> & {
  canRead: boolean;
  canExport: boolean;
  onExport: () => void;
};

export function ReportPageLayout({ canRead, canExport, onExport, children, ...templates }: Props) {
  const [templatesOpen, setTemplatesOpen] = useState(false);
  if (!canRead) return children;
  return <ReportExportActionContext.Provider value>
    <div className="grid min-w-0">
      <div className="px-4 pt-4 sm:px-8">
        <nav aria-label="Report actions" className={`flex flex-wrap justify-end gap-3 border-b border-line pb-4${templates.area === 'overview' ? ' mx-auto max-w-6xl' : ''}`}>
          <SeafoamOutlineButton label="My Templates" onClick={() => setTemplatesOpen(true)} />
          <SeafoamButton label="Export Report Data" disabled={!canExport} onClick={onExport} />
        </nav>
      </div>
      <ReportTemplates {...templates}
        listDialog={{ open: templatesOpen, onOpen: () => setTemplatesOpen(true), onClose: () => setTemplatesOpen(false) }}>
        {children}
      </ReportTemplates>
    </div>
  </ReportExportActionContext.Provider>;
}
