import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: {
        core: resolve(__dirname, 'src/core/index.ts'),
        vue: resolve(__dirname, 'src/vue/index.ts'),
        shell: resolve(__dirname, 'src/shell/index.ts'),
        remote: resolve(__dirname, 'src/remote/index.ts'),
        'react-remote': resolve(__dirname, 'src/react/remote.ts'),
        'angular-remote': resolve(__dirname, 'src/angular/remote.ts'),
        'nuxt2-shell': resolve(__dirname, 'src/nuxt2-shell/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      // penpal is deliberately NOT external: it is bundled in.
      // It ships as an exports-only package with no `main` field, which webpack 4
      // (Nuxt 2) cannot resolve. Bundling keeps it an implementation detail instead
      // of forcing every consumer to install penpal and alias it.
      external: ['vue', 'vue-router'],
      output: {
        entryFileNames: '[name].js',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
})
