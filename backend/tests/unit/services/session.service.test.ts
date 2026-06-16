import { describe, it, expect, beforeEach, vi } from "vitest";

import { SessionService } from "../../../src/session/session.service";
import { SessionRepository } from "../../../src/session/session.repository";
import { UserRepository } from "../../../src/user/user.repository";
import { TeacherRepository } from "../../../src/teacher/teacher.repository";
import { ParticipationRepository } from "../../../src/participation/participation.repository";
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from "../../../src/middleware/errors";
import { mockUser, mockAdminUser } from "../../fixtures/user.fixture";
import { mockTeacher } from "../../fixtures/teacher.fixture";
import { mockSession } from "../../fixtures/session.fixture";

describe("SessionService", () => {
  let service: SessionService;

  let sessionRepository: SessionRepository;
  let userRepository: UserRepository;
  let teacherRepository: TeacherRepository;
  let participationRepository: ParticipationRepository;

  beforeEach(() => {
    sessionRepository = {
      findAll: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as unknown as SessionRepository;

    userRepository = {
      findOne: vi.fn(),
    } as unknown as UserRepository;

    teacherRepository = {
      findOne: vi.fn(),
    } as unknown as TeacherRepository;

    participationRepository = {
      findOne: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    } as unknown as ParticipationRepository;

    service = new SessionService(
      sessionRepository,
      userRepository,
      teacherRepository,
      participationRepository,
    );
  });

  describe("getAll", () => {
    it("should return all sessions", async () => {
      vi.mocked(sessionRepository.findAll).mockResolvedValue([mockSession]);
      const result = await service.getAll();

      expect(result).toHaveLength(1);
    });

    it("should return empty array", async () => {
      vi.mocked(sessionRepository.findAll).mockResolvedValue([]);

      const result = await service.getAll();

      expect(result).toEqual([]);
    });
  });

  describe("getBydId", () => {
    it("should return session", async () => {
      vi.mocked(sessionRepository.findOne).mockResolvedValue(mockSession);
      const result = await service.getById(1);

      expect(result.id).toBe(1);
    });

    it("should throw NotFoundError", async () => {
      vi.mocked(sessionRepository.findOne).mockResolvedValue(null);

      await expect(service.getById(1)).rejects.toThrow(NotFoundError);
    });
  });

  describe("create", () => {
    it("should throw NotFoundError when user does not exist", async () => {
      vi.mocked(userRepository.findOne).mockResolvedValue(null);
      await expect(
        service.create(1, 1, "Yoga", "2025-01-01", "Description"),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw ForbiddenError when user is not admin", async () => {
      vi.mocked(userRepository.findOne).mockResolvedValue(mockUser);

      await expect(
        service.create(1, 1, "Yoga", "2025-01-01", "Description"),
      ).rejects.toThrow(ForbiddenError);
    });

    it("should create session", async () => {
      vi.mocked(userRepository.findOne).mockResolvedValue(mockAdminUser);

      vi.mocked(teacherRepository.findOne).mockResolvedValue(mockTeacher);

      vi.mocked(sessionRepository.create).mockResolvedValue(mockSession);

      const result = await service.create(
        1,
        1,
        "Yoga Release",
        "2026-06-09T10:24:09.065Z",
        "In this practice you are givent the opportunity to dance with all that comes up for you. What would happen if you held yourself, like a dear friend?",
      );

      expect(result.id).toBe(1);
      expect(sessionRepository.create).toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("should throw NotFoundError when admin user does not exist", async () => {
      vi.mocked(userRepository.findOne).mockResolvedValue(null);
      await expect(service.update(1, 1)).rejects.toThrow(NotFoundError);
    });

    it("should throw ForbiddenError when user is not admin", async () => {
      vi.mocked(userRepository.findOne).mockResolvedValue(mockUser);

      await expect(service.update(1, 1)).rejects.toThrow(ForbiddenError);
    });

    it("should throw NotFoundError when session does not exist", async () => {
      vi.mocked(userRepository.findOne).mockResolvedValue(mockAdminUser);

      vi.mocked(sessionRepository.findOne).mockResolvedValue(null);

      await expect(service.update(1, 1)).rejects.toThrow(NotFoundError);
    });

    it("should update session", async () => {
      vi.mocked(userRepository.findOne).mockResolvedValue(mockAdminUser);

      vi.mocked(sessionRepository.findOne).mockResolvedValue(mockSession);

      vi.mocked(sessionRepository.update).mockResolvedValue(mockSession);

      const result = await service.update(1, 1, "New Name");

      expect(result.id).toBe(1);
      expect(sessionRepository.update).toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("should throw NotFoundError when admin user does not exist", async () => {
      vi.mocked(userRepository.findOne).mockResolvedValue(null);
      await expect(service.delete(1, 1)).rejects.toThrow(NotFoundError);
    });

    it("should throw ForbiddenError when user is not admin", async () => {
      vi.mocked(userRepository.findOne).mockResolvedValue(mockUser);

      await expect(service.delete(1, 1)).rejects.toThrow(ForbiddenError);
    });

    it("should throw NotFoundError when session does not exist", async () => {
      vi.mocked(userRepository.findOne).mockResolvedValue(mockAdminUser);

      vi.mocked(sessionRepository.findOne).mockResolvedValue(null);

      await expect(service.delete(1, 1)).rejects.toThrow(NotFoundError);
    });

    it("should delete session", async () => {
      vi.mocked(userRepository.findOne).mockResolvedValue(mockAdminUser);

      vi.mocked(sessionRepository.findOne).mockResolvedValue(mockSession);

      await service.delete(1, 1);

      expect(sessionRepository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe("participate", () => {
    it("should throw NotFoundError when session does not exist", async () => {
      vi.mocked(sessionRepository.findOne).mockResolvedValue(null);
      await expect(service.participate(1, 1)).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError when user does not exist", async () => {
      vi.mocked(sessionRepository.findOne).mockResolvedValue(mockSession);

      vi.mocked(userRepository.findOne).mockResolvedValue(null);

      await expect(service.participate(1, 1)).rejects.toThrow(NotFoundError);
    });

    it("should throw ConflictError when already participating", async () => {
      vi.mocked(sessionRepository.findOne).mockResolvedValue(mockSession);

      vi.mocked(userRepository.findOne).mockResolvedValue(mockUser);

      vi.mocked(participationRepository.findOne).mockResolvedValue({
        sessionId: 1,
        userId: 1,
      });

      await expect(service.participate(1, 1)).rejects.toThrow(ConflictError);
    });

    it("should create participation", async () => {
      vi.mocked(sessionRepository.findOne).mockResolvedValue(mockSession);

      vi.mocked(userRepository.findOne).mockResolvedValue(mockUser);

      vi.mocked(participationRepository.findOne).mockResolvedValue(null);

      await service.participate(1, 1);

      expect(participationRepository.create).toHaveBeenCalledWith(1, 1);
    });
  });

  describe("unparticipate", () => {
    it("should throw NotFoundError when participation does not exist", async () => {
      vi.mocked(participationRepository.findOne).mockResolvedValue(null);
      await expect(service.unparticipate(1, 1)).rejects.toThrow(NotFoundError);
    });

    it("should delete participation", async () => {
      vi.mocked(participationRepository.findOne).mockResolvedValue({
        sessionId: 1,
        userId: 1,
      });

      await service.unparticipate(1, 1);

      expect(participationRepository.delete).toHaveBeenCalledWith(1, 1);
    });
  });
});
