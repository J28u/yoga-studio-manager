import { z } from "zod";

export const CreateSessionSchema = z.object({
  name: z.string().min(3).max(50),
  date: z.string(),
  description: z.string().max(2500),
  teacherId: z.number(),
});

export const UpdateSessionSchema = CreateSessionSchema.partial();

export type CreateSessionDto = z.infer<typeof CreateSessionSchema>;
export type UpdateSessionDto = z.infer<typeof UpdateSessionSchema>;
