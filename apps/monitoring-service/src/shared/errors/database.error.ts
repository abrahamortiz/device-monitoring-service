import { AppError } from "./app.error.ts";

export class DatabaseError extends AppError {
  constructor(message: string, cause?: Error) {
    super(message, "DATABASE_ERROR", 500, cause);
  }
}
