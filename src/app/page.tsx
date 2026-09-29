import { connection } from "next/server";
import ExpenseTracker from "@/components/ExpenseTracker";
import { listExpenses } from "@/lib/store";
import { buildSummary } from "@/lib/summary";

export default async function Home() {
  // The data file changes between requests, so render per request, not at build time.
  await connection();
  const expenses = await listExpenses();

  return (
    <ExpenseTracker
      initialExpenses={expenses}
      initialSummary={buildSummary(expenses)}
    />
  );
}
