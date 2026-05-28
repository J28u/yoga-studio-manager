import { z } from "zod";
import { IdSchema } from "../id.dto";

export const SessionParamsSchema = IdSchema.extend({
  userId: z.coerce.number().int().positive(),
});

export type SessionParamsDto = z.infer<typeof SessionParamsSchema>;
