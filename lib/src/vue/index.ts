// Shell-side exports
export { default as RemoteApp } from './RemoteApp.vue'
export { useRemote, RemoteStatus } from './useRemote'
export type { RemoteMessenger, RemoteMessageEnvelope } from './useRemote'

// Remote-side exports
export { sprRemote } from './sprRemote'
export type { SprRemoteOptions } from './sprRemote'
export { sprRemoteLegacy } from './sprRemoteLegacy'
export { send, onMessage } from './messaging'

// Vue RouterAdapter factory
export { createVueRouterAdapter } from './routerAdapter'
