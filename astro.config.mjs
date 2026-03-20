import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://dispensaries.meredithmcgee.org",
  trailingSlash: "always",
  integrations: [
    sitemap({
      serialize(item) {
        if (item.url === "https://dispensaries.meredithmcgee.org/") {
          item.priority = 1.0;
          item.changefreq = "monthly";
        } else if (item.url.includes("/dispensary/")) {
          item.priority = 0.8;
          item.changefreq = "monthly";
        } else {
          item.priority = 0.3;
          item.changefreq = "yearly";
        }
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
