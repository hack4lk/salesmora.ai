import actions from '../site-actions.module.css';
import { homeCtaData as copy } from './home-cta.data';
import styles from './home-cta.module.css';

export interface HomeCtaProps {
  links: { createAccount: string; plans: string };
}

export function HomeCta({ links }: HomeCtaProps) {
  return (
    <section aria-labelledby="join-heading" className={styles.section}>
      <div className={styles.wrap}>
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <h2 id="join-heading">{copy.title}</h2>
        <p className={styles.description}>{copy.description}</p>
        <div className={styles.actions}>
          <a href={links.createAccount} className={`${actions.button} ${actions.primary}`}>{copy.createAccount}</a>
          <a href={links.plans} className={`${actions.button} ${actions.secondary}`}>{copy.plans}</a>
        </div>
      </div>
    </section>
  );
}
