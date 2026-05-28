import { User } from "@prisma/client";

export type UserResponseDto = Omit<User, "password">;
