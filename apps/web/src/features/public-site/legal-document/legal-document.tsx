import type { ReactNode } from 'react';
import styles from './legal-document.module.css';

export interface LegalDocumentSection {
  id: string;
  title: string;
  paragraphs: readonly ReactNode[];
}

export interface LegalDocumentProps {
  title: string;
  contentsLabel: string;
  documentLabel: string;
  metadata: string;
  notice: { title: string; description: string };
  sections: readonly LegalDocumentSection[];
}

export function LegalDocument({ title, contentsLabel, documentLabel, metadata, notice, sections }: LegalDocumentProps) {
  return (
    <main id="main" className={styles.main}>
      <div className={styles.intro}>
        <div className={styles.wrap}><h1>{title}</h1><div className={styles.metadata}>{metadata}</div></div>
      </div>
      <div className={`${styles.wrap} ${styles.layout}`}>
        <nav className={styles.toc} aria-label={contentsLabel}>
          <h2>On this page</h2>
          <ol>{sections.map(section => <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}</ol>
        </nav>
        <article className={styles.document} aria-label={documentLabel}>
          <div className={styles.notice}><strong>{notice.title}</strong><p>{notice.description}</p></div>
          {sections.map((section, index) => (
            <section id={section.id} key={section.id} className={styles.documentSection}>
              <h2>{index + 1}. {section.title}</h2>
              {section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
            </section>
          ))}
        </article>
      </div>
    </main>
  );
}
