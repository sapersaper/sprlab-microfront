import { ConnectionStatus } from './types'
import type {
  MessageEnvelope,
  MessageHandler,
  RouteChangeHandler,
  StatusChangeHandler,
  Messenger,
} from './types'

/**
 * Creates a standalone messaging controller used by the framework wrappers.
 * Framework-agnostic — plain values instead of Vue refs.
 *
 * `status` lives in a closure, so subscribe with `onStatusChange` to observe it.
 * That is the single place where the status rule is defined; wrappers mirror it
 * into their own reactivity system rather than re-deriving it.
 */
export function createMessenger(): Messenger {
  let remotePromise: Promise<unknown> | null = null
  let status: ConnectionStatus = ConnectionStatus.Loading
  let iframeLoaded = false
  const messageHandlers: MessageHandler[] = []
  const routeChangeHandlers: RouteChangeHandler[] = []
  const statusChangeHandlers: StatusChangeHandler[] = []

  const setStatus = (next: ConnectionStatus) => {
    if (next === status) return
    status = next
    statusChangeHandlers.forEach((handler) => handler(next))
  }

  const messenger: Messenger = {
    get status() { return status },
    set status(value: ConnectionStatus) { setStatus(value) },

    get iframeLoaded() { return iframeLoaded },
    set iframeLoaded(value: boolean) { iframeLoaded = value },

    setIframeLoaded() {
      iframeLoaded = true
    },

    setConnection(promise: Promise<unknown>) {
      remotePromise = promise
      promise
        .then(() => setStatus(ConnectionStatus.Connected))
        .catch(() => {
          // A loaded iframe that never answered means the remote is missing the plugin;
          // an iframe that never loaded means the server is unreachable.
          setStatus(iframeLoaded ? ConnectionStatus.NoPlugin : ConnectionStatus.Error)
        })
    },

    async send(payload: unknown) {
      if (!remotePromise) {
        console.warn('[@sprlab/microfront] sendMessage called before connection was established')
        return
      }
      const remote = await remotePromise as Record<string, (p: unknown) => Promise<void>>
      await remote.onShellMessage(payload)
    },

    handleRemoteMessage(envelope: MessageEnvelope) {
      messageHandlers.forEach((handler) => handler(envelope.payload, envelope.metadata))
    },

    handleRouteChange(path: string) {
      routeChangeHandlers.forEach((handler) => handler(path))
    },

    onMessage(handler: MessageHandler) {
      messageHandlers.push(handler)
    },

    onRouteChange(handler: RouteChangeHandler) {
      routeChangeHandlers.push(handler)
    },

    onStatusChange(handler: StatusChangeHandler) {
      statusChangeHandlers.push(handler)
    },
  }

  return messenger
}
