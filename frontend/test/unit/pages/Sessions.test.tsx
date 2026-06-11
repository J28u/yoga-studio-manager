import { describe, it, expect, vi, beforeEach } from "vitest";
import Sessions from "../../../src/pages/Sessions";
import { MemoryRouter } from "react-router-dom";
import { authService } from "../../../src/services/auth.service";
import {
  MOCK_AUTH_RESPONSE_ADMIN,
  MOCK_AUTH_RESPONSE_USER,
  MOCK_SESSIONS_RESPONSE,
} from "../../__mocks__/fixtures";
import { server } from "../../__mocks__/server";
import { http, HttpResponse } from "msw";
import { render, screen } from "@testing-library/react";
import { Session } from "../../../src/types";
import userEvent from "@testing-library/user-event";

vi.mock("../../../src/services/auth.service");

describe("Sessions", () => {
  beforeEach(() => vi.clearAllMocks());

  const expectCommonSessionsElements = async (
    sessions = MOCK_SESSIONS_RESPONSE,
  ) => {
    if (sessions.length === 0)
      throw new Error(
        "expectCommonSessionsElements requires at least one session",
      );

    expect(await screen.findByText("Yoga Sessions")).toBeInTheDocument();
    expect(screen.queryByText("No sessions available")).not.toBeInTheDocument();
    expect(screen.queryByText("Loading sessions...")).not.toBeInTheDocument();

    await Promise.all(
      sessions.map(async (session: Session) => {
        expect(await screen.findByText(session.name)).toBeInTheDocument();
        expect(
          await screen.findByText(
            `Date: ${new Date(session.date).toLocaleDateString()}`,
          ),
        ).toBeInTheDocument();
        expect(
          await screen.findByText(
            `Teacher: ${session.teacher.firstName + " " + session.teacher.lastName}`,
          ),
        ).toBeInTheDocument();
        expect(
          await screen.findByText(`Participants: ${session.users.length}`),
        ).toBeInTheDocument();
        expect(
          await screen.findByText(session.description),
        ).toBeInTheDocument();
      }),
    );
    const links = await screen.findAllByRole("link", { name: "View Details" });
    expect(links).toHaveLength(sessions.length);

    sessions.forEach((session, index) => {
      expect(links[index]).toHaveAttribute("href", `/sessions/${session.id}`);
    });
  };

  const mockUserAuth = (userAuth = MOCK_AUTH_RESPONSE_USER) => {
    vi.mocked(authService.getCurrentUser).mockReturnValue(userAuth);
    vi.mocked(authService.getToken).mockReturnValue(userAuth.token);
  };

  it("should display error message on failed fetch", async () => {
    mockUserAuth();

    server.use(
      http.get("/api/session", () => {
        return HttpResponse.json({}, { status: 500 });
      }),
    );

    render(
      <MemoryRouter>
        <Sessions />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText("Failed to load sessions"),
    ).toBeInTheDocument();
  });

  it("should display Create Session link and Delete buttons for admin", async () => {
    mockUserAuth(MOCK_AUTH_RESPONSE_ADMIN);

    render(
      <MemoryRouter>
        <Sessions />
      </MemoryRouter>,
    );

    await expectCommonSessionsElements();

    expect(
      await screen.findByRole("link", { name: "Create Session" }),
    ).toHaveAttribute("href", "/sessions/create");

    expect(
      await screen.findAllByRole("button", { name: "Delete" }),
    ).toHaveLength(MOCK_SESSIONS_RESPONSE.length);
  });

  it("should display page correctly for regular user", async () => {
    mockUserAuth();

    render(
      <MemoryRouter>
        <Sessions />
      </MemoryRouter>,
    );

    await expectCommonSessionsElements();

    expect(
      screen.queryByRole("link", { name: "Create Session" }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Delete" }),
    ).not.toBeInTheDocument();
  });

  it("should display 'no sessions' message when no session retrieved", async () => {
    mockUserAuth();

    server.use(
      http.get("/api/session", () => {
        return HttpResponse.json([], { status: 200 });
      }),
    );

    render(
      <MemoryRouter>
        <Sessions />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText("No sessions available"),
    ).toBeInTheDocument();
  });

  it("should display page without admin controls when not logged in", async () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue(null);
    vi.mocked(authService.getToken).mockReturnValue(null);

    mockUserAuth();

    render(
      <MemoryRouter>
        <Sessions />
      </MemoryRouter>,
    );

    await expectCommonSessionsElements();

    expect(
      screen.queryByRole("link", { name: "Create Session" }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Delete" }),
    ).not.toBeInTheDocument();
  });

  it("should display loading state", async () => {
    mockUserAuth();
    server.use(
      http.get("/api/session", async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json(MOCK_SESSIONS_RESPONSE);
      }),
    );

    render(
      <MemoryRouter>
        <Sessions />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Loading sessions...")).toBeInTheDocument();
  });

  it("should prompt confirmation dialog before deleting a session", async () => {
    mockUserAuth(MOCK_AUTH_RESPONSE_ADMIN);
    vi.spyOn(window, "confirm");

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Sessions />
      </MemoryRouter>,
    );

    const deleteButtons = await screen.findAllByRole("button", {
      name: "Delete",
    });
    await user.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledOnce();
    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this session?",
    );
  });

  it("should display alert on failed deletion", async () => {
    mockUserAuth(MOCK_AUTH_RESPONSE_ADMIN);
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.spyOn(window, "alert");

    server.use(
      http.delete("/api/session/:id", () => {
        return HttpResponse.json({}, { status: 500 });
      }),
    );

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Sessions />
      </MemoryRouter>,
    );

    const deleteButtons = await screen.findAllByRole("button", {
      name: "Delete",
    });
    await user.click(deleteButtons[0]);

    expect(window.alert).toHaveBeenCalledWith("Failed to delete session");
  });

  it("should not delete session if user cancel", async () => {
    mockUserAuth(MOCK_AUTH_RESPONSE_ADMIN);
    vi.spyOn(window, "confirm").mockReturnValue(false);

    const user = userEvent.setup();

    let deleteWasCalled = false;
    server.use(
      http.delete("/api/session/:id", () => {
        deleteWasCalled = true;
      }),
    );

    render(
      <MemoryRouter>
        <Sessions />
      </MemoryRouter>,
    );

    const deleteButtons = await screen.findAllByRole("button", {
      name: "Delete",
    });
    await user.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledTimes(1);
    expect(deleteWasCalled).toBe(false);

    const sessionCards = screen.getAllByRole("heading", { level: 3 });
    expect(sessionCards).toHaveLength(MOCK_SESSIONS_RESPONSE.length);
  });

  it("should refresh sessions list after successful deletion", async () => {
    mockUserAuth(MOCK_AUTH_RESPONSE_ADMIN);
    vi.spyOn(window, "confirm").mockReturnValue(true);

    let callCount = 0;
    server.use(
      http.get("/api/session", () => {
        callCount++;
        const data =
          callCount === 1
            ? MOCK_SESSIONS_RESPONSE
            : MOCK_SESSIONS_RESPONSE.slice(1);
        return HttpResponse.json(data);
      }),
    );

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Sessions />
      </MemoryRouter>,
    );

    const deleteButtons = await screen.findAllByRole("button", {
      name: "Delete",
    });
    await user.click(deleteButtons[0]);

    const remaining = await screen.findAllByRole("button", { name: "Delete" });
    expect(remaining).toHaveLength(MOCK_SESSIONS_RESPONSE.length - 1);
  });
});
