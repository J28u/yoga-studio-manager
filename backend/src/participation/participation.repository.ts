import { PrismaClient, SessionParticipation } from "@prisma/client";

export class ParticipationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findOne(
    sessionId: number,
    userId: number,
  ): Promise<SessionParticipation | null> {
    return this.prisma.sessionParticipation.findUnique({
      where: {
        sessionId_userId: {
          sessionId,
          userId,
        },
      },
    });
  }

  async create(sessionId: number, userId: number): Promise<void> {
    await this.prisma.sessionParticipation.create({
      data: {
        sessionId,
        userId,
      },
    });
  }

  async delete(sessionId: number, userId: number): Promise<void> {
    await this.prisma.sessionParticipation.delete({
      where: {
        sessionId_userId: {
          sessionId,
          userId,
        },
      },
    });
  }
}
