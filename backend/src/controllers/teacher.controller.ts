import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth.middleware";
import { BadRequestError, NotFoundError } from "../middleware/errors";
import { parseId } from "../utils/guards";

const prisma = new PrismaClient();

export class TeacherController {
  async getAll(req: AuthRequest, res: Response) {
    const teachers = await prisma.teacher.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const response: any = teachers.map((teacher: any) => ({
      id: teacher.id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt,
    }));

    res.status(200).json(response);
  }

  async getById(req: AuthRequest, res: Response) {
    const { id } = req.params as { id: string };
    const teacherId = parseId(id, "Teacher");

    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) throw new NotFoundError("Teacher not found");

    const response: any = {
      id: teacher.id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt,
    };

    res.status(200).json(response);
  }
}
