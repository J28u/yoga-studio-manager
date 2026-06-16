import { faker } from "@faker-js/faker";

describe("Profile", () => {
  const loginAs = (fixtureFile: string) => {
    cy.fixture(fixtureFile).then((user) => {
      cy.login(user.email, user.password);
    });
  };
  describe("When logged in as a regular user", () => {
    beforeEach(() => {
      loginAs("user");
    });

    it("should display the profile information", () => {
      cy.get("[data-cy = 'profile-link']").click();
      cy.url().should("include", "/profile");
      cy.get("[data-cy = 'profile-title']")
        .should("be.visible")
        .should("contain", "My Profile");
      cy.get("[data-cy = 'firstName']")
        .should("be.visible")
        .should("contain", "First Name");
      cy.get("[data-cy = 'lastName']")
        .should("be.visible")
        .should("contain", "Last Name");
      cy.get("[data-cy = 'email']")
        .should("be.visible")
        .should("contain", "Email");
      cy.get("[data-cy = 'accountType']")
        .should("be.visible")
        .should("contain", "Account Type");
      cy.get("[data-cy = 'date']")
        .should("be.visible")
        .should("contain", "Member Since");
      cy.contains("User").should("be.visible");
    });

    it("should navigate back to the sessions page", () => {
      cy.visit("/profile");
      cy.get("[data-cy = 'back-link']").click();
      cy.url().should("include", "/sessions");
      cy.get("[data-cy = 'sessions-title']")
        .should("be.visible")
        .should("contain", "Yoga Sessions");
    });
  });

  describe("When logged in as an administrator", () => {
    it("should display the administrator badge", () => {
      loginAs("admin");
      cy.visit("/profile");
      cy.contains("Administrator").should("be.visible");
    });
  });

  describe("Account deletion", () => {
    it("should allow a user to delete their account", () => {
      cy.register(
        faker.person.firstName(),
        faker.person.lastName(),
        faker.internet.email(),
        faker.internet.password(),
      );
      cy.visit("/profile");
      cy.get("[data-cy='delete-button']").click();
      cy.url().should("include", "/login");
    });

    it("should prevent access to protected pages after account deletion", () => {
      cy.register(
        faker.person.firstName(),
        faker.person.lastName(),
        faker.internet.email(),
        faker.internet.password(),
      );

      cy.visit("/profile");
      cy.get("[data-cy='delete-button']").click();
      cy.url().should("include", "/login");
      cy.visit("/sessions");
      cy.url().should("include", "/login");
    });
  });
});
