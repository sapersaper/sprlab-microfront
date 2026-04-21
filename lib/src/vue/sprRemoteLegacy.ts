import { initRemote } from '../core/connection'
import { createVueRouterAdapter } from './routerAdapter'
import { _setRemoteConnection } from './messaging'
import type { SprRemoteOptions } from './sprRemote'

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
export const sprRemoteLegacy = {
  init(options: SprRemoteOptions = {}) {
    const { router, ...rest } = options

    const coreRouter = router ? createVueRouterAdapter(router) : undefined

    const connection = initRemote({
      ...rest,
      router: coreRouter,
    })

    _setRemoteConnection(connection)
  },
}
