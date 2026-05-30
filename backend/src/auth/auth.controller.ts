import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { parseRequest } from "../common/utils/guards";
import { LoginSchema } from "./dto/login.dto";
import { RegisterSchema } from "./dto/register.dto";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = parseRequest(req.body, LoginSchema);
    const response = await this.authService.login(email, password);
    res.status(200).json(response);
  }

  async register(req: Request, res: Response): Promise<void> {
    const { email, password, firstName, lastName } = parseRequest(
      req.body,
      RegisterSchema,
    );
    const response = await this.authService.register(
      email,
      password,
      firstName,
      lastName,
    );
    res.status(201).json(response);
  }
}
