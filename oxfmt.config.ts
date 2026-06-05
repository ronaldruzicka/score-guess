import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,
  sortImports: {
    groups: [
      "type-import",
      "type-internal",
      ["type-parent", "type-sibling", "type-index"],
      ["value-builtin", "value-external"],
      "value-internal",
      ["value-parent", "value-sibling", "value-index"],
      "unknown",
    ],
  },
  sortTailwindcss: {
    functions: ["clsx", "cn"],
    stylesheet: "./src/styles.css",
  },
  trailingComma: "all",
});
