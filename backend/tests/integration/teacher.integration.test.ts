import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { generateToken } from "../../src/common/utils/jwt.util";
import { mockTeacher, mockTeachers } from "../fixtures/teacher.fixture";
import { mockUser } from "../fixtures/user.fixture";
import { prisma } from "../../src/prisma";
import app from "../../src/app";

vi.mock("../../src/prisma", () => ({
  prisma: {
    teacher: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

const token = generateToken(mockUser.id);

describe("Teacher Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/teacher", () => {
    it("should return 200 with all teachers", async () => {
      vi.mocked(prisma.teacher.findMany).mockResolvedValue(mockTeachers);
      const res = await request(app)
        .get("/api/teacher")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(mockTeachers.length);
      expect(res.body[0]).toEqual({
        id: expect.any(Number),
        firstName: expect.any(String),
        lastName: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it("should return an empty array if no teachers", async () => {
      vi.mocked(prisma.teacher.findMany).mockResolvedValue([]);

      const res = await request(app)
        .get("/api/teacher")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("should return 401 if no token provided", async () => {
      const res = await request(app).get("/api/teacher");

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/teacher/:id", () => {
    it("should return 200 with teacher data", async () => {
      vi.mocked(prisma.teacher.findUnique).mockResolvedValue(mockTeacher);
      const res = await request(app)
        .get(`/api/teacher/${mockTeacher.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        id: mockTeacher.id,
        firstName: mockTeacher.firstName,
        lastName: mockTeacher.lastName,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it("should return 404 if teacher does not exist", async () => {
      vi.mocked(prisma.teacher.findUnique).mockResolvedValue(null);
      const res = await request(app)
        .get("/api/teacher/99999")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: "Teacher not found" });
    });

    it("should return 401 if no token provided", async () => {
      const res = await request(app).get("/api/teacher/1");

      expect(res.status).toBe(401);
    });
  });
});
