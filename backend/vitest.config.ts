import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      DATABASE_URL:
        "postgresql://yogauser:yogapass@localhost:5433/yogastudio_test",
      NODE_ENV: "development",
    },
  },
});
