import { PrismaClient, User } from "@prisma/client";
import { CreateUser } from "./types/users.type";

export class UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findOne(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(data: CreateUser): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async update(id: number): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { admin: true },
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
