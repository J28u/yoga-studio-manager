import { describe, it, expect, vi, beforeEach } from "vitest";
import Profile from "../../src/pages/Profile";
import { authService } from "../../src/services/auth.service";
import {
  MOCK_AUTH_RESPONSE_ADMIN,
  MOCK_AUTH_RESPONSE_USER,
  MOCK_USER_RESPONSE_ADMIN,
  MOCK_USER_RESPONSE_USER,
} from "../__mocks__/fixtures";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { server } from "../__mocks__/server";
import { http, HttpResponse } from "msw";
import userEvent from "@testing-library/user-event";

vi.mock("../../src/services/auth.service");

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const expectCommonProfileElements = async () => {
  expect(screen.queryByText("Loading profile..")).not.toBeInTheDocument();
  expect(await screen.findByText("My Profile")).toBeInTheDocument();
  expect(await screen.findByText("First Name")).toBeInTheDocument();
  expect(await screen.findByText("Last Name")).toBeInTheDocument();
  expect(await screen.findByText("Email")).toBeInTheDocument();
  expect(await screen.findByText("Account Type")).toBeInTheDocument();
  expect(await screen.findByText("Member Since")).toBeInTheDocument();
  expect(await screen.findByText("Back to Sessions")).toBeInTheDocument();
  expect(
    await screen.findByRole("button", { name: "Delete Account" }),
  ).toBeInTheDocument();
};

describe("Profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();

    const userAuth = MOCK_AUTH_RESPONSE_USER;

    vi.mocked(authService.getCurrentUser).mockReturnValue(userAuth);
    vi.mocked(authService.getToken).mockReturnValue(userAuth.token);
    vi.stubEnv("DEV", false);
  });

  it("should render correctly for admin user", async () => {
    const userAuth = MOCK_AUTH_RESPONSE_ADMIN;
    vi.mocked(authService.getCurrentUser).mockReturnValue(userAuth);
    vi.mocked(authService.getToken).mockReturnValue(userAuth.token);
    vi.stubEnv("DEV", true);

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    const userResponse = MOCK_USER_RESPONSE_ADMIN;
    await expectCommonProfileElements();

    expect(await screen.findByText(userResponse.firstName)).toBeInTheDocument();
    expect(await screen.findByText(userResponse.lastName)).toBeInTheDocument();
    expect(await screen.findByText(userResponse.email)).toBeInTheDocument();
    expect(
      screen.getByText(
        new Date(userResponse.createdAt!).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      ),
    ).toBeInTheDocument();

    expect(await screen.findByText("Administrator")).toBeInTheDocument();
    expect(screen.queryByText("User")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Promote to Admin (Dev)" }),
    ).not.toBeInTheDocument();
  });

  it("should render correctly for regular user", async () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    const userResponse = MOCK_USER_RESPONSE_USER;
    await expectCommonProfileElements();

    expect(await screen.findByText(userResponse.firstName)).toBeInTheDocument();
    expect(await screen.findByText(userResponse.lastName)).toBeInTheDocument();
    expect(await screen.findByText(userResponse.email)).toBeInTheDocument();
    expect(
      screen.getByText(
        new Date(userResponse.createdAt!).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      ),
    ).toBeInTheDocument();

    expect(await screen.findByText("User")).toBeInTheDocument();
    expect(screen.queryByText("Administrator")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Promote to Admin (Dev)" }),
    ).not.toBeInTheDocument();
  });

  it("should render correctly for regular user in dev mode", async () => {
    vi.stubEnv("DEV", true);

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    const userResponse = MOCK_USER_RESPONSE_USER;
    await expectCommonProfileElements();

    expect(await screen.findByText(userResponse.firstName)).toBeInTheDocument();
    expect(await screen.findByText(userResponse.lastName)).toBeInTheDocument();
    expect(await screen.findByText(userResponse.email)).toBeInTheDocument();
    expect(
      screen.getByText(
        new Date(userResponse.createdAt!).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      ),
    ).toBeInTheDocument();

    expect(await screen.findByText("User")).toBeInTheDocument();
    expect(screen.queryByText("Administrator")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Promote to Admin (Dev)" }),
    ).toBeInTheDocument();
  });

  it("should display error message on failed fetch", async () => {
    server.use(
      http.get("/api/user/:id", () => {
        throw new Error("User not found");
      }),
    );

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText("Failed to load user information"),
    ).toBeInTheDocument();
  });

  it("should display loading state", () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    expect(screen.getByText("Loading profile...")).toBeInTheDocument();
  });

  it("should call updateCurrenUser once on click", async () => {
    vi.stubEnv("DEV", true);
    vi.mocked(authService.updateCurrentUser).mockResolvedValue({
      ...MOCK_AUTH_RESPONSE_USER,
      admin: true,
    });

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    const promoteButton = await screen.findByRole("button", {
      name: "Promote to Admin (Dev)",
    });

    await user.click(promoteButton);
    expect(authService.updateCurrentUser).toHaveBeenCalledOnce();
    expect(authService.updateCurrentUser).toHaveBeenCalledWith({ admin: true });
    expect(await screen.findByText("Administrator")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Promote to Admin (Dev)" }),
    ).not.toBeInTheDocument();
  });

  it("should display loading state and disable button on click", async () => {
    vi.stubEnv("DEV", true);

    server.use(
      http.post("/api/user/promote-admin", async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json({ ...MOCK_USER_RESPONSE_USER, admin: true });
      }),
    );

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    await user.click(
      await screen.findByRole("button", {
        name: "Promote to Admin (Dev)",
      }),
    );

    const buttonPromote = await screen.findByRole("button", {
      name: "Promoting...",
    });
    expect(buttonPromote).toBeInTheDocument();
    expect(buttonPromote).toBeDisabled();
  });

  it("should display error message on failed admin promotion", async () => {
    vi.stubEnv("DEV", true);

    server.use(
      http.post("/api/user/promote-admin", () => {
        throw new Error("User not found");
      }),
    );

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    const promoteButton = await screen.findByRole("button", {
      name: "Promote to Admin (Dev)",
    });
    await user.click(promoteButton);

    expect(
      await screen.findByText("Failed to promote to admin"),
    ).toBeInTheDocument();
  });

  it("should display confirmation message on click", async () => {
    vi.spyOn(window, "confirm");

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    const deleteButton = await screen.findByRole("button", {
      name: "Delete Account",
    });

    await user.click(deleteButton);
    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete your account? This action cannot be undone.",
    );
  });

  it("should call logout and redirect to login after user confirms account deletion", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.mocked(authService.logout).mockImplementation(() => {});

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    const deleteButton = await screen.findByRole("button", {
      name: "Delete Account",
    });
    await user.click(deleteButton);

    expect(authService.logout).toHaveBeenCalledOnce();
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("should neither logout nor redirect when user cancels deletion", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    const deleteButton = await screen.findByRole("button", {
      name: "Delete Account",
    });

    await user.click(deleteButton);

    expect(authService.logout).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalledWith("/login");
  });

  it("should display error message on failed deletion", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.spyOn(window, "alert");
    server.use(
      http.delete("/api/user/:id", () => {
        throw new Error("User not found");
      }),
    );

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    const deleteButton = await screen.findByRole("button", {
      name: "Delete Account",
    });

    await user.click(deleteButton);

    expect(window.alert).toHaveBeenCalledWith("Failed to delete account");
    expect(authService.logout).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalledWith("/login");
  });
});
