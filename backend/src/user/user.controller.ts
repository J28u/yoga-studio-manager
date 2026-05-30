import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { parseRequest } from "../common/utils/guards";
import { IdSchema } from "../common/dto/id.dto";
import { UserService } from "./user.service";

const prisma = new PrismaClient();

export class UserController {
  constructor(private readonly userService: UserService) {}

  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = parseRequest(req.params, IdSchema);
    const response = await this.userService.getById(id);
    res.status(200).json(response);
  }

  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = parseRequest(req.params, IdSchema);
    await this.userService.delete(req.userId, id);
    res.status(200).json({ message: "User deleted successfully" });
  }

  async promoteSelfToAdmin(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    const response = await this.userService.promoteSelfToAdmin(req.userId);
    res.status(200).json(response);
  }
}
