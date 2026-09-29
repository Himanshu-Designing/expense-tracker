import { formatCurrency, formatPercent } from "@/lib/format";
import type { Summary } from "@/lib/types";

interface Props {
  summary: Summary;
  /** What the numbers cover, e.g. "All time" or "October 2026". */
  period: string;
}

export default function SummaryPanel({ summary, period }: Props) {
  const { total, count, average, byCategory } = summary;
  const largest = byCategory[0]?.total ?? 0;

  return (
    <section
      aria-label={`Summary, ${period}`}
      className="grid gap-6 rounded-xl border border-line bg-surface p-5 md:grid-cols-2"
    >
      <div className="flex flex-col justify-between gap-6">
        <div>
          <p className="text-sm text-secondary">Total spent · {period}</p>
          <p className="mt-1 text-5xl font-semibold tracking-tight">
            {formatCurrency(total)}
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-4">
          <Stat label="Expenses" value={String(count)} />
          <Stat label="Average" value={formatCurrency(average)} />
          <Stat label="Top category" value={byCategory[0]?.category ?? "–"} />
        </dl>
      </div>

      <div>
        <h2 className="text-sm text-secondary">Spending by category</h2>
        {byCategory.length === 0 ? (
          <p className="mt-3 text-sm text-secondary">Nothing to show yet.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {byCategory.map(({ category, total: categoryTotal, count: categoryCount }) => (
              <li
                key={category}
                title={`${category}: ${formatCurrency(categoryTotal)} across ${categoryCount} ${
                  categoryCount === 1 ? "expense" : "expenses"
                }`}
              >
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-medium">{category}</span>
                  <span className="tabular-nums text-secondary">
                    {formatCurrency(categoryTotal)} ·{" "}
                    {formatPercent(categoryTotal / total)}
                  </span>
                </div>
                {/* Bar length is relative to the largest category. */}
                <div
                  className="mt-1.5 h-2 min-w-1 rounded-r bg-series"
                  style={{ width: `${(categoryTotal / largest) * 100}%` }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-secondary">{label}</dt>
      <dd className="mt-0.5 truncate text-base font-semibold">{value}</dd>
    </div>
  );
}
