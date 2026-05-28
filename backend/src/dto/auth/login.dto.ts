import { z } from "zod";
import { RegisterSchema } from "./register.dto";

export const LoginSchema = RegisterSchema.pick({ email: true, password: true });

export type LoginDto = z.infer<typeof LoginSchema>;
