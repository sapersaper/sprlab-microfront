import { initRemote } from '../core/connection'
import { createReactRouterAdapter } from './routerAdapter'
import type { RemoteConnection } from '../core/types'

interface ReactRouter {
  state: { location: { pathname: string } }
  navigate(path: string, opts?: { replace?: boolean }): void
  subscribe(callback: (state: { location: { pathname: string } }) => void): void
}

export interface ReactRemoteOptions {
  /** Identifier sent as metadata with messages to the shell */
  appName?: string
  /** React Router instance (createBrowserRouter) for route synchronization */
  router?: ReactRouter
  /** Allowed origins for postMessage security. Defaults to ['*'] */
  allowedOrigins?: string[]
}

/**
 * Initialize a React remote micro frontend.
 * Returns a RemoteConnection with send/onMessage, or null if not in an iframe.
 *
 * Usage:
 *   import { initReactRemote } from '@sprlab/microfront/react/remote'
 *   const connection = initReactRemote({ appName: 'my-app', router })
 */
export function initReactRemote(options: ReactRemoteOptions = {}): RemoteConnection | null {
  const { router, ...rest } = options
  return initRemote({
    ...rest,
    router: router ? createReactRouterAdapter(router) : undefined,
  })
}

export { createReactRouterAdapter } from './routerAdapter'
export type { RemoteConnection } from '../core/types'
