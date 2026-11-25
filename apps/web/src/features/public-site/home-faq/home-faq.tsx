import { homeFaqData as copy } from './home-faq.data';
import styles from './home-faq.module.css';

export function HomeFaq() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className={styles.section}>
      <div className={styles.wrap}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h2 id="faq-heading">{copy.title}</h2>
        </div>
        <div className={styles.questions}>
          {copy.questions.map(item => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
