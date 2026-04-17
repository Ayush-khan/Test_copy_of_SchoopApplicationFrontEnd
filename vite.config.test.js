// vite.config.test.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  build: {
    // target: "es2016",
    target: "es2015",
    // minify: "main",
    minify: "terser",
  },
});
