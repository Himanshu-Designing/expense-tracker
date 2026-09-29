import { monthQuery } from "@/lib/api";
import { formatCurrency, formatDate, formatMonth } from "@/lib/format";
import type { Expense } from "@/lib/types";

interface Props {
  expenses: Expense[];
  /** "" for all time, otherwise YYYY-MM. */
  month: string;
  /** Months that have expenses, newest first. */
  months: string[];
  editingId: string | null;
  onMonthChange: (month: string) => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

const actionClass =
  "rounded-md px-2 py-1 text-xs font-medium text-secondary hover:bg-background hover:text-foreground";

export default function ExpenseList({
  expenses,
  month,
  months,
  editingId,
  onMonthChange,
  onEdit,
  onDelete,
}: Props) {
  // Keep the selected month in the dropdown even after its last expense is deleted.
  const monthOptions =
    month && !months.includes(month) ? [month, ...months] : months;

  return (
    <section className="rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <h2 className="text-base font-semibold">Expenses</h2>
        <div className="flex items-center gap-2">
          <label htmlFor="month" className="sr-only">
            Filter by month
          </label>
          <select
            id="month"
            value={month}
            onChange={(event) => onMonthChange(event.target.value)}
            className="rounded-lg border border-line bg-background px-3 py-1.5 text-sm outline-none focus:border-foreground"
          >
            <option value="">All time</option>
            {monthOptions.map((option) => (
              <option key={option} value={option}>
                {formatMonth(option)}
              </option>
            ))}
          </select>
          {expenses.length > 0 && (
            <a
              href={`/api/expenses/export${monthQuery(month)}`}
              download
              className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium hover:bg-background"
            >
              Export CSV
            </a>
          )}
        </div>
      </div>

      {expenses.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-secondary">
          {month
            ? `No expenses in ${formatMonth(month)}.`
            : "No expenses yet. Add your first one to get started."}
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {expenses.map((expense) => (
            <li
              key={expense.id}
              className={`flex items-center gap-4 px-5 py-3 ${
                expense.id === editingId ? "bg-background" : ""
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {expense.description}
                </p>
                <p className="mt-0.5 text-xs text-secondary">
                  {expense.category} · {formatDate(expense.date)}
                </p>
              </div>
              <p className="text-sm font-medium tabular-nums">
                {formatCurrency(expense.amount)}
              </p>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => onEdit(expense)}
                  aria-label={`Edit ${expense.description}`}
                  className={actionClass}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(expense)}
                  aria-label={`Delete ${expense.description}`}
                  className={`${actionClass} hover:text-danger`}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
