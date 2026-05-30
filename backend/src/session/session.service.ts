import { SessionRepository } from "./session.repository";
import { NotFoundError, ConflictError } from "../middleware/errors";
import { assertIsAdmin } from "../common/utils/guards";
import {
  SessionWithParticipants,
  UpdateSession,
} from "./interfaces/session.interface";
import { SessionResponseDto } from "./dto/session-response.dto";
import { UserRepository } from "../user/user.repository";
import { TeacherRepository } from "../teacher/teacher.repository";
import { Participant } from "../participation/participation.interface";
import { ParticipationRepository } from "../participation/participation.repository";

export class SessionService {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly userRepository: UserRepository,
    private readonly teacherRepository: TeacherRepository,
    private readonly participationRepository: ParticipationRepository,
  ) {}

  async getAll(): Promise<SessionResponseDto[]> {
    const sessions = await this.sessionRepository.findAll();

    return sessions.map((session: SessionWithParticipants) => ({
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
    }));
  }

  async getBydId(id: number): Promise<SessionResponseDto> {
    const session = await this.sessionRepository.findOne(id);
    if (!session) throw new NotFoundError("Session not found");

    return {
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
  }

  async create(
    userId: number,
    teacherId: number,
    name: string,
    date: string,
    description: string,
  ): Promise<SessionResponseDto> {
    const user = await this.userRepository.findOne(userId);
    assertIsAdmin(user);

    const teacher = this.teacherRepository.findOne(teacherId);
    if (!teacher) throw new NotFoundError("Teacher not found");

    const session = await this.sessionRepository.create({
      name,
      date: new Date(date),
      description,
      teacherId,
    });

    return {
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
  }

  async update(
    userId: number,
    sessionId: number,
    name?: string,
    date?: string,
    description?: string,
    teacherId?: number,
  ): Promise<SessionResponseDto> {
    const user = await this.userRepository.findOne(userId);
    assertIsAdmin(user);

    const existingSession = await this.sessionRepository.findOne(sessionId);
    if (!existingSession) throw new NotFoundError("Session not found");

    const updateData: UpdateSession = {};
    if (name) updateData.name = name;
    if (date) updateData.date = new Date(date);
    if (description) updateData.description = description;

    if (teacherId) {
      const teacher = await this.teacherRepository.findOne(teacherId);
      if (!teacher) throw new NotFoundError("Teacher not found");
      updateData.teacherId = teacherId;
    }

    const session = await this.sessionRepository.update(sessionId, updateData);

    return {
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
  }

  async detete(userId: number, sessionId: number): Promise<void> {
    const user = await this.userRepository.findOne(userId);
    assertIsAdmin(user);

    const existingSession = await this.sessionRepository.findOne(sessionId);
    if (!existingSession) throw new NotFoundError("Session not found");

    await this.sessionRepository.delete(sessionId);
  }

  async participate(userId: number, sessionId: number): Promise<void> {
    const session = await this.sessionRepository.findOne(sessionId);
    if (!session) throw new NotFoundError("Session not found");

    const user = await this.userRepository.findOne(userId);
    if (!user) throw new NotFoundError("User not found");

    const existingParticipation = await this.participationRepository.findOne(
      sessionId,
      userId,
    );

    if (existingParticipation)
      throw new ConflictError("User already participating in this session");

    await this.participationRepository.create(sessionId, userId);
  }

  async unparticipate(userId: number, sessionId: number): Promise<void> {
    const participation = await this.participationRepository.findOne(
      sessionId,
      userId,
    );
    if (!participation) throw new NotFoundError("Participation not found");

    await this.participationRepository.delete(sessionId, userId);
  }
}
