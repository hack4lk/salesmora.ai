import { PrivacyDocument } from '../privacy-document/privacy-document';
import { SiteFooter, type SiteFooterProps } from '../site-footer/site-footer';
import { SiteHeader, type SiteHeaderProps } from '../site-header/site-header';
import { TermsDocument } from '../terms-document/terms-document';
import styles from '../site-skip-link.module.css';

export interface LegalPageProps {
  document: 'terms' | 'privacy';
  links: SiteHeaderProps['links'] & Extract<SiteFooterProps, { context: 'marketing' }>['links'];
  year: number;
}

export function LegalPage({ document, links, year }: LegalPageProps) {
  return (
    <>
      <a href="#main" className={styles.skip}>Skip to content</a>
      <SiteHeader links={links} />
      {document === 'terms' ? <TermsDocument /> : <PrivacyDocument />}
      <SiteFooter context="marketing" links={links} year={year} currentPage={document} />
    </>
  );
}
