import type { NextRequest } from "next/server";
import { addExpense, listExpenses } from "@/lib/store";
import { parseFilter, validateExpenseInput } from "@/lib/validation";

// GET /api/expenses?month=YYYY-MM&category=Food
export async function GET(request: NextRequest) {
  const parsed = parseFilter(request.nextUrl.searchParams);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }
  return Response.json(await listExpenses(parsed.filter));
}

// POST /api/expenses
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const result = validateExpenseInput(body);
  if (!result.ok) {
    return Response.json(
      { error: "Invalid expense.", fields: result.errors },
      { status: 400 },
    );
  }
  return Response.json(await addExpense(result.data), { status: 201 });
}
