import { z } from "zod";

export const IdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type IdDto = z.infer<typeof IdSchema>;
