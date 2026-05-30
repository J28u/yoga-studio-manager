import { UserRepository } from "./user.repository";
import { User } from "@prisma/client";
import { UserResponseDto } from "./dto/user-response.dto";
import { NotFoundError, ForbiddenError } from "../middleware/errors";

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  private toUserResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      admin: user.admin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getById(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne(id);
    if (!user) throw new NotFoundError("User not found");

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      admin: user.admin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async delete(userId: number, id: number): Promise<void> {
    if (userId !== id)
      throw new ForbiddenError("You can only delete your own account");

    const user = this.userRepository.findOne(userId);
    if (!user) throw new NotFoundError("User not found");

    await this.userRepository.delete(userId);
  }

  async promoteSelfToAdmin(userId: number): Promise<UserResponseDto> {
    const isDev = (process.env.NODE_ENV || "development") === "development";
    if (!isDev)
      throw new ForbiddenError(
        "Admin self-promotion is only available in development",
      );

    const user = await this.userRepository.findOne(userId);
    if (!user) throw new NotFoundError("User not found");
    let response = user;

    if (!user.admin) {
      const updatedUser = await this.userRepository.update(userId);
      response = updatedUser;
    }

    return this.toUserResponse(response);
  }
}
