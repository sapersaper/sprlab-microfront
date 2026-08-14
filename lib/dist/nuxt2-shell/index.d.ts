/**
 * Nuxt 2 / Vue 2 shell-side internals for @sprlab/microfront.
 *
 * NOTE: `RemoteApp` is intentionally NOT exported here. It is a Vue 2 SFC and
 * must be compiled by the host app's own vue-loader (Vue 2), not by this
 * package's Vue 3 build pipeline. Consumers import it from the `nuxt2/shell`
 * entry point instead:
 *
 *   import { RemoteApp, createRemoteMessenger } from '@sprlab/microfront/nuxt2/shell'
 *
 * This module only carries the framework-agnostic pieces that are safe to
 * pre-bundle.
 */
export { createRemoteMessenger } from './messenger';
export type { RemoteMessenger, RemoteMessageEnvelope, RouteChangeHandler } from './messenger';
export { ConnectionStatus } from '../core/types';
