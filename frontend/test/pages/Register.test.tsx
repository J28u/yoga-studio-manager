import { describe, it, expect, vi, beforeEach } from "vitest";
import Register from "../../src/pages/Register";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MOCK_REGISTER_DATA } from "../__mocks__/fixtures";
import { authService } from "../../src/services/auth.service";
import { AxiosError, AxiosResponse } from "axios";

vi.mock("../../src/services/auth.service");

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockUserRegistration = async () => {
  const user = userEvent.setup();
  const userInfo = MOCK_REGISTER_DATA;
  await user.type(screen.getByLabelText("First Name"), userInfo.firstName);
  await user.type(screen.getByLabelText("Last Name"), userInfo.lastName);
  await user.type(screen.getByLabelText("Email"), userInfo.email);
  await user.type(screen.getByLabelText("Password"), userInfo.password);

  await user.click(screen.getByRole("button", { name: "Register" }));
};

describe("Register", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should render register page elements correctly", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );

    expect(screen.getByText("Register for Yoga Studio")).toBeInTheDocument();
    expect(screen.getByLabelText("First Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByText("Already have an account?")).toBeInTheDocument();
    expect(screen.getByText("Login here")).toBeInTheDocument();

    const registerButton = screen.getByRole("button", { name: "Register" });
    expect(registerButton).toBeInTheDocument();
    expect(registerButton).toBeEnabled();
    expect(
      screen.queryByRole("button", { name: "Registering..." }),
    ).not.toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Login here" })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("should disable button and show loading state on submit", async () => {
    vi.mocked(authService.register).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );

    await mockUserRegistration();

    const submitButton = await screen.findByRole("button", {
      name: "Registering...",
    });

    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it("should call register and navigate to /sessions on successful submit", async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );

    await mockUserRegistration();

    expect(authService.register).toHaveBeenCalledOnce();
    expect(authService.register).toHaveBeenCalledWith(MOCK_REGISTER_DATA);
    expect(mockNavigate).toHaveBeenCalledWith("/sessions");
    expect(
      await screen.findByRole("button", { name: "Register" }),
    ).toBeEnabled();
  });

  it("should display error message on failed registration", async () => {
    vi.mocked(authService.register).mockRejectedValue(
      new Error("Unexpected error"),
    );

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );

    await mockUserRegistration();

    expect(await screen.findByText("Registration failed")).toBeInTheDocument();
  });

  it("should display custom error message on failed registration due to axios error", async () => {
    const axiosError = new AxiosError(
      "Request failed",
      "409",
      undefined,
      undefined,
      {
        data: { message: "Email already exists" },
        status: 401,
      } as AxiosResponse,
    );
    vi.mocked(authService.register).mockRejectedValue(axiosError);

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );

    await mockUserRegistration();

    expect(await screen.findByText("Email already exists")).toBeInTheDocument();
  });
});
