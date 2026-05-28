import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from "../middleware/errors";
import { UserDto } from "../dto/user.dto";

type Resource = "Session" | "User" | "Teacher";

export function parseId(id: string, resource: Resource): number {
  if (!id) throw new BadRequestError(`${resource} ID is required`);
  const parsedId = parseInt(id);
  if (isNaN(parsedId)) throw new BadRequestError(`Invalid ${resource} ID`);
  return parsedId;
}

export function assertIsAdmin(user: UserDto | null): void {
  if (!user) throw new NotFoundError("User not found");
  if (!user.admin) throw new ForbiddenError("Admin access required");
}
