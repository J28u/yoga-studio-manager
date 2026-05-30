import { PrismaClient } from "@prisma/client";
import {
  CreateSession,
  SessionWithParticipants,
  UpdateSession,
} from "./interfaces/session.interface";

export class SessionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<SessionWithParticipants[]> {
    return this.prisma.session.findMany({
      include: {
        teacher: true,
        participants: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async findOne(id: number): Promise<SessionWithParticipants | null> {
    return this.prisma.session.findUnique({
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
  }

  async create(data: CreateSession): Promise<SessionWithParticipants> {
    return this.prisma.session.create({
      data,
      include: {
        teacher: true,
        participants: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async update(
    id: number,
    updateData: UpdateSession,
  ): Promise<SessionWithParticipants> {
    return this.prisma.session.update({
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
  }

  async delete(id: number): Promise<void> {
    await this.prisma.session.delete({
      where: { id },
    });
  }
}
