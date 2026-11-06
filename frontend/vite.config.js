import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  // Production assets will be served by Django/whitenoise
  base: "/static/",

  server: {
    host: "0.0.0.0",
    port: 5173,
    watch: {
      usePolling: true,
    }
  },

  build: {
    outDir: "../backend/frontend_build",
    emptyOutDir: true,
    assetsDir: "assets",
  }
})
