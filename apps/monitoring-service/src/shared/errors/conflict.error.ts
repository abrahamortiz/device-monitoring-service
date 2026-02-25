import { AppError } from "./app.error.ts";

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, "CONFLICT_ERROR", 400, details);
  }
}
