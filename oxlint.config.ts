import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import react from "ultracite/oxlint/react";
import tanstack from "ultracite/oxlint/tanstack";

export default defineConfig({
  extends: [core, react, tanstack],
  ignorePatterns: core.ignorePatterns,
  rules: {
    "func-style": [
      "error",
      "declaration",
      {
        allowArrowFunctions: true,
      },
    ],
    "no-shadow": "off",
    "no-use-before-define": ["error", { functions: false }],
    "no-warning-comments": "warn",

    // TYPESCRIPT
    "typescript/consistent-type-definitions": ["error", "type"],
  },
});
