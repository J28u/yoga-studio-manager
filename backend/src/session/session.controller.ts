import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { SessionService } from "./session.service";
import { parseRequest } from "../common/utils/guards";
import { CreateSessionSchema, UpdateSessionSchema } from "./dto/session.dto";
import { IdSchema } from "../common/dto/id.dto";
import { SessionParamsSchema } from "./dto/session-params.dto";

export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    const response = await this.sessionService.getAll();
    res.status(200).json(response);
  }

  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = parseRequest(req.params, IdSchema);
    const response = await this.sessionService.getBydId(id);
    res.status(200).json(response);
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { name, date, description, teacherId } = parseRequest(
      req.body,
      CreateSessionSchema,
    );

    const response = await this.sessionService.create(
      req.userId!,
      teacherId,
      name,
      date,
      description,
    );

    res.status(201).json(response);
  }

  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = parseRequest(req.params, IdSchema);
    const { name, date, description, teacherId } = parseRequest(
      req.body,
      UpdateSessionSchema,
    );

    const response = await this.sessionService.update(
      req.userId,
      id,
      name,
      date,
      description,
      teacherId,
    );

    res.status(200).json(response);
  }

  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = parseRequest(req.params, IdSchema);
    await this.sessionService.detete(req.userId, id);
    res.status(200).json({ message: "Session deleted successfully" });
  }

  async participate(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id, userId } = parseRequest(req.params, SessionParamsSchema);
    await this.sessionService.participate(userId, id);
    res.status(200).json({ message: "Successfully joined the session" });
  }

  async unparticipate(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id, userId } = parseRequest(req.params, SessionParamsSchema);
    await this.sessionService.unparticipate(userId, id);
    res.status(200).json({ message: "Successfully left the session" });
  }
}
