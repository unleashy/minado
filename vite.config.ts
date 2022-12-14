/// <reference types="vitest" />
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        instructions: resolve(__dirname, "instructions.html")
      }
    }
  },

  test: {
    include: ["tests/**/*.test.ts"]
  }
});
