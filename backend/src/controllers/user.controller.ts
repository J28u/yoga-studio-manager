import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth.middleware";
import { parseId } from "../utils/guards";
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../middleware/errors";

const prisma = new PrismaClient();

export class UserController {
  async getById(req: AuthRequest, res: Response) {
    const { id } = req.params as { id: string };
    const userId = parseId(id, "User");

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundError("User not found");

    const response: any = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      admin: user.admin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json(response);
  }

  async delete(req: AuthRequest, res: Response) {
    const { id } = req.params as { id: string };
    const userId = parseId(id, "User");

    if (req.userId !== userId)
      throw new ForbiddenError("You can only delete your own account");

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundError("User not found");

    await prisma.user.delete({
      where: { id: userId },
    });

    res.status(200).json({ message: "User deleted successfully" });
  }

  async promoteSelfToAdmin(req: AuthRequest, res: Response) {
    const isDev = (process.env.NODE_ENV || "development") === "development";
    if (!isDev)
      throw new ForbiddenError(
        "Admin self-promotion is only available in development",
      );

    if (!req.userId) throw new UnauthorizedError("Unauthorized");

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) throw new NotFoundError("User not found");

    if (!user.admin) {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { admin: true },
      });

      res.status(200).json({
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        admin: updatedUser.admin,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      });
    } else {
      res.status(200).json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        admin: user.admin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    }
  }
}
