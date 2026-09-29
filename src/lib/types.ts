export const CATEGORIES = [
  "Food",
  "Transport",
  "Housing",
  "Bills",
  "Shopping",
  "Entertainment",
  "Health",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: Category;
  /** Day the money was spent, as YYYY-MM-DD. */
  date: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseInput = Pick<
  Expense,
  "description" | "amount" | "category" | "date"
>;

export type FieldErrors = Partial<Record<keyof ExpenseInput, string>>;

export interface ExpenseFilter {
  /** YYYY-MM */
  month?: string;
  category?: Category;
}

export interface CategoryTotal {
  category: Category;
  total: number;
  count: number;
}

export interface Summary {
  total: number;
  count: number;
  average: number;
  /** Largest total first; categories with no expenses are left out. */
  byCategory: CategoryTotal[];
  /** Every month (YYYY-MM) that has at least one expense, newest first, regardless of filter. */
  months: string[];
}
