/**
 * Remote-side exports for @sprlab/microfront.
 * Used by child applications that are embedded as iframes in the shell.
 */
import '@open-iframe-resizer/core'
import { WindowMessenger, connect } from 'penpal'
import { watch } from 'vue'
import type { App, Plugin } from 'vue'
import type { Router } from 'vue-router'

export interface SprRemoteOptions {
  /** Identifier sent as metadata with messages to the shell */
  appName?: string
  /** Vue Router instance for automatic route synchronization with the shell */
  router?: Router
  /** Allowed origins for postMessage security. Defaults to ['*'] */
  allowedOrigins?: string[]
}

type MessageHandler = (payload: unknown) => void

interface RemoteState {
  messageHandlers: MessageHandler[]
  connectionPromise: Promise<unknown> | null
  appName: string
}

const REMOTE_STATE_KEY = Symbol.for('spr-remote-state')

/** Module-level reference to the remote state for use by send() and onMessage() */
let _state: RemoteState | null = null

/** Detect if the current window is running inside an iframe */
function isInsideIframe(): boolean {
  return window.self !== window.parent
}

/**
 * Vue plugin that initializes the remote-side micro frontend connection.
 * Automatically detects if the app is inside an iframe — does nothing when running standalone.
 *
 * Handles:
 * - Penpal connection to the shell for bidirectional messaging
 * - Route synchronization with the shell (when router is provided)
 * - Iframe resizer child listener (via open-iframe-resizer)
 */
export const sprRemote: Plugin<SprRemoteOptions> = {
  install(app: App, options: SprRemoteOptions = {}) {
    if (!isInsideIframe()) return

    const { router, appName = 'unknown', allowedOrigins = ['*'] } = options

    const state: RemoteState = {
      messageHandlers: [],
      connectionPromise: null,
      appName,
    }

    _state = state
    app.provide(REMOTE_STATE_KEY, state)

    const messenger = new WindowMessenger({
      remoteWindow: window.parent,
      allowedOrigins,
    })

    const methods: Record<string, (...args: unknown[]) => unknown> = {
      /** Handler called when the shell sends a message to this remote */
      onShellMessage(payload: unknown) {
        state.messageHandlers.forEach((handler) => handler(payload))
      },
    }

    // Register route navigation handler if router is provided
    if (router) {
      methods.onShellNavigate = (path: unknown) => {
        const currentPath = router.currentRoute.value.fullPath
        if (currentPath !== path) {
          router.replace(path as string)
        }
      }
    }

    const connection = connect({ messenger, methods })
    state.connectionPromise = connection.promise

    // Watch for route changes and notify the shell
    if (router) {
      watch(
        () => router.currentRoute.value.fullPath,
        async (newPath) => {
          const remote = await state.connectionPromise as Record<string, (p: string) => Promise<void>>
          await remote.onRemoteRouteChange(newPath)
        },
      )
    }
  },
}

/**
 * Send a message to the shell application.
 * Automatically includes the appName as metadata.
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
