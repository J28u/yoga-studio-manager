import { describe, it, expect, vi, beforeEach } from "vitest";
import SessionForm from "../../../src/pages/SessionForm";
import { authService } from "../../../src/services/auth.service";
import {
  MOCK_AUTH_RESPONSE_ADMIN,
  MOCK_AUTH_RESPONSE_USER,
  MOCK_SESSION_RESPONSE,
  MOCK_TEACHER_RESPONSE,
} from "../../__mocks__/fixtures";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { screen, render } from "@testing-library/react";
import { server } from "../../__mocks__/server";
import { http, HttpResponse } from "msw";
import userEvent, { UserEvent } from "@testing-library/user-event";

vi.mock("../../../src/services/auth.service");
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("SessionForm", () => {
  beforeEach(() => vi.clearAllMocks());

  const expectCommonSessionFormElements = async () => {
    const sessionNameInput = await screen.findByLabelText("Session Name");
    expect(sessionNameInput).toBeInTheDocument();
    expect(sessionNameInput).toBeRequired();

    const dateInput = await screen.findByLabelText("Date");
    expect(dateInput).toBeInTheDocument();
    expect(dateInput).toBeRequired();

    const teacherInput = await screen.findByLabelText("Teacher");
    expect(teacherInput).toBeInTheDocument();
    expect(teacherInput).toBeRequired();

    const descriptionInput = await screen.findByLabelText("Description");
    expect(descriptionInput).toBeInTheDocument();
    expect(descriptionInput).toBeRequired();

    expect(
      await screen.findByRole("option", { name: "Select a teacher" }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Saving..." }),
    ).not.toBeInTheDocument();

    expect(await screen.findByRole("link", { name: "Cancel" })).toHaveAttribute(
      "href",
      "/sessions",
    );
  };

  const mockUserAuth = (userAuth = MOCK_AUTH_RESPONSE_ADMIN) => {
    vi.mocked(authService.getCurrentUser).mockReturnValue(userAuth);
    vi.mocked(authService.getToken).mockReturnValue(userAuth.token);
  };

  const mockUserType = async (
    user: UserEvent,
    session = MOCK_SESSION_RESPONSE,
  ) => {
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

  it("should navigate to /sessions for regular user", async () => {
    mockUserAuth(MOCK_AUTH_RESPONSE_USER);

    render(
      <MemoryRouter initialEntries={["/sessions/create"]}>
        <Routes>
          <Route path="/sessions/create" element={<SessionForm />} />
          <Route path="/session" element={<div>redirected</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("redirected")).toBeInTheDocument();
  });

  it("should navigate to /session for not found user", () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue(null);

    render(
      <MemoryRouter initialEntries={["/sessions/create"]}>
        <Routes>
          <Route path="/sessions/create" element={<SessionForm />} />
          <Route path="/session" element={<div>redirected</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("redirected")).toBeInTheDocument();
  });

  it("should render page correctly for admin user on edit mode", async () => {
    mockUserAuth();

    render(
      <MemoryRouter
        initialEntries={[`/sessions/edit/${MOCK_SESSION_RESPONSE.id}`]}
      >
        <Routes>
          <Route path="/sessions/edit/:id" element={<SessionForm />} />
        </Routes>
      </MemoryRouter>,
    );

    await expectCommonSessionFormElements();

    expect(screen.getAllByRole("option")).toHaveLength(
      MOCK_TEACHER_RESPONSE.length + 1,
    );

    expect(await screen.findByText("Edit Session")).toBeInTheDocument();
    expect(screen.queryByText("Create New Session")).not.toBeInTheDocument();

    const updateButton = await screen.findByRole("button", {
      name: "Update Session",
    });
    expect(updateButton).toBeInTheDocument();
    expect(updateButton).toBeEnabled();

    expect(
      screen.queryByRole("button", { name: "Create Session" }),
    ).not.toBeInTheDocument();

    const session = MOCK_SESSION_RESPONSE;
    expect(await screen.findByLabelText("Session Name")).toHaveValue(
      session.name,
    );
    expect(await screen.findByLabelText("Date")).toHaveValue(
      new Date(session.date).toISOString().split("T")[0],
    );
    expect(await screen.findByLabelText("Description")).toHaveValue(
      session.description,
    );
    const select = screen.getByRole("combobox");
    expect(select).toHaveValue(String(session.teacher.id));
  });

  it("should render page correctly for admin user not on edit mode", async () => {
    mockUserAuth();

    render(
      <MemoryRouter initialEntries={["/sessions/create"]}>
        <Routes>
          <Route path="/sessions/create" element={<SessionForm />} />
        </Routes>
      </MemoryRouter>,
    );

    await expectCommonSessionFormElements();

    expect(screen.getAllByRole("option")).toHaveLength(
      MOCK_TEACHER_RESPONSE.length + 1,
    );

    expect(await screen.findByText("Create New Session")).toBeInTheDocument();
    expect(screen.queryByText("Edit Session")).not.toBeInTheDocument();

    const createButton = await screen.findByRole("button", {
      name: "Create Session",
    });
    expect(createButton).toBeInTheDocument();
    expect(createButton).toBeEnabled();

    expect(
      screen.queryByRole("button", { name: "Update Session" }),
    ).not.toBeInTheDocument();

    expect(await screen.findByLabelText("Session Name")).toHaveValue("");
    expect(await screen.findByLabelText("Date")).toHaveValue("");
    expect(await screen.findByLabelText("Description")).toHaveValue("");
    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("");
  });

  it("should display no options in select on failed teachers fetch", async () => {
    mockUserAuth();
    server.use(
      http.get("/api/teacher", () => {
        throw new Error();
      }),
    );

    render(
      <MemoryRouter initialEntries={["/sessions/create"]}>
        <Routes>
          <Route path="/sessions/create" element={<SessionForm />} />
        </Routes>
      </MemoryRouter>,
    );

    await expectCommonSessionFormElements();

    expect(await screen.findAllByRole("option")).toHaveLength(1);
  });

  it("should display error message on failed session fetch", async () => {
    mockUserAuth();

    server.use(
      http.get("/api/session/:id", () => {
        throw new Error("Session not found");
      }),
    );

    render(
      <MemoryRouter
        initialEntries={[`/sessions/edit/${MOCK_SESSION_RESPONSE.id}`]}
      >
        <Routes>
          <Route path="/sessions/edit/:id" element={<SessionForm />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      await screen.findByText("Failed to load session"),
    ).toBeInTheDocument();
  });

  it("should disable submit button and modify its name on loading, in create mode", async () => {
    mockUserAuth();

    server.use(
      http.post(
        "/api/session",
        () => new Promise((resolved) => setTimeout(resolved, 1000)),
      ),
    );

    render(
      <MemoryRouter initialEntries={["/sessions/create"]}>
        <Routes>
          <Route path="/sessions/create" element={<SessionForm />} />
        </Routes>
      </MemoryRouter>,
    );

    const user = userEvent.setup();
    await mockUserType(user);

    const createButton = await screen.findByRole("button", {
      name: "Create Session",
    });
    await user.click(createButton);

    const savingButton = await screen.findByRole("button", {
      name: "Saving...",
    });
    expect(savingButton).toBeInTheDocument();
    expect(savingButton).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: "Create Session" }),
    ).not.toBeInTheDocument();
  });

  it("should disable submit button and modify its name on loading, in edit mode", async () => {
    mockUserAuth();

    server.use(
      http.put(
        "/api/session/:id",
        () => new Promise((resolved) => setTimeout(resolved, 1000)),
      ),
    );

    render(
      <MemoryRouter
        initialEntries={[`/sessions/edit/${MOCK_SESSION_RESPONSE.id}`]}
      >
        <Routes>
          <Route path="/sessions/edit/:id" element={<SessionForm />} />
        </Routes>
      </MemoryRouter>,
    );

    const user = userEvent.setup();

    const updateButton = await screen.findByRole("button", {
      name: "Update Session",
    });
    await user.click(updateButton);

    const savingButton = await screen.findByRole("button", {
      name: "Saving...",
    });
    expect(savingButton).toBeInTheDocument();
    expect(savingButton).toBeDisabled();
    expect(screen.queryByRole("Update Session")).not.toBeInTheDocument();
  });

  it("should navigate to /sessions after successful update", async () => {
    mockUserAuth();

    render(
      <MemoryRouter
        initialEntries={[`/sessions/edit/${MOCK_SESSION_RESPONSE.id}`]}
      >
        <Routes>
          <Route path="/sessions/edit/:id" element={<SessionForm />} />
        </Routes>
      </MemoryRouter>,
    );

    const user = userEvent.setup();

    const updateButton = await screen.findByRole("button", {
      name: "Update Session",
    });
    await user.click(updateButton);

    expect(mockNavigate).toHaveBeenCalledWith("/sessions");
  });

  it("should navigate to /sessions after successful creation", async () => {
    mockUserAuth();

    render(
      <MemoryRouter initialEntries={["/sessions/create"]}>
        <Routes>
          <Route path="/sessions/create" element={<SessionForm />} />
        </Routes>
      </MemoryRouter>,
    );

    const user = userEvent.setup();
    await mockUserType(user);

    const createButton = await screen.findByRole("button", {
      name: "Create Session",
    });
    await user.click(createButton);

    expect(mockNavigate).toHaveBeenCalledWith("/sessions");
  });

  it("should display generic error message on failed update", async () => {
    mockUserAuth();

    server.use(
      http.put("/api/session/:id", () => {
        return HttpResponse.json({}, { status: 500 });
      }),
    );

    render(
      <MemoryRouter
        initialEntries={[`/sessions/edit/${MOCK_SESSION_RESPONSE.id}`]}
      >
        <Routes>
          <Route path="/sessions/edit/:id" element={<SessionForm />} />
        </Routes>
      </MemoryRouter>,
    );

    const user = userEvent.setup();

    await user.click(
      await screen.findByRole("button", { name: "Update Session" }),
    );

    expect(
      await screen.findByText("Failed to save session"),
    ).toBeInTheDocument();
  });

  it("should display custom error message on failed update (axios)", async () => {
    mockUserAuth();

    const errorMessage = "Session not found";

    server.use(
      http.put("/api/session/:id", () => {
        return HttpResponse.json({ message: errorMessage }, { status: 404 });
      }),
    );

    render(
      <MemoryRouter
        initialEntries={[`/sessions/edit/${MOCK_SESSION_RESPONSE.id}`]}
      >
        <Routes>
          <Route path="/sessions/edit/:id" element={<SessionForm />} />
        </Routes>
      </MemoryRouter>,
    );

    const user = userEvent.setup();

    await user.click(
      await screen.findByRole("button", { name: "Update Session" }),
    );

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });
  it("should display generic error message on failed creation", async () => {
    mockUserAuth();

    server.use(
      http.post("/api/session", () => {
        return HttpResponse.json({}, { status: 500 });
      }),
    );

    render(
      <MemoryRouter initialEntries={["/sessions/create"]}>
        <Routes>
          <Route path="/sessions/create" element={<SessionForm />} />
        </Routes>
      </MemoryRouter>,
    );

    const user = userEvent.setup();
    await mockUserType(user);

    await user.click(
      await screen.findByRole("button", { name: "Create Session" }),
    );

    expect(
      await screen.findByText("Failed to save session"),
    ).toBeInTheDocument();
  });

  it("should display custom error message on failed creation (axios)", async () => {
    mockUserAuth();

    const errorMessage = "Teacher not found";

    server.use(
      http.post("/api/session", () => {
        return HttpResponse.json({ message: errorMessage }, { status: 404 });
      }),
    );

    render(
      <MemoryRouter initialEntries={["/sessions/create"]}>
        <Routes>
          <Route path="/sessions/create" element={<SessionForm />} />
        </Routes>
      </MemoryRouter>,
    );

    const user = userEvent.setup();
    await mockUserType(user);

    await user.click(
      await screen.findByRole("button", { name: "Create Session" }),
    );

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });
});
