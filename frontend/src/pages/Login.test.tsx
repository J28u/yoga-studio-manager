import { describe, it, expect, vi, beforeEach } from "vitest";
import Login from "./Login";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MOCK_LOGIN_CREDENTIALS } from "../test/mock/fixtures";
import { authService } from "../services/auth.service";
import { AxiosError, AxiosResponse } from "axios";

vi.mock("../services/auth.service");

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Login", () => {
  beforeEach(() => vi.clearAllMocks());
  it("should render login page properly", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    expect(screen.getByText("Login to Yoga Studio")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    expect(screen.getByText("Register here")).toBeInTheDocument();
  });

  it("should disable button and show loading state on submit", async () => {
    vi.mocked(authService.login).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    const user = userEvent.setup();
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    await user.type(emailInput, MOCK_LOGIN_CREDENTIALS.email);
    await user.type(passwordInput, MOCK_LOGIN_CREDENTIALS.password);
    await user.click(screen.getByRole("button", { name: "Login" }));

    const buttonSubmit = await screen.findByRole("button", {
      name: "Loading...",
    });
    expect(buttonSubmit).toBeInTheDocument();
    expect(buttonSubmit).toBeDisabled();
  });

  it("should call login and navigate to sessions on successful login", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: "Login" });

    await user.type(emailInput, MOCK_LOGIN_CREDENTIALS.email);
    await user.type(passwordInput, MOCK_LOGIN_CREDENTIALS.password);
    await user.click(submitButton);

    expect(authService.login).toHaveBeenCalledWith(MOCK_LOGIN_CREDENTIALS);
    expect(mockNavigate).toHaveBeenCalledWith("/sessions");
  });

  it("should display custom error message on Error", async () => {
    const user = userEvent.setup();
    vi.mocked(authService.login).mockRejectedValue(
      new Error("Unexpected error"),
    );

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: "Login" });

    await user.type(emailInput, "wrong-email@test.com");
    await user.type(passwordInput, "wrongpassword");
    await user.click(submitButton);

    const errorMessage = await screen.findByText("Login failed");
    expect(errorMessage).toBeInTheDocument();
  });

  it("should display server error message on AxiosError", async () => {
    const axiosError = new AxiosError(
      "Request failed",
      "401",
      undefined,
      undefined,
      {
        data: { message: "Invalid credentials" },
        status: 401,
      } as AxiosResponse,
    );

    vi.mocked(authService.login).mockRejectedValue(axiosError);
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Email"), "wrong@email.com");
    await user.type(screen.getByLabelText("Password"), "wrongpassword");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
  });
});
