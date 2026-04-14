/**
 * Remote-side exports for @sprlab/microfront.
 * Used by child applications that are embedded as iframes in the shell.
 *
 * Exports:
 * - sprRemote: Vue 3 plugin (use with app.use())
 * - sprRemoteLegacy: Vue 2 / Nuxt 2 compatible (use sprRemoteLegacy.init())
 * - send: Send a message to the shell
 * - onMessage: Register a handler for messages from the shell
 */
import { WindowMessenger, connect } from 'penpal'
import { initialize } from '@open-iframe-resizer/core'

// Re-export to prevent tree-shaking of the iframe-resizer side-effect.
// The child listener auto-registers on import.
export { initialize as _iframeResizerInit }

// ─── Shared types and state ───

export interface SprRemoteOptions {
  /** Identifier sent as metadata with messages to the shell */
  appName?: string
  /** Vue Router instance for automatic route synchronization with the shell */
  router?: any
  /** Allowed origins for postMessage security. Defaults to ['*'] */
  allowedOrigins?: string[]
}

type MessageHandler = (payload: unknown) => void

interface RemoteState {
  messageHandlers: MessageHandler[]
  connectionPromise: Promise<unknown> | null
  appName: string
}

let _state: RemoteState | null = null

function isInsideIframe(): boolean {
  return window.self !== window.parent
}

// ─── Shared core logic ───

function initCore(options: SprRemoteOptions): RemoteState | null {
  if (!isInsideIframe()) return null

  const { router, appName = 'unknown', allowedOrigins = ['*'] } = options

  const state: RemoteState = {
    messageHandlers: [],
    connectionPromise: null,
    appName,
  }
  _state = state

  const messenger = new WindowMessenger({
    remoteWindow: window.parent,
    allowedOrigins,
  })

  const methods: Record<string, (...args: unknown[]) => unknown> = {
    onShellMessage(payload: unknown) {
      state.messageHandlers.forEach((handler) => handler(payload))
    },
  }

  if (router) {
    methods.onShellNavigate = (path: unknown) => {
      // Compatible with both Vue Router v3 (currentRoute.fullPath)
      // and v4/v5 (currentRoute.value.fullPath)
      const currentPath = router.currentRoute?.value?.fullPath
        ?? router.currentRoute?.fullPath
      if (currentPath !== path) {
        router.replace(path as string)
      }
    }
  }

  // Patch pushState to prevent double history entries in iframe
  window.history.pushState = (data: any, unused: string, url?: string | URL | null) => {
    window.history.replaceState(data, unused, url)
  }

  const connection = connect({ messenger, methods })
  state.connectionPromise = connection.promise

  return state
}

// ─── Vue 3 plugin ───

const REMOTE_STATE_KEY = Symbol.for('spr-remote-state')

/**
 * Vue 3 plugin for remote micro frontend connection.
 * Usage: app.use(sprRemote, { appName: 'my-app', router })
 */
export const sprRemote = {
  install(app: any, options: SprRemoteOptions = {}) {
    const state = initCore(options)
    if (!state) return

    app.provide(REMOTE_STATE_KEY, state)

    // Use Vue 3 watch() for route synchronization
    const { router } = options
    if (router) {
      import('vue').then(({ watch }) => {
        watch(
          () => router.currentRoute.value.fullPath,
          async (newPath: string) => {
            const remote = await state.connectionPromise as Record<string, (p: string) => Promise<void>>
            await remote.onRemoteRouteChange(newPath)
          },
        )
      })
    }
  },
}

// ─── Vue 2 / Nuxt 2 compatible ───

/**
 * Legacy initializer for Vue 2 / Nuxt 2 remote apps.
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
    const state = initCore(options)
    if (!state) return

    // Use router.afterEach() for route sync (works with Vue Router v3 and v4)
    const { router } = options
    if (router && typeof router.afterEach === 'function') {
      router.afterEach((to: any) => {
        if (state.connectionPromise) {
          state.connectionPromise.then((remote: any) => {
            remote.onRemoteRouteChange(to.fullPath)
          })
        }
      })
    }
  },
}

// ─── Shared messaging API ───

/**
 * Send a message to the shell application.
 * Works with both Vue 3 and Vue 2 remotes.
 */
export async function send(payload: unknown) {
  if (!_state?.connectionPromise) {
    console.warn('[@sprlab/microfront] send called before connection was established')
    return
  }
  const remote = await _state.connectionPromise as Record<string, (p: unknown) => Promise<void>>
  await remote.onRemoteMessage({ payload, metadata: { appName: _state.appName } })
}

/**
 * Register a handler for messages received from the shell.
 * Can be called multiple times to register multiple handlers.
 */
export function onMessage(handler: MessageHandler) {
  if (_state) {
    _state.messageHandlers.push(handler)
  }
}
