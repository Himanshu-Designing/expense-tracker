import {
  CATEGORIES,
  type Category,
  type ExpenseFilter,
  type ExpenseInput,
  type FieldErrors,
} from "./types";

const MAX_DESCRIPTION_LENGTH = 100;
const MAX_AMOUNT = 1_000_000_000;

export type ValidationResult =
  | { ok: true; data: ExpenseInput }
  | { ok: false; errors: FieldErrors };

function isCategory(value: unknown): value is Category {
  return CATEGORIES.includes(value as Category);
}

function isValidDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  // Round-trip through Date to reject impossible days such as 2026-02-30.
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
}

export function isValidMonth(value: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

export function validateExpenseInput(body: unknown): ValidationResult {
  const input =
    typeof body === "object" && body !== null
      ? (body as Record<string, unknown>)
      : {};
  const errors: FieldErrors = {};

  const description =
    typeof input.description === "string" ? input.description.trim() : "";
  if (description === "") {
    errors.description = "Description is required.";
  } else if (description.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`;
  }

  const amount =
    typeof input.amount === "number"
      ? Math.round(input.amount * 100) / 100
      : Number.NaN;
  if (!Number.isFinite(amount)) {
    errors.amount = "Amount must be a number.";
  } else if (amount <= 0) {
    errors.amount = "Amount must be greater than 0.";
  } else if (amount > MAX_AMOUNT) {
    errors.amount = "Amount is too large.";
  }

  if (!isCategory(input.category)) {
    errors.category = `Category must be one of: ${CATEGORIES.join(", ")}.`;
  }

  if (!isValidDate(input.date)) {
    errors.date = "Date must be a valid day in YYYY-MM-DD format.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return {
    ok: true,
    data: {
      description,
      amount,
      category: input.category as Category,
      date: input.date as string,
    },
  };
}

export function parseFilter(
  searchParams: URLSearchParams,
): { ok: true; filter: ExpenseFilter } | { ok: false; error: string } {
  const filter: ExpenseFilter = {};

  const month = searchParams.get("month");
  if (month) {
    if (!isValidMonth(month)) {
      return { ok: false, error: "month must be in YYYY-MM format." };
    }
    filter.month = month;
  }

  const category = searchParams.get("category");
  if (category) {
    if (!isCategory(category)) {
      return {
        ok: false,
        error: `category must be one of: ${CATEGORIES.join(", ")}.`,
      };
    }
    filter.category = category;
  }

  return { ok: true, filter };
}
