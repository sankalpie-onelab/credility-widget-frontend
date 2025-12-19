import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    "process.env.NODE_ENV": '"production"'
  },
  build: {
    lib: {
      entry: "src/widget-entry.jsx",
      name: "DocumentValidator",
      fileName: () => "doc-validator-widget.js",
      formats: ["iife"]
    }
  }
});
