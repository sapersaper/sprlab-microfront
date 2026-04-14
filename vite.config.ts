import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// Build each entry separately so each bundle is fully self-contained.
// This avoids shared chunks that Webpack 4 (Nuxt 2) cannot resolve
// from node_modules.
const entry = process.env.LIB_ENTRY

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: entry
        ? { [entry]: resolve(__dirname, `src/${entry}/index.ts`) }
        : {
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
    // Only clean on first build
    emptyOutDir: !entry,
  },
})
