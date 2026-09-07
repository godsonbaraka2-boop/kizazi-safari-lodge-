// Build config used ONLY for deploying to Vercel (bun x vite build --config vite.config.vercel.ts).
// The default vite.config.ts targets Cloudflare and stays untouched for Lovable preview/publish.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    preset: "vercel",
  },
});
