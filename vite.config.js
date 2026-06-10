import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" permite desplegar tanto en GitHub Pages como en Firebase Hosting
export default defineConfig({
  plugins: [react()],
  base: "./",
});
