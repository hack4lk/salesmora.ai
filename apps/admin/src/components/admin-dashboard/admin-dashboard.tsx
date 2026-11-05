import Link from 'next/link';
import { adminDashboardData as copy } from './admin-dashboard.data';
import styles from './admin-dashboard.module.css';

export function AdminDashboard() {
  return (
    <div className={styles.dashboard}>
      <p className={styles.eyebrow}>{copy.eyebrow}</p>
      <h1 id="admin-title">{copy.title}</h1>
      <p className={styles.intro}>{copy.description}</p>
      {copy.sections.map(section => (
        <section className={styles.section} key={section.title} aria-labelledby={`dashboard-${section.title}`}>
          <h2 id={`dashboard-${section.title}`}>{section.title}</h2>
          <p className={styles.sectionDescription}>{section.description}</p>
          <div className={styles.cards}>
            {section.links.map(link => (
              <Link className={styles.card} href={link.href} key={link.href}>
                <strong>{link.label}</strong>
                <span>{link.description}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
