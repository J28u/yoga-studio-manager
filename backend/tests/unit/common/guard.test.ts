import { it, describe, expect } from "vitest";
import { assertIsAdmin, parseRequest } from "../../../src/common/utils/guards";
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from "../../../src/middleware/errors";
import { mockUser } from "../../fixtures/user.fixture";
import { z } from "zod";
import { beforeEach } from "node:test";

describe("guard", () => {
  describe("assertIsAdmin", () => {
    it("should throw NotFoundError if user is null", () => {
      expect(() => assertIsAdmin(null)).toThrow(NotFoundError);
    });

    it("should throw ForbiddenError if user is not admin", () => {
      expect(() => assertIsAdmin({ ...mockUser, admin: false })).toThrow(
        ForbiddenError,
      );
    });

    it("should not throw if user is admin", () => {
      expect(() => assertIsAdmin({ ...mockUser, admin: true })).not.toThrow();
    });
  });

  describe("parseRequest", () => {
    const schema = z.object({
      name: z.string(),
    });
    it("should throw BadRequestError if data is invalid", () => {
      expect(() => parseRequest({}, schema)).toThrow(BadRequestError);
    });

    it("should return parsed data if valid", () => {
      expect(parseRequest({ name: "John" }, schema)).toEqual({ name: "John" });
    });
  });
});
