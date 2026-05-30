import { z } from "zod";

export const TeacherSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
});

export type TeacherDto = z.infer<typeof TeacherSchema>;
