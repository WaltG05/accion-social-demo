import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// '@directus/sdk' se reemplaza por un simulador local: la demo no se conecta a ningún servidor.
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@directus/sdk': fileURLToPath(new URL('./src/mock/sdk.ts', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
