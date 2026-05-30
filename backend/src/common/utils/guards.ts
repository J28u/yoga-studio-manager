import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from "../../middleware/errors";
import { User } from "@prisma/client";
import { z, ZodType } from "zod";

export function assertIsAdmin(user: User | null): void {
  if (!user) throw new NotFoundError("User not found");
  if (!user.admin) throw new ForbiddenError("Admin access required");
}

export function parseRequest<T>(data: unknown, schema: ZodType<T>): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new BadRequestError(z.prettifyError(result.error));
  }

  return result.data;
}
