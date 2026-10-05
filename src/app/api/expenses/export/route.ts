import type { NextRequest } from "next/server";
import { toCsv } from "@/lib/csv";
import { ValidationError, withErrorHandling } from "@/lib/errors";
import { listExpenses } from "@/lib/store";
import { parseFilter } from "@/lib/validation";

// GET /api/expenses/export?month=YYYY-MM&category=Food
export const GET = withErrorHandling(async (request: NextRequest) => {
  const parsed = parseFilter(request.nextUrl.searchParams);
  if (!parsed.ok) throw new ValidationError(parsed.error);

  const { month } = parsed.filter;
  const filename = month ? `expenses-${month}.csv` : "expenses.csv";
  return new Response(toCsv(await listExpenses(parsed.filter)), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
});
