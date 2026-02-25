import { ValidationError } from "../shared/errors/validation.error.ts";
import { UUIDSchema } from "../shared/schemas/uuid.schema.ts";

export async function validateId(id: string): Promise<void> {
  const validationResult = UUIDSchema.safeParse(id);

  if (!validationResult.success) {
    throw new ValidationError("Invalid id");
  }
}
