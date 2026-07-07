import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    globals: true,
    environment: "node", // per-file override via `// @vitest-environment jsdom`
    include: ["lib/**/*.test.ts", "test/**/*.test.ts"],
  },
  resolve: {
    // Mirror tsconfig `@/* -> ./*` so tests can use the same import alias.
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
});
