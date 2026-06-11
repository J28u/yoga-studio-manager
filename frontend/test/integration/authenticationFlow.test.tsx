import { beforeEach, describe, expect, it, vi } from "vitest";
import Login from "../../src/pages/Login";
import Register from "../../src/pages/Register";
import Navbar from "../../src/components/Navbar";
import Sessions from "../../src/pages/Sessions";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  MOCK_AUTH_RESPONSE_USER,
  MOCK_LOGIN_CREDENTIALS,
  MOCK_REGISTER_DATA,
} from "../__mocks__/fixtures";
import { authService } from "../../src/services/auth.service";

vi.mock("../../src/services/auth.service");

describe("Authentication Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUserAuthentication = (userAuth = MOCK_AUTH_RESPONSE_USER) => {
    vi.mocked(authService.getCurrentUser).mockReturnValue(userAuth);
    vi.mocked(authService.getToken).mockReturnValue(userAuth.token);
  };

  it("should login existing user and navigate to /sessions", async () => {
    mockUserAuthentication();
    vi.mocked(authService.login).mockResolvedValue(MOCK_AUTH_RESPONSE_USER);

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/sessions" element={<Sessions />} />
        </Routes>
      </MemoryRouter>,
    );

    const user = userEvent.setup();

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: "Login" });

    await user.type(emailInput, MOCK_LOGIN_CREDENTIALS.email);
    await user.type(passwordInput, MOCK_LOGIN_CREDENTIALS.password);
    await user.click(submitButton);

    expect(await screen.findByText("Yoga Sessions")).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Login to Yoga Studio"),
    ).not.toBeInTheDocument();
  });

  it("should register new user and navigate to /sessions", async () => {
    mockUserAuthentication();
    vi.mocked(authService.register).mockResolvedValue(MOCK_AUTH_RESPONSE_USER);
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/sessions" element={<Sessions />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(
      await screen.findByRole("link", { name: "Register here" }),
    );

    expect(
      await screen.findByText("Register for Yoga Studio"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Login to Yoga Studio")).not.toBeInTheDocument();

    const userInfo = MOCK_REGISTER_DATA;
    await user.type(screen.getByLabelText("First Name"), userInfo.firstName);
    await user.type(screen.getByLabelText("Last Name"), userInfo.lastName);
    await user.type(screen.getByLabelText("Email"), userInfo.email);
    await user.type(screen.getByLabelText("Password"), userInfo.password);

    await user.click(screen.getByRole("button", { name: "Register" }));

    expect(await screen.findByText("Yoga Sessions")).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Login to Yoga Studio"),
    ).not.toBeInTheDocument();
  });

  it("should logout user and navigate to /login", async () => {
    mockUserAuthentication();
    vi.mocked(authService.logout).mockReturnValue();
    vi.mocked(authService.isAuthenticated).mockReturnValue(true);

    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/sessions"]}>
        <Navbar />
        <Routes>
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(await screen.findByRole("button", { name: "Logout" }));

    expect(await screen.findByText("Login to Yoga Studio")).toBeInTheDocument();
    expect(screen.queryByText("Yoga Sessions")).not.toBeInTheDocument();
  });
});
