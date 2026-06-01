import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Node puro — o motor não toca em DOM, rede ou I/O.
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
