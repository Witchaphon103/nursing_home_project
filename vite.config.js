import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@branch": path.resolve(__dirname, "src/branch"), // ✅ กำหนด alias สำหรับ `branch`
    },
  },
});
