import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  base:"/",
  server: {
  proxy: {
    "/api": {
      target: "https://deadlink.onrender.com",
      changeOrigin: true,
    },
  },
}
})
