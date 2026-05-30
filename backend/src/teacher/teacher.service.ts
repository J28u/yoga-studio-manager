import { TeacherRepository } from "./teacher.repository";
import { Teacher } from "@prisma/client";
import { NotFoundError } from "../middleware/errors";

export class TeacherService {
  constructor(private readonly teacherRepository: TeacherRepository) {}

  async getAll(): Promise<Teacher[]> {
    const teachers = await this.teacherRepository.findAll();

    return teachers.map((teacher: Teacher) => ({
      id: teacher.id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt,
    }));
  }

  async getById(id: number): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne(id);
    if (!teacher) throw new NotFoundError("Teacher not found");

    return {
      id: teacher.id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt,
    };
  }
}
