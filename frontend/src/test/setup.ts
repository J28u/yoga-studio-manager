import { beforeAll, afterEach, afterAll } from "vitest";
import { server } from "./mock/server";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => server.close());
