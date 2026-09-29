import type { Expense, ExpenseInput, FieldErrors, Summary } from "./types";

/** Browser-side client for the /api/expenses routes. */

export class ApiError extends Error {
  constructor(
    message: string,
    readonly fields: FieldErrors = {},
  ) {
    super(message);
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      body?.error ?? `Request failed (${response.status}).`,
      body?.fields,
    );
  }
  return body as T;
}

function json(method: string, input: ExpenseInput): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  };
}

export const monthQuery = (month: string) => (month ? `?month=${month}` : "");

export const fetchExpenses = (month: string) =>
  request<Expense[]>(`/api/expenses${monthQuery(month)}`);

export const fetchSummary = (month: string) =>
  request<Summary>(`/api/expenses/summary${monthQuery(month)}`);

export const createExpense = (input: ExpenseInput) =>
  request<Expense>("/api/expenses", json("POST", input));

export const updateExpense = (id: string, input: ExpenseInput) =>
  request<Expense>(`/api/expenses/${id}`, json("PUT", input));

export const deleteExpense = (id: string) =>
  request<void>(`/api/expenses/${id}`, { method: "DELETE" });
