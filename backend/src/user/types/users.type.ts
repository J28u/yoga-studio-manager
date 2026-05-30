import { RegisterDto } from "../../auth/dto/register.dto";

export type CreateUser = RegisterDto & { admin: boolean };
