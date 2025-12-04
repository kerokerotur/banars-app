import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "core/**/*.test.ts",
      "core/**/*.spec.ts",
      "adapters/**/*.test.ts",
      "adapters/**/*.spec.ts",
    ],
    globals: true,
    watch: false,
    passWithNoTests: true,
  },
  resolve: {
    conditions: ["node"],
  },
})
