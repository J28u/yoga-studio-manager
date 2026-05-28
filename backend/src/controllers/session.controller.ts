import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
} from "../middleware/errors";
import { parseId, assertIsAdmin } from "../utils/guards";

const prisma = new PrismaClient();

export class SessionController {
  async getAll(req: AuthRequest, res: Response) {
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

    const response: any = sessions.map((session: any) => ({
      id: session.id,
      name: session.name,
      date: session.date,
      description: session.description,
      teacher: {
        id: session.teacher.id,
        firstName: session.teacher.firstName,
        lastName: session.teacher.lastName,
      },
      users: session.participants.map((p: any) => p.user.id),
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    }));

    res.status(200).json(response);
  }

  async getById(req: AuthRequest, res: Response) {
    const { id } = req.params as { id: string };
    const sessionId = parseId(id, "Session");

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
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

    const response: any = {
      id: session.id,
      name: session.name,
      date: session.date,
      description: session.description,
      teacher: {
        id: session.teacher.id,
        firstName: session.teacher.firstName,
        lastName: session.teacher.lastName,
      },
      users: session.participants.map((p: any) => p.user.id),
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };

    res.status(200).json(response);
  }

  async create(req: AuthRequest, res: Response) {
    const { name, date, description, teacherId } = req.body;

    if (!name) throw new BadRequestError("Name is required");
    if (!date) throw new BadRequestError("Date is required");
    if (!description) throw new BadRequestError("Description is required");
    if (!teacherId) throw new BadRequestError("Teacher ID is required");

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

    const response: any = {
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

  async update(req: AuthRequest, res: Response) {
    const { id } = req.params as { id: string };
    const { name, date, description, teacherId } = req.body;
    const sessionId = parseId(id, "Session");

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    assertIsAdmin(user);

    const existingSession = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!existingSession) throw new NotFoundError("Session not found");

    const updateData: any = {};
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
      where: { id: sessionId },
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

    const response: any = {
      id: session.id,
      name: session.name,
      date: session.date,
      description: session.description,
      teacher: {
        id: session.teacher.id,
        firstName: session.teacher.firstName,
        lastName: session.teacher.lastName,
      },
      users: session.participants.map((p: any) => p.user.id),
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };

    res.status(200).json(response);
  }

  async delete(req: AuthRequest, res: Response) {
    const { id } = req.params as { id: string };
    const sessionId = parseId(id, "Session");

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    assertIsAdmin(user);

    const existingSession = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!existingSession) throw new NotFoundError("Session not found");

    await prisma.session.delete({
      where: { id: sessionId },
    });

    res.status(200).json({ message: "Session deleted successfully" });
  }

  async participate(req: AuthRequest, res: Response) {
    const { id, userId } = req.params as { id: string; userId: string };
    const sessionId = parseId(id, "Session");
    const participantUserId = parseId(userId, "User");

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw new NotFoundError("Session not found");

    const user = await prisma.user.findUnique({
      where: { id: participantUserId },
    });

    if (!user) throw new NotFoundError("User not found");

    const existingParticipation = await prisma.sessionParticipation.findUnique({
      where: {
        sessionId_userId: {
          sessionId,
          userId: participantUserId,
        },
      },
    });

    if (existingParticipation)
      throw new ConflictError("User already participating in this session");

    await prisma.sessionParticipation.create({
      data: {
        sessionId,
        userId: participantUserId,
      },
    });

    res.status(200).json({ message: "Successfully joined the session" });
  }

  async unparticipate(req: AuthRequest, res: Response) {
    const { id, userId } = req.params as { id: string; userId: string };
    const sessionId = parseId(id, "Session");
    const participantUserId = parseId(userId, "User");

    const participation = await prisma.sessionParticipation.findUnique({
      where: {
        sessionId_userId: {
          sessionId,
          userId: participantUserId,
        },
      },
    });

    if (!participation) throw new NotFoundError("Participation not found");

    await prisma.sessionParticipation.delete({
      where: {
        sessionId_userId: {
          sessionId,
          userId: participantUserId,
        },
      },
    });

    res.status(200).json({ message: "Successfully left the session" });
  }
}
