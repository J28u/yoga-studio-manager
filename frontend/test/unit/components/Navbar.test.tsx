import { describe, it, expect, vi, beforeEach } from "vitest";
import Navbar from "../../../src/components/Navbar";
import { render, screen } from "@testing-library/react";
import { authService } from "../../../src/services/auth.service";
import {
  MOCK_AUTH_RESPONSE_ADMIN,
  MOCK_AUTH_RESPONSE_USER,
} from "../../__mocks__/fixtures";
import { MemoryRouter } from "react-router-dom";
import { userEvent } from "@testing-library/user-event";

vi.mock("../../../src/services/auth.service");
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom"); // On garde les vrais imports
  return {
    ...actual,
    useNavigate: () => mockNavigate, // on remplace seulement useNavigate
  };
});

describe("Navbar", () => {
  beforeEach(() => vi.clearAllMocks());
  it("should render unauthenticated navbar", () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue(null);
    vi.mocked(authService.isAuthenticated).mockReturnValue(false);

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    expect(screen.getByText("Yoga Studio")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Register")).toBeInTheDocument();

    expect(screen.queryByText("Logout")).not.toBeInTheDocument();
    expect(screen.queryByText("Profile")).not.toBeInTheDocument();
    expect(screen.queryByText("Sessions")).not.toBeInTheDocument();
    expect(screen.queryByText("Create Session")).not.toBeInTheDocument();
  });

  it("should render authenticated navbar when user is admin", () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue(
      MOCK_AUTH_RESPONSE_ADMIN,
    );
    vi.mocked(authService.isAuthenticated).mockReturnValue(true);

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    expect(screen.getByText("Yoga Studio")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Sessions")).toBeInTheDocument();
    expect(screen.getByText("Create Session")).toBeInTheDocument();

    expect(screen.queryByText("Login")).not.toBeInTheDocument();
    expect(screen.queryByText("Register")).not.toBeInTheDocument();
  });

  it("should render authenticated navbar when user is not admin", () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue(
      MOCK_AUTH_RESPONSE_USER,
    );
    vi.mocked(authService.isAuthenticated).mockReturnValue(true);

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    expect(screen.getByText("Yoga Studio")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Sessions")).toBeInTheDocument();

    expect(screen.queryByText("Login")).not.toBeInTheDocument();
    expect(screen.queryByText("Register")).not.toBeInTheDocument();
    expect(screen.queryByText("Create Session")).not.toBeInTheDocument();
  });

  it("should call logout and navigate to login on click", async () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue(
      MOCK_AUTH_RESPONSE_USER,
    );
    vi.mocked(authService.isAuthenticated).mockReturnValue(true);

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    const logoutLink = screen.getByText("Logout");
    await user.click(logoutLink);
    expect(authService.logout).toHaveBeenCalledOnce();
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
