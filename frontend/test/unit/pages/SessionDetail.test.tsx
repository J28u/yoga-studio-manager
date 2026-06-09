import { describe, expect, it, vi, beforeEach } from "vitest";
import SessionDetail from "../../../src/pages/SessionDetail";
import { MemoryRouter } from "react-router-dom";
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { authService } from "../../../src/services/auth.service";
import {
  MOCK_AUTH_RESPONSE_ADMIN,
  MOCK_AUTH_RESPONSE_USER,
  MOCK_SESSION_RESPONSE,
  MOCK_SESSION_RESPONSE_USER_JOINED,
} from "../../__mocks__/fixtures";
import { server } from "../../__mocks__/server";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { Route, Routes } from "react-router-dom";

vi.mock("../../../src/services/auth.service");
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("SessionDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const expectCommonSessionDetailElements = async (
    session = MOCK_SESSION_RESPONSE,
  ) => {
    expect(await screen.findByText("Details")).toBeInTheDocument();
    expect(screen.queryByText("Loading session...")).not.toBeInTheDocument();
    expect(await screen.findByText("Date:")).toBeInTheDocument();
    expect(await screen.findByText("Teacher:")).toBeInTheDocument();
    expect(await screen.findByText("Participants:")).toBeInTheDocument();
    expect(await screen.findByText("Description")).toBeInTheDocument();

    expect(
      await screen.findByRole("link", { name: "Back to Sessions" }),
    ).toHaveAttribute("href", "/sessions");

    expect(
      await screen.findByText(
        new Date(session.date).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      ),
    ).toBeInTheDocument();

    expect(
      await screen.findByText(
        session.teacher.firstName + " " + session.teacher.lastName,
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(String(session.users.length)),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(String(session.description)),
    ).toBeInTheDocument();
  };

  const mockRegularUserAuth = () => {
    const userAuth = MOCK_AUTH_RESPONSE_USER;
    vi.mocked(authService.getCurrentUser).mockReturnValue(userAuth);
    vi.mocked(authService.getToken).mockReturnValue(userAuth.token);
  };

  const mockAdminUserAuth = () => {
    const userAuth = MOCK_AUTH_RESPONSE_ADMIN;
    vi.mocked(authService.getCurrentUser).mockReturnValue(userAuth);
    vi.mocked(authService.getToken).mockReturnValue(userAuth.token);
  };

  it("should render page correctly for admin user", async () => {
    mockAdminUserAuth();

    render(
      <MemoryRouter initialEntries={[`/sessions/${MOCK_SESSION_RESPONSE.id}`]}>
        <Routes>
          <Route path="/sessions/:id" element={<SessionDetail />} />
        </Routes>
      </MemoryRouter>,
    );

    await expectCommonSessionDetailElements();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Edit" })).toHaveAttribute(
      "href",
      `/sessions/edit/${MOCK_SESSION_RESPONSE.id}`,
    );

    expect(
      screen.queryByRole("button", { name: "Leave Session" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Join Session" }),
    ).not.toBeInTheDocument();
  });

  it("should render page correctly for regular user who did not joined the session", async () => {
    mockRegularUserAuth();

    render(
      <MemoryRouter>
        <SessionDetail />
      </MemoryRouter>,
    );

    await expectCommonSessionDetailElements();
    expect(
      screen.queryByRole("button", { name: "Delete" }),
    ).not.toBeInTheDocument();

    expect(
      await screen.findByRole("button", { name: "Join Session" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Leave Session" }),
    ).not.toBeInTheDocument();
  });

  it("should display null when session is null", async () => {
    mockRegularUserAuth();

    server.use(
      http.get("/api/session/:id", () => {
        return HttpResponse.json(null, { status: 200 });
      }),
    );

    const { container } = render(
      <MemoryRouter>
        <SessionDetail />
      </MemoryRouter>,
    );

    await waitForElementToBeRemoved(() =>
      screen.queryByText("Loading session..."),
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("should display loading state", () => {
    render(
      <MemoryRouter>
        <SessionDetail />
      </MemoryRouter>,
    );
    expect(screen.getByText("Loading session...")).toBeInTheDocument();
  });

  it("should display error message on failed fetch", async () => {
    server.use(
      http.get("/api/session/:id", () => {
        throw new Error("Session not found");
      }),
    );

    render(
      <MemoryRouter>
        <SessionDetail />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText("Failed to load session details"),
    ).toBeInTheDocument();
  });

  it("should ask for user confirmation and navigate to /sessions on click", async () => {
    mockAdminUserAuth();
    vi.spyOn(window, "confirm").mockReturnValue(true);

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <SessionDetail />
      </MemoryRouter>,
    );

    const deleteButton = await screen.findByRole("button", { name: "Delete" });
    await user.click(deleteButton);

    expect(window.confirm).toHaveBeenCalledOnce();
    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this session?",
    );
    expect(mockNavigate).toHaveBeenCalledWith("/sessions");
  });

  it("should not navigate to /sessions when user abort deletion", async () => {
    mockAdminUserAuth();
    vi.spyOn(window, "confirm").mockReturnValue(false);

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <SessionDetail />
      </MemoryRouter>,
    );

    const deleteButton = await screen.findByRole("button", { name: "Delete" });
    await user.click(deleteButton);

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalledWith("/sessions");
  });

  it("should display error message on failed deletion", async () => {
    mockAdminUserAuth();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.spyOn(window, "alert");

    server.use(
      http.delete("/api/session/:id", () => {
        throw new Error("Session not found");
      }),
    );

    render(
      <MemoryRouter>
        <SessionDetail />
      </MemoryRouter>,
    );

    const user = userEvent.setup();
    const deleteButton = await screen.findByRole("button", { name: "Delete" });

    await user.click(deleteButton);
    expect(window.alert).toHaveBeenCalledWith("Failed to delete session");
  });

  it("should increase number of participants after user joined session", async () => {
    mockRegularUserAuth();

    let callCount = 0;

    server.use(
      http.get("/api/session/:id", () => {
        callCount++;

        if (callCount === 1) {
          return HttpResponse.json(MOCK_SESSION_RESPONSE, { status: 200 });
        }

        return HttpResponse.json(MOCK_SESSION_RESPONSE_USER_JOINED, {
          status: 200,
        });
      }),
    );

    render(
      <MemoryRouter>
        <SessionDetail />
      </MemoryRouter>,
    );

    const user = userEvent.setup();
    const joinButton = await screen.findByRole("button", {
      name: "Join Session",
    });

    await user.click(joinButton);
    expect(
      await screen.findByText(
        String(MOCK_SESSION_RESPONSE_USER_JOINED.users.length),
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Join Session" }),
    ).not.toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: "Leave Session" }),
    ).toBeInTheDocument();
  });

  it("should decrease participants number after user left session", async () => {
    mockRegularUserAuth();

    let callCount = 0;

    server.use(
      http.get("/api/session/:id", () => {
        callCount++;
        if (callCount === 1) {
          return HttpResponse.json(MOCK_SESSION_RESPONSE_USER_JOINED, {
            status: 200,
          });
        }
        return HttpResponse.json(MOCK_SESSION_RESPONSE, { status: 200 });
      }),
    );

    render(
      <MemoryRouter>
        <SessionDetail />
      </MemoryRouter>,
    );

    const user = userEvent.setup();
    const leaveButton = await screen.findByRole("button", {
      name: "Leave Session",
    });

    await user.click(leaveButton);
    expect(
      await screen.findByText(String(MOCK_SESSION_RESPONSE.users.length)),
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("button", { name: "Join Session" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Leave Session" }),
    ).not.toBeInTheDocument();
  });

  it("should display error message on failed participation", async () => {
    mockRegularUserAuth();
    vi.spyOn(window, "alert");
    server.use(
      http.post("/api/session/:id/participate/:userId", () => {
        throw new Error("User not found");
      }),
    );

    render(
      <MemoryRouter>
        <SessionDetail />
      </MemoryRouter>,
    );

    const user = userEvent.setup();

    const joinButton = await screen.findByRole("button", {
      name: "Join Session",
    });
    await user.click(joinButton);

    expect(window.alert).toHaveBeenCalledWith("Failed to join session");
  });

  it("should display error message on failed unparticipation", async () => {
    mockRegularUserAuth();
    vi.spyOn(window, "alert");

    server.use(
      http.get("/api/session/:id", () => {
        return HttpResponse.json(MOCK_SESSION_RESPONSE_USER_JOINED, {
          status: 200,
        });
      }),
    );

    server.use(
      http.delete("/api/session/:id/participate/:userId", () => {
        throw new Error("User not found");
      }),
    );

    render(
      <MemoryRouter>
        <SessionDetail />
      </MemoryRouter>,
    );

    const user = userEvent.setup();

    const leaveButton = await screen.findByRole("button", {
      name: "Leave Session",
    });

    await user.click(leaveButton);

    expect(window.alert).toHaveBeenCalledWith("Failed to leave session");
  });
});
