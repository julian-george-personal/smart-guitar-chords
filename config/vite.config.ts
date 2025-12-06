import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite";
import { Plugin } from "postcss";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: "julian-george-f0",
      project: "bun",
    }),
  ],
  root: "src/app",
  build: {
    outDir: "../../dist",
    sourcemap: true,
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss("./config/tailwind.config.js") as Plugin,
        autoprefixer(),
      ],
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000/api",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
