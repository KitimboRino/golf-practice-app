import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // RangeCard renders on the client from IndexedDB and browser APIs
      // (theme, standalone mode, geolocation, reduced motion). Reading those
      // in a mount effect and setting state is how it avoids a hydration
      // mismatch, so this rule would flag the pattern the app is built on.
      "react-hooks/set-state-in-effect": "off",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
  {
    // CommonJS config files
    files: ["*.config.js", "next.config.js"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "public/**", "coverage/**"]),
]);
