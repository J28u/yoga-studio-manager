import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { mockAdminUser, mockUser } from "../fixtures/user.fixture";
import { generateToken } from "../../src/common/utils/jwt.util";
import { prisma } from "../../src/prisma";
import app from "../../src/app";

vi.mock("../../src/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const token = generateToken(mockUser.id);

describe("User Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/user/:id", () => {
    it("should return 200 with user data", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      const res = await request(app)
        .get(`/api/user/${mockUser.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        admin: mockUser.admin,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it("should return 404 if user does not exist", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const res = await request(app)
        .get("/api/user/99999")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: "User not found" });
    });

    it("should return 401 if no token provided", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      const res = await request(app).get(`/api/user/${mockUser.id}`);

      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /api/user/:id", () => {
    it("should return 200 if user deletes their own account", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(prisma.user.delete).mockResolvedValue(mockUser);

      const res = await request(app)
        .delete(`/api/user/${mockUser.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: "User deleted successfully" });
    });

    it("should return 403 if user tries to delete another account", async () => {
      const res = await request(app)
        .delete(`/api/user/${mockUser.id + 1}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
      expect(res.body).toEqual({
        message: "You can only delete your own account",
      });
    });

    it("should return 401 if no token provided", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      const res = await request(app).delete(`/api/user/${mockUser.id}`);

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/user/promote-admin", () => {
    it("should return 200 and promote user to admin", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(prisma.user.update).mockResolvedValue({
        ...mockUser,
        admin: true,
      });
      const res = await request(app)
        .post("/api/user/promote-admin")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
    });

    it("should return 200 without changes if user is already admin", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockAdminUser);
      vi.mocked(prisma.user.update).mockResolvedValue(mockAdminUser);

      const res = await request(app)
        .post("/api/user/promote-admin")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.admin).toBe(true);
    });

    it("should return 401 if no token provided", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      const res = await request(app).post("/api/user/promote-admin");

      expect(res.status).toBe(401);
    });
  });
});
