import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { filterExpenses } from "./summary";
import type { Expense, ExpenseFilter, ExpenseInput } from "./types";

const DATA_FILE =
  process.env.EXPENSES_FILE ??
  path.join(process.cwd(), "data", "expenses.json");

// Every read and write goes through one queue, so two requests arriving
// together can't read the same snapshot and overwrite each other's change.
// It lives on globalThis because Next.js may load this module more than once.
const globalStore = globalThis as typeof globalThis & {
  __expenseStoreQueue?: Promise<unknown>;
};

function serialize<T>(task: () => Promise<T>): Promise<T> {
  const run = (globalStore.__expenseStoreQueue ?? Promise.resolve()).then(
    task,
    task,
  );
  globalStore.__expenseStoreQueue = run.catch(() => undefined);
  return run;
}

async function readAll(): Promise<Expense[]> {
  let raw: string;
  try {
    // The path comes from an env var, so the bundler can't trace it; tell it not to try.
    raw = await fs.readFile(/* turbopackIgnore: true */ DATA_FILE, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
  if (raw.trim() === "") return [];

  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error(`${DATA_FILE} does not contain a JSON array.`);
  }
  return parsed as Expense[];
}

async function writeAll(expenses: Expense[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  // Write to a temp file and rename, so a crash mid-write can't leave a
  // half-written data file behind.
  const tempFile = `${DATA_FILE}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(expenses, null, 2), "utf8");
  await fs.rename(tempFile, DATA_FILE);
}

function newestFirst(a: Expense, b: Expense): number {
  return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
}

export function listExpenses(filter: ExpenseFilter = {}): Promise<Expense[]> {
  return serialize(async () =>
    filterExpenses(await readAll(), filter).sort(newestFirst),
  );
}

export function addExpense(input: ExpenseInput): Promise<Expense> {
  return serialize(async () => {
    const expenses = await readAll();
    const now = new Date().toISOString();
    const expense: Expense = {
      id: randomUUID(),
      ...input,
      createdAt: now,
      updatedAt: now,
    };
    await writeAll([...expenses, expense]);
    return expense;
  });
}

/** Resolves to null when no expense has that id. */
export function updateExpense(
  id: string,
  input: ExpenseInput,
): Promise<Expense | null> {
  return serialize(async () => {
    const expenses = await readAll();
    const index = expenses.findIndex((expense) => expense.id === id);
    if (index === -1) return null;

    const updated: Expense = {
      ...expenses[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    expenses[index] = updated;
    await writeAll(expenses);
    return updated;
  });
}

/** Resolves to false when no expense has that id. */
export function deleteExpense(id: string): Promise<boolean> {
  return serialize(async () => {
    const expenses = await readAll();
    const remaining = expenses.filter((expense) => expense.id !== id);
    if (remaining.length === expenses.length) return false;
    await writeAll(remaining);
    return true;
  });
}
