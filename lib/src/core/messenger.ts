import type { ConnectionStatus, MessageEnvelope, MessageHandler, RouteChangeHandler, Messenger } from './types'

/**
 * Creates a standalone messaging controller (used by Vue's useRemote).
 * Framework-agnostic — uses plain values instead of Vue refs.
 */
export function createMessenger(): Messenger {
  let remotePromise: Promise<unknown> | null = null
  let status: ConnectionStatus = 'loading' as ConnectionStatus
  let iframeLoaded = false
  const messageHandlers: MessageHandler[] = []
  const routeChangeHandlers: RouteChangeHandler[] = []

  const messenger: Messenger = {
    get status() { return status },
    set status(value: ConnectionStatus) { status = value },

    get iframeLoaded() { return iframeLoaded },
    set iframeLoaded(value: boolean) { iframeLoaded = value },

    setIframeLoaded() {
      iframeLoaded = true
    },

    setConnection(promise: Promise<unknown>) {
      remotePromise = promise
      promise
        .then(() => { status = 'connected' as ConnectionStatus })
        .catch(() => {
          status = iframeLoaded
            ? 'no-plugin' as ConnectionStatus
            : 'error' as ConnectionStatus
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
  }

  return messenger
}
