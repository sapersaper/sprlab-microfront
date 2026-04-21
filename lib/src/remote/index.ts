/**
 * Remote-side exports for @sprlab/microfront.
 * Backward-compatible re-exports from the Vue module.
 * Imports directly from specific files to avoid pulling in vue-router via RemoteApp.vue.
 */
export { sprRemote } from '../vue/sprRemote'
export type { SprRemoteOptions } from '../vue/sprRemote'
export { sprRemoteLegacy } from '../vue/sprRemoteLegacy'
export { send, onMessage } from '../vue/messaging'
