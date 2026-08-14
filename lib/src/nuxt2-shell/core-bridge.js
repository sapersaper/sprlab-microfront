/**
 * Bridge module that re-exports core functions from the pre-compiled dist.
 * This allows the source .vue file (compiled by Nuxt 2's vue-loader) to
 * import from pre-built JS without needing TypeScript compilation.
 */
export { connectToRemote, createMessenger } from '../../dist/core.js'
