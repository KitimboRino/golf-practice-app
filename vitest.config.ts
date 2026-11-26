import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Unit tests for the app's pure logic (scoring, reads, verdicts, backups).
// Node environment: nothing here touches the DOM; the backup tests get an
// in-memory IndexedDB from fake-indexeddb.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
