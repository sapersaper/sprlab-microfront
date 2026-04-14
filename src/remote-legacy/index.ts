/**
 * Remote-side exports for @sprlab/microfront (Vue 2 / Nuxt 2 compatible).
 * Used by child applications running Vue 2 that are embedded as iframes in the shell.
 *
 * Usage in Nuxt 2 (plugins/microfront.client.js):
 *
 *   import { sprRemoteLegacy, send, onMessage } from '@sprlab/microfront/remote-legacy'
 *
 *   export default ({ app }) => {
 *     sprRemoteLegacy.init({
 *       appName: 'my-nuxt2-app',
 *       router: app.router,
 *     })
 *   }
 *
 * No Vue.use() needed — call init() directly in a client-side plugin.
 */
import '@open-iframe-resizer/core'
import { WindowMessenger, connect } from 'penpal'

export interface SprRemoteLegacyOptions {
  /** Identifier sent as metadata with messages to the shell */
  appName?: string
  /**
   * Vue Router v3 instance (Nuxt 2 / Vue 2).
   * Expected to have: currentRoute.fullPath, replace(), and afterEach()
   */
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

export const sprRemoteLegacy = {
  /**
   * Initialize the remote-side micro frontend connection.
   * Call this from a Nuxt 2 client-side plugin or Vue 2 entry point.
   * Automatically detects if the app is inside an iframe — does nothing when standalone.
   */
  init(options: SprRemoteLegacyOptions = {}) {
    if (!isInsideIframe()) return

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

    // Vue Router v3 uses router.currentRoute (not .value) and router.replace()
    if (router) {
      methods.onShellNavigate = (path: unknown) => {
        const currentPath = router.currentRoute?.fullPath
          ?? router.currentRoute?.value?.fullPath
        if (currentPath !== path) {
          router.replace(path as string)
        }
      }
    }

    // Patch pushState to prevent double history entries
    window.history.pushState = (data: any, unused: string, url?: string | URL | null) => {
      window.history.replaceState(data, unused, url)
    }

    const connection = connect({ messenger, methods })
    state.connectionPromise = connection.promise

    // Watch route changes using router.afterEach (works in both Vue Router v3 and v4)
    if (router && typeof router.afterEach === 'function') {
      router.afterEach((to: any) => {
        const newPath = to.fullPath
        if (state.connectionPromise) {
          state.connectionPromise.then((remote: any) => {
            remote.onRemoteRouteChange(newPath)
          })
        }
      })
    }
  },
}

/**
 * Send a message to the shell application.
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
 */
export function onMessage(handler: MessageHandler) {
  if (_state) {
    _state.messageHandlers.push(handler)
  }
}
