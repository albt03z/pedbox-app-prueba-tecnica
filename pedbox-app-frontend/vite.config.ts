import path from 'node:path'
import { fileURLToPath } from 'node:url'
// defineConfig de 'vitest/config' extiende el tipo de Vite con la clave
// `test`, así queda tipado tanto para `vite build` como para `vitest`.
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Config de Vitest — reutiliza el mismo resolve.alias de arriba.
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
