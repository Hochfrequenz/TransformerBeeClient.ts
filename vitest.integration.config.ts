import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
    testTimeout: 60000,
    hookTimeout: 120000, // Allow 2 minutes for container startup/shutdown
  },
});
