import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://dispensaries.meredithmcgee.org",
  trailingSlash: "always",
  vite: {
    plugins: [tailwindcss()],
  },
});
