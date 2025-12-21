import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
  proxy: {
    "/api": {
      target: "https://deadlink.onrender.com",
      changeOrigin: true,
    },
  },
}
})
