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
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'vue', 'vue-router',
        'penpal',
      ],
      output: {
        entryFileNames: '[name].js',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
})
