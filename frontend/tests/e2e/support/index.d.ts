declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
    }
    interface Chainable {
      register(
        firstName: string,
        lastName: string,
        email: string,
        password: string,
      ): Chainable<void>;
    }
  }
}

export {};
