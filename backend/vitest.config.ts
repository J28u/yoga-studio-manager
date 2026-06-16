import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      DATABASE_URL:
        "postgresql://yogauser:yogapass@localhost:5433/yogastudio_test",
      NODE_ENV: "development",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json"],
      reportsDirectory: "./coverage",
      exclude: [
        "node_modules/",
        "dist/",
        "**/*.dto.ts",
        "**/*.schema.ts",
        "**/*.zod.ts",
      ],
    },
  },
});
