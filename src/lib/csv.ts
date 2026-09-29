import type { Expense } from "./types";

function escapeCell(value: string): string {
  // A leading =, +, - or @ makes spreadsheet apps run the cell as a formula;
  // an apostrophe keeps it as plain text.
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function toCsv(expenses: Expense[]): string {
  const rows = [
    ["Date", "Description", "Category", "Amount"],
    ...expenses.map((expense) => [
      expense.date,
      escapeCell(expense.description),
      expense.category,
      expense.amount.toFixed(2),
    ]),
  ];
  // The byte order mark tells Excel the file is UTF-8.
  return `﻿${rows.map((row) => row.join(",")).join("\r\n")}\r\n`;
}
