import type { NextRequest } from "next/server";
import { ValidationError, withErrorHandling } from "@/lib/errors";
import { listExpenses } from "@/lib/store";
import { buildSummary } from "@/lib/summary";
import { parseFilter } from "@/lib/validation";

// GET /api/expenses/summary?month=YYYY-MM&category=Food
export const GET = withErrorHandling(async (request: NextRequest) => {
  const parsed = parseFilter(request.nextUrl.searchParams);
  if (!parsed.ok) throw new ValidationError(parsed.error);
  return Response.json(buildSummary(await listExpenses(), parsed.filter));
});
