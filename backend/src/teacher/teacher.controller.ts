import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { parseRequest } from "../common/utils/guards";
import { IdSchema } from "../common/dto/id.dto";
import { TeacherService } from "./teacher.service";

export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    const response = await this.teacherService.getAll();
    res.status(200).json(response);
  }

  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = parseRequest(req.params, IdSchema);
    const response = await this.teacherService.getById(id);
    res.status(200).json(response);
  }
}
