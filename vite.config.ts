import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: {
        shell: resolve(__dirname, 'src/shell/index.ts'),
        remote: resolve(__dirname, 'src/remote/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue', 'vue-router'],
      output: {
        entryFileNames: '[name].js',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
})
