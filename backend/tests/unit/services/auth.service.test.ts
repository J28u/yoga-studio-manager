import { describe, it, expect, beforeEach, vi } from "vitest";
import { AuthService } from "../../../src/auth/auth.service";
import { UserRepository } from "../../../src/user/user.repository";
import { mockUser } from "../../fixtures/user.fixture";
import { mockAuthResponse } from "../../fixtures/auth.fixture";
import {
  ConflictError,
  UnauthorizedError,
} from "../../../src/middleware/errors";

import bcrypt from "bcrypt";

vi.mock("bcrypt");

describe("AuthService", () => {
  let authService: AuthService;
  let userRepository: UserRepository;

  beforeEach(() => {
    vi.clearAllMocks();

    userRepository = {
      findOne: vi.fn(),
      findOneByEmail: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as unknown as UserRepository;

    authService = new AuthService(userRepository);
  });

  describe("login", () => {
    it("should return user authentication info", async () => {
      vi.mocked(userRepository.findOneByEmail).mockResolvedValue(mockUser);
      vi.spyOn(bcrypt, "compare").mockResolvedValue(true as never);
      const result = await authService.login(mockUser.email, mockUser.password);

      expect(result).toEqual({
        ...mockAuthResponse,
        token: expect.any(String),
      });

      expect(userRepository.findOneByEmail).toHaveBeenCalledOnce();
    });

    it("should throw UnauthorizedError when user does not exist", async () => {
      vi.mocked(userRepository.findOneByEmail).mockResolvedValue(null);
      await expect(
        authService.login("wrongemail@test.com", mockUser.password),
      ).rejects.toThrow(UnauthorizedError);

      expect(userRepository.findOneByEmail).toHaveBeenCalledOnce();
    });

    it("should throw UnauthorizedError when password is wrong", async () => {
      vi.mocked(userRepository.findOneByEmail).mockResolvedValue(mockUser);
      vi.spyOn(bcrypt, "compare").mockResolvedValue(false as never);

      await expect(
        authService.login(mockUser.email, "wrongpassword"),
      ).rejects.toThrow(UnauthorizedError);

      expect(userRepository.findOneByEmail).toHaveBeenCalledOnce();
    });
  });

  describe("register", () => {
    it("should return user authentication info", async () => {
      vi.mocked(userRepository.findOneByEmail).mockResolvedValue(null);
      vi.mocked(userRepository.create).mockResolvedValue(mockUser);
      vi.spyOn(bcrypt, "hash").mockResolvedValue("hashedPassword" as never);

      const result = await authService.register(
        mockUser.email,
        mockUser.password,
        mockUser.firstName,
        mockUser.lastName,
      );

      expect(result).toEqual({
        ...mockAuthResponse,
        token: expect.any(String),
      });
      expect(userRepository.findOneByEmail).toHaveBeenCalledOnce();
      expect(userRepository.create).toHaveBeenCalledOnce();
      expect(bcrypt.hash).toHaveBeenCalledWith(mockUser.password, 10);
    });

    it("should throw ConflictError when email already exists", async () => {
      vi.mocked(userRepository.findOneByEmail).mockResolvedValue(mockUser);

      await expect(
        authService.register(
          mockUser.email,
          mockUser.password,
          mockUser.firstName,
          mockUser.lastName,
        ),
      ).rejects.toThrow(ConflictError);

      expect(userRepository.findOneByEmail).toHaveBeenCalledOnce();
    });
  });
});
