import { defineConfig } from "vite";
import { Plugin } from "postcss";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss("./config/tailwind.config.js") as Plugin,
        autoprefixer(),
      ],
    },
  },
});
