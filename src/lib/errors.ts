import type { FieldErrors } from "./types";

/** Server-side errors that map to an HTTP response. */

// Names are set as literals because the production build minifies class names.
export class AppError extends Error {
  name = "AppError";

  constructor(
    message: string,
    readonly status: number,
    readonly fields?: FieldErrors,
  ) {
    super(message);
  }
}

export class ValidationError extends AppError {
  name = "ValidationError";

  constructor(message = "Invalid expense.", fields?: FieldErrors) {
    super(message, 400, fields);
  }
}

export class NotFoundError extends AppError {
  name = "NotFoundError";

  constructor(message = "Expense not found.") {
    super(message, 404);
  }
}

/** The data file couldn't be read, parsed or written. Details stay in the log. */
export class StorageError extends AppError {
  name = "StorageError";

  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message, 500);
  }
}

export function errorResponse(error: unknown): Response {
  if (error instanceof AppError && error.status < 500) {
    return Response.json(
      { error: error.message, ...(error.fields && { fields: error.fields }) },
      { status: error.status },
    );
  }
  console.error(error);
  return Response.json({ error: "Internal server error." }, { status: 500 });
}

/** Wraps a route handler so thrown errors become JSON responses. */
export function withErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>,
): (...args: Args) => Promise<Response> {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (error) {
      return errorResponse(error);
    }
  };
}
