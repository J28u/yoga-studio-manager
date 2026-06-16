import { defineConfig } from "cypress";

export default defineConfig({
  allowCypressEnv: false,

  e2e: {
    specPattern: "tests/e2e/**/*.cy.ts",
    supportFile: "tests/e2e/support/e2e.ts",
    fixturesFolder: "tests/e2e/fixtures",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: "http://localhost:3000",
  },
});
