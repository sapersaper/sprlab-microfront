/**
 * Shell-side exports for @sprlab/microfront.
 * Used by the host application that embeds remote apps via iframes.
 */
export { default as RemoteApp } from './RemoteApp.vue'
export { useRemote, RemoteStatus } from './useRemote'
export type { RemoteMessenger, RemoteMessageEnvelope } from './useRemote'
