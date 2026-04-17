import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@sprlab/microfront/shell': fileURLToPath(new URL('../libs/spr-microfront/src/shell/index.ts', import.meta.url)),
      '@sprlab/microfront/remote': fileURLToPath(new URL('../libs/spr-microfront/src/remote/index.ts', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['@sprlab/microfront'],
  },
  server: {
    port: 4000,
  },
})
