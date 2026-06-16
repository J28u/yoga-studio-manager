/// <reference types="cypress" />

const mockAllApis = () => {
  cy.fixture("authResponse").then((mockAuthResponse) => {
    cy.intercept("POST", "/api/auth/login", {
      statusCode: 201,
      body: mockAuthResponse,
    }).as("loginRequest");
  });

  cy.fixture("userResponse").then((mockUserResponse) => {
    cy.intercept("GET", "/api/user/*", {
      statusCode: 200,
      body: mockUserResponse,
    }).as("getCurrentUser");
  });

  cy.fixture("teachers").then((mockTeachersResponse) => {
    cy.intercept("GET", "/api/teacher", {
      statusCode: 200,
      body: mockTeachersResponse.teachers,
    }).as("getTeachers");
  });

  cy.intercept("POST", "/api/session", {
    statusCode: 201,
  }).as("createSession");

  cy.intercept("PUT", "/api/session/*", {
    statusCode: 200,
  }).as("updateSession");

  cy.fixture("newSession").then((mocknewSession) => {
    cy.intercept("GET", "/api/session/*", {
      statusCode: 200,
      body: mocknewSession,
    }).as("getSession");
  });

  cy.intercept("DELETE", "/api/session/*", {
    statusCode: 200,
  }).as("deleteSession");
};

const mockGetSessions = (
  firstCallfixtureFile: string,
  secondCallFixtureFile: string,
) => {
  cy.fixture(firstCallfixtureFile).as("mockOriginalSessions");
  cy.fixture(secondCallFixtureFile).as("mockUpdatedSessions");

  cy.then(function () {
    const responses = [
      this.mockOriginalSessions.sessions,
      this.mockUpdatedSessions.sessions,
    ];

    let callCount = 0;

    cy.intercept("GET", "/api/session", (req) => {
      req.reply({
        statusCode: 200,
        body: responses[Math.min(callCount++, responses.length - 1)],
      });
      console.log(
        `Réponse envoyée : ${JSON.stringify(responses[Math.min(callCount++, responses.length - 1)])}`,
      );
    }).as("getSessions");
  });
};

const loginAs = (fixtureFile: string) => {
  cy.fixture(fixtureFile).then((user) => {
    cy.get("[data-cy='email']").type(user.email);
    cy.get("[data-cy='password']").type(user.password);
    cy.get("[data-cy='login']").click();
    cy.wait("@loginRequest");
  });
  cy.fixture("authResponse").then((mockAuthResponse) => {
    cy.window()
      .its("localStorage")
      .invoke("getItem", "token")
      .should("eq", mockAuthResponse.token);

    cy.window()
      .its("localStorage")
      .invoke("getItem", "user")
      .should("eq", JSON.stringify(mockAuthResponse));
  });
};

const logout = () => {
  cy.get("[data-cy = 'logout-button']").click();
  cy.url().should("contain", "/login");
  cy.window()
    .its("localStorage")
    .invoke("getItem", "token")
    .should("not.exist");

  cy.window().its("localStorage").invoke("getItem", "user").should("not.exist");
};

