describe("Sessions", () => {
  const loginAs = (fixtureFile: string) => {
    cy.fixture(fixtureFile).then((user) => {
      cy.login(user.email, user.password);
    });
  };
  describe("When logged in as a regular user", () => {
    beforeEach(() => {
      loginAs("user");
    });

    it("should display the list of available sessions", () => {
      cy.visit("/sessions");
      cy.get("[data-cy = 'sessions-title']")
        .should("be.visible")
        .should("contain", "Yoga Sessions");
      cy.get("[data-cy='session-card']").should("have.length.greaterThan", 0);
    });

    it("should display the details of a selected session", () => {
      cy.visit("/sessions");
      cy.get("[data-cy='session-details-link']").first().click();
      cy.get("[data-cy = 'session-details-title']")
        .should("be.visible")
        .should("contain", "Details");
      cy.get("[data-cy = 'session-description']")
        .should("be.visible")
        .should("contain", "Description");
      cy.get("[data-cy = 'participants']")
        .should("be.visible")
        .should("contain", "Participants:");
      cy.get("[data-cy = 'teacher']")
        .should("be.visible")
        .should("contain", "Teacher:");
    });

    it("should allow a user to join a session", () => {
      cy.visit("/sessions");
      cy.get("[data-cy='session-details-link']").first().click();
      cy.get("[data-cy = 'join-button']")
        .should("be.visible")
        .should("contain", "Join Session");
      cy.get("[data-cy = 'join-button']").click();
      cy.get("[data-cy = 'leave-button']")
        .should("be.visible")
        .should("contain", "Leave Session");
    });

    it("should allow a user to leave a session", () => {
      cy.visit("/sessions");
      cy.get("[data-cy='session-details-link']").first().click();
      cy.get("body").then(($body) => {
        if ($body.text().includes("Join Session")) {
          cy.get("[data-cy = 'join-button']").click();
          cy.get("[data-cy = 'leave-button']").should("be.visible");
        }
        cy.get("[data-cy = 'leave-button']").click();
        cy.get("[data-cy = 'join-button']").should("be.visible");
      });
    });

    it("should hide the create session action from regular users", () => {
      cy.visit("/sessions");
      cy.get("[data-cy = 'create-session-link']").should("not.exist");
    });
  });

  describe("When logged in as an administrator", () => {
    beforeEach(() => {
      loginAs("admin");
    });

    it("should display the create session action", () => {
      cy.visit("/sessions");
      cy.get("[data-cy = 'create-session-link']")
        .should("be.visible")
        .should("contain", "Create Session");
    });

    it("should allow an administrator to create a session", () => {
      cy.visit("/sessions/create");
      cy.fixture("newSession").then((mockSession) => {
        cy.get("[data-cy = 'name']").type(mockSession.name);
        cy.get("[data-cy = 'date']").type(mockSession.date);
        cy.get("[data-cy = 'description']").type(mockSession.description);
        cy.get("[data-cy = 'teacher-id']").select(mockSession.teacher.id);
      });
      cy.get("[data-cy = 'submit-button']").click();
      cy.url().should("contain", "/sessions");
      cy.fixture("newSession").then((mockSession) => {
        cy.get("[data-cy='session-card']")
          .last()
          .should("be.visible")
          .should("contain", mockSession.name)
          .should("contain", mockSession.description);
      });
    });

    it("allow an administrator to update a session", () => {
      cy.visit("/sessions");
      cy.get("[data-cy='session-details-link']").last().click();

      cy.get("[data-cy = 'edit-link']").click();
      cy.fixture("updatedSession").then((mockSession) => {
        cy.get("[data-cy = 'name']")
          .type("{selectall}{backspace}")
          .type(mockSession.name);
        cy.get("[data-cy = 'description']")
          .type("{selectall}{backspace}")
          .type(mockSession.description);
      });
      cy.get("[data-cy = 'submit-button']").click();
      cy.url().should("contain", "/sessions");

      cy.fixture("updatedSession").then((mockSession) => {
        cy.get("[data-cy='session-card']")
          .last()
          .should("be.visible")
          .should("contain", mockSession.name)
          .should("contain", mockSession.description);
      });
    });

    it("should allow an administrator to delete a session", () => {
      cy.visit("/sessions");

      cy.get('[data-cy="session-card"]')
        .its("length")
        .then((initialCount) => {
          cy.window().then((win) => {
            cy.stub(win, "confirm").returns(true);
          });

          cy.get('[data-cy="session-delete-button"]').last().click();

          cy.get('[data-cy="session-card"]').should(
            "have.length",
            initialCount - 1,
          );
        });
    });
  });
});
