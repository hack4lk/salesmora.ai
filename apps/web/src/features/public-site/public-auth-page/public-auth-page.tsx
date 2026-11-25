import type { ReactNode } from 'react';
import { SiteFooter, type SiteFooterProps } from '../site-footer/site-footer';
import { SiteHeader, type SiteHeaderProps } from '../site-header/site-header';
import { publicSiteLinks } from '../public-site-links';
import styles from '../site-skip-link.module.css';

export interface PublicAuthPageProps {
  links?: SiteHeaderProps['links'] & Extract<SiteFooterProps, { context: 'marketing' }>['links'];
  year?: number;
  children: ReactNode;
}

export function PublicAuthPage({ links = publicSiteLinks, year = new Date().getUTCFullYear(), children }: PublicAuthPageProps) {
  return (
    <>
      <a href="#main" className={styles.skip}>Skip to content</a>
      <SiteHeader links={links} />
      {children}
      <SiteFooter context="marketing" links={links} year={year} />
    </>
  );
}