context("AdminJourney", () => {
  describe("Complete admin Journey", () => {
    beforeEach(() => {
      mockAllApis();
      cy.visit("/login");
    });

    it("should login, consult profile, and logout", () => {
      mockGetSessions("sessions", "sessions");
      loginAs("user");

      // SESSIONS PAGE
      cy.url().should("include", "/sessions");
      cy.wait("@getSessions");
      cy.get("[data-cy = 'sessions-title']")
        .should("be.visible")
        .should("contain", "Yoga Sessions");
      cy.get("[data-cy = 'profile-link']").click();

      // PROFILE PAGE
      cy.wait("@getCurrentUser");
      cy.url().should("include", "/profile");
      cy.get("[data-cy = 'profile-title']")
        .should("be.visible")
        .should("contain", "My Profile");
      cy.get("[data-cy = 'back-link']").click();

      // SESSIONS PAGE
      cy.wait("@getSessions");
      cy.url().should("include", "/sessions");
      cy.get("[data-cy = 'sessions-title']")
        .should("be.visible")
        .should("contain", "Yoga Sessions");

      logout();
    });

    it("should login and create a session", () => {
      mockGetSessions("sessions", "sessionsWithNewSession");
      loginAs("user");

      // SESSIONS PAGE
      cy.wait("@getSessions");
      cy.url().should("include", "/sessions");
      cy.get("[data-cy = 'create-session-link']").click();

      // CREATE SESSION FORM
      cy.wait("@getTeachers");
      cy.url().should("include", "/sessions/create");
      cy.get("[data-cy = 'session-form-title']")
        .should("be.visible")
        .should("contain", "Create New Session");

      cy.fixture("newSession").then((mockSession) => {
        cy.get("[data-cy = 'name']").type(mockSession.name);
        cy.get("[data-cy = 'date']").type(mockSession.date);
        cy.get("[data-cy = 'description']").type(mockSession.description);
        cy.get("[data-cy = 'teacher-id']").select(mockSession.teacher.id);
      });
      cy.get("[data-cy = 'submit-button']").click();
      cy.wait("@createSession");

      // SESSIONS PAGE
      cy.wait("@getSessions");
      cy.url().should("contain", "/sessions");
      cy.fixture("newSession").then((mockSession) => {
        cy.get(`[data-cy="session-${mockSession.id}"]`)
          .should("be.visible")
          .should("contain", mockSession.name)
          .should("contain", mockSession.description);
      });
    });

    it("should login and update a session", () => {
      mockGetSessions("sessionsWithNewSession", "sessionsWithUpdatedSession");
      loginAs("user");

      // SESSIONS PAGE
      cy.wait("@getSessions");
      cy.url().should("include", "/sessions");

      cy.fixture("newSession").then((mockSession) => {
        cy.get(`[data-cy="session-${mockSession.id}-details-link"]`).click();

        // SESSION DETAILS PAGE
        cy.wait("@getSession");
        cy.url().should("contain", `/sessions/${mockSession.id}`);
      });

      cy.get("[data-cy = 'session-details-title']")
        .should("be.visible")
        .should("contain", "Details");

      cy.get("[data-cy = 'edit-link']").click();

      // SESSION UPDATE FORM
      cy.wait("@getSession");
      cy.wait("@getTeachers");
      cy.fixture("newSession").then((mockSession) => {
        cy.url().should("contain", `/sessions/edit/${mockSession.id}`);
      });

      cy.get("[data-cy = 'session-form-title']")
        .should("be.visible")
        .should("contain", "Edit Session");

      cy.fixture("updatedSession").then((mockSession) => {
        cy.get("[data-cy = 'name']").type(mockSession.name);
        cy.get("[data-cy = 'description']").type(mockSession.description);
      });
      cy.get("[data-cy = 'submit-button']").click();
      cy.wait("@updateSession");

      // SESSIONS PAGE :
      cy.wait("@getSessions");
      cy.url().should("contain", "/sessions");

      cy.fixture("updatedSession").then((mockSession) => {
        cy.get(`[data-cy="session-${mockSession.id}"]`)
          .should("be.visible")
          .should("contain", mockSession.name)
          .should("contain", mockSession.description);
      });
    });

    it("should login and delete a session", () => {
      mockGetSessions("sessionsWithNewSession", "sessions");
      loginAs("user");

      // SESSIONS PAGE
      cy.url().should("include", "/sessions");
      cy.wait("@getSessions");
      cy.get(`[data-cy="session-1"]`).should("be.visible");

      cy.fixture("newSession").then((mockSession) => {
        cy.window().then((win) => {
          cy.stub(win, "confirm").returns(true);
          cy.get(`[data-cy="session-${mockSession.id}-delete-button"]`).click();
        });
      });

      cy.wait("@deleteSession");
      cy.wait("@getSessions");
      cy.get(`[data-cy="session-1"]`).should("be.visible");

      cy.fixture("newSession").then((mockSession) => {
        cy.get(`[data-cy="session-${mockSession.id}"]`).should("not.exist");
      });
    });
  });
});
