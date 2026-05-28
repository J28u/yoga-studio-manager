import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { parseRequest } from "../utils/guards";
import { generateToken } from "../utils/jwt.util";
import { LoginSchema } from "../dto/auth/login.dto";
import { RegisterSchema } from "../dto/auth/register.dto";
import { AuthResponseDto } from "../dto/auth/auth-response.dto";
import { UnauthorizedError, ConflictError } from "../middleware/errors";

const prisma = new PrismaClient();

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = parseRequest(req.body, LoginSchema);

    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) throw new UnauthorizedError("Invalid credentials");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedError("Invalid credentials");

    const token = generateToken(user.id);

    const response: AuthResponseDto = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      admin: user.admin,
      token,
    };

    res.status(200).json(response);
  }

  async register(req: Request, res: Response): Promise<void> {
    const { email, password, firstName, lastName } = parseRequest(
      req.body,
      RegisterSchema,
    );

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) throw new ConflictError("Email already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        admin: false,
      },
    });

    const token = generateToken(user.id);

    const response: AuthResponseDto = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      admin: user.admin,
      token,
    };

    res.status(201).json(response);
  }
}
