import { ZodError } from "zod";

export function formatZodError(error: ZodError) {
  return error.issues.map((issue) => ({
    message: `${issue.path.join(".")} ${issue.message}`,
  }));
}
