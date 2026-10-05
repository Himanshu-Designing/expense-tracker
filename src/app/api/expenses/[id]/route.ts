import {
  NotFoundError,
  ValidationError,
  withErrorHandling,
} from "@/lib/errors";
import { deleteExpense, updateExpense } from "@/lib/store";
import { validateExpenseInput } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

// PUT /api/expenses/:id
export const PUT = withErrorHandling(
  async (request: Request, { params }: Context) => {
    const { id } = await params;
    const body: unknown = await request.json().catch(() => null);
    const result = validateExpenseInput(body);
    if (!result.ok) throw new ValidationError("Invalid expense.", result.errors);
    const updated = await updateExpense(id, result.data);
    if (!updated) throw new NotFoundError();
    return Response.json(updated);
  },
);

// DELETE /api/expenses/:id
export const DELETE = withErrorHandling(
  async (_request: Request, { params }: Context) => {
    const { id } = await params;
    if (!(await deleteExpense(id))) throw new NotFoundError();
    return new Response(null, { status: 204 });
  },
);
