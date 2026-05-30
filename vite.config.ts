import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { fontless } from "fontless";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

const config = defineConfig({
  plugins: [
    devtools(),
    // @ts-expect-error - TODO: rollupConfig is not a valid property for nitro
    nitro({ rollupConfig: { external: [/^@sentry\//u] } }),
    tailwindcss(),
    fontless({
      defaults: {
        preload: true,
        styles: ["normal"],
        weights: [400, 500, 600, 700],
      },
      families: [
        {
          name: "Geist",
          provider: "fontsource",
          weights: [400, 500, 600, 700],
        },
        {
          name: "Geist Mono",
          provider: "fontsource",
          weights: [400, 500, 600, 700],
        },
        {
          name: "Sora",
          provider: "fontsource",
          weights: [400, 500, 600, 700],
        },
      ],
      priority: ["fontsource"],
    }),
    tanstackStart(),
    viteReact(),
  ],
  resolve: { tsconfigPaths: true },
});

export default config;
