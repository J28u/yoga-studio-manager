import {
  describe,
  it,
  vi,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "vitest";
import request from "supertest";
import { prisma } from "../../src/prisma";
import { mockUser } from "../fixtures/user.fixture";
import app from "../../src/app";
import * as bcrypt from "bcrypt";

vi.mock("../../src/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("Auth Routes", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("POST /api/auth/register", () => {
    it("should register a new user and return 201", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      const hashedPassword = await bcrypt.hash(mockUser.password, 10);
      vi.mocked(prisma.user.create).mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });

      const res = await request(app).post("/api/auth/register").send({
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        password: mockUser.password,
      });

      expect(res.status).toBe(201);
      expect(res.body.email).toBe(mockUser.email);
      expect(res.body.firstName).toBe(mockUser.firstName);
      expect(res.body.lastName).toBe(mockUser.lastName);
      expect(res.body).toHaveProperty("token");
    });

    it("should return 409 if email already exists", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      const hashedPassword = await bcrypt.hash(mockUser.password, 10);
      vi.mocked(prisma.user.create).mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });

      const res = await request(app).post("/api/auth/register").send({
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        password: mockUser.password,
      });

      expect(res.status).toBe(409);
      expect(res.body).toEqual({ message: "Email already exists" });
    });

    it("should return 400 if body is invalid", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "not-an-email" });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login and return 200 with a token", async () => {
      const hashedPassword = await bcrypt.hash(mockUser.password, 10);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: mockUser.email, password: mockUser.password });

      expect(res.status).toBe(200);
      expect(res.body.email).toBe(mockUser.email);
      expect(res.body.firstName).toBe(mockUser.firstName);
      expect(res.body.lastName).toBe(mockUser.lastName);
      expect(res.body).toHaveProperty("token");
    });

    it("should return 401 if user does not exist", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "unknown@test.com", password: mockUser.password });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ message: "Invalid credentials" });
    });

    it("should return 401 if password is wrong", async () => {
      const hashedPassword = await bcrypt.hash(mockUser.password, 10);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: mockUser.email, password: "wrongpassword" });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ message: "Invalid credentials" });
    });

    it("should return 400 if body is invalid", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "not-an-email" });

      expect(res.status).toBe(400);
    });
  });
});
