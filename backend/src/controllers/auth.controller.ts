import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.util";
import {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
} from "../middleware/errors";

const prisma = new PrismaClient();

export class AuthController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email) throw new BadRequestError("Email is required");
    if (!password) throw new BadRequestError("Password is required");
    if (typeof email !== "string")
      throw new BadRequestError("Email must be a string");
    if (typeof password !== "string")
      throw new BadRequestError("Password must be a string");

    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) throw new UnauthorizedError("Invalid credentials");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedError("Invalid credentials");

    const token = generateToken(user.id);

    const response: any = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      admin: user.admin,
      token,
    };

    res.status(200).json(response);
  }

  async register(req: Request, res: Response) {
    const { email, password, firstName, lastName } = req.body;

    if (!email) throw new BadRequestError("Email is required");
    if (!password) throw new BadRequestError("Password is required");
    if (!firstName) throw new BadRequestError("First name is required");
    if (!lastName) throw new BadRequestError("Last name is required");
    if (password.length < 8)
      throw new BadRequestError("Password must be at least 8 characters");

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

    const response: any = {
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
