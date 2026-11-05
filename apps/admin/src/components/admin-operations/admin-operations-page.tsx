import type { AdminOperationsResponse } from '@salesmora/contracts';
import { adminOperationsPageData as copy } from './admin-operations-page.data';
import styles from './admin-operations-page.module.css';

const QUEUE_STATES = [
  ['waiting', 'Waiting'],
  ['active', 'Active'],
  ['delayed', 'Delayed'],
  ['failed', 'Failed'],
  ['completed', 'Completed'],
] as const;

export function AdminOperationsPage({ report }: { report: AdminOperationsResponse }) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 id="admin-title">{copy.title}</h1>
        <p>{copy.description}</p>
      </header>
      <section className={styles.queueGrid} aria-label="Background queues">
        {report.queues.map(queue => (
          <article className={styles.panel} key={queue.name}>
            <h2>{queue.name}</h2>
            <p className={styles.workers}>Active workers <strong>{queue.workers}</strong></p>
            <dl className={styles.counts}>
              {QUEUE_STATES.map(([key, label]) => (
                <div key={key}>
                  <dt>{label}</dt>
                  <dd>{queue.counts[key].toLocaleString('en-US')}</dd>
                </div>
              ))}
            </dl>
            <p className={styles.failureNote}>Failed count includes jobs awaiting an operator decision. No job IDs, payloads, or raw failure details are exposed.</p>
          </article>
        ))}
      </section>
      <section className={styles.outboxes} aria-label="Notification delivery outboxes">
        <h2>Notification delivery</h2>
        <div className={styles.outboxGrid}>
          {report.outboxes.map(outbox => (
            <article className={styles.outbox} key={outbox.name}>
              <h3>{outbox.name}</h3>
              {outbox.statuses.length === 0 ? <p>{copy.emptyStatuses}</p> : (
                <ul>
                  {outbox.statuses.map(item => (
                    <li key={item.status}><span>{item.status}</span><strong>{item.count.toLocaleString('en-US')}</strong></li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </section>
      <p className={styles.asOf}>Snapshot as of {new Date(report.asOf).toLocaleString('en-US', { timeZone: 'UTC', timeZoneName: 'short' })}.</p>
    </div>
  );
}
