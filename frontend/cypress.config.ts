import { defineConfig } from "cypress";

export default defineConfig({
  allowCypressEnv: false,

  e2e: {
    specPattern: "test/e2e/**/*.cy.ts",
    supportFile: "test/e2e/support/e2e.ts",
    fixturesFolder: "test/e2e/fixtures",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: "http://localhost:3000",
  },
});
