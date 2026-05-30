import type { TeacherDto } from "../../teacher/dto/teacher.dto";

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
