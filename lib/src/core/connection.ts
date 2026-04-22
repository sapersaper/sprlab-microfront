import { WindowMessenger, connect } from 'penpal'
import { isInsideIframe } from './iframe'
import { patchHistoryPushState } from './history'
import { observeContentHeight } from './height'
import type {
  ShellConnectionOptions,
  RemoteInitOptions,
  PenpalHandle,
  RemoteConnection,
} from './types'

/**
 * Establishes a shell-side penpal connection to an iframe.
 * Returns { promise, destroy } — same shape as penpal's connect().
 */
export function connectToRemote(options: ShellConnectionOptions): PenpalHandle {
  const { iframe, allowedOrigins, timeout, methods } = options

  const messenger = new WindowMessenger({
    remoteWindow: iframe.contentWindow!,
    allowedOrigins,
  })

  return connect({ messenger, timeout, methods })
}

/**
 * Initializes the remote side: penpal connection, height observer,
 * history patch, and optional route sync via RouterAdapter.
 * Returns a RemoteConnection with send/onMessage and the connection promise.
 * Returns null if not inside an iframe.
 */
export function initRemote(options: RemoteInitOptions): RemoteConnection | null {
  if (!isInsideIframe()) return null

  const {
    appName = 'unknown',
    allowedOrigins = ['*'],
    router,
    methods: extraMethods = {},
  } = options

  const messageHandlers: ((payload: unknown) => void)[] = []

  const penpalMethods: Record<string, (...args: unknown[]) => unknown> = {
    ...extraMethods,
    onShellMessage(payload: unknown) {
      messageHandlers.forEach((handler) => handler(payload))
    },
    /** Shell sends its container height; remote returns the effective height */
    onShellContainerHeight(containerHeight: unknown) {
      const ch = Number(containerHeight)
      return new Promise((resolve) => {
        // Wait two frames so the iframe's new size has propagated to layout
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const scrollH = document.documentElement.scrollHeight
            resolve(scrollH > ch ? scrollH : ch)
          })
        })
      })
    },
  }

  if (router) {
    penpalMethods.onShellNavigate = (path: unknown) => {
      const currentPath = router.getCurrentPath()
      if (currentPath !== path) {
        router.replace(path as string)
      }
    }
  }

  // Patch pushState to prevent double history entries in iframe
  patchHistoryPushState()

  const messenger = new WindowMessenger({
    remoteWindow: window.parent,
    allowedOrigins,
  })

  const penpalConnection = connect({ messenger, methods: penpalMethods })
  const connectionPromise = penpalConnection.promise

  // Observe content height changes and send to shell via penpal
  connectionPromise.then((remote: any) => {
    observeContentHeight((height) => {
      remote.onRemoteHeight(height)
    })
  }).catch(() => {})

  // Once penpal connects, send the current route to the shell (works for both SPA and MPA)
  connectionPromise.then((remote: any) => {
    const currentPath = router ? router.getCurrentPath() : window.location.pathname
    if (currentPath) {
      remote.onRemoteRouteChange(currentPath)
    }
  }).catch(() => {})

  // Register afterEach to sync SPA route changes to shell
  if (router) {
    router.afterEach((path: string) => {
      connectionPromise.then((remote: any) => {
        remote.onRemoteRouteChange(path)
      }).catch(() => {})
    })
  }

  return {
    connectionPromise,
    async send(payload: unknown) {
      if (!connectionPromise) {
        console.warn('[@sprlab/microfront] send called before connection was established')
        return
      }
      const remote = await connectionPromise as Record<string, (p: unknown) => Promise<void>>
      await remote.onRemoteMessage({ payload, metadata: { appName } })
    },
    onMessage(handler: (payload: unknown) => void) {
      messageHandlers.push(handler)
    },
  }
}
