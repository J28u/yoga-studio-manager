import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth.middleware";
import { NotFoundError, ConflictError } from "../middleware/errors";
import { assertIsAdmin } from "../utils/guards";
import { SessionResponseDto } from "../dto/session/session-response.dto";
import {
  SessionWithParticipants,
  Participant,
  UpdateSession,
} from "../dto/session/session.interface";
import { parseRequest } from "../utils/guards";
import {
  CreateSessionSchema,
  UpdateSessionSchema,
} from "../dto/session/session.dto";
import { IdSchema } from "../dto/id.dto";
import { SessionParamsSchema } from "../dto/session/session-params.dto";

const prisma = new PrismaClient();

export class SessionController {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    const sessions = await prisma.session.findMany({
      include: {
        teacher: true,
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    const response: SessionResponseDto[] = sessions.map(
      (session: SessionWithParticipants) => ({
        id: session.id,
        name: session.name,
        date: session.date,
        description: session.description,
        teacher: {
          id: session.teacher.id,
          firstName: session.teacher.firstName,
          lastName: session.teacher.lastName,
        },
        users: session.participants.map((p: Participant) => p.user.id),
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      }),
    );

    res.status(200).json(response);
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    const { id } = parseRequest(req.params, IdSchema);

    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        teacher: true,
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!session) throw new NotFoundError("Session not found");

    const response: SessionResponseDto = {
      id: session.id,
      name: session.name,
      date: session.date,
      description: session.description,
      teacher: {
        id: session.teacher.id,
        firstName: session.teacher.firstName,
        lastName: session.teacher.lastName,
      },
      users: session.participants.map((p: Participant) => p.user.id),
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };

    res.status(200).json(response);
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    const { name, date, description, teacherId } = parseRequest(
      req.body,
      CreateSessionSchema,
    );

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    assertIsAdmin(user);

    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) throw new NotFoundError("Teacher not found");

    const session = await prisma.session.create({
      data: {
        name,
        date: new Date(date),
        description,
        teacherId,
      },
      include: {
        teacher: true,
        participants: true,
      },
    });

    const response: SessionResponseDto = {
      id: session.id,
      name: session.name,
      date: session.date,
      description: session.description,
      teacher: {
        id: session.teacher.id,
        firstName: session.teacher.firstName,
        lastName: session.teacher.lastName,
      },
      users: [],
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };

    res.status(201).json(response);
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    const { id } = parseRequest(req.params, IdSchema);
    const { name, date, description, teacherId } = parseRequest(
      req.body,
      UpdateSessionSchema,
    );

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    assertIsAdmin(user);

    const existingSession = await prisma.session.findUnique({
      where: { id },
    });

    if (!existingSession) throw new NotFoundError("Session not found");

    const updateData: UpdateSession = {};
    if (name) updateData.name = name;
    if (date) updateData.date = new Date(date);
    if (description) updateData.description = description;
    if (teacherId) {
      const teacher = await prisma.teacher.findUnique({
        where: { id: teacherId },
      });
      if (!teacher) throw new NotFoundError("Teacher not found");
      updateData.teacherId = teacherId;
    }

    const session = await prisma.session.update({
      where: { id },
      data: updateData,
      include: {
        teacher: true,
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    const response: SessionResponseDto = {
      id: session.id,
      name: session.name,
      date: session.date,
      description: session.description,
      teacher: {
        id: session.teacher.id,
        firstName: session.teacher.firstName,
        lastName: session.teacher.lastName,
      },
      users: session.participants.map((p: Participant) => p.user.id),
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };

    res.status(200).json(response);
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    const { id } = parseRequest(req.params, IdSchema);

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    assertIsAdmin(user);

    const existingSession = await prisma.session.findUnique({
      where: { id },
    });

    if (!existingSession) throw new NotFoundError("Session not found");

    await prisma.session.delete({
      where: { id },
    });

    res.status(200).json({ message: "Session deleted successfully" });
  }

  async participate(req: AuthRequest, res: Response): Promise<void> {
    const { id, userId } = parseRequest(req.params, SessionParamsSchema);

    const session = await prisma.session.findUnique({
      where: { id },
    });

    if (!session) throw new NotFoundError("Session not found");

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundError("User not found");

    const existingParticipation = await prisma.sessionParticipation.findUnique({
      where: {
        sessionId_userId: {
          sessionId: id,
          userId,
        },
      },
    });

    if (existingParticipation)
      throw new ConflictError("User already participating in this session");

    await prisma.sessionParticipation.create({
      data: {
        sessionId: id,
        userId,
      },
    });

    res.status(200).json({ message: "Successfully joined the session" });
  }

  async unparticipate(req: AuthRequest, res: Response): Promise<void> {
    const { id, userId } = parseRequest(req.params, SessionParamsSchema);

    const participation = await prisma.sessionParticipation.findUnique({
      where: {
        sessionId_userId: {
          sessionId: id,
          userId,
        },
      },
    });

    if (!participation) throw new NotFoundError("Participation not found");

    await prisma.sessionParticipation.delete({
      where: {
        sessionId_userId: {
          sessionId: id,
          userId,
        },
      },
    });

    res.status(200).json({ message: "Successfully left the session" });
  }
}
