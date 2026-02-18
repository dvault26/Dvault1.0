import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Vite config for renderer (src/renderer)
export default defineConfig({
  root: path.resolve(__dirname, 'src', 'renderer'),
  base: './',
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, 'dist', 'renderer'),
    emptyOutDir: true,
    sourcemap: true
  },
  server: {
    port: 5173
  }
})
