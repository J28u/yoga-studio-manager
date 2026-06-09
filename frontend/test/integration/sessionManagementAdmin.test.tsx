import { describe, it, vi, expect, beforeEach } from "vitest";
import SessionForm from "../../src/pages/SessionForm";
import SessionDetail from "../../src/pages/SessionDetail";
import Sessions from "../../src/pages/Sessions";
import Navbar from "../../src/components/Navbar";
import { authService } from "../../src/services/auth.service";
import {
  MOCK_AUTH_RESPONSE_ADMIN,
  MOCK_NEW_SESSION,
  MOCK_SESSIONS_RESPONSE,
} from "../__mocks__/fixtures";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserEvent } from "@testing-library/user-event";
import { Session } from "../../src/types";
import { http, HttpResponse } from "msw";
import { server } from "../__mocks__/server";

vi.mock("../../src/services/auth.service");

describe("sessionManagementAdmin", () => {
  beforeEach(() => vi.clearAllMocks());

  const mockAuthServices = (userAuth = MOCK_AUTH_RESPONSE_ADMIN) => {
    vi.mocked(authService.getCurrentUser).mockReturnValue(userAuth);
    vi.mocked(authService.getToken).mockReturnValue(userAuth.token);
    vi.mocked(authService.isAuthenticated).mockReturnValue(true);
  };

  const mockUserType = async (user: UserEvent, session: Session) => {
    await user.type(await screen.findByLabelText("Session Name"), session.name);
    await user.type(
      await screen.findByLabelText("Date"),
      new Date(session.date).toISOString().split("T")[0],
    );
    await user.type(
      await screen.findByLabelText("Description"),
      session.description,
    );
    await user.selectOptions(
      await screen.findByRole("combobox"),
      String(session.teacher.id),
    );
  };

  it("should navigate to create session form, create new session and navigate to updated /sessions", async () => {
    mockAuthServices();
    const user = userEvent.setup();
    const session = MOCK_NEW_SESSION;

    let callCount = 0;
    server.use(
      http.get("/api/session", () => {
        callCount++;
        if (callCount === 1) {
          return HttpResponse.json(MOCK_SESSIONS_RESPONSE, { status: 200 });
        } else {
          return HttpResponse.json(
            MOCK_SESSIONS_RESPONSE.concat(MOCK_NEW_SESSION),
            { status: 200 },
          );
        }
      }),
    );

    render(
      <MemoryRouter initialEntries={["/sessions"]}>
        <Navbar />
        <Routes>
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/sessions/create" element={<SessionForm />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(
      await screen.findByRole("link", { name: "Create Session" }),
    );

    expect(await screen.findByText("Create New Session")).toBeInTheDocument();

    await mockUserType(user, session);

    await user.click(
      await screen.findByRole("button", { name: "Create Session" }),
    );

    expect(await screen.findByText("Yoga Sessions")).toBeInTheDocument();
    expect(await screen.findByText(session.name)).toBeInTheDocument();
    expect(await screen.findByText(session.description)).toBeInTheDocument();

    const links = await screen.findAllByRole("link", { name: "View Details" });
    expect(links[links.length - 1]).toHaveAttribute(
      "href",
      `/sessions/${session.id}`,
    );
  });

  it("should navigate to session details, delete first session and navigate back to /sessions", async () => {
    mockAuthServices();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    const firstSession = MOCK_SESSIONS_RESPONSE[0];

    let callCount = 0;
    server.use(
      http.get("/api/session", () => {
        callCount++;
        if (callCount === 1) {
          return HttpResponse.json(MOCK_SESSIONS_RESPONSE, { status: 200 });
        } else {
          return HttpResponse.json(MOCK_SESSIONS_RESPONSE.slice(1), {
            status: 200,
          });
        }
      }),
    );

    render(
      <MemoryRouter initialEntries={["/sessions"]}>
        <Navbar />
        <Routes>
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/sessions/:id" element={<SessionDetail />} />
        </Routes>
      </MemoryRouter>,
    );

    const detailsButtons = await screen.findAllByRole("link", {
      name: "View Details",
    });
    await user.click(detailsButtons[0]);

    expect(await screen.findByText("Details")).toBeInTheDocument();

    await user.click(await screen.findByRole("button", { name: "Delete" }));

    expect(await screen.findByText("Yoga Sessions")).toBeInTheDocument();
    expect(screen.queryByText(firstSession.name)).not.toBeInTheDocument();
    expect(
      screen.queryByText(firstSession.description),
    ).not.toBeInTheDocument();
  });

  it("should navigate to session details, update first session and navigate back to /sessions", async () => {
    mockAuthServices();
    const user = userEvent.setup();
    const originalSession = MOCK_SESSIONS_RESPONSE[0];
    const updatedSession = MOCK_NEW_SESSION;

    let callCount = 0;
    server.use(
      http.get("/api/session", () => {
        callCount++;
        if (callCount === 1) {
          return HttpResponse.json(MOCK_SESSIONS_RESPONSE, { status: 200 });
        } else {
          const new_sessions = structuredClone(MOCK_SESSIONS_RESPONSE);
          new_sessions[0] = updatedSession;
          return HttpResponse.json(new_sessions, {
            status: 200,
          });
        }
      }),
    );

    render(
      <MemoryRouter initialEntries={["/sessions"]}>
        <Navbar />
        <Routes>
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/sessions/edit/:id" element={<SessionForm />} />
          <Route path="/sessions/:id" element={<SessionDetail />} />
        </Routes>
      </MemoryRouter>,
    );

    const detailsButtons = await screen.findAllByRole("link", {
      name: "View Details",
    });
    await user.click(detailsButtons[0]);
    expect(await screen.findByText("Details")).toBeInTheDocument();

    await user.click(await screen.findByRole("link", { name: "Edit" }));
    expect(await screen.findByText("Edit Session")).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Session Name"));
    await user.clear(screen.getByLabelText("Date"));
    await user.clear(screen.getByLabelText("Description"));

    await mockUserType(user, updatedSession);
    await user.click(
      await screen.findByRole("button", { name: "Update Session" }),
    );

    expect(await screen.findByText("Yoga Sessions")).toBeInTheDocument();

    expect(await screen.findByText(updatedSession.name)).toBeInTheDocument();
    expect(
      await screen.findByText(updatedSession.description),
    ).toBeInTheDocument();

    expect(screen.queryByText(originalSession.name)).not.toBeInTheDocument();
    expect(
      screen.queryByText(originalSession.description),
    ).not.toBeInTheDocument();
  });
});
