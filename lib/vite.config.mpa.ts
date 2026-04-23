import { defineConfig } from 'vite'
import { resolve } from 'path'

/**
 * Separate build config for the MPA standalone bundle.
 * Bundles penpal inside (no external dependencies).
 */
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/mpa/remote.ts'),
      formats: ['es'],
      fileName: () => 'mpa-remote.js',
    },
    rollupOptions: {
      // Don't externalize anything — bundle penpal inside
      external: ['vue', 'vue-router'],
      output: {
        entryFileNames: 'mpa-remote.js',
      },
    },
    outDir: 'dist',
    emptyOutDir: false, // Don't clear dist — append to existing build
  },
})
