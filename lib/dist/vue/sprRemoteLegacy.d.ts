import type { SprRemoteOptions } from './sprRemote';
/**
 * Legacy initializer for Vue 2 / Nuxt 2 remote apps.
 * Delegates all core logic to core.initRemote().
 *
 * Usage in Nuxt 2 (plugins/microfront.client.js):
 *   import { sprRemoteLegacy } from '@sprlab/microfront/remote'
 *
 *   export default ({ app }) => {
 *     sprRemoteLegacy.init({ appName: 'my-nuxt2-app', router: app.router })
 *   }
 */
export declare const sprRemoteLegacy: {
    init(options?: SprRemoteOptions): void;
};
