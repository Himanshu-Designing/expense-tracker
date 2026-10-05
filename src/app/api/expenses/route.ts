import type { NextRequest } from "next/server";
import { ValidationError, withErrorHandling } from "@/lib/errors";
import { addExpense, listExpenses } from "@/lib/store";
import { parseFilter, validateExpenseInput } from "@/lib/validation";

// GET /api/expenses?month=YYYY-MM&category=Food
export const GET = withErrorHandling(async (request: NextRequest) => {
  const parsed = parseFilter(request.nextUrl.searchParams);
  if (!parsed.ok) throw new ValidationError(parsed.error);
  return Response.json(await listExpenses(parsed.filter));
});

// POST /api/expenses
export const POST = withErrorHandling(async (request: Request) => {
  const body: unknown = await request.json().catch(() => null);
  const result = validateExpenseInput(body);
  if (!result.ok) throw new ValidationError("Invalid expense.", result.errors);
  return Response.json(await addExpense(result.data), { status: 201 });
});
