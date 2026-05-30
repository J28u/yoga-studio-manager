import { PrismaClient } from "@prisma/client";

export class TeacherRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findOne(id: number) {
    return this.prisma.teacher.findUnique({
      where: { id },
    });
  }

  async findAll() {
    return this.prisma.teacher.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
