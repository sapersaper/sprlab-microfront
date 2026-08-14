/**
 * Vue 2 / Nuxt 2 shell-side messenger.
 *
 * `status` and `iframeLoaded` are exposed as plain data properties, not getters.
 * That matters: Vue 2 can only make a property reactive when it can install its own
 * setter on it. A getter backed by a closure is invisible to Vue 2's reactivity, so
 * templates reading it would never update.
 *
 * Usage in a Nuxt 2 page/layout — the messenger must live in `data()` to be reactive:
 *
 *   import { createRemoteMessenger } from '@sprlab/microfront/nuxt2/shell'
 *
 *   export default {
 *     provide() {
 *       return { 'remote-messenger': this.remoteMessenger }
 *     },
 *     data() {
 *       return { remoteMessenger: createRemoteMessenger() }
 *     },
 *     computed: {
 *       isConnected() { return this.remoteMessenger.status === 'connected' }
 *     }
 *   }
 */
import { createMessenger } from '../core/messenger'
import type {
  ConnectionStatus,
  MessageEnvelope,
  MessageHandler,
  StatusChangeHandler,
  Messenger,
} from '../core/types'

export type RouteChangeHandler = (path: string) => void

/** Envelope structure for messages sent from remote to shell */
export interface RemoteMessageEnvelope {
  payload: unknown
  metadata: { appName: string }
}

/** Messenger interface exposed to Vue 2 components */
export interface RemoteMessenger {
  /**
   * Current connection status: 'loading' | 'connected' | 'error' | 'no-plugin'.
   * A plain property so Vue 2 can track it — put the messenger in `data()`.
   */
  status: string
  /** Whether the iframe has loaded (server is reachable). Plain property. */
  iframeLoaded: boolean
  /** Marks the iframe as loaded */
  setIframeLoaded: () => void
  /** Sets the penpal connection promise; drives `status` */
  setConnection: (promise: Promise<unknown>) => void
  /** Sends a message to the remote */
  send: (payload: unknown) => Promise<void>
  /** Handles an incoming message from the remote */
  handleRemoteMessage: (envelope: RemoteMessageEnvelope) => void
  /** Handles a route change notification from the remote */
  handleRouteChange: (path: string) => void
  /** Registers a message handler */
  onMessage: (handler: MessageHandler) => void
  /** Registers a route change handler */
  onRouteChange: (handler: RouteChangeHandler) => void
  /** Registers a connection status handler */
  onStatusChange: (handler: StatusChangeHandler) => void
}

/**
 * Creates a messenger instance for use with Vue 2's provide/inject.
 * Place the result in `data()` of the providing component to get reactivity.
 */
export function createRemoteMessenger(): RemoteMessenger {
  const core: Messenger = createMessenger()

  const messenger: RemoteMessenger = {
    status: core.status,
    iframeLoaded: core.iframeLoaded,

    setIframeLoaded() {
      core.setIframeLoaded()
      messenger.iframeLoaded = true
    },

    setConnection(promise: Promise<unknown>) {
      core.setConnection(promise)
    },

    async send(payload: unknown) {
      await core.send(payload)
    },

    handleRemoteMessage(envelope: RemoteMessageEnvelope) {
      core.handleRemoteMessage(envelope as MessageEnvelope)
    },

    handleRouteChange(path: string) {
      core.handleRouteChange(path)
    },

    onMessage(handler: MessageHandler) {
      core.onMessage(handler)
    },

    onRouteChange(handler: RouteChangeHandler) {
      core.onRouteChange(handler)
    },

    onStatusChange(handler: StatusChangeHandler) {
      core.onStatusChange(handler)
    },
  }

  // Mirror the core's status onto a plain property. When the host placed this object
  // in data(), Vue 2 has installed a reactive setter and the assignment propagates.
  core.onStatusChange((status: ConnectionStatus) => {
    messenger.status = status
  })

  return messenger
}
