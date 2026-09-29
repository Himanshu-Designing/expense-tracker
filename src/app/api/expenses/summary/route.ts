import type { NextRequest } from "next/server";
import { listExpenses } from "@/lib/store";
import { buildSummary } from "@/lib/summary";
import { parseFilter } from "@/lib/validation";

// GET /api/expenses/summary?month=YYYY-MM&category=Food
export async function GET(request: NextRequest) {
  const parsed = parseFilter(request.nextUrl.searchParams);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }
  return Response.json(buildSummary(await listExpenses(), parsed.filter));
}
