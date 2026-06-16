import { describe, it, expect, vi, beforeEach } from "vitest";
import SessionDetail from "../../src/pages/SessionDetail";
import Sessions from "../../src/pages/Sessions";
import { authService } from "../../src/services/auth.service";
import {
  MOCK_AUTH_RESPONSE_USER,
  MOCK_SESSION_RESPONSE,
  MOCK_SESSION_RESPONSE_USER_JOINED,
} from "../__mocks__/fixtures";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Navbar from "../../src/components/Navbar";
import { server } from "../__mocks__/server";
import { http, HttpResponse } from "msw";

vi.mock("../../src/services/auth.service");

describe("Session Management Regular User", () => {
  beforeEach(() => vi.clearAllMocks());

  const mockAuthServices = (userAuth = MOCK_AUTH_RESPONSE_USER) => {
    vi.mocked(authService.getCurrentUser).mockReturnValue(userAuth);
    vi.mocked(authService.getToken).mockReturnValue(userAuth.token);
    vi.mocked(authService.isAuthenticated).mockReturnValue(true);
  };

  it("should navigate to session detailed view, increment number of participants on click", async () => {
    mockAuthServices();
    const user = userEvent.setup();
    const updated_session = MOCK_SESSION_RESPONSE_USER_JOINED;

    let callCount = 0;
    server.use(
      http.get("/api/session/:id", () => {
        callCount++;
        if (callCount === 1) {
          return HttpResponse.json(MOCK_SESSION_RESPONSE, { status: 200 });
        } else {
          return HttpResponse.json(updated_session, {
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

    await user.click(
      await screen.findByRole("button", { name: "Join Session" }),
    );

    expect(
      await screen.findByText(`${updated_session.users.length}`),
    ).toBeInTheDocument();
  });

  it("should navigate to session detailed view, decrement number of participants on click", async () => {
    mockAuthServices();
    const user = userEvent.setup();
    const updated_session = MOCK_SESSION_RESPONSE;

    let callCount = 0;
    server.use(
      http.get("/api/session/:id", () => {
        callCount++;
        if (callCount === 1) {
          return HttpResponse.json(MOCK_SESSION_RESPONSE_USER_JOINED, {
            status: 200,
          });
        } else {
          return HttpResponse.json(updated_session, {
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

    await user.click(
      await screen.findByRole("button", { name: "Leave Session" }),
    );

    expect(
      await screen.findByText(String(updated_session.users.length)),
    ).toBeInTheDocument();
  });
});
