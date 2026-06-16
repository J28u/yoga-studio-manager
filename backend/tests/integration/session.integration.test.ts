import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { generateToken } from "../../src/common/utils/jwt.util";
import { mockSession, mockSessions } from "../fixtures/session.fixture";
import { mockAdminUser, mockUser } from "../fixtures/user.fixture";
import { prisma } from "../../src/prisma";
import app from "../../src/app";
import { mockParticipation } from "../fixtures/participation.fixture";

vi.mock("../../src/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    teacher: {
      findUnique: vi.fn(),
    },
    session: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    sessionParticipation: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const token = generateToken(mockUser.id);
const adminToken = generateToken(mockAdminUser.id);

describe("Session Routes", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("GET /api/session", () => {
    it("should return 200 with all sessions", async () => {
      vi.mocked(prisma.session.findMany).mockResolvedValue(mockSessions);
      const res = await request(app)
        .get("/api/session")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    it("should return an empty array if no sessions", async () => {
      vi.mocked(prisma.session.findMany).mockResolvedValue([]);
      const res = await request(app)
        .get("/api/session")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("should return 401 if no token provided", async () => {
      const res = await request(app).get("/api/session");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/session/:id", () => {
    it("should return 200 with session data", async () => {
      vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession);
      const res = await request(app)
        .get(`/api/session/${mockSession.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe(mockSession.name);
      expect(res.body.description).toBe(mockSession.description);
    });

    it("should return 404 if session does not exist", async () => {
      vi.mocked(prisma.session.findUnique).mockResolvedValue(null);
      const res = await request(app)
        .get("/api/session/99999")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: "Session not found" });
    });

    it("should return 401 if no token provided", async () => {
      const res = await request(app).get(`/api/session/${mockSession.id}`);
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/session", () => {
    it("should return 201 and create a session if user is admin", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockAdminUser);
      vi.mocked(prisma.teacher.findUnique).mockResolvedValue(
        mockSession.teacher,
      );
      vi.mocked(prisma.session.create).mockResolvedValue(mockSession);

      const res = await request(app)
        .post("/api/session")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: mockSession.name,
          date: mockSession.date,
          description: mockSession.description,
          teacherId: mockSession.teacherId,
        });

      expect(res.status).toBe(201);
    });

    it("should return 403 if user is not admin", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      const res = await request(app)
        .post("/api/session")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: mockSession.name,
          date: mockSession.date,
          description: mockSession.description,
          teacherId: mockSession.teacherId,
        });

      expect(res.status).toBe(403);
    });

    it("should return 404 if teacher does not exist", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockAdminUser);
      vi.mocked(prisma.teacher.findUnique).mockResolvedValue(null);

      const res = await request(app)
        .post("/api/session")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ ...mockSession, teacherId: 99999 });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: "Teacher not found" });
    });

    it("should return 400 if body is invalid", async () => {
      const res = await request(app)
        .post("/api/session")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Session sans date" });

      expect(res.status).toBe(400);
    });

    it("should return 401 if no token provided", async () => {
      const res = await request(app).post("/api/session").send(mockSession);
      expect(res.status).toBe(401);
    });
  });

  describe("PUT /api/session/:id", () => {
    it("should return 200 and update the session if user is admin", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockAdminUser);
      vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession);
      vi.mocked(prisma.teacher.findUnique).mockResolvedValue(
        mockSession.teacher,
      );
      vi.mocked(prisma.session.update).mockResolvedValue({
        ...mockSession,
        name: "Session mise à jour",
      });
      const res = await request(app)
        .put(`/api/session/${mockSession.id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Session mise à jour" });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Session mise à jour");
    });

    it("should return 403 if user is not admin", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      const res = await request(app)
        .put(`/api/session/${mockSession.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Session mise à jour" });

      expect(res.status).toBe(403);
    });

    it("should return 404 if session does not exist", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockAdminUser);
      vi.mocked(prisma.session.findUnique).mockResolvedValue(null);
      const res = await request(app)
        .put("/api/session/99999")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Session mise à jour" });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: "Session not found" });
    });

    it("should return 401 if no token provided", async () => {
      const res = await request(app)
        .put(`/api/session/${mockSession.id}`)
        .send({ name: "Session mise à jour" });
      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /api/session/:id", () => {
    it("should return 200 and delete the session if user is admin", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockAdminUser);
      vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession);
      vi.mocked(prisma.session.delete).mockResolvedValue(mockSession);

      const res = await request(app)
        .delete(`/api/session/${mockSession.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: "Session deleted successfully" });
    });

    it("should return 403 if user is not admin", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      const res = await request(app)
        .delete(`/api/session/${mockSession.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it("should return 404 if session does not exist", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockAdminUser);
      vi.mocked(prisma.session.findUnique).mockResolvedValue(null);

      const res = await request(app)
        .delete("/api/session/99999")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: "Session not found" });
    });

    it("should return 401 if no token provided", async () => {
      const res = await request(app).delete(`/api/session/${mockSession.id}`);
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/session/:id/participate/:userId", () => {
    it("should return 200 when user joins a session", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession);
      vi.mocked(prisma.sessionParticipation.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.sessionParticipation.create).mockResolvedValue(
        mockParticipation,
      );

      const res = await request(app)
        .post(`/api/session/${mockSession.id}/participate/${mockUser.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: "Successfully joined the session" });
    });

    it("should return 409 if user is already participating", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession);
      vi.mocked(prisma.sessionParticipation.findUnique).mockResolvedValue(
        mockParticipation,
      );

      const res = await request(app)
        .post(`/api/session/${mockSession.id}/participate/${mockUser.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(409);
      expect(res.body).toEqual({
        message: "User already participating in this session",
      });
    });

    it("should return 404 if session does not exist", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(prisma.session.findUnique).mockResolvedValue(null);
      const res = await request(app)
        .post(`/api/session/99999/participate/${mockUser.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: "Session not found" });
    });

    it("should return 401 if no token provided", async () => {
      const res = await request(app).post(
        `/api/session/${mockSession.id}/participate/${mockUser.id}`,
      );
      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /api/session/:id/participate/:userId", () => {
    it("should return 200 when user leaves a session", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession);
      vi.mocked(prisma.sessionParticipation.findUnique).mockResolvedValue(
        mockParticipation,
      );
      vi.mocked(prisma.sessionParticipation.delete).mockResolvedValue(
        mockParticipation,
      );

      const res = await request(app)
        .delete(`/api/session/${mockSession.id}/participate/${mockUser.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: "Successfully left the session" });
    });

    it("should return 404 if participation does not exist", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession);
      vi.mocked(prisma.sessionParticipation.findUnique).mockResolvedValue(null);

      const res = await request(app)
        .delete(`/api/session/${mockSession.id}/participate/${mockUser.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: "Participation not found" });
    });

    it("should return 401 if no token provided", async () => {
      const res = await request(app).delete(
        `/api/session/${mockSession.id}/participate/${mockUser.id}`,
      );
      expect(res.status).toBe(401);
    });
  });
});
