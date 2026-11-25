import { howItWorksData as copy } from './how-it-works.data';
import styles from './how-it-works.module.css';

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-it-works-heading" className={styles.section}>
      <div className={styles.wrap}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h2 id="how-it-works-heading">{copy.title}</h2>
          <p className={styles.description}>{copy.description}</p>
        </div>
        <div className={styles.steps}>
          {copy.steps.map(step => (
            <article key={step.number}>
              <span className={styles.stepLabel}>{step.number}</span>
              <h3>{step.title}</h3>
              <div className={styles.stepArt}>
                <div className={styles.stepCard}>
                  <strong>{step.cardTitle}</strong>
                  <span className={styles.stepDescription}>{step.cardDescription}</span>
                  <span className={styles.badge}>{step.badge}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
