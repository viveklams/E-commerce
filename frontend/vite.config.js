import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
      },
    },
    port: 3000, // Change this to your desired port
  },
  define: {
    "process.env.APP_TITLE": JSON.stringify("Your Custom Title"), // Set your custom title here
  },
});
