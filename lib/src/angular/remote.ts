import { initRemote } from '../core/connection'
import { createAngularRouterAdapter } from './routerAdapter'
import type { RemoteConnection } from '../core/types'

interface AngularRouter {
  url: string
  navigateByUrl(url: string, extras?: { replaceUrl?: boolean }): Promise<boolean>
  events: {
    subscribe(callback: (event: any) => void): { unsubscribe(): void }
  }
}

export interface AngularRemoteOptions {
  /** Identifier sent as metadata with messages to the shell */
  appName?: string
  /** Angular Router instance for route synchronization */
  router?: AngularRouter
  /** Allowed origins for postMessage security. Defaults to ['*'] */
  allowedOrigins?: string[]
}

/**
 * Initialize an Angular remote micro frontend.
 * Returns a RemoteConnection with send/onMessage, or null if not in an iframe.
 *
 * Usage:
 *   import { initAngularRemote } from '@sprlab/microfront/angular/remote'
 *   const connection = initAngularRemote({ appName: 'my-app', router: this.router })
 */
export function initAngularRemote(options: AngularRemoteOptions = {}): RemoteConnection | null {
  const { router, ...rest } = options
  return initRemote({
    ...rest,
    router: router ? createAngularRouterAdapter(router) : undefined,
  })
}

export { createAngularRouterAdapter } from './routerAdapter'
export type { RemoteConnection } from '../core/types'
