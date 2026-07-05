import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node", // lib tests are pure functions; no DOM needed
    include: ["src/**/*.test.ts"],
  },
});
