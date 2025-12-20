import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
  proxy: {
    "/api": {
      target: "http://deadlink-production.up.railway.app",
      changeOrigin: true,
    },
  },
}
})
