import PrivateRoute from "../../../src/components/PrivateRoute";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { authService } from "../../../src/services/auth.service";
import { Routes, MemoryRouter, Route } from "react-router-dom";
import { screen, render } from "@testing-library/react";

vi.mock("../../../src/services/auth.service");

describe("PrivateRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (initialRoute = "/protected") => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <PrivateRoute>
                <div>Protected Content</div>
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    );
  };

  it("renders children when authenticated", () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(true);

    renderWithRouter();

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
    expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
  });

  it("redirects to /login when not authenticated", () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(false);

    renderWithRouter();

    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });
});
