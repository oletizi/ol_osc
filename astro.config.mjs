import {defineConfig} from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import path from "path";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve("src/ts"),
      }
    }
  }
})