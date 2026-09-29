import type {
  Category,
  CategoryTotal,
  Expense,
  ExpenseFilter,
  Summary,
} from "./types";

export function filterExpenses(
  expenses: Expense[],
  { month, category }: ExpenseFilter = {},
): Expense[] {
  return expenses.filter(
    (expense) =>
      (!month || expense.date.startsWith(month)) &&
      (!category || expense.category === category),
  );
}

/** Summarises the expenses matching `filter`; `months` always covers every expense. */
export function buildSummary(
  expenses: Expense[],
  filter: ExpenseFilter = {},
): Summary {
  const matching = filterExpenses(expenses, filter);

  // Add up in whole cents so totals don't pick up floating point drift.
  const cents = new Map<Category, { cents: number; count: number }>();
  let totalCents = 0;
  for (const expense of matching) {
    const amountCents = Math.round(expense.amount * 100);
    totalCents += amountCents;
    const entry = cents.get(expense.category) ?? { cents: 0, count: 0 };
    entry.cents += amountCents;
    entry.count += 1;
    cents.set(expense.category, entry);
  }

  const byCategory: CategoryTotal[] = [...cents]
    .map(([category, entry]) => ({
      category,
      total: entry.cents / 100,
      count: entry.count,
    }))
    .sort((a, b) => b.total - a.total);

  const months = [
    ...new Set(expenses.map((expense) => expense.date.slice(0, 7))),
  ].sort((a, b) => b.localeCompare(a));

  return {
    total: totalCents / 100,
    count: matching.length,
    average:
      matching.length > 0
        ? Math.round(totalCents / matching.length) / 100
        : 0,
    byCategory,
    months,
  };
}
