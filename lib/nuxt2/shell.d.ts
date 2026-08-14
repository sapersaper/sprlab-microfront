import type { Component } from 'vue'

export { createRemoteMessenger, ConnectionStatus } from '../dist/nuxt2-shell/index'
export type {
  RemoteMessenger,
  RemoteMessageEnvelope,
  RouteChangeHandler,
} from '../dist/nuxt2-shell/index'

/**
 * Vue 2 / Nuxt 2 shell component that renders a remote micro frontend in an
 * iframe with penpal connection, automatic height and bidirectional route sync.
 *
 * Props:
 * - `src` (required) — remote base URL
 * - `title` (required) — iframe title, for accessibility
 * - `basePath` — shell path the remote is mounted under; enables route sync
 * - `timeout` — connection timeout in ms (default 10000)
 * - `allowedOrigins` — postMessage allowed origins (default ['*'])
 * - `fullHeight` — iframe fills at least the container height
 */
export declare const RemoteApp: Component
