import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
  proxy: {
    "/api": {
      target: "http://server:3000",
      changeOrigin: true,
    },
  },
}
})