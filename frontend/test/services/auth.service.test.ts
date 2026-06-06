import { describe, it, expect, beforeEach } from "vitest";
import { authService } from "../../src/services/auth.service";
import { AuthResponse, LoginCredentials } from "../../src/types";
import { server } from "../__mocks__/server";
import { http, HttpResponse } from "msw";
import {
  MOCK_AUTH_RESPONSE_ADMIN,
  MOCK_AUTH_RESPONSE_USER,
  MOCK_LOGIN_CREDENTIALS,
  MOCK_REGISTER_DATA,
} from "../__mocks__/fixtures";

describe("authService.login", () => {
  beforeEach(() => localStorage.clear());

  it("should return AuthResponse on valid credentials", async () => {
    const result: AuthResponse = await authService.login(
      MOCK_LOGIN_CREDENTIALS,
    );
    expect(result).toEqual(MOCK_AUTH_RESPONSE_ADMIN);
  });

  it("should store token in localStorage after login", async () => {
    await authService.login(MOCK_LOGIN_CREDENTIALS);
    expect(localStorage.getItem("token")).toBe(MOCK_AUTH_RESPONSE_ADMIN.token);
  });

  it("should store user data in localStorage after login", async () => {
    const result = await authService.login(MOCK_LOGIN_CREDENTIALS);
    const storedUser = JSON.parse(localStorage.getItem("user")!);
    expect(storedUser).toEqual(result);
  });

  it("should throw on 401 unauthorized", async () => {
    const credentials: LoginCredentials = {
      email: "wrong-email@test.com",
      password: "wrongpassword",
    };

    server.use(
      http.post("/api/auth/login", () => {
        return HttpResponse.json("Invalid credentials", { status: 401 });
      }),
    );

    await expect(authService.login(credentials)).rejects.toThrow();
  });
});

describe("authService.register", () => {
  beforeEach(() => localStorage.clear());

  it("should return AuthResponse on valid register data", async () => {
    const result: AuthResponse = await authService.register(MOCK_REGISTER_DATA);
    expect(result).toEqual(MOCK_AUTH_RESPONSE_USER);
  });

  it("should store token in localStorage after registration", async () => {
    const result: AuthResponse = await authService.register(MOCK_REGISTER_DATA);
    expect(localStorage.getItem("token")).toBe(result.token);
  });

  it("should store user data in localStorage after registration", async () => {
    const result: AuthResponse = await authService.register(MOCK_REGISTER_DATA);
    const storedUser = JSON.parse(localStorage.getItem("user")!);
    expect(storedUser).toEqual(result);
  });

  it("should throw on 409 Conflict", async () => {
    server.use(
      http.post("/api/auth/register", () => {
        return HttpResponse.json("Email already exists", { status: 409 });
      }),
    );

    await expect(authService.register(MOCK_REGISTER_DATA)).rejects.toThrow();
  });
});

describe("authService.logout", () => {
  beforeEach(() => localStorage.clear());

  it("should remove token from localStorage after logout", () => {
    localStorage.setItem("token", MOCK_AUTH_RESPONSE_USER.token);
    authService.logout();
    expect(localStorage.getItem("token")).toBe(null);
  });

  it("should remove user data from localStorage after logout", () => {
    localStorage.setItem("user", JSON.stringify(MOCK_AUTH_RESPONSE_USER));
    authService.logout();
    expect(localStorage.getItem("user")).toBe(null);
  });
});

describe("authService.getCurrentUser", () => {
  beforeEach(() => localStorage.clear());

  it("should return logged in user info", () => {
    localStorage.setItem("user", JSON.stringify(MOCK_AUTH_RESPONSE_USER));
    const result = authService.getCurrentUser();
    expect(result).toEqual(MOCK_AUTH_RESPONSE_USER);
  });

  it("should return when no user is logged in", () => {
    const result = authService.getCurrentUser();
    expect(result).toBeNull();
  });
});

describe("authService.updateCurrentUser", () => {
  beforeEach(() => localStorage.clear());

  it("should return modified user info", () => {
    const user = MOCK_AUTH_RESPONSE_USER;
    localStorage.setItem("user", JSON.stringify(user));

    const updates = {
      email: "vinyasa@studio.com",
      firstName: "Ray",
      lastName: "Doedoe",
    };

    const result = authService.updateCurrentUser(updates);

    expect(result).toEqual({ ...user, ...updates });
  });

  it("should store updated user in localStorage", () => {
    const user = MOCK_AUTH_RESPONSE_USER;
    localStorage.setItem("user", JSON.stringify(user));

    const updates = {
      email: "vinyasa@studio.com",
      firstName: "Ray",
      lastName: "Doedoe",
    };

    authService.updateCurrentUser(updates);
    const storedUser = JSON.parse(localStorage.getItem("user")!);

    expect(storedUser).toEqual({ ...user, ...updates });
  });

  it("should return when no user is logged in", () => {
    const result = authService.updateCurrentUser({
      firstName: "Ray",
    });

    expect(result).toBeNull();
  });
});

describe("authService.getToken", () => {
  beforeEach(() => localStorage.clear());

  it("should return token", () => {
    const token: string = MOCK_AUTH_RESPONSE_ADMIN.token;
    localStorage.setItem("token", token);

    const storedToken = authService.getToken();
    expect(storedToken).toBe(token);
  });

  it("should return null when no token is stored in localStorage", () => {
    const storedToken = authService.getToken();
    expect(storedToken).toBeNull();
  });
});

describe("authService.isAuthenticated", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should return true", () => {
    localStorage.setItem("token", MOCK_AUTH_RESPONSE_ADMIN.token);
    const isAuthenticated = authService.isAuthenticated();
    expect(isAuthenticated).toBe(true);
  });

  it("should return false", () => {
    const isAuthenticated = authService.isAuthenticated();
    expect(isAuthenticated).toBe(false);
  });
});
