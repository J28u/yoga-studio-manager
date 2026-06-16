/// <reference types="cypress" />
// ***********************************************

Cypress.Commands.add("login", (email, password) => {
  cy.visit("/login");

  cy.get('[data-cy="email"]').type(email);

  cy.get('[data-cy="password"]').type(password);

  cy.get('[data-cy="login"]').click();

  cy.url().should("include", "/sessions");

  cy.get("[data-cy = 'sessions-title']")
    .should("be.visible")
    .should("contain", "Yoga Sessions");
});

Cypress.Commands.add("register", (firstName, lastName, email, password) => {
  cy.visit("/register");
  cy.get("[data-cy='firstName']").type(firstName);
  cy.get("[data-cy='lastName']").type(lastName);
  cy.get("[data-cy='email']").type(email);
  cy.get("[data-cy='password']").type(password);

  cy.get("[data-cy='register-button']").click();
  cy.url().should("include", "/sessions");
});
