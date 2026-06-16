import { describe, it, expect, vi, beforeEach } from "vitest";
import Sessions from "../../src/pages/Sessions";
import Profile from "../../src/pages/Profile";
import Login from "../../src/pages/Login";
import { authService } from "../../src/services/auth.service";
import { MOCK_AUTH_RESPONSE_USER } from "../__mocks__/fixtures";
import { render, screen } from "@testing-library/react";
import { Routes, Route, MemoryRouter } from "react-router-dom";
import Navbar from "../../src/components/Navbar";
import userEvent from "@testing-library/user-event";

vi.mock("../../src/services/auth.service");

describe("User Profile Management", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should delete user profile and navigate to /login", async () => {
    const userAuth = MOCK_AUTH_RESPONSE_USER;
    vi.mocked(authService.getCurrentUser).mockReturnValue(userAuth);
    vi.mocked(authService.getToken).mockReturnValue(userAuth.token);
    vi.mocked(authService.isAuthenticated).mockReturnValue(true);
    vi.mocked(authService.logout).mockReturnValue();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.stubEnv("DEV", false);

    render(
      <MemoryRouter initialEntries={["/sessions"]}>
        <Navbar />
        <Routes>
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </MemoryRouter>,
    );

    const user = userEvent.setup();

    await user.click(await screen.findByRole("link", { name: "Profile" }));

    expect(await screen.findByText("My Profile")).toBeInTheDocument();

    await user.click(
      await screen.findByRole("button", { name: "Delete Account" }),
    );

    expect(await screen.findByText("Login to Yoga Studio")).toBeInTheDocument();
  });
});
