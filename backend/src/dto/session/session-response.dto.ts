import type { TeacherDto } from "../teacher/teacher.dto";

export interface SessionResponseDto {
  id: number;
  name: string;
  date: Date;
  description: string;
  teacher: TeacherDto;
  users: number[];
  createdAt: Date;
  updatedAt: Date;
}
