import { Response } from "express";
import { PrismaClient, Teacher } from "@prisma/client";
import { AuthRequest } from "../middleware/auth.middleware";
import { NotFoundError } from "../middleware/errors";
import { parseRequest } from "../utils/guards";
import { IdSchema } from "../dto/id.dto";

const prisma = new PrismaClient();

export class TeacherController {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    const teachers = await prisma.teacher.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const response: Teacher[] = teachers.map((teacher: Teacher) => ({
      id: teacher.id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt,
    }));

    res.status(200).json(response);
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    const { id } = parseRequest(req.params, IdSchema);

    const teacher = await prisma.teacher.findUnique({
      where: { id },
    });

    if (!teacher) throw new NotFoundError("Teacher not found");

    const response: Teacher = {
      id: teacher.id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt,
    };

    res.status(200).json(response);
  }
}
