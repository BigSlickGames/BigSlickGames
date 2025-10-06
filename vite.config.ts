import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Change to whatever port you want
    strictPort: true, // Optional: fail if port is already in use
  },
});
