import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { adminFrameData as copy } from './admin-frame.data';
import styles from './admin-frame.module.css';
import type { AdminEnvironment } from '../../server/environment';
import { AdminSignOut } from './admin-sign-out';

export interface AdminFrameProps {
  environment: AdminEnvironment;
  activeHref?: string;
  contentWidth?: 'narrow' | 'wide';
  showNavigation?: boolean;
  children?: ReactNode;
}

export function AdminFrame({
  environment,
  activeHref = '/',
  contentWidth = 'narrow',
  showNavigation = true,
  children,
}: AdminFrameProps) {
  return (
    <div className={`${styles.frame} ${showNavigation ? styles.withNavigation : ''}`}>
      <div className={styles.environment} data-environment={environment} role="status">
        {copy.environmentLabels[environment]}
      </div>
      {showNavigation ? (
        <aside className={styles.sidebar} aria-label="Admin sidebar">
          <Link className={styles.brand} href="/" aria-label="SalesMora Admin home">
            <Image className={styles.mark} src="/branding/salesmora-logo.svg" alt={copy.brand} width={144} height={38} priority unoptimized />
            <span className={styles.tag}>Admin</span>
          </Link>
          <nav className={styles.navigation} aria-label="Admin">
            {copy.navigation.map(group => (
              <section className={styles.navGroup} key={group.label} aria-label={group.label}>
                <h2 className={styles.navLabel}>{group.label}</h2>
                {group.items.map(item => (
                  <Link
                    className={styles.navItem}
                    href={item.href}
                    key={item.href}
                    aria-current={activeHref === item.href ? 'page' : undefined}
                    data-active={activeHref === item.href}
                  >
                    {item.label}
                  </Link>
                ))}
              </section>
            ))}
          </nav>
          <AdminSignOut />
        </aside>
      ) : (
        <header className={styles.authHeader}>
          <Image className={styles.mark} src="/branding/salesmora-logo.svg" alt={copy.brand} width={144} height={38} priority unoptimized />
          <span className={styles.tag}>Admin</span>
        </header>
      )}
      <main className={styles.content} aria-labelledby="admin-title">
        <section className={`${styles.notice} ${contentWidth === 'wide' ? styles.wide : ''}`}>
          {children ?? (
            <>
              <h1 id="admin-title">{copy.title}</h1>
              <p>{copy.description}</p>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
