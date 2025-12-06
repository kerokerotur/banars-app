import { defineConfig } from "vitest/config"
import path from "node:path"

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
    alias: {
      "@core": path.resolve(__dirname, "./core"),
      "@adapters": path.resolve(__dirname, "./adapters"),
    },
  },
})
