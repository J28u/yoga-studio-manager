import { faker } from "@faker-js/faker";

describe("Authentication", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  describe("Login", () => {
    it("should display the login form", () => {
      cy.visit("/login");
      cy.contains("Login to Yoga Studio").should("be.visible");
      cy.get("[data-cy='email']").should("be.visible");
      cy.get("[data-cy='password']").should("be.visible");
      cy.get("[data-cy='login']").should("contain", "Login");
    });

    it("should allow a user to log in with valid credentials", () => {
      cy.visit("/login");
      cy.fixture("user").then((user) => {
        cy.login(user.email, user.password);
      });

      cy.window()
        .its("localStorage")
        .invoke("getItem", "token")
        .should("not.be.null");

      cy.window()
        .its("localStorage")
        .invoke("getItem", "user")
        .should("not.be.null");
    });

    it("should show an error message when credentials are invalid", () => {
      cy.visit("/login");
      cy.get("[data-cy='email']").type("wrong@test.com");
      cy.get("[data-cy='password']").type("wrongpassword");
      cy.get("[data-cy='login']").click();
      cy.contains("Invalid credentials").should("be.visible");
    });

    it("should redirect the user to the registration page", () => {
      cy.visit("/login");
      cy.contains("Register here").click();
      cy.url().should("include", "/register");
    });
  });

  describe("Registration", () => {
    it("should display the registration form", () => {
      cy.visit("/register");
      cy.contains("Register for Yoga Studio").should("be.visible");
      cy.get("[data-cy='firstName']").should("be.visible");
      cy.get("[data-cy='lastName']").should("be.visible");
      cy.get("[data-cy='email']").should("be.visible");
      cy.get("[data-cy='password']").should("be.visible");
    });

    it("should allow a new user to create an account", () => {
      cy.visit("/register");
      cy.get("[data-cy='firstName']").type(faker.person.firstName());
      cy.get("[data-cy='lastName']").type(faker.person.lastName());
      cy.get("[data-cy='email']").type(faker.internet.email());
      cy.get("[data-cy='password']").type(faker.internet.password());

      cy.get("[data-cy='register-button']").click();
      cy.url().should("include", "/sessions");
      cy.get("[data-cy = 'sessions-title']")
        .should("be.visible")
        .should("contain", "Yoga Sessions");
    });

    it("should redirect the user to the login page", () => {
      cy.visit("/register");
      cy.get("[data-cy='login-link']").click();
      cy.url().should("include", "/login");
    });
  });

  describe("Authentication flow", () => {
    it("should redirect unauthenticated users to the login page", () => {
      cy.visit("/sessions");
      cy.url().should("include", "/login");
    });

    it("should allow an authenticated user to log out", () => {
      cy.visit("/login");
      cy.fixture("user").then((user) => {
        cy.login(user.email, user.password);
      });

      cy.get("[data-cy = 'logout-button']").click();
      cy.url().should("include", "/login");
      cy.window()
        .its("localStorage")
        .invoke("getItem", "token")
        .should("not.exist");

      cy.window()
        .its("localStorage")
        .invoke("getItem", "user")
        .should("not.exist");
    });
  });
});
