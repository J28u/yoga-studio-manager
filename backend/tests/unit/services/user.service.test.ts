import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { UserService } from "../../../src/user/user.service";
import { UserRepository } from "../../../src/user/user.repository";
import { ForbiddenError, NotFoundError } from "../../../src/middleware/errors";
import { mockUser, mockAdminUser } from "../../fixtures/user.fixture";

describe("UserService", () => {
  let service: UserService;
  let repository: UserRepository;

  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = originalEnv;
    vi.clearAllMocks();

    repository = {
      findOne: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as unknown as UserRepository;

    service = new UserService(repository);
  });

  describe("getById", () => {
    it("should return user", async () => {
      vi.mocked(repository.findOne).mockResolvedValue(mockUser);

      const result = await service.getById(2);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        admin: mockUser.admin,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });

      expect(repository.findOne).toHaveBeenCalledWith(2);
    });

    it("should throw NotFoundError when user does not exist", async () => {
      vi.mocked(repository.findOne).mockResolvedValue(null);

      await expect(service.getById(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe("delete", () => {
    it("should throw ForbiddenError when deleting another account", async () => {
      await expect(service.delete(2, 1)).rejects.toThrow(ForbiddenError);
    });

    it("should throw NotFoundError when user does not exist", async () => {
      vi.mocked(repository.findOne).mockResolvedValue(null);

      await expect(service.delete(2, 2)).rejects.toThrow(NotFoundError);
    });

    it("should delete user", async () => {
      vi.mocked(repository.findOne).mockResolvedValue(mockUser);

      await service.delete(2, 2);

      expect(repository.delete).toHaveBeenCalledWith(2);
    });
  });

  describe("promoteSelfToAdmin", () => {
    it("should throw ForbiddenError in production", async () => {
      process.env.NODE_ENV = "production";

      await expect(service.promoteSelfToAdmin(2)).rejects.toThrow(
        ForbiddenError,
      );
    });

    it("should throw NotFoundError when user does not exist", async () => {
      process.env.NODE_ENV = "development";

      vi.mocked(repository.findOne).mockResolvedValue(null);

      await expect(service.promoteSelfToAdmin(2)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("should promote user to admin", async () => {
      process.env.NODE_ENV = "development";

      vi.mocked(repository.findOne).mockResolvedValue(mockUser);

      vi.mocked(repository.update).mockResolvedValue(mockAdminUser);

      const result = await service.promoteSelfToAdmin(2);

      expect(repository.update).toHaveBeenCalledWith(2);

      expect(result.admin).toBe(true);
    });

    it("should not update user already admin", async () => {
      process.env.NODE_ENV = "development";

      vi.mocked(repository.findOne).mockResolvedValue(mockAdminUser);

      const result = await service.promoteSelfToAdmin(2);

      expect(repository.update).not.toHaveBeenCalled();

      expect(result.admin).toBe(true);
    });
  });
});
