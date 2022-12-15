/* eslint-disable unicorn/prefer-module */
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="vitest" />
import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

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
