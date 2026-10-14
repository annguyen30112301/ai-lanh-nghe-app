// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";

// Trang marketing + vỏ app: prerender (tĩnh). API: src/pages/api/** (prerender = false) chạy trên Workers.
export default defineConfig({
  site: "https://ai-lanh-nghe-app.workers.dev",
  trailingSlash: "ignore",
  build: { format: "directory" },
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
  session: false,
  adapter: cloudflare({ imageService: "passthrough" }),
  integrations: [react()],
  vite: { plugins: [tailwindcss()] }
});
