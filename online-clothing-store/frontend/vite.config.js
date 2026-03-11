import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/fashionStore/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',   // allow external access
    port: 3000,
    strictPort: true,
    allowedHosts: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  }
})