import type { FastifyReply, FastifyRequest } from "fastify";
import type { AppError } from "./errors/app.error.ts";
import { ConflictError } from "./errors/conflict.error.ts";
import { DatabaseError } from "./errors/database.error.ts";
import { NotFoundError } from "./errors/not-found.error.ts";
import { ValidationError } from "./errors/validation.error.ts";

export class BaseController {
  protected handleError(
    error: unknown,
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    if (this.isAppError(error)) {
      request.log.warn({
        error: error.code,
        message: error.message,
        statusCode: error.statusCode,
      });

      return reply.code(error.statusCode).send({
        error: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      });
    }

    request.log.error(error);

    return reply.code(500).send({
      error: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
    });
  }

  private isAppError(error: unknown): error is AppError {
    return (
      error instanceof ConflictError ||
      error instanceof DatabaseError ||
      error instanceof NotFoundError ||
      error instanceof ValidationError
    );
  }
}
