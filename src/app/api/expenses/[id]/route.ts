import { deleteExpense, updateExpense } from "@/lib/store";
import { validateExpenseInput } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

const notFound = () =>
  Response.json({ error: "Expense not found." }, { status: 404 });

// PUT /api/expenses/:id
export async function PUT(request: Request, { params }: Context) {
  const { id } = await params;
  const body: unknown = await request.json().catch(() => null);
  const result = validateExpenseInput(body);
  if (!result.ok) {
    return Response.json(
      { error: "Invalid expense.", fields: result.errors },
      { status: 400 },
    );
  }
  const updated = await updateExpense(id, result.data);
  return updated ? Response.json(updated) : notFound();
}

// DELETE /api/expenses/:id
export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params;
  const deleted = await deleteExpense(id);
  return deleted ? new Response(null, { status: 204 }) : notFound();
}
