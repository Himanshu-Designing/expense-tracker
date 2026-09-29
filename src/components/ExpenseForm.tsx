"use client";

import { useState, type SubmitEvent } from "react";
import { ApiError, createExpense, updateExpense } from "@/lib/api";
import { todayISO } from "@/lib/format";
import { CATEGORIES, type Category, type Expense, type FieldErrors } from "@/lib/types";

interface Props {
  /** The expense being edited, or null to add a new one. */
  expense: Expense | null;
  onSaved: () => void;
  onCancel: () => void;
}

const fieldClass =
  "w-full rounded-lg border border-line bg-background px-3 py-2 text-sm outline-none focus:border-foreground";

export default function ExpenseForm({ expense, onSaved, onCancel }: Props) {
  const [description, setDescription] = useState(expense?.description ?? "");
  const [amount, setAmount] = useState(expense ? String(expense.amount) : "");
  const [category, setCategory] = useState<Category>(
    expense?.category ?? CATEGORIES[0],
  );
  const [date, setDate] = useState(expense?.date ?? todayISO());
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFieldErrors({});
    setFormError(null);

    const input = { description, amount: Number(amount), category, date };
    try {
      if (expense) {
        await updateExpense(expense.id, input);
      } else {
        await createExpense(input);
        // Keep category and date so several expenses from one day are quick to enter.
        setDescription("");
        setAmount("");
      }
      onSaved();
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.fields).length > 0) {
        setFieldErrors(error.fields);
      } else {
        setFormError(
          error instanceof ApiError
            ? error.message
            : "Could not save the expense. Check that the server is running.",
        );
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-5"
    >
      <h2 className="text-base font-semibold">
        {expense ? "Edit expense" : "Add expense"}
      </h2>

      <Field label="Description" htmlFor="description" error={fieldErrors.description}>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={100}
          required
          placeholder="e.g. Groceries"
          className={fieldClass}
        />
      </Field>

      <Field label="Amount" htmlFor="amount" error={fieldErrors.amount}>
        <input
          id="amount"
          type="number"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          min="0.01"
          step="0.01"
          required
          placeholder="0.00"
          className={fieldClass}
        />
      </Field>

      <Field label="Category" htmlFor="category" error={fieldErrors.category}>
        <select
          id="category"
          value={category}
          onChange={(event) => setCategory(event.target.value as Category)}
          className={fieldClass}
        >
          {CATEGORIES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Date" htmlFor="date" error={fieldErrors.date}>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          required
          className={fieldClass}
        />
      </Field>

      {formError && (
        <p role="alert" className="text-sm text-danger">
          {formError}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : expense ? "Save changes" : "Add expense"}
        </button>
        {expense && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:bg-background"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-secondary">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
