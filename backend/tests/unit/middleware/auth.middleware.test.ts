import { describe, it, expect, vi, beforeEach } from "vitest";
import { Response, NextFunction } from "express";
import {
  authMiddleware,
  AuthRequest,
} from "../../../src/middleware/auth.middleware";
import * as jwtUtil from "../../../src/common/utils/jwt.util";

vi.mock("../../../src/common/utils/jwt.util", () => ({
  verifyToken: vi.fn(),
}));

function createMockReq(authHeader?: string): AuthRequest {
  return {
    headers: {
      authorization: authHeader,
    },
  } as AuthRequest;
}

function createMockRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

describe("authMiddleware", () => {
  let next: NextFunction;

  beforeEach(() => {
    next = vi.fn();
    vi.clearAllMocks();
  });

  it("should return 401 when no authorization header is provided", () => {
    const req = createMockReq();
    const res = createMockRes();

    authMiddleware(req, res as unknown as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "No token provided",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 when token is invalid", () => {
    vi.mocked(jwtUtil.verifyToken).mockReturnValue(null);

    const req = createMockReq("Bearer invalid-token");
    const res = createMockRes();

    authMiddleware(req, res as unknown as Response, next);

    expect(jwtUtil.verifyToken).toHaveBeenCalledWith("invalid-token");

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid or expired token",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should set userId and calls next when token is valid", () => {
    vi.mocked(jwtUtil.verifyToken).mockReturnValue({
      userId: 42,
    });

    const req = createMockReq("Bearer valid-token");
    const res = createMockRes();

    authMiddleware(req, res as unknown as Response, next);

    expect(req.userId).toBe(42);
    expect(next).toHaveBeenCalledOnce();

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
