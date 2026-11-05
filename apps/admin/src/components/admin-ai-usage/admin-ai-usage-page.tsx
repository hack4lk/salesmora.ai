import Link from 'next/link';
import type { AdminAIUsagePeriod, AdminAIUsageResponse } from '@salesmora/contracts';
import { adminAIUsagePageData as copy } from './admin-ai-usage-page.data';
import styles from './admin-ai-usage-page.module.css';

function number(value: string) {
  return BigInt(value).toLocaleString('en-US');
}

function cost(value: string | null) {
  return value === null ? 'Unavailable' : `$${Number(value).toFixed(2)}`;
}

function Table({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: (string | number)[][];
}) {
  return (
    <section className={styles.panel} aria-label={title}>
      <h2>{title}</h2>
      {rows.length === 0 ? <p className={styles.empty}>No calls recorded in this period.</p> : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr>{headers.map(header => <th key={header} scope="col">{header}</th>)}</tr></thead>
            <tbody>{rows.map((row, index) => (
              <tr key={`${String(row[0])}-${index}`}>{row.map((cell, cellIndex) =>
                <td key={`${cellIndex}-${String(cell)}`}>{cell}</td>)}</tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function AdminAIUsagePage({ report }: { report: AdminAIUsageResponse }) {
  const totals = report.summary;
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 id="admin-title">{copy.title}</h1>
          <p>{copy.description}</p>
        </div>
        <nav className={styles.periods} aria-label="AI usage period">
          {copy.periods.map(period => (
            <Link
              className={styles.period}
              href={`/ai-usage?period=${period.value}`}
              key={period.value}
              aria-current={report.period === period.value ? 'page' : undefined}
            >
              {period.label}
            </Link>
          ))}
        </nav>
      </header>
      <section className={styles.metrics} aria-label="AI usage summary">
        <div className={styles.metric}><span>Recorded calls</span><strong>{totals.calls.toLocaleString('en-US')}</strong></div>
        <div className={styles.metric}><span>Recorded tokens</span><strong>{number(totals.totalTokens)}</strong></div>
        <div className={styles.metric}><span>Failed calls</span><strong>{totals.failedCalls.toLocaleString('en-US')}</strong></div>
        <div className={styles.metric}><span>Estimated cost · USD</span><strong>{cost(totals.estimatedCostUsd)}</strong></div>
      </section>
      {!report.pricingConfigured ? (
        <p className={styles.note} role="note">{copy.noPricing} {copy.pricingNote}</p>
      ) : totals.estimatedCostUsd === null ? (
        <p className={styles.note} role="note">{copy.incompleteEstimate} {copy.pricingNote}</p>
      ) : (
        <p className={styles.note} role="note">{copy.pricingNote}</p>
      )}
      <div className={styles.grid}>
        <Table title="Daily usage · UTC" headers={['Date', 'Calls', 'Tokens', 'Estimate']} rows={report.byDay.map(row => [
          row.date, row.calls, number(row.totalTokens), cost(row.estimatedCostUsd),
        ])} />
        <Table title="Usage by model" headers={['Model', 'Calls', 'Tokens', 'Estimate']} rows={report.byModel.map(row => [
          row.model, row.calls, number(row.totalTokens), cost(row.estimatedCostUsd),
        ])} />
        <Table title="Usage by feature" headers={['Feature', 'Calls', 'Tokens', 'Estimate']} rows={report.byFeature.map(row => [
          copy.featureLabels[row.feature] ?? row.feature, row.calls, number(row.totalTokens), cost(row.estimatedCostUsd),
        ])} />
        <Table title="Top workspaces" headers={['Workspace', 'Calls', 'Tokens', 'Estimate']} rows={report.topWorkspaces.map(row => [
          row.name, row.calls, number(row.totalTokens), cost(row.estimatedCostUsd),
        ])} />
      </div>
      <p className={styles.asOf}>
        Reporting period: {report.since.slice(0, 10)} to {report.asOf.slice(0, 10)} UTC · {totals.unknownUsageCalls} calls have unknown token usage.
      </p>
    </div>
  );
}

export type { AdminAIUsagePeriod };
