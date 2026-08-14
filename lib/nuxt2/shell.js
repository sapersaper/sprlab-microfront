/**
 * Nuxt 2 / Vue 2 shell entry point.
 *
 * RemoteApp is exported as an uncompiled SFC on purpose: the host Nuxt 2 app
 * compiles it with its own vue-loader (Vue 2). Make sure the app transpiles this
 * package, e.g. in nuxt.config: `build.transpile: ['@sprlab/microfront']`.
 *
 * Everything framework-agnostic comes from the pre-built ESM bundle.
 */
export { default as RemoteApp } from '../src/nuxt2-shell/RemoteApp.vue'
export { createRemoteMessenger, ConnectionStatus } from '../dist/nuxt2-shell.js'
