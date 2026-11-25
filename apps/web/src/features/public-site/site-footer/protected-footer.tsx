import { publicSiteLinks } from '../public-site-links';
import { SiteFooter } from './site-footer';

export function ProtectedFooter({ context = 'auth' }: { context?: 'auth' | 'workspace' }) {
  return <div className="print:hidden">
    <SiteFooter context={context} links={publicSiteLinks} year={new Date().getUTCFullYear()} />
  </div>;
}
