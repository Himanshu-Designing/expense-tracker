"use client";

import { useRef, useState } from "react";
import { deleteExpense, fetchExpenses, fetchSummary } from "@/lib/api";
import { formatMonth } from "@/lib/format";
import type { Expense, Summary } from "@/lib/types";
import ExpenseForm from "./ExpenseForm";
import ExpenseList from "./ExpenseList";
import SummaryPanel from "./SummaryPanel";

interface Props {
  initialExpenses: Expense[];
  initialSummary: Summary;
}

export default function ExpenseTracker({
  initialExpenses,
  initialSummary,
}: Props) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [summary, setSummary] = useState(initialSummary);
  // "" means all time; otherwise YYYY-MM.
  const [month, setMonth] = useState("");
  const [editing, setEditing] = useState<Expense | null>(null);
  const [error, setError] = useState<string | null>(null);
  const latestLoad = useRef(0);

  async function load(forMonth: string) {
    const loadId = ++latestLoad.current;
    try {
      const [nextExpenses, nextSummary] = await Promise.all([
        fetchExpenses(forMonth),
        fetchSummary(forMonth),
      ]);
      // A newer load started while this one was in flight; let that one win.
      if (loadId !== latestLoad.current) return;
      setExpenses(nextExpenses);
      setSummary(nextSummary);
      setError(null);
    } catch {
      if (loadId === latestLoad.current) {
        setError("Could not load expenses. Check that the server is running.");
      }
    }
  }

  function handleMonthChange(nextMonth: string) {
    setMonth(nextMonth);
    void load(nextMonth);
  }

  function handleSaved() {
    setEditing(null);
    void load(month);
  }

  async function handleDelete(expense: Expense) {
    if (!window.confirm(`Delete "${expense.description}"?`)) return;
    try {
      await deleteExpense(expense.id);
      if (editing?.id === expense.id) setEditing(null);
    } catch {
      setError(`Could not delete "${expense.description}".`);
      return;
    }
    void load(month);
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Expense Tracker
        </h1>
        <p className="mt-1 text-sm text-secondary">
          Record what you spend and see where it goes.
        </p>
      </header>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-danger px-4 py-3 text-sm text-danger"
        >
          {error}
        </p>
      )}

      <SummaryPanel
        summary={summary}
        period={month ? formatMonth(month) : "All time"}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[20rem_1fr]">
        <ExpenseForm
          // Remount when switching between adding and editing so fields reset.
          key={editing?.id ?? "new"}
          expense={editing}
          onSaved={handleSaved}
          onCancel={() => setEditing(null)}
        />
        <ExpenseList
          expenses={expenses}
          month={month}
          months={summary.months}
          editingId={editing?.id ?? null}
          onMonthChange={handleMonthChange}
          onEdit={setEditing}
          onDelete={handleDelete}
        />
      </div>
    </main>
  );
}
