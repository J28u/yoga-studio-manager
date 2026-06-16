import { Router, Request } from "express";
import { PrismaClient } from "@prisma/client";
import { UserRepository } from "../user/user.repository";
import { AuthService } from "../auth/auth.service";
import { AuthController } from "../auth/auth.controller";
import { SessionController } from "../session/session.controller";
import { TeacherController } from "../teacher/teacher.controller";
import { UserController } from "../user/user.controller";
import {
  AuthenticatedRequest,
  authMiddleware,
} from "../middleware/auth.middleware";
import { asyncHandler } from "../middleware/asyncHandler";
import { SessionRepository } from "../session/session.repository";
import { TeacherRepository } from "../teacher/teacher.repository";
import { ParticipationRepository } from "../participation/participation.repository";
import { SessionService } from "../session/session.service";
import { TeacherService } from "../teacher/teacher.service";
import { UserService } from "../user/user.service";
import { prisma } from "../../src/prisma";

const router = Router();

// Repositories
const userRepository = new UserRepository(prisma);
const sessionRepository = new SessionRepository(prisma);
const teacherRepository = new TeacherRepository(prisma);
const participationRepository = new ParticipationRepository(prisma);

// Services
const authService = new AuthService(userRepository);
const userService = new UserService(userRepository);
const teacherService = new TeacherService(teacherRepository);
const sessionService = new SessionService(
  sessionRepository,
  userRepository,
  teacherRepository,
  participationRepository,
);

// Controllers
const authController = new AuthController(authService);
const userController = new UserController(userService);
const teacherController = new TeacherController(teacherService);
const sessionController = new SessionController(sessionService);

// Auth routes (public)
router.post(
  "/api/auth/login",
  asyncHandler<Request>((req, res) => authController.login(req, res)),
);
router.post(
  "/api/auth/register",
  asyncHandler<Request>((req, res) => authController.register(req, res)),
);

// Session routes (protected)
router.get(
  "/api/session",
  authMiddleware,
  asyncHandler<AuthenticatedRequest>((req, res) =>
    sessionController.getAll(req, res),
  ),
);
router.get(
  "/api/session/:id",
  authMiddleware,
  asyncHandler<AuthenticatedRequest>((req, res) =>
    sessionController.getById(req, res),
  ),
);
router.post(
  "/api/session",
  authMiddleware,
  asyncHandler<AuthenticatedRequest>((req, res) =>
    sessionController.create(req, res),
  ),
);
router.put(
  "/api/session/:id",
  authMiddleware,
  asyncHandler<AuthenticatedRequest>((req, res) =>
    sessionController.update(req, res),
  ),
);
router.delete(
  "/api/session/:id",
  authMiddleware,
  asyncHandler<AuthenticatedRequest>((req, res) =>
    sessionController.delete(req, res),
  ),
);
router.post(
  "/api/session/:id/participate/:userId",
  authMiddleware,
  asyncHandler<AuthenticatedRequest>((req, res) =>
    sessionController.participate(req, res),
  ),
);
router.delete(
  "/api/session/:id/participate/:userId",
  authMiddleware,
  asyncHandler<AuthenticatedRequest>((req, res) =>
    sessionController.unparticipate(req, res),
  ),
);

// Teacher routes (protected)
router.get(
  "/api/teacher",
  authMiddleware,
  asyncHandler<AuthenticatedRequest>((req, res) =>
    teacherController.getAll(req, res),
  ),
);
router.get(
  "/api/teacher/:id",
  authMiddleware,
  asyncHandler<AuthenticatedRequest>((req, res) =>
    teacherController.getById(req, res),
  ),
);

// User routes (protected)
router.get(
  "/api/user/:id",
  authMiddleware,
  asyncHandler<AuthenticatedRequest>((req, res) =>
    userController.getById(req, res),
  ),
);
router.post(
  "/api/user/promote-admin",
  authMiddleware,
  asyncHandler<AuthenticatedRequest>((req, res) =>
    userController.promoteSelfToAdmin(req, res),
  ),
);
router.delete(
  "/api/user/:id",
  authMiddleware,
  asyncHandler<AuthenticatedRequest>((req, res) =>
    userController.delete(req, res),
  ),
);

export default router;
