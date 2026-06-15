import { describe, it, expect } from "vitest";
import { generateToken, verifyToken } from "../../../src/common/utils/jwt.util";

describe("jwt.util", () => {
  it("should return the userId from a valid token", () => {
    const token = generateToken(25);

    const decoded = verifyToken(token);

    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(25);
  });

  it("should return null for an invalid token", () => {
    expect(verifyToken("invalid-token")).toBeNull();
  });
});
